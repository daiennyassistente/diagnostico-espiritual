import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { createMockRequest, createMockResponse } from "./_core/test-utils";
import type { Request, Response } from "express";

describe("auth.loginWithPassword", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a mock context for testing
    const mockReq = createMockRequest() as Request;
    const mockRes = createMockResponse() as Response;

    const ctx = await createContext({
      req: mockReq,
      res: mockRes,
    });

    caller = appRouter.createCaller(ctx);
  });

  it("should login with valid credentials", async () => {
    const result = await caller.auth.loginWithPassword({
      name: "Daienny",
      password: "daivitoria23",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.name).toBe("Daienny");
    expect(result.user.role).toBe("admin");
  });

  it("should fail with invalid credentials", async () => {
    try {
      await caller.auth.loginWithPassword({
        name: "Daienny",
        password: "wrongpassword",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain("Credenciais inválidas");
    }
  });

  it("should fail with non-existent user", async () => {
    try {
      await caller.auth.loginWithPassword({
        name: "NonExistentUser",
        password: "password123",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain("Credenciais inválidas");
    }
  });


});
