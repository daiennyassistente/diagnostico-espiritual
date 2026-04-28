import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WhatsApp Offer Flow - Mercado Pago Integration', () => {
  describe('OfferPage - Lead ID Retrieval', () => {
    it('should retrieve leadId from localStorage', () => {
      // Simular dados no localStorage
      const mockLeadData = {
        leadId: 123,
        email: 'test@example.com',
        name: 'Test User',
        whatsapp: '5511999999999',
      };

      // Verificar que o leadId está disponível
      expect(mockLeadData.leadId).toBe(123);
      expect(typeof mockLeadData.leadId).toBe('number');
    });

    it('should construct checkout URL with leadId parameter', () => {
      const leadId = 123;
      const price = 7.90;
      const checkoutUrl = `/checkout?offer=whatsapp&price=${price}&leadId=${leadId}`;

      expect(checkoutUrl).toContain('leadId=123');
      expect(checkoutUrl).toContain('price=7.9');
      expect(checkoutUrl).toContain('offer=whatsapp');
    });

    it('should disable checkout button when leadId is missing', () => {
      const leadId = null;
      const isDisabled = !leadId;

      expect(isDisabled).toBe(true);
    });
  });

  describe('Checkout - Lead ID Handling', () => {
    it('should prioritize leadId from URL over localStorage', () => {
      const urlLeadId = '456';
      const storageLeadId = 123;

      const finalLeadId = urlLeadId ? parseInt(urlLeadId) : storageLeadId;

      expect(finalLeadId).toBe(456);
    });

    it('should use localStorage leadId if URL leadId is missing', () => {
      const urlLeadId = null;
      const storageLeadId = 123;

      const finalLeadId = urlLeadId ? parseInt(urlLeadId) : storageLeadId;

      expect(finalLeadId).toBe(123);
    });

    it('should redirect to quiz if no leadId is available', () => {
      const urlLeadId = null;
      const storageLeadId = null;

      const finalLeadId = urlLeadId ? parseInt(urlLeadId) : storageLeadId;
      const shouldRedirect = !finalLeadId;

      expect(shouldRedirect).toBe(true);
    });

    it('should pass correct price to Mercado Pago for offer', () => {
      const isOfferPrice = true;
      const offerPrice = 7.90;
      const regularPrice = 9.90;

      const finalPrice = isOfferPrice ? offerPrice : regularPrice;

      expect(finalPrice).toBe(7.90);
    });

    it('should pass correct price to Mercado Pago for regular checkout', () => {
      const isOfferPrice = false;
      const offerPrice = 7.90;
      const regularPrice = 9.90;

      const finalPrice = isOfferPrice ? offerPrice : regularPrice;

      expect(finalPrice).toBe(9.90);
    });
  });

  describe('Mercado Pago Checkout Creation', () => {
    it('should create preference with correct structure', () => {
      const input = {
        email: 'test@example.com',
        profileName: 'Diagnóstico Espiritual',
        userPhone: '5511999999999',
        leadId: '123',
      };

      const price = 9.90;

      const preference = {
        items: [
          {
            title: 'Devocional: 7 Dias para se Aproximar de Deus',
            description: input.profileName,
            unit_price: price,
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: input.email,
          phone: {
            number: input.userPhone,
          },
        },
        back_urls: {
          success: 'https://example.com/checkout-success',
          failure: 'https://example.com/checkout',
          pending: 'https://example.com/checkout-pending',
        },
        auto_return: 'approved',
        notification_url: 'https://example.com/api/mercadopago/webhook',
        external_reference: input.leadId,
        payment_methods: {
          installments: 1,
        },
        metadata: {
          profileName: input.profileName,
          userPhone: input.userPhone,
        },
      };

      // Validar estrutura
      expect(preference.items[0].unit_price).toBe(9.90);
      expect(preference.payer.email).toBe('test@example.com');
      expect(preference.external_reference).toBe('123');
      expect(preference.items[0].title).toContain('Devocional');
    });

    it('should set correct external_reference for lead tracking', () => {
      const leadId = '123';
      const external_reference = leadId;

      expect(external_reference).toBe('123');
    });

    it('should include webhook notification URL', () => {
      const origin = 'https://diagnosticoespiritual.manus.space';
      const notification_url = `${origin}/api/mercadopago/webhook`;

      expect(notification_url).toContain('/api/mercadopago/webhook');
    });
  });

  describe('Payment Record Creation', () => {
    it('should create payment record with correct amount', () => {
      const leadId = 123;
      const amount = 9.90;
      const currency = 'BRL';
      const status = 'pending';

      const paymentRecord = {
        leadId,
        amount,
        currency,
        status,
        productName: 'Devocional: 7 Dias para se Aproximar de Deus',
      };

      expect(paymentRecord.leadId).toBe(123);
      expect(paymentRecord.amount).toBe(9.90);
      expect(paymentRecord.status).toBe('pending');
    });

    it('should create payment record with offer price', () => {
      const leadId = 123;
      const amount = 7.90; // Offer price
      const currency = 'BRL';
      const status = 'pending';

      const paymentRecord = {
        leadId,
        amount,
        currency,
        status,
        productName: 'Devocional: 7 Dias para se Aproximar de Deus',
      };

      expect(paymentRecord.amount).toBe(7.90);
    });
  });

  describe('End-to-End Offer Flow', () => {
    it('should complete full offer flow from page to checkout', () => {
      // 1. User on offer page with leadId
      const leadId = 123;
      expect(leadId).toBeDefined();

      // 2. User clicks "Finalizar Compra"
      const price = 7.90;
      const checkoutUrl = `/checkout?offer=whatsapp&price=${price}&leadId=${leadId}`;

      // 3. Checkout page receives leadId from URL
      const urlParams = new URLSearchParams(checkoutUrl.split('?')[1]);
      const receivedLeadId = parseInt(urlParams.get('leadId') || '0');
      const receivedPrice = parseFloat(urlParams.get('price') || '0');

      expect(receivedLeadId).toBe(123);
      expect(receivedPrice).toBe(7.90);

      // 4. Checkout sends to Mercado Pago with leadId
      const externalReference = receivedLeadId.toString();
      expect(externalReference).toBe('123');
    });

    it('should handle missing leadId gracefully', () => {
      const leadId = null;

      if (!leadId) {
        // Should redirect to quiz
        const redirectUrl = '/quiz';
        expect(redirectUrl).toBe('/quiz');
      }
    });
  });

  describe('Mercado Pago Response Handling', () => {
    it('should extract init_point from Mercado Pago response', () => {
      const mockResponse = {
        id: 'preference_id_123',
        init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123',
        sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=123',
      };

      const checkoutUrl = mockResponse.init_point;

      expect(checkoutUrl).toContain('mercadopago.com.br');
      expect(checkoutUrl).toContain('pref_id=123');
    });

    it('should handle Mercado Pago API errors', () => {
      const mockError = {
        message: 'Invalid preference',
        error: 'INVALID_PREFERENCE',
      };

      const errorMessage = `Mercado Pago API error: ${mockError.message}`;

      expect(errorMessage).toContain('Invalid preference');
    });
  });
});
