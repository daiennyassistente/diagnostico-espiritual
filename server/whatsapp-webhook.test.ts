import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { leads, diagnosticHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendDevocionalPdfViaWhatsApp, testTwilioConnection } from "./_core/twilio";

describe("WhatsApp Integration", () => {
  let testLeadId: number;
  const testPhoneNumber = "+5585984463738";
  const testEmail = `whatsapp-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Criar um lead de teste com WhatsApp
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .insert(leads)
      .values({
        name: "Teste WhatsApp",
        email: testEmail,
        whatsapp: testPhoneNumber,
      })
      .returning({ id: leads.id });

    testLeadId = result[0].id;

    // Criar um diagnóstico de teste
    await db.insert(diagnosticHistory).values({
      leadId: testLeadId,
      profileName: "Teste Espiritual",
      profileDescription: "Descrição de teste",
      strengths: JSON.stringify(["Força 1", "Força 2"]),
      challenges: JSON.stringify(["Desafio 1", "Desafio 2"]),
      recommendations: JSON.stringify(["Recomendação 1"]),
      nextSteps: JSON.stringify(["Próximo passo 1"]),
    });
  });

  afterAll(async () => {
    // Limpar dados de teste
    const db = await getDb();
    if (!db) return;

    await db.delete(diagnosticHistory).where(eq(diagnosticHistory.leadId, testLeadId));
    await db.delete(leads).where(eq(leads.id, testLeadId));
  });

  it("should connect to Twilio", async () => {
    const result = await testTwilioConnection();
    expect(result).toBe(true);
  });

  it("should send WhatsApp message with test PDF URL", async () => {
    // URL de teste de um PDF
    const testPdfUrl = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table1.pdf";

    const result = await sendDevocionalPdfViaWhatsApp(
      testPhoneNumber,
      testPdfUrl,
      "Teste WhatsApp"
    );

    // O resultado deve ser true se a mensagem foi enviada com sucesso
    expect(result).toBe(true);
  });
});
