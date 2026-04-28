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
  doc.fontSize(size).font("Helvetica").fillColor(COLORS.lightGray).text(text, {
    align: "justify",
    lineGap: 5,
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

      // ========== CAPA PERSONALIZADA ==========
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.darkBg);
      
      // Título principal
      doc.moveDown(2);
      doc.fillColor(COLORS.gold).fontSize(12).text("Diagnóstico Espiritual", 50, 100, {
        align: "center",
      });

      doc.moveDown(2);
      addHeader(doc, "Personalizado", COLORS.gold);
      
      doc.moveDown(1);
      addSubheader(doc, `Para ${content.userName}`, COLORS.lightGold);

      doc.moveDown(3);
      addDivider(doc);

      // Mensagem emocional de boas-vindas
      doc.moveDown(2);
      doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica-Oblique").text(
        `"${content.userName}, o que você respondeu neste quiz revelou muito mais do que simples palavras. Revelou o clamor do seu coração."`,
        { align: "center", lineGap: 8 }
      );

      doc.moveDown(2);
      
      // Descrição do perfil com verso bíblico personalizado
      doc.fontSize(12).fillColor(COLORS.gold).font("Helvetica-Bold").text("Seu Perfil Espiritual:", {
        align: "center",
      });
      
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica").text(
        content.profileName,
        { align: "center", lineGap: 6 }
      );

      doc.moveDown(1.5);
      addDivider(doc);

      doc.moveDown(1.5);
      
      // Mensagem emocional baseada no perfil
      doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica").text(
        `Você foi identificado como alguém ${content.profileName.toLowerCase()}. Isso não é um rótulo, é um reconhecimento. É Deus dizendo: "Eu vejo você. Eu entendo sua jornada. Eu conheço cada passo que você deu."`,
        { align: "justify", lineGap: 6 }
      );

      doc.moveDown(1.5);
      
      // Descrição completa do perfil
      doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica").text(
        content.profileDescription,
        { align: "justify", lineGap: 6 }
      );

      doc.moveDown(2);
      addDivider(doc);

      // Mensagem final da capa
      doc.moveDown(1.5);
      doc.fontSize(9).fillColor(COLORS.lightGray).font("Helvetica-Oblique").text(
        `Nos próximos 7 dias, você não receberá apenas informações. Você receberá um encontro. Um encontro com a verdade de quem você é em Cristo. Um encontro com o amor de Deus que não depende do seu desempenho, mas da Sua fidelidade.`,
        { align: "justify", lineGap: 5 }
      );

      // ========== PÁGINA DE BEM-VINDO ==========
      addPageBreak(doc);

      doc.moveDown(1);
      addHeader(doc, "Bem-vindo(a)", COLORS.gold);
      
      doc.moveDown(1);
      addSubheader(doc, "Seu diagnóstico foi processado com sucesso", COLORS.lightGold);

      doc.moveDown(2);
      addDivider(doc);

      doc.moveDown(1.5);
      
      // Mensagem emocional personalizada
      doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica").text(
        `${content.userName}, você está aqui porque decidiu se aproximar de Deus. Essa decisão é importante. Ela revela um coração que busca verdade, que clama por direção e que deseja experimentar a presença real de Deus em sua vida.`,
        { align: "justify", lineGap: 6 }
      );

      doc.moveDown(1.5);

      // Forças
      if (content.strengths.length > 0) {
        doc.fontSize(12).fillColor(COLORS.gold).font("Helvetica-Bold").text("O que Deus vê em você:", { lineGap: 6 });
        doc.moveDown(0.5);
        
        content.strengths.forEach((strength) => {
          doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica").text(`✦ ${strength}`, {
            lineGap: 5,
          });
        });
        
        doc.moveDown(1.5);
      }

      // Desafios
      if (content.challenges.length > 0) {
        doc.fontSize(12).fillColor(COLORS.gold).font("Helvetica-Bold").text("Os desafios que você enfrenta:", { lineGap: 6 });
        doc.moveDown(0.5);
        
        content.challenges.forEach((challenge) => {
          doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica").text(`◆ ${challenge}`, {
            lineGap: 5,
          });
        });
        
        doc.moveDown(1.5);
      }

      doc.moveDown(1);
      addDivider(doc);

      doc.moveDown(1.5);

      // Mensagem final da página 2
      doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica").text(
        `Nos próximos 7 dias, você não receberá apenas informações. Você receberá um encontro. Um encontro com a verdade de quem você é em Cristo. Um encontro com o amor de Deus que não depende do seu desempenho, mas da Sua fidelidade.`,
        { align: "justify", lineGap: 6 }
      );

      doc.moveDown(1.5);

      doc.fontSize(11).fillColor(COLORS.lightGray).font("Helvetica").text(
        `Que este devocional seja um espaço onde você se sinta visto, compreendido e profundamente amado por Deus.`,
        { align: "justify", lineGap: 6 }
      );

      // ========== DIAS DO DEVOCIONAL ==========
      content.days.forEach((day) => {
        addPageBreak(doc);

        // Número do dia
        doc.fontSize(40).font("Helvetica-Bold").fillColor(COLORS.gold).text(`Dia ${day.day}`, {
          align: "center",
        });

        doc.moveDown(0.3);
        doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.gold).text(day.title, {
          align: "center",
          lineGap: 6,
        });
        doc.moveDown(0.8);

        // Versículo
        doc.fontSize(9).fillColor(COLORS.lightGold).font("Helvetica-Oblique").text(day.verseReference, {
          align: "center",
        });
        doc.moveDown(0.3);

        addDivider(doc);
        doc.moveDown(0.3);

        doc.fontSize(10).fillColor(COLORS.lightGray).font("Helvetica").text(day.verse, {
          align: "justify",
          lineGap: 5,
        });

        doc.moveDown(1);

        // Reflexão
        addSectionTitle(doc, "Reflexão");
        doc.moveDown(0.3);
        doc.fontSize(9.5).fillColor(COLORS.lightGray).font("Helvetica").text(day.reflection, {
          align: "justify",
          lineGap: 5,
        });

        doc.moveDown(1);

        // Oração
        addSectionTitle(doc, "Oração");
        doc.moveDown(0.3);
        doc.fontSize(9.5).fillColor(COLORS.lightGray).font("Helvetica-Oblique").text(day.prayer, {
          align: "justify",
          lineGap: 5,
        });

        doc.moveDown(1);

        // Aplicação
        addSectionTitle(doc, "Aplicação Prática");
        doc.moveDown(0.3);
        doc.fontSize(9.5).fillColor(COLORS.lightGray).font("Helvetica").text(day.application, {
          align: "justify",
          lineGap: 5,
        });

        doc.moveDown(0.5);
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

      doc.moveDown(2);
      addBodyText(
        doc,
        `Você não está sozinho nesta jornada. O Espírito Santo está aqui para guiar, confortar e transformar seu coração. Que você experimente a paz de Deus que excede todo entendimento.`,
        11
      );

      doc.moveDown(2);
      addDivider(doc);

      doc.moveDown(2);
      doc.fontSize(10).fillColor(COLORS.lightGold).font("Helvetica-Oblique").text(
        `"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." — João 3:16`,
        { align: "center", lineGap: 6 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
