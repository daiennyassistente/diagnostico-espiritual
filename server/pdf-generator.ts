import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

export interface DiagnosticData {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  responses: Record<string, string>;
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

function createPage(pdfDoc: PDFDocument): { page: PDFPage; yPosition: number } {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.white,
  });

  return {
    page,
    yPosition: PAGE_HEIGHT - TOP_MARGIN,
  };
}

function drawWrappedLines(params: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  font: PDFFont;
  size: number;
  color: ReturnType<typeof rgb>;
  maxCharsPerLine: number;
  lineHeight: number;
}): number {
  const lines = wrapText(params.text, params.maxCharsPerLine);
  let currentY = params.y;

  for (const line of lines) {
    params.page.drawText(line, {
      x: params.x,
      y: currentY,
      size: params.size,
      font: params.font,
      color: params.color,
    });
    currentY -= params.lineHeight;
  }

  return currentY;
}

export async function generateDiagnosticPDF(diagnosticData: DiagnosticData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let { page, yPosition } = createPage(pdfDoc);

  const ensureSpace = (spaceNeeded: number) => {
    if (yPosition - spaceNeeded < BOTTOM_MARGIN) {
      const newPage = createPage(pdfDoc);
      page = newPage.page;
      yPosition = newPage.yPosition;
    }
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(24);
    page.drawText(normalizePdfText(title), {
      x: MARGIN_X,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: COLORS.dark,
    });
    yPosition -= 22;
  };

  const drawBulletList = (items: string[], prefixFactory: (index: number) => string) => {
    for (let index = 0; index < items.length; index += 1) {
      const prefix = prefixFactory(index);
      const wrapped = wrapText(`${prefix}${items[index]}`, 72);

      ensureSpace(wrapped.length * 14 + 4);

      wrapped.forEach((line) => {
        page.drawText(line, {
          x: MARGIN_X + 10,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: COLORS.medium,
        });
        yPosition -= 14;
      });
    }

    yPosition -= 10;
  };

  const displayProfileName = stripLeadingEmoji(diagnosticData.profileName);
  const displayDescription = normalizePdfText(diagnosticData.profileDescription);
  const displayNextStep = normalizePdfText(
    diagnosticData.nextSteps[0] || "Continue sua jornada espiritual com fé e esperança.",
  );

  page.drawText("Seu Diagnóstico Espiritual", {
    x: MARGIN_X,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: COLORS.accent,
  });

  yPosition -= 32;

  page.drawText(displayProfileName, {
    x: MARGIN_X,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: COLORS.dark,
  });

  yPosition -= 22;

  page.drawRectangle({
    x: MARGIN_X,
    y: yPosition - 78,
    width: CONTENT_WIDTH,
    height: 78,
    color: COLORS.background,
    borderColor: COLORS.mutedBorder,
    borderWidth: 1,
  });

  yPosition -= 20;
  yPosition = drawWrappedLines({
    page,
    text: displayDescription,
    x: MARGIN_X + 14,
    y: yPosition,
    font: regularFont,
    size: 12,
    color: COLORS.medium,
    maxCharsPerLine: 74,
    lineHeight: 16,
  });

  yPosition -= 8;

  page.drawText("\"Este é o momento certo para dar o próximo passo em sua jornada com Deus.\"", {
    x: MARGIN_X + 14,
    y: yPosition,
    size: 10,
    font: regularFont,
    color: COLORS.accent,
  });

  yPosition -= 34;

  drawSectionTitle("Seus Pontos Fortes");
  drawBulletList(diagnosticData.strengths, () => "✓ ");

  drawSectionTitle("Desafios a Trabalhar");
  drawBulletList(diagnosticData.challenges, () => "• ");

  drawSectionTitle("Recomendações");
  drawBulletList(diagnosticData.recommendations, (index) => `${index + 1}. `);

  ensureSpace(86);
  page.drawRectangle({
    x: MARGIN_X,
    y: yPosition - 60,
    width: CONTENT_WIDTH,
    height: 60,
    color: COLORS.background,
    borderColor: COLORS.accent,
    borderWidth: 1,
  });

  page.drawText("Próximo Passo", {
    x: MARGIN_X + 14,
    y: yPosition - 18,
    size: 12,
    font: boldFont,
    color: COLORS.dark,
  });

  const nextStepLines = wrapText(`\"${displayNextStep}\"`, 72);
  let nextStepY = yPosition - 38;
  for (const line of nextStepLines) {
    page.drawText(line, {
      x: MARGIN_X + 14,
      y: nextStepY,
      size: 11,
      font: regularFont,
      color: COLORS.medium,
    });
    nextStepY -= 14;
  }

  yPosition = nextStepY - 26;
  ensureSpace(32);

  page.drawText(
    "Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.",
    {
      x: MARGIN_X,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: COLORS.medium,
    },
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
