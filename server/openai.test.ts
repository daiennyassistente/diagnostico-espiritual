import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("OpenAI Integration", () => {
  it("should successfully call OpenAI API with valid key", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say 'OpenAI API is working' in exactly those words.",
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message.content).toContain("OpenAI API is working");
  });

  it("should handle structured responses from OpenAI", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator.",
        },
        {
          role: "user",
          content: 'Generate a simple JSON with {"status": "success"}',
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices[0].message.content).toBeDefined();
  });
});
