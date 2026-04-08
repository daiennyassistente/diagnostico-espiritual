import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

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
}

// Paleta de cores harmoniosa
const colors = {
  background: "#F5F1EA",      // Bege claro aconchegante
  primary: "#4A3F35",          // Marrom quente
  secondary: "#3E342C",        // Marrom mais escuro
  accent: "#6B5B52",           // Marrom médio para destaques
  light: "#FFFFFF",            // Branco
  lightText: "#8B7B72",        // Marrom claro para textos secundários
};

// Decorações minimalistas
const decorations = {
  cross: "✝",
  bible: "📖",
  leaf: "🍃",
  star: "✨",
  heart: "💫",
};

function createPDFStream(input: PDFInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const stream = new PassThrough();
      doc.pipe(stream);

      // ============ CAPA ============
      createCover(doc, input);

      // ============ PÁGINAS DE DIAS ============
      input.days.forEach((day, index) => {
        doc.addPage();
        createDayPage(doc, day, index + 1);
      });

      // ============ PÁGINA FINAL ============
      doc.addPage();
      createClosingPage(doc, input);

      doc.end();

      // Coletar o buffer do PDF
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

function createCover(doc: PDFKit.PDFDocument, input: PDFInput) {
  // Fundo
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Decorações no topo e rodapé
  doc.fontSize(60).fillColor(colors.primary).opacity(0.1);
  doc.text(decorations.cross, 50, 80, { align: "left" });
  doc.text(decorations.bible, doc.page.width - 100, 80, { align: "right" });
  doc.text(decorations.bible, 50, doc.page.height - 150, { align: "left" });
  doc.text(decorations.cross, doc.page.width - 100, doc.page.height - 150, { align: "right" });

  // Título principal
  doc.fontSize(48).fillColor(colors.primary).opacity(1).font("Helvetica-Bold");
  doc.text("Guia Devocional", 0, 200, { align: "center", width: doc.page.width });

  // Perfil espiritual
  doc.fontSize(32).fillColor(colors.accent);
  doc.text(`${input.profileEmoji} ${input.profileName}`, 0, 280, { align: "center", width: doc.page.width });

  // Descrição do perfil
  doc.fontSize(12).fillColor(colors.secondary).font("Helvetica");
  doc.text(input.profileDescription, 60, 340, {
    width: doc.page.width - 120,
    align: "center",
    lineGap: 6,
  });

  // Separador decorativo
  doc.moveTo(100, 420).lineTo(doc.page.width - 100, 420).stroke(colors.accent);
  doc.fontSize(16).fillColor(colors.accent).text(decorations.leaf, 0, 430, { align: "center", width: doc.page.width });

  // Informações de data
  doc.fontSize(11).fillColor(colors.lightText).font("Helvetica");
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

  if (input.userName) {
    doc.text(`Para: ${input.userName}`, 0, 480, { align: "center", width: doc.page.width });
  }
  doc.text(`Gerado em: ${dateStr}`, 0, 510, { align: "center", width: doc.page.width });

  // Mensagem inspiradora
  doc.fontSize(10).fillColor(colors.lightText).font("Helvetica-Oblique");
  doc.text("7 dias para se aproximar de Deus", 0, 580, { align: "center", width: doc.page.width });
}

function createDayPage(doc: PDFKit.PDFDocument, day: PDFDay, dayNumber: number) {
  // Fundo
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Número do dia no canto superior
  doc.fontSize(14).fillColor(colors.accent).opacity(0.3).font("Helvetica-Bold");
  doc.text(`DIA ${dayNumber}`, 50, 50);

  // Decoração no topo
  doc.fontSize(24).fillColor(colors.primary).opacity(0.15);
  doc.text(decorations.leaf, doc.page.width - 80, 50);

  // Título do dia
  doc.fontSize(24).fillColor(colors.primary).opacity(1).font("Helvetica-Bold");
  doc.text(day.title, 50, 90, { width: doc.page.width - 100, lineGap: 4 });

  // Linha separadora
  doc.moveTo(50, 160).lineTo(doc.page.width - 50, 160).stroke(colors.accent);

  let yPosition = 180;

  // ===== VERSÍCULO =====
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("📖 Versículo", 50, yPosition);
  yPosition += 20;

  doc.fontSize(12).fillColor(colors.secondary).font("Helvetica-Oblique");
  doc.text(`"${day.verse}"`, 60, yPosition, { width: doc.page.width - 120, lineGap: 5 });
  yPosition += doc.heightOfString(`"${day.verse}"`, { width: doc.page.width - 120 }) + 5;

  doc.fontSize(10).fillColor(colors.lightText).font("Helvetica");
  doc.text(`— ${day.verseReference}`, 60, yPosition);
  yPosition += 25;

  // ===== REFLEXÃO =====
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("💭 Reflexão", 50, yPosition);
  yPosition += 20;

  doc.fontSize(11).fillColor(colors.secondary).font("Helvetica");
  doc.text(day.reflection, 60, yPosition, { width: doc.page.width - 120, lineGap: 5 });
  yPosition += doc.heightOfString(day.reflection, { width: doc.page.width - 120 }) + 15;

  // ===== ORAÇÃO =====
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("🙏 Oração", 50, yPosition);
  yPosition += 20;

  doc.fontSize(11).fillColor(colors.secondary).font("Helvetica-Oblique");
  doc.text(day.prayer, 60, yPosition, { width: doc.page.width - 120, lineGap: 5 });
  yPosition += doc.heightOfString(day.prayer, { width: doc.page.width - 120 }) + 15;

  // ===== APLICAÇÃO =====
  doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
  doc.text("✨ Aplicação Prática", 50, yPosition);
  yPosition += 20;

  doc.fontSize(11).fillColor(colors.secondary).font("Helvetica");
  doc.text(day.application, 60, yPosition, { width: doc.page.width - 120, lineGap: 5 });

  // Rodapé decorativo
  doc.fontSize(12).fillColor(colors.primary).opacity(0.1);
  doc.text(decorations.cross, 50, doc.page.height - 60);
  doc.text(decorations.bible, doc.page.width - 80, doc.page.height - 60);
}

function createClosingPage(doc: PDFKit.PDFDocument, input: PDFInput) {
  // Fundo
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

  // Decorações
  doc.fontSize(60).fillColor(colors.primary).opacity(0.1);
  doc.text(decorations.cross, 50, 80);
  doc.text(decorations.bible, doc.page.width - 100, 80);
  doc.text(decorations.bible, 50, doc.page.height - 150);
  doc.text(decorations.cross, doc.page.width - 100, doc.page.height - 150);

  // Título
  doc.fontSize(32).fillColor(colors.primary).opacity(1).font("Helvetica-Bold");
  doc.text("Seu Próximo Passo", 0, 150, { align: "center", width: doc.page.width });

  // Separador
  doc.moveTo(100, 210).lineTo(doc.page.width - 100, 210).stroke(colors.accent);

  // Mensagem final
  doc.fontSize(12).fillColor(colors.secondary).font("Helvetica");
  const closingMessage = `Você completou estes 7 dias de devocional.

Mas sua jornada com Deus não termina aqui.

Cada dia que você escolhe confiar em Deus,
cada oração que você faz,
cada versículo que você medita —
tudo importa.

Você está crescendo.
Você está mudando.
Você está se aproximando de Deus.

Continue buscando uma conexão mais profunda com o Senhor.
Que cada novo dia seja uma oportunidade de conhecê-Lo melhor.

Que Deus abençoe sua jornada.`;

  doc.text(closingMessage, 50, 250, {
    width: doc.page.width - 100,
    align: "center",
    lineGap: 8,
  });

  // Decoração final
  doc.fontSize(14).fillColor(colors.accent);
  doc.text(decorations.heart, 0, doc.page.height - 100, { align: "center", width: doc.page.width });
}

export { createPDFStream, PDFInput, PDFDay };
