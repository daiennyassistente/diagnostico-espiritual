import type { Request, Response } from "express";
import { getDiagnosticById, getQuizResponseByLeadId, getLeadById, getDb, checkDevotionalDeliveryExists, createDevotionalDelivery, updateDevotionalDeliveryStatus, getTransactionControl, updateTransactionStatus } from "./db";
import { generateDevotionalPDF } from "./devotional-generator";
import { generateDevotionalPDFFromDays } from "./devotional-pdf-service";
import { sendEmail } from "./email-service";
import { sendMetaConversionEvent } from "./meta-conversions-api";
import { finalizeTransaction, hasEmailBeenSent, isTransactionAlreadyProcessed } from "./transaction-control";
import { payments, buyers, quizResponses } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// Função para disparar evento Purchase do Pixel da Meta via API de Conversão
async function firePixelPurchaseEvent(
  email: string,
  amount: number,
  productName: string,
  leadId: number,
  transactionId: string
) {
  try {
    console.log(
      `[Meta Pixel] Disparando evento Purchase: email=${email}, amount=R$ ${amount.toFixed(2)}, product=${productName}`
    );
    
    // Enviar evento via Conversions API (server-side)
    const result = await sendMetaConversionEvent(
      email,
      amount,
      transactionId,
      productName
    );
    
    if (result.success) {
      console.log(`[Meta Conversions API] Evento Purchase enviado com sucesso via API`);
    } else {
      console.error(`[Meta Conversions API] Erro ao enviar evento: ${result.error}`);
    }
  } catch (error: any) {
    console.error(
      `[Meta Pixel] Erro ao disparar evento Purchase: ${error.message}`
    );
  }
}


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
    
    // O transaction_id do fluxo é o external_reference enviado ao Mercado Pago
    const transactionId = String(paymentData.external_reference || "");

    // Extract quizId from metadata
    const quizId = paymentData.metadata?.quizId;
    console.log(`[Mercado Pago Webhook] Quiz ID: ${quizId}`);

    if (!transactionId) {
      console.log("[Mercado Pago Webhook] Pagamento sem external_reference válido; ignorando processamento");
      return res.status(200).json({ received: true });
    }

    const transaction = await getTransactionControl(transactionId);
    if (!transaction) {
      console.log(`[Mercado Pago Webhook] Transação ${transactionId} não encontrada; ignorando processamento`);
      return res.status(200).json({ received: true });
    }

    const buyerLeadId = transaction.leadId;
    const resultId = transaction.resultId;
    const effectiveQuizId = quizId || transaction.quizId;
    
    // DEBUG: Log dos IDs críticos
    console.log(`[Mercado Pago Webhook] DEBUG - transactionId: ${transactionId}`);
    console.log(`[Mercado Pago Webhook] DEBUG - resultId: ${resultId}`);
    console.log(`[Mercado Pago Webhook] DEBUG - leadId: ${buyerLeadId}`);
    console.log(`[Mercado Pago Webhook] DEBUG - quizId: ${effectiveQuizId}`);

    if (paymentData.status !== "approved") {
      await updateTransactionStatus(transactionId, "pending");
      console.log(`[Mercado Pago Webhook] Pagamento ainda não aprovado: ${paymentData.status}`);
      return res.status(200).json({ received: true });
    }

    await updateTransactionStatus(transactionId, "approved");
    console.log(`[Mercado Pago Webhook] Pagamento aprovado para transaction_id ${transactionId}`);
    
    // Verificar se já existe uma entrega registrada para este transaction_id
    const existingDelivery = await checkDevotionalDeliveryExists(transactionId);
    if (existingDelivery && existingDelivery.status === "sent") {
      console.log(`[Mercado Pago Webhook] Devocional já foi entregue para transaction_id ${transactionId}. Ignorando reprocessamento.`);
      return res.status(200).json({ received: true, message: "Delivery already processed" });
    }

    if (await isTransactionAlreadyProcessed(transactionId)) {
      console.log(`[Mercado Pago Webhook] Transação ${transactionId} já está marcada como processada. Ignorando webhook duplicado.`);
      return res.status(200).json({ received: true, message: "Transaction already processed" });
    }

    const db = await getDb();

    if (!effectiveQuizId) {
      console.warn("[Mercado Pago Webhook] Aviso: quizId indisponível no pagamento e na transação.");
    }
    
    if (db && buyerLeadId) {
      try {
        // Buscar dados do lead para obter email e nome (dados não mascarados)
        const lead = await getLeadById(Number(buyerLeadId));
        
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
              leadId: Number(buyerLeadId),
              email: lead.email,
              name: lead.name || lead.email,
              phone: lead.whatsapp,  // Telefone do lead
              amount: Math.round(Number(paymentData.transaction_amount || 0) * 100),
              currency: String(paymentData.currency_id || "BRL").toLowerCase(),
            });
            console.log(`[Mercado Pago Webhook] Comprador criado: ${lead.email}`);
          } else {
            console.log(`[Mercado Pago Webhook] Comprador já existe para paymentId: ${paymentId}`);
          }
        } else {
          console.log(`[Mercado Pago Webhook] Lead não encontrado ou sem email para leadId: ${buyerLeadId}`);
        }
      } catch (buyerError) {
        console.error(`[Mercado Pago Webhook] Erro ao criar comprador:`, buyerError);
      }
    }

    console.log(`[Mercado Pago Webhook] Lead ID encontrado na transação: ${buyerLeadId}`);
    
    // Update payment status in database (db já foi obtido acima)
    if (db) {
      const existingPayment = await db
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.leadId, Number(buyerLeadId)))
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
            ${Number(buyerLeadId)},
            ${Math.round(Number(paymentData.transaction_amount || 0) * 100)},
            ${String(paymentData.currency_id || "BRL").toLowerCase()},
            ${"approved"},
            ${String(paymentData.description || "Diagnóstico Espiritual")},
            NOW(),
            NOW()
          )
        `);
      }

      console.log(`[Mercado Pago Webhook] Pagamento ${paymentId} marcado como aprovado para lead ${buyerLeadId}`);
    }
    console.log(`[Mercado Pago Webhook] Status atualizado no banco de dados`);

    const lead = await getLeadById(Number(buyerLeadId));
    if (!lead) {
      console.log(`[Mercado Pago Webhook] Lead não encontrado para ${buyerLeadId}; notificação recebida sem processamento adicional`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Lead encontrado: ${lead.email}`);

    const diagnostic = await getDiagnosticById(resultId);
    if (!diagnostic) {
      console.log(`[Mercado Pago Webhook] Resultado personalizado ${resultId} não encontrado; notificação recebida sem processamento adicional`);
      return res.status(200).json({ received: true });
    }
    console.log(`[Mercado Pago Webhook] Resultado personalizado encontrado: ${diagnostic.profileName}`);
    console.log(`[Mercado Pago Webhook] DEBUG - Usando resultId ${resultId} para gerar PDF personalizado para ${lead.email}`);

    // Get quiz responses - ONLY for the specific quiz if quizId is available
    let quizResponse = null;
    if (effectiveQuizId && db && !quizResponse) {
      try {
        const [specificQuiz] = await db
          .select()
          .from(quizResponses)
          .where(eq(quizResponses.quizId, effectiveQuizId))
          .limit(1);
        quizResponse = specificQuiz || null;
      } catch (err) {
        console.error(`[Mercado Pago Webhook] Erro ao buscar quiz com quizId ${effectiveQuizId}:`, err);
      }

      if (quizResponse) {
        await db
          .update(quizResponses)
          .set({
            paid: 1,
            updatedAt: new Date(),
          })
          .where(eq(quizResponses.quizId, effectiveQuizId));
        console.log(`[Mercado Pago Webhook] Quiz ${effectiveQuizId} marcado como pago`);
      }
    } else {
      quizResponse = await getQuizResponseByLeadId(Number(buyerLeadId));
    }
    
    const responses: Record<string, string> = quizResponse
      ? Object.fromEntries(
          Object.entries(quizResponse)
            .filter(([key, value]) => /^step\d+$/.test(key) && typeof value === "string" && value.trim().length > 0)
            .map(([key, value]) => [key, String(value)])
        )
      : {};

    // Generate Premium PDF with professional design
    let pdfBuffer: Buffer;
    try {
      console.log(`[Mercado Pago Webhook] Iniciando geração de PDF premium para ${lead.email}`);
      
      // Tentar usar o novo gerador de PDF com design profissional
      const { generateDevotionalWithPDF } = await import("./devotional-pdf-service");
      pdfBuffer = await generateDevotionalWithPDF({
        userName: lead.name || responses.step1 || "Amigo(a)",
        profileName: diagnostic.profileName,
        profileDescription: diagnostic.profileDescription,
        strengths: JSON.parse(diagnostic.strengths),
        challenges: JSON.parse(diagnostic.challenges),
        recommendations: JSON.parse(diagnostic.recommendations),
        nextSteps: JSON.parse(diagnostic.nextSteps),
        responses,
      });
      
      console.log(`[Mercado Pago Webhook] PDF premium gerado com sucesso (${pdfBuffer.length} bytes)`);
    } catch (pdfError) {
      console.error(`[Mercado Pago Webhook] Erro ao gerar PDF premium, usando fallback:`, pdfError);
      // Fallback para o gerador antigo se houver erro
      pdfBuffer = await generateDevotionalPDF({
        profileName: diagnostic.profileName,
        profileDescription: diagnostic.profileDescription,
        challenges: JSON.parse(diagnostic.challenges),
        recommendations: JSON.parse(diagnostic.recommendations),
        strengths: JSON.parse(diagnostic.strengths),
        nextSteps: JSON.parse(diagnostic.nextSteps),
        responses,
        userName: responses.step1,
      });
      console.log(`[Mercado Pago Webhook] PDF fallback gerado com sucesso`);
    }

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
      if (await hasEmailBeenSent(transactionId)) {
        console.log(`[Mercado Pago Webhook] Email já enviado para transaction_id ${transactionId}. Ignorando reenvio.`);
        return res.status(200).json({ received: true, message: "Email already sent" });
      }

      if (db) {
        try {
          const payment = await db
            .select({ id: payments.id })
            .from(payments)
            .where(eq(payments.leadId, Number(buyerLeadId)))
            .limit(1);

          const paymentId_db = payment.length > 0 ? payment[0].id : null;

          await createDevotionalDelivery({
            transactionId,
            paymentId: paymentId_db || 0,
            leadId: Number(buyerLeadId),
            email: lead.email,
            productName: "Devocional: 7 Dias para se Aproximar de Deus",
            status: "pending",
          });
          console.log(`[Mercado Pago Webhook] Registro de entrega criado para transaction_id ${transactionId}`);
        } catch (deliveryError) {
          console.error(`[Mercado Pago Webhook] Erro ao criar registro de entrega:`, deliveryError);
        }
      }

      console.log(`[Mercado Pago Webhook] DEBUG - Enviando email com PDF gerado a partir de resultId ${resultId}`);
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
      console.log(`[Mercado Pago Webhook] DEBUG - Email com PDF personalizado (resultId ${resultId}) entregue para ${lead.email}`);

      try {
        await updateDevotionalDeliveryStatus(transactionId, "sent");
        console.log(`[Mercado Pago Webhook] Status de entrega atualizado para "sent" para transaction_id ${transactionId}`);
      } catch (updateError) {
        console.error(`[Mercado Pago Webhook] Erro ao atualizar status de entrega:`, updateError);
      }

      if (effectiveQuizId && db) {
        try {
          await db
            .update(quizResponses)
            .set({ emailSent: 1 })
            .where(eq(quizResponses.quizId, effectiveQuizId));
          console.log(`[Mercado Pago Webhook] Quiz ${effectiveQuizId} marcado como email enviado`);
        } catch (err) {
          console.error(`[Mercado Pago Webhook] Erro ao marcar email como enviado:`, err);
        }
      }

      await finalizeTransaction(transactionId);

      const amount = Math.round(Number(paymentData.transaction_amount || 0) * 100) / 100;
      await firePixelPurchaseEvent(lead.email, amount, diagnostic.profileName, Number(buyerLeadId), transactionId);
      console.log(`[Meta Pixel] Evento Purchase disparado com sucesso`);
      console.log(`[Meta Pixel] Valor: R$ ${amount.toFixed(2)}, Moeda: BRL, Email: ${lead.email}`);

      console.log(`[Mercado Pago Webhook] Webhook processado com sucesso!`);
      return res.status(200).json({ received: true, pixelEvent: 'Purchase' });
    } catch (emailError) {
      console.error(`[Mercado Pago Webhook] Erro ao enviar email:`, emailError);
      console.warn(`[Meta Pixel] Evento Purchase NÃO foi disparado porque o email falhou`);

      try {
        await updateDevotionalDeliveryStatus(transactionId, "failed", String(emailError));
        console.log(`[Mercado Pago Webhook] Status de entrega atualizado para "failed" para transaction_id ${transactionId}`);
      } catch (updateError) {
        console.error(`[Mercado Pago Webhook] Erro ao atualizar status de entrega para failed:`, updateError);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Mercado Pago Webhook] Erro crítico:", error);
    return res.status(200).json({ received: true });
  }

}
