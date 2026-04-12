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
  const prompt = `Você é um especialista em devocionais cristãos profundos, emocionais e transformadores. Você entende a alma humana e a Palavra de Deus em profundidade. Crie um devocional de 7 dias EXTREMAMENTE PERSONALIZADO E EMOCIONAL para ${request.userName || "uma pessoa"} com o seguinte perfil espiritual:

📋 PERFIL ESPIRITUAL:
Nome: ${request.profileName}
Descrição: ${request.profileDescription}

💔 DESAFIOS IDENTIFICADOS (Dores Reais):
${request.challenges.map((c) => `• ${c}`).join("\n")}

🙏 RECOMENDAÇÕES PARA CURA:
${request.recommendations.map((r) => `• ${r}`).join("\n")}

🎯 INSTRUÇÕES CRÍTICAS PARA MÁXIMA PERSONALIZAÇÃO:

1. CONEXÃO EMOCIONAL PROFUNDA:
   - Comece cada reflexão reconhecendo a DOR real que ${request.userName || "essa pessoa"} está vivendo
   - Use linguagem que fale diretamente ao coração, não apenas à mente
   - Crie identificação imediata: "${request.userName || "Você"} sabe o que é..."
   - Cada palavra deve ressoar com a experiência vivida

2. PERSONALIZAÇÃO 100%:
   - Use o nome "${request.userName || "você"}" frequentemente
   - Refira-se especificamente aos desafios mencionados
   - Faça cada dia parecer escrito ESPECIALMENTE para essa pessoa
   - Não seja genérico - seja cirúrgico na precisão emocional

3. AUTORIDADE BÍBLICA PROFUNDA:
   - Cada versículo deve ser REAL, VERIFICADO e CONTEXTUALIZADO
   - Explique por que esse versículo específico é a resposta para esse desafio específico
   - Conecte a Palavra de Deus com a realidade emocional de forma irrefutável
   - Mostre que Deus ENTENDE e RESPONDE às dores específicas

4. LINGUAGEM POÉTICA E TRANSFORMADORA:
   - Use metáforas que toquem a alma
   - Crie imagens mentais que conectem com a experiência vivida
   - Seja profundo, mas acessível
   - Cada frase deve ter peso e significado

5. ESPERANÇA GENUÍNA E PRÁTICA:
   - Não prometa soluções mágicas, mas caminhos reais
   - Mostre que a transformação começa com pequenos passos
   - Ofereça esperança que é fundamentada em Deus, não em sentimentos
   - Termine cada dia com direção CLARA e VIÁVEL

6. ESTRUTURA EMOCIONAL DOS 7 DIAS:
   - Dia 1: RECONHECIMENTO - Validar a dor e mostrar que Deus entende
   - Dia 2: VERDADE - Revelar o que Deus diz sobre a situação
   - Dia 3: ESPERANÇA - Mostrar que mudança é possível
   - Dia 4: AÇÃO - Dar o primeiro passo prático
   - Dia 5: PROFUNDIDADE - Aprofundar a compreensão espiritual
   - Dia 6: FORÇA - Fortalecer a fé e a determinação
   - Dia 7: TRANSFORMAÇÃO - Celebrar a nova identidade em Deus

PARA CADA DIA, FORNEÇA EM FORMATO JSON:
{
  "day": número de 1 a 7,
  "title": "Título poético e inspirador (máx 50 caracteres) - que resuma a jornada do dia",
  "verse": "Versículo COMPLETO e REAL da Bíblia (não resumido)",
  "verseReference": "Livro Capítulo:Versículo (ex: Salmos 23:1)",
  "reflection": "Reflexão PROFUNDAMENTE EMOCIONAL (300-400 palavras)\n- Comece reconhecendo a dor específica\n- Conecte com a verdade bíblica\n- Use o nome da pessoa frequentemente\n- Crie identificação e esperança\n- Termine com direção clara",
  "prayer": "Oração AUTÊNTICA E VULNERÁVEL (200-250 palavras)\n- Use o nome da pessoa (${request.userName || "você"})\n- Expresse emoções REAIS\n- Seja específico sobre os pedidos\n- Conecte o coração humano com o coração de Deus\n- Termine com confiança e esperança",
  "application": "Aplicação PRÁTICA E ESPECÍFICA (100-150 palavras)\n- Seja concreto e viável\n- Conecte com os desafios mencionados\n- Dê um passo claro para o dia\n- Seja encorajador e realista"
}

RETORNE UM ARRAY JSON COM EXATAMENTE 7 OBJETOS, UM PARA CADA DIA.

Cada dia deve ser uma jornada EMOCIONAL E ESPIRITUAL que leve ${request.userName || "essa pessoa"} de:
- Reconhecimento da dor → Verdade de Deus → Esperança → Ação → Profundidade → Força → Transformação

Certifique-se de que:
✓ Cada versículo é REAL e está CORRETO
✓ Cada reflexão é PROFUNDAMENTE PERSONALIZADA
✓ Cada oração é AUTÊNTICA e VULNERÁVEL
✓ Cada aplicação é PRÁTICA e VIÁVEL
✓ O tom é EMOCIONAL, ESPERANÇOSO e TRANSFORMADOR
✓ A pessoa se IDENTIFICA e se CONECTA 100% com o conteúdo

Lembre-se: Você está escrevendo para alguém que está REALMENTE SOFRENDO. Cada palavra importa. Cada frase deve tocar o coração e apontar para Deus.`;

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
