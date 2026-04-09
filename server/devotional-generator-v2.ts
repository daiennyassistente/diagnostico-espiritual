import { invokeLLM } from "./_core/llm";
import { generatePDFStream, PDFInput, PDFDay } from "./pdf-designer-v3";
import type { PDFDay as PDFDayType } from "./pdf-designer-v3";

interface DevotionalRequest {
  profileName: string;
  profileEmoji: string;
  profileDescription: string;
  challenges: string[];
  recommendations: string[];
  userName?: string;
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

/**
 * Gera um devocional de 7 dias personalizado usando OpenAI
 * OpenAI gera APENAS os textos (versículos, reflexões, orações, aplicações)
 * O designer (pdf-designer.ts) cuida de toda a formatação visual
 */
async function generateDevotionalPDF(request: DevotionalRequest): Promise<Buffer> {
  try {
    // ===== PASSO 1: Gerar conteúdo com OpenAI =====
    const devotionalContent = await generateDevotionalContent(request);

    // ===== PASSO 2: Usar o designer para criar o PDF =====
    const pdfInput: PDFInput = {
      profileName: request.profileName,
      profileEmoji: request.profileEmoji,
      profileDescription: request.profileDescription,
      days: devotionalContent,
      userName: request.userName,
      generatedDate: new Date(),
    };

    const pdfBuffer = await generatePDFStream(pdfInput);
    return pdfBuffer;
  } catch (error) {
    console.error("Erro ao gerar devocional:", error);
    throw error;
  }
}

/**
 * Usa OpenAI para gerar os 7 dias de conteúdo devocional
 * Retorna apenas os textos - o design é responsabilidade do pdf-designer.ts
 */
async function generateDevotionalContent(request: DevotionalRequest): Promise<PDFDay[]> {
  const prompt = `Você é um especialista em devocionais cristãos profundos e emocionais. Crie um devocional de 7 dias ALTAMENTE PERSONALIZADO para ${request.userName || "uma pessoa"} com o seguinte perfil espiritual:

Perfil Espiritual: ${request.profileName}
Descrição: ${request.profileDescription}

Desafios identificados:
${request.challenges.map((c) => `- ${c}`).join("\n")}

Recomendações:
${request.recommendations.map((r) => `- ${r}`).join("\n")}

Crie um devocional de 7 dias que seja:
1. PROFUNDAMENTE EMOCIONAL E SENTIMENTAL - Que toque o coração e a alma
2. ALTAMENTE PERSONALIZADO - Use o nome "${request.userName || "você"}" ao se dirigir à pessoa
3. BIBLICAMENTE SÓLIDO - Baseado em versículos reais e contexto bíblico
4. CONECTADO COM OS DESAFIOS REAIS - Aborde especificamente os desafios mencionados
5. ESPERANÇOSO E TRANSFORMADOR - Ofereça esperança genuína e caminhos práticos
6. COM LINGUAGEM POÉTICA E PROFUNDA - Use metáforas, analogias e linguagem que toque a alma

Cada reflexão deve:
- Começar com empatia genuína sobre o que a pessoa está vivendo
- Conectar a verdade bíblica com a realidade emocional
- Usar linguagem que crie identificação e conexão
- Terminar com esperança e direção clara

Cada oração deve:
- Ser autêntica e vulnerável
- Usar o nome da pessoa (${request.userName || "você"})
- Expressar emoções reais e pedidos genuínos
- Conectar o coração da pessoa com o coração de Deus

Para cada dia, forneça em formato JSON:
{
  "day": número de 1 a 7,
  "title": "Título do dia (máx 50 caracteres) - seja poético e inspirador",
  "verse": "Versículo completo da Bíblia",
  "verseReference": "Livro Capítulo:Versículo",
  "reflection": "Reflexão profunda e emocional (250-350 palavras) - deve tocar o coração",
  "prayer": "Oração autêntica e vulnerável (150-200 palavras) - use o nome da pessoa",
  "application": "Aplicação prática para o dia (80-120 palavras) - seja específico e viável"
}

Retorne um array JSON com 7 objetos, um para cada dia. Cada dia deve ser uma jornada emocional e espiritual que leve ${request.userName || "a pessoa"} mais perto de Deus. Certifique-se de que cada versículo é real e está correto.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em criar devocionais cristãos personalizados. Sempre retorna JSON válido com exatamente 7 dias de conteúdo.",
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
                    verse: { type: "string" },
                    verseReference: { type: "string" },
                    reflection: { type: "string" },
                    prayer: { type: "string" },
                    application: { type: "string" },
                  },
                  required: ["day", "title", "verse", "verseReference", "reflection", "prayer", "application"],
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

    // Parse da resposta JSON
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da OpenAI");
    }

    // Converter content para string se necessário
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    // Validar que temos exatamente 7 dias
    if (!parsed.days || parsed.days.length !== 7) {
      throw new Error(`Esperado 7 dias, recebido ${parsed.days?.length || 0}`);
    }

    // Mapear para o tipo PDFDay
    const days: PDFDayType[] = parsed.days.map((day: any) => ({
      day: day.day,
      title: day.title,
      verse: day.verse,
      verseReference: day.verseReference,
      reflection: day.reflection,
      prayer: day.prayer,
      application: day.application,
    }));

    return days;
  } catch (error) {
    console.error("Erro ao gerar conteúdo com OpenAI:", error);
    throw error;
  }
}

export { generateDevotionalPDF, generateDevotionalContent, DevotionalRequest };
