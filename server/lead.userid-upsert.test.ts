import { describe, expect, it } from 'vitest';
import { createLead, getLeadById, getLeadByUserId } from './db';

describe('Lead userId upsert', () => {
  it('should reuse the existing lead and update its data when the same userId submits the quiz again', async () => {
    const userId = `repeat-user-${Date.now()}`;

    const first = await createLead({
      userId,
      name: 'Primeiro Nome',
      whatsapp: '11999990001',
      email: `repeat-lead-${Date.now()}@example.com`,
    });

    const second = await createLead({
      userId,
      name: 'Nome Atualizado',
      whatsapp: '11999990002',
      email: `repeat-lead-updated-${Date.now()}@example.com`,
    });

    expect(second.id).toBe(first.id);

    const lead = await getLeadById(first.id);
    const sameLead = await getLeadByUserId(userId);

    expect(lead).toBeDefined();
    expect(sameLead).toBeDefined();
    expect(lead?.id).toBe(first.id);
    expect(lead?.name).toBe('Nome Atualizado');
    expect(lead?.whatsapp).toBe('11999990002');
    expect(lead?.email).toContain('repeat-lead-updated-');
    expect(sameLead?.id).toBe(first.id);
  });
});
