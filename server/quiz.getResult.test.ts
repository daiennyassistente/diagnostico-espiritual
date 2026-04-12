import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "./db";
import { leads, quizResponses, diagnosticHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("quiz.getResult procedure", () => {
  let testLeadId: number;
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available for tests");
    }

    // Create a test lead
    const leadResult = await db.insert(leads).values({
      whatsapp: "11999999999",
      email: "test@example.com",
      name: "Test User",
    });
    
    testLeadId = Number(leadResult.insertId);

    // Create test quiz responses
    await db.insert(quizResponses).values({
      leadId: testLeadId,
      step1: "Test User",
      step2: "Feeling distant",
      step3: "Lack of time",
      step4: "Irregular",
      step5: "Weak",
      step6: "Connection with God",
      step7: "Nothing specific",
      step8: "Deeper relationship",
      step9: "10 minutes",
      step10: "Confused",
      step11: "Spiritually confused",
      step12: "I need help",
    });

    // Create test diagnostic history
    await db.insert(diagnosticHistory).values({
      leadId: testLeadId,
      profileName: "espiritualmente confuso(a)",
      profileDescription: "You are feeling spiritually confused and lost.",
      strengths: JSON.stringify(["Desire for change", "Openness to help"]),
      challenges: JSON.stringify(["Lack of direction", "Inconsistency"]),
      recommendations: JSON.stringify(["Start small", "Be consistent"]),
      nextSteps: JSON.stringify(["Begin today"]),
    });
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    await db.delete(diagnosticHistory).where(eq(diagnosticHistory.leadId, testLeadId));
    await db.delete(quizResponses).where(eq(quizResponses.leadId, testLeadId));
    await db.delete(leads).where(eq(leads.id, testLeadId));
  });

  it("should return lead, quiz responses, and diagnostic when valid leadId is provided", async () => {
    const { getLeadById, getQuizResponseByLeadId, getDiagnosticByLeadId } = await import('./db');

    const lead = await getLeadById(testLeadId);
    const quizResponse = await getQuizResponseByLeadId(testLeadId);
    const diagnostic = await getDiagnosticByLeadId(testLeadId);

    expect(lead).toBeDefined();
    expect(lead?.id).toBe(testLeadId);
    expect(lead?.email).toBe("test@example.com");

    expect(quizResponse).toBeDefined();
    expect(quizResponse?.leadId).toBe(testLeadId);
    expect(quizResponse?.step1).toBe("Test User");

    expect(diagnostic).toBeDefined();
    expect(diagnostic?.leadId).toBe(testLeadId);
    expect(diagnostic?.profileName).toBe("espiritualmente confuso(a)");
  });

  it("should return undefined for non-existent leadId", async () => {
    const { getLeadById } = await import('./db');
    const lead = await getLeadById(99999);
    expect(lead).toBeUndefined();
  });

  it("should parse JSON strings in diagnostic data", async () => {
    const { getDiagnosticByLeadId } = await import('./db');
    const diagnostic = await getDiagnosticByLeadId(testLeadId);

    expect(diagnostic).toBeDefined();
    
    const strengths = typeof diagnostic?.strengths === 'string' 
      ? JSON.parse(diagnostic.strengths) 
      : diagnostic?.strengths;
    const challenges = typeof diagnostic?.challenges === 'string' 
      ? JSON.parse(diagnostic.challenges) 
      : diagnostic?.challenges;
    const recommendations = typeof diagnostic?.recommendations === 'string' 
      ? JSON.parse(diagnostic.recommendations) 
      : diagnostic?.recommendations;
    const nextSteps = typeof diagnostic?.nextSteps === 'string' 
      ? JSON.parse(diagnostic.nextSteps) 
      : diagnostic?.nextSteps;

    expect(Array.isArray(strengths)).toBe(true);
    expect(Array.isArray(challenges)).toBe(true);
    expect(Array.isArray(recommendations)).toBe(true);
    expect(Array.isArray(nextSteps)).toBe(true);
  });

  it("should have all required quiz response fields", async () => {
    const { getQuizResponseByLeadId } = await import('./db');
    const quizResponse = await getQuizResponseByLeadId(testLeadId);

    expect(quizResponse?.step1).toBeDefined();
    expect(quizResponse?.step2).toBeDefined();
    expect(quizResponse?.step3).toBeDefined();
    expect(quizResponse?.step4).toBeDefined();
    expect(quizResponse?.step5).toBeDefined();
    expect(quizResponse?.step6).toBeDefined();
    expect(quizResponse?.step7).toBeDefined();
    expect(quizResponse?.step8).toBeDefined();
    expect(quizResponse?.step9).toBeDefined();
    expect(quizResponse?.step10).toBeDefined();
    expect(quizResponse?.step11).toBeDefined();
    expect(quizResponse?.step12).toBeDefined();
  });
});
