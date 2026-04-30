import { getDb } from "./db";
import { quizEvents } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get the latest quiz status for a lead
 * Returns a human-readable status label with priority: Concluído > Abandonado > Iniciado
 */
export async function getLatestQuizStatusForAdmin(leadId: number): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }

    // Get all events for this lead, ordered by creation time
    const allEvents = await db
      .select({ eventName: quizEvents.eventName })
      .from(quizEvents)
      .where(eq(quizEvents.leadId, leadId))
      .orderBy(desc(quizEvents.createdAt));

    if (allEvents.length === 0) {
      return null;
    }

    // Priority: Concluído > Abandonado > Iniciado
    let status: string | null = null;
    
    for (const event of allEvents) {
      const eventName = event.eventName;
      
      if (eventName === "QuizCompleted") {
        status = "Quiz Concluído";
        break; // Highest priority, stop searching
      } else if (eventName === "QuizAbandoned" && status !== "Quiz Concluído") {
        status = "Quiz Abandonado";
      } else if (eventName === "QuizStarted" && !status) {
        status = "Quiz Iniciado";
      }
    }

    return status;
  } catch (error) {
    console.error(`Error getting quiz status for lead ${leadId}:`, error);
    return null;
  }
}

/**
 * Enrich admin user records with quiz status
 */
export async function enrichUsersWithQuizStatus(
  records: any[]
): Promise<any[]> {
  try {
    return await Promise.all(
      records.map(async (record) => ({
        ...record,
        quizStatus: await getLatestQuizStatusForAdmin(record.id),
      }))
    );
  } catch (error) {
    console.error("Error enriching users with quiz status:", error);
    return records;
  }
}
