import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getDb, createLead, getAdminBuyers } from "./db";
import { buyers, leads } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("getAdminBuyers", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testLeadId: number;
  let testBuyerId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }

    // Create a test lead
    const leadResult = await createLead({
      name: "Test Buyer",
      email: "testbuyer@example.com",
      whatsapp: "5511999999999",
    });
    testLeadId = leadResult.id;

    // Create a test buyer
    const result = await db.insert(buyers).values({
      paymentId: `test-payment-${Date.now()}`,
      leadId: testLeadId,
      email: "testbuyer@example.com",
      name: "Test Buyer",
      phone: "5511999999999",
      amount: 1290, // R$ 12,90
      currency: "brl",
    });

    // Get the inserted buyer ID
    const insertedBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.paymentId, `test-payment-${Date.now()}`))
      .limit(1);

    if (insertedBuyer.length > 0) {
      testBuyerId = insertedBuyer[0].id;
    }
  });

  afterAll(async () => {
    if (db && testBuyerId) {
      // Clean up test data
      await db.delete(buyers).where(eq(buyers.id, testBuyerId));
    }
    if (db && testLeadId) {
      await db.delete(leads).where(eq(leads.id, testLeadId));
    }
  });

  it("should return buyers with all required fields including phone", async () => {
    const buyersList = await getAdminBuyers();

    expect(buyersList).toBeDefined();
    expect(Array.isArray(buyersList)).toBe(true);

    // Check that the returned buyers have the phone field
    const buyerWithPhone = buyersList.find((b) => b.phone !== null);
    if (buyerWithPhone) {
      expect(buyerWithPhone).toHaveProperty("id");
      expect(buyerWithPhone).toHaveProperty("paymentId");
      expect(buyerWithPhone).toHaveProperty("email");
      expect(buyerWithPhone).toHaveProperty("name");
      expect(buyerWithPhone).toHaveProperty("phone");
      expect(buyerWithPhone).toHaveProperty("amount");
      expect(buyerWithPhone).toHaveProperty("currency");
      expect(buyerWithPhone).toHaveProperty("createdAt");
    }
  });

  it("should return buyers ordered by creation date (newest first)", async () => {
    const buyersList = await getAdminBuyers();

    if (buyersList.length > 1) {
      // Check that the list is ordered by createdAt descending
      for (let i = 0; i < buyersList.length - 1; i++) {
        const current = new Date(buyersList[i]!.createdAt).getTime();
        const next = new Date(buyersList[i + 1]!.createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
});
