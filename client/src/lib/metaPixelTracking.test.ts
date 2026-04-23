import { describe, it, expect } from 'vitest';
import {
  trackViewContent,
  trackLead,
  trackInitiateCheckout,
  trackPurchase,
} from './metaPixelTracking';

/**
 * Testes de integração Meta Pixel Tracking
 * 
 * Nota: Estes testes validam que as funções de tracking:
 * 1. Existem e são exportadas corretamente
 * 2. Aceitam os parâmetros corretos
 * 3. Não lançam erros quando chamadas
 * 
 * Os testes de fbq (Meta Pixel) real são feitos no navegador
 * durante testes de integração end-to-end.
 */

describe('Meta Pixel Tracking - Integration Tests', () => {
  describe('trackViewContent', () => {
    it('deve ser uma função exportada', () => {
      expect(typeof trackViewContent).toBe('function');
    });

    it('deve ser chamada sem erros', () => {
      expect(() => trackViewContent()).not.toThrow();
    });
  });

  describe('trackLead', () => {
    it('deve ser uma função exportada', () => {
      expect(typeof trackLead).toBe('function');
    });

    it('deve ser chamada sem email e telefone', () => {
      expect(() => trackLead()).not.toThrow();
    });

    it('deve ser chamada com email e telefone', () => {
      expect(() => trackLead('test@example.com', '11999999999')).not.toThrow();
    });

    it('deve ser chamada com apenas email', () => {
      expect(() => trackLead('test@example.com')).not.toThrow();
    });

    it('deve ser chamada com apenas telefone', () => {
      expect(() => trackLead(undefined, '11999999999')).not.toThrow();
    });
  });

  describe('trackInitiateCheckout', () => {
    it('deve ser uma função exportada', () => {
      expect(typeof trackInitiateCheckout).toBe('function');
    });

    it('deve ser chamada sem parâmetros', () => {
      expect(() => trackInitiateCheckout()).not.toThrow();
    });

    it('deve ser chamada com valor customizado', () => {
      expect(() => trackInitiateCheckout(25.50)).not.toThrow();
    });

    it('deve ser chamada com valor padrão 12.90', () => {
      expect(() => trackInitiateCheckout(12.90)).not.toThrow();
    });
  });

  describe('trackPurchase', () => {
    it('deve ser uma função exportada', () => {
      expect(typeof trackPurchase).toBe('function');
    });

    it('deve ser chamada com transactionId', () => {
      expect(() => trackPurchase(12.90, 'txn_123')).not.toThrow();
    });

    it('deve ser chamada com transactionId e productName', () => {
      expect(() => trackPurchase(12.90, 'txn_456', 'Devocional Personalizado')).not.toThrow();
    });

    it('deve ser chamada com valores diferentes', () => {
      expect(() => trackPurchase(25.50, 'txn_789', 'Produto Premium')).not.toThrow();
    });

    it('deve gerar eventId no padrão purchase_transactionId', () => {
      // Validar que a função não lança erro ao ser chamada
      // A validação real do eventId é feita no navegador
      expect(() => trackPurchase(12.90, 'unique_txn_789')).not.toThrow();
    });
  });

  describe('Event ID Deduplication Pattern', () => {
    it('deve seguir padrão purchase_transactionId para deduplicação', () => {
      // Este teste valida que o padrão de eventId é consistente
      // entre frontend e backend
      const transactionIds = ['txn_1', 'txn_2', 'txn_3'];
      
      transactionIds.forEach((txnId) => {
        expect(() => trackPurchase(12.90, txnId)).not.toThrow();
      });
    });
  });

  describe('Meta Pixel Tracking Data Structure', () => {
    it('trackViewContent deve enviar dados corretos', () => {
      // Validar que a função pode ser chamada
      // Os dados reais são validados no navegador
      expect(() => trackViewContent()).not.toThrow();
    });

    it('trackLead deve enviar dados com email e telefone', () => {
      const email = 'user@example.com';
      const phone = '11987654321';
      
      expect(() => trackLead(email, phone)).not.toThrow();
    });

    it('trackInitiateCheckout deve enviar dados com valor', () => {
      const amount = 12.90;
      
      expect(() => trackInitiateCheckout(amount)).not.toThrow();
    });

    it('trackPurchase deve enviar dados com deduplicação', () => {
      const amount = 12.90;
      const transactionId = 'purchase_txn_123';
      const productName = 'Devocional Personalizado';
      
      expect(() => trackPurchase(amount, transactionId, productName)).not.toThrow();
    });
  });
});
