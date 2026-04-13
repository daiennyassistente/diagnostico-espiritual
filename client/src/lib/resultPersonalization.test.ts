import { describe, expect, it } from "vitest";
import { extractQuizInsights } from "./resultPersonalization";

describe("extractQuizInsights", () => {
  it("gera insights personalizados a partir das respostas numéricas do quiz", () => {
    const insights = extractQuizInsights({
      "1": "espiritualmente cansada",
      "2": "falta de constância",
      "5": "mais intimidade com Deus",
      "7": "uma rotina mais profunda de oração",
      "8": "15 minutos por dia",
      "11": "estou tentando voltar, mas me sinto travada",
    });

    expect(insights).toContain("Hoje você se descreve como “espiritualmente cansada”.");
    expect(insights).toContain("Sua principal trava espiritual apareceu como “falta de constância”.");
    expect(insights).toContain("Você sente falta de “mais intimidade com Deus” na sua caminhada com Deus.");
    expect(insights).toContain("O seu desejo mais forte agora é viver “uma rotina mais profunda de oração”.");
    expect(insights).toContain("Na prática, você disse que consegue separar “15 minutos por dia” para recomeçar.");
  });

  it("retorna no máximo cinco insights para manter a leitura objetiva", () => {
    const insights = extractQuizInsights({
      step2: "distante",
      step3: "sobrecarga",
      step6: "paz",
      step8: "clareza",
      step9: "20 minutos",
      step12: "preciso de direção",
    });

    expect(insights).toHaveLength(5);
    expect(insights[4]).toBe("Na prática, você disse que consegue separar “20 minutos” para recomeçar.");
  });
});
