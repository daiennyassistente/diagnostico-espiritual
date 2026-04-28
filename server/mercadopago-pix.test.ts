import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createMockRequest, createMockResponse } from './_core/test-utils';
import { createContext } from './_core/context';

const {
  createPaymentMock,
  getDiagnosticByLeadIdMock,
  getLeadByIdMock,
  createNewTransactionMock,
} = vi.hoisted(() => ({
  createPaymentMock: vi.fn(async () => ({ id: 1 })),
  getDiagnosticByLeadIdMock: vi.fn(async () => ({
    id: 77,
    leadId: 123,
    profileName: 'Perfil Teste',
  })),
  getLeadByIdMock: vi.fn(async () => ({
    id: 123,
    email: 'cliente@example.com',
    name: 'Cliente Teste',
    whatsapp: '5511999999999',
  })),
  createNewTransactionMock: vi.fn(async () => undefined),
}));

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  return {
    ...actual,
    createPayment: createPaymentMock,
    getDiagnosticByLeadId: getDiagnosticByLeadIdMock,
    getLeadById: getLeadByIdMock,
  };
});

vi.mock('./transaction-control', () => ({
  createNewTransaction: createNewTransactionMock,
  isTransactionAlreadyProcessed: vi.fn(async () => false),
  hasEmailBeenSent: vi.fn(async () => false),
  finalizeTransaction: vi.fn(async () => undefined),
}));

import { appRouter } from './routers';

describe('Pagamentos PIX do Mercado Pago', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const mockReq = createMockRequest({ headers: { origin: 'https://diagnosticoespiritual.manus.space' } }) as Request;
    const mockRes = createMockResponse() as Response;
    const ctx = await createContext({ req: mockReq, res: mockRes });
    caller = appRouter.createCaller(ctx);
  });

  beforeEach(() => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token';
    vi.restoreAllMocks();
    createPaymentMock.mockClear();
    getDiagnosticByLeadIdMock.mockClear();
    getLeadByIdMock.mockClear();
    createNewTransactionMock.mockClear();
    getDiagnosticByLeadIdMock.mockResolvedValue({
      id: 77,
      leadId: 123,
      profileName: 'Perfil Teste',
    });
    getLeadByIdMock.mockResolvedValue({
      id: 123,
      email: 'cliente@example.com',
      name: 'Cliente Teste',
      whatsapp: '5511999999999',
    });
  });

  it('deve enviar X-Idempotency-Key ao criar pagamento PIX padrão', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 12345,
        point_of_interaction: {
          transaction_data: {
            qr_code: 'pix-code-123',
            qr_code_base64: 'base64-image',
          },
        },
      }),
    } as Response);

    const result = await caller.payment.createMercadoPagoPayment({
      email: 'cliente@example.com',
      profileName: 'Perfil Teste',
      userPhone: '5511999999999',
      leadId: '123',
      quizId: 'quiz-1',
      resultId: 77,
      paymentMethod: 'pix',
    });

    expect(result.success).toBe(true);
    expect(result.pixCode).toBe('pix-code-123');
    expect(result.pixQrCode).toContain('data:image/png;base64,base64-image');
    expect(result.transactionId).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options?.method).toBe('POST');
    expect((options?.headers as Record<string, string>)['X-Idempotency-Key']).toBeTruthy();
    expect(createNewTransactionMock).toHaveBeenCalledTimes(1);
  });

  it('deve criar PIX da oferta com o lead específico e retornar QR Code para o modal', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 98765,
        point_of_interaction: {
          transaction_data: {
            qr_code: 'offer-pix-code',
            qr_code_base64: 'offer-base64-image',
          },
        },
      }),
    } as Response);

    const result = await caller.payment.createOfferPixPayment({
      leadId: '123',
    });

    expect(result.success).toBe(true);
    expect(result.pixCode).toBe('offer-pix-code');
    expect(result.pixQrCode).toContain('data:image/png;base64,offer-base64-image');
    expect(result.transactionId).toBeTruthy();
    expect(getLeadByIdMock).toHaveBeenCalledWith(123);
    expect(getDiagnosticByLeadIdMock).toHaveBeenCalledWith(123);
    expect(createPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: 123,
        amount: 7.9,
        status: 'pending',
      })
    );

    const [, options] = fetchSpy.mock.calls[0];
    const payload = JSON.parse(String(options?.body));
    expect(payload.transaction_amount).toBe(7.9);
    expect(payload.payment_method_id).toBe('pix');
    expect(payload.metadata.leadId).toBe('123');
    expect(payload.metadata.source).toBe('offer-page');
  });
});
