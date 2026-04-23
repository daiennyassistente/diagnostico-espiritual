import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createTransactionControlMock,
  getTransactionControlMock,
  markTransactionAsProcessedMock,
  markTransactionEmailSentMock,
} = vi.hoisted(() => ({
  createTransactionControlMock: vi.fn(),
  getTransactionControlMock: vi.fn(),
  markTransactionAsProcessedMock: vi.fn(),
  markTransactionEmailSentMock: vi.fn(),
}));

vi.mock("./db", () => ({
  createTransactionControl: createTransactionControlMock,
  getTransactionControl: getTransactionControlMock,
  markTransactionAsProcessed: markTransactionAsProcessedMock,
  markTransactionEmailSent: markTransactionEmailSentMock,
}));

import {
  createNewTransaction,
  finalizeTransaction,
  hasEmailBeenSent,
  isTransactionAlreadyProcessed,
} from "./transaction-control";

describe("transaction-control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria a transação com resultId e status pending", async () => {
    await createNewTransaction("txn-123", "quiz-123", 77, 15);

    expect(createTransactionControlMock).toHaveBeenCalledWith({
      transactionId: "txn-123",
      resultId: 77,
      quizId: "quiz-123",
      leadId: 15,
      status: "pending",
      processed: 0,
      emailSent: 0,
      productReleased: 0,
    });
  });

  it("reconhece quando a transação já foi processada", async () => {
    getTransactionControlMock.mockResolvedValueOnce({ processed: 1 });

    await expect(isTransactionAlreadyProcessed("txn-processed")).resolves.toBe(true);
  });

  it("reconhece quando o email já foi enviado", async () => {
    getTransactionControlMock.mockResolvedValueOnce({ emailSent: 1 });

    await expect(hasEmailBeenSent("txn-email")).resolves.toBe(true);
  });

  it("finaliza a transação marcando email e processamento uma única vez", async () => {
    await finalizeTransaction("txn-final");

    expect(markTransactionEmailSentMock).toHaveBeenCalledWith("txn-final");
    expect(markTransactionAsProcessedMock).toHaveBeenCalledWith("txn-final");
    expect(markTransactionEmailSentMock).toHaveBeenCalledTimes(1);
    expect(markTransactionAsProcessedMock).toHaveBeenCalledTimes(1);
  });
});
