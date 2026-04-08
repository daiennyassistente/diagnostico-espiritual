import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  InsertDiagnosticHistory,
  InsertLead,
  InsertQuizResponse,
  InsertUser,
  diagnosticHistory,
  leads,
  payments,
  quizResponses,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db.insert(leads).values(lead);

  if (Array.isArray(result) && result.length > 0) {
    const header = result[0] as any;
    if (header && header.insertId) {
      return { id: Number(header.insertId) };
    }
  }

  if (result && typeof result === "object") {
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

export async function createDiagnosticHistoryEntry(entry: InsertDiagnosticHistory) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(diagnosticHistory).values(entry);
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
  const allResponses = await getAllQuizResponses();

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
  };

  allResponses.forEach((response) => {
    for (let i = 1; i <= 10; i += 1) {
      const stepKey = `step${i}` as
        | "step1"
        | "step2"
        | "step3"
        | "step4"
        | "step5"
        | "step6"
        | "step7"
        | "step8"
        | "step9"
        | "step10";
      const answer = response[stepKey];
      if (answer) {
        const stepStats = stats[stepKey] as Record<string, number>;
        stepStats[answer] = (stepStats[answer] || 0) + 1;
      }
    }
  });

  return stats;
}

const formatDateKey = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);

const safeNumber = (value: unknown) => Number(value || 0);

export async function getAdminUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get all leads that have quiz responses (people who took the quiz)
  const records = await db
    .selectDistinct({
      id: leads.id,
      name: sql`SUBSTRING_INDEX(${leads.email}, '@', 1)`.as("name"),
      email: leads.email,
      whatsapp: leads.whatsapp,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      openId: sql`NULL`.as("openId"),
      loginMethod: sql`'quiz'`.as("loginMethod"),
      role: sql`'user'`.as("role"),
      lastSignedIn: leads.updatedAt,
    })
    .from(leads)
    .innerJoin(quizResponses, eq(leads.id, quizResponses.leadId))
    .orderBy(desc(leads.updatedAt), desc(leads.createdAt));

  return records;
}

export async function getAdminBuyers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const records = await db
    .select({
      id: payments.id,
      leadId: payments.leadId,
      email: leads.email,
      whatsapp: leads.whatsapp,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      productName: payments.productName,
      stripePaymentIntentId: payments.stripePaymentIntentId,
      stripeCustomerId: payments.stripeCustomerId,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
    })
    .from(payments)
    .innerJoin(leads, eq(payments.leadId, leads.id))
    .orderBy(desc(payments.createdAt));

  return records;
}

export async function getAdminDiagnosticResults() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const records = await db
    .select({
      id: diagnosticHistory.id,
      leadId: diagnosticHistory.leadId,
      email: leads.email,
      whatsapp: leads.whatsapp,
      profileName: diagnosticHistory.profileName,
      profileDescription: diagnosticHistory.profileDescription,
      strengths: diagnosticHistory.strengths,
      challenges: diagnosticHistory.challenges,
      recommendations: diagnosticHistory.recommendations,
      nextSteps: diagnosticHistory.nextSteps,
      createdAt: diagnosticHistory.createdAt,
    })
    .from(diagnosticHistory)
    .innerJoin(leads, eq(diagnosticHistory.leadId, leads.id))
    .orderBy(desc(diagnosticHistory.createdAt));

  return records.map((record) => ({
    ...record,
    strengths: JSON.parse(record.strengths || "[]") as string[],
    challenges: JSON.parse(record.challenges || "[]") as string[],
    recommendations: JSON.parse(record.recommendations || "[]") as string[],
    nextSteps: JSON.parse(record.nextSteps || "[]") as string[],
  }));
}

export async function getAdminDashboardSummary() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [userTotals] = await db.select({ total: sql<number>`count(*)` }).from(users);
  const [leadTotals] = await db.select({ total: sql<number>`count(*)` }).from(leads);
  const [paymentTotals] = await db.select({ total: sql<number>`count(*)` }).from(payments);
  const [diagnosticTotals] = await db.select({ total: sql<number>`count(*)` }).from(diagnosticHistory);
  const [successfulPayments] = await db
    .select({ total: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.status, "succeeded"));

  const [recentUsers] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo));
  const [recentLeads] = await db
    .select({ total: sql<number>`count(*)` })
    .from(leads)
    .where(gte(leads.createdAt, thirtyDaysAgo));
  const [recentDiagnostics] = await db
    .select({ total: sql<number>`count(*)` })
    .from(diagnosticHistory)
    .where(gte(diagnosticHistory.createdAt, thirtyDaysAgo));

  const recentLeadRows = await db
    .select({ createdAt: leads.createdAt })
    .from(leads)
    .where(gte(leads.createdAt, thirtyDaysAgo))
    .orderBy(leads.createdAt);

  const recentPaymentRows = await db
    .select({ createdAt: payments.createdAt, amount: payments.amount, status: payments.status })
    .from(payments)
    .where(gte(payments.createdAt, thirtyDaysAgo))
    .orderBy(payments.createdAt);

  const profileRows = await db
    .select({ profileName: diagnosticHistory.profileName, total: sql<number>`count(*)` })
    .from(diagnosticHistory)
    .groupBy(diagnosticHistory.profileName)
    .orderBy(desc(sql<number>`count(*)`));

  const leadsByDayMap = new Map<string, number>();
  recentLeadRows.forEach((row) => {
    const key = formatDateKey(new Date(row.createdAt));
    leadsByDayMap.set(key, (leadsByDayMap.get(key) || 0) + 1);
  });

  const paymentsByDayMap = new Map<string, { count: number; revenue: number }>();
  recentPaymentRows.forEach((row) => {
    const key = formatDateKey(new Date(row.createdAt));
    const current = paymentsByDayMap.get(key) || { count: 0, revenue: 0 };
    paymentsByDayMap.set(key, {
      count: current.count + (row.status === "succeeded" ? 1 : 0),
      revenue: current.revenue + (row.status === "succeeded" ? safeNumber(row.amount) : 0),
    });
  });

  const timelineLabels = Array.from(
    new Set(
      Array.from(leadsByDayMap.keys()).concat(Array.from(paymentsByDayMap.keys())),
    ),
  );

  const timeline = timelineLabels.map((date) => ({
    date,
    leads: leadsByDayMap.get(date) || 0,
    pagamentos: paymentsByDayMap.get(date)?.count || 0,
    receita: paymentsByDayMap.get(date)?.revenue || 0,
  }));

  const conversionRate = safeNumber(leadTotals?.total)
    ? (safeNumber(successfulPayments?.total) / safeNumber(leadTotals?.total)) * 100
    : 0;

  return {
    kpis: {
      totalUsuarios: safeNumber(userTotals?.total),
      novosUsuarios30Dias: safeNumber(recentUsers?.total),
      totalLeads: safeNumber(leadTotals?.total),
      leads30Dias: safeNumber(recentLeads?.total),
      totalCompras: safeNumber(paymentTotals?.total),
      comprasAprovadas: safeNumber(successfulPayments?.total),
      receitaTotal: safeNumber(successfulPayments?.revenue),
      totalDiagnosticos: safeNumber(diagnosticTotals?.total),
      diagnosticos30Dias: safeNumber(recentDiagnostics?.total),
      taxaConversao: Number(conversionRate.toFixed(1)),
    },
    timeline,
    perfilDistribuicao: profileRows.map((row) => ({
      name: row.profileName,
      value: safeNumber(row.total),
    })),
  };
}

export async function getAdminSnapshot() {
  const [summary, usersList, buyers, diagnostics] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminUsers(),
    getAdminBuyers(),
    getAdminDiagnosticResults(),
  ]);

  return {
    summary,
    users: usersList,
    buyers,
    diagnostics,
  };
}


// ============= PASSWORD AUTHENTICATION =============

/**
 * Simple password hashing using SHA-256 + salt
 * For production, consider using bcrypt or argon2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, storedHash] = hash.split(":");
    const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
    return computed === storedHash;
  } catch {
    return false;
  }
}

export async function getUserByName(name: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateAdminUser(name: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = hashPassword(password);
  const openId = `admin-${name}-${Date.now()}`;

  const existingUser = await getUserByName(name);
  
  if (existingUser) {
    // Update existing user
    await db
      .update(users)
      .set({
        passwordHash,
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));
    return existingUser;
  } else {
    // Create new admin user
    const result = await db.insert(users).values({
      openId,
      name,
      passwordHash,
      role: "admin",
      loginMethod: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    
    return await getUserByName(name);
  }
}

export async function authenticateUser(name: string, password: string) {
  const user = await getUserByName(name);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  if (verifyPassword(password, user.passwordHash)) {
    // Update lastSignedIn
    const db = await getDb();
    if (db) {
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));
    }
    return user;
  }

  return null;
}

// ============= SEARCH/FILTER FUNCTIONS =============

export async function searchLeads(query: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const searchPattern = `%${query}%`;
  const results = await db
    .select({
      id: leads.id,
      email: leads.email,
      whatsapp: leads.whatsapp,
      createdAt: leads.createdAt,
      hasQuizResponse: sql<boolean>`EXISTS(SELECT 1 FROM ${quizResponses} WHERE ${quizResponses.leadId} = ${leads.id})`,
    })
    .from(leads)
    .where(
      sql`${leads.email} LIKE ${searchPattern} OR ${leads.whatsapp} LIKE ${searchPattern}`
    )
    .orderBy(desc(leads.createdAt));

  return results;
}

export async function getAllLeadsWithQuizStatus() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db
    .select({
      id: leads.id,
      email: leads.email,
      whatsapp: leads.whatsapp,
      createdAt: leads.createdAt,
      hasQuizResponse: sql<boolean>`EXISTS(SELECT 1 FROM ${quizResponses} WHERE ${quizResponses.leadId} = ${leads.id})`,
      hasDiagnostic: sql<boolean>`EXISTS(SELECT 1 FROM ${diagnosticHistory} WHERE ${diagnosticHistory.leadId} = ${leads.id})`,
      hasPayment: sql<boolean>`EXISTS(SELECT 1 FROM ${payments} WHERE ${payments.leadId} = ${leads.id})`,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt));

  return results;
}

export async function getPaymentWithDiagnostic(paymentId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const payment = await db
    .select({
      id: payments.id,
      leadId: payments.leadId,
      email: leads.email,
      whatsapp: leads.whatsapp,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      productName: payments.productName,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(leads, eq(payments.leadId, leads.id))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (payment.length === 0) return null;

  const diagnostic = await db
    .select()
    .from(diagnosticHistory)
    .where(eq(diagnosticHistory.leadId, payment[0].leadId))
    .limit(1);

  return {
    ...payment[0],
    diagnostic: diagnostic.length > 0 ? diagnostic[0] : null,
  };
}
