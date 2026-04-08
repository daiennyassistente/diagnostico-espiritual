import { describe, expect, it } from "vitest";
import { buildFallbackDiagnosis } from "./routers";

describe("buildFallbackDiagnosis", () => {
  it("deve gerar perfil de recomeço com respostas indexadas do quiz", () => {
    const result = buildFallbackDiagnosis({
      "0": "Distante e querendo voltar",
      "9": "Precisando recomeçar",
    });

    expect(result.profileName).toContain("Coração em Recomeço");
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.nextSteps[0]).toContain("passo");
  });

  it("deve gerar perfil de fé cansada quando houver sinais de cansaço", () => {
    const result = buildFallbackDiagnosis({
      step5: "Paz",
      step10: "Cansada",
    });

    expect(result.profileName).toContain("Fé Cansada");
    expect(result.challenges.join(" ")).toContain("Cansaço");
  });

  it("deve gerar perfil de busca por direção com chaves stepN", () => {
    const result = buildFallbackDiagnosis({
      step1: "Com sede, mas sem direção",
      step5: "Direção",
      step10: "Com fome de Deus",
    });

    expect(result.profileName).toContain("Buscando Direção");
    expect(result.profileDescription).toContain("próximo passo");
  });

  it("deve retornar perfil padrão quando nenhuma regra específica for acionada", () => {
    const result = buildFallbackDiagnosis({
      step1: "Resposta neutra",
      step3: "Outra resposta",
      step4: "Mais uma resposta",
      step5: "Profundidade",
      step10: "Estado indefinido",
    });

    expect(result.profileName).toContain("Caminho de Crescimento");
    expect(result.recommendations).toHaveLength(3);
    expect(result.nextSteps).toHaveLength(1);
  });
});
