import { describe, it, expect } from "vitest";
import { generatePremiumDevotionalPDF } from "./pdf-generator-premium";
import { writeFileSync } from "fs";
import { join } from "path";

describe("Premium PDF Generator", () => {
  const testContent = {
    userName: "João Silva",
    profileName: "Espiritualmente em Reconstrução",
    profileDescription:
      "Você está em uma fase de reconstrução espiritual, buscando reestabelecer sua intimidade com Deus após um período de distância.",
    strengths: [
      "Consciência da necessidade de Deus",
      "Disposição para mudança",
      "Fé resiliente mesmo em dificuldades",
    ],
    challenges: [
      "Constância na vida de oração",
      "Rotina irregular com a Palavra",
      "Dificuldade em manter disciplina espiritual",
    ],
    recommendations: [
      "Estabeleça uma rotina diária simples de leitura bíblica",
      "Comece com orações breves mas sinceras",
      "Busque comunhão com outros cristãos",
    ],
    nextSteps: [
      "Dedique 10 minutos diários à leitura da Bíblia",
      "Participe de um grupo de oração ou estudo bíblico",
      "Registre suas reflexões e orações",
    ],
    days: [
      {
        day: 1,
        title: "Jesus vê sua fase atual",
        verseReference: "Mateus 11:28",
        verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
        reflection:
          "João, o que você respondeu mostra que hoje você se percebe em uma fase de reconstrução. Isso não é detalhe. Existe um cansaço real por trás da dificuldade em sua constância com Deus, de sua rotina irregular com a Palavra e de sua vida de oração que precisa ser fortalecida.",
        prayer:
          "Senhor Jesus, eu me aproximo de Ti como estou, sem esconder meu cansaço e minhas falhas. Tu conheces a fase em que me encontro e vês como tenho lutado com a dificuldade em minha constância com Deus.",
        application:
          "Separe hoje um tempo para fazer apenas duas coisas: releia Mateus 11:28 em voz baixa três vezes e depois fale com Jesus com honestidade total sobre seu cansaço.",
      },
      {
        day: 2,
        title: "A verdade corrige sua alma",
        verseReference: "Salmos 119:105",
        verse: "Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos.",
        reflection:
          "Uma das marcas mais claras das suas respostas é que sua caminhada tem sofrido com uma rotina irregular com a Palavra. Quando a Palavra perde espaço, o coração fica mais vulnerável ao medo, à distração e à oscilação.",
        prayer:
          "Pai, eu reconheço que preciso voltar a dar lugar à Tua Palavra. Muitas vezes minha mente tem sido ocupada por preocupações, distrações e pensamentos que me afastam da verdade.",
        application:
          "Hoje escolha um único trecho bíblico para meditar sem pressa: Salmos 119:105. Anote em uma frase onde sua vida está sem luz neste momento.",
      },
    ],
  };

  it("should generate a valid PDF buffer", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate a PDF with reasonable size", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);

    // PDF should be at least 5KB (reasonable for a multi-page document)
    expect(pdfBuffer.length).toBeGreaterThan(5000);
    // PDF should not be unreasonably large (less than 10MB)
    expect(pdfBuffer.length).toBeLessThan(10000000);
  });

  it("should generate a PDF with correct structure", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);

    // Check PDF header
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");

    // Check PDF footer
    const pdfEnd = pdfBuffer.toString("utf8", -10);
    expect(pdfEnd).toContain("%%EOF");
  });

  it("should generate a multi-page PDF", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);
    const pdfText = pdfBuffer.toString("utf8");

    // Check if PDF has multiple pages
    expect(pdfText).toContain("/Count");
    expect(pdfText).toContain("/Type /Pages");
  });

  it("should generate a PDF with fonts embedded", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);
    const pdfText = pdfBuffer.toString("utf8");

    // Check if fonts are embedded
    expect(pdfText).toContain("/Helvetica");
    expect(pdfText).toContain("/Font");
  });

  it("should save a sample PDF for inspection", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);

    // Save to a file for manual inspection
    const outputPath = join(process.cwd(), "test-devotional-sample.pdf");
    writeFileSync(outputPath, pdfBuffer);

    console.log(`Sample PDF saved to: ${outputPath}`);
    console.log(`PDF size: ${pdfBuffer.length} bytes`);

    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
