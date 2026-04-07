import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const quizResponses = mysqlTable("quiz_responses", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  step1: text("step1"), // Como você se sente espiritualmente hoje?
  step2: text("step2"), // O que mais tem dificultado sua constância com Deus?
  step3: text("step3"), // Como está sua rotina com a Palavra?
  step4: text("step4"), // Como você descreveria sua vida de oração hoje?
  step5: text("step5"), // O que você mais sente falta hoje na sua vida com Deus?
  step6: text("step6"), // O que você sente que mais tem sido tratado em você nessa fase?
  step7: text("step7"), // O que você mais deseja viver com Deus agora?
  step8: text("step8"), // Quanto tempo por dia você consegue separar com intencionalidade?
  step9: text("step9"), // Você sente que sua dificuldade maior é mais…
  step10: text("step10"), // Hoje, no fundo, você sente que está…
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = typeof quizResponses.$inferInsert;

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("brl").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  productName: text("productName").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const diagnosticHistory = mysqlTable("diagnostic_history", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  profileName: varchar("profileName", { length: 255 }).notNull(),
  profileDescription: text("profileDescription").notNull(),
  strengths: text("strengths").notNull(), // JSON stringified array
  challenges: text("challenges").notNull(), // JSON stringified array
  recommendations: text("recommendations").notNull(), // JSON stringified array
  nextSteps: text("nextSteps").notNull(), // JSON stringified array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiagnosticHistory = typeof diagnosticHistory.$inferSelect;
export type InsertDiagnosticHistory = typeof diagnosticHistory.$inferInsert;
