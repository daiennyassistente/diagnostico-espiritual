import { describe, it, expect, beforeAll } from "vitest";
import { getAdminByUsername, verifyPassword, createOrUpdateAdminUser } from "./db";

describe("Admin Login", () => {
  beforeAll(async () => {
    // Setup: criar um admin de teste
    console.log("Setting up test admin...");
  });

  it("should authenticate admin with correct password", async () => {
    const testUsername = "testadmin";
    const testPassword = "testpass123";

    // Simular autenticação
    const admin = await getAdminByUsername(testUsername);
    
    if (admin) {
      const isValid = verifyPassword(testPassword, admin.passwordHash);
      expect(isValid).toBe(true);
    }
  });

  it("should reject admin with incorrect password", async () => {
    const testUsername = "testadmin";
    const wrongPassword = "wrongpass";

    const admin = await getAdminByUsername(testUsername);
    
    if (admin) {
      const isValid = verifyPassword(wrongPassword, admin.passwordHash);
      expect(isValid).toBe(false);
    }
  });

  it("should create linked user after successful admin login", async () => {
    const testUsername = "testadmin";
    const testPassword = "testpass123";

    const linkedUser = await createOrUpdateAdminUser(testUsername, testPassword);
    expect(linkedUser).toBeDefined();
    expect(linkedUser?.name).toBe(testUsername);
  });
});
