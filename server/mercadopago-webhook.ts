import { Request, Response } from "express";
import { getDb } from "./db";
import { payments, leads } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendDevotionalConfirmationEmail } from "./email-service";

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    const { action, data } = req.body;

    console.log(`[Mercado Pago Webhook] Received event: ${action}`);

    // Processar apenas eventos de pagamento aprovado
    if (action === "payment.approved" || action === "payment.created") {
      const paymentId = data?.id;

      if (!paymentId) {
        console.warn("[Mercado Pago Webhook] Missing payment ID");
        return res.json({ received: true });
      }

      try {
        const db = await getDb();
        if (!db) {
          console.error("[Mercado Pago Webhook] Database not available");
          return res.status(500).json({ error: "Database not available" });
        }

        // Verificar se já existe
        const existing = await db
          .select()
          .from(payments)
          .where(eq(payments.mercadopagoPaymentId, paymentId.toString()))
          .limit(1);

        if (existing.length === 0) {
          // Extrair informações do pagamento
          const amount = data?.transaction_amount || 0;
          const externalReference = data?.external_reference || "";
          const buyerEmail = data?.payer?.email || "";

          // Tentar encontrar o lead pelo email
          let leadId: number | null = null;
          let leadEmail = buyerEmail;
          let profileName = "Seu Devocional";

          if (buyerEmail) {
            const leadData = await db
              .select()
              .from(leads)
              .where(eq(leads.email, buyerEmail))
              .limit(1);

            if (leadData.length > 0) {
              leadId = leadData[0].id;
              leadEmail = leadData[0].email;
            }
          }

          // Se não encontrou pelo email, tentar pelo external_reference
          if (!leadId && externalReference) {
            const parts = externalReference.split("-");
            if (parts.length > 1) {
              const refLeadId = parseInt(parts[1]);
              if (!isNaN(refLeadId)) {
                const leadData = await db
                  .select()
                  .from(leads)
                  .where(eq(leads.id, refLeadId))
                  .limit(1);

                if (leadData.length > 0) {
                  leadId = leadData[0].id;
                  leadEmail = leadData[0].email;
                }
              }
            }
          }

          if (leadId) {
            // Inserir novo pagamento
            await db.insert(payments).values({
              leadId: leadId,
              mercadopagoPaymentId: paymentId.toString(),
              amount: Math.round(amount),
              status: "succeeded",
              productName: "Devocional: 7 Dias para se Aproximar de Deus",
            })

            console.log(`[Mercado Pago Webhook] Payment recorded for lead ${leadId}`);

            // Enviar email com PDF devocional
            try {
              const downloadLink = `${process.env.FRONTEND_URL || "https://espiritualquiz-sx87ncqt.manus.space"}/checkout-success`;

              const emailSent = await sendDevotionalConfirmationEmail(
                leadEmail,
                profileName,
                downloadLink
              );

              if (emailSent) {
                console.log(`[Mercado Pago Webhook] Email sent to ${leadEmail}`);
              } else {
                console.warn(`[Mercado Pago Webhook] Email failed for ${leadEmail}`);
              }
            } catch (emailError: any) {
              console.error(`[Mercado Pago Webhook] Failed to send email: ${emailError.message}`);
            }
          } else {
            console.warn(`[Mercado Pago Webhook] Could not find lead for payment ${paymentId}`);
          }
        }
      } catch (dbError: any) {
        console.error(`[Mercado Pago Webhook] Database error: ${dbError.message}`);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Mercado Pago Webhook] Error processing event: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}
