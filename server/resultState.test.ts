import { describe, expect, it } from 'vitest';
import { readStoredQuizState, resolveLeadIdFromSources } from '../client/src/lib/resultState';

describe('resolveLeadIdFromSources', () => {
  it('prioriza o leadId da URL quando ele existe', () => {
    expect(resolveLeadIdFromSources('?leadId=1230002', '999')).toBe(1230002);
  });

  it('usa o leadId salvo no storage quando a URL não possui parâmetro', () => {
    expect(resolveLeadIdFromSources('', '456')).toBe(456);
  });

  it('retorna null quando não existe leadId válido', () => {
    expect(resolveLeadIdFromSources('', null)).toBeNull();
    expect(resolveLeadIdFromSources('?leadId=abc', null)).toBeNull();
  });
});

describe('readStoredQuizState', () => {
  it('prioriza quizResponses do localStorage, que é onde o quiz persiste as respostas', () => {
    const state = readStoredQuizState({
      sessionUserName: null,
      localUserName: 'Maria',
      localResponses: JSON.stringify({ 0: 'Maria', 1: 'Cansaço espiritual' }),
      sessionResponses: JSON.stringify({ 0: 'Nome antigo' }),
    });

    expect(state.userName).toBe('Maria');
    expect(state.responses).toEqual({ 0: 'Maria', 1: 'Cansaço espiritual' });
  });

  it('usa o nome da primeira resposta quando não existe userName persistido', () => {
    const state = readStoredQuizState({
      sessionUserName: null,
      localUserName: null,
      localResponses: JSON.stringify({ 0: 'João', 1: 'Sensação de distância' }),
      sessionResponses: null,
    });

    expect(state.userName).toBe('João');
    expect(state.responses).toEqual({ 0: 'João', 1: 'Sensação de distância' });
  });

  it('retorna responses nulo quando nenhum storage possui respostas', () => {
    const state = readStoredQuizState({
      sessionUserName: 'Ana',
      localUserName: null,
      localResponses: null,
      sessionResponses: null,
    });

    expect(state.userName).toBe('Ana');
    expect(state.responses).toBeNull();
  });
});
