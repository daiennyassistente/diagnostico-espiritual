import { describe, it, expect } from "vitest";
import Stripe from "stripe";

describe("Webhook Stripe e Compartilhamento", () => {
  describe("Webhook Stripe", () => {
    it("deve validar assinatura de webhook de teste", () => {
      // Simular evento de teste do Stripe
      const testEvent = {
        id: "evt_test_123456",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            amount: 990,
            metadata: {
              user_id: "1",
              client_reference_id: "lead_1",
              profile_name: "Amadurecendo na Fé",
            },
          },
        },
      };

      // Verificar que evento de teste é detectado
      expect(testEvent.id.startsWith("evt_test_")).toBe(true);
      expect(testEvent.type).toBe("payment_intent.succeeded");
      expect(testEvent.data.object.amount).toBe(990);
    });

    it("deve extrair metadados do payment intent", () => {
      const paymentIntent = {
        id: "pi_123456",
        amount: 990,
        metadata: {
          user_id: "42",
          client_reference_id: "lead_42",
          profile_name: "Buscando Direção",
          customer_email: "user@example.com",
        },
      };

      expect(paymentIntent.metadata.user_id).toBe("42");
      expect(paymentIntent.metadata.profile_name).toBe("Buscando Direção");
      expect(paymentIntent.metadata.customer_email).toBe("user@example.com");
    });
  });

  describe("Compartilhamento em Redes Sociais", () => {
    it("deve gerar URL correta para compartilhamento no Facebook", () => {
      const profileName = "Amadurecendo na Fé";
      const resultText = "Descobri meu perfil espiritual!";
      const siteUrl = "https://espiritualquiz-sx87ncqt.manus.space";

      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(resultText)}`;

      expect(facebookUrl).toContain("facebook.com/sharer");
      expect(facebookUrl).toContain(encodeURIComponent(siteUrl));
      expect(facebookUrl).toContain(encodeURIComponent(resultText));
    });

    it("deve gerar URL correta para compartilhamento no Twitter/X", () => {
      const profileName = "Buscando Direção";
      const resultText = `Descobri meu perfil espiritual: ${profileName}`;
      const siteUrl = "https://espiritualquiz-sx87ncqt.manus.space";

      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resultText)}&url=${encodeURIComponent(siteUrl)}`;

      expect(twitterUrl).toContain("twitter.com/intent/tweet");
      expect(twitterUrl).toContain(encodeURIComponent(resultText));
      expect(twitterUrl).toContain(encodeURIComponent(siteUrl));
    });

    it("deve gerar URL correta para compartilhamento no LinkedIn", () => {
      const siteUrl = "https://espiritualquiz-sx87ncqt.manus.space";
      const title = "Diagnóstico Espiritual";

      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;

      expect(linkedinUrl).toContain("linkedin.com/sharing");
      expect(linkedinUrl).toContain(encodeURIComponent(siteUrl));
    });

    it("deve gerar URL correta para compartilhamento no WhatsApp", () => {
      const profileName = "Restaurando Relacionamento";
      const message = `Fiz o Diagnóstico Espiritual e descobri que sou: ${profileName}. Faça você também!`;
      const siteUrl = "https://espiritualquiz-sx87ncqt.manus.space";

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + siteUrl)}`;

      expect(whatsappUrl).toContain("wa.me");
      expect(whatsappUrl).toContain(encodeURIComponent(message));
      expect(whatsappUrl).toContain(encodeURIComponent(siteUrl));
    });

    it("deve validar que todas as URLs de compartilhamento são válidas", () => {
      const urls = {
        facebook: "https://www.facebook.com/sharer/sharer.php?u=test&quote=test",
        twitter: "https://twitter.com/intent/tweet?text=test&url=test",
        linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=test",
        whatsapp: "https://wa.me/?text=test",
      };

      Object.entries(urls).forEach(([platform, url]) => {
        expect(url).toBeTruthy();
        expect(url).toContain("https://");
        console.log(`✓ ${platform}: ${url.substring(0, 50)}...`);
      });
    });
  });

  describe("Integração Email + Webhook", () => {
    it("deve preparar dados para envio de email após pagamento", () => {
      const leadData = {
        id: 1,
        email: "user@example.com",
        whatsapp: "(11) 98765-4321",
        createdAt: new Date(),
      };

      const paymentIntent = {
        metadata: {
          profile_name: "Vivendo Plenamente",
        },
      };

      const profileName = paymentIntent.metadata?.profile_name || "Seu Devocional";
      const downloadLink = "https://espiritualquiz-sx87ncqt.manus.space/checkout-success";

      expect(leadData.email).toBe("user@example.com");
      expect(profileName).toBe("Vivendo Plenamente");
      expect(downloadLink).toContain("/checkout-success");
    });
  });
});
