import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup jsdom environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window as any;
global.document = dom.window.document as any;

describe('Meta Pixel Quiz Tracking', () => {
  beforeEach(() => {
    // Reset window properties
    delete (window as any).quizStarted;
    delete (window as any).quizCompleted;
    delete (window as any).fbq;
    
    // Mock fbq function
    (window as any).fbq = vi.fn();
  });

  it('should initialize quiz tracking flags', () => {
    expect(typeof window.quizStarted).toBe('undefined');
    expect(typeof window.quizCompleted).toBe('undefined');
  });

  it('should track QuizStart event when quiz starts', () => {
    // Simulate quiz start
    if (typeof window !== 'undefined' && !window.quizStarted) {
      window.quizStarted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizStart');
      }
    }

    expect(window.quizStarted).toBe(true);
    expect(window.fbq).toHaveBeenCalledWith('trackCustom', 'QuizStart');
  });

  it('should prevent duplicate QuizStart events', () => {
    // First start
    if (typeof window !== 'undefined' && !window.quizStarted) {
      window.quizStarted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizStart');
      }
    }

    // Reset mock to check if it's called again
    (window.fbq as any).mockClear();

    // Try to start again
    if (typeof window !== 'undefined' && !window.quizStarted) {
      window.quizStarted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizStart');
      }
    }

    // fbq should not be called again
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('should track Lead event when quiz completes', () => {
    // Simulate quiz completion
    if (typeof window !== 'undefined' && !window.quizCompleted) {
      window.quizCompleted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Lead');
      }
    }

    expect(window.quizCompleted).toBe(true);
    expect(window.fbq).toHaveBeenCalledWith('track', 'Lead');
  });

  it('should prevent duplicate Lead events', () => {
    // First completion
    if (typeof window !== 'undefined' && !window.quizCompleted) {
      window.quizCompleted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Lead');
      }
    }

    // Reset mock
    (window.fbq as any).mockClear();

    // Try to complete again
    if (typeof window !== 'undefined' && !window.quizCompleted) {
      window.quizCompleted = true;
      if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Lead');
      }
    }

    // fbq should not be called again
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('should track QuizAbandon when quiz started but not completed', () => {
    // Start quiz
    window.quizStarted = true;
    window.quizCompleted = false;

    // Simulate beforeunload
    if (window.quizStarted && !window.quizCompleted) {
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizAbandon');
      }
    }

    expect(window.fbq).toHaveBeenCalledWith('trackCustom', 'QuizAbandon');
  });

  it('should NOT track QuizAbandon when quiz is completed', () => {
    // Start and complete quiz
    window.quizStarted = true;
    window.quizCompleted = true;

    // Simulate beforeunload
    if (window.quizStarted && !window.quizCompleted) {
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizAbandon');
      }
    }

    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('should NOT track QuizAbandon when quiz never started', () => {
    // Quiz not started
    window.quizStarted = false;
    window.quizCompleted = false;

    // Simulate beforeunload
    if (window.quizStarted && !window.quizCompleted) {
      if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'QuizAbandon');
      }
    }

    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('should handle missing fbq gracefully', () => {
    // Remove fbq
    delete (window as any).fbq;

    // Try to track event - should not throw
    expect(() => {
      if (typeof window !== 'undefined' && !window.quizStarted) {
        window.quizStarted = true;
        if (typeof window.fbq !== 'undefined') {
          window.fbq('trackCustom', 'QuizStart');
        }
      }
    }).not.toThrow();

    expect(window.quizStarted).toBe(true);
  });
});
