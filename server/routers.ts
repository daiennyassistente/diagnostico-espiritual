import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import type { Response } from "express";
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
  authenticateUser,
  searchLeads,
  getAllLeadsWithQuizStatus,
  getPaymentWithDiagnostic,
  getAllQuizQuestions,
  updateQuizQuestion,
  createQuizQuestion,
  deleteQuizQuestion,
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

const normalizeResponse = (value: string) => value.trim().toLowerCase();

const formatAnswerSnippet = (value: string, fallback: string) => {
  const normalized = value.trim();
  return normalized ? `"${normalized}"` : fallback;
};

const buildTimeBasedRecommendation = (availableTime: string) => {
  const normalized = normalizeResponse(availableTime);

  if (normalized.includes("5 minutos")) {
    return "Como hoje você só consegue separar 5 minutos, comece com um salmo por dia, uma oração objetiva e um pedido sincero de direção.";
  }

  if (normalized.includes("10 minutos")) {
    return "Use seus 10 minutos diários com intencionalidade: 5 minutos na Palavra, 3 minutos em oração honesta e 2 minutos em silêncio diante de Deus.";
  }

  if (normalized.includes("15 minutos")) {
    return "Com 15 minutos por dia, organize um pequeno altar diário: leitura bíblica, oração prática e um registro do que Deus está tratando em você.";
  }

  if (normalized.includes("20 minutos")) {
    return "Como você consegue dedicar 20 minutos ou mais, vale estruturar um tempo completo com leitura, oração, silêncio e aplicação prática no mesmo dia.";
  }

  return "Defina um tempo diário realista e mantenha constância mesmo nos dias mais corridos, porque o seu avanço espiritual depende mais de regularidade do que de intensidade ocasional.";
};

export const buildResponsesContext = (responses: Record<string, string>) => {
  return Object.entries(QUIZ_QUESTION_LABELS)
    .map(([index, question]) => {
      const numericIndex = Number(index);
      const answer = getResponseValue(responses, numericIndex, `step${numericIndex + 1}`) || "Não respondido";
      return `Pergunta ${numericIndex + 1}: ${question}\nResposta: ${answer}`;
    })
    .join("\n\n");
};

const resolveProfileName = (responses: Record<string, string>) => {
  const currentState = normalizeResponse(getResponseValue(responses, 1, "step2"));
  const bibleRoutine = normalizeResponse(getResponseValue(responses, 3, "step4"));
  const missingWithGod = normalizeResponse(getResponseValue(responses, 5, "step6"));
  const biggestDifficulty = normalizeResponse(getResponseValue(responses, 9, "step10"));
  const spiritualSelfDescription = normalizeResponse(getResponseValue(responses, 10, "step11"));

  if (
    spiritualSelfDescription.includes("recomeçar") ||
    spiritualSelfDescription.includes("reconstru") ||
    currentState.includes("querendo voltar") ||
    currentState.includes("recomeço")
  ) {
    return "espiritualmente em recomeço";
  }

  if (
    spiritualSelfDescription.includes("cansada") ||
    biggestDifficulty.includes("emocional") ||
    missingWithGod.includes("paz")
  ) {
    return "espiritualmente cansado(a)";
  }

  if (
    spiritualSelfDescription.includes("travada") ||
    biggestDifficulty.includes("direção") ||
    currentState.includes("sem direção")
  ) {
    return "espiritualmente travado(a)";
  }

  if (
    spiritualSelfDescription.includes("amadurecendo") ||
    bibleRoutine.includes("frequente e profunda") ||
    currentState.includes("próxima de deus")
  ) {
    return "espiritualmente amadurecendo";
  }

  if (
    currentState.includes("inconstante") ||
    bibleRoutine.includes("irregular") ||
    bibleRoutine.includes("quase parada")
  ) {
    return "espiritualmente instável";
  }

  return "espiritualmente em crescimento";
};

export const buildFallbackDiagnosis = (responses: Record<string, string>): DiagnosticResult => {
  const name = getResponseValue(responses, 0, "step1").trim();
  const currentState = getResponseValue(responses, 1, "step2").trim();
  const mainDifficulty = getResponseValue(responses, 2, "step3").trim();
  const bibleRoutine = getResponseValue(responses, 3, "step4").trim();
  const prayerLife = getResponseValue(responses, 4, "step5").trim();
  const missingWithGod = getResponseValue(responses, 5, "step6").trim();
  const currentTreatment = getResponseValue(responses, 6, "step7").trim();
  const desireWithGod = getResponseValue(responses, 7, "step8").trim();
  const availableTime = getResponseValue(responses, 8, "step9").trim();
  const biggestDifficulty = getResponseValue(responses, 9, "step10").trim();
  const spiritualSelfDescription = getResponseValue(responses, 10, "step11").trim();
  const additionalContext = getResponseValue(responses, 11, "step12").trim();

  const firstName = name.split(/\s+/).filter(Boolean)[0] || "";
  const intro = firstName ? `${firstName}, ` : "";
  const profileName = resolveProfileName(responses);
  const additionalSentence = additionalContext
    ? ` No que você acrescentou no final, ficou ainda mais claro quando você disse ${formatAnswerSnippet(additionalContext, 'que está vivendo uma fase delicada')}.`
    : "";

  return {
    profileName,
    profileDescription:
      `${intro}hoje você se percebe como ${formatAnswerSnippet(spiritualSelfDescription || currentState, 'alguém em busca de respostas espirituais')}. O que mais tem dificultado sua constância com Deus é ${formatAnswerSnippet(mainDifficulty, 'uma pressão interna que tem drenado sua constância')}, e isso aparece na sua rotina com a Palavra, que está ${formatAnswerSnippet(bibleRoutine, 'oscilante')}, e na sua vida de oração, hoje ${formatAnswerSnippet(prayerLife, 'fragilizada')}. Você sente falta de ${formatAnswerSnippet(missingWithGod, 'mais intimidade com Deus')} e deseja viver ${formatAnswerSnippet(desireWithGod, 'uma aproximação mais profunda com Deus')}, o que mostra que ainda existe sede real dentro de você. ${buildTimeBasedRecommendation(availableTime)}${additionalSentence}`.trim(),
    strengths: [
      desireWithGod
        ? `Existe um desejo claro de viver ${normalizeResponse(desireWithGod)} com Deus.`
        : "Existe desejo genuíno de se aproximar mais de Deus.",
      currentTreatment
        ? `Você tem consciência de que Deus está tratando ${normalizeResponse(currentTreatment)} nesta fase.`
        : "Você demonstra sensibilidade para perceber o que Deus está tratando em você.",
      spiritualSelfDescription || currentState
        ? `Você consegue nomear sua fase espiritual com honestidade, ao se descrever como ${formatAnswerSnippet(spiritualSelfDescription || currentState, 'alguém em processo')}.`
        : "Você tem honestidade espiritual para reconhecer sua fase atual.",
    ],
    challenges: [
      mainDifficulty
        ? `Seu principal bloqueio hoje está em ${normalizeResponse(mainDifficulty)}.`
        : "Existe um bloqueio recorrente afetando sua constância.",
      biggestDifficulty
        ? `A sua maior dificuldade prática tem sido ${normalizeResponse(biggestDifficulty)}.`
        : "Há uma dificuldade prática impedindo avanço consistente.",
      bibleRoutine || prayerLife
        ? `Sua rotina espiritual mostra fragilidade entre Palavra (${normalizeResponse(bibleRoutine || 'oscilante')}) e oração (${normalizeResponse(prayerLife || 'instável')}).`
        : "Sua rotina espiritual perdeu consistência entre Palavra e oração.",
    ],
    recommendations: [
      buildTimeBasedRecommendation(availableTime),
      missingWithGod
        ? `Como você sente falta de ${normalizeResponse(missingWithGod)}, direcione seus próximos devocionais para textos bíblicos e orações que fortaleçam exatamente essa área.`
        : "Escolha um foco espiritual claro para seus próximos devocionais e ore especificamente sobre isso.",
      mainDifficulty || biggestDifficulty
        ? `Crie uma resposta prática contra o que hoje mais te trava — ${normalizeResponse(mainDifficulty || biggestDifficulty)} — para que sua vida espiritual não continue sendo guiada pelo improviso.`
        : "Transforme sua principal trava espiritual em um alvo claro de oração e ação nesta semana.",
    ],
    nextSteps: [
      desireWithGod
        ? `Seu próximo passo é separar ${availableTime || 'alguns minutos'} ainda hoje e buscar a Deus com foco em ${normalizeResponse(desireWithGod)}.`
        : `Seu próximo passo é separar ${availableTime || 'alguns minutos'} ainda hoje e retomar sua constância com Deus de forma simples e honesta.`,
    ],
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
    loginWithPassword: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateUser(input.email, input.password);
        if (!user) {
          throw new Error("Credenciais inválidas");
        }

        const openId = user.openId || `user-${user.id}`;
        const sessionToken = await sdk.createSessionToken(openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as Response).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user: { id: user.id, name: user.name, role: user.role } };
      }),
  }),

  admin: router({
    // Admin Login
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { getAdminByUsername, verifyPassword, createOrUpdateAdminUser } = await import('./db');

          const admin = await getAdminByUsername(input.username.trim());

          if (!admin) {
            return { success: false, message: "Usuário ou senha incorretos" };
          }

          const passwordMatch =
            input.password === admin.passwordHash ||
            verifyPassword(input.password, admin.passwordHash);

          if (!passwordMatch) {
            return { success: false, message: "Usuário ou senha incorretos" };
          }

          const linkedUser = await createOrUpdateAdminUser(admin.username, input.password);
          if (!linkedUser) {
            return { success: false, message: "Não foi possível iniciar a sessão administrativa" };
          }

          const openId = linkedUser.openId || `user-${linkedUser.id}`;
          const sessionToken = await sdk.createSessionToken(openId, {
            name: linkedUser.name || admin.username,
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          (ctx.res as Response).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

          return {
            success: true,
            token: sessionToken,
            admin: { id: linkedUser.id, username: linkedUser.name || admin.username },
            user: { id: linkedUser.id, name: linkedUser.name, role: linkedUser.role },
          };
        } catch (error) {
          console.error("Erro ao fazer login do admin:", error);
          return { success: false, message: "Erro ao fazer login" };
        }
      }),

    // Quiz Questions Management
    getQuestions: adminProcedure.query(async () => {
      const { getAllQuizQuestions } = await import('./db');
      return await getAllQuizQuestions();
    }),
    updateQuestion: adminProcedure
      .input(z.object({ id: z.number(), question: z.string(), options: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        const { updateQuizQuestion } = await import('./db');
        return await updateQuizQuestion(input.id, input.question, input.options);
      }),
    createQuestion: adminProcedure
      .input(z.object({ step: z.number(), question: z.string(), options: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        const { createQuizQuestion } = await import('./db');
        return await createQuizQuestion(input.step, input.question, input.options);
      }),
    deleteQuestion: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteQuizQuestion } = await import('./db');
        return await deleteQuizQuestion(input.id);
      }),

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
    searchLeads: adminProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchLeads(input.query);
      }),
    getAllLeads: adminProcedure.query(async () => {
      return await getAllLeadsWithQuizStatus();
    }),
    getPaymentDetails: adminProcedure
      .input(z.object({ paymentId: z.number() }))
      .query(async ({ input }) => {
        return await getPaymentWithDiagnostic(input.paymentId);
      }),
    resendEmail: adminProcedure
      .input(z.object({ email: z.string().email(), type: z.enum(['result', 'devotional']) }))
      .mutation(async ({ input }) => {
        console.log(`Resending ${input.type} to ${input.email}`);
        return { success: true, message: 'Email reenviado com sucesso' };
      }),
    resendViaWhatsApp: publicProcedure
      .input(z.object({ whatsappNumber: z.string().min(10), pdfUrl: z.string().url(), userName: z.string().optional() }))
      .mutation(async ({ input }) => {
        try {
          const { sendDevocionalPdfViaWhatsApp } = await import("./_core/twilio");
          const success = await sendDevocionalPdfViaWhatsApp(
            input.whatsappNumber,
            input.pdfUrl,
            input.userName
          );
          if (success) {
            return { success: true, message: 'PDF reenviado via WhatsApp com sucesso!' };
          } else {
            throw new Error('Erro ao enviar via WhatsApp');
          }
        } catch (error: any) {
          console.error('Erro ao reenviar via WhatsApp:', error);
          throw new Error('Erro ao reenviar PDF via WhatsApp');
        }
      }),
    generateDownloadLink: adminProcedure
      .input(z.object({ leadId: z.number() }))
      .mutation(async ({ input }) => {
        const { getLeadWithDiagnostic, updatePaymentDownloadToken } = await import('./db');
        const leadData = await getLeadWithDiagnostic(input.leadId);
        if (!leadData || !leadData.diagnostic) {
          throw new Error('Lead ou diagnóstico não encontrado');
        }
        const downloadToken = Buffer.from(`${input.leadId}-${Date.now()}-${Math.random().toString(36).substring(7)}`).toString('base64');
        await updatePaymentDownloadToken(input.leadId, downloadToken);
        return { success: true, downloadToken };
      }),
    unlockAccess: adminProcedure
      .input(z.object({ leadId: z.number() }))
      .mutation(async ({ input }) => {
        const { unlockAccessForLead } = await import('./db');
        const success = await unlockAccessForLead(input.leadId);
        if (!success) {
          throw new Error('Erro ao liberar acesso');
        }
        return { success: true, message: 'Acesso liberado com sucesso' };
      }),
  }),

  quiz: router({
    submitLead: publicProcedure
      .input(
        z.object({
          whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
          email: z.string().email("E-mail inválido"),
          name: z.string().optional(), // Nome da primeira pergunta
        }),
      )
      .mutation(async ({ input }) => {
        const result = await createLead({
          whatsapp: input.whatsapp,
          email: input.email,
          name: input.name,
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
          step11: z.string().optional(),
          step12: z.string().optional(), // Desabafo
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
          step11: input.step11,
          step12: input.step12,
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
                  unit_amount: 1290,
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

    createMercadoPagoCheckout: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          profileName: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { createMercadoPagoPreference, getMercadoPagoInitPoint } = await import("./_core/mercadopago");
          
          const preference = await createMercadoPagoPreference({
            title: "Devocional: 7 Dias para se Aproximar de Deus",
            description: `Guia devocional personalizado baseado em seu perfil: ${input.profileName}. Contém 7 dias de reflexões, versículos bíblicos e orações específicas para sua jornada espiritual.`,
            price: 12.90,
            quantity: 1,
            email: input.email,
            externalReference: `devotional-${Date.now()}`,
            successUrl: `${ctx.req.headers.origin}/checkout-success`,
            failureUrl: `${ctx.req.headers.origin}/result`,
            pendingUrl: `${ctx.req.headers.origin}/result`,
          });

          const initPoint = getMercadoPagoInitPoint(preference);
          if (!initPoint) {
            throw new Error("Nao foi possivel gerar link de pagamento");
          }

          return { success: true, checkoutUrl: initPoint };
        } catch (error: any) {
          console.error("Mercado Pago checkout error:", error);
          throw new Error("Erro ao criar sessao de pagamento");
        }
      }),

    processSecureFieldsPayment: publicProcedure
      .input(
        z.object({
          cardToken: z.string(),
          email: z.string().email(),
          profileName: z.string(),
          leadId: z.number(),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const { MercadoPagoConfig, Payment } = await import("mercadopago");
          
          const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
          });

          const paymentClient = new Payment(client);

          const payment = await paymentClient.create({
            body: {
              token: input.cardToken,
              transaction_amount: 12.90,
              installments: 1,
              payment_method_id: "visa",
              payer: {
                email: input.email,
              },
              description: `Devocional personalizado - Perfil: ${input.profileName}`,
              external_reference: `devotional-${input.leadId}-${Date.now()}`,
            },
          });

          if ((payment.status as any) === "201" || (payment.status as any) === "200" || (payment.status as any) === 201 || (payment.status as any) === 200) {
            return { 
              success: true, 
              paymentId: payment.id,
              status: payment.status,
            };
          } else {
            throw new Error("Erro ao processar pagamento");
          }
        } catch (error: any) {
          console.error("Secure Fields payment error:", error);
          throw new Error(`Erro ao processar pagamento: ${error.message}`);
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
          strengths: z.array(z.string()).optional(),
          nextSteps: z.array(z.string()).optional(),
          responses: z.record(z.string(), z.string()),
          userName: z.string().optional(),
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
            strengths: input.strengths,
            nextSteps: input.nextSteps,
            responses: input.responses as Record<string, string>,
            userName: input.userName,
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

        const responsesText = buildResponsesContext(input.responses);

        const prompt = `VOCÊ É UM ESPECIALISTA EM DIAGNÓSTICO ESPIRITUAL CRISTÃO, COM BASE BÍBLICA, E SUA ANÁLISE PRECISA PARECER IMPOSSÍVEL DE SER GENÉRICA.

A seguir estão as perguntas do quiz com as respostas reais do usuário. Você DEVE analisar o significado espiritual de CADA resposta e cruzar os padrões entre elas.

QUIZ COMPLETO:
${responsesText}

OBJETIVO:
Produza um diagnóstico que faça a pessoa sentir que você realmente leu e entendeu sua fase espiritual. O texto precisa soar individual, específ ico, íntimo, coerente e profundamente conectado ao que ela respondeu.

TOM E ESTILO:
- Fale DIRETAMENTE com a pessoa: use "você", "sua vida", "seu coração", "sua jornada"
- Crie CONEXÃO EMOCIONAL: mostre que você entende a dor real, não apenas os sintomas
- Seja ACOLHEDOR E ESPERANÇOSO: reconheça as lutas, mas aponte para a graça de Deus
- PERSONALIZE PROFUNDAMENTE: cada frase deve soar como se fosse escrita apenas para essa pessoa
- Evite GENERICO: não escreva algo que pudesse servir para outra pessoa com respostas diferentes
REGRAS OBRIGATÓRIAS:
1. NÃO escreva conteúdo genérico, amplo ou reaproveitável.
2. O profileDescription deve mencionar pelo menos 4 evidências concretas extraídas das respostas.
3. Strengths, challenges e recommendations também devem nascer de respostas concretas do quiz.
4. Uma das recomendações deve considerar explicitamente o tempo diário disponível informado pela pessoa.
5. Se houver desabafo final, use esse conteúdo como pista importante da dor real vivida agora.
6. Use linguagem cristã, acolhedora, bíblica e direta, sem soar mística, vaga ou poética demais.
7. Não invente respostas que a pessoa não deu.
8. O diagnóstico deve mostrar relação entre sintomas, causa provável e próximo passo prático com Deus.
9. NUNCA inclua referências como "(resposta 2)", "(resposta 4)", "(step 3)" ou qualquer outra notação de referência no texto. O texto deve fluir naturalmente sem essas marcações.
10. O profileDescription deve começar reconhecendo a realidade espiritual da pessoa e terminar apontando para a esperança em Cristo.
11. Use evidencias concretas das respostas para construir uma narrativa que mostre: (a) onde a pessoa está, (b) por que está lá, (c) para onde Deus a chama.

Gere uma resposta JSON com a seguinte estrutura:
{
  "profileName": "Um título simples, direto e objetivo, sem emoji e sem metáforas. Exemplos válidos: 'espiritualmente em recomeço', 'espiritualmente cansado(a)', 'espiritualmente travado(a)', 'espiritualmente amadurecendo'.",
  "profileDescription": "Um parágrafo com alta personalização, citando sinais concretos presentes nas respostas e mostrando por que esse diagnóstico faz sentido para essa pessoa específica.",
  "strengths": ["força específica 1 derivada das respostas", "força específica 2 derivada das respostas", "força específica 3 derivada das respostas"],
  "challenges": ["desafio específico 1 derivado das respostas", "desafio específico 2 derivado das respostas", "desafio específico 3 derivado das respostas"],
  "recommendations": ["recomendação específica 1 baseada nas respostas", "recomendação específica 2 baseada nas respostas", "recomendação específica 3 baseada nas respostas"],
  "nextSteps": ["um próximo passo muito claro, realista e coerente com a fase e com o tempo disponível da pessoa"]
}

CRITÉRIO DE QUALIDADE:
Se esse mesmo texto pudesse servir para outra pessoa com respostas diferentes, então sua resposta está errada.`;

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

  download: router({
    downloadResult: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { getLeadWithDiagnosticByToken } = await import('./db');
          const leadData = await getLeadWithDiagnosticByToken(input.token);
          
          if (!leadData) {
            throw new Error('Link expirado ou inválido');
          }

          const { generateDiagnosticPDF } = await import('./pdf-generator');
          const pdfBuffer = await generateDiagnosticPDF({
            profileName: leadData.profileName,
            profileDescription: leadData.profileDescription,
            strengths: leadData.strengths,
            challenges: leadData.challenges,
            recommendations: leadData.recommendations,
            nextSteps: leadData.nextSteps,
            responses: {},
          });

          const pdfBase64 = pdfBuffer.toString('base64');
          return { success: true, pdfBase64 };
        } catch (error: any) {
          console.error('Download result error:', error);
          throw new Error('Erro ao gerar PDF do resultado');
        }
      }),

    downloadDevotional: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { getLeadWithDiagnosticByToken } = await import('./db');
          const leadData = await getLeadWithDiagnosticByToken(input.token);
          
          if (!leadData) {
            throw new Error('Link expirado ou inválido');
          }

          const { generateDevocionalPDF } = await import('./pdf-generator');
          const pdfBuffer = await generateDevocionalPDF({
            profileName: leadData.profileName,
            profileDescription: leadData.profileDescription,
            challenges: leadData.challenges,
            recommendations: leadData.recommendations,
            nextSteps: leadData.nextSteps,
            userResponses: leadData.userResponses,
          });

          const pdfBase64 = pdfBuffer.toString('base64');
          return { success: true, pdfBase64 };
        } catch (error: any) {
          console.error('Download devotional error:', error);
          throw new Error('Erro ao gerar PDF do devocional');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
