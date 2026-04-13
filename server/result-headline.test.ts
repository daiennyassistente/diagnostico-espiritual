import { describe, expect, it } from 'vitest';
import { buildResultHeadline } from '../client/src/lib/resultHeadline';

describe('buildResultHeadline', () => {
  it('should use the personalized title when available', () => {
    const headline = buildResultHeadline({
      profileName: 'Você está espiritualmente sobrecarregada',
      personalizedTitle: 'Daienny, sua vida espiritual está pedindo descanso e direção.',
    });

    expect(headline).toBe('Daienny, sua vida espiritual está pedindo descanso e direção');
  });

  it('should fallback to the profile name when personalized title is empty', () => {
    const headline = buildResultHeadline({
      profileName: 'Você está em uma fase de confusão espiritual',
      personalizedTitle: '   ',
    });

    expect(headline).toBe('Sua situação espiritual hoje revela: Você está em uma fase de confusão espiritual');
  });
});
