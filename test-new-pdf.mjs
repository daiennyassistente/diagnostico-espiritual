import { generateDevotionalPDF } from "./dist/server/devotional-generator-v2.js";

const testRequest = {
  profileName: "Buscador Sedento",
  profileEmoji: "🌱",
  profileDescription: "Você é uma alma sedenta por mais de Deus, com um desejo genuíno de amadurecer na fé.",
  challenges: ["Cansaço espiritual", "Falta de constância"],
  recommendations: ["Meditar na Palavra diariamente", "Buscar comunidade cristã"],
  userName: "Teste User",
};

try {
  console.log("Gerando PDF com novo designer...");
  const pdfBuffer = await generateDevotionalPDF(testRequest);
  console.log(`✅ PDF gerado com sucesso! Tamanho: ${pdfBuffer.length} bytes`);
  
  // Salvar para visualização
  import("fs").then(({ writeFileSync }) => {
    writeFileSync("/home/ubuntu/test-devocional.pdf", pdfBuffer);
    console.log("✅ PDF salvo em: /home/ubuntu/test-devocional.pdf");
  });
} catch (error) {
  console.error("❌ Erro ao gerar PDF:", error.message);
  process.exit(1);
}
