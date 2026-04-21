import { invokeLLM } from "./_core/llm";
import { generatePremiumDevotionalPDF } from "./pdf-generator-premium";

interface DiagnosticData {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
  userName: string;
  responses?: Record<string, string>;
}

interface GeneratedDay {
  day: number;
  title: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  application: string;
}

const QUIZ_QUESTION_LABELS: Record<number, string> = {
  0: "Qual é o seu nome?",
  1: "Como você se sente espiritualmente hoje?",
  2: "O que mais tem dificultado sua constância com Deus?",
  3: "Como está sua rotina com a Palavra?",
  4: "Como você descreveria sua vida de oração hoje?",
  5: "O que você mais sente falta hoje na sua vida com Deus?",
  6: "O que você sente que mais tem sido tratado em você nessa fase?",
  7: "O que você mais deseja viver com Deus agora?",
  8: "Quanto tempo por dia você consegue dedicar com intencionalidade?",
  9: "Qual é sua maior dificuldade?",
  10: "Como você se descreve espiritualmente neste momento?",
  11: "Algo que você queira acrescentar ou desabafar?",
};

const getResponseValue = (responses: Record<string, string>, zeroIndexKey: number, stepKey: string) => {
  return responses[String(zeroIndexKey)] || responses[stepKey] || "";
};

const getFirstName = (userName: string) => {
  if (!userName) return "";
  return userName.split(/\s+/).filter(Boolean)[0] || "";
};

const buildResponsesContext = (responses: Record<string, string>) => {
  return Object.entries(QUIZ_QUESTION_LABELS)
    .map(([index, question]) => {
      const numericIndex = Number(index);
      const answer = getResponseValue(responses, numericIndex, `step${numericIndex + 1}`) || "Não respondido";
      return `Pergunta ${numericIndex + 1}: ${question}\nResposta: ${answer}`;
    })
    .join("\n\n");
};

const buildRequestSnapshot = (data: DiagnosticData) => {
  const responses = data.responses || {};
  const responsesText = buildResponsesContext(responses);
  const strengthsText = data.strengths?.length ? data.strengths.map((item) => `- ${item}`).join("\n") : "- Não informado";
  const challengesText = data.challenges.length ? data.challenges.map((item) => `- ${item}`).join("\n") : "- Não informado";
  const recommendationsText = data.recommendations.length
    ? data.recommendations.map((item) => `- ${item}`).join("\n")
    : "- Não informado";
  const nextStepsText = data.nextSteps?.length ? data.nextSteps.map((item) => `- ${item}`).join("\n") : "- Não informado";

  return `RESULTADO ESPIRITUAL CONSOLIDADO:
Perfil identificado: ${data.profileName}
Descrição do resultado: ${data.profileDescription}
Forças percebidas:
${strengthsText}

Desafios percebidos:
${challengesText}

Recomendações do diagnóstico:
${recommendationsText}

Próximos passos sugeridos:
${nextStepsText}

RESPOSTAS COMPLETAS DO QUIZ:
${responsesText}`;
};

function buildDevotionalPrompt(data: DiagnosticData): string {
  const firstName = getFirstName(data.userName);
  const userReference = firstName || "essa pessoa";

  return `Você é um pastor conselheiro evangélico experiente, cristocêntrico e totalmente fiel às Escrituras. Sua tarefa é escrever um devocional de 7 dias com tom pastoral, bíblico, acolhedor e profundamente pessoal.

MISSÃO:
Crie um devocional 100% personalizado para ${userReference}, usando OBRIGATORIAMENTE as respostas reais do quiz e o resultado espiritual consolidado abaixo. O conteúdo precisa soar como algo escrito especificamente para essa pessoa e para ninguém mais.

BASE TEOLÓGICA OBRIGATÓRIA:
- O conteúdo deve ser totalmente alinhado à fé cristã evangélica.
- Jesus Cristo deve ser o centro da esperança, da interpretação e da aplicação.
- A Bíblia é a única autoridade usada para consolo, correção, encorajamento e direção.
- Não use linguagem mística, energética, esotérica, de universo, de decretos mágicos ou autoajuda secular.
- Não relativize pecado, arrependimento, graça, cruz, obediência, santificação e comunhão com Deus.

DADOS REAIS DA PESSOA:
${buildRequestSnapshot(data)}

REGRAS DE PERSONALIZAÇÃO ABSOLUTA:
1. Cada dia deve mencionar evidências concretas das respostas e do resultado; nunca escreva algo que poderia servir para qualquer pessoa.
2. Traga conexões explícitas entre a dor relatada, o estado espiritual identificado e a esperança encontrada em Cristo.
3. Leve em conta o tempo diário disponível informado pela pessoa ao propor aplicações práticas.
4. Se houver desabafo final, trate-o como pista decisiva da dor principal.
5. Mostre um progresso pastoral em 7 dias: acolhimento, verdade bíblica, arrependimento, descanso em Cristo, prática diária, perseverança e renovação.
6. Use versículos bíblicos reais e coerentes com o tema do dia.
7. Não invente experiências que a pessoa não relatou.
8. O texto deve ser íntimo, pastoral e bíblico, mas claro e direto.

ESTRUTURA DE CADA DIA:
- title: título curto e pastoral do dia
- verseReference: referência bíblica real
- verse: texto bíblico completo ou trecho fiel suficiente para o uso devocional
- reflection: 180 a 260 palavras, sempre conectando as respostas do quiz ao evangelho de Jesus
- prayer: 90 a 160 palavras, oração cristã evangélica em nome de Jesus, coerente com o dia
- application: 60 a 120 palavras, passo prático viável para hoje, considerando o tempo e a fase espiritual da pessoa

FORMATO DE SAÍDA:
Retorne JSON VÁLIDO no formato:
{
  "days": [
    {
      "day": 1,
      "title": "...",
      "verseReference": "...",
      "verse": "...",
      "reflection": "...",
      "prayer": "...",
      "application": "..."
    }
  ]
}

EXIGÊNCIAS FINAIS:
- Retorne exatamente 7 dias.
- Cada reflexão deve citar ou parafrasear claramente elementos concretos das respostas.
- O devocional deve transmitir verdade bíblica, arrependimento, graça e direção prática em Jesus.
- Se o mesmo texto pudesse servir para outra pessoa com respostas diferentes, então sua resposta está errada.`;
}

export async function generateDevotionalWithPDF(data: DiagnosticData): Promise<Buffer> {
  try {
    console.log(`[Devotional PDF] Iniciando geração de devocional personalizado para ${data.userName}`);

    // Gerar conteúdo do devocional com IA
    const prompt = buildDevotionalPrompt(data);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em gerar devocionais cristãos personalizados. Sempre retorne JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "devotional_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    verseReference: { type: "string" },
                    verse: { type: "string" },
                    reflection: { type: "string" },
                    prayer: { type: "string" },
                    application: { type: "string" },
                  },
                  required: ["day", "title", "verseReference", "verse", "reflection", "prayer", "application"],
                  additionalProperties: false,
                },
              },
            },
            required: ["days"],
            additionalProperties: false,
          },
        },
      },
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Nenhuma resposta recebida da IA");
    }

    const parsedResponse = JSON.parse(responseText);
    const days = parsedResponse.days || [];

    console.log(`[Devotional PDF] Devocional gerado com ${days.length} dias`);

    // Gerar PDF com design profissional
    const pdfBuffer = await generatePremiumDevotionalPDF({
      userName: data.userName,
      profileName: data.profileName,
      profileDescription: data.profileDescription,
      strengths: data.strengths,
      challenges: data.challenges,
      recommendations: data.recommendations,
      nextSteps: data.nextSteps,
      days,
    });

    console.log(`[Devotional PDF] PDF gerado com sucesso (${pdfBuffer.length} bytes)`);
    return pdfBuffer;
  } catch (error) {
    console.error("[Devotional PDF] Erro ao gerar devocional com PDF:", error);
    throw error;
  }
}

export async function generateDevotionalPDFFromDays(data: DiagnosticData, days: GeneratedDay[]): Promise<Buffer> {
  try {
    console.log(`[Devotional PDF] Gerando PDF com ${days.length} dias pré-gerados`);

    const pdfBuffer = await generatePremiumDevotionalPDF({
      userName: data.userName,
      profileName: data.profileName,
      profileDescription: data.profileDescription,
      strengths: data.strengths,
      challenges: data.challenges,
      recommendations: data.recommendations,
      nextSteps: data.nextSteps,
      days,
    });

    console.log(`[Devotional PDF] PDF gerado com sucesso (${pdfBuffer.length} bytes)`);
    return pdfBuffer;
  } catch (error) {
    console.error("[Devotional PDF] Erro ao gerar PDF:", error);
    throw error;
  }
}
