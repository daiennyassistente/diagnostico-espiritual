import { generateDevotionalPDF } from "./server/devotional-generator";
import fs from "fs";

const sampleRequest = {
  profileName: "Alma em Busca de Renovação",
  profileDescription: "Você demonstra fome sincera de voltar para Deus, mas suas respostas mostram oscilação, culpa acumulada e uma necessidade urgente de reencontrar constância em Jesus.",
  challenges: ["Culpa e instabilidade espiritual", "Rotina bíblica irregular", "Dificuldade em manter constância"],
  recommendations: [
    "Separe 10 minutos diários para Palavra e oração com constância",
    "Confesse com sinceridade o que tem afastado você de Deus",
    "Busque comunhão com outros cristãos para encorajamento"
  ],
  strengths: ["Você ainda reconhece sua necessidade de Deus", "Há sinceridade no desejo de recomeçar"],
  nextSteps: ["Retomar uma rotina simples com Deus", "Buscar firmeza em Cristo diariamente"],
  userName: "Maria",
  responses: {
    step1: "Maria",
    step2: "Distante de Deus e querendo voltar",
    step3: "Distrações e culpa pelo que deixei acumular",
    step4: "Leio a Bíblia sem constância",
    step5: "Quase não consigo manter uma vida de oração",
    step6: "Sinto falta de paz e da presença de Deus",
    step7: "Deus está tratando minha ansiedade e minha autossabotagem",
    step8: "Quero voltar a caminhar perto de Jesus",
    step9: "10 minutos por dia",
    step10: "Minha maior dificuldade é permanecer constante",
    step11: "Em recomeço, mas com medo de falhar de novo",
    step12: "Tenho vergonha de ter esfriado tanto e quero reencontrar Jesus"
  }
};

(async () => {
  try {
    const pdfBuffer = await generateDevotionalPDF(sampleRequest);
    fs.writeFileSync("/tmp/diagnostico-exemplo.pdf", pdfBuffer);
    console.log("✅ PDF gerado com sucesso!");
    console.log("📄 Tamanho:", pdfBuffer.length, "bytes");
    console.log("📁 Salvo em: /tmp/diagnostico-exemplo.pdf");
  } catch (error) {
    console.error("❌ Erro ao gerar PDF:", error);
  }
})();
