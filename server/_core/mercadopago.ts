import { MercadoPagoConfig, Preference } from "mercadopago";

const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const mercadopagoClient = new Preference(mercadopagoConfig);

export async function createMercadoPagoPreference(options: {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  email: string;
  externalReference: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  payerName?: string;
  payerSurname?: string;
  payerPhone?: { areaCode: string; number: string };
}) {
  try {
    const preference = await mercadopagoClient.create({
      body: {
        items: [
          {
            id: "1",
            title: options.title,
            description: options.description || "Guia devocional personalizado de 7 dias para se aproximar de Deus",
            category_id: "books",
            quantity: options.quantity,
            unit_price: options.price,
          },
        ],
        payer: {
          email: options.email,
          name: options.payerName || "Cliente",
          surname: options.payerSurname || "Diagnóstico Espiritual",
          phone: {
            area_code: options.payerPhone?.areaCode || "11",
            number: options.payerPhone?.number || "999999999",
          },
          identification: {
            type: "CPF",
            number: "00000000000",
          },
        },
        external_reference: options.externalReference,
        back_urls: {
          success: options.successUrl,
          failure: options.failureUrl,
          pending: options.pendingUrl,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [
            {
              id: "atm",
            },
          ],
        },
        notification_url: "https://diagnosticoespiritual.manus.space/api/mercadopago/webhook",
      },
    });

    return preference;
  } catch (error) {
    console.error("[Mercado Pago] Error creating preference:", error);
    throw error;
  }
}

export function getMercadoPagoInitPoint(preference: any): string | null {
  const initPoint = preference?.init_point || null;
  if (!initPoint) return null;
  
  // Usar wallet_purchase para abrir direto na página de pagamento
  // Isso pula a página de resumo e vai direto para escolha de método
  const walletPurchase = preference?.wallet_purchase || null;
  if (walletPurchase) {
    return walletPurchase;
  }
  
  // Fallback para init_point se wallet_purchase não existir
  return initPoint;
}
