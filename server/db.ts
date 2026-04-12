import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, quizResponses, InsertLead, InsertQuizResponse } from "../drizzle/schema";
import { ENV } from './_core/env';
import { sql } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Inserir o lead e obter o resultado
  const result = await db.insert(leads).values(lead);
  
  // O resultado do insert do Drizzle com mysql2 é um array
  // onde o primeiro elemento é o ResultSetHeader com insertId
  if (Array.isArray(result) && result.length > 0) {
    const header = result[0] as any;
    if (header && header.insertId) {
      return { id: Number(header.insertId) };
    }
  }
  
  // Fallback: tentar acessar insertId diretamente
  if (result && typeof result === 'object') {
    const insertId = (result as any).insertId;
    if (insertId) {
      return { id: Number(insertId) };
    }
  }
  
  throw new Error("Failed to retrieve inserted lead ID from insert result");
}

export async function createQuizResponse(response: InsertQuizResponse) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(quizResponses).values(response);
  return result;
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuizResponseByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(quizResponses).where(eq(quizResponses.leadId, leadId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


export async function getAllQuizResponses() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allResponses = await db
    .select({
      id: quizResponses.id,
      leadId: quizResponses.leadId,
      whatsapp: leads.whatsapp,
      email: leads.email,
      step1: quizResponses.step1,
      step2: quizResponses.step2,
      step3: quizResponses.step3,
      step4: quizResponses.step4,
      step5: quizResponses.step5,
      step6: quizResponses.step6,
      step7: quizResponses.step7,
      step8: quizResponses.step8,
      step9: quizResponses.step9,
      step10: quizResponses.step10,
      createdAt: quizResponses.createdAt,
    })
    .from(quizResponses)
    .innerJoin(leads, eq(quizResponses.leadId, leads.id));

  return allResponses;
}

export async function getResponseStatistics() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allResponses = await getAllQuizResponses();

  // Contar respostas por etapa
  const stats: Record<string, any> = {
    totalRespostas: allResponses.length,
    step1: {} as Record<string, number>,
    step2: {} as Record<string, number>,
    step3: {} as Record<string, number>,
    step4: {} as Record<string, number>,
    step5: {} as Record<string, number>,
    step6: {} as Record<string, number>,
    step7: {} as Record<string, number>,
    step8: {} as Record<string, number>,
    step9: {} as Record<string, number>,
    step10: {} as Record<string, number>,
  }

  allResponses.forEach((response) => {
    for (let i = 1; i <= 10; i++) {
      const stepKey = `step${i}` as 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'step9' | 'step10';
      const answer = response[stepKey];
      if (answer) {
        const statsKey = `step${i}` as 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'step9' | 'step10';
        const stepStats = stats[statsKey] as Record<string, number>;
        stepStats[answer] = (stepStats[answer] || 0) + 1;
      }
    }
  });

  return stats;
}
