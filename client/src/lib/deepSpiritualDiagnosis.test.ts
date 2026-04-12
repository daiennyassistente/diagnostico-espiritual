import { describe, it, expect } from "vitest";
import { generateDeepSpiritualDiagnosis } from "./deepSpiritualDiagnosis";

describe("generateDeepSpiritualDiagnosis", () => {
  const testChallenges = [
    "Falta de constância",
    "Distração",
    "Distância emocional de Deus",
  ];

  describe("Overwhelmed Profile", () => {
    it("should generate overwhelmed diagnosis with deep emotional content", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "sobrecarregado",
        testChallenges,
        "João"
      );

      expect(diagnosis.opening).toContain("João");
      expect(diagnosis.opening).toContain("está vivendo");
      expect(diagnosis.deepExplanation).toContain("tudo");
      expect(diagnosis.rootOfProblem).toContain("parede");
      expect(diagnosis.realConsequence).toContain("queimado");
      expect(diagnosis.emotionalConnection).toContain("não aconteceu");
      expect(diagnosis.acceptance).toContain("não está sozinho");
      expect(diagnosis.transitionToSolution).toContain("pode mudar");
    });

    it("should have all required sections", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "sobrecarregado",
        testChallenges,
        "Maria"
      );

      expect(diagnosis.opening).toBeTruthy();
      expect(diagnosis.deepExplanation).toBeTruthy();
      expect(diagnosis.rootOfProblem).toBeTruthy();
      expect(diagnosis.realConsequence).toBeTruthy();
      expect(diagnosis.emotionalConnection).toBeTruthy();
      expect(diagnosis.acceptance).toBeTruthy();
      expect(diagnosis.transitionToSolution).toBeTruthy();
    });

    it("should have substantial depth and length", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "sobrecarregado",
        testChallenges,
        "Pedro"
      );

      // Each section should be substantial
      expect(diagnosis.deepExplanation.length).toBeGreaterThan(300);
      expect(diagnosis.rootOfProblem.length).toBeGreaterThan(200);
      expect(diagnosis.realConsequence.length).toBeGreaterThan(200);
    });
  });

  describe("Distant Profile", () => {
    it("should generate distant diagnosis with appropriate content", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "distante",
        testChallenges,
        "Ana"
      );

      expect(diagnosis.opening).toContain("silêncio");
      expect(diagnosis.deepExplanation).toContain("parede");
      expect(diagnosis.rootOfProblem).toContain("proteção");
      expect(diagnosis.realConsequence).toContain("mentira");
    });
  });

  describe("Confused Profile", () => {
    it("should generate confused diagnosis", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "confuso",
        testChallenges,
        "Carlos"
      );

      expect(diagnosis.opening).toContain("caminho");
      expect(diagnosis.deepExplanation).toContain("conselhos");
      expect(diagnosis.rootOfProblem).toContain("resposta certa");
    });
  });

  describe("Weak Profile", () => {
    it("should generate weak diagnosis", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "fraco",
        testChallenges,
        "Lucas"
      );

      expect(diagnosis.opening).toContain("força");
      expect(diagnosis.deepExplanation).toContain("fraco");
      expect(diagnosis.rootOfProblem).toContain("fé que não é sua");
    });
  });

  describe("Lost Profile", () => {
    it("should generate lost diagnosis", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "perdido",
        testChallenges,
        "Rafael"
      );

      expect(diagnosis.opening).toContain("perdeu");
      expect(diagnosis.deepExplanation).toContain("floresta");
      expect(diagnosis.rootOfProblem).toContain("voz");
    });
  });

  describe("Dry Profile", () => {
    it("should generate dry diagnosis", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "seco",
        testChallenges,
        "Beatriz"
      );

      expect(diagnosis.opening).toContain("vazio");
      expect(diagnosis.deepExplanation).toContain("seco");
      expect(diagnosis.rootOfProblem).toContain("poço");
    });
  });

  describe("General Profile", () => {
    it("should generate general diagnosis for unknown profiles", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "desconhecido",
        testChallenges,
        "Sofia"
      );

      expect(diagnosis.opening).toContain("Sofia");
      expect(diagnosis.opening).toContain("atenção");
      expect(diagnosis.deepExplanation).toBeTruthy();
      expect(diagnosis.rootOfProblem).toBeTruthy();
    });
  });

  describe("Emotional Connection", () => {
    it("should include personal connection phrases", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "distante",
        testChallenges,
        "Marcos"
      );

      expect(diagnosis.emotionalConnection).toContain("Marcos");
      expect(diagnosis.emotionalConnection).toContain("não aconteceu");
      expect(diagnosis.emotionalConnection).toContain("talvez você");
    });
  });

  describe("Acceptance Section", () => {
    it("should include acceptance and hope", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "fraco",
        testChallenges,
        "Juliana"
      );

      expect(diagnosis.acceptance).toContain("não está sozinho");
      expect(diagnosis.acceptance).toContain("verdade");
      expect(diagnosis.acceptance).toContain("quer");
    });
  });

  describe("Transition to Solution", () => {
    it("should provide hopeful transition", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "perdido",
        testChallenges,
        "Gustavo"
      );

      expect(diagnosis.transitionToSolution).toContain("boa notícia");
      expect(diagnosis.transitionToSolution).toContain("pode");
      expect(diagnosis.transitionToSolution).toContain("passo");
    });
  });

  describe("Depth and Authenticity", () => {
    it("should avoid generic language", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "sobrecarregado",
        testChallenges,
        "Fernanda"
      );

      // Should not use generic phrases
      expect(diagnosis.deepExplanation).not.toContain("Lorem ipsum");
      expect(diagnosis.rootOfProblem).not.toContain("Lorem ipsum");

      // Should have specific, personal language
      expect(diagnosis.opening).toContain("Fernanda");
      expect(diagnosis.deepExplanation.length).toBeGreaterThan(400);
    });
  });

  describe("All Profiles Generate Unique Content", () => {
    it("should generate different content for different profiles", () => {
      const overwhelmed = generateDeepSpiritualDiagnosis(
        "sobrecarregado",
        testChallenges,
        "Test"
      );
      const distant = generateDeepSpiritualDiagnosis(
        "distante",
        testChallenges,
        "Test"
      );
      const confused = generateDeepSpiritualDiagnosis(
        "confuso",
        testChallenges,
        "Test"
      );

      // Opening should be different for each profile
      expect(overwhelmed.opening).not.toBe(distant.opening);
      expect(distant.opening).not.toBe(confused.opening);

      // Deep explanation should be different
      expect(overwhelmed.deepExplanation).not.toBe(distant.deepExplanation);
      expect(distant.deepExplanation).not.toBe(confused.deepExplanation);
    });
  });

  describe("Emotional Depth", () => {
    it("should include emotional language and metaphors", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "seco",
        testChallenges,
        "Isabella"
      );

      // Should include emotional and metaphorical language
      expect(diagnosis.deepExplanation).toMatch(/seco|vazio|água|poço/i);
      expect(diagnosis.rootOfProblem).toMatch(/parou|deixou|perdeu/i);
      expect(diagnosis.realConsequence).toMatch(/impacto|afetando|começou/i);
    });
  });

  describe("Spiritual Language", () => {
    it("should include spiritual and biblical references", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "distante",
        testChallenges,
        "Thiago"
      );

      // Should reference God and spiritual concepts
      expect(diagnosis.opening.toLowerCase()).toMatch(/deus|espiritual|fé/);
      expect(diagnosis.acceptance.toLowerCase()).toMatch(/deus|verdade|graça/);
    });
  });

  describe("Personalization", () => {
    it("should include user name in appropriate sections", () => {
      const diagnosis = generateDeepSpiritualDiagnosis(
        "confuso",
        testChallenges,
        "Camila"
      );

      // User name should appear in opening
      expect(diagnosis.opening).toContain("Camila");

      // Should feel personal and directed to the user
      expect(diagnosis.opening).toMatch(/você|sua|seu/i);
    });
  });
});
