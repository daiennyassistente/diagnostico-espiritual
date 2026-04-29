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
import { createNewTransaction } from "./transaction-control";

export interface DiagnosticResult {
  profileName: string;
  profileDescription: string;
  emotionalMessage?: string;
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
        ? `Desejo claro: viver ${normalizeResponse(desireWithGod)} com Deus.`
        : "Existe desejo genuíno de se aproximar mais de Deus.",
      currentTreatment
        ? `Sensibilidade: Deus está tratando ${normalizeResponse(currentTreatment)} nesta fase.`
        : "Você demonstra sensibilidade para perceber o que Deus está tratando em você.",
      spiritualSelfDescription || currentState
        ? `Honestidade: você se reconhece como ${formatAnswerSnippet(spiritualSelfDescription || currentState, 'alguém em processo')}.`
        : "Você tem honestidade espiritual para reconhecer sua fase atual.",
    ],
    challenges: [
      mainDifficulty
        ? `Bloqueio: ${normalizeResponse(mainDifficulty)}.`
        : "Existe um bloqueio recorrente afetando sua constância.",
      biggestDifficulty
        ? `Dificuldade prática: ${normalizeResponse(biggestDifficulty)}.`
        : "Há uma dificuldade prática impedindo avanço consistente.",
      bibleRoutine || prayerLife
        ? `Rotina frágil: Palavra (${normalizeResponse(bibleRoutine || 'oscilante')}) e oração (${normalizeResponse(prayerLife || 'instável')}).`
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
  if (!leadId || leadId <= 0) {
    console.warn("[Diagnostic] leadId inválido ou não fornecido:", leadId);
    return;
  }

  try {
    console.log("[Diagnostic] Salvando diagnóstico para leadId:", leadId);
    await createDiagnosticHistoryEntry({
      leadId,
      profileName: result.profileName,
      profileDescription: result.profileDescription,
      strengths: JSON.stringify(result.strengths),
      challenges: JSON.stringify(result.challenges),
      recommendations: JSON.stringify(result.recommendations),
      nextSteps: JSON.stringify(result.nextSteps),
    });
    console.log("[Diagnostic] Diagnóstico salvo com sucesso para leadId:", leadId);
  } catch (error) {
    console.error("[Diagnostic] Erro ao salvar diagnóstico:", error);
    throw error;
  }
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      console.log('[Auth] auth.me called, user:', opts.ctx.user);
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      console.log('[Auth] logout called, user:', ctx.user);
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
    getBuyers: adminProcedure.query(async () => {
      return await getAdminBuyers();
    }),
    getPaymentDetails: adminProcedure
      .input(z.object({ paymentId: z.number() }))
      .query(async ({ input }) => {
        return await getPaymentWithDiagnostic(input.paymentId);
      }),
    resendEmail: adminProcedure
      .input(z.object({ email: z.string().email(), type: z.enum(['result', 'devotional']) }))
      .mutation(async ({ input }) => {
        try {
          const { getLeadByEmail, getDiagnosticByLeadId, getQuizResponseByLeadId } = await import('./db');
          const { sendEmail } = await import('./email-service');
          const { generateDevotionalPDF } = await import('./devotional-generator');

          const lead = await getLeadByEmail(input.email);
          if (!lead) {
            throw new Error('Lead não encontrado');
          }

          if (input.type === 'result') {
            // Enviar resultado do diagnóstico
            const diagnostic = await getDiagnosticByLeadId(lead.id);
            if (!diagnostic) {
              throw new Error('Diagnóstico não encontrado');
            }

            const emailBody = `
Olá ${lead.name || 'Amigo(a)'},

Seu diagnóstico espiritual foi gerado com sucesso!

Perfil: ${diagnostic.profileName}

${diagnostic.profileDescription}

Pontos Fortes:
${JSON.parse(diagnostic.strengths || '[]').join('\n')}

Desafios:
${JSON.parse(diagnostic.challenges || '[]').join('\n')}

Recomendações:
${JSON.parse(diagnostic.recommendations || '[]').join('\n')}

Bênçãos,
Equipe Diagnóstico Espiritual
            `;

            await sendEmail({
              to: input.email,
              subject: `Seu Diagnóstico Espiritual - ${diagnostic.profileName}`,
              html: emailBody,
            });
          } else if (input.type === 'devotional') {
            // Enviar devocional
            const diagnostic = await getDiagnosticByLeadId(lead.id);
            if (!diagnostic) {
              throw new Error('Diagnóstico não encontrado');
            }

            const quizResponse = await getQuizResponseByLeadId(lead.id);
            const responses: Record<string, string> = quizResponse
              ? Object.fromEntries(
                  Object.entries(quizResponse)
                    .filter(([key, value]) => /^step\d+$/.test(key) && typeof value === 'string' && value.trim().length > 0)
                    .map(([key, value]) => [key, String(value)])
                )
              : {};

            const pdfBuffer = await generateDevotionalPDF({
              profileName: diagnostic.profileName,
              profileDescription: diagnostic.profileDescription,
              challenges: JSON.parse(diagnostic.challenges),
              recommendations: JSON.parse(diagnostic.recommendations),
              strengths: JSON.parse(diagnostic.strengths),
              nextSteps: JSON.parse(diagnostic.nextSteps),
              responses,
              userName: responses.step1,
            });

            const emailBody = `
Olá ${lead.name || 'Amigo(a)'},

Seu devocional personalizado de 7 dias está em anexo!

Este material foi especialmente preparado para você com base no seu diagnóstico espiritual.

Que Deus abençoe seu tempo de intimidade com Ele!

Bênçãos,
Equipe Diagnóstico Espiritual
            `;

            await sendEmail({
              to: input.email,
              subject: `Seu Devocional Personalizado - ${diagnostic.profileName}`,
              html: emailBody,
              attachments: [
                {
                  filename: `devocional-${diagnostic.profileName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf',
                },
              ],
            });
          }

          console.log(`Email de ${input.type} reenviado com sucesso para ${input.email}`);
          return { success: true, message: 'Email reenviado com sucesso' };
        } catch (error: any) {
          console.error(`Erro ao reenviar email: ${error.message}`);
          throw new Error(`Erro ao reenviar email: ${error.message}`);
        }
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
          userId: z.string(),
          whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
          email: z.string().email("E-mail inválido"),
          name: z.string().optional(), // Nome da primeira pergunta
        }),
      )
      .mutation(async ({ input }) => {
        const result = await createLead({
          userId: input.userId,
          whatsapp: input.whatsapp,
          email: input.email,
          name: input.name,
        });
        return { success: true, leadId: result.id };
      }),

    submitResponses: publicProcedure
      .input(
        z.object({
          quizId: z.string(),
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
          quizId: input.quizId,
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
      const responses = await getAllQuizResponses();
      const totalResponses = responses.length;
      const completeResponses = responses.filter((r: any) => {
        const steps = [r.step1, r.step2, r.step3, r.step4, r.step5, r.step6, r.step7, r.step8, r.step9, r.step10];
        return steps.filter(Boolean).length === 10;
      }).length;
      return {
        totalResponses,
        completeResponses,
      };
    }),



    getResult: publicProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        try {
          const { getLeadById, getQuizResponseByLeadId, getDiagnosticByLeadId } = await import('./db');
          
          const lead = await getLeadById(input.leadId);
          if (!lead) {
            throw new Error('Lead not found');
          }
          
          const quizResponse = await getQuizResponseByLeadId(input.leadId);
          // Se quizResponse não existe, continuar mesmo assim
          // O frontend pode gerar o diagnóstico com base nas respostas armazenadas localmente
          
          const diagnostic = await getDiagnosticByLeadId(input.leadId);
          
          // Se o diagnóstico não existe, retornar null para que o frontend gere
          if (!diagnostic) {
          return {
            lead,
            quizResponse: quizResponse || null,
            diagnostic: null,
          };
          }
          
          // Converter diagnostic JSON strings para objetos
          const parsedDiagnostic = {
            ...diagnostic,
            strengths: typeof diagnostic.strengths === 'string' ? JSON.parse(diagnostic.strengths) : diagnostic.strengths,
            challenges: typeof diagnostic.challenges === 'string' ? JSON.parse(diagnostic.challenges) : diagnostic.challenges,
            recommendations: typeof diagnostic.recommendations === 'string' ? JSON.parse(diagnostic.recommendations) : diagnostic.recommendations,
            nextSteps: typeof diagnostic.nextSteps === 'string' ? JSON.parse(diagnostic.nextSteps) : diagnostic.nextSteps,
          };
          
          return {
            lead,
            quizResponse,
            diagnostic: parsedDiagnostic,
          };
        } catch (error: any) {
          console.error('Get result error:', error);
          throw new Error(`Erro ao buscar resultado: ${error.message}`);
        }
      }),

    sendDevotionalEmail: publicProcedure
      .input(
        z.object({
          leadId: z.number(),
          email: z.string().email(),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          console.log("[sendDevotionalEmail] Input:", input);
          const { sendEmail } = await import("./email-service.ts");
          const { generateDevotionalPDF } = await import("./devotional-generator.ts");
          const { getDiagnosticByLeadId, getQuizResponseByLeadId, getLeadById } = await import("./db.ts");

          // Get lead
          console.log("[sendDevotionalEmail] Looking for lead with ID:", input.leadId);
          const lead = await getLeadById(input.leadId);
          console.log("[sendDevotionalEmail] Lead found:", lead);
          if (!lead) {
            throw new Error("Lead not found");
          }

          // Get diagnostic
          const diagnostic = await getDiagnosticByLeadId(input.leadId);
          if (!diagnostic) {
            throw new Error("Diagnostic not found");
          }

          // Get quiz responses
          const quizResponse = await getQuizResponseByLeadId(input.leadId);
          const responses: Record<string, string> = quizResponse
            ? Object.fromEntries(
                Object.entries(quizResponse)
                  .filter(([key, value]) => /^step\d+$/.test(key) && typeof value === "string" && value.trim().length > 0)
                  .map(([key, value]) => [key, String(value)])
              )
            : {};

          // Generate PDF
          const pdfBuffer = await generateDevotionalPDF({
            profileName: diagnostic.profileName,
            profileDescription: diagnostic.profileDescription,
            challenges: JSON.parse(diagnostic.challenges),
            recommendations: JSON.parse(diagnostic.recommendations),
            strengths: JSON.parse(diagnostic.strengths),
            nextSteps: JSON.parse(diagnostic.nextSteps),
            responses,
            userName: responses.step1,
          });

          // Send email
          const emailSent = await sendEmail({
            to: input.email,
            subject: `Seu Devocional Personalizado - ${diagnostic.profileName}`,
            html: `
              <p>Olá ${lead.name},</p>
              <p>Seu devocional personalizado de 7 dias está em anexo!</p>
              <p>Este material foi especialmente preparado para você com base no seu diagnóstico espiritual.</p>
              <p>Bênçãos!</p>
            `,
            attachments: [
              {
                filename: `devocional-${diagnostic.profileName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });

          if (!emailSent) {
            throw new Error("Failed to send email");
          }

          return { success: true, message: "Email sent successfully" };
        } catch (error: any) {
          console.error("Send devotional email error:", error);
          throw new Error("Erro ao enviar email com devocional");
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
          console.log("[AI] Iniciando geracao de diagnostico para leadId:", input.leadId);
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



  payment: router({
    createMercadoPagoPayment: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          profileName: z.string(),
          userPhone: z.string(),
          leadId: z.string(),
          quizId: z.string(),
          resultId: z.number(),
          paymentMethod: z.enum(["card", "pix"]),
          amount: z.number().optional().default(9.9),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          if (input.paymentMethod === "pix") {
            const transactionId = crypto.randomUUID();

            await createNewTransaction(
              transactionId,
              input.quizId,
              input.resultId,
              Number(input.leadId),
            );

            // Create PIX payment
            const paymentData = {
              transaction_amount: input.amount,
              description: input.profileName,
              payment_method_id: "pix",
              payer: {
                email: input.email,
                first_name: "Cliente",
              },
              external_reference: transactionId,
              notification_url: "https://diagnosticoespiritual.manus.space/api/mercadopago/webhook",
              metadata: {
                quizId: input.quizId,
                resultId: input.resultId,
                leadId: input.leadId,
              },
            };

            // DEBUG: Validar dados obrigatórios
            console.log("[Mercado Pago PIX] DEBUG - Validando dados obrigatórios");
            console.log("[Mercado Pago PIX] DEBUG - transaction_amount:", paymentData.transaction_amount);
            console.log("[Mercado Pago PIX] DEBUG - description:", paymentData.description);
            console.log("[Mercado Pago PIX] DEBUG - payment_method_id:", paymentData.payment_method_id);
            console.log("[Mercado Pago PIX] DEBUG - email:", paymentData.payer.email);
            console.log("[Mercado Pago PIX] DEBUG - external_reference:", paymentData.external_reference);
            console.log("[Mercado Pago PIX] DEBUG - notification_url:", paymentData.notification_url);
            console.log("[Mercado Pago PIX] DEBUG - Token presente:", !!process.env.MERCADOPAGO_ACCESS_TOKEN);
            console.log("[Mercado Pago PIX] DEBUG - Payload completo:", JSON.stringify(paymentData, null, 2));

            const response = await fetch("https://api.mercadopago.com/v1/payments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                "X-Idempotency-Key": crypto.randomUUID(),
              },
              body: JSON.stringify(paymentData),
            });

            console.log("[Mercado Pago PIX] DEBUG - Response status:", response.status);
            console.log("[Mercado Pago PIX] DEBUG - Response statusText:", response.statusText);

            if (!response.ok) {
              let errorData: any = {};
              const responseText = await response.text();
              console.log("[Mercado Pago PIX] DEBUG - Response text:", responseText);
              
              try {
                errorData = JSON.parse(responseText);
              } catch (parseError) {
                console.error("[Mercado Pago PIX] Erro ao fazer parse da resposta de erro");
              }
              
              console.error("[Mercado Pago PIX] Error completo:", JSON.stringify(errorData, null, 2));
              console.error("[Mercado Pago PIX] Status:", response.status);
              console.error("[Mercado Pago PIX] StatusText:", response.statusText);
              throw new Error(`Erro ao gerar PIX: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("[Mercado Pago PIX] DEBUG - Resposta sucesso:", JSON.stringify(data, null, 2));
            
            const pixCode = data.point_of_interaction?.transaction_data?.qr_code;
            const pixImage = data.point_of_interaction?.transaction_data?.qr_code_base64;

            console.log("[Mercado Pago PIX] DEBUG - PIX Code gerado:", !!pixCode);
            console.log("[Mercado Pago PIX] DEBUG - PIX Image gerado:", !!pixImage);
            console.log("[Mercado Pago PIX] DEBUG - transactionId retornando:", transactionId);

            // Create payment record
            try {
              const { createPayment } = await import("./db");
              await createPayment({
                leadId: Number(input.leadId),
                amount: input.amount,
                currency: "BRL",
                status: "pending",
                productName: "Devocional: 7 Dias para se Aproximar de Deus",
              });
            } catch (dbError) {
              console.error("[Mercado Pago] Failed to create payment record:", dbError);
            }

            return {
              success: true,
              pixCode: pixCode || "",
              pixQrCode: pixImage ? `data:image/png;base64,${pixImage}` : "",
              paymentId: data.id,
              transactionId,
            };
          } else {
            // For card payments, we'll use the checkout preference
            const preference = {
              items: [
                {
                  title: "Devocional: 7 Dias para se Aproximar de Deus",
                  description: input.profileName,
                  unit_price: input.amount,
                  quantity: 1,
                  currency_id: "BRL",
                },
              ],
              payer: {
                email: input.email,
                phone: {
                  number: input.userPhone,
                },
              },
              external_reference: input.leadId,
            };

            const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              },
              body: JSON.stringify(preference),
            });

            if (!response.ok) {
              const error = await response.json();
              console.error("[Mercado Pago Card] Error:", error);
              throw new Error("Erro ao criar checkout");
            }

            const data = await response.json();

            // Create payment record
            try {
              const { createPayment } = await import("./db");
              await createPayment({
                leadId: Number(input.leadId),
                amount: input.amount,
                currency: "BRL",
                status: "pending",
                productName: "Devocional: 7 Dias para se Aproximar de Deus",
              });
            } catch (dbError) {
              console.error("[Mercado Pago] Failed to create payment record:", dbError);
            }

            return {
              success: true,
              checkoutUrl: data.init_point,
              preferenceId: data.id,
            };
          }
        } catch (error: any) {
          console.error("[Mercado Pago Payment] Error:", error.message);
          return {
            success: false,
            error: error.message || "Erro ao processar pagamento",
          };
        }
      }),

    createOfferPixPayment: publicProcedure
      .input(
        z.object({
          leadId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { getDiagnosticByLeadId, getLeadById, createPayment } = await import("./db");
          const leadId = Number(input.leadId);
          const lead = await getLeadById(leadId);
          const diagnostic = await getDiagnosticByLeadId(leadId);

          if (!lead?.email) {
            throw new Error("Lead não encontrado ou sem e-mail");
          }

          if (!diagnostic?.id) {
            throw new Error("Diagnóstico não encontrado para este lead");
          }

          const transactionId = crypto.randomUUID();
          await createNewTransaction(
            transactionId,
            "offer-whatsapp",
            Number(diagnostic.id),
            leadId,
          );

          const origin = ctx.req.headers.origin || "https://diagnosticoespiritual.manus.space";
          const paymentData = {
            transaction_amount: 7.9,
            description: "Devocional: 7 Dias para se Aproximar de Deus",
            payment_method_id: "pix",
            payer: {
              email: lead.email,
              first_name: diagnostic.profileName || lead.name || "Cliente",
            },
            external_reference: transactionId,
            notification_url: `${origin}/api/mercadopago/webhook`,
            metadata: {
              quizId: "offer-whatsapp",
              resultId: Number(diagnostic.id),
              leadId: input.leadId,
              source: "offer-page",
            },
          };

          const response = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              "X-Idempotency-Key": crypto.randomUUID(),
            },
            body: JSON.stringify(paymentData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Mercado Pago Offer PIX] Error:", errorText);
            throw new Error("Erro ao gerar PIX da oferta");
          }

          const data = await response.json();
          const pixCode = data.point_of_interaction?.transaction_data?.qr_code;
          const pixImage = data.point_of_interaction?.transaction_data?.qr_code_base64;

          await createPayment({
            leadId,
            amount: 7.9,
            currency: "BRL",
            status: "pending",
            productName: "Devocional: 7 Dias para se Aproximar de Deus",
          });

          return {
            success: true,
            pixCode: pixCode || "",
            pixQrCode: pixImage ? `data:image/png;base64,${pixImage}` : "",
            paymentId: data.id,
            transactionId,
          };
        } catch (error: any) {
          console.error("[Mercado Pago Offer PIX] Error:", error.message);
          return {
            success: false,
            error: error.message || "Erro ao gerar PIX da oferta",
          };
        }
      }),

    createMercadoPagoCheckout: publicProcedure
      .input(
        z.object({
          quizId: z.string(),
          email: z.string().email(),
          profileName: z.string(),
          userPhone: z.string(),
          leadId: z.string(),
          amount: z.number().optional().default(12.90),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const origin = ctx.req.headers.origin || "https://diagnosticoespiritual.manus.space";

          const preference = {
            items: [
              {
                title: "Devocional: 7 Dias para se Aproximar de Deus",
                description: input.profileName,
                unit_price: input.amount,
                quantity: 1,
                currency_id: "BRL",
              },
            ],
            payer: {
              email: input.email,
              phone: {
                number: input.userPhone,
              },
            },
            back_urls: {
              success: `${origin}/checkout-success`,
              failure: `${origin}/checkout`,
              pending: `${origin}/checkout-pending`,
            },
            auto_return: "approved",
            notification_url: `${origin}/api/mercadopago/webhook`,
            external_reference: input.leadId,
            payment_methods: {
              installments: 1,
            },
            metadata: {
              quizId: input.quizId,
              profileName: input.profileName,
              userPhone: input.userPhone,
            },
          };

          const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(preference),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("[Mercado Pago] API Error:", error);
            throw new Error(`Mercado Pago API error: ${error.message}`);
          }

          const data = await response.json();
          console.log("[Mercado Pago] Preference created:", data.id);

          // Create payment record in database
          try {
            const { createPayment } = await import("./db");
            await createPayment({
              leadId: Number(input.leadId),
              amount: 12.90,
              currency: "BRL",
              status: "pending",
              productName: "Devocional: 7 Dias para se Aproximar de Deus",
            });
            console.log("[Mercado Pago] Payment record created for lead:", input.leadId);
          } catch (dbError) {
            console.error("[Mercado Pago] Failed to create payment record:", dbError);
          }

          return {
            success: true,
            checkoutUrl: data.init_point,
            preferenceId: data.id,
          };
        } catch (error: any) {
          console.error("Mercado Pago checkout error:", error.message);
          throw new Error("Erro ao criar sessão de pagamento");
        }
      }),

    createStripeCheckout: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          profileName: z.string(),
          userPhone: z.string(),
          leadId: z.string(),
          amount: z.number().optional().default(9.90),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const origin = ctx.req.headers.origin || "https://diagnosticoespiritual.manus.space";
          const price = input.amount;

          const preference = {
            items: [
              {
                title: "Devocional: 7 Dias para se Aproximar de Deus",
                description: input.profileName,
                unit_price: price,
                quantity: 1,
                currency_id: "BRL",
              },
            ],
            payer: {
              email: input.email,
              phone: {
                number: input.userPhone,
              },
            },
            back_urls: {
              success: `${origin}/checkout-success`,
              failure: `${origin}/checkout`,
              pending: `${origin}/checkout-pending`,
            },
            auto_return: "approved",
            notification_url: `${origin}/api/mercadopago/webhook`,
            external_reference: input.leadId,
            payment_methods: {
              installments: 1,
            },
            metadata: {
              profileName: input.profileName,
              userPhone: input.userPhone,
            },
          };

          const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(preference),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("[Mercado Pago] API Error:", error);
            throw new Error(`Mercado Pago API error: ${error.message}`);
          }

          const data = await response.json();
          console.log("[Mercado Pago] Preference created:", data.id);

          try {
            const { createPayment } = await import("./db");
            await createPayment({
              leadId: Number(input.leadId),
              amount: price,
              currency: "BRL",
              status: "pending",
              productName: "Devocional: 7 Dias para se Aproximar de Deus",
            });
            console.log("[Mercado Pago] Payment record created for lead:", input.leadId);
          } catch (dbError) {
            console.error("[Mercado Pago] Failed to create payment record:", dbError);
          }

          return {
            success: true,
            checkoutUrl: data.init_point,
            preferenceId: data.id,
          };
        } catch (error: any) {
          console.error("Mercado Pago checkout error:", error.message);
          throw new Error("Erro ao criar sessão de pagamento");
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
