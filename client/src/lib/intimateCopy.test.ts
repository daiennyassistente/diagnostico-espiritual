import { describe, it, expect } from 'vitest';
import { generateIntimatePageCopy } from './intimateCopy';

describe('generateIntimatePageCopy - Conversa Íntima e Emocional', () => {
  const mockChallenges = [
    'Falta de disciplina que impede a constância na Palavra e oração',
    'Sensação de ausência de direção espiritual clara',
    'Dificuldade para manter a sensibilidade espiritual ativa',
  ];

  describe('Estrutura Básica', () => {
    it('should generate all required fields', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'João'
      );

      expect(copy).toHaveProperty('opening');
      expect(copy).toHaveProperty('identification');
      expect(copy).toHaveProperty('revelation');
      expect(copy).toHaveProperty('painReality');
      expect(copy).toHaveProperty('comfort');
      expect(copy).toHaveProperty('hope');
      expect(copy).toHaveProperty('solutionIntro');
      expect(copy).toHaveProperty('benefits');
      expect(copy).toHaveProperty('urgency');
      expect(copy).toHaveProperty('ctaPrimary');
      expect(copy).toHaveProperty('priceMessage');
      expect(copy).toHaveProperty('closingThought');
    });

    it('should have non-empty strings for all text fields', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Maria'
      );

      expect(copy.opening.length).toBeGreaterThan(0);
      expect(copy.identification.length).toBeGreaterThan(0);
      expect(copy.revelation.length).toBeGreaterThan(0);
      expect(copy.painReality.length).toBeGreaterThan(0);
      expect(copy.comfort.length).toBeGreaterThan(0);
      expect(copy.hope.length).toBeGreaterThan(0);
      expect(copy.solutionIntro.length).toBeGreaterThan(0);
      expect(copy.urgency.length).toBeGreaterThan(0);
      expect(copy.ctaPrimary.length).toBeGreaterThan(0);
      expect(copy.priceMessage.length).toBeGreaterThan(0);
      expect(copy.closingThought.length).toBeGreaterThan(0);
    });

    it('should generate exactly 5 benefits', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Pedro'
      );

      expect(Array.isArray(copy.benefits)).toBe(true);
      expect(copy.benefits.length).toBe(5);
      copy.benefits.forEach((benefit) => {
        expect(typeof benefit).toBe('string');
        expect(benefit.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tom Conversacional e Emocional', () => {
    it('should start with intimate opening phrase', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Ana'
      );

      expect(copy.opening).toContain('preciso te falar');
      expect(copy.opening).toContain('não é por acaso');
    });

    it('should include user name in opening', () => {
      const userName = 'Carlos';
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        userName
      );

      expect(copy.opening).toContain(userName);
    });

    it('should include user name in solution intro', () => {
      const userName = 'Lucia';
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        userName
      );

      expect(copy.solutionIntro).toContain(userName);
    });

    it('should have comfort message with validation', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Roberto'
      );

      expect(copy.comfort).toContain('não é');
      expect(copy.comfort).toContain('Você não está sozinho');
    });

    it('should have hope message with possibility', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.hope).toContain('pode mudar');
      expect(copy.hope).toContain('caminho');
    });
  });

  describe('Perfil: Overwhelmed (Sobrecarregado)', () => {
    it('should generate overwhelmed-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está sobrecarregado espiritualmente',
        'Você está vivendo uma fase de sobrecarga espiritual',
        mockChallenges,
        'João'
      );

      expect(copy.opening).toContain('cansado');
      expect(copy.identification).toContain('tenta');
      expect(copy.identification).toContain('cansativo');
      expect(copy.ctaPrimary).toContain('descansar');
    });

    it('should include rest-related benefits for overwhelmed', () => {
      const copy = generateIntimatePageCopy(
        'você está sobrecarregado',
        'Você está vivendo uma fase de sobrecarga',
        mockChallenges,
        'João'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('paz');
    });
  });

  describe('Perfil: Distant (Distante)', () => {
    it('should generate distant-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está distante de Deus',
        'Você está vivendo uma fase de distância espiritual',
        mockChallenges,
        'Maria'
      );

      expect(copy.opening).toContain('distância');
      expect(copy.identification).toContain('parede');
      expect(copy.ctaPrimary).toContain('voltar');
    });

    it('should include connection-related benefits for distant', () => {
      const copy = generateIntimatePageCopy(
        'você está distante',
        'Você está em distância',
        mockChallenges,
        'Maria'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('perto');
    });
  });

  describe('Perfil: Confused (Confuso)', () => {
    it('should generate confused-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso espiritualmente',
        'Você está vivendo uma fase de confusão espiritual',
        mockChallenges,
        'Pedro'
      );

      expect(copy.opening).toContain('caminho');
      expect(copy.identification).toContain('confusão');
      expect(copy.ctaPrimary).toContain('clareza');
    });

    it('should include clarity-related benefits for confused', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Pedro'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('clareza');
    });
  });

  describe('Perfil: Weak (Fraco)', () => {
    it('should generate weak-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está fraco espiritualmente',
        'Você está vivendo uma fase de fraqueza espiritual',
        mockChallenges,
        'Ana'
      );

      expect(copy.opening).toContain('força');
      expect(copy.identification).toContain('fraco');
      expect(copy.ctaPrimary).toContain('força');
    });

    it('should include strength-related benefits for weak', () => {
      const copy = generateIntimatePageCopy(
        'você está fraco',
        'Você está em fraqueza',
        mockChallenges,
        'Ana'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('força');
    });
  });

  describe('Perfil: Lost (Perdido)', () => {
    it('should generate lost-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está perdido espiritualmente',
        'Você está vivendo uma fase de perdição espiritual',
        mockChallenges,
        'Carlos'
      );

      expect(copy.opening).toContain('perdido');
      expect(copy.identification).toContain('perdido');
      expect(copy.ctaPrimary).toContain('caminho');
    });

    it('should include direction-related benefits for lost', () => {
      const copy = generateIntimatePageCopy(
        'você está perdido',
        'Você está em perdição',
        mockChallenges,
        'Carlos'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('caminho');
    });
  });

  describe('Perfil: Dry (Seco)', () => {
    it('should generate dry-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está seco espiritualmente',
        'Você está vivendo uma fase de secura espiritual',
        mockChallenges,
        'Lucia'
      );

      expect(copy.opening).toContain('vazio');
      expect(copy.identification).toContain('vazio');
      expect(copy.ctaPrimary).toContain('água viva');
    });

    it('should include life-related benefits for dry', () => {
      const copy = generateIntimatePageCopy(
        'você está seco',
        'Você está em secura',
        mockChallenges,
        'Lucia'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('água');
    });
  });

  describe('Perfil: General (Geral)', () => {
    it('should generate general-specific copy', () => {
      const copy = generateIntimatePageCopy(
        'você está em uma fase desconhecida',
        'Você está vivendo uma fase desconhecida',
        mockChallenges,
        'Roberto'
      );

      expect(copy.opening).toContain('espírito');
      expect(copy.identification).toContain('faltando');
      expect(copy.ctaPrimary).toContain('começar');
    });
  });

  describe('Emotional Connection Elements', () => {
    it('should use ellipsis for emotional pauses', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.opening).toContain('…');
      expect(copy.comfort).toContain('…');
    });

    it('should use conversational language patterns', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.opening).toMatch(/você|Você/);
      expect(copy.identification).toMatch(/você|Você/);
    });

    it('should validate emotional progression', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      // Opening → Identification → Revelation → Pain → Comfort → Hope
      const order = [
        copy.opening,
        copy.identification,
        copy.revelation,
        copy.painReality,
        copy.comfort,
        copy.hope,
      ];

      order.forEach((text) => {
        expect(text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Price and CTA Messages', () => {
    it('should have humble price message', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.priceMessage).toContain('café');
      expect(copy.priceMessage).toContain('mudar');
    });

    it('should have action-oriented CTA', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.ctaPrimary).toMatch(/Quero|quero/);
    });

    it('should have closing thought with affirmation', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.closingThought).toContain('merece');
    });
  });

  describe('Urgency Message', () => {
    it('should have gentle urgency without aggression', () => {
      const copy = generateIntimatePageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.urgency).toContain('Talvez');
      expect(copy.urgency).toContain('não ignore');
    });
  });
});
