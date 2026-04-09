import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe-webhook";
import { handleMercadoPagoWebhook } from "../mercadopago-webhook";
import { createOrUpdateAdminUser } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize admin user on startup
  try {
    await createOrUpdateAdminUser("Daienny", "Netflix520@", "daienny@example.com");
    console.log("[Admin] Daienny user initialized/updated");
  } catch (error) {
    console.warn("[Admin] Failed to initialize admin user:", error);
  }

  const app = express();
  const server = createServer(app);
  // Stripe webhook must be registered BEFORE express.json() to access raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  // Mercado Pago webhook
  app.post(
    "/api/mercadopago/webhook",
    express.raw({ type: "application/json" }),
    handleMercadoPagoWebhook
  );

  // Download PDF route
  app.get("/api/download", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token inválido" });
      }

      // Importar funções necessárias
      const { generateDevotionalPDF } = await import("../devotional-generator");
      const { getPaymentByToken, getDiagnosticByLeadId } = await import("../db");

      // Buscar pagamento pelo token
      const payment = await getPaymentByToken(token);

      if (!payment) {
        return res.status(404).json({ error: "Token não encontrado" });
      }

      // Buscar diagnóstico do lead
      const diagnostic = await getDiagnosticByLeadId(payment.leadId);

      if (!diagnostic) {
        return res.status(404).json({ error: "Diagnóstico não encontrado" });
      }

      // Gerar PDF
      const pdfBuffer = await generateDevotionalPDF({
        profileName: diagnostic.profileName,
        profileDescription: diagnostic.profileDescription,
        challenges: JSON.parse(diagnostic.challenges),
        recommendations: JSON.parse(diagnostic.recommendations),
      });

      // Enviar PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Devocional-${diagnostic.profileName.replace(/\s+/g, "-")}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("[Download] Erro ao gerar PDF:", error);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Serve static files from public directory
  app.use(express.static("public"));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Stripe webhook endpoint: http://localhost:${port}/api/stripe/webhook`);
  });
}

startServer().catch(console.error);
