import PDFDocument from "pdfkit";

export interface DiagnosticData {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  responses: Record<string, string>;
}

export function normalizePdfText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateDiagnosticPDF(
  data: DiagnosticData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Título
      doc.fontSize(20).font("Helvetica-Bold").text("Seu Diagnóstico Espiritual");
      doc.moveDown(0.3);

      // Nome do perfil
      doc.fontSize(16).font("Helvetica-Bold").text(normalizePdfText(data.profileName));
      doc.moveDown(0.5);

      // Descrição
      doc.fontSize(11).font("Helvetica").text(normalizePdfText(data.profileDescription), {
        align: "justify",
      });
      doc.moveDown(0.5);

      // Seus Pontos Fortes
      doc.fontSize(12).font("Helvetica-Bold").text("Seus Pontos Fortes");
      doc.moveDown(0.2);
      data.strengths.forEach((strength) => {
        doc.fontSize(11).font("Helvetica").text(`• ${normalizePdfText(strength)}`);
      });
      doc.moveDown(0.5);

      // Desafios a Trabalhar
      doc.fontSize(12).font("Helvetica-Bold").text("Desafios a Trabalhar");
      doc.moveDown(0.2);
      data.challenges.forEach((challenge) => {
        doc.fontSize(11).font("Helvetica").text(`• ${normalizePdfText(challenge)}`);
      });
      doc.moveDown(0.5);

      // Recomendações
      doc.fontSize(12).font("Helvetica-Bold").text("Recomendações");
      doc.moveDown(0.2);
      data.recommendations.forEach((rec, index) => {
        doc.fontSize(11).font("Helvetica").text(`${index + 1}. ${normalizePdfText(rec)}`);
      });
      doc.moveDown(0.5);

      // Próximo Passo
      doc.fontSize(12).font("Helvetica-Bold").text("Próximo Passo");
      doc.moveDown(0.2);
      data.nextSteps.forEach((step) => {
        doc.fontSize(11).font("Helvetica").text(normalizePdfText(step), {
          align: "justify",
        });
      });
      doc.moveDown(1);

      // Rodapé
      doc.fontSize(9).font("Helvetica").text(
        "Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.",
        {
          align: "center",
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}


export interface DevocionalData {
  profileName: string;
  profileDescription: string;
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  userResponses?: Record<string, any> | null;
}

export async function generateDevocionalPDF(
  data: DevocionalData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Título
      doc.fontSize(20).font("Helvetica-Bold").text("Seu Devocional Personalizado");
      doc.moveDown(0.3);

      // Nome do perfil
      doc.fontSize(16).font("Helvetica-Bold").text(normalizePdfText(data.profileName));
      doc.moveDown(0.5);

      // Introdução baseada no diagnóstico
      doc.fontSize(11).font("Helvetica").text(normalizePdfText(data.profileDescription), {
        align: "justify",
      });
      doc.moveDown(0.5);

      // Seção de Reflexão Bíblica
      doc.fontSize(12).font("Helvetica-Bold").text("Reflexão Bíblica para Sua Jornada");
      doc.moveDown(0.2);
      doc.fontSize(11).font("Helvetica").text(
        "A Bíblia nos oferece orientação e conforto em cada fase da vida espiritual. Aqui estão passagens e reflexões especialmente selecionadas para sua situação atual:",
        { align: "justify" }
      );
      doc.moveDown(0.5);

      // Desafios e Respostas Bíblicas
      doc.fontSize(12).font("Helvetica-Bold").text("Seus Desafios e Respostas Bíblicas");
      doc.moveDown(0.2);
      data.challenges.forEach((challenge, index) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${normalizePdfText(challenge)}`);
        doc.fontSize(10).font("Helvetica").text(
          "Deus está com você neste desafio. Busque força na oração e na Palavra.",
          { align: "justify" }
        );
        doc.moveDown(0.3);
      });
      doc.moveDown(0.3);

      // Recomendações Práticas
      doc.fontSize(12).font("Helvetica-Bold").text("Passos Práticos para Sua Caminhada");
      doc.moveDown(0.2);
      data.recommendations.forEach((rec, index) => {
        doc.fontSize(11).font("Helvetica").text(`${index + 1}. ${normalizePdfText(rec)}`);
      });
      doc.moveDown(0.5);

      // Próximo Passo
      doc.fontSize(12).font("Helvetica-Bold").text("Seu Próximo Passo com Deus");
      doc.moveDown(0.2);
      data.nextSteps.forEach((step) => {
        doc.fontSize(11).font("Helvetica").text(normalizePdfText(step), {
          align: "justify",
        });
      });
      doc.moveDown(1);

      // Oração de Encerramento
      doc.fontSize(12).font("Helvetica-Bold").text("Oração para Hoje");
      doc.moveDown(0.2);
      doc.fontSize(10).font("Helvetica-Oblique").text(
        '"Senhor, obrigado por conhecer cada detalhe da minha vida. Ajuda-me a confiar em Ti nesta fase. Que eu possa experimentar Tua presença, Teu conforto e Tua direção. Em Jesus, Amém."',
        { align: "center" }
      );
      doc.moveDown(1);

      // Rodapé
      doc.fontSize(9).font("Helvetica").text(
        "Este devocional foi criado especialmente para você, baseado em suas respostas e em fundamentos bíblicos cristãos evangélicos. Que Deus abençoe sua caminhada.",
        {
          align: "center",
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
