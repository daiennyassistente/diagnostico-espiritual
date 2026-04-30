import { getDb } from "./db";
import { quizEvents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Salvar evento de quiz no banco de dados
 */
export async function saveQuizEvent(
  leadId: number,
  eventName: "QuizStarted" | "QuizCompleted" | "QuizAbandoned" | "Lead",
  eventId: string,
  userEmail?: string,
  userPhone?: string,
  profileName?: string,
  currentStep?: number,
  totalSteps?: number,
  reason?: string
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Verificar se o evento já foi registrado (deduplicação)
    const existingEvent = await db
      .select()
      .from(quizEvents)
      .where(eq(quizEvents.eventId, eventId))
      .limit(1);

    if (existingEvent.length > 0) {
      console.log(`[Quiz Events] Evento ${eventName} com ID ${eventId} já foi registrado`);
      return existingEvent[0];
    }

    // Inserir novo evento
    const result = await db.insert(quizEvents).values({
      leadId,
      eventName,
      eventId,
      userEmail,
      userPhone,
      profileName,
      currentStep,
      totalSteps,
      reason,
    });

    console.log(`[Quiz Events] Evento ${eventName} registrado com sucesso para lead ${leadId}`);
    return result;
  } catch (error) {
    console.error(`[Quiz Events] Erro ao salvar evento ${eventName}:`, error);
    throw error;
  }
}

/**
 * Obter o status mais recente do quiz para um lead
 * Prioridade: Concluído > Abandonado > Iniciado
 */
export async function getLatestQuizStatus(leadId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const events = await db
      .select()
      .from(quizEvents)
      .where(eq(quizEvents.leadId, leadId))
      .orderBy((t: any) => t.createdAt);

    if (events.length === 0) {
      return null;
    }

    // Determinar o status mais avançado
    const hasCompleted = events.some((e: any) => e.eventName === "QuizCompleted");
    if (hasCompleted) {
      return "Quiz Concluído";
    }

    const hasAbandoned = events.some((e: any) => e.eventName === "QuizAbandoned");
    if (hasAbandoned) {
      return "Quiz Abandonado";
    }

    const hasStarted = events.some((e: any) => e.eventName === "QuizStarted");
    if (hasStarted) {
      return "Quiz Iniciado";
    }

    return null;
  } catch (error) {
    console.error(`[Quiz Events] Erro ao obter status do quiz para lead ${leadId}:`, error);
    return null;
  }
}

/**
 * Obter todos os eventos de quiz para um lead
 */
export async function getQuizEvents(leadId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const events = await db
      .select()
      .from(quizEvents)
      .where(eq(quizEvents.leadId, leadId))
      .orderBy((t: any) => t.createdAt);

    return events;
  } catch (error) {
    console.error(`[Quiz Events] Erro ao obter eventos do quiz para lead ${leadId}:`, error);
    return [];
  }
}
