import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getTransactionControlMock,
  updateTransactionStatusMock,
  getLeadByIdMock,
  getDiagnosticByIdMock,
  getQuizResponseByLeadIdMock,
  getDbMock,
  checkDevotionalDeliveryExistsMock,
  createDevotionalDeliveryMock,
  updateDevotionalDeliveryStatusMock,
  sendEmailMock,
  sendMetaConversionEventMock,
  isTransactionAlreadyProcessedMock,
  hasEmailBeenSentMock,
  finalizeTransactionMock,
  generateDevotionalPDFMock,
} = vi.hoisted(() => ({
  getTransactionControlMock: vi.fn(),
  updateTransactionStatusMock: vi.fn(),
  getLeadByIdMock: vi.fn(),
  getDiagnosticByIdMock: vi.fn(),
  getQuizResponseByLeadIdMock: vi.fn(),
  getDbMock: vi.fn(),
  checkDevotionalDeliveryExistsMock: vi.fn(),
  createDevotionalDeliveryMock: vi.fn(),
  updateDevotionalDeliveryStatusMock: vi.fn(),
  sendEmailMock: vi.fn(),
  sendMetaConversionEventMock: vi.fn(),
  isTransactionAlreadyProcessedMock: vi.fn(),
  hasEmailBeenSentMock: vi.fn(),
  finalizeTransactionMock: vi.fn(),
  generateDevotionalPDFMock: vi.fn(),
}));

vi.mock("./db", () => ({
  getTransactionControl: getTransactionControlMock,
  updateTransactionStatus: updateTransactionStatusMock,
  getLeadById: getLeadByIdMock,
  getDiagnosticById: getDiagnosticByIdMock,
  getQuizResponseByLeadId: getQuizResponseByLeadIdMock,
  getDb: getDbMock,
  checkDevotionalDeliveryExists: checkDevotionalDeliveryExistsMock,
  createDevotionalDelivery: createDevotionalDeliveryMock,
  updateDevotionalDeliveryStatus: updateDevotionalDeliveryStatusMock,
}));

vi.mock("./email-service", () => ({
  sendEmail: sendEmailMock,
}));

vi.mock("./meta-conversions-api", () => ({
  sendMetaConversionEvent: sendMetaConversionEventMock,
}));

vi.mock("./transaction-control", () => ({
  isTransactionAlreadyProcessed: isTransactionAlreadyProcessedMock,
  hasEmailBeenSent: hasEmailBeenSentMock,
  finalizeTransaction: finalizeTransactionMock,
}));

vi.mock("./devotional-generator", () => ({
  generateDevotionalPDF: generateDevotionalPDFMock,
}));

vi.mock("./devotional-pdf-service", () => ({
  generateDevotionalPDFFromDays: vi.fn(),
  generateDevotionalWithPDF: generateDevotionalPDFMock,
}));

import { handleMercadoPagoWebhook } from "./mercadopago-webhook";

describe("mercadopago-webhook idempotência", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDbMock.mockResolvedValue(null);
    checkDevotionalDeliveryExistsMock.mockResolvedValue(null);
    updateTransactionStatusMock.mockResolvedValue(undefined);
    sendMetaConversionEventMock.mockResolvedValue({ success: true });
    generateDevotionalPDFMock.mockResolvedValue(Buffer.from("pdf"));
    getQuizResponseByLeadIdMock.mockResolvedValue({ step1: "Maria" });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          id: 999,
          status: "approved",
          external_reference: "txn-abc",
          transaction_amount: 12.9,
          currency_id: "BRL",
          description: "Devocional",
          metadata: { quizId: "quiz-1" },
          payer: { email: "maria@example.com", first_name: "Maria" },
        }),
      })
    );
  });

  it("ignora webhook duplicado quando a transação já foi processada", async () => {
    getTransactionControlMock.mockResolvedValue({ leadId: 10, resultId: 88, quizId: "quiz-1" });
    isTransactionAlreadyProcessedMock.mockResolvedValue(true);

    const req: any = { method: "POST", body: { type: "payment", data: { id: "999" } } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await handleMercadoPagoWebhook(req, res);

    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(finalizeTransactionMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true, message: "Transaction already processed" });
  });

  it("envia apenas um email e finaliza a transação quando o pagamento está approved", async () => {
    getTransactionControlMock.mockResolvedValue({ leadId: 10, resultId: 88, quizId: "quiz-1" });
    isTransactionAlreadyProcessedMock.mockResolvedValue(false);
    hasEmailBeenSentMock.mockResolvedValue(false);
    getLeadByIdMock.mockResolvedValue({ id: 10, email: "maria@example.com", name: "Maria" });
    getDiagnosticByIdMock.mockResolvedValue({
      id: 88,
      profileName: "Perfil Personalizado",
      profileDescription: "Descrição",
      strengths: JSON.stringify(["Força"]),
      challenges: JSON.stringify(["Desafio"]),
      recommendations: JSON.stringify(["Recomendação"]),
      nextSteps: JSON.stringify(["Próximo passo"]),
    });

    const req: any = { method: "POST", body: { type: "payment", data: { id: "999" } } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await handleMercadoPagoWebhook(req, res);

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(finalizeTransactionMock).toHaveBeenCalledWith("txn-abc");
    expect(sendMetaConversionEventMock).toHaveBeenCalledWith(
      "maria@example.com",
      12.9,
      "txn-abc",
      "Perfil Personalizado"
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
