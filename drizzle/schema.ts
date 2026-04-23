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
  passwordHash: varchar("passwordHash", { length: 255 }), // For basic username/password login
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
  quizId: varchar("quizId", { length: 36 }).notNull(), // UUID único para cada tentativa de quiz
  leadId: int("leadId").notNull(),
  step1: text("step1"), // Qual é o seu nome?
  step2: text("step2"), // Como você se sente espiritualmente hoje?
  step3: text("step3"), // O que mais tem dificultado sua constância com Deus?
  step4: text("step4"), // Como está sua rotina com a Palavra?
  step5: text("step5"), // Como você descreveria sua vida de oração hoje?
  step6: text("step6"), // O que você mais sente falta hoje na sua vida com Deus?
  step7: text("step7"), // O que você sente que mais tem sido tratado em você nessa fase?
  step8: text("step8"), // O que você mais deseja viver com Deus agora?
  step9: text("step9"), // Quanto tempo por dia você consegue separar com intencionalidade?
  step10: text("step10"), // Você sente que sua dificuldade maior é mais…
  step11: text("step11"), // Hoje, no fundo, você sente que está…
  step12: text("step12"), // Algo que você queira acrescentar ou desabafar?
  paid: int("paid").default(0).notNull(), // 0 = não pago, 1 = pago (para evitar problemas com boolean)
  emailSent: int("emailSent").default(0).notNull(), // 0 = não enviado, 1 = enviado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = typeof quizResponses.$inferInsert;

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull().unique(), // UUID único para identificar cada usuário
  name: varchar("name", { length: 255 }), // Nome da pessoa coletado na primeira pergunta
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
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),

  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("brl").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled", "approved"]).default("pending").notNull(),
  productName: text("productName").notNull(),
  downloadToken: varchar("downloadToken", { length: 255 }), // Token para download do PDF
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

export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  step: int("step").notNull(), // 1-10
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON stringified array of options
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

export const buyers = mysqlTable("buyers", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),  // Referência ao lead para puxar dados reais
  paymentId: varchar("paymentId", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),  // Telefone do comprador
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("brl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Buyer = typeof buyers.$inferSelect;
export type InsertBuyer = typeof buyers.$inferInsert;

export const devotionalDeliveries = mysqlTable("devotional_deliveries", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 255 }).notNull().unique(), // ID único do pagamento (Mercado Pago, Stripe, etc)
  paymentId: int("paymentId").notNull(), // Referência à tabela payments
  leadId: int("leadId").notNull(), // Referência ao lead
  email: varchar("email", { length: 320 }).notNull(), // Email do comprador
  productName: text("productName").notNull(), // Nome do produto entregue
  status: mysqlEnum("status", ["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"), // Data/hora do envio
  failureReason: text("failureReason"), // Motivo da falha, se houver
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DevotionalDelivery = typeof devotionalDeliveries.$inferSelect;
export type InsertDevotionalDelivery = typeof devotionalDeliveries.$inferInsert;

// Tabela de controle de transações para evitar duplicações
export const transactionControl = mysqlTable("transaction_control", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 255 }).notNull().unique(), // ID único da transação (Mercado Pago payment ID)
  quizId: varchar("quizId", { length: 36 }).notNull(), // UUID do quiz
  leadId: int("leadId").notNull(), // ID do lead
  status: mysqlEnum("status", ["pending", "approved", "failed", "cancelled"]).default("pending").notNull(),
  processed: int("processed").default(0).notNull(), // 0 = não processado, 1 = processado (evita duplicação)
  emailSent: int("emailSent").default(0).notNull(), // 0 = não enviado, 1 = enviado
  productReleased: int("productReleased").default(0).notNull(), // 0 = não liberado, 1 = liberado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransactionControl = typeof transactionControl.$inferSelect;
export type InsertTransactionControl = typeof transactionControl.$inferInsert;
