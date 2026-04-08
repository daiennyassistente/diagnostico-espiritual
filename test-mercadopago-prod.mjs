import MercadoPago from "@mercadopago/sdk-nodejs";

const client = new MercadoPago.MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

try {
  console.log("Testing Mercado Pago production credentials...");
  
  // Test creating a preference (simplified test)
  const preference = new MercadoPago.Preference(client);
  
  const body = {
    items: [
      {
        id: "1",
        title: "Test Item",
        quantity: 1,
        unit_price: 10,
      },
    ],
    back_urls: {
      success: "https://example.com/success",
      failure: "https://example.com/failure",
      pending: "https://example.com/pending",
    },
    auto_return: "approved",
  };

  const result = await preference.create({ body });
  
  if (result && result.id) {
    console.log("✅ Mercado Pago production credentials are VALID!");
    console.log("Preference ID:", result.id);
    console.log("Checkout URL:", result.init_point);
  } else {
    console.log("❌ Failed to create preference");
  }
} catch (error) {
  console.error("❌ Error testing Mercado Pago:", error.message);
  process.exit(1);
}
