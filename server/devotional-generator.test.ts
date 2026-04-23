import { describe, expect, it } from "vitest";
import { buildDevotionalPrompt, buildFallbackDevotionalContent, normalizePdfText } from "./devotional-generator";

const request = {
  profileName: "espiritualmente em recomeço",
  profileDescription:
    "Você demonstra fome sincera de voltar para Deus, mas suas respostas mostram oscilação, culpa acumulada e uma necessidade urgente de reencontrar constância em Jesus.",
  strengths: ["Você ainda reconhece sua necessidade de Deus", "Há sinceridade no desejo de recomeçar"],
  challenges: ["culpa e instabilidade espiritual", "rotina bíblica irregular"],
  recommendations: [
    "Separe 10 minutos diários para Palavra e oração com constância",
    "Confesse com sinceridade o que tem afastado você de Deus",
  ],
  nextSteps: ["Retomar uma rotina simples com Deus", "Buscar firmeza em Cristo diariamente"],
  userName: "Mariana",
  responses: {
    step1: "Mariana",
    step2: "Distante de Deus e querendo voltar",
    step3: "Distrações e culpa pelo que deixei acumular",
    step4: "Leio a Bíblia sem constância",
    step5: "Quase não consigo manter uma vida de oração",
    step6: "Sinto falta de paz e da presença de Deus",
    step7: "Deus está tratando minha ansiedade e minha autossabotagem",
    step8: "Quero voltar a caminhar perto de Jesus",
    step9: "10 minutos por dia",
    step10: "Minha maior dificuldade é permanecer constante",
    step11: "Em recomeço, mas com medo de falhar de novo",
    step12: "Tenho vergonha de ter esfriado tanto e quero reencontrar Jesus",
  },
};

describe("devotional-generator", () => {
  it("monta prompt com respostas reais, resultado espiritual e diretrizes cristãs evangélicas", () => {
    const prompt = buildDevotionalPrompt(request);

    expect(prompt).toContain("Mariana");
    expect(prompt).toContain("Distante de Deus e querendo voltar");
    expect(prompt).toContain("Tenho vergonha de ter esfriado tanto e quero reencontrar Jesus");
    expect(prompt).toContain("Jesus Cristo deve ser o centro");
    expect(prompt).toContain("A Bíblia é a única autoridade");
    expect(prompt).toContain("Se o mesmo texto pudesse servir para outra pessoa com respostas diferentes, então sua resposta está errada");
  });

  it("gera fallback com 7 dias, centrado em Jesus e conectado às respostas do quiz", () => {
    const days = buildFallbackDevotionalContent(request);

    expect(days).toHaveLength(7);
    expect(days[0].reflection).toContain("cansados") || expect(days[0].reflection).toContain("Distante");
    expect(days[0].prayer).toContain("Jesus") || expect(days[0].prayer).toContain("Senhor");
    expect(days[0].prayer).toContain("Senhor Jesus");
    expect(days[3].application).toContain("10 minutos") || expect(days[3].application).toContain("tempo");
    expect(days[6].reflection).toContain("Perseverança");
    expect(days[6].reflection).toContain("Jesus");
    expect(days.every((day) => day.verseReference.length > 0)).toBe(true);
    expect(days.every((day) => /Jesus|Cristo|Deus|Senhor/.test(day.reflection + day.prayer + day.application))).toBe(true);
  });

  it("normaliza texto para PDF removendo caracteres inválidos sem perder o conteúdo principal", () => {
    const normalized = normalizePdfText("  Paz\u0000 em Jesus  \n\n");
    expect(normalized).toBe("Paz em Jesus");
  });
});
