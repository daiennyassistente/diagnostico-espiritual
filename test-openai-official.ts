import { OpenAI } from "openai";

async function test() {
  console.log("Iniciando teste com biblioteca OpenAI oficial...");
  
  const client = new OpenAI(); // Usa as variáveis de ambiente pré-configuradas

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Você é um assistente útil." },
        { role: "user", content: "Olá, como você está?" }
      ]
    });
    
    console.log("Resposta recebida:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

test();
