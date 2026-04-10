import { describe, expect, it } from "vitest";
import { buildFallbackDiagnosis } from "./routers";

describe("buildFallbackDiagnosis", () => {
  it("deve gerar perfil de recomeço com respostas reais do quiz", () => {
    const result = buildFallbackDiagnosis({
      "0": "Maria",
      "1": "Distante e querendo voltar",
      "2": "Desânimo",
      "3": "Quero voltar, mas não consigo manter",
      "4": "Quero voltar a orar com profundidade",
      "5": "Intimidade",
      "6": "Cura emocional",
      "7": "Voltar ao secreto",
      "8": "10 minutos",
      "9": "Emocional",
      "10": "Precisando recomeçar",
      "11": "Sinto culpa por ter esfriado",
    });

    expect(result.profileName).toBe("espiritualmente em recomeço");
    expect(result.profileDescription).toContain("Precisando recomeçar");
    expect(result.profileDescription).toContain("Quero voltar, mas não consigo manter");
    expect(result.profileDescription).toContain("Voltar ao secreto");
    expect(result.nextSteps[0]).toContain("10 minutos");
  });

  it("deve gerar perfil cansado(a) quando houver sinais claros de desgaste", () => {
    const result = buildFallbackDiagnosis({
      "0": "Ana",
      "1": "Cansada espiritualmente",
      "2": "Rotina corrida",
      "3": "Irregular",
      "4": "Muito emocional e pouco constante",
      "5": "Paz",
      "6": "Espera",
      "7": "Ter mais paz e alinhamento",
      "8": "5 minutos",
      "9": "Emocional",
      "10": "Cansada",
    });

    expect(result.profileName).toBe("espiritualmente cansado(a)");
    expect(result.profileDescription).toContain("Rotina corrida");
    expect(result.recommendations[0]).toContain("5 minutos");
    expect(result.challenges.join(" ").toLowerCase()).toContain("emocional");
  });

  it("deve gerar perfil travado(a) quando houver falta de direção e bloqueio interno", () => {
    const result = buildFallbackDiagnosis({
      "0": "João",
      "1": "Com sede, mas sem direção",
      "2": "Confusão mental/emocional",
      "3": "Irregular",
      "4": "Quase inexistente",
      "5": "Direção",
      "6": "Identidade",
      "7": "Ouvir melhor a voz de Deus",
      "8": "15 minutos",
      "9": "De direção",
      "10": "Travada",
    });

    expect(result.profileName).toBe("espiritualmente travado(a)");
    expect(result.profileDescription).toContain("Travada");
    expect(result.profileDescription).toContain("Confusão mental/emocional");
    expect(result.profileDescription).toContain("Ouvir melhor a voz de Deus");
  });

  it("deve retornar perfil padrão quando nenhuma regra específica for acionada", () => {
    const result = buildFallbackDiagnosis({
      "0": "Lucas",
      "1": "Em paz, mas querendo crescer",
      "2": "Distrações",
      "3": "Frequente, mas superficial",
      "4": "Sincera, mas instável",
      "5": "Profundidade",
      "6": "Disciplina",
      "7": "Amadurecer espiritualmente",
      "8": "20 minutos ou mais",
      "9": "De foco",
      "10": "Disponível para crescer",
    });

    expect(result.profileName).toBe("espiritualmente em crescimento");
    expect(result.recommendations).toHaveLength(3);
    expect(result.nextSteps).toHaveLength(1);
  });
});
