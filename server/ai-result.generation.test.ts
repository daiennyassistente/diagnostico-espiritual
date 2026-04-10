import { describe, expect, it } from "vitest";
import { buildFallbackDiagnosis, buildResponsesContext } from "./routers";

describe("AI Result Generation", () => {
  it("deve gerar fallback profundamente personalizado para perfil em recomeço", () => {
    const responses = {
      "0": "Maria",
      "1": "Distante e querendo voltar",
      "2": "Cansaço",
      "3": "Quero voltar, mas não consigo manter",
      "4": "Quero voltar a orar com profundidade",
      "5": "Intimidade",
      "6": "Cura emocional",
      "7": "Voltar ao secreto",
      "8": "10 minutos",
      "9": "Emocional",
      "10": "Precisando recomeçar",
      "11": "Sinto culpa por ter esfriado e dificuldade de manter constância",
    };

    const result = buildFallbackDiagnosis(responses);
    const description = result.profileDescription.toLowerCase();

    expect(result.profileName).toBe("espiritualmente em recomeço");
    expect(description).toContain("precisando recomeçar");
    expect(description).toContain("cansaço");
    expect(description).toContain("quero voltar, mas não consigo manter");
    expect(description).toContain("voltar ao secreto");
    expect(description).toContain("sinto culpa por ter esfriado");
    expect(result.recommendations[0]).toContain("10 minutos");
    expect(result.nextSteps[0]).toContain("10 minutos");
  });

  it("deve gerar fallback personalizado para perfil cansado(a)", () => {
    const responses = {
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
      "11": "Tenho me sentido sobrecarregada e sem forças para continuar como antes",
    };

    const result = buildFallbackDiagnosis(responses);
    const description = result.profileDescription.toLowerCase();

    expect(result.profileName).toBe("espiritualmente cansado(a)");
    expect(description).toContain("cansada");
    expect(description).toContain("rotina corrida");
    expect(description).toContain("paz");
    expect(result.recommendations[0]).toContain("5 minutos");
    expect(result.challenges.join(" ").toLowerCase()).toContain("emocional");
  });

  it("deve montar um contexto semântico com perguntas e respostas reais do quiz", () => {
    const context = buildResponsesContext({
      "0": "João",
      "1": "Com sede, mas sem direção",
      "8": "15 minutos",
      "10": "Travada",
    });

    expect(context).toContain("Pergunta 2: Como você se sente espiritualmente hoje?");
    expect(context).toContain("Resposta: Com sede, mas sem direção");
    expect(context).toContain("Pergunta 9: Quanto tempo por dia você consegue dedicar com intencionalidade?");
    expect(context).toContain("Resposta: 15 minutos");
    expect(context).toContain("Pergunta 12: Algo que você queira acrescentar ou desabafar?");
    expect(context).toContain("Resposta: Não respondido");
  });
});
