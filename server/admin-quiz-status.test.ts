import { describe, it, expect, beforeAll } from "vitest";
import { getLatestQuizStatusForAdmin, enrichUsersWithQuizStatus } from "./admin-quiz-status";
import { saveQuizEvent } from "./quiz-events-db";

describe("Admin Quiz Status", () => {
  describe("getLatestQuizStatusForAdmin", () => {
    it("should return null for non-existent lead", async () => {
      const status = await getLatestQuizStatusForAdmin(999999999);
      expect(status).toBeNull();
    });

    it("should return Quiz Iniciado for QuizStarted event", async () => {
      const leadId = 11111;
      const eventId = `admin-status-started-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizStarted",
        eventId,
        "test@example.com"
      );

      const status = await getLatestQuizStatusForAdmin(leadId);
      expect(status).toBe("Quiz Iniciado");
    });

    it("should return Quiz Concluído for QuizCompleted event", async () => {
      const leadId = 22222;
      const startedEventId = `admin-status-started-${Date.now()}`;
      const completedEventId = `admin-status-completed-${Date.now()}`;
      
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

      const status = await getLatestQuizStatusForAdmin(leadId);
      expect(status).toBe("Quiz Concluído");
    });

    it("should return Quiz Abandonado for QuizAbandoned event", async () => {
      const leadId = 33333;
      const startedEventId = `admin-status-started-${Date.now()}`;
      const abandonedEventId = `admin-status-abandoned-${Date.now()}`;
      
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
        "inactivity"
      );

      const status = await getLatestQuizStatusForAdmin(leadId);
      expect(status).toBe("Quiz Abandonado");
    });
  });

  describe("enrichUsersWithQuizStatus", () => {
    it("should add quizStatus to user records", async () => {
      const leadId = 44444;
      const eventId = `enrich-test-${Date.now()}`;
      
      await saveQuizEvent(
        leadId,
        "QuizCompleted",
        eventId,
        "test@example.com",
        undefined,
        "Espiritualmente Amadurecendo"
      );

      const mockUsers = [
        {
          id: leadId,
          name: "Test User",
          email: "test@example.com",
          whatsapp: "5511999999999",
          status: "quiz",
        },
      ];

      const enriched = await enrichUsersWithQuizStatus(mockUsers);
      
      expect(enriched).toHaveLength(1);
      expect(enriched[0].quizStatus).toBe("Quiz Concluído");
      expect(enriched[0].name).toBe("Test User");
    });

    it("should handle multiple users with different quiz statuses", async () => {
      const leadId1 = 77777 + Math.floor(Math.random() * 10000);
      const leadId2 = 88888 + Math.floor(Math.random() * 10000);
      const eventId1 = `enrich-multi-1-${Date.now()}-${Math.random()}`;
      const eventId2 = `enrich-multi-2-${Date.now()}-${Math.random()}`;
      
      await saveQuizEvent(
        leadId1,
        "QuizStarted",
        eventId1,
        "user1@example.com"
      );

      await saveQuizEvent(
        leadId2,
        "QuizCompleted",
        eventId2,
        "user2@example.com",
        undefined,
        "Espiritualmente Recomeço"
      );

      const mockUsers = [
        {
          id: leadId1,
          name: "User 1",
          email: "user1@example.com",
          status: "quiz",
        },
        {
          id: leadId2,
          name: "User 2",
          email: "user2@example.com",
          status: "quiz",
        },
      ];

      const enriched = await enrichUsersWithQuizStatus(mockUsers);
      
      expect(enriched).toHaveLength(2);
      expect(enriched[0].quizStatus).toBe("Quiz Iniciado");
      expect(enriched[1].quizStatus).toBe("Quiz Concluído");
    });

    it("should handle users without quiz events", async () => {
      const mockUsers = [
        {
          id: 999999999,
          name: "No Quiz User",
          email: "noquiz@example.com",
          status: "quiz",
        },
      ];

      const enriched = await enrichUsersWithQuizStatus(mockUsers);
      
      expect(enriched).toHaveLength(1);
      expect(enriched[0].quizStatus).toBeNull();
      expect(enriched[0].name).toBe("No Quiz User");
    });
  });
});
