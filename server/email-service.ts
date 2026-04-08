import nodemailer from "nodemailer";
import { generateDevotionalPDF } from "./devotional-generator";

// Configurar transporter de email
// Usando variáveis de ambiente para SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    // Se SMTP não está configurado, apenas logar
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("[Email] SMTP not configured, logging email instead:");
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });

    console.log(`[Email] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error(`[Email] Failed to send email: ${error.message}`);
    return false;
  }
}

export async function sendDevotionalConfirmationEmail(
  email: string,
  profileName: string,
  downloadLink: string
): Promise<boolean> {
  try {
    // Gerar PDF devocional
    const pdfBuffer = await generateDevotionalPDF({
      profileName,
      profileDescription: "Seu devocional personalizado",
      challenges: [],
      recommendations: [],
    });

    // Template HTML do email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A3F35; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #F5F1EA; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4A3F35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🙏 Seu Devocional Chegou!</h1>
            </div>
            
            <div class="content">
              <p>Olá,</p>
              
              <p>Obrigado por sua compra! Seu devocional personalizado de 7 dias foi gerado especialmente para você.</p>
              
              <p><strong>Seu Perfil Espiritual:</strong> ${profileName}</p>
              
              <p>O PDF está anexado neste email e também disponível para download no link abaixo:</p>
              
              <a href="${downloadLink}" class="button">Baixar Meu Devocional</a>
              
              <p><strong>O que você vai receber:</strong></p>
              <ul>
                <li>✨ 7 dias de reflexões personalizadas</li>
                <li>📖 Versículos bíblicos selecionados</li>
                <li>🙏 Orações direcionadas para seu perfil</li>
                <li>💭 Reflexões profundas e aplicações práticas</li>
              </ul>
              
              <p><strong>Como usar:</strong></p>
              <ol>
                <li>Reserve um tempo tranquilo cada dia</li>
                <li>Leia o versículo e a reflexão</li>
                <li>Medite na oração sugerida</li>
                <li>Aplique o aprendizado em sua vida</li>
              </ol>
              
              <p>Que Deus abençoe sua jornada espiritual! 🙏</p>
            </div>
            
            <div class="footer">
              <p>© 2026 Diagnóstico Espiritual. Todos os direitos reservados.</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject: `🙏 Seu Devocional Personalizado - ${profileName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `devocional-${profileName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error: any) {
    console.error(`[Email] Failed to send devotional email: ${error.message}`);
    return false;
  }
}

export async function sendWelcomeEmail(email: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4A3F35; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #F5F1EA; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao Diagnóstico Espiritual!</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            <p>Obrigado por participar do nosso diagnóstico espiritual!</p>
            <p>Em breve você receberá seu resultado personalizado e seu devocional exclusivo.</p>
          </div>
          
          <div class="footer">
            <p>© 2026 Diagnóstico Espiritual. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: "Bem-vindo ao Diagnóstico Espiritual!",
    html: htmlContent,
  });
}
