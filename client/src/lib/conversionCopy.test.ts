import { describe, it, expect } from 'vitest';
import { generateConversionCopy } from './conversionCopy';

describe('generateConversionCopy', () => {
  const mockChallenges = [
    'Falta de disciplina que impede a constância na Palavra e oração',
    'Sensação de ausência de direção espiritual clara',
    'Dificuldade para manter a sensibilidade espiritual ativa',
  ];

  it('should generate copy for overwhelmed profile', () => {
    const copy = generateConversionCopy(
      'você está sobrecarregado espiritualmente',
      'Você está vivendo uma fase de sobrecarga espiritual',
      mockChallenges,
      'João'
    );

    expect(copy.headline).toContain('cansado');
    expect(copy.identification).toContain('João');
    expect(copy.identification).toContain('cansaço');
    expect(copy.painEscalation).toContain('sobrecarga');
    expect(copy.ctaPrimary).toContain('descansar');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate copy for distant profile', () => {
    const copy = generateConversionCopy(
      'você está distante de Deus',
      'Você está vivendo uma fase de distância espiritual',
      mockChallenges,
      'Maria'
    );

    expect(copy.headline).toContain('Deus está em silêncio');
    expect(copy.identification).toContain('Maria');
    expect(copy.identification).toContain('distância');
    expect(copy.ctaPrimary).toContain('voltar');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate copy for confused profile', () => {
    const copy = generateConversionCopy(
      'você está confuso espiritualmente',
      'Você está vivendo uma fase de confusão espiritual',
      mockChallenges,
      'Pedro'
    );

    expect(copy.headline).toContain('caminho');
    expect(copy.identification).toContain('Pedro');
    expect(copy.identification).toContain('confusão');
    expect(copy.ctaPrimary).toContain('clareza');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate copy for weak profile', () => {
    const copy = generateConversionCopy(
      'você está fraco espiritualmente',
      'Você está vivendo uma fase de fraqueza espiritual',
      mockChallenges,
      'Ana'
    );

    expect(copy.headline).toContain('força');
    expect(copy.identification).toContain('Ana');
    expect(copy.identification).toContain('fraqueza');
    expect(copy.ctaPrimary).toContain('força');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate copy for lost profile', () => {
    const copy = generateConversionCopy(
      'você está perdido espiritualmente',
      'Você está vivendo uma fase de perdição espiritual',
      mockChallenges,
      'Carlos'
    );

    expect(copy.headline).toContain('perdido');
    expect(copy.identification).toContain('Carlos');
    expect(copy.identification).toContain('perdido');
    expect(copy.ctaPrimary).toContain('caminho');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate copy for dry profile', () => {
    const copy = generateConversionCopy(
      'você está seco espiritualmente',
      'Você está vivendo uma fase de secura espiritual',
      mockChallenges,
      'Lucia'
    );

    expect(copy.headline).toContain('seco');
    expect(copy.identification).toContain('Lucia');
    expect(copy.identification).toContain('vazio');
    expect(copy.ctaPrimary).toContain('água viva');
    expect(copy.benefits.length).toBe(5);
  });

  it('should generate general copy for unknown profile', () => {
    const copy = generateConversionCopy(
      'você está em uma fase desconhecida',
      'Você está vivendo uma fase desconhecida',
      mockChallenges,
      'Roberto'
    );

    expect(copy.headline).toContain('espírito');
    expect(copy.identification).toContain('Roberto');
    expect(copy.ctaPrimary).toContain('reconectar');
    expect(copy.benefits.length).toBe(5);
  });

  it('should include all required fields in copy object', () => {
    const copy = generateConversionCopy(
      'você está confuso',
      'Você está em confusão',
      mockChallenges,
      'Test User'
    );

    expect(copy).toHaveProperty('headline');
    expect(copy).toHaveProperty('identification');
    expect(copy).toHaveProperty('painEscalation');
    expect(copy).toHaveProperty('hope');
    expect(copy).toHaveProperty('productTitle');
    expect(copy).toHaveProperty('productDescription');
    expect(copy).toHaveProperty('benefits');
    expect(copy).toHaveProperty('socialProof');
    expect(copy).toHaveProperty('urgencyMessage');
    expect(copy).toHaveProperty('ctaPrimary');
    expect(copy).toHaveProperty('ctaSecondary');
    expect(copy).toHaveProperty('closingStatement');
  });

  it('should include user name in identification message', () => {
    const userName = 'TestUser123';
    const copy = generateConversionCopy(
      'você está confuso',
      'Você está em confusão',
      mockChallenges,
      userName
    );

    expect(copy.identification).toContain(userName);
  });

  it('should have non-empty strings for all text fields', () => {
    const copy = generateConversionCopy(
      'você está confuso',
      'Você está em confusão',
      mockChallenges,
      'User'
    );

    expect(copy.headline.length).toBeGreaterThan(0);
    expect(copy.identification.length).toBeGreaterThan(0);
    expect(copy.painEscalation.length).toBeGreaterThan(0);
    expect(copy.hope.length).toBeGreaterThan(0);
    expect(copy.productTitle.length).toBeGreaterThan(0);
    expect(copy.productDescription.length).toBeGreaterThan(0);
    expect(copy.socialProof.length).toBeGreaterThan(0);
    expect(copy.urgencyMessage.length).toBeGreaterThan(0);
    expect(copy.ctaPrimary.length).toBeGreaterThan(0);
    expect(copy.closingStatement.length).toBeGreaterThan(0);
  });

  it('should generate benefits array with 5 items', () => {
    const copy = generateConversionCopy(
      'você está confuso',
      'Você está em confusão',
      mockChallenges,
      'User'
    );

    expect(Array.isArray(copy.benefits)).toBe(true);
    expect(copy.benefits.length).toBe(5);
    copy.benefits.forEach((benefit) => {
      expect(typeof benefit).toBe('string');
      expect(benefit.length).toBeGreaterThan(0);
    });
  });
});
