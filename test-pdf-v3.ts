import { generateDevotionalPDF } from "./server/devotional-generator-v2";
import fs from "fs";

async function test() {
  console.log("Iniciando teste de geração de PDF v3...");
  
  const request = {
    profileName: "🌱 Coração em Recomeço",
    profileEmoji: "🌱",
    profileDescription: "Você está em um momento de renovação espiritual. Existe dentro de você um desejo verdadeiro de voltar ao secreto, reconstruir sua constância e se aproximar de Deus com mais leveza e sinceridade.",
    challenges: ["Manter constância", "Superar culpa ou frustração", "Voltar à rotina espiritual com paz"],
    recommendations: ["Separe alguns minutos diários para oração simples", "Recomece pela Palavra com metas pequenas", "Busque apoio espiritual de alguém maduro na fé"],
    userName: "Teste Manus"
  };

  try {
    const pdfBuffer = await generateDevotionalPDF(request);
    fs.writeFileSync("test-devocional-v3.pdf", pdfBuffer);
    console.log("PDF gerado com sucesso: test-devocional-v3.pdf");
  } catch (error) {
    console.error("Erro no teste de PDF:", error);
  }
}

test();
