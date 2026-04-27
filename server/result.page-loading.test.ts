import { describe, expect, it } from 'vitest';
import { extractBackendResponses, shouldPreserveLocalQuizState } from '../client/src/pages/Result';

describe('Result page loading safeguards', () => {
  it('preserva o estado local do quiz quando o usuário acabou de ser redirecionado com leadId na URL', () => {
    expect(shouldPreserveLocalQuizState(true, true)).toBe(true);
    expect(shouldPreserveLocalQuizState(true, false)).toBe(false);
    expect(shouldPreserveLocalQuizState(false, true)).toBe(false);
  });

  it('extrai apenas respostas válidas do quiz vindas do backend', () => {
    expect(
      extractBackendResponses({
        id: 10,
        leadId: 20,
        step1: 'Maria',
        step2: 'Cansada espiritualmente',
        step3: '',
        createdAt: new Date(),
      }),
    ).toEqual({
      step1: 'Maria',
      step2: 'Cansada espiritualmente',
    });
  });

  it('retorna nulo quando o backend não trouxe nenhuma resposta utilizável', () => {
    expect(extractBackendResponses({ id: 1, leadId: 2, createdAt: new Date() })).toBeNull();
    expect(extractBackendResponses(null)).toBeNull();
  });
});
