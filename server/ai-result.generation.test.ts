import { describe, it, expect, vi } from "vitest";
import { buildFallbackDiagnosis } from "./routers";

describe("AI Result Generation", () => {
  it("should generate fallback result when responses indicate restart", () => {
    const responses = {
      "0": "recomeço",
      "1": "Distante",
      "2": "Confusão",
      "3": "Parada",
      "4": "Inexistente",
      "5": "Direção",
      "6": "Identidade",
      "7": "Ouvir Deus",
      "8": "20 minutos",
      "9": "recomeçar",
      "10": "Travada",
      "11": "me sinto perdida"
    };

    const result = buildFallbackDiagnosis(responses);
    
    expect(result).toBeDefined();
    expect(result.profileName).toContain("Recomeço");
    expect(result.profileDescription).toBeDefined();
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.challenges.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });

  it("should generate fallback result when responses indicate fatigue", () => {
    const responses = {
      "0": "Nome",
      "1": "Distante",
      "2": "Irregular",
      "3": "Instável",
      "4": "Paz",
      "5": "Confusão",
      "6": "Identidade",
      "7": "Ouvir Deus",
      "8": "10 minutos",
      "9": "cansada",
      "10": "Travada",
      "11": "me sinto cansada"
    };

    const result = buildFallbackDiagnosis(responses);
    
    expect(result).toBeDefined();
    expect(result.profileName).toContain("Cansada");
    expect(result.profileDescription).toContain("descanso");
  });

  it("should generate default fallback result for generic responses", () => {
    const responses = {
      "0": "João",
      "1": "Buscando",
      "2": "Frequente",
      "3": "Constante",
      "4": "Estável",
      "5": "Clareza",
      "6": "Propósito",
      "7": "Comunhão",
      "8": "30 minutos",
      "9": "Crescimento",
      "10": "Amadurecendo",
      "11": "Estou bem"
    };

    const result = buildFallbackDiagnosis(responses);
    
    expect(result).toBeDefined();
    expect(result.profileName).toBeDefined();
    expect(result.profileDescription).toBeDefined();
    expect(result.strengths.length).toBeGreaterThan(0);
  });
});
