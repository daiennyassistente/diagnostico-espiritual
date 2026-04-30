// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useMetaQuizEvents } from './useMetaQuizEvents';

const mutateMock = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    quiz: {
      sendMetaEvent: {
        useMutation: () => ({
          mutate: mutateMock,
        }),
      },
    },
  },
}));

type HookProps = {
  hasStarted: boolean;
  isQuizComplete: boolean;
  leadId: number;
  leadData: {
    name: string;
    whatsapp: string;
    email: string;
  };
};

function HookHarness(props: HookProps) {
  useMetaQuizEvents(props);
  return null;
}

describe('useMetaQuizEvents', () => {
  let container: HTMLDivElement;
  let root: Root;

  const leadData = {
    name: 'João',
    whatsapp: '11999999999',
    email: 'joao@example.com',
  };

  const renderHarness = async (props: HookProps) => {
    await act(async () => {
      root.render(React.createElement(HookHarness, props));
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }
    if (container) {
      container.remove();
    }
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('dispara QuizStarted apenas quando hasStarted vira true', async () => {
    await renderHarness({ hasStarted: false, isQuizComplete: false, leadId: 0, leadData });
    expect(mutateMock).not.toHaveBeenCalled();

    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 0, leadData });

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenNthCalledWith(1, {
      eventName: 'QuizStarted',
      leadId: 0,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      sourceUrl: window.location.href,
    });
  });

  it('dispara QuizCompleted somente quando o quiz está completo e já existe leadId real', async () => {
    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 0, leadData });
    expect(mutateMock).toHaveBeenCalledTimes(1);

    await renderHarness({ hasStarted: true, isQuizComplete: true, leadId: 0, leadData });
    expect(mutateMock).toHaveBeenCalledTimes(1);

    await renderHarness({ hasStarted: true, isQuizComplete: true, leadId: 321, leadData });
    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenLastCalledWith({
      eventName: 'QuizCompleted',
      leadId: 321,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      sourceUrl: window.location.href,
    });
  });

  it('dispara QuizAbandoned por inatividade com o leadId disponível', async () => {
    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 456, leadData });
    expect(mutateMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenLastCalledWith({
      eventName: 'QuizAbandoned',
      leadId: 456,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      reason: 'inactivity',
      sourceUrl: window.location.href,
    });
  });

  it('não dispara QuizAbandoned por inatividade depois que o quiz foi concluído', async () => {
    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 789, leadData });
    await renderHarness({ hasStarted: true, isQuizComplete: true, leadId: 789, leadData });

    expect(mutateMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(mutateMock).toHaveBeenCalledTimes(2);
  });

  it('dispara QuizAbandoned em beforeunload', async () => {
    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 654, leadData });

    await act(async () => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenLastCalledWith({
      eventName: 'QuizAbandoned',
      leadId: 654,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      reason: 'page_unload',
      sourceUrl: window.location.href,
    });
  });

  it('dispara QuizAbandoned em visibilitychange quando a página fica oculta', async () => {
    await renderHarness({ hasStarted: true, isQuizComplete: false, leadId: 987, leadData });

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenLastCalledWith({
      eventName: 'QuizAbandoned',
      leadId: 987,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      reason: 'visibility_hidden',
      sourceUrl: window.location.href,
    });
  });
});
