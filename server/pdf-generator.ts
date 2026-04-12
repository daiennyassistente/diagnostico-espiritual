import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface DiagnosticData {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  responses: Record<string, string>;
}

// Paleta de cores do quiz
const COLORS = {
  background: rgb(0.96, 0.94, 0.92), // #F5F1EA
  dark: rgb(0.24, 0.20, 0.15), // #3E342C
  medium: rgb(0.29, 0.25, 0.21), // #4A3F35
  accent: rgb(0.58, 0.47, 0.36), // #956F5C (accent color)
  white: rgb(1, 1, 1), // #FFFFFF
};

// Remove emojis and non-ASCII characters that WinAnsi cannot encode
function sanitizeText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove emoji pairs
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export async function generateDiagnosticPDF(diagnosticData: DiagnosticData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let yPosition = height - 50;

  // Decorative header with background
  page.drawRectangle({
    x: 0,
    y: yPosition - 80,
    width: width,
    height: 80,
    color: COLORS.background,
  });

  // Draw decorative line
  page.drawLine({
    start: { x: 50, y: yPosition - 85 },
    end: { x: width - 50, y: yPosition - 85 },
    thickness: 2,
    color: COLORS.accent,
  });

  // Title
  page.drawText("+ DIAGNÓSTICO ESPIRITUAL +", {
    x: 50,
    y: yPosition - 40,
    size: 20,
    font: timesRomanBoldFont,
    color: COLORS.dark,
  });

  yPosition -= 100;

  // Profile Section with background
  page.drawRectangle({
    x: 40,
    y: yPosition - 100,
    width: width - 80,
    height: 100,
    color: COLORS.background,
    borderColor: COLORS.accent,
    borderWidth: 1,
  });

  page.drawText("Seu Perfil Espiritual", {
    x: 60,
    y: yPosition - 20,
    size: 14,
    font: timesRomanBoldFont,
    color: COLORS.accent,
  });

  yPosition -= 40;

  page.drawText(sanitizeText(diagnosticData.profileName), {
    x: 60,
    y: yPosition,
    size: 16,
    font: timesRomanBoldFont,
    color: COLORS.dark,
  });

  yPosition -= 25;

  // Wrap description text
  const descriptionLines = wrapText(sanitizeText(diagnosticData.profileDescription), 80);
  descriptionLines.forEach((line) => {
    page.drawText(line, {
      x: 60,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
      color: COLORS.medium,
    });
    yPosition -= 12;
  });

  yPosition -= 25;

  // Strengths Section
  page.drawText("* Seus Pontos Fortes", {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBoldFont,
    color: COLORS.accent,
  });

  yPosition -= 18;

  diagnosticData.strengths.forEach((strength) => {
      const strengthLines = wrapText(sanitizeText(strength), 75);
    strengthLines.forEach((line, index) => {
      page.drawText(index === 0 ? `- ${line}` : `  ${line}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: COLORS.medium,
      });
      yPosition -= 12;
    });
  });

  yPosition -= 12;

  // Challenges Section
  page.drawText("• Desafios a Trabalhar", {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBoldFont,
    color: COLORS.accent,
  });

  yPosition -= 18;

  diagnosticData.challenges.forEach((challenge) => {
      const challengeLines = wrapText(sanitizeText(challenge), 75);
    challengeLines.forEach((line, index) => {
      page.drawText(index === 0 ? `- ${line}` : `  ${line}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: COLORS.medium,
      });
      yPosition -= 12;
    });
  });

  yPosition -= 12;

  // Recommendations Section
  page.drawText(">> Recomendações", {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanBoldFont,
    color: COLORS.accent,
  });

  yPosition -= 18;

  diagnosticData.recommendations.forEach((rec, index) => {
    const recLines = wrapText(sanitizeText(rec), 75);
    recLines.forEach((line, lineIndex) => {
      const prefix = lineIndex === 0 ? `${index + 1}. ` : "   ";
      page.drawText(prefix + line, {
        x: 60,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: COLORS.medium,
      });
      yPosition -= 12;
    });
  });

  yPosition -= 12;

  // Next Steps Section with emphasis
  page.drawRectangle({
    x: 40,
    y: yPosition - 50,
    width: width - 80,
    height: 50,
    color: COLORS.background,
    borderColor: COLORS.accent,
    borderWidth: 1,
  });

  page.drawText(">> Próximo Passo", {
    x: 60,
    y: yPosition - 10,
    size: 11,
    font: timesRomanBoldFont,
    color: COLORS.dark,
  });

  yPosition -= 28;

  diagnosticData.nextSteps.forEach((step) => {
    const stepLines = wrapText(sanitizeText(step), 75);
    stepLines.forEach((line) => {
      page.drawText(`"${line}"`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: COLORS.medium,
      });
      yPosition -= 12;
    });
  });

  yPosition -= 20;

  // Footer with decorative line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: COLORS.accent,
  });

  yPosition -= 15;

  page.drawText("Este diagnóstico é uma ferramenta de reflexão espiritual.", {
    x: 50,
    y: yPosition,
    size: 8,
    font: timesRomanFont,
    color: COLORS.medium,
  });

  yPosition -= 10;

  page.drawText("Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.", {
    x: 50,
    y: yPosition,
    size: 8,
    font: timesRomanFont,
    color: COLORS.medium,
  });

  yPosition -= 15;

  page.drawText("+ Que a paz de Deus esteja com você +", {
    x: 50,
    y: yPosition,
    size: 9,
    font: timesRomanBoldFont,
    color: COLORS.accent,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  });

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}
