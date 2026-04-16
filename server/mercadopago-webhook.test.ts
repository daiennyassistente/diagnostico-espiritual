import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleMercadoPagoWebhook } from "./mercadopago-webhook";
import type { Request, Response } from "express";

describe("Mercado Pago Webhook", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusCode: number;
  let jsonResponse: any;

  beforeEach(() => {
    statusCode = 200;
    jsonResponse = null;

    mockReq = {
      method: "POST",
      body: {},
      query: {},
    };

    mockRes = {
      status: vi.fn(function (code: number) {
        statusCode = code;
        return this;
      }),
      json: vi.fn(function (data: any) {
        jsonResponse = data;
        return this;
      }),
    };

    // Mock environment variables
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
  });

  it("should return 200 and received:true for valid payment notification", async () => {
    mockReq.body = {
      type: "payment",
      data: { id: "123456" },
      action: "payment.updated",
    };

    // Mock the fetch call to Mercado Pago API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "123456",
            status: "approved",
            external_reference: "1",
          }),
      } as Response)
    );

    // Mock database functions
    vi.mock("./db", () => ({
      getDb: vi.fn(() => Promise.resolve(null)),
      getLeadById: vi.fn(() =>
        Promise.resolve({
          id: 1,
          name: "Test User",
          email: "test@example.com",
          whatsapp: "11999999999",
        })
      ),
      getDiagnosticByLeadId: vi.fn(() =>
        Promise.resolve({
          profileName: "Test Profile",
          profileDescription: "Test Description",
          challenges: "[]",
          recommendations: "[]",
          strengths: "[]",
          nextSteps: "[]",
        })
      ),
      getQuizResponseByLeadId: vi.fn(() =>
        Promise.resolve({
          step1: "Test",
          step2: "Test",
          step3: "Test",
          step4: "Test",
          step5: "Test",
          step6: "Test",
          step7: "Test",
          step8: "Test",
          step9: "Test",
          step10: "Test",
        })
      ),
    }));

    await handleMercadoPagoWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  it("should return 200 for missing payment ID without rejecting the notification", async () => {
    mockReq.body = {
      type: "payment",
      data: {},
    };

    await handleMercadoPagoWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  it("should return 200 for non-payment event types", async () => {
    mockReq.body = {
      type: "merchant_order",
      data: { id: "123456" },
    };

    await handleMercadoPagoWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  it("should return 405 for methods different from POST", async () => {
    mockReq.method = "GET";
    mockReq.body = {
      type: "payment",
      data: { id: "123456" },
      action: "payment.updated",
    };

    await handleMercadoPagoWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Method Not Allowed" });
  });
});
