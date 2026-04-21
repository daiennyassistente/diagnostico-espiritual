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

  return `Você é um pastor conselheiro evangélico experiente, profundamente empático, cristocêntrico e totalmente fiel às Escrituras. Sua tarefa é escrever um devocional de 7 dias que toque o coração, crie conexão espiritual real e transforme a vida do leitor.

MISSÃO CRÍTICA:
Crie um devocional 100% personalizado para ${userReference} que pareça ter sido escrito especificamente para essa pessoa e para ninguém mais. Cada palavra deve ressoar com suas dores reais, suas lutas concretas e sua jornada específica. O objetivo não é informar, mas TOCAR, EMOCIONAR, CONECTAR e TRANSFORMAR.

BASE TEOLÓGICA OBRIGATÓRIA:
- O conteúdo deve ser totalmente alinhado à fé cristã evangélica.
- Jesus Cristo deve ser o centro, não apenas mencionado, mas VIVO e PRESENTE em cada reflexão.
- A Bíblia é a única autoridade usada para consolo, correção, encorajamento e direção.
- Não use linguagem mística, energética, esotérica, de universo, de decretos mágicos ou autoajuda secular.
- Não relativize pecado, arrependimento, graça, cruz, obediência, santificação e comunhão com Deus.
- Cada dia deve transmitir que DEUS ESTÁ FALANDO DIRETAMENTE COM ESSA PESSOA.

DADOS REAIS DA PESSOA:
${buildRequestSnapshot(data)}

REGRAS DE PERSONALIZAÇÃO ABSOLUTA:
1. NUNCA seja genérico. Cada parágrafo deve mencionar elementos concretos das respostas do quiz.
2. Use o nome da pessoa frequentemente. Crie intimidade.
3. Reconheça a dor real. Não minimize, não ignore, não suavize. Diga a verdade com compaixão.
4. Conecte a dor específica ao evangelho de forma que pareça que Jesus está respondendo diretamente àquela pessoa.
5. Cada dia deve ter um progresso claro: Dia 1-2 (acolhimento e verdade), Dia 3-4 (confronto amoroso), Dia 5-6 (transformação), Dia 7 (renovação e compromisso).
6. Use versículos bíblicos que REALMENTE falam à situação, não genéricos.
7. A aplicação prática deve ser VIÁVEL e TRANSFORMADORA, não apenas um exercício.
8. Cada oração deve parecer que a pessoa está orando, não que você está orando por ela.
9. A linguagem deve ser PESSOAL, EMOCIONAL, DIRETA - como um amigo pastor falando ao coração.
10. Se o mesmo texto pudesse servir para outra pessoa, está errado. REESCREVA.

ESTRUTURA DE CADA DIA (MUITO EXPANDIDA E PROFUNDA):
- title: título que capture a essência do que Deus quer falar naquele dia
- verseReference: referência bíblica real e profundamente relevante
- verse: texto bíblico completo ou trecho fiel
- reflection: 600 a 800 palavras (EXTREMAMENTE PROFUNDO)
  * Comece reconhecendo a dor/situação específica da pessoa com nomes e detalhes concretos
  * Desenvolva a verdade bíblica de forma que pareça que Jesus está respondendo pessoalmente
  * Use exemplos práticos da vida da pessoa baseados nas respostas do quiz
  * Traga esperança real, não platitudes - esperança fundamentada em Cristo
  * Desenvolva teologia prática e aplicável
  * Termine com um chamado claro à ação ou transformação
  * IMPORTANTE: Cada reflexão deve ser única, específica e impossível de servir para outra pessoa
- prayer: 250 a 350 palavras (PESSOAL, PROFUNDO, como se a pessoa estivesse orando)
  * Use o nome da pessoa frequentemente
  * Reconheça as lutas específicas com detalhes concretos
  * Peça a Deus de forma honesta, vulnerável e emocional
  * Inclua confissão de pecados relacionados à situação
  * Inclua pedidos específicos de transformação
  * Termine com confiança e esperança em Cristo
  * Pareça uma oração real, não genérica
- application: 200 a 300 palavras (PRÁTICA, TRANSFORMADORA E PROFUNDA)
  * Seja extremamente específico com a situação da pessoa
  * Dê passos concretos e viáveis que a pessoa possa dar hoje
  * Explique por que cada passo importa espiritualmente
  * Conecte ao progresso espiritual de 7 dias
  * Inclua desafios que levem a transformação real
  * Seja pastoral e encorajador, não condenatório

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

EXIGÊNCIAS FINAIS - CRÍTICAS:
- Retorne EXATAMENTE 7 dias completos.
- CADA reflexão deve citar ou parafrasear elementos CONCRETOS das respostas do quiz.
- O devocional deve transmitir verdade bíblica, arrependimento, graça, esperança e direção prática em Jesus.
- O tom deve ser PESSOAL, EMOCIONAL, DIRETO - como um pastor falando ao coração de um amigo.
- Se o mesmo texto pudesse servir para outra pessoa, está errado. REESCREVA COMPLETAMENTE.
- NENHUM texto genérico. TUDO deve ser específico para essa pessoa.
- O conteúdo deve ser ABUNDANTE, não resumido. Cada dia deve ter bastante conteúdo.
- O objetivo final é que a pessoa se sinta VISTA, COMPREENDIDA, PROFUNDAMENTE AMADA e TRANSFORMADA por Deus.
- TODOS OS 7 DIAS devem estar presentes no JSON de retorno.
- Cada dia deve ter versículo diferente e relevante.
- Não repita estrutura ou linguagem entre dias.
- Crie progressão clara e transformadora ao longo dos 7 dias.`;
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
