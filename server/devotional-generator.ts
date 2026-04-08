import PDFDocument from "pdfkit";
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

export function normalizePdfText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateDevotionalContent(
  request: DevotionalRequest
): Promise<GeneratedDay[]> {
  const prompt = `
    Crie um devocional de 7 dias personalizado para alguém com o seguinte perfil espiritual:
    
    Perfil: ${request.profileName}
    Descrição: ${request.profileDescription}
    Desafios: ${request.challenges.join(", ")}
    Recomendações: ${request.recommendations.join(", ")}
    
    Para cada dia, forneça:
    1. Um versículo bíblico (referência e texto)
    2. Uma reflexão profunda (2-3 parágrafos)
    3. Uma oração personalizada
    4. Uma aplicação prática para o dia
    
    Responda em JSON com a seguinte estrutura:
    [
      {
        "day": 1,
        "verse": "Salmos 42:1",
        "verseReference": "Como a corça anseia pelas correntes de água...",
        "reflection": "...",
        "prayer": "...",
        "application": "..."
      }
    ]
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Você é um conselheiro espiritual cristão que cria devocionais personalizados baseados no perfil espiritual da pessoa.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "devotional_content",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              verse: { type: "string" },
              verseReference: { type: "string" },
              reflection: { type: "string" },
              prayer: { type: "string" },
              application: { type: "string" },
            },
            required: ["day", "verse", "verseReference", "reflection", "prayer", "application"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const parsedContent = typeof content === "string" ? JSON.parse(content) : content;

  return parsedContent;
}

export async function generateDevotionalPDF(request: DevotionalRequest): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const devotionalDays = await generateDevotionalContent(request);

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Capa
      doc.fontSize(20).font("Helvetica-Bold").text("Devocional: 7 Dias");
      doc.moveDown(0.2);
      doc.fontSize(16).font("Helvetica").text("para se Aproximar de Deus de Verdade");
      doc.moveDown(0.5);

      doc.fontSize(12).font("Helvetica").text("Personalizado para sua jornada espiritual");
      doc.moveDown(1);

      doc.fontSize(11).font("Helvetica").text(normalizePdfText(request.profileDescription), {
        align: "justify",
      });
      doc.moveDown(1);

      // Dias do devocional
      devotionalDays.forEach((day, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Dia
        doc.fontSize(14).font("Helvetica-Bold").text(`Dia ${day.day}`);
        doc.moveDown(0.3);

        // Versículo
        doc.fontSize(11).font("Helvetica-Bold").text("Versículo:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.verse), {
          align: "justify",
        });
        doc.moveDown(0.2);
        doc.fontSize(9).font("Helvetica-Oblique").text(normalizePdfText(day.verseReference));
        doc.moveDown(0.5);

        // Reflexão
        doc.fontSize(11).font("Helvetica-Bold").text("Reflexão:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.reflection), {
          align: "justify",
        });
        doc.moveDown(0.5);

        // Oração
        doc.fontSize(11).font("Helvetica-Bold").text("Oração:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.prayer), {
          align: "justify",
        });
        doc.moveDown(0.5);

        // Aplicação
        doc.fontSize(11).font("Helvetica-Bold").text("Aplicação para Hoje:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.application), {
          align: "justify",
        });
      });

      // Página final
      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("Conclusão");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").text(
        "Parabéns por completar este devocional de 7 dias! Que esta jornada tenha aproximado você de Deus e transformado sua vida espiritual. Lembre-se de que o crescimento espiritual é um processo contínuo. Continue buscando a Deus todos os dias através da oração, leitura da Bíblia e comunhão com outros cristãos.",
        { align: "justify" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
