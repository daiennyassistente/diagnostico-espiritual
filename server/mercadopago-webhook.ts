import type { Request, Response } from "express";
import { getDiagnosticByLeadId, getQuizResponseByLeadId, getLeadById, getDb, updatePaymentDownloadToken } from "./db";
import { generateDevotionalPDF } from "./devotional-generator";
import { sendEmail } from "./email-service";
import { payments, buyers } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";


export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("[Mercado Pago Webhook] Body recebido:", req.body);

    const body = req.body ?? {};
    const action = body.action;
    const type = body.type ?? (typeof action === "string" && action.startsWith("payment.") ? "payment" : undefined);
    const paymentId = body?.data?.id;

    console.log(`[Mercado Pago Webhook] Evento recebido: action=${action}, type=${type}, paymentId=${paymentId}`);

    if (!paymentId) {
      console.log("[Mercado Pago Webhook] Notificação ignorada: data.id ausente");
      return res.status(200).json({ received: true });
    }

    if (type && type !== "payment") {
      console.log(`[Mercado Pago Webhook] Notificação ignorada: type=${type}`);
      return res.status(200).json({ received: true });
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${String(paymentId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`[Mercado Pago Webhook] Erro ao buscar pagamento ${paymentId}: ${response.status} ${response.statusText}`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Pagamento encontrado na API do Mercado Pago`);

    const paymentData = await response.json();
    console.log(`[Mercado Pago Webhook] Status do pagamento: ${paymentData.status}`);
    console.log(`[Mercado Pago Webhook] Dados completos do pagamento:`, JSON.stringify(paymentData, null, 2));
    console.log(`[Mercado Pago Webhook] Payer email: ${paymentData.payer?.email}`);
    console.log(`[Mercado Pago Webhook] Payer first_name: ${paymentData.payer?.first_name}`);

    if (paymentData.status !== "approved") {
      console.log(`[Mercado Pago Webhook] Pagamento ainda não aprovado: ${paymentData.status}`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Pagamento aprovado`);

    // Criar registro de comprador
    const db = await getDb();
    const leadId = paymentData.external_reference;
    
    if (db && leadId) {
      try {
        // Buscar dados do lead para obter email e nome (dados não mascarados)
        const lead = await getLeadById(Number(leadId));
        
        if (lead && lead.email) {
          // Verificar se já existe comprador com este paymentId
          const existingBuyer = await db
            .select({ id: buyers.id })
            .from(buyers)
            .where(eq(buyers.paymentId, String(paymentId)))
            .limit(1);

          if (existingBuyer.length === 0) {
            // Inserir novo comprador usando dados do lead (não mascarados)
            await db.insert(buyers).values({
              paymentId: String(paymentId),
              email: lead.email,
              name: lead.name || lead.email,
              amount: Math.round(Number(paymentData.transaction_amount || 0) * 100),
              currency: String(paymentData.currency_id || "BRL").toLowerCase(),
            });
            console.log(`[Mercado Pago Webhook] Comprador criado: ${lead.email}`);
          } else {
            console.log(`[Mercado Pago Webhook] Comprador já existe para paymentId: ${paymentId}`);
          }
        } else {
          console.log(`[Mercado Pago Webhook] Lead não encontrado ou sem email para leadId: ${leadId}`);
        }
      } catch (buyerError) {
        console.error(`[Mercado Pago Webhook] Erro ao criar comprador:`, buyerError);
      }
    }

    if (!leadId) {
      console.log("[Mercado Pago Webhook] Pagamento sem external_reference; notificação recebida sem processamento adicional");
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Lead ID encontrado: ${leadId}`);
    
    // Update payment status in database (db já foi obtido acima)
    if (db) {
      const existingPayment = await db
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.leadId, Number(leadId)))
        .limit(1);

      if (existingPayment.length > 0) {
        await db
          .update(payments)
          .set({
            status: "approved",
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment[0].id));
      } else {
        await db.execute(sql`
          INSERT INTO payments (
            leadId,
            amount,
            currency,
            status,
            productName,
            createdAt,
            updatedAt
          ) VALUES (
            ${Number(leadId)},
            ${Math.round(Number(paymentData.transaction_amount || 0) * 100)},
            ${String(paymentData.currency_id || "BRL").toLowerCase()},
            ${"approved"},
            ${String(paymentData.description || "Diagnóstico Espiritual")},
            NOW(),
            NOW()
          )
        `);
      }

      console.log(`[Mercado Pago Webhook] Pagamento ${paymentId} marcado como aprovado para lead ${leadId}`);
    }
    console.log(`[Mercado Pago Webhook] Status atualizado no banco de dados`);

    const lead = await getLeadById(Number(leadId));
    if (!lead) {
      console.log(`[Mercado Pago Webhook] Lead não encontrado para ${leadId}; notificação recebida sem processamento adicional`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Lead encontrado: ${lead.email}`);

    const diagnostic = await getDiagnosticByLeadId(Number(leadId));
    if (!diagnostic) {
      console.log(`[Mercado Pago Webhook] Diagnóstico não encontrado para ${leadId}; notificação recebida sem processamento adicional`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Diagnóstico encontrado: ${diagnostic.profileName}`);

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
      console.log(`[Mercado Pago Webhook] Email enviado com sucesso para: ${lead.email}`);
    } catch (emailError) {
      console.error(`[Mercado Pago Webhook] Erro ao enviar email:`, emailError);
      // Don't fail the webhook if email fails - payment was already processed
    }

    console.log(`[Mercado Pago Webhook] Webhook processado com sucesso!`);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] Erro crítico:", error);
    return res.status(200).json({ received: true });
  }

}
