/**
 * Stripe Products Configuration
 * Define all products and prices here for centralized access
 */

export const STRIPE_PRODUCTS = {
  spiritualMap: {
    name: "Mapa Espiritual + Guia para 7 Dias",
    description: "Descubra seu perfil espiritual único com análise profunda e receba um guia personalizado de 7 dias para transformar sua vida espiritual. Inclui recomendações exclusivas baseadas em seu diagnóstico.",
    priceInCents: 990, // R$ 9,90
    currency: "brl",
    // Note: You'll need to create the actual Stripe Product and Price IDs in your Stripe Dashboard
    // Then update these values:
    stripeProductId: "prod_placeholder", // Replace with actual Stripe Product ID
    stripePriceId: "price_placeholder", // Replace with actual Stripe Price ID
  },
};

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;
