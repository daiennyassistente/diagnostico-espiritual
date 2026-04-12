import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Test the validation schemas directly
describe("quiz validation", () => {
  const submitLeadSchema = z.object({
    whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
    email: z.string().email("E-mail inválido"),
  });

  const submitResponsesSchema = z.object({
    leadId: z.number(),
    step1: z.string().optional(),
    step2: z.string().optional(),
    step3: z.string().optional(),
    step4: z.string().optional(),
    step5: z.string().optional(),
    step6: z.string().optional(),
    step7: z.string().optional(),
    step8: z.string().optional(),
    step9: z.string().optional(),
    step10: z.string().optional(),
  });

  describe("submitLead validation", () => {
    it("should validate WhatsApp format", () => {
      const result = submitLeadSchema.safeParse({
        whatsapp: "123", // Too short
        email: "test@example.com",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("WhatsApp");
      }
    });

    it("should validate email format", () => {
      const result = submitLeadSchema.safeParse({
        whatsapp: "11999999999",
        email: "invalid-email",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("E-mail");
      }
    });

    it("should accept valid WhatsApp and email", () => {
      const result = submitLeadSchema.safeParse({
        whatsapp: "11999999999",
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid WhatsApp with different formats", () => {
      const validNumbers = [
        "11999999999",
        "1199999999",
        "551199999999",
      ];

      validNumbers.forEach((whatsapp) => {
        const result = submitLeadSchema.safeParse({
          whatsapp,
          email: "test@example.com",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("submitResponses validation", () => {
    it("should accept valid quiz responses", () => {
      const result = submitResponsesSchema.safeParse({
        leadId: 1,
        step1: "próxima de Deus, mas inconstante",
        step2: "distrações",
        step3: "frequente e profunda",
        step4: "sincera, mas instável",
        step5: "intimidade",
        step6: "disciplina",
        step7: "voltar ao secreto",
        step8: "15 min",
        step9: "emocional",
        step10: "com fome de Deus",
      });

      expect(result.success).toBe(true);
    });

    it("should accept partial responses", () => {
      const result = submitResponsesSchema.safeParse({
        leadId: 1,
        step1: "próxima de Deus, mas inconstante",
        step2: "distrações",
      });

      expect(result.success).toBe(true);
    });

    it("should require leadId", () => {
      const result = submitResponsesSchema.safeParse({
        step1: "próxima de Deus, mas inconstante",
      });

      expect(result.success).toBe(false);
    });

    it("should accept empty responses object with leadId", () => {
      const result = submitResponsesSchema.safeParse({
        leadId: 1,
      });

      expect(result.success).toBe(true);
    });
  });
});
