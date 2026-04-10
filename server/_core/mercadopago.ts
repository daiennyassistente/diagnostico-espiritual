import { MercadoPagoConfig, Preference } from "mercadopago";

const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const mercadopagoClient = new Preference(mercadopagoConfig);

export async function createMercadoPagoPreference(options: {
  title: string;
  price: number;
  quantity: number;
  email: string;
  externalReference: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}) {
  try {
    const preference = await mercadopagoClient.create({
      body: {
        items: [
          {
            id: "1",
            title: options.title,
            quantity: options.quantity,
            unit_price: options.price,
          },
        ],
        payer: {
          email: options.email,
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
  
  // Retornar o init_point diretamente
  // O Mercado Pago irá detectar o dispositivo no navegador
  return initPoint;
}
