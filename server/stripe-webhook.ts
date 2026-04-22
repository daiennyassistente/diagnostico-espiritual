import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "./db";
import { payments, leads, diagnosticHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendDevotionalConfirmationEmail } from "./email-service";
import { generateDevocionalPDF } from "./pdf-generator";

// Funcao para disparar evento Purchase do Meta Pixel via API de Conversao
const firePixelPurchaseEvent = async (
  email: string,
  amount: number,
  productName: string,
  leadId: number
) => {
  try {
    // Log do evento
    console.log(
      `[Meta Pixel] Disparando evento Purchase: email=${email}, amount=${amount}, product=${productName}`
    );
    // O evento sera disparado via API de Conversao do Meta
    // Implementacao completa requer configuracao de webhook no Meta
  } catch (error: any) {
    console.error(
      `[Meta Pixel] Erro ao disparar evento Purchase: ${error.message}`
    );
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(200).json({ verified: true });
  }

  let event: Stripe.Event;

  try {
    // Construir o evento usando o body raw (não parseado)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return res.status(200).json({ verified: true });
  }

  // Detectar eventos de teste
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    // Processar eventos de pagamento
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);

        // Registrar pagamento no banco de dados
        const clientReferenceId = paymentIntent.metadata?.client_reference_id;
        const leadId = paymentIntent.metadata?.user_id;
        const amount = paymentIntent.amount;

        if (clientReferenceId && leadId) {
          try {
            const db = await getDb();
            if (!db) {
              console.error("[Webhook] Database not available");
              return res.status(500).json({ error: "Database not available" });
            }

            // Verificar se já existe
            const existing = await db
              .select()
              .from(payments)
              .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
              .limit(1);

            if (existing.length === 0) {
              // Inserir novo pagamento
              await db.insert(payments).values({
                leadId: parseInt(leadId),
                stripePaymentIntentId: paymentIntent.id,
                amount: Math.round(amount / 100), // Converter de centavos para reais
                status: "succeeded",
                productName: "Devocional: 7 Dias para se Aproximar de Deus",
              });
              console.log(`[Webhook] Payment recorded for lead ${leadId}`);
              
              // Gerar devocional automaticamente
              try {
                const diagnostic = await db
                  .select()
                  .from(diagnosticHistory)
                  .where(eq(diagnosticHistory.leadId, parseInt(leadId)))
                  .limit(1);
                
                if (diagnostic.length > 0) {
                  console.log(`[Webhook] Generating devotional PDF for lead ${leadId}`);
                  
                  // Preparar dados para gerar o devocional
                  const devotionalData = {
                    profileName: diagnostic[0].profileName,
                    profileDescription: diagnostic[0].profileDescription,
                    strengths: JSON.parse(diagnostic[0].strengths),
                    challenges: JSON.parse(diagnostic[0].challenges),
                    recommendations: JSON.parse(diagnostic[0].recommendations),
                    nextSteps: JSON.parse(diagnostic[0].nextSteps),
                    responses: {},
                  };
                  
                  // Gerar PDF do devocional
                  const pdfBuffer = await generateDevocionalPDF(devotionalData);
                  console.log(`[Webhook] Devotional PDF generated successfully (${pdfBuffer.length} bytes)`);
                } else {
                  console.warn(`[Webhook] No diagnostic found for lead ${leadId}`);
                }
              } catch (pdfError: any) {
                console.error(`[Webhook] Failed to generate devotional PDF: ${pdfError.message}`);
              }
              
              // Enviar email com PDF devocional
              try {
                const leadData = await db.select().from(leads).where(eq(leads.id, parseInt(leadId))).limit(1);
                if (leadData.length > 0) {
                  const profileName = paymentIntent.metadata?.profile_name || "Seu Devocional";
                  const downloadLink = `${process.env.FRONTEND_URL || "https://espiritualquiz-sx87ncqt.manus.space"}/checkout-success`;
                  
                  const emailSent = await sendDevotionalConfirmationEmail(
                    leadData[0].email,
                    profileName,
                    downloadLink
                  );
                  
                  if (emailSent) {
                    console.log(`[Webhook] Email sent to ${leadData[0].email}`);
                    
                    // Disparar evento Purchase do Meta Pixel APENAS se email foi enviado com sucesso
                    const profileName = paymentIntent.metadata?.profile_name || "Seu Devocional";
                    await firePixelPurchaseEvent(
                      leadData[0].email,
                      12.90,
                      profileName,
                      parseInt(leadId)
                    );
                  } else {
                    console.warn(`[Webhook] Email failed for ${leadData[0].email}`);
                  }
                }
              } catch (emailError: any) {
                console.error(`[Webhook] Failed to send email: ${emailError.message}`);
              }
            }
          } catch (dbError: any) {
            console.error(`[Webhook] Database error: ${dbError.message}`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);

        const leadId = paymentIntent.metadata?.user_id;
        if (leadId) {
          try {
            const db = await getDb();
            if (!db) {
              console.error("[Webhook] Database not available");
              return res.status(500).json({ error: "Database not available" });
            }

            // Registrar falha de pagamento
            const existing = await db
              .select()
              .from(payments)
              .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
              .limit(1);

            if (existing.length === 0) {
              await db.insert(payments).values({
                leadId: parseInt(leadId),
                stripePaymentIntentId: paymentIntent.id,
                amount: Math.round(paymentIntent.amount / 100),
                status: "failed",
                productName: "Devocional: 7 Dias para se Aproximar de Deus",
              });
            }
          } catch (dbError: any) {
            console.error(`[Webhook] Database error: ${dbError.message}`);
          }
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Checkout session completed: ${session.id}`);

        // Registrar pagamento no banco de dados
        const clientReferenceId = session.client_reference_id;
        const leadId = clientReferenceId;
        const amount = session.amount_total || 0;

        if (leadId) {
          try {
            const db = await getDb();
            if (!db) {
              console.error("[Webhook] Database not available");
              return res.status(500).json({ error: "Database not available" });
            }

            // Verificar se já existe
            const existing = await db
              .select()
              .from(payments)
              .where(eq(payments.stripePaymentIntentId, session.id))
              .limit(1);

            if (existing.length === 0) {
              // Inserir novo pagamento
              await db.insert(payments).values({
                leadId: parseInt(leadId),
                stripePaymentIntentId: session.id,
                amount: Math.round(amount / 100), // Converter de centavos para reais
                status: "succeeded",
                productName: "Devocional: 7 Dias para se Aproximar de Deus",
              });
              console.log(`[Webhook] Payment recorded for lead ${leadId}`);
              
              // Gerar devocional automaticamente
              try {
                const diagnostic = await db
                  .select()
                  .from(diagnosticHistory)
                  .where(eq(diagnosticHistory.leadId, parseInt(leadId)))
                  .limit(1);
                
                if (diagnostic.length > 0) {
                  console.log(`[Webhook] Generating devotional PDF for lead ${leadId}`);
                  
                  // Preparar dados para gerar o devocional
                  const devotionalData = {
                    profileName: diagnostic[0].profileName,
                    profileDescription: diagnostic[0].profileDescription,
                    strengths: JSON.parse(diagnostic[0].strengths),
                    challenges: JSON.parse(diagnostic[0].challenges),
                    recommendations: JSON.parse(diagnostic[0].recommendations),
                    nextSteps: JSON.parse(diagnostic[0].nextSteps),
                    responses: {},
                  };
                  
                  // Gerar PDF do devocional
                  const pdfBuffer = await generateDevocionalPDF(devotionalData);
                  console.log(`[Webhook] Devotional PDF generated successfully (${pdfBuffer.length} bytes)`);
                } else {
                  console.warn(`[Webhook] No diagnostic found for lead ${leadId}`);
                }
              } catch (pdfError: any) {
                console.error(`[Webhook] Failed to generate devotional PDF: ${pdfError.message}`);
              }
              
              // Enviar email com PDF devocional
              try {
                const leadData = await db.select().from(leads).where(eq(leads.id, parseInt(leadId))).limit(1);
                if (leadData.length > 0) {
                  const profileName = session.metadata?.profile_name || "Seu Devocional";
                  const downloadLink = `${process.env.FRONTEND_URL || "https://espiritualquiz-sx87ncqt.manus.space"}/checkout-success`;
                  
                  const emailSent = await sendDevotionalConfirmationEmail(
                    leadData[0].email,
                    profileName,
                    downloadLink
                  );
                  
                  if (emailSent) {
                    console.log(`[Webhook] Email sent to ${leadData[0].email}`);
                    
                    // Disparar evento Purchase do Meta Pixel APENAS se email foi enviado com sucesso
                    const profileName = session.metadata?.profile_name || "Seu Devocional";
                    await firePixelPurchaseEvent(
                      leadData[0].email,
                      12.90,
                      profileName,
                      parseInt(leadId)
                    );
                  } else {
                    console.warn(`[Webhook] Email failed for ${leadData[0].email}`);
                  }
                }
              } catch (emailError: any) {
                console.error(`[Webhook] Failed to send email: ${emailError.message}`);
              }
            }
          } catch (dbError: any) {
            console.error(`[Webhook] Database error: ${dbError.message}`);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[Webhook] Charge refunded: ${charge.id}`);

        if (charge.payment_intent) {
          try {
            const db = await getDb();
            if (!db) {
              console.error("[Webhook] Database not available");
              return res.status(500).json({ error: "Database not available" });
            }

            // Atualizar status do pagamento para canceled (refunded)
            await db
              .update(payments)
              .set({ status: "canceled" })
              .where(eq(payments.stripePaymentIntentId, charge.payment_intent as string));
            console.log(`[Webhook] Payment marked as canceled (refunded)`);
          } catch (dbError: any) {
            console.error(`[Webhook] Database error: ${dbError.message}`);
          }
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ verified: true });
  } catch (error: any) {
    console.error(`[Webhook] Error processing event: ${error.message}`);
    res.status(200).json({ verified: true });
  }
}

// Tipo para req.rawBody (necessário para webhook)
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}
