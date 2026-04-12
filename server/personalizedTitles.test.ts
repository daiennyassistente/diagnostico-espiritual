import { describe, it, expect } from "vitest";
import { generatePersonalizedTitle } from "../client/src/lib/personalizedTitles";

describe("generatePersonalizedTitle", () => {
  describe("Sobrecarregado Profile", () => {
    it("should generate title for sobrecarregado with falta de tempo", () => {
      const title = generatePersonalizedTitle(
        "em busca de equilíbrio espiritual - sobrecarregado",
        ["falta de tempo para oração", "cansaço espiritual"],
        "João"
      );
      expect(title).toContain("João");
      expect(title).toContain("você não tem tempo nem para respirar");
    });

    it("should generate title for sobrecarregado with culpa", () => {
      const title = generatePersonalizedTitle(
        "em busca de equilíbrio espiritual - sobrecarregado",
        ["sensação de culpa"],
        "Maria"
      );
      expect(title).toContain("Maria");
      expect(title).toContain("culpa");
    });

    it("should return default sobrecarregado title", () => {
      const title = generatePersonalizedTitle(
        "em busca de equilíbrio espiritual - sobrecarregado",
        ["outro desafio"],
        "Pedro"
      );
      expect(title).toContain("Pedro");
      expect(title).toContain("fazendo tudo certo");
    });
  });

  describe("Distante Profile", () => {
    it("should generate title for distante with dúvidas", () => {
      const title = generatePersonalizedTitle(
        "em busca de reconexão espiritual - distante",
        ["dúvidas sobre fé"],
        "Ana"
      );
      expect(title).toContain("Ana");
      expect(title).toContain("não sabe mais se acredita");
    });

    it("should generate title for distante with abandono", () => {
      const title = generatePersonalizedTitle(
        "em busca de reconexão espiritual - distante",
        ["sensação de abandono"],
        "Carlos"
      );
      expect(title).toContain("Carlos");
      expect(title).toContain("Deus te abandonou");
    });

    it("should return default distante title", () => {
      const title = generatePersonalizedTitle(
        "em busca de reconexão espiritual - distante",
        ["outro desafio"],
        "Lucia"
      );
      expect(title).toContain("Lucia");
      expect(title).toContain("Deus está em silêncio");
    });
  });

  describe("Confuso Profile", () => {
    it("should generate title for confuso with falta de direção", () => {
      const title = generatePersonalizedTitle(
        "em busca de clareza espiritual - confuso",
        ["falta de direção"],
        "Rafael"
      );
      expect(title).toContain("Rafael");
      expect(title).toContain("qual caminho seguir");
    });

    it("should generate title for confuso with indecisão", () => {
      const title = generatePersonalizedTitle(
        "em busca de clareza espiritual - confuso",
        ["indecisão"],
        "Beatriz"
      );
      expect(title).toContain("Beatriz");
      expect(title).toContain("preso analisando");
    });

    it("should return default confuso title", () => {
      const title = generatePersonalizedTitle(
        "em busca de clareza espiritual - confuso",
        ["outro desafio"],
        "Felipe"
      );
      expect(title).toContain("Felipe");
      expect(title).toContain("está preso");
    });
  });

  describe("Fraco Profile", () => {
    it("should generate title for fraco with queda em tentações", () => {
      const title = generatePersonalizedTitle(
        "em busca de força espiritual - fraco",
        ["queda em tentações"],
        "Marcos"
      );
      expect(title).toContain("Marcos");
      expect(title).toContain("caiu novamente");
    });

    it("should generate title for fraco with falta de força", () => {
      const title = generatePersonalizedTitle(
        "em busca de força espiritual - fraco",
        ["falta de força"],
        "Camila"
      );
      expect(title).toContain("Camila");
      expect(title).toContain("perdeu sua força");
    });

    it("should return default fraco title", () => {
      const title = generatePersonalizedTitle(
        "em busca de força espiritual - fraco",
        ["outro desafio"],
        "Diego"
      );
      expect(title).toContain("Diego");
      expect(title).toContain("perdeu sua força");
    });
  });

  describe("Perdido Profile", () => {
    it("should generate title for perdido with perda de identidade", () => {
      const title = generatePersonalizedTitle(
        "em busca de propósito espiritual - perdido",
        ["perda de identidade"],
        "Isabela"
      );
      expect(title).toContain("Isabela");
      expect(title).toContain("não sabe mais quem é");
    });

    it("should generate title for perdido with desorientação", () => {
      const title = generatePersonalizedTitle(
        "em busca de propósito espiritual - perdido",
        ["desorientação"],
        "Lucas"
      );
      expect(title).toContain("Lucas");
      expect(title).toContain("completamente perdido");
    });

    it("should return default perdido title", () => {
      const title = generatePersonalizedTitle(
        "em busca de propósito espiritual - perdido",
        ["outro desafio"],
        "Sophia"
      );
      expect(title).toContain("Sophia");
      expect(title).toContain("está perdido");
    });
  });

  describe("Seco Profile", () => {
    it("should generate title for seco with falta de emoção", () => {
      const title = generatePersonalizedTitle(
        "em busca de vida espiritual - seco",
        ["falta de emoção espiritual"],
        "Gabriel"
      );
      expect(title).toContain("Gabriel");
      expect(title).toContain("não sente mais nada");
    });

    it("should generate title for seco with vazio", () => {
      const title = generatePersonalizedTitle(
        "em busca de vida espiritual - seco",
        ["vazio espiritual"],
        "Fernanda"
      );
      expect(title).toContain("Fernanda");
      expect(title).toContain("há um vazio");
    });

    it("should return default seco title", () => {
      const title = generatePersonalizedTitle(
        "em busca de vida espiritual - seco",
        ["outro desafio"],
        "Gustavo"
      );
      expect(title).toContain("Gustavo");
      expect(title).toContain("está vazio");
    });
  });

  describe("General Profile", () => {
    it("should generate title for general profile", () => {
      const title = generatePersonalizedTitle(
        "outro perfil",
        ["falta de profundidade"],
        "Veronica"
      );
      expect(title).toContain("Veronica");
      expect(title).toContain("fé é apenas superficial");
    });

    it("should return default general title", () => {
      const title = generatePersonalizedTitle(
        "outro perfil",
        ["desafio desconhecido"],
        "Adriano"
      );
      expect(title).toContain("Adriano");
      expect(title).toContain("algo não está bem");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty challenges array", () => {
      const title = generatePersonalizedTitle(
        "em busca de equilíbrio espiritual - sobrecarregado",
        [],
        "Teste"
      );
      expect(title).toContain("Teste");
      expect(title.length > 0).toBe(true);
    });

    it("should handle case-insensitive profile names", () => {
      const title1 = generatePersonalizedTitle(
        "SOBRECARREGADO",
        ["falta de tempo para oração"],
        "User1"
      );
      const title2 = generatePersonalizedTitle(
        "sobrecarregado",
        ["falta de tempo para oração"],
        "User2"
      );
      expect(title1).toContain("User1");
      expect(title2).toContain("User2");
      expect(title1.includes("você não tem tempo")).toBe(true);
      expect(title2.includes("você não tem tempo")).toBe(true);
    });

    it("should include user name in all titles", () => {
      const profiles = [
        "em busca de equilíbrio espiritual - sobrecarregado",
        "em busca de reconexão espiritual - distante",
        "em busca de clareza espiritual - confuso",
        "em busca de força espiritual - fraco",
        "em busca de propósito espiritual - perdido",
        "em busca de vida espiritual - seco",
      ];

      profiles.forEach((profile) => {
        const title = generatePersonalizedTitle(profile, ["desafio"], "TestUser");
        expect(title).toContain("TestUser");
      });
    });

    it("should have 3 lines in all titles", () => {
      const title = generatePersonalizedTitle(
        "em busca de equilíbrio espiritual - sobrecarregado",
        ["falta de tempo para oração"],
        "User"
      );
      const lines = title.split("\n").filter((line) => line.trim().length > 0);
      expect(lines.length).toBe(3);
    });
  });
});
