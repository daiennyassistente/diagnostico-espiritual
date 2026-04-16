import { describe, it, expect } from "vitest";

describe("Mercado Pago Credentials", () => {
  it("should validate Mercado Pago access token", async () => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(token).toBeDefined();
    expect(token).toMatch(/^APP_USR-/);

    // Test if the token is valid by making a simple API call
    const response = await fetch("https://api.mercadopago.com/v1/payments/search", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Should return 200 or 400 (invalid params) but not 401 (unauthorized)
    expect(response.status).not.toBe(401);
    expect([200, 400]).toContain(response.status);
  });

  it("should validate Mercado Pago public key", () => {
    const publicKey = process.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    expect(publicKey).toBeDefined();
    expect(publicKey).toMatch(/^APP_USR-/);
  });
});
