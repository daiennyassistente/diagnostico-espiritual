import { invokeLLM } from "./_core/llm";
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

export async function generateDiagnosticPDF(diagnosticData: DiagnosticData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

  let yPosition = height - 50;

  // Title
  page.drawText("DIAGNÓSTICO ESPIRITUAL", {
    x: 50,
    y: yPosition,
    size: 24,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15), // #3E342C
  });

  yPosition -= 40;

  // Profile Section
  page.drawText("Seu Perfil Espiritual", {
    x: 50,
    y: yPosition,
    size: 16,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15),
  });

  yPosition -= 25;

  page.drawText(diagnosticData.profileName, {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(0.29, 0.25, 0.21), // #4A3F35
  });

  yPosition -= 20;

  // Wrap description text
  const descriptionLines = wrapText(diagnosticData.profileDescription, 80);
  descriptionLines.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.29, 0.25, 0.21),
    });
    yPosition -= 15;
  });

  yPosition -= 15;

  // Strengths Section
  page.drawText("Pontos Fortes", {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15),
  });

  yPosition -= 15;

  diagnosticData.strengths.forEach((strength) => {
    page.drawText(`• ${strength}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.29, 0.25, 0.21),
    });
    yPosition -= 12;
  });

  yPosition -= 10;

  // Challenges Section
  page.drawText("Desafios", {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15),
  });

  yPosition -= 15;

  diagnosticData.challenges.forEach((challenge) => {
    page.drawText(`• ${challenge}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.29, 0.25, 0.21),
    });
    yPosition -= 12;
  });

  yPosition -= 10;

  // Recommendations Section
  page.drawText("Recomendações", {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15),
  });

  yPosition -= 15;

  diagnosticData.recommendations.forEach((rec) => {
    const recLines = wrapText(rec, 80);
    recLines.forEach((line) => {
      page.drawText(`• ${line}`, {
        x: 60,
        y: yPosition,
        size: 11,
        font: timesRomanFont,
        color: rgb(0.29, 0.25, 0.21),
      });
      yPosition -= 12;
    });
  });

  yPosition -= 10;

  // Next Steps Section
  page.drawText("Próximos Passos", {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(0.24, 0.20, 0.15),
  });

  yPosition -= 15;

  diagnosticData.nextSteps.forEach((step) => {
    const stepLines = wrapText(step, 80);
    stepLines.forEach((line) => {
      page.drawText(`• ${line}`, {
        x: 60,
        y: yPosition,
        size: 11,
        font: timesRomanFont,
        color: rgb(0.29, 0.25, 0.21),
      });
      yPosition -= 12;
    });
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
