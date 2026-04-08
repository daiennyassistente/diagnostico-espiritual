import type { Request, Response } from "express";

export function createMockRequest(): Partial<Request> {
  return {
    headers: {
      cookie: "",
      "x-forwarded-proto": "https",
    },
    protocol: "https",
    query: {},
    body: {},
  };
}

export function createMockResponse() {
  const cookies: Record<string, any> = {};
  const mockRes = {
    cookie: (name: string, value: string, options?: any) => {
      cookies[name] = { value, options };
      return mockRes;
    },
    clearCookie: (name: string, options?: any) => {
      delete cookies[name];
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
    status: (code: number) => {
      return mockRes;
    },
    redirect: (code: number, url: string) => {
      return mockRes;
    },
  };

  return mockRes as unknown as Partial<Response>;
}
