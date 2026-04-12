import { OpenAI } from "openai";

const client = new OpenAI();

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: any };

export type InvokeParams = {
  messages: Message[];
  response_format?: ResponseFormat;
  max_tokens?: number;
};

export type InvokeResult = {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: params.messages as any,
      response_format: params.response_format as any,
      max_tokens: params.max_tokens || 4096,
    });

    return response as any;
  } catch (error) {
    console.error("Erro ao invocar LLM:", error);
    throw error;
  }
}
