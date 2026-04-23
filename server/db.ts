import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
import bcrypt from "bcrypt";
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
  admins,
  buyers,
  devotionalDeliveries,
  InsertDevotionalDelivery,
  transactionControl,
  InsertTransactionControl,
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

  try {
    const result = await db.insert(leads).values(lead);

    // Drizzle-orm retorna um objeto com insertId
    const insertId = (result as any).insertId || (result as any)[0]?.insertId;
    if (insertId) {
      return { id: Number(insertId) };
    }

    // Se não conseguir o insertId, tenta buscar o lead mais recente
    const latestLead = await db.select().from(leads).orderBy(desc(leads.id)).limit(1);
    if (latestLead && latestLead.length > 0) {
      return { id: latestLead[0].id };
    }

    throw new Error("Failed to retrieve inserted lead ID");
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

export async function createQuizResponse(response: InsertQuizResponse) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(quizResponses).values(response);

    // Drizzle-orm retorna um objeto com insertId
    const insertId = (result as any).insertId || (result as any)[0]?.insertId;
    if (insertId) {
      return { id: Number(insertId) };
    }

    // Se não conseguir o insertId, tenta buscar a resposta mais recente
    const latestResponse = await db.select().from(quizResponses).orderBy(desc(quizResponses.id)).limit(1);
    if (latestResponse && latestResponse.length > 0) {
      return { id: latestResponse[0].id };
    }

    throw new Error("Failed to retrieve inserted quiz response ID");
  } catch (error) {
    console.error("Error creating quiz response:", error);
    throw error;
  }
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

export async function getLeadByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLeadByUserId(userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(leads).where(eq(leads.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuizResponseByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(quizResponses)
    .where(eq(quizResponses.leadId, leadId))
    .orderBy(desc(quizResponses.id))
    .limit(1);
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
      name: leads.name,
      email: leads.email,
      whatsapp: leads.whatsapp,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      openId: sql`NULL`.as("openId"),
      loginMethod: sql`'quiz'`.as("loginMethod"),
      role: sql`'user'`.as("role"),
      lastSignedIn: leads.updatedAt,
      status: sql`CASE 
        WHEN ${payments.status} = 'approved' THEN 'comprou'
        WHEN ${payments.status} IN ('pending', 'processing') THEN 'pendente'
        ELSE 'quiz'
      END`.as("status"),
    })
    .from(leads)
    .innerJoin(quizResponses, eq(leads.id, quizResponses.leadId))
    .leftJoin(payments, eq(leads.id, payments.leadId))
    .orderBy(desc(leads.updatedAt), desc(leads.createdAt));

  return records;
}

export async function getAdminBuyers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Puxar dados dos compradores
  const records = await db
    .select({
      id: buyers.id,
      paymentId: buyers.paymentId,
      email: buyers.email,
      name: buyers.name,
      phone: buyers.phone,
      amount: buyers.amount,
      currency: buyers.currency,
      createdAt: buyers.createdAt,
    })
    .from(buyers)
    .orderBy(desc(buyers.createdAt));

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
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      return bcrypt.compareSync(password, hash);
    }
    
    // Otherwise, assume it's PBKDF2 format (salt:hash)
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

export async function createOrUpdateAdminUser(name: string, password: string, email?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = hashPassword(password);
  const openId = `admin-${name}-${Date.now()}`;
  const adminEmail = email || `${name.toLowerCase()}@example.com`;

  // Try to find by email first, then by name
  let existingUser: typeof users.$inferSelect | undefined = email ? await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]) : undefined;
  if (!existingUser) {
    existingUser = await getUserByName(name);
  }
  
  if (existingUser) {
    // Update existing user
    await db
      .update(users)
      .set({
        passwordHash,
        role: "admin",
        email: adminEmail,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));
    return existingUser;
  } else {
    // Create new admin user
    const result = await db.insert(users).values({
      openId,
      name,
      email: adminEmail,
      passwordHash,
      role: "admin",
      loginMethod: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    
    return await db.select().from(users).where(eq(users.email, adminEmail)).limit(1).then(r => r[0]);
  }
}

export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result.length > 0 ? result[0] : undefined;
  
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
      paymentAmount: sql<number | null>`(SELECT amount FROM ${payments} WHERE ${payments.leadId} = ${leads.id} LIMIT 1)`,
      paymentStatus: sql<string | null>`(SELECT status FROM ${payments} WHERE ${payments.leadId} = ${leads.id} LIMIT 1)`,
      paymentId: sql<number | null>`(SELECT id FROM ${payments} WHERE ${payments.leadId} = ${leads.id} LIMIT 1)`,
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


export async function unlockAccessForLead(leadId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Mark the lead as having access granted
    // This can be used to track manual access grants
    await db
      .update(leads)
      .set({ 
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));
    
    return true;
  } catch (error) {
    console.error("Error unlocking access:", error);
    return false;
  }
}

export async function getLeadWithDiagnostic(leadId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const lead = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (lead.length === 0) return null;

  const diagnostic = await db
    .select()
    .from(diagnosticHistory)
    .where(eq(diagnosticHistory.leadId, leadId))
    .limit(1);

  if (diagnostic.length === 0) return null;

  return {
    ...lead[0],
    diagnostic: diagnostic[0],
  };
}


// Quiz Questions Management
export async function getAllQuizQuestions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { quizQuestions } = await import("../drizzle/schema");
  const questions = await db.select().from(quizQuestions).orderBy(quizQuestions.step);
  return questions.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  }));
}

export async function updateQuizQuestion(id: number, question: string, options: string[]) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { quizQuestions } = await import("../drizzle/schema");
  await db.update(quizQuestions)
    .set({ 
      question, 
      options: JSON.stringify(options),
      updatedAt: new Date()
    })
    .where(eq(quizQuestions.id, id));
  return { success: true };
}

export async function createQuizQuestion(step: number, question: string, options: string[]) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { quizQuestions } = await import("../drizzle/schema");
  await db.insert(quizQuestions).values({
    step,
    question,
    options: JSON.stringify(options)
  });
  return { success: true };
}

export async function deleteQuizQuestion(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { quizQuestions } = await import("../drizzle/schema");
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
  return { success: true };
}


export async function getPaymentByToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.downloadToken, token))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getDiagnosticByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(diagnosticHistory)
    .where(eq(diagnosticHistory.leadId, leadId))
    .orderBy(desc(diagnosticHistory.id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(admins).where(eq(admins.username, username));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting admin by username:", error);
    return null;
  }
}


export async function getLeadWithDiagnosticByToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.downloadToken, token))
    .limit(1);

  if (!payment || payment.length === 0) {
    return null;
  }

  const diagnostic = await db
    .select()
    .from(diagnosticHistory)
    .where(eq(diagnosticHistory.leadId, payment[0].leadId))
    .limit(1);

  if (!diagnostic || diagnostic.length === 0) {
    return null;
  }

  const lead = await db
    .select()
    .from(leads)
    .where(eq(leads.id, payment[0].leadId))
    .limit(1);

  if (!lead || lead.length === 0) {
    return null;
  }

  const quizResponse = await db
    .select()
    .from(quizResponses)
    .where(eq(quizResponses.leadId, payment[0].leadId))
    .limit(1);

  try {
    return {
      profileName: diagnostic[0].profileName,
      profileDescription: diagnostic[0].profileDescription,
      strengths: Array.isArray(diagnostic[0].strengths) ? diagnostic[0].strengths : JSON.parse(diagnostic[0].strengths || '[]'),
      challenges: Array.isArray(diagnostic[0].challenges) ? diagnostic[0].challenges : JSON.parse(diagnostic[0].challenges || '[]'),
      recommendations: Array.isArray(diagnostic[0].recommendations) ? diagnostic[0].recommendations : JSON.parse(diagnostic[0].recommendations || '[]'),
      nextSteps: Array.isArray(diagnostic[0].nextSteps) ? diagnostic[0].nextSteps : JSON.parse(diagnostic[0].nextSteps || '[]'),
      userResponses: quizResponse?.[0] || null,
    };
  } catch (error) {
    console.error('Error parsing diagnostic data:', error);
    console.error('Diagnostic data:', diagnostic[0]);
    throw error;
  }
}

export async function updatePaymentDownloadToken(leadId: number, token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.leadId, leadId))
    .limit(1);

  if (!payment || payment.length === 0) {
    // Create a new payment record if it doesn't exist
    await db.insert(payments).values({
      leadId,
      amount: 0,
      currency: "brl",
      status: "pending",
      productName: "Diagnóstico Espiritual",
      downloadToken: token,
    });
  } else {
    await db
      .update(payments)
      .set({ downloadToken: token })
      .where(eq(payments.id, payment[0].id));
  }
}


export async function createPayment(paymentData: {
  leadId: number;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled" | "approved";
  productName: string;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const normalizedAmount = Math.round(paymentData.amount * 100);
  const existingPayment = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.leadId, paymentData.leadId))
    .limit(1);

  if (existingPayment.length > 0) {
    return db
      .update(payments)
      .set({
        amount: normalizedAmount,
        currency: paymentData.currency,
        status: paymentData.status,
        productName: paymentData.productName,
        stripePaymentIntentId: paymentData.stripePaymentIntentId || null,
        stripeCustomerId: paymentData.stripeCustomerId || null,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment[0].id));
  }

  return db.execute(sql`
    INSERT INTO payments (
      leadId,
      stripePaymentIntentId,
      stripeCustomerId,
      amount,
      currency,
      status,
      productName,
      createdAt,
      updatedAt
    ) VALUES (
      ${paymentData.leadId},
      ${paymentData.stripePaymentIntentId || null},
      ${paymentData.stripeCustomerId || null},
      ${normalizedAmount},
      ${paymentData.currency},
      ${paymentData.status},
      ${paymentData.productName},
      NOW(),
      NOW()
    )
  `);
}


// ============================================
// Funções para controle de entregas de devocionais
// ============================================

/**
 * Verifica se um devocional já foi entregue para um transaction_id específico
 */
export async function checkDevotionalDeliveryExists(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({ id: devotionalDeliveries.id, status: devotionalDeliveries.status })
    .from(devotionalDeliveries)
    .where(eq(devotionalDeliveries.transactionId, transactionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Registra uma entrega de devocional com proteção contra duplicidade
 */
export async function createDevotionalDelivery(data: InsertDevotionalDelivery) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verifica se já existe uma entrega para este transaction_id
    const existing = await checkDevotionalDeliveryExists(data.transactionId);
    if (existing) {
      console.warn(`[Devotional] Delivery already exists for transaction_id: ${data.transactionId}`);
      return existing;
    }

    const result = await db.insert(devotionalDeliveries).values(data);
    return result;
  } catch (error: any) {
    // Se o erro for de duplicidade de transactionId, retorna o registro existente
    if (error.code === 'ER_DUP_ENTRY') {
      console.warn(`[Devotional] Duplicate transaction_id detected: ${data.transactionId}`);
      return await checkDevotionalDeliveryExists(data.transactionId);
    }
    throw error;
  }
}

/**
 * Atualiza o status de uma entrega de devocional
 */
export async function updateDevotionalDeliveryStatus(
  transactionId: string,
  status: "pending" | "sent" | "failed" | "cancelled",
  failureReason?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === "sent") {
    updateData.sentAt = new Date();
  }

  if (failureReason) {
    updateData.failureReason = failureReason;
  }

  return db
    .update(devotionalDeliveries)
    .set(updateData)
    .where(eq(devotionalDeliveries.transactionId, transactionId));
}

/**
 * Obtém o histórico de entregas para um lead
 */
export async function getDevotionalDeliveriesByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(devotionalDeliveries)
    .where(eq(devotionalDeliveries.leadId, leadId))
    .orderBy(desc(devotionalDeliveries.createdAt));
}

/**
 * Obtém o histórico de entregas para um email
 */
export async function getDevotionalDeliveriesByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(devotionalDeliveries)
    .where(eq(devotionalDeliveries.email, email))
    .orderBy(desc(devotionalDeliveries.createdAt));
}

/**
 * Obtém uma entrega específica por transaction_id
 */
export async function getDevotionalDeliveryByTransactionId(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(devotionalDeliveries)
    .where(eq(devotionalDeliveries.transactionId, transactionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


/**
 * Cria um registro de controle de transação
 */
export async function createTransactionControl(data: InsertTransactionControl) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(transactionControl).values(data);
  return result;
}

/**
 * Obtém um registro de controle de transação por transaction_id
 */
export async function getTransactionControl(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(transactionControl)
    .where(eq(transactionControl.transactionId, transactionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Atualiza o status de uma transação
 */
export async function updateTransactionStatus(transactionId: string, status: "pending" | "approved" | "failed" | "cancelled") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(transactionControl)
    .set({ status })
    .where(eq(transactionControl.transactionId, transactionId));
}

/**
 * Marca uma transação como processada
 */
export async function markTransactionAsProcessed(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(transactionControl)
    .set({ processed: 1 })
    .where(eq(transactionControl.transactionId, transactionId));
}

/**
 * Marca email como enviado
 */
export async function markTransactionEmailSent(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(transactionControl)
    .set({ emailSent: 1 })
    .where(eq(transactionControl.transactionId, transactionId));
}

/**
 * Marca produto como liberado
 */
export async function markTransactionProductReleased(transactionId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(transactionControl)
    .set({ productReleased: 1 })
    .where(eq(transactionControl.transactionId, transactionId));
}


/**
 * Obtém um diagnóstico específico pelo resultId (diagnostic_history.id)
 */
export async function getDiagnosticById(resultId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(diagnosticHistory)
    .where(eq(diagnosticHistory.id, resultId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
