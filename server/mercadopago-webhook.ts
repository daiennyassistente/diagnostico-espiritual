import type { Request, Response } from "express";
import { getDiagnosticByLeadId, getQuizResponseByLeadId, getLeadById, getDb, updatePaymentDownloadToken } from "./db";
import { generateDevotionalPDF } from "./devotional-generator";
import { sendEmail } from "./email-service";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";


export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    // Log all request data for debugging
    console.log(`[Mercado Pago Webhook] ========== WEBHOOK RECEBIDO =========`);
    console.log(`[Mercado Pago Webhook] Timestamp: ${new Date().toISOString()}`);
    console.log(`[Mercado Pago Webhook] Method: ${req.method}`);
    console.log(`[Mercado Pago Webhook] Query:`, req.query);
    console.log(`[Mercado Pago Webhook] Body:`, req.body);
    console.log(`[Mercado Pago Webhook] =====================================`);

    // Mercado Pago sends the data in the request body
    // Structure: { type: "payment", data: { id: "123" }, action: "payment.updated" }
    const body = req.body || {};
    const type = body.type;
    const paymentId = body.data?.id;

    console.log(`[Mercado Pago Webhook] ✓ Received event: type=${type}, paymentId=${paymentId}`);
    console.log(`[Mercado Pago Webhook] Processando pagamento...`);

    // Only process payment events
    if (type !== "payment") {
      console.log(`[Mercado Pago Webhook] ✗ Tipo de evento ignorado: ${type}`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] ✓ Tipo de evento válido: payment`);

    // Validate payment ID
    if (!paymentId) {
      console.error(`[Mercado Pago Webhook] ✗ Nenhum ID de pagamento encontrado`);
      return res.status(400).json({ error: "No payment ID" });
    }

    // Fetch payment details from Mercado Pago API
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${String(paymentId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`[Mercado Pago Webhook] ✗ Erro ao buscar pagamento ${paymentId}: ${response.status} ${response.statusText}`);
      return res.status(400).json({ error: "Failed to fetch payment" });
    }
    console.log(`[Mercado Pago Webhook] ✓ Pagamento encontrado na API do Mercado Pago`);

    const paymentData = await response.json();
    console.log(`[Mercado Pago Webhook] ✓ Status do pagamento: ${paymentData.status}`);

    // Only process approved payments
    if (paymentData.status !== "approved") {
      console.log(`[Mercado Pago Webhook] ✗ Pagamento não aprovado, status: ${paymentData.status}`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] ✓ Pagamento APROVADO!`);

    // Get the external reference (leadId)
    const leadId = paymentData.external_reference;
    if (!leadId) {
      console.error(`[Mercado Pago Webhook] ✗ Nenhuma external_reference encontrada`);
      return res.status(400).json({ error: "No external_reference" });
    }
    console.log(`[Mercado Pago Webhook] ✓ Lead ID encontrado: ${leadId}`);

    // Update payment status in database
    const db = await getDb();
    if (db) {
      await db
        .update(payments)
        .set({
          status: "approved",
          updatedAt: new Date(),
        })
        .where(eq(payments.leadId, Number(leadId)));
      console.log(`[Mercado Pago Webhook] ✓ Pagamento ${paymentId} marcado como aprovado para lead ${leadId}`);
    }
    console.log(`[Mercado Pago Webhook] ✓ Status atualizado no banco de dados`);

    // Get lead and diagnostic info
    const lead = await getLeadById(Number(leadId));
    if (!lead) {
      console.error(`[Mercado Pago Webhook] ✗ Lead não encontrado: ${leadId}`);
      return res.status(400).json({ error: "Lead not found" });
    }
    console.log(`[Mercado Pago Webhook] ✓ Lead encontrado: ${lead.email}`);

    const diagnostic = await getDiagnosticByLeadId(Number(leadId));
    if (!diagnostic) {
      console.error(`[Mercado Pago Webhook] ✗ Diagnóstico não encontrado para lead: ${leadId}`);
      return res.status(400).json({ error: "Diagnostic not found" });
    }
    console.log(`[Mercado Pago Webhook] ✓ Diagnóstico encontrado: ${diagnostic.profileName}`);

    // Get quiz responses
    const quizResponse = await getQuizResponseByLeadId(Number(leadId));
    const responses: Record<string, string> = quizResponse
      ? Object.fromEntries(
          Object.entries(quizResponse)
            .filter(([key, value]) => /^step\d+$/.test(key) && typeof value === "string" && value.trim().length > 0)
            .map(([key, value]) => [key, String(value)])
        )
      : {};

    // Generate PDF
    const pdfBuffer = await generateDevotionalPDF({
      profileName: diagnostic.profileName,
      profileDescription: diagnostic.profileDescription,
      challenges: JSON.parse(diagnostic.challenges),
      recommendations: JSON.parse(diagnostic.recommendations),
      strengths: JSON.parse(diagnostic.strengths),
      nextSteps: JSON.parse(diagnostic.nextSteps),
      responses,
      userName: responses.step1,
    });

    // Send email with PDF
    const emailSubject = `Seu Devocional Personalizado - ${diagnostic.profileName}`;
    const emailBody = `
Olá ${lead.name || "Amigo(a)"},

Parabéns! Seu pagamento foi confirmado com sucesso.

Seu devocional personalizado de 7 dias está em anexo. Este material foi especialmente preparado para você com base no seu diagnóstico espiritual.

Que Deus abençoe seu tempo de intimidade com Ele!

Bênçãos,
Equipe Diagnóstico Espiritual
    `;

    try {
      await sendEmail({
        to: lead.email,
        subject: emailSubject,
        html: emailBody,
        attachments: [
          {
            filename: `devocional-${diagnostic.profileName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      console.log(`[Mercado Pago Webhook] ✓✓✓ EMAIL ENVIADO COM SUCESSO PARA: ${lead.email}`);
      

    } catch (emailError) {
      console.error(`[Mercado Pago Webhook] ✗ Erro ao enviar email:`, emailError);
      

      // Don't fail the webhook if email fails - payment was already processed
    }

    console.log(`[Mercado Pago Webhook] ✓ Webhook processado com sucesso!`);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] ✗ ERRO CRÍTICO:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
