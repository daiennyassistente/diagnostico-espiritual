import "dotenv/config";
import { generateDevotionalContent } from "./server/devotional-generator-v2";

async function test() {
  console.log("Iniciando teste de geração de conteúdo OpenAI...");
  
  const request = {
    profileName: "🌱 Coração em Recomeço",
    profileEmoji: "🌱",
    profileDescription: "Você está em um momento de renovação espiritual. Existe dentro de você um desejo verdadeiro de voltar ao secreto, reconstruir sua constância e se aproximar de Deus com mais leveza e sinceridade.",
    challenges: ["Manter constância", "Superar culpa ou frustração", "Voltar à rotina espiritual com paz"],
    recommendations: ["Separe alguns minutos diários para oração simples", "Recomece pela Palavra com metas pequenas", "Busque apoio espiritual de alguém maduro na fé"],
    userName: "Teste Manus"
  };

  try {
    const content = await generateDevotionalContent(request);
    console.log("Conteúdo gerado com sucesso!");
    console.log(JSON.stringify(content, null, 2));
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

test();
