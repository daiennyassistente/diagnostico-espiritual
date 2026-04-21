import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface DevotionalContent {
  userName: string;
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  days: Array<{
    day: number;
    title: string;
    verse: string;
    verseReference: string;
    reflection: string;
    prayer: string;
    application: string;
  }>;
}

// Cores do design
const COLORS = {
  darkBg: "#0a0e27", // Azul profundo
  gold: "#d4af37", // Dourado elegante
  lightGold: "#e8d4a8", // Dourado claro
  white: "#ffffff",
  lightGray: "#f5f5f5",
  darkGray: "#2a2a2a",
  accentBlue: "#1a2a4a", // Azul mais claro para destaques
};

function addHeader(doc: any, text: string, color: string = COLORS.gold) {
  doc.fontSize(28).font("Helvetica-Bold").fillColor(color).text(text, {
    align: "center",
    lineGap: 10,
  });
}

function addSubheader(doc: any, text: string, color: string = COLORS.lightGold) {
  doc.fontSize(14).font("Helvetica").fillColor(color).text(text, {
    align: "center",
    lineGap: 5,
  });
}

function addSectionTitle(doc: any, text: string) {
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.gold).text(text, {
    lineGap: 8,
  });
}

function addBodyText(doc: any, text: string, size: number = 11) {
  doc.fontSize(size).font("Helvetica").fillColor(COLORS.white).text(text, {
    align: "justify",
    lineGap: 6,
  });
}

function addDivider(doc: any) {
  const y = doc.y;
  doc
    .strokeColor(COLORS.gold)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
  doc.moveDown(0.5);
}

function addPageBreak(doc: any) {
  doc.addPage();
  // Fundo escuro
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.darkBg);
}

export async function generatePremiumDevotionalPDF(content: DevotionalContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", reject);

      // ========== CAPA ==========
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.darkBg);
      doc.fillColor(COLORS.gold).fontSize(12).text("Diagnóstico Espiritual", 50, 80, {
        align: "center",
      });

      doc.moveDown(3);
      addHeader(doc, "Seu Devocional Personalizado", COLORS.gold);

      doc.moveDown(1);
      addSubheader(doc, `7 Dias para se Aproximar de Deus`, COLORS.lightGold);

      doc.moveDown(3);
      addDivider(doc);

      doc.moveDown(2);
      addBodyText(doc, `Bem-vindo(a), ${content.userName}!`, 14);
      doc.moveDown(1);

      addBodyText(
        doc,
        `Este devocional foi criado especialmente para você, baseado em suas respostas e em seu perfil espiritual identificado como "${content.profileName}".`,
        11
      );

      doc.moveDown(1.5);
      addBodyText(doc, `${content.profileDescription}`, 11);

      doc.moveDown(2);
      addDivider(doc);

      doc.moveDown(2);
      addSectionTitle(doc, "Como usar este devocional");
      doc.moveDown(0.5);
      addBodyText(
        doc,
        `Reserve um tempo tranquilo cada dia para ler a reflexão, meditar no versículo bíblico, fazer a oração sugerida e aplicar o desafio prático. Este é um espaço sagrado entre você e Deus.`,
        10
      );

      doc.moveDown(2);
      addDivider(doc);

      doc.moveDown(2);
      addSectionTitle(doc, "Seu Perfil Espiritual");
      doc.moveDown(0.5);

      if (content.strengths.length > 0) {
        addBodyText(doc, "Forças Identificadas:", 11);
        content.strengths.forEach((strength) => {
          doc.fontSize(10).fillColor(COLORS.lightGray).text(`• ${strength}`, { lineGap: 4 });
        });
        doc.moveDown(0.5);
      }

      if (content.challenges.length > 0) {
        addBodyText(doc, "Desafios Percebidos:", 11);
        content.challenges.forEach((challenge) => {
          doc.fontSize(10).fillColor(COLORS.lightGray).text(`• ${challenge}`, { lineGap: 4 });
        });
        doc.moveDown(0.5);
      }

      if (content.recommendations.length > 0) {
        addBodyText(doc, "Recomendações:", 11);
        content.recommendations.forEach((rec) => {
          doc.fontSize(10).fillColor(COLORS.lightGray).text(`• ${rec}`, { lineGap: 4 });
        });
        doc.moveDown(0.5);
      }

      // ========== DIAS DO DEVOCIONAL ==========
      content.days.forEach((day) => {
        addPageBreak(doc);

        // Número do dia
        doc.fontSize(48).font("Helvetica-Bold").fillColor(COLORS.gold).text(`Dia ${day.day}`, {
          align: "center",
        });

        doc.moveDown(0.5);
        addSectionTitle(doc, day.title);
        doc.moveDown(1);

        // Versículo
        doc.fontSize(10).fillColor(COLORS.lightGold).font("Helvetica-Oblique").text(day.verseReference, {
          align: "center",
        });
        doc.moveDown(0.5);

        addDivider(doc);
        doc.moveDown(0.5);

        doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica").text(day.verse, {
          align: "justify",
          lineGap: 6,
        });

        doc.moveDown(1.5);

        // Reflexão
        addSectionTitle(doc, "Reflexão");
        doc.moveDown(0.5);
        addBodyText(doc, day.reflection, 10);

        doc.moveDown(1.5);

        // Oração
        addSectionTitle(doc, "Oração");
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica-Oblique").text(day.prayer, {
          align: "justify",
          lineGap: 6,
        });

        doc.moveDown(1.5);

        // Aplicação
        addSectionTitle(doc, "Aplicação Prática");
        doc.moveDown(0.5);
        addBodyText(doc, day.application, 10);

        doc.moveDown(1);
        addDivider(doc);
      });

      // ========== PÁGINA FINAL ==========
      addPageBreak(doc);

      doc.moveDown(3);
      addHeader(doc, "Que Deus te Abençoe!", COLORS.gold);

      doc.moveDown(2);
      addBodyText(
        doc,
        `${content.userName}, que estes 7 dias sejam um tempo de renovação espiritual, restauração da intimidade com Deus e fortalecimento de sua fé em Jesus Cristo.`,
        11
      );

      doc.moveDown(1.5);
      addBodyText(
        doc,
        `Lembre-se: a jornada espiritual não termina aqui. Continue buscando a Deus com sinceridade, lendo Sua Palavra e vivendo em obediência. Que o Espírito Santo guie seus passos e que você experimente a paz, a graça e o amor de Cristo todos os dias de sua vida.`,
        11
      );

      doc.moveDown(2);
      addDivider(doc);

      doc.moveDown(2);
      doc.fontSize(10).fillColor(COLORS.lightGold).text("Diagnóstico Espiritual", {
        align: "center",
      });
      doc.fontSize(9).fillColor(COLORS.lightGray).text("Um ministério de oração, conselho e esperança em Cristo", {
        align: "center",
      });

      doc.moveDown(1);
      doc.fontSize(8).fillColor(COLORS.darkGray).text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, {
        align: "center",
      });

      // Finalizar PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateDevotionalPDFStream(content: DevotionalContent): Promise<Readable> {
  const buffer = await generatePremiumDevotionalPDF(content);
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}
