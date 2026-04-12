import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Checkout Validation", () => {
  // Schema para validar entrada do checkout
  const checkoutInputSchema = z.object({
    email: z.string().email("E-mail inválido"),
    profileName: z.string().min(1, "Nome do perfil é obrigatório"),
  });

  it("should validate correct checkout input", () => {
    const validInput = {
      email: "user@example.com",
      profileName: "✨ Coração em Recomeço",
    };

    const result = checkoutInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidInput = {
      email: "invalid-email",
      profileName: "✨ Coração em Recomeço",
    };

    const result = checkoutInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should reject missing profileName", () => {
    const invalidInput = {
      email: "user@example.com",
      profileName: "",
    };

    const result = checkoutInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should accept various valid email formats", () => {
    const validEmails = [
      "simple@example.com",
      "user.name@example.co.uk",
      "user+tag@example.com",
      "123@example.com",
    ];

    validEmails.forEach((email) => {
      const input = {
        email,
        profileName: "✨ Coração em Recomeço",
      };
      const result = checkoutInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  it("should handle profile names with special characters", () => {
    const profileNames = [
      "✨ Coração em Recomeço",
      "📖 Fé Cansada",
      "🔒 Travada Espiritualmente",
      "🌱 Amadurecendo na Fé",
    ];

    profileNames.forEach((profileName) => {
      const input = {
        email: "user@example.com",
        profileName,
      };
      const result = checkoutInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  it("should validate checkout response structure", () => {
    const checkoutResponseSchema = z.object({
      success: z.boolean(),
      checkoutUrl: z.string().url().optional(),
    });

    const validResponse = {
      success: true,
      checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123",
    };

    const result = checkoutResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should validate error response", () => {
    const checkoutResponseSchema = z.object({
      success: z.boolean(),
      checkoutUrl: z.string().url().optional(),
    });

    const errorResponse = {
      success: false,
    };

    const result = checkoutResponseSchema.safeParse(errorResponse);
    expect(result.success).toBe(true);
  });

  it("should reject invalid checkout URL", () => {
    const checkoutResponseSchema = z.object({
      success: z.boolean(),
      checkoutUrl: z.string().url().optional(),
    });

    const invalidResponse = {
      success: true,
      checkoutUrl: "not-a-valid-url",
    };

    const result = checkoutResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("should validate Stripe price data", () => {
    const stripePriceDataSchema = z.object({
      currency: z.literal("brl"),
      unit_amount: z.number().int().positive(),
      product_data: z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    });

    const validPriceData = {
      currency: "brl",
      unit_amount: 990,
      product_data: {
        name: "Devocional: 7 Dias para se Aproximar de Deus",
        description: "Guia devocional personalizado baseado em seu perfil",
      },
    };

    const result = stripePriceDataSchema.safeParse(validPriceData);
    expect(result.success).toBe(true);
  });

  it("should validate Stripe session metadata", () => {
    const stripeMetadataSchema = z.object({
      profileName: z.string(),
      email: z.string().email(),
    });

    const validMetadata = {
      profileName: "✨ Coração em Recomeço",
      email: "user@example.com",
    };

    const result = stripeMetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });
});
