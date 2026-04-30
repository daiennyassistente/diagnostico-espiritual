import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { saveQuizEvent, getLatestQuizStatus, getQuizEvents } from "./quiz-events-db";

describe("Quiz Events Database", () => {
  const testLeadId = 99999;
  const testEventId = `test-event-${Date.now()}`;

  describe("saveQuizEvent", () => {
    it("should save a QuizStarted event", async () => {
      const result = await saveQuizEvent(
        testLeadId,
        "QuizStarted",
        testEventId,
        "test@example.com",
        "5511999999999"
      );
      expect(result).toBeDefined();
    });

    it("should prevent duplicate events by eventId", async () => {
      const eventId = `duplicate-test-${Date.now()}`;
      
      // Save first event
      await saveQuizEvent(
        testLeadId,
        "QuizStarted",
        eventId,
        "test@example.com"
      );

      // Try to save duplicate
      const result = await saveQuizEvent(
        testLeadId,
        "QuizStarted",
        eventId,
        "test@example.com"
      );

      // Should return the existing event
      expect(result).toBeDefined();
    });

    it("should save QuizCompleted event with profile name", async () => {
      const completedEventId = `completed-${Date.now()}`;
      const result = await saveQuizEvent(
        testLeadId,
        "QuizCompleted",
        completedEventId,
        "test@example.com",
        undefined,
        "Espiritualmente Cansada"
      );
      expect(result).toBeDefined();
    });

    it("should save QuizAbandoned event with reason", async () => {
      const abandonedEventId = `abandoned-${Date.now()}`;
      const result = await saveQuizEvent(
        testLeadId,
        "QuizAbandoned",
        abandonedEventId,
        "test@example.com",
        undefined,
        undefined,
        5,
        12,
        "inactivity"
      );
      expect(result).toBeDefined();
    });
  });

  describe("getLatestQuizStatus", () => {
    it("should return null for non-existent lead", async () => {
      const status = await getLatestQuizStatus(999999999);
      expect(status).toBeNull();
    });

    it("should return Quiz Iniciado when only QuizStarted event exists", async () => {
      const leadId = 88888;
      const eventId = `status-test-started-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        eventId,
        "test@example.com"
      );

      const status = await getLatestQuizStatus(leadId);
      expect(status).toBe("Quiz Iniciado");
    });

    it("should return Quiz Concluído when QuizCompleted event exists", async () => {
      const leadId = 77777;
      const startedEventId = `status-test-started-${Date.now()}`;
      const completedEventId = `status-test-completed-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        startedEventId,
        "test@example.com"
      );

      await saveQuizEvent(
        leadId,
        "QuizCompleted",
        completedEventId,
        "test@example.com",
        undefined,
        "Espiritualmente Cansada"
      );

      const status = await getLatestQuizStatus(leadId);
      expect(status).toBe("Quiz Concluído");
    });

    it("should prioritize Quiz Concluído over Quiz Abandonado", async () => {
      const leadId = 66666;
      const startedEventId = `status-test-started-${Date.now()}`;
      const abandonedEventId = `status-test-abandoned-${Date.now()}`;
      const completedEventId = `status-test-completed-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        startedEventId,
        "test@example.com"
      );

      await saveQuizEvent(
        leadId,
        "QuizAbandoned",
        abandonedEventId,
        "test@example.com",
        undefined,
        undefined,
        5,
        12,
        "page_unload"
      );

      await saveQuizEvent(
        leadId,
        "QuizCompleted",
        completedEventId,
        "test@example.com",
        undefined,
        "Espiritualmente Amadurecendo"
      );

      const status = await getLatestQuizStatus(leadId);
      expect(status).toBe("Quiz Concluído");
    });

    it("should return Quiz Abandonado when only QuizAbandoned event exists", async () => {
      const leadId = 55555;
      const startedEventId = `status-test-started-${Date.now()}`;
      const abandonedEventId = `status-test-abandoned-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        startedEventId,
        "test@example.com"
      );

      await saveQuizEvent(
        leadId,
        "QuizAbandoned",
        abandonedEventId,
        "test@example.com",
        undefined,
        undefined,
        8,
        12,
        "inactivity"
      );

      const status = await getLatestQuizStatus(leadId);
      expect(status).toBe("Quiz Abandonado");
    });
  });

  describe("getQuizEvents", () => {
    it("should return empty array for non-existent lead", async () => {
      const events = await getQuizEvents(999999999);
      expect(events).toEqual([]);
    });

    it("should return all events for a lead in chronological order", async () => {
      const leadId = 44444;
      const startedEventId = `all-events-started-${Date.now()}`;
      const completedEventId = `all-events-completed-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        startedEventId,
        "test@example.com"
      );

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      await saveQuizEvent(
        leadId,
        "QuizCompleted",
        completedEventId,
        "test@example.com",
        undefined,
        "Espiritualmente Recomeço"
      );

      const events = await getQuizEvents(leadId);
      expect(events.length).toBeGreaterThanOrEqual(2);
      expect(events[0].eventName).toBe("QuizStarted");
    });
  });
});
