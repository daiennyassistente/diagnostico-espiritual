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
        return { success: true, leadId: (result as any).insertId };
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
});

export type AppRouter = typeof appRouter;
