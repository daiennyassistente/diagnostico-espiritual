import { describe, expect, it } from "vitest";
import { parseStoredLeadData } from "./leadStorage";

describe("parseStoredLeadData", () => {
  it("lê corretamente o formato atual com leadId", () => {
    const result = parseStoredLeadData(
      JSON.stringify({
        leadId: 42,
        email: "ana@example.com",
        whatsapp: "11999999999",
        name: "Ana",
      }),
    );

    expect(result).toEqual({
      leadId: 42,
      email: "ana@example.com",
      whatsapp: "11999999999",
      name: "Ana",
    });
  });

  it("aceita o formato legado com id", () => {
    const result = parseStoredLeadData(
      JSON.stringify({
        id: "77",
        email: "legacy@example.com",
      }),
    );

    expect(result).toEqual({
      leadId: 77,
      email: "legacy@example.com",
      whatsapp: "",
      name: "",
    });
  });

  it("retorna null quando o JSON está inválido", () => {
    expect(parseStoredLeadData("{" )).toBeNull();
  });
});
