import { describe, it, expect } from 'vitest';
import { createLead, getLeadById } from './db';

describe('Quiz Email Repeat Test', () => {
  it('should return the correct leadId when creating leads with the same email', async () => {
    const email = `repeat-test-${Date.now()}@example.com`;
    
    // Create first lead
    const result1 = await createLead({
      whatsapp: '11987654321',
      email: email,
    });

    expect(result1.id).toBeGreaterThan(0);
    const firstLeadId = result1.id;

    // Verify first lead
    const lead1 = await getLeadById(firstLeadId);
    expect(lead1?.id).toBe(firstLeadId);
    expect(lead1?.email).toBe(email);

    // Create second lead with same email (different whatsapp)
    const result2 = await createLead({
      whatsapp: '11987654322',
      email: email,
    });

    expect(result2.id).toBeGreaterThan(0);
    const secondLeadId = result2.id;

    // Verify they are different IDs
    expect(secondLeadId).not.toBe(firstLeadId);

    // Verify second lead has correct data
    const lead2 = await getLeadById(secondLeadId);
    expect(lead2?.id).toBe(secondLeadId);
    expect(lead2?.email).toBe(email);
    expect(lead2?.whatsapp).toBe('11987654322');

    // Verify first lead still has original data
    const lead1Check = await getLeadById(firstLeadId);
    expect(lead1Check?.whatsapp).toBe('11987654321');
  });
});
