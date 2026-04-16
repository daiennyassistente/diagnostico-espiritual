import type { Request, Response } from "express";
import { getDiagnosticByLeadId, getQuizResponseByLeadId, getLeadById, getDb, updatePaymentDownloadToken } from "./db";
import { generateDevotionalPDF } from "./devotional-generator";
import { sendEmail } from "./email-service";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";


export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    // Log all request data for debugging
    console.log(`[Mercado Pago Webhook] Full request:`, {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    // Mercado Pago sends the data as query parameters
    const { id, type } = req.query;

    console.log(`[Mercado Pago Webhook] Received event: ${type}, ID: ${id}`);

    // Only process payment.updated events
    if (type !== "payment") {
      console.log(`[Mercado Pago Webhook] Ignoring event type: ${type}`);
      return res.status(200).json({ received: true });
    }

    // Fetch payment details from Mercado Pago API
    const paymentId = String(id);
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`[Mercado Pago Webhook] Failed to fetch payment ${paymentId}`);
      return res.status(400).json({ error: "Failed to fetch payment" });
    }

    const paymentData = await response.json();
    console.log(`[Mercado Pago Webhook] Payment status: ${paymentData.status}`);

    // Only process approved payments
    if (paymentData.status !== "approved") {
      console.log(`[Mercado Pago Webhook] Payment not approved, status: ${paymentData.status}`);
      return res.status(200).json({ received: true });
    }

    // Get the external reference (leadId)
    const leadId = paymentData.external_reference;
    if (!leadId) {
      console.error(`[Mercado Pago Webhook] No external_reference found`);
      return res.status(400).json({ error: "No external_reference" });
    }

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
      console.log(`[Mercado Pago Webhook] Payment ${paymentId} marked as approved for lead ${leadId}`);
    }

    // Get lead and diagnostic info
    const lead = await getLeadById(Number(leadId));
    if (!lead) {
      console.error(`[Mercado Pago Webhook] Lead not found: ${leadId}`);
      return res.status(400).json({ error: "Lead not found" });
    }

    const diagnostic = await getDiagnosticByLeadId(Number(leadId));
    if (!diagnostic) {
      console.error(`[Mercado Pago Webhook] Diagnostic not found for lead: ${leadId}`);
      return res.status(400).json({ error: "Diagnostic not found" });
    }

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
      console.log(`[Mercado Pago Webhook] Email sent to ${lead.email}`);
      
      // Update email status to sent
      if (db) {
        await db
          .update(payments)
          .set({
            emailStatus: "enviado",
            emailSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payments.leadId, Number(leadId)));
        console.log(`[Mercado Pago Webhook] Email status updated to sent for lead ${leadId}`);
      }
    } catch (emailError) {
      console.error(`[Mercado Pago Webhook] Failed to send email:`, emailError);
      
      // Update email status to failed
      if (db) {
        await db
          .update(payments)
          .set({
            emailStatus: "falha",
            updatedAt: new Date(),
          })
          .where(eq(payments.leadId, Number(leadId)));
        console.log(`[Mercado Pago Webhook] Email status updated to failed for lead ${leadId}`);
      }
      // Don't fail the webhook if email fails - payment was already processed
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
