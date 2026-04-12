import { describe, it, expect } from 'vitest';
import { createLead, createQuizResponse, getLeadById, getQuizResponseByLeadId } from './db';

describe('Quiz Integration Tests', () => {
  it('should create a lead and return a valid ID', async () => {
    const result = await createLead({
      whatsapp: '11987654321',
      email: 'integration-test-1@example.com',
    });

    expect(result).toHaveProperty('id');
    expect(result.id).toBeGreaterThan(0);
  });

  it('should retrieve the created lead by ID', async () => {
    const leadResult = await createLead({
      whatsapp: '11987654321',
      email: `integration-test-retrieve-${Date.now()}@example.com`,
    });

    const lead = await getLeadById(leadResult.id);
    expect(lead).toBeDefined();
    expect(lead?.id).toBe(leadResult.id);
    expect(lead?.whatsapp).toBe('11987654321');
  });

  it('should handle multiple leads with different emails correctly', async () => {
    const result1 = await createLead({
      whatsapp: '11987654321',
      email: `integration-test-multi-1-${Date.now()}@example.com`,
    });

    const result2 = await createLead({
      whatsapp: '11987654322',
      email: `integration-test-multi-2-${Date.now()}@example.com`,
    });

    expect(result1.id).toBeGreaterThan(0);
    expect(result2.id).toBeGreaterThan(0);
    expect(result2.id).not.toBe(result1.id);
  });

  it('should create and retrieve quiz responses', async () => {
    const leadResult = await createLead({
      whatsapp: '11987654321',
      email: `integration-test-response-${Date.now()}@example.com`,
    });

    const result = await createQuizResponse({
      leadId: leadResult.id,
      step1: 'Próxima de Deus, mas inconstante',
      step2: 'Falta de disciplina',
      step3: 'Leitura ocasional',
      step4: 'Superficial',
      step5: 'Profundidade',
      step6: 'Transformação interior',
      step7: 'Maior intimidade com Deus',
      step8: '30 minutos',
      step9: 'Emocional',
      step10: 'Em transição',
    });

    expect(result).toBeDefined();

    const response = await getQuizResponseByLeadId(leadResult.id);
    expect(response).toBeDefined();
    expect(response?.leadId).toBe(leadResult.id);
    expect(response?.step1).toBe('Próxima de Deus, mas inconstante');
  });

  it('should create different responses for different leads', async () => {
    const lead1Result = await createLead({
      whatsapp: '11987654321',
      email: `integration-test-diff-1-${Date.now()}@example.com`,
    });

    const lead2Result = await createLead({
      whatsapp: '11987654322',
      email: `integration-test-diff-2-${Date.now()}@example.com`,
    });

    await createQuizResponse({
      leadId: lead1Result.id,
      step1: 'Próxima de Deus, mas inconstante',
      step2: 'Falta de disciplina',
      step3: 'Leitura ocasional',
      step4: 'Superficial',
      step5: 'Profundidade',
      step6: 'Transformação interior',
      step7: 'Maior intimidade com Deus',
      step8: '30 minutos',
      step9: 'Emocional',
      step10: 'Em transição',
    });

    await createQuizResponse({
      leadId: lead2Result.id,
      step1: 'Distante e querendo voltar',
      step2: 'Falta de foco',
      step3: 'Não lê a Palavra',
      step4: 'Inexistente',
      step5: 'Direção',
      step6: 'Reorientação',
      step7: 'Recomeçar do zero',
      step8: '10 minutos',
      step9: 'De profundidade',
      step10: 'Perdida',
    });

    const response1 = await getQuizResponseByLeadId(lead1Result.id);
    const response2 = await getQuizResponseByLeadId(lead2Result.id);

    expect(response1?.step1).toBe('Próxima de Deus, mas inconstante');
    expect(response2?.step1).toBe('Distante e querendo voltar');
    expect(response1?.leadId).not.toBe(response2?.leadId);
  });
});
