import { describe, it, expect, beforeAll } from "vitest";
import { sendEmail } from "./email-service";

describe("Email Service - Gmail Configuration", () => {
  it("should have SMTP environment variables configured", () => {
    expect(process.env.SMTP_HOST).toBe("smtp.gmail.com");
    expect(process.env.SMTP_PORT).toBe("587");
    expect(process.env.SMTP_USER).toBe("sondamediagnosticoespiritual@gmail.com");
    expect(process.env.SMTP_PASS).toBeDefined();
    expect(process.env.SMTP_FROM).toBe("sondamediagnosticoespiritual@gmail.com");
  });

  it("should send a test email successfully", async () => {
    const result = await sendEmail({
      to: "sondamediagnosticoespiritual@gmail.com",
      subject: "Teste de Configuração de Email",
      html: "<p>Este é um email de teste para validar a configuração do Gmail.</p>",
    });

    expect(result).toBe(true);
  });

  it("should send email with PDF attachment", async () => {
    const pdfBuffer = Buffer.from("Test PDF content");
    
    const result = await sendEmail({
      to: "sondamediagnosticoespiritual@gmail.com",
      subject: "Teste com Anexo",
      html: "<p>Email com anexo de teste.</p>",
      attachments: [
        {
          filename: "test.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    expect(result).toBe(true);
  });
});
