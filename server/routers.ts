import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createDiagnosticHistoryEntry,
  createLead,
  createQuizResponse,
  getAdminBuyers,
  getAdminDashboardSummary,
  getAdminDiagnosticResults,
  getAdminSnapshot,
  getAdminUsers,
  getAllQuizResponses,
  getResponseStatistics,
} from "./db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export interface DiagnosticResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

const getResponseValue = (responses: Record<string, string>, zeroIndexKey: number, stepKey: string) => {
  return responses[String(zeroIndexKey)] || responses[stepKey] || "";
};

export const buildFallbackDiagnosis = (responses: Record<string, string>): DiagnosticResult => {
  const step1 = getResponseValue(responses, 0, "step1");
  const step3 = getResponseValue(responses, 2, "step3");
  const step4 = getResponseValue(responses, 3, "step4");
  const step5 = getResponseValue(responses, 4, "step5");
  const step10 = getResponseValue(responses, 9, "step10");

  if (
    step10.includes("recomeçar") ||
    step10.includes("reconstrução") ||
    step1.includes("voltar") ||
    step1.includes("recomeço")
  ) {
    return {
      profileName: "🌱 Coração em Recomeço",
      profileDescription:
        "Você está em um momento de renovação espiritual. Existe dentro de você um desejo verdadeiro de voltar ao secreto, reconstruir sua constância e se aproximar de Deus com mais leveza e sinceridade.",
      strengths: [
        "Disposição para recomeçar",
        "Sensibilidade espiritual",
        "Humildade para reconhecer a necessidade de Deus",
      ],
      challenges: [
        "Manter constância",
        "Superar culpa ou frustração",
        "Voltar à rotina espiritual com paz",
      ],
      recommendations: [
        "Separe alguns minutos diários para oração simples",
        "Recomece pela Palavra com metas pequenas",
        "Busque apoio espiritual de alguém maduro na fé",
      ],
      nextSteps: ["Dê hoje um passo simples e consistente na sua caminhada com Deus."],
    };
  }

  if (step10.includes("cansada") || step5.includes("Paz") || step5.includes("paz")) {
    return {
      profileName: "😔 Fé Cansada",
      profileDescription:
        "Você ama a Deus, mas tem carregado um peso maior do que deveria. Seu coração precisa de descanso, cuidado e renovação para voltar a viver a presença de Deus com profundidade e paz.",
      strengths: [
        "Desejo de permanecer na fé",
        "Consciência de que precisa de cuidado",
        "História de caminhada com Deus",
      ],
      challenges: [
        "Cansaço emocional e espiritual",
        "Desânimo",
        "Dificuldade de manter energia espiritual",
      ],
      recommendations: [
        "Simplifique sua rotina devocional por alguns dias",
        "Escolha passagens bíblicas de descanso e esperança",
        "Ore com honestidade, sem tentar performar",
      ],
      nextSteps: ["Permita-se descansar em Deus antes de tentar acelerar novamente."],
    };
  }

  if (step10.includes("Travada") || step10.includes("travada") || step3.includes("parada")) {
    return {
      profileName: "🔗 Travada Espiritualmente",
      profileDescription:
        "Você sente que existe algo interrompendo seu avanço espiritual. Há sede de mudança, mas também bloqueios internos que precisam ser identificados e tratados com verdade, oração e constância.",
      strengths: ["Consciência do bloqueio", "Desejo real de mudança", "Potencial de transformação"],
      challenges: ["Romper ciclos repetitivos", "Retomar foco espiritual", "Vencer travas emocionais"],
      recommendations: [
        "Anote os padrões que mais te afastam de Deus",
        "Ore com objetividade sobre suas travas",
        "Busque aconselhamento cristão se possível",
      ],
      nextSteps: ["Seu próximo passo é identificar a raiz do que tem te paralisado."],
    };
  }

  if (
    step10.includes("Amadurecendo") ||
    step10.includes("amadurecendo") ||
    step3.includes("Frequente e profunda") ||
    step3.includes("frequente e profunda")
  ) {
    return {
      profileName: "🌳 Amadurecendo na Fé",
      profileDescription:
        "Você está em uma fase saudável de crescimento espiritual. Há sinais de profundidade, sede pela Palavra e disposição para viver uma caminhada mais consistente, madura e frutífera.",
      strengths: [
        "Constância crescente",
        "Desejo de profundidade",
        "Capacidade de amadurecer com propósito",
      ],
      challenges: ["Evitar acomodação", "Continuar avançando", "Manter sensibilidade espiritual"],
      recommendations: [
        "Aprofunde seu tempo de estudo bíblico",
        "Transforme constância em estilo de vida",
        "Sirva outras pessoas com aquilo que Deus já te ensinou",
      ],
      nextSteps: ["Continue crescendo com constância e intencionalidade diante de Deus."],
    };
  }

  if (step5.includes("Direção") || step5.includes("direção") || step1.includes("sem direção") || step10.includes("fome")) {
    return {
      profileName: "🧭 Buscando Direção",
      profileDescription:
        "Você tem fome de Deus e quer viver algo mais profundo, mas ainda sente falta de clareza para entender o próximo passo. Deus está trabalhando direção no meio da sua busca sincera.",
      strengths: ["Fome espiritual genuína", "Desejo de ouvir Deus", "Abertura para mudança"],
      challenges: [
        "Confusão sobre o próximo passo",
        "Ansiedade por respostas rápidas",
        "Dificuldade em discernir direção",
      ],
      recommendations: [
        "Separe tempo de silêncio e oração",
        "Leia a Bíblia buscando princípios de direção",
        "Evite decisões precipitadas enquanto busca clareza",
      ],
      nextSteps: [
        "Deus pode estar te guiando primeiro à clareza interior, antes da resposta externa.",
      ],
    };
  }

  if (
    step4.includes("instável") ||
    step4.includes("pouco constante") ||
    step3.includes("Irregular") ||
    step3.includes("irregular")
  ) {
    return {
      profileName: "📈 Fé Inconsistente",
      profileDescription:
        "Sua caminhada com Deus tem sido marcada por fases de aproximação e afastamento. Ainda assim, existe dentro de você um desejo verdadeiro de viver uma constância mais saudável e madura.",
      strengths: [
        "Desejo sincero de estar com Deus",
        "Consciência dos altos e baixos",
        "Capacidade de recomeçar",
      ],
      challenges: ["Falta de consistência", "Oscilações emocionais", "Dificuldade em manter disciplina"],
      recommendations: [
        "Crie uma rotina espiritual simples e realista",
        "Associe seu momento com Deus a um horário fixo",
        "Evite metas grandes demais no início",
      ],
      nextSteps: [
        "Pequenos passos consistentes vão te levar mais longe do que grandes promessas ocasionais.",
      ],
    };
  }

  return {
    profileName: "✨ Caminho de Crescimento",
    profileDescription:
      "Seu diagnóstico mostra que você está em um processo de crescimento espiritual com áreas importantes a fortalecer. Há potencial, fome e espaço para viver uma caminhada mais profunda com Deus a partir de agora.",
    strengths: ["Desejo de crescer", "Abertura para aprender", "Sensibilidade espiritual"],
    challenges: ["Criar constância", "Manter foco", "Transformar intenção em prática"],
    recommendations: [
      "Escolha um horário diário para se dedicar a Deus",
      "Comece com um plano bíblico simples",
      "Ore com constância, mesmo que por poucos minutos",
    ],
    nextSteps: ["Seu próximo nível espiritual começa com consistência nas pequenas decisões."],
  };
};

const persistDiagnosticHistory = async (
  leadId: number | undefined,
  result: DiagnosticResult,
) => {
  if (!leadId) {
    return;
  }

  try {
    await createDiagnosticHistoryEntry({
      leadId,
      profileName: result.profileName,
      profileDescription: result.profileDescription,
      strengths: JSON.stringify(result.strengths),
      challenges: JSON.stringify(result.challenges),
      recommendations: JSON.stringify(result.recommendations),
      nextSteps: JSON.stringify(result.nextSteps),
    });
  } catch (error) {
    console.error("Diagnostic history persistence error:", error);
  }
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    snapshot: adminProcedure.query(async () => {
      return await getAdminSnapshot();
    }),
    dashboard: adminProcedure.query(async () => {
      return await getAdminDashboardSummary();
    }),
    users: adminProcedure.query(async () => {
      return await getAdminUsers();
    }),
    buyers: adminProcedure.query(async () => {
      return await getAdminBuyers();
    }),
    diagnostics: adminProcedure.query(async () => {
      return await getAdminDiagnosticResults();
    }),
  }),

  quiz: router({
    submitLead: publicProcedure
      .input(
        z.object({
          whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
          email: z.string().email("E-mail inválido"),
        }),
      )
      .mutation(async ({ input }) => {
        const result = await createLead({
          whatsapp: input.whatsapp,
          email: input.email,
        });
        return { success: true, leadId: result.id };
      }),

    submitResponses: publicProcedure
      .input(
        z.object({
          leadId: z.number(),
          step1: z.string().optional(),
          step2: z.string().optional(),
          step3: z.string().optional(),
          step4: z.string().optional(),
          step5: z.string().optional(),
          step6: z.string().optional(),
          step7: z.string().optional(),
          step8: z.string().optional(),
          step9: z.string().optional(),
          step10: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await createQuizResponse({
          leadId: input.leadId,
          step1: input.step1,
          step2: input.step2,
          step3: input.step3,
          step4: input.step4,
          step5: input.step5,
          step6: input.step6,
          step7: input.step7,
          step8: input.step8,
          step9: input.step9,
          step10: input.step10,
        });
        return { success: true };
      }),

    getAllResponses: publicProcedure.query(async () => {
      return await getAllQuizResponses();
    }),

    getStatistics: publicProcedure.query(async () => {
      return await getResponseStatistics();
    }),

    createDevocionalCheckout: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          profileName: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "brl",
                  product_data: {
                    name: "Devocional: 7 Dias para se Aproximar de Deus",
                    description: `Guia devocional personalizado baseado em seu perfil: ${input.profileName}`,
                  },
                  unit_amount: 990,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${ctx.req.headers.origin}/checkout-success`,
            cancel_url: `${ctx.req.headers.origin}/result`,
            customer_email: input.email,
            metadata: {
              profileName: input.profileName,
              email: input.email,
            },
          });

          return { success: true, checkoutUrl: session.url };
        } catch (error: any) {
          console.error("Stripe checkout error:", error);
          throw new Error("Erro ao criar sessão de pagamento");
        }
      }),
  }),

  pdf: router({
    generateDiagnosticPDF: publicProcedure
      .input(
        z.object({
          profileName: z.string(),
          profileDescription: z.string(),
          strengths: z.array(z.string()),
          challenges: z.array(z.string()),
          recommendations: z.array(z.string()),
          nextSteps: z.array(z.string()),
          responses: z.record(z.string(), z.string()),
        }),
      )
      .mutation(async ({ input }) => {
        const { generateDiagnosticPDF } = await import("./pdf-generator");

        try {
          const pdfBuffer = await generateDiagnosticPDF({
            profileName: input.profileName,
            profileDescription: input.profileDescription,
            strengths: input.strengths,
            challenges: input.challenges,
            recommendations: input.recommendations,
            nextSteps: input.nextSteps,
            responses: input.responses as Record<string, string>,
          });

          const base64 = pdfBuffer.toString("base64" as BufferEncoding);
          return { success: true, pdfBase64: base64 };
        } catch (error: any) {
          console.error("PDF generation error:", error);
          throw new Error("Erro ao gerar PDF do diagnóstico");
        }
      }),

    generateDevocionalPDF: publicProcedure
      .input(
        z.object({
          profileName: z.string(),
          profileDescription: z.string(),
          challenges: z.array(z.string()),
          recommendations: z.array(z.string()),
          responses: z.record(z.string(), z.string()),
        }),
      )
      .mutation(async ({ input }) => {
        const { generateDevotionalPDF } = await import("./devotional-generator");

        try {
          const pdfBuffer = await generateDevotionalPDF({
            profileName: input.profileName,
            profileDescription: input.profileDescription,
            challenges: input.challenges,
            recommendations: input.recommendations,
            responses: input.responses as Record<string, string>,
          });

          const base64 = pdfBuffer.toString("base64" as BufferEncoding);
          return { success: true, pdfBase64: base64 };
        } catch (error: any) {
          console.error("Devotional PDF generation error:", error);
          throw new Error("Erro ao gerar PDF do devocional");
        }
      }),
  }),

  aiResult: router({
    generateFromResponses: publicProcedure
      .input(
        z.object({
          responses: z.record(z.string(), z.string()),
          leadId: z.number().int().positive().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        const responsesText = Object.entries(input.responses)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        const prompt = `Você é um especialista em diagnóstico espiritual. Analise as seguintes respostas de um quiz espiritual e gere um diagnóstico personalizado resumido em português, em estilo conversacional e amigável.

Respostas do usuário:
${responsesText}

Gere uma resposta JSON com a seguinte estrutura:
{
  "profileName": "Nome do perfil espiritual com emoji (ex: 🌳 Amadurecendo na Fé)",
  "profileDescription": "Um parágrafo conversacional (3-4 frases) que descreve o perfil de forma amigável e encorajadora",
  "strengths": ["força 1", "força 2"],
  "challenges": ["desafio 1", "desafio 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "nextSteps": ["próximo passo 1"]
}

Seja conciso, conversacional e encorajador. Use tom amigável como se estivesse conversando com um amigo.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "Você é um especialista em diagnóstico espiritual cristão. Forneça análises profundas, empáticas e construtivas.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: {
              type: "json_schema" as const,
              json_schema: {
                name: "spiritual_diagnosis" as const,
                strict: true as const,
                schema: {
                  type: "object",
                  properties: {
                    profileName: { type: "string" },
                    profileDescription: { type: "string" },
                    strengths: { type: "array", items: { type: "string" } },
                    challenges: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    nextSteps: { type: "array", items: { type: "string" } },
                  },
                  required: [
                    "profileName",
                    "profileDescription",
                    "strengths",
                    "challenges",
                    "recommendations",
                    "nextSteps",
                  ],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== "string") {
            throw new Error("Sem conteúdo na resposta da IA");
          }

          const result = JSON.parse(content) as DiagnosticResult;
          await persistDiagnosticHistory(input.leadId, result);
          return { success: true, ...result };
        } catch (error: any) {
          console.error("AI result generation error:", error);
          const fallbackResult = buildFallbackDiagnosis(input.responses);
          await persistDiagnosticHistory(input.leadId, fallbackResult);
          return { success: true, ...fallbackResult };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
