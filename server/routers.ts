import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createLead, createQuizResponse, getAllQuizResponses, getResponseStatistics } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quiz: router({
    submitLead: publicProcedure
      .input(z.object({
        whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
        email: z.string().email("E-mail inválido"),
      }))
      .mutation(async ({ input }) => {
        const result = await createLead({
          whatsapp: input.whatsapp,
          email: input.email,
        });
        return { success: true, leadId: result.id };
      }),

    submitResponses: publicProcedure
      .input(z.object({
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
      }))
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

    getAllResponses: publicProcedure
      .query(async () => {
        return await getAllQuizResponses();
      }),

    getStatistics: publicProcedure
      .query(async () => {
        return await getResponseStatistics();
      }),
  }),

  pdf: router({
    generateDiagnosticPDF: publicProcedure
      .input(z.object({
        profileName: z.string(),
        profileDescription: z.string(),
        strengths: z.array(z.string()),
        challenges: z.array(z.string()),
        recommendations: z.array(z.string()),
        nextSteps: z.array(z.string()),
        responses: z.record(z.string(), z.string()),
      }))
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
  }),

  aiResult: router({
    generateFromResponses: publicProcedure
      .input(z.object({
        responses: z.record(z.string(), z.string()),
      }))
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
                content: "Você é um especialista em diagnóstico espiritual cristão. Forneça análises profundas, empáticas e construtivas.",
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
                  required: ["profileName", "profileDescription", "strengths", "challenges", "recommendations", "nextSteps"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("Sem conteúdo na resposta da IA");
          }

          const result = JSON.parse(content);
          return { success: true, ...result };
        } catch (error: any) {
          console.error("AI result generation error:", error);
          throw new Error("Erro ao gerar diagnóstico com IA");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
