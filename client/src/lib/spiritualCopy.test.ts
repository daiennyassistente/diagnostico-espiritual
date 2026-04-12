import { describe, it, expect } from 'vitest';
import { generateSpiritualPageCopy } from './spiritualCopy';

describe('generateSpiritualPageCopy - Verdade Bíblica + Graça + Esperança', () => {
  const mockChallenges = [
    'Falta de disciplina que impede a constância na Palavra e oração',
    'Sensação de ausência de direção espiritual clara',
    'Dificuldade para manter a sensibilidade espiritual ativa',
  ];

  describe('Estrutura Básica', () => {
    it('should generate all required fields', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'João'
      );

      expect(copy).toHaveProperty('opening');
      expect(copy).toHaveProperty('identification');
      expect(copy).toHaveProperty('revelation');
      expect(copy).toHaveProperty('truthWithLove');
      expect(copy).toHaveProperty('biblicalTruth');
      expect(copy).toHaveProperty('hope');
      expect(copy).toHaveProperty('solutionIntro');
      expect(copy).toHaveProperty('benefits');
      expect(copy).toHaveProperty('internalCall');
      expect(copy).toHaveProperty('ctaPrimary');
      expect(copy).toHaveProperty('priceMessage');
      expect(copy).toHaveProperty('closingReflection');
    });

    it('should have non-empty strings for all text fields', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Maria'
      );

      expect(copy.opening.length).toBeGreaterThan(0);
      expect(copy.identification.length).toBeGreaterThan(0);
      expect(copy.revelation.length).toBeGreaterThan(0);
      expect(copy.truthWithLove.length).toBeGreaterThan(0);
      expect(copy.biblicalTruth.length).toBeGreaterThan(0);
      expect(copy.hope.length).toBeGreaterThan(0);
      expect(copy.solutionIntro.length).toBeGreaterThan(0);
      expect(copy.internalCall.length).toBeGreaterThan(0);
      expect(copy.ctaPrimary.length).toBeGreaterThan(0);
      expect(copy.priceMessage.length).toBeGreaterThan(0);
      expect(copy.closingReflection.length).toBeGreaterThan(0);
    });

    it('should generate exactly 5 benefits', () => {
      const copy = generateSpiritualPageCopy(
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

  describe('Tom Sincero e Verdadeiro', () => {
    it('should start with sincere opening phrase', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Ana'
      );

      expect(copy.opening).toContain('preciso ser sincero');
      expect(copy.opening).toContain('merece sua atenção');
    });

    it('should include user name in opening', () => {
      const userName = 'Carlos';
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        userName
      );

      expect(copy.opening).toContain(userName);
    });

    it('should include user name in solution intro', () => {
      const userName = 'Lucia';
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        userName
      );

      expect(copy.solutionIntro).toContain(userName);
    });

    it('should have confronto com amor (truthWithLove)', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Roberto'
      );

      expect(copy.truthWithLove).toContain('Talvez');
      expect(copy.truthWithLove.length).toBeGreaterThan(50);
    });

    it('should have hope message with possibility', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.hope).toContain('pode mudar');
      expect(copy.hope).toContain('Deus');
    });
  });

  describe('Perfil: Overwhelmed (Sobrecarregado)', () => {
    it('should generate overwhelmed-specific copy', () => {
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
        'você está sobrecarregado',
        'Você está vivendo uma fase de sobrecarga',
        mockChallenges,
        'João'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('descansar');
    });
  });

  describe('Perfil: Distant (Distante)', () => {
    it('should generate distant-specific copy', () => {
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
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
      const copy = generateSpiritualPageCopy(
        'você está seco',
        'Você está em secura',
        mockChallenges,
        'Lucia'
      );

      const benefitsText = copy.benefits.join(' ').toLowerCase();
      expect(benefitsText).toContain('água');
    });
  });

  describe('Verdade Bíblica Sutil', () => {
    it('should include biblical truth without aggressive preaching', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.biblicalTruth).toContain('Bíblia');
      expect(copy.biblicalTruth).toContain('Deus');
      expect(copy.biblicalTruth).length > 0;
    });

    it('should have confronto com amor (not accusation)', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.truthWithLove).toContain('Talvez');
      expect(copy.truthWithLove).not.toContain('você é fraco');
      expect(copy.truthWithLove).not.toContain('você falhou');
    });
  });

  describe('Chamado Interno (Não Pressão de Venda)', () => {
    it('should have internal call without aggressive pressure', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.internalCall).toContain('Talvez');
      expect(copy.internalCall).toContain('não ignore');
      expect(copy.internalCall).toContain('chamado');
    });
  });

  describe('CTA e Preço', () => {
    it('should have action-oriented CTA', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.ctaPrimary).toMatch(/Quero|quero/);
      expect(copy.ctaPrimary).toContain('Deus');
    });

    it('should have humble price message', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.priceMessage).toContain('café');
      expect(copy.priceMessage).toContain('mudar');
    });

    it('should have closing reflection with affirmation', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      expect(copy.closingReflection).toContain('merece');
      expect(copy.closingReflection).toContain('Deus');
    });
  });

  describe('Progressão Emocional', () => {
    it('should follow emotional progression: Opening → Identification → Revelation → Truth → Hope', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      const progression = [
        copy.opening,
        copy.identification,
        copy.revelation,
        copy.truthWithLove,
        copy.biblicalTruth,
        copy.hope,
      ];

      progression.forEach((text) => {
        expect(text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Linguagem Cristã Evangélica', () => {
    it('should use appropriate Christian language', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      const allText = Object.values(copy).join(' ').toLowerCase();
      expect(allText).toContain('deus');
      expect(allText).toContain('fé');
    });

    it('should not use manipulative language', () => {
      const copy = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Test'
      );

      const allText = Object.values(copy).join(' ');
      expect(allText).not.toContain('você DEVE');
      expect(allText).not.toContain('agora ou nunca');
    });
  });

  describe('Personalization', () => {
    it('should personalize for different users', () => {
      const copy1 = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'João'
      );

      const copy2 = generateSpiritualPageCopy(
        'você está confuso',
        'Você está em confusão',
        mockChallenges,
        'Maria'
      );

      expect(copy1.opening).toContain('João');
      expect(copy2.opening).toContain('Maria');
      expect(copy1.solutionIntro).toContain('João');
      expect(copy2.solutionIntro).toContain('Maria');
    });
  });
});
