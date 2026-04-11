/**
 * Endpoint de teste para simular um pagamento aprovado do Mercado Pago
 * Útil para testar o fluxo de redirecionamento automático
 */

import { Request, Response } from "express";
import { handleMercadoPagoWebhook } from "./mercadopago-webhook";

export async function testMercadoPagoWebhook(req: Request, res: Response) {
  try {
    // Simular um webhook de pagamento aprovado do Mercado Pago
    const testPayload = {
      action: "payment.approved",
      data: {
        id: Math.floor(Math.random() * 1000000000), // ID aleatório
        transaction_amount: 12.90,
        external_reference: `devotional-${Date.now()}`,
        payer: {
          email: "teste@example.com",
        },
        status: "approved",
        date_approved: new Date().toISOString(),
      },
    };

    console.log("[Test Webhook] Simulando pagamento aprovado:", testPayload);

    // Criar um objeto Request fake com o payload
    const fakeReq = {
      body: testPayload,
    } as Request;

    // Chamar o handler do webhook
    await handleMercadoPagoWebhook(fakeReq, res);

    console.log("[Test Webhook] Webhook simulado com sucesso");
  } catch (error) {
    console.error("[Test Webhook] Erro ao simular webhook:", error);
    res.status(500).json({ error: "Erro ao simular webhook" });
  }
}
