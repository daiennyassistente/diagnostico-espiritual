import { describe, it, expect } from 'vitest';
import { createLead, createQuizResponse, getLeadById, getQuizResponseByLeadId } from './db';

describe('Quiz Complete Flow with New Columns', () => {
  it('should create a lead with name field', async () => {
    const result = await createLead({
      name: 'João Silva',
      whatsapp: '11987654321',
      email: `quiz-flow-name-${Date.now()}@example.com`,
    });

    expect(result).toHaveProperty('id');
    expect(result.id).toBeGreaterThan(0);

    // Verify the lead was created with the name
    const lead = await getLeadById(result.id);
    expect(lead).toBeDefined();
    expect(lead?.name).toBe('João Silva');
    expect(lead?.whatsapp).toBe('11987654321');
    expect(lead?.email).toContain('quiz-flow-name-');
  });

  it('should create quiz responses with step11 and step12', async () => {
    const leadResult = await createLead({
      name: 'Maria Santos',
      whatsapp: '11987654322',
      email: `quiz-flow-steps-${Date.now()}@example.com`,
    });

    const quizResult = await createQuizResponse({
      leadId: leadResult.id,
      step1: 'Opção A',
      step2: 'Opção B',
      step3: 'Opção C',
      step4: 'Opção A',
      step5: 'Opção B',
      step6: 'Opção C',
      step7: 'Opção A',
      step8: 'Opção B',
      step9: 'Opção C',
      step10: 'Opção A',
      step11: 'Sinto-me perdido',
      step12: 'Gostaria de encontrar paz em Deus',
    });

    expect(quizResult).toHaveProperty('id');
    expect(quizResult.id).toBeGreaterThan(0);

    // Verify the quiz response was created with step11 and step12
    const response = await getQuizResponseByLeadId(leadResult.id);
    expect(response).toBeDefined();
    expect(response?.step11).toBe('Sinto-me perdido');
    expect(response?.step12).toBe('Gostaria de encontrar paz em Deus');
  });

  it('should handle complete quiz flow with all 12 steps', async () => {
    const leadResult = await createLead({
      name: 'Pedro Oliveira',
      whatsapp: '11987654323',
      email: `quiz-flow-complete-${Date.now()}@example.com`,
    });

    const quizResult = await createQuizResponse({
      leadId: leadResult.id,
      step1: 'Resposta 1',
      step2: 'Resposta 2',
      step3: 'Resposta 3',
      step4: 'Resposta 4',
      step5: 'Resposta 5',
      step6: 'Resposta 6',
      step7: 'Resposta 7',
      step8: 'Resposta 8',
      step9: 'Resposta 9',
      step10: 'Resposta 10',
      step11: 'Hoje me sinto esperançoso',
      step12: 'Quero crescer espiritualmente',
    });

    expect(quizResult.id).toBeGreaterThan(0);

    // Verify all data was persisted
    const lead = await getLeadById(leadResult.id);
    const response = await getQuizResponseByLeadId(leadResult.id);

    expect(lead?.name).toBe('Pedro Oliveira');
    expect(response?.step11).toBe('Hoje me sinto esperançoso');
    expect(response?.step12).toBe('Quero crescer espiritualmente');
  });

  it('should handle quiz responses with empty step11 and step12', async () => {
    const leadResult = await createLead({
      name: 'Ana Costa',
      whatsapp: '11987654324',
      email: `quiz-flow-empty-${Date.now()}@example.com`,
    });

    const quizResult = await createQuizResponse({
      leadId: leadResult.id,
      step1: 'Opção A',
      step2: 'Opção B',
      step3: 'Opção C',
      step4: 'Opção A',
      step5: 'Opção B',
      step6: 'Opção C',
      step7: 'Opção A',
      step8: 'Opção B',
      step9: 'Opção C',
      step10: 'Opção A',
      step11: undefined,
      step12: undefined,
    });

    expect(quizResult.id).toBeGreaterThan(0);

    const response = await getQuizResponseByLeadId(leadResult.id);
    expect(response?.step11).toBeNull();
    expect(response?.step12).toBeNull();
  });
});
