import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { createMockRequest, createMockResponse } from "./_core/test-utils";
import { createContext } from "./_core/context";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    createPayment: vi.fn(async () => ({ id: 1 })),
  };
});

import { appRouter } from "./routers";

describe("payment.createMercadoPagoPayment PIX", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const mockReq = createMockRequest() as Request;
    const mockRes = createMockResponse() as Response;
    const ctx = await createContext({ req: mockReq, res: mockRes });
    caller = appRouter.createCaller(ctx);
  });

  beforeEach(() => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
    vi.restoreAllMocks();
  });

  it("deve enviar X-Idempotency-Key ao criar pagamento PIX", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 12345,
        point_of_interaction: {
          transaction_data: {
            qr_code: "pix-code-123",
            qr_code_base64: "base64-image",
          },
        },
      }),
    } as Response);

    const result = await caller.payment.createMercadoPagoPayment({
      email: "cliente@example.com",
      profileName: "Perfil Teste",
      userPhone: "5511999999999",
      leadId: "123",
      paymentMethod: "pix",
    });

    expect(result.success).toBe(true);
    expect(result.pixCode).toBe("pix-code-123");
    expect(result.pixQrCode).toContain("data:image/png;base64,base64-image");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options?.method).toBe("POST");
    expect((options?.headers as Record<string, string>)["X-Idempotency-Key"]).toBeTruthy();
  });
});
