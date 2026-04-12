import Twilio from "twilio";
import { ENV } from "./env";

const client = Twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);

export interface SendWhatsAppOptions {
  to: string; // Número do usuário com código do país (ex: +5511987654321)
  message?: string;
  mediaUrl?: string; // URL do PDF ou arquivo
  mediaType?: string; // Tipo de mídia (ex: application/pdf)
}

/**
 * Normaliza número de WhatsApp para formato internacional (+55...)
 */
function normalizeWhatsAppNumber(phoneNumber: string): string {
  // Remove caracteres especiais
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // Se não começar com código do país, adiciona +55
  if (!phoneNumber.includes('+') && !normalized.startsWith('55')) {
    normalized = '55' + normalized;
  }
  
  // Garante que começa com +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Envia uma mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  try {
    if (!ENV.twilioWhatsappNumber || !ENV.twilioAccountSid) {
      console.error("[Twilio] Credenciais não configuradas");
      return false;
    }

    const normalizedTo = normalizeWhatsAppNumber(to);
    const result = await client.messages.create({
      from: `whatsapp:${ENV.twilioWhatsappNumber}`,
      to: `whatsapp:${normalizedTo}`,
      body: message,
    });

    console.log(`[Twilio] Mensagem enviada com sucesso: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("[Twilio] Erro ao enviar mensagem:", error);
    return false;
  }
}

/**
 * Envia um arquivo (PDF, imagem, etc) via WhatsApp
 */
export async function sendWhatsAppFile(
  to: string,
  fileUrl: string,
  message?: string
): Promise<boolean> {
  try {
    if (!ENV.twilioWhatsappNumber || !ENV.twilioAccountSid) {
      console.error("[Twilio] Credenciais não configuradas");
      return false;
    }

    const normalizedTo = normalizeWhatsAppNumber(to);
    const result = await client.messages.create({
      from: `whatsapp:${ENV.twilioWhatsappNumber}`,
      to: `whatsapp:${normalizedTo}`,
      body: message || "Seu arquivo está pronto!",
      mediaUrl: [fileUrl],
    });

    console.log(`[Twilio] Arquivo enviado com sucesso: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("[Twilio] Erro ao enviar arquivo:", error);
    return false;
  }
}

/**
 * Envia mensagem com PDF do devocional após pagamento
 */
export async function sendDevocionalPdfViaWhatsApp(
  phoneNumber: string,
  pdfUrl: string,
  userName?: string
): Promise<boolean> {
  try {
    const greeting = userName ? `Olá ${userName}!` : "Olá!";
    const message = `${greeting} 🎉\n\nParabéns pela sua compra! Seu devocional de 7 dias está pronto.\n\nAcesse o PDF anexado e comece sua jornada espiritual agora mesmo!\n\n✨ Que Deus abençoe seus próximos dias!`;

    return await sendWhatsAppFile(phoneNumber, pdfUrl, message);
  } catch (error) {
    console.error("[Twilio] Erro ao enviar devocional:", error);
    return false;
  }
}

/**
 * Testa a conexão com Twilio
 */
export async function testTwilioConnection(): Promise<boolean> {
  try {
    if (!ENV.twilioAccountSid || !ENV.twilioAuthToken) {
      console.error("[Twilio] Credenciais não configuradas");
      return false;
    }

    // Tenta buscar informações da conta
    const account = await client.api.accounts(ENV.twilioAccountSid).fetch();
    console.log(`[Twilio] Conexão bem-sucedida! Conta: ${account.friendlyName}`);
    return true;
  } catch (error) {
    console.error("[Twilio] Erro ao conectar:", error);
    return false;
  }
}
