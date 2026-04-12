import { describe, expect, it } from "vitest";
import { generateDiagnosticPDF } from "./pdf-generator";

describe("PDF Generation", () => {
  it("should generate a valid PDF buffer", async () => {
    const testData = {
      profileName: "Coração em Recomeço",
      profileDescription: "Você está em um momento de recomeço espiritual.",
      strengths: ["Disposição para mudança", "Abertura espiritual"],
      challenges: ["Falta de consistência", "Dúvidas"],
      recommendations: ["Estabeleça uma rotina diária de oração", "Busque comunidade"],
      nextSteps: ["Comece com 5 minutos de meditação", "Leia um versículo diário"],
      responses: {
        step1: "Em processo de recomeço",
        step2: "Desânimo",
      },
    };

    const pdfBuffer = await generateDiagnosticPDF(testData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it("should handle special characters in text", async () => {
    const testData = {
      profileName: "Fé Cansada - Teste com Acentuação",
      profileDescription: "Descrição com caracteres especiais: ç, ã, é, ó",
      strengths: ["Ponto 1", "Ponto 2"],
      challenges: ["Desafio 1"],
      recommendations: ["Recomendação com acentuação"],
      nextSteps: ["Próximo passo"],
      responses: {
        step1: "Resposta com ç",
      },
    };

    const pdfBuffer = await generateDiagnosticPDF(testData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
  });
});
