import { describe, expect, it } from 'vitest';
import { generateSpiritualPageCopy } from '../client/src/lib/spiritualCopy';

const mockChallenges = [
  'Falta de disciplina que impede a constância na Palavra e oração',
  'Sensação de ausência de direção espiritual clara',
  'Dificuldade para manter a sensibilidade espiritual ativa',
];

describe('Result page copy contract', () => {
  it('should provide every field consumed by Result.tsx as a defined string or array', () => {
    const copy = generateSpiritualPageCopy(
      'você está confuso',
      'Você está em confusão',
      mockChallenges,
      'João'
    );

    expect(typeof copy.hope).toBe('string');
    expect(typeof copy.solutionIntro).toBe('string');
    expect(Array.isArray(copy.benefits)).toBe(true);
    expect(typeof copy.internalCall).toBe('string');
    expect(typeof copy.ctaPrimary).toBe('string');
    expect(typeof copy.priceMessage).toBe('string');
    expect(typeof copy.closingReflection).toBe('string');

    expect(copy.hope.split('\n\n').length).toBeGreaterThan(0);
    expect(copy.solutionIntro.split('\n\n').length).toBeGreaterThan(0);
    expect(copy.closingReflection.split('\n\n').length).toBeGreaterThan(0);
    expect(copy.benefits.length).toBeGreaterThan(0);
  });
});
