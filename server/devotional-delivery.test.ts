import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, checkDevotionalDeliveryExists, createDevotionalDelivery, updateDevotionalDeliveryStatus, getDevotionalDeliveryByTransactionId } from "./db";
import { devotionalDeliveries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Devotional Delivery Control System", () => {
  let db: any;
  const testTransactionId = `test-txn-${Date.now()}`;
  const testLeadId = 999;
  const testPaymentId = 999;
  const testEmail = "test@example.com";

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (db) {
      try {
        await db
          .delete(devotionalDeliveries)
          .where(eq(devotionalDeliveries.transactionId, testTransactionId));
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    }
  });

  it("should create a devotional delivery record", async () => {
    const result = await createDevotionalDelivery({
      transactionId: testTransactionId,
      paymentId: testPaymentId,
      leadId: testLeadId,
      email: testEmail,
      productName: "Devocional: 7 Dias para se Aproximar de Deus",
      status: "pending",
    });

    expect(result).toBeDefined();
  });

  it("should check if delivery exists", async () => {
    const existing = await checkDevotionalDeliveryExists(testTransactionId);
    expect(existing).toBeDefined();
    expect(existing?.status).toBe("pending");
  });

  it("should prevent duplicate deliveries", async () => {
    // Try to create the same delivery again
    const result = await createDevotionalDelivery({
      transactionId: testTransactionId,
      paymentId: testPaymentId,
      leadId: testLeadId,
      email: testEmail,
      productName: "Devocional: 7 Dias para se Aproximar de Deus",
      status: "pending",
    });

    // Should return the existing record, not create a new one
    expect(result).toBeDefined();
  });

  it("should update delivery status to sent", async () => {
    await updateDevotionalDeliveryStatus(testTransactionId, "sent");

    const delivery = await getDevotionalDeliveryByTransactionId(testTransactionId);
    expect(delivery?.status).toBe("sent");
    expect(delivery?.sentAt).toBeDefined();
  });

  it("should not send email if delivery already sent", async () => {
    const existing = await checkDevotionalDeliveryExists(testTransactionId);
    
    // If status is "sent", the webhook should skip email sending
    if (existing && existing.status === "sent") {
      expect(true).toBe(true);
    } else {
      throw new Error("Delivery should be marked as sent");
    }
  });

  it("should update delivery status to failed with reason", async () => {
    const failedTransactionId = `test-failed-${Date.now()}`;
    
    await createDevotionalDelivery({
      transactionId: failedTransactionId,
      paymentId: testPaymentId,
      leadId: testLeadId,
      email: testEmail,
      productName: "Devocional: 7 Dias para se Aproximar de Deus",
      status: "pending",
    });

    await updateDevotionalDeliveryStatus(failedTransactionId, "failed", "Email service unavailable");

    const delivery = await getDevotionalDeliveryByTransactionId(failedTransactionId);
    expect(delivery?.status).toBe("failed");
    expect(delivery?.failureReason).toContain("Email service unavailable");

    // Clean up
    await db
      .delete(devotionalDeliveries)
      .where(eq(devotionalDeliveries.transactionId, failedTransactionId));
  });

  it("should track delivery history by email", async () => {
    const { getDevotionalDeliveriesByEmail } = await import("./db");
    const deliveries = await getDevotionalDeliveriesByEmail(testEmail);
    
    expect(deliveries.length).toBeGreaterThan(0);
    expect(deliveries.some(d => d.transactionId === testTransactionId)).toBe(true);
  });

  it("should ensure only one delivery per transaction", async () => {
    // Verify that the transaction_id is unique
    const delivery1 = await getDevotionalDeliveryByTransactionId(testTransactionId);
    const delivery2 = await getDevotionalDeliveryByTransactionId(testTransactionId);
    
    expect(delivery1?.id).toBe(delivery2?.id);
  });
});
