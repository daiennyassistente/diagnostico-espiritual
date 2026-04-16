import { describe, it, expect } from "vitest";
import { sendEmail } from "./email-service";
import { generateDevotionalPDF } from "./devotional-generator";
import { getDiagnosticByLeadId, getQuizResponseByLeadId, getLeadById } from "./db";

describe("Send Devotional Email - Santos", () => {
  it("should send devotional email to daiennyassistente@gmail.com", async () => {
    // Get lead
    const lead = await getLeadById(1620015);
    expect(lead).toBeDefined();
    expect(lead?.name).toContain("Santos");

    // Get diagnostic
    const diagnostic = await getDiagnosticByLeadId(1620015);
    expect(diagnostic).toBeDefined();

    // Get quiz responses
    const quizResponse = await getQuizResponseByLeadId(1620015);
    const responses: Record<string, string> = quizResponse
      ? Object.fromEntries(
          Object.entries(quizResponse)
            .filter(([key, value]) => /^step\d+$/.test(key) && typeof value === "string" && value.trim().length > 0)
            .map(([key, value]) => [key, String(value)])
        )
      : {};

    // Generate PDF
    const pdfBuffer = await generateDevotionalPDF({
      profileName: diagnostic!.profileName,
      profileDescription: diagnostic!.profileDescription,
      challenges: JSON.parse(diagnostic!.challenges),
      recommendations: JSON.parse(diagnostic!.recommendations),
      strengths: JSON.parse(diagnostic!.strengths),
      nextSteps: JSON.parse(diagnostic!.nextSteps),
      responses,
      userName: responses.step1,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Send email
    const emailSent = await sendEmail({
      to: "daiennyassistente@gmail.com",
      subject: `Seu Devocional Personalizado - ${diagnostic!.profileName}`,
      html: `
        <p>Olá ${lead?.name},</p>
        <p>Seu devocional personalizado de 7 dias está em anexo!</p>
        <p>Este material foi especialmente preparado para você com base no seu diagnóstico espiritual.</p>
        <p>Bênçãos!</p>
      `,
      attachments: [
        {
          filename: `devocional-${diagnostic!.profileName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    expect(emailSent).toBe(true);
  });
});
