import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import * as fs from "fs";
import * as path from "path";

interface PDFDay {
  day: number;
  title: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  application: string;
  nextStep?: string;
}

interface PDFInput {
  profileName: string;
  profileEmoji: string;
  profileDescription: string;
  days: PDFDay[];
  userName?: string;
  generatedDate?: Date;
  isCover?: boolean; // Se é a primeira página (resultado)
}

// Cores elegantes
const colors = {
  background: "#FFFFFF",
  headerBg: "#2C3E50",
  headerText: "#FFFFFF",
  primary: "#34495E",
  secondary: "#7F8C8D",
  accent: "#E74C3C",
  lightText: "#95A5A6",
  border: "#ECF0F1",
};

function createPDFStream(input: PDFInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
      });

      const stream = new PassThrough();
      doc.pipe(stream);

      // Primeira página: usar o PDF como capa ou criar página de resultado
      if (input.isCover) {
        createCoverPage(doc, input);
      } else {
        createFirstPage(doc, input);
      }

      // Páginas de dias
      input.days.forEach((day, index) => {
        doc.addPage();
        createDayPage(doc, day, index + 1);
      });

      doc.end();

      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk as Buffer));
      stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

function createCoverPage(doc: PDFKit.PDFDocument, input: PDFInput) {
  // Tentar carregar o PDF como capa
  const coverPath = path.join(__dirname, "cover-template.pdf");
  
  if (fs.existsSync(coverPath)) {
    try {
      // Se o arquivo existir, usar como capa
      doc.image(coverPath, 0, 0, { width: doc.page.width, height: doc.page.height });
      return;
    } catch (error) {
      console.warn("Erro ao carregar cover-template.pdf, usando fallback");
    }
  }

  // Fallback: criar página de resultado personalizada
  createResultPage(doc, input);
}

function createResultPage(doc: PDFKit.PDFDocument, input: PDFInput) {
  // Fundo branco
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Cabeçalho destacado
  doc.rect(0, 0, doc.page.width, 120).fill(colors.headerBg);

  // Título do resultado no cabeçalho
  doc.fontSize(32).fillColor(colors.headerText).font("Helvetica-Bold");
  doc.text(`${input.profileEmoji} ${input.profileName}`, 40, 30, {
    width: doc.page.width - 80,
    align: "center",
  });

  // Descrição centralizada
  doc.fontSize(12).fillColor(colors.secondary).font("Helvetica");
  doc.text(input.profileDescription, 40, 150, {
    width: doc.page.width - 80,
    align: "center",
    lineGap: 6,
  });

  // Nome personalizado
  if (input.userName) {
    doc.fontSize(14).fillColor(colors.primary).font("Helvetica-Bold");
    doc.text(`Para: ${input.userName}`, 40, 280, {
      width: doc.page.width - 80,
      align: "center",
    });
  }

  // Data de geração
  const dateStr = input.generatedDate
    ? new Date(input.generatedDate).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  doc.fontSize(11).fillColor(colors.lightText).font("Helvetica");
  doc.text(`Gerado em: ${dateStr}`, 40, 320, {
    width: doc.page.width - 80,
    align: "center",
  });

  // Mensagem inspiradora
  doc.fontSize(11).fillColor(colors.secondary).font("Helvetica-Oblique");
  doc.text("7 dias para se aproximar de Deus", 40, 380, {
    width: doc.page.width - 80,
    align: "center",
  });
}

function createFirstPage(doc: PDFKit.PDFDocument, input: PDFInput) {
  // Fundo branco
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Cabeçalho destacado
  doc.rect(0, 0, doc.page.width, 100).fill(colors.headerBg);

  // Título do devocional no cabeçalho
  doc.fontSize(28).fillColor(colors.headerText).font("Helvetica-Bold");
  doc.text(`${input.profileEmoji} ${input.profileName}`, 40, 25, {
    width: doc.page.width - 80,
    align: "center",
  });

  // Linha de data
  doc.fontSize(10).fillColor(colors.primary).font("Helvetica");
  doc.text("Data: ___/___/______", 40, 130, { align: "left" });

  // Descrição do devocional
  doc.fontSize(11).fillColor(colors.secondary).font("Helvetica");
  doc.text(input.profileDescription, 40, 170, {
    width: doc.page.width - 80,
    align: "center",
    lineGap: 5,
  });

  // Nome personalizado
  if (input.userName) {
    doc.fontSize(12).fillColor(colors.primary).font("Helvetica-Bold");
    doc.text(`${input.userName}`, 40, 240, {
      width: doc.page.width - 80,
      align: "center",
    });
  }

  // Espaço para anotações
  const annotationsY = 300;
  doc.fontSize(12).fillColor(colors.primary).font("Helvetica-Bold");
  doc.text("Anotações", 40, annotationsY);

  // Linhas para anotações
  const lineSpacing = 18;
  let currentY = annotationsY + 25;
  const maxY = doc.page.height - 40;

  while (currentY < maxY) {
    doc.moveTo(40, currentY).lineTo(doc.page.width - 40, currentY).stroke(colors.border);
    currentY += lineSpacing;
  }
}

function createDayPage(doc: PDFKit.PDFDocument, day: PDFDay, dayNumber: number) {
  // Fundo branco
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Cabeçalho destacado
  doc.rect(0, 0, doc.page.width, 100).fill(colors.headerBg);

  // Título do dia no cabeçalho
  doc.fontSize(24).fillColor(colors.headerText).font("Helvetica-Bold");
  doc.text(`Dia ${dayNumber}: ${day.title}`, 40, 25, {
    width: doc.page.width - 80,
    align: "center",
  });

  // Linha de data
  doc.fontSize(10).fillColor(colors.primary).font("Helvetica");
  doc.text("Data: ___/___/______", 40, 130, { align: "left" });

  let yPosition = 170;

  // Versículo
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("📖 Versículo", 40, yPosition);
  yPosition += 18;

  doc.fontSize(11).fillColor(colors.primary).font("Helvetica-Oblique");
  doc.text(`"${day.verse}"`, 50, yPosition, { width: doc.page.width - 100, lineGap: 4 });
  yPosition += doc.heightOfString(`"${day.verse}"`, { width: doc.page.width - 100 }) + 5;

  doc.fontSize(9).fillColor(colors.lightText).font("Helvetica");
  doc.text(`— ${day.verseReference}`, 50, yPosition);
  yPosition += 20;

  // Reflexão
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("💭 Reflexão", 40, yPosition);
  yPosition += 18;

  doc.fontSize(11).fillColor(colors.primary).font("Helvetica");
  doc.text(day.reflection, 50, yPosition, { width: doc.page.width - 100, lineGap: 4 });
  yPosition += doc.heightOfString(day.reflection, { width: doc.page.width - 100 }) + 12;

  // Oração
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("🙏 Oração", 40, yPosition);
  yPosition += 18;

  doc.fontSize(11).fillColor(colors.primary).font("Helvetica-Oblique");
  doc.text(day.prayer, 50, yPosition, { width: doc.page.width - 100, lineGap: 4 });
  yPosition += doc.heightOfString(day.prayer, { width: doc.page.width - 100 }) + 12;

  // Aplicação
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("✨ Aplicação Prática", 40, yPosition);
  yPosition += 18;

  doc.fontSize(11).fillColor(colors.primary).font("Helvetica");
  doc.text(day.application, 50, yPosition, { width: doc.page.width - 100, lineGap: 4 });
  yPosition += doc.heightOfString(day.application, { width: doc.page.width - 100 }) + 20;

  // Anotações
  if (yPosition < doc.page.height - 100) {
    doc.fontSize(11).fillColor(colors.primary).font("Helvetica-Bold");
    doc.text("Anotações", 40, yPosition);
    yPosition += 18;

    // Linhas para anotações
    const lineSpacing = 16;
    const maxY = doc.page.height - 30;

    while (yPosition < maxY) {
      doc.moveTo(50, yPosition).lineTo(doc.page.width - 40, yPosition).stroke(colors.border);
      yPosition += lineSpacing;
    }
  }
}

export async function generatePDFStream(input: PDFInput): Promise<Buffer> {
  return createPDFStream(input);
}

export { PDFDay, PDFInput };
