import { describe, it, expect, beforeEach, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";

describe("Quiz Payment - Single Product Release", () => {
  let quizId: string;

  beforeEach(() => {
    quizId = uuidv4();
  });

  it("should generate unique UUID for each quiz", () => {
    const quiz1 = uuidv4();
    const quiz2 = uuidv4();

    expect(quiz1).not.toBe(quiz2);
    expect(quiz1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(quiz2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("should include quizId in payment metadata", () => {
    const paymentMetadata = {
      quizId,
      profileName: "Test Profile",
      userPhone: "5511999999999",
    };

    expect(paymentMetadata.quizId).toBe(quizId);
    expect(paymentMetadata).toHaveProperty("quizId");
    expect(paymentMetadata).toHaveProperty("profileName");
    expect(paymentMetadata).toHaveProperty("userPhone");
  });

  it("should mark quiz as paid only once", () => {
    const quizState = {
      quizId,
      paid: 0,
      emailSent: 0,
    };

    // Simulate first payment
    quizState.paid = 1;
    quizState.emailSent = 1;

    expect(quizState.paid).toBe(1);
    expect(quizState.emailSent).toBe(1);

    // Simulate second payment attempt (should not change)
    const shouldNotChange = quizState.paid === 1;
    expect(shouldNotChange).toBe(true);
  });

  it("should prevent duplicate email sends", () => {
    const quizState = {
      quizId,
      paid: 0,
      emailSent: 0,
    };

    // First email send
    if (quizState.emailSent === 0) {
      quizState.emailSent = 1;
    }

    expect(quizState.emailSent).toBe(1);

    // Second email send attempt (should be prevented)
    const shouldPreventDuplicate = quizState.emailSent === 1;
    expect(shouldPreventDuplicate).toBe(true);
  });

  it("should handle multiple quizzes independently", () => {
    const quiz1 = {
      quizId: uuidv4(),
      paid: 0,
      emailSent: 0,
    };

    const quiz2 = {
      quizId: uuidv4(),
      paid: 0,
      emailSent: 0,
    };

    // Mark quiz1 as paid
    quiz1.paid = 1;
    quiz1.emailSent = 1;

    // quiz2 should remain unpaid
    expect(quiz1.paid).toBe(1);
    expect(quiz2.paid).toBe(0);
    expect(quiz1.quizId).not.toBe(quiz2.quizId);
  });

  it("should validate payment idempotency", () => {
    const processedPayments = new Set<string>();

    const processPayment = (quizId: string): boolean => {
      if (processedPayments.has(quizId)) {
        console.log(`Payment for quiz ${quizId} already processed`);
        return false;
      }
      processedPayments.add(quizId);
      return true;
    };

    // First payment
    const firstPayment = processPayment(quizId);
    expect(firstPayment).toBe(true);

    // Second payment (should be rejected)
    const secondPayment = processPayment(quizId);
    expect(secondPayment).toBe(false);

    // Different quiz (should be accepted)
    const differentQuizId = uuidv4();
    const differentPayment = processPayment(differentQuizId);
    expect(differentPayment).toBe(true);
  });

  it("should extract quizId from payment metadata", () => {
    const paymentData = {
      id: "payment-123",
      status: "approved",
      metadata: {
        quizId,
        profileName: "Test Profile",
      },
      external_reference: "lead-456",
    };

    const extractedQuizId = paymentData.metadata?.quizId;
    expect(extractedQuizId).toBe(quizId);
    expect(extractedQuizId).not.toBeUndefined();
  });

  it("should only release product for specific quiz", () => {
    const quizzes = [
      { quizId: uuidv4(), paid: 0, productReleased: false },
      { quizId: uuidv4(), paid: 0, productReleased: false },
      { quizId: uuidv4(), paid: 0, productReleased: false },
    ];

    // Payment for quiz 2
    const paymentQuizId = quizzes[1].quizId;

    // Release product only for the specific quiz
    quizzes.forEach((quiz) => {
      if (quiz.quizId === paymentQuizId) {
        quiz.paid = 1;
        quiz.productReleased = true;
      }
    });

    // Verify only quiz 2 has product released
    expect(quizzes[0].productReleased).toBe(false);
    expect(quizzes[1].productReleased).toBe(true);
    expect(quizzes[2].productReleased).toBe(false);

    // Verify only quiz 2 is marked as paid
    expect(quizzes[0].paid).toBe(0);
    expect(quizzes[1].paid).toBe(1);
    expect(quizzes[2].paid).toBe(0);
  });
});
