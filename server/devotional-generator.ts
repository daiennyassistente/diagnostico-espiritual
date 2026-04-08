import { PDFDocument, rgb } from "pdf-lib";
import { invokeLLM } from "./_core/llm";

interface DevotionalRequest {
  profileName: string;
  profileDescription: string;
  challenges: string[];
  recommendations: string[];
  userName?: string;
}

interface GeneratedDay {
  day: number;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  application: string;
}

const COLORS = {
  background: rgb(1, 1, 1),
  dark: rgb(0.24, 0.20, 0.15),
  medium: rgb(0.29, 0.25, 0.21),
  accent: rgb(0.58, 0.47, 0.36),
  white: rgb(1, 1, 1),
  mutedBorder: rgb(0.93, 0.91, 0.89),
  lightBg: rgb(0.98, 0.97, 0.95),
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export function normalizePdfText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingEmoji(text: string): string {
  return normalizePdfText(text.replace(/^[\uD800-\uDBFF][\uDC00-\uDFFF]\s*/, ""));
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const normalized = normalizePdfText(text);
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color: ReturnType<typeof rgb>,
  maxCharsPerLine: number,
  lineHeight: number
): number {
  const lines = wrapText(text, maxCharsPerLine);
  let currentY = y;

  for (const line of lines) {
    page.drawText(line, {
      x,
      y: currentY,
      size,
      font,
      color,
    });
    currentY -= lineHeight;
  }

  return currentY;
}

async function generateDevotionalContent(request: DevotionalRequest): Promise<GeneratedDay[]> {
  const prompt = `Você é um especialista em devocionais cristãos. Crie um devocional de 7 dias personalizado para alguém com o seguinte perfil espiritual:

Perfil: ${request.profileName}
Descrição: ${request.profileDescription}
Desafios: ${request.challenges.join(", ")}

Para cada dia, forneça:
1. Um versículo bíblico relevante (com referência)
2. Uma reflexão profunda (2-3 parágrafos)
3. Uma oração personalizada
4. Uma aplicação prática para o dia

Formate a resposta como JSON com este exato formato:
[
  {
    "day": 1,
    "verse": "Texto do versículo aqui",
    "verseReference": "Referência (ex: João 3:16)",
    "reflection": "Reflexão aqui",
    "prayer": "Oração aqui",
    "application": "Aplicação prática aqui"
  },
  ...
]

Importante: Retorne APENAS o JSON, sem explicações adicionais.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um especialista em devocionais cristãos. Responda APENAS com JSON válido." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") throw new Error("Resposta vazia da OpenAI");

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("JSON não encontrado na resposta");

    const days = JSON.parse(jsonMatch[0]) as GeneratedDay[];
    return days.slice(0, 7);
  } catch (error) {
    console.error("Erro ao gerar conteúdo devocional:", error);
    throw error;
  }
}

export async function generateDevotionalPDF(request: DevotionalRequest): Promise<Buffer> {
  try {
    const days = await generateDevotionalContent(request);
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont("Helvetica");
    const timesBold = await pdfDoc.embedFont("Helvetica-Bold");

    // Página de Capa
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let yPosition = PAGE_HEIGHT - TOP_MARGIN;

    // Título
    page.drawText("Seu Guia Devocional", {
      x: MARGIN_X,
      y: yPosition,
      size: 14,
      font: timesBold,
      color: COLORS.accent,
    });
    yPosition -= 25;

    // Nome do Perfil
    page.drawText(request.profileName, {
      x: MARGIN_X,
      y: yPosition,
      size: 26,
      font: timesBold,
      color: COLORS.dark,
    });
    yPosition -= 35;

    // Descrição
    yPosition = drawWrappedText(
      page,
      request.profileDescription,
      MARGIN_X,
      yPosition,
      timesRoman,
      11,
      COLORS.medium,
      85,
      15
    );
    yPosition -= 20;

    // Período
    page.drawText("7 Dias para se Aproximar de Deus", {
      x: MARGIN_X,
      y: yPosition,
      size: 12,
      font: timesBold,
      color: COLORS.dark,
    });
    yPosition -= 16;

    page.drawText("Reflexões bíblicas profundas e práticas espirituais personalizadas", {
      x: MARGIN_X,
      y: yPosition,
      size: 10,
      font: timesRoman,
      color: COLORS.medium,
    });

    // Páginas dos 7 dias
    for (const day of days) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      yPosition = PAGE_HEIGHT - TOP_MARGIN;

      // Dia
      page.drawText(`Dia ${day.day}`, {
        x: MARGIN_X,
        y: yPosition,
        size: 14,
        font: timesBold,
        color: COLORS.accent,
      });
      yPosition -= 20;

      // Versículo
      page.drawText("Versículo", {
        x: MARGIN_X,
        y: yPosition,
        size: 11,
        font: timesBold,
        color: COLORS.dark,
      });
      yPosition -= 14;

      const verseText = `${stripLeadingEmoji(day.verse)} (${stripLeadingEmoji(day.verseReference)})`;
      yPosition = drawWrappedText(page, verseText, MARGIN_X + 10, yPosition, timesRoman, 10, COLORS.accent, 80, 13);
      yPosition -= 12;

      // Reflexão
      page.drawText("Reflexão", {
        x: MARGIN_X,
        y: yPosition,
        size: 11,
        font: timesBold,
        color: COLORS.dark,
      });
      yPosition -= 14;

      yPosition = drawWrappedText(page, stripLeadingEmoji(day.reflection), MARGIN_X + 10, yPosition, timesRoman, 9, COLORS.medium, 80, 12);
      yPosition -= 10;

      // Oração
      page.drawText("Oração", {
        x: MARGIN_X,
        y: yPosition,
        size: 11,
        font: timesBold,
        color: COLORS.dark,
      });
      yPosition -= 14;

      yPosition = drawWrappedText(page, stripLeadingEmoji(day.prayer), MARGIN_X + 10, yPosition, timesRoman, 9, COLORS.medium, 80, 12);
      yPosition -= 10;

      // Aplicação
      page.drawText("Aplicação Prática", {
        x: MARGIN_X,
        y: yPosition,
        size: 11,
        font: timesBold,
        color: COLORS.dark,
      });
      yPosition -= 14;

      yPosition = drawWrappedText(page, stripLeadingEmoji(day.application), MARGIN_X + 10, yPosition, timesRoman, 9, COLORS.medium, 80, 12);
    }

    // Página final
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    yPosition = PAGE_HEIGHT - TOP_MARGIN;

    page.drawText("Próximos Passos", {
      x: MARGIN_X,
      y: yPosition,
      size: 14,
      font: timesBold,
      color: COLORS.dark,
    });
    yPosition -= 25;

    const nextStepsText = "Parabéns por completar este devocional! Agora continue sua jornada espiritual. Escolha um horário fixo para seus momentos de oração e reflexão. Compartilhe o que aprendeu com um amigo cristão. Busque aprofundar sua conexão com Deus através da leitura da Bíblia e da comunhão com outros crentes.";

    yPosition = drawWrappedText(page, nextStepsText, MARGIN_X, yPosition, timesRoman, 11, COLORS.medium, 85, 15);
    yPosition -= 20;

    // Rodapé
    page.drawText(
      "Este devocional foi criado especialmente para sua jornada espiritual. Que Deus abençoe seus próximos passos.",
      {
        x: MARGIN_X,
        y: BOTTOM_MARGIN - 10,
        size: 8,
        font: timesRoman,
        color: COLORS.accent,
      }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Erro ao gerar PDF devocional:", error);
    throw error;
  }
}
