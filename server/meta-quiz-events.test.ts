import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendQuizMetaEvent } from './meta-quiz-events';

// Mock do fetch
global.fetch = vi.fn();

describe('Meta Quiz Events - sendQuizMetaEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.META_CONVERSIONS_API_TOKEN = 'test_token';
    process.env.VITE_ANALYTICS_WEBSITE_ID = 'test_pixel_id';
  });

  it('deve enviar evento QuizStarted com nome exato', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizStarted',
      123,
      'test@example.com',
      '11999999999',
      'João',
      undefined,
      undefined,
      undefined,
      'João Silva',
      'https://example.com/quiz'
    );

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalled();

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    // Verificar que o event_name é exatamente "QuizStarted"
    expect(body.data[0].event_name).toBe('QuizStarted');
    expect(body.data[0].event_id).toBeDefined();
    expect(body.data[0].user_data.em).toBeDefined(); // Email hashed
    expect(body.data[0].user_data.ph).toBeDefined(); // Phone hashed
  });

  it('deve enviar evento QuizCompleted com nome exato', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizCompleted',
      123,
      'test@example.com',
      '11999999999',
      'João',
      10,
      10,
      undefined,
      'João Silva',
      'https://example.com/quiz'
    );

    expect(result.success).toBe(true);

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    // Verificar que o event_name é exatamente "QuizCompleted"
    expect(body.data[0].event_name).toBe('QuizCompleted');
    expect(body.data[0].custom_data.current_step).toBe(10);
    expect(body.data[0].custom_data.total_steps).toBe(10);
  });

  it('deve enviar evento QuizAbandoned com razão de inatividade', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizAbandoned',
      123,
      'test@example.com',
      '11999999999',
      'João',
      5,
      10,
      'inactivity',
      'João Silva',
      'https://example.com/quiz'
    );

    expect(result.success).toBe(true);

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    // Verificar que o event_name é exatamente "QuizAbandoned"
    expect(body.data[0].event_name).toBe('QuizAbandoned');
    expect(body.data[0].custom_data.reason).toBe('inactivity');
    expect(body.data[0].custom_data.current_step).toBe(5);
  });

  it('deve enviar evento QuizAbandoned com razão de page_unload', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizAbandoned',
      123,
      'test@example.com',
      '11999999999',
      'João',
      3,
      10,
      'page_unload',
      'João Silva',
      'https://example.com/quiz'
    );

    expect(result.success).toBe(true);

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    expect(body.data[0].event_name).toBe('QuizAbandoned');
    expect(body.data[0].custom_data.reason).toBe('page_unload');
  });

  it('deve enviar evento QuizAbandoned com razão de visibility_hidden', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizAbandoned',
      123,
      'test@example.com',
      '11999999999',
      'João',
      7,
      10,
      'visibility_hidden',
      'João Silva',
      'https://example.com/quiz'
    );

    expect(result.success).toBe(true);

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    expect(body.data[0].event_name).toBe('QuizAbandoned');
    expect(body.data[0].custom_data.reason).toBe('visibility_hidden');
  });

  it('deve retornar events_received: 1 na resposta', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    const result = await sendQuizMetaEvent(
      'QuizStarted',
      123,
      'test@example.com',
      '11999999999'
    );

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });

  it('deve falhar se token não está configurado', async () => {
    process.env.META_CONVERSIONS_API_TOKEN = '';

    const result = await sendQuizMetaEvent(
      'QuizStarted',
      123,
      'test@example.com',
      '11999999999'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Access token not configured');
  });

  it('deve falhar se Pixel ID não está configurado', async () => {
    process.env.VITE_ANALYTICS_WEBSITE_ID = '';

    const result = await sendQuizMetaEvent(
      'QuizStarted',
      123,
      'test@example.com',
      '11999999999'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Pixel ID not configured');
  });

  it('deve hashear email e phone corretamente', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events_received: 1 }),
    });

    await sendQuizMetaEvent(
      'QuizStarted',
      123,
      'Test@Example.COM',
      '11 99999-9999'
    );

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);

    // Email deve ser hasheado em lowercase
    expect(body.data[0].user_data.em).toBeDefined();
    // Phone deve ser hasheado sem caracteres especiais
    expect(body.data[0].user_data.ph).toBeDefined();
  });
});
