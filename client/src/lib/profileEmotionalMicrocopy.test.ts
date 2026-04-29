import { describe, it, expect } from 'vitest';
import { generateProfileEmotionalMicrocopy, extractMicrocopyData } from './profileEmotionalMicrocopy';

describe('generateProfileEmotionalMicrocopy', () => {
  it('should generate microcopy for tired profile with peace missing', () => {
    const params = {
      profileName: 'espiritualmente cansado(a)',
      currentState: 'Próxima de Deus',
      mainDifficulty: 'Distrações',
      missingWithGod: 'paz',
      desireWithGod: 'força',
      spiritualSelfDescription: 'cansada',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('cansaço');
    expect(result).toContain('paz');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should generate microcopy for tired profile with emotional difficulty', () => {
    const params = {
      profileName: 'espiritualmente cansado(a)',
      currentState: 'Distante e querendo voltar',
      mainDifficulty: 'Confusão emocional',
      missingWithGod: 'direção',
      desireWithGod: 'paz',
      spiritualSelfDescription: 'cansada',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('peso emocional');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should generate microcopy for blocked profile', () => {
    const params = {
      profileName: 'espiritualmente travado(a)',
      currentState: 'Com sede, mas sem direção',
      mainDifficulty: 'Falta de direção',
      missingWithGod: 'clareza',
      desireWithGod: 'liberdade',
      spiritualSelfDescription: 'travada',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('travado');
    expect(result).toContain('liberdade');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should generate microcopy for fresh start profile', () => {
    const params = {
      profileName: 'espiritualmente em recomeço',
      currentState: 'Em processo de recomeço',
      mainDifficulty: 'Inconsistência',
      missingWithGod: 'intimidade',
      desireWithGod: 'reconstruir',
      spiritualSelfDescription: 'em recomeço',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('recomeço');
    expect(result).toContain('intimidade');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should generate microcopy for maturing profile', () => {
    const params = {
      profileName: 'espiritualmente amadurecendo',
      currentState: 'Próxima de Deus',
      mainDifficulty: 'Nenhuma',
      missingWithGod: 'sabedoria',
      desireWithGod: 'profundidade',
      spiritualSelfDescription: 'amadurecendo',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('amadurecimento');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should generate fallback microcopy for unknown profile', () => {
    const params = {
      profileName: 'espiritualmente desconhecido',
      currentState: 'Confuso',
      mainDifficulty: 'Tudo',
      missingWithGod: 'tudo',
      desireWithGod: 'tudo',
      spiritualSelfDescription: 'perdido',
      additionalContext: '',
    };

    const result = generateProfileEmotionalMicrocopy(params);
    
    expect(result).toContain('sinceridade');
    expect(result.split('\n').length).toBeLessThanOrEqual(3);
  });

  it('should respect 3-line maximum constraint', () => {
    const profiles = [
      {
        profileName: 'espiritualmente cansado(a)',
        currentState: 'Cansada',
        mainDifficulty: 'Emocional',
        missingWithGod: 'paz',
        desireWithGod: 'força',
        spiritualSelfDescription: 'cansada',
        additionalContext: '',
      },
      {
        profileName: 'espiritualmente travado(a)',
        currentState: 'Travada',
        mainDifficulty: 'Direção',
        missingWithGod: 'clareza',
        desireWithGod: 'liberdade',
        spiritualSelfDescription: 'travada',
        additionalContext: '',
      },
      {
        profileName: 'espiritualmente amadurecendo',
        currentState: 'Amadurecendo',
        mainDifficulty: 'Nada',
        missingWithGod: 'sabedoria',
        desireWithGod: 'profundidade',
        spiritualSelfDescription: 'amadurecendo',
        additionalContext: '',
      },
    ];

    profiles.forEach((profile) => {
      const result = generateProfileEmotionalMicrocopy(profile);
      const lineCount = result.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(3);
    });
  });
});

describe('extractMicrocopyData', () => {
  it('should extract microcopy data from responses', () => {
    const responses = {
      step2: 'Próxima de Deus',
      step3: 'Distrações',
      step6: 'paz',
      step8: 'força',
      step11: 'cansada',
      step12: 'Estou muito cansada',
    };

    const result = extractMicrocopyData(responses, 'espiritualmente cansado(a)');

    expect(result).not.toBeNull();
    expect(result?.profileName).toBe('espiritualmente cansado(a)');
    expect(result?.currentState).toBe('Próxima de Deus');
    expect(result?.mainDifficulty).toBe('Distrações');
    expect(result?.missingWithGod).toBe('paz');
    expect(result?.desireWithGod).toBe('força');
    expect(result?.spiritualSelfDescription).toBe('cansada');
    expect(result?.additionalContext).toBe('Estou muito cansada');
  });

  it('should handle numeric keys as fallback', () => {
    const responses = {
      '1': 'Próxima de Deus',
      '2': 'Distrações',
      '5': 'paz',
      '7': 'força',
      '10': 'cansada',
      '11': 'Estou muito cansada',
    };

    const result = extractMicrocopyData(responses, 'espiritualmente cansado(a)');

    expect(result).not.toBeNull();
    expect(result?.currentState).toBe('Próxima de Deus');
    expect(result?.mainDifficulty).toBe('Distrações');
  });

  it('should return null for null responses', () => {
    const result = extractMicrocopyData(null, 'espiritualmente cansado(a)');
    expect(result).toBeNull();
  });

  it('should handle empty responses gracefully', () => {
    const responses = {};
    const result = extractMicrocopyData(responses, 'espiritualmente cansado(a)');

    expect(result).not.toBeNull();
    expect(result?.currentState).toBe('');
    expect(result?.mainDifficulty).toBe('');
  });
});
