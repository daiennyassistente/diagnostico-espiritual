/**
 * Meta Conversions API Integration
 * Sends conversion events (Purchase) directly to Meta's server-side API
 */

import crypto from "crypto";

interface ConversionEvent {
  event_name: "Purchase";
  event_time: number;
  event_id: string;
  event_source_url: string;
  user_data: {
    em?: string; // Email hashed
    ph?: string; // Phone hashed
    fn?: string; // First name hashed
  };
  custom_data: {
    value: number;
    currency: string;
    content_name?: string;
    content_type?: string;
  };
}

/**
 * Hash email or phone for Meta Conversions API
 */
function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

/**
 * Send Purchase event to Meta Conversions API
 */
export async function sendMetaConversionEvent(
  email: string,
  amount: number,
  transactionId: string,
  contentName?: string,
  phone?: string,
  firstName?: string
): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
    if (!accessToken) {
      console.error("[Meta Conversions API] Access token not configured");
      return { success: false, error: "Access token not configured", eventId: undefined };
    }

    // Get Pixel ID from environment
    const pixelId = process.env.VITE_ANALYTICS_WEBSITE_ID;
    if (!pixelId) {
      console.error("[Meta Conversions API] Pixel ID not configured");
      return { success: false, error: "Pixel ID not configured", eventId: undefined };
    }

    // Create unique event ID based on transaction ID to prevent duplicates
    // Format: purchase_{transactionId} for perfect deduplication between frontend and backend
    const eventId = `purchase_${transactionId}`;

    // Prepare conversion event
    const event: ConversionEvent = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: "https://diagnosticoespiritual.manus.space/sucesso",
      user_data: {
        em: hashData(email),
        ...(phone && { ph: hashData(phone) }),
        ...(firstName && { fn: hashData(firstName) }),
      },
      custom_data: {
        value: amount,
        currency: "BRL",
        content_name: contentName || "Devocional Personalizado",
        content_type: "product",
      },
    };

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [event],
          test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta Conversions API] Error sending event:", result);
      console.error("[Meta Conversions API] Response:", JSON.stringify(result, null, 2));
      return { success: false, error: result.error?.message || "Failed to send event" };
    }

    console.log("[Meta Conversions API] Event sent successfully:", {
      eventId,
      email: email.substring(0, 3) + "***",
      amount,
      transactionId,
      response: result,
    });
    console.log("[Meta Conversions API] Full Response:", JSON.stringify(result, null, 2));

    return { success: true, eventId };
  } catch (error: any) {
    console.error("[Meta Conversions API] Exception:", error);
    return { success: false, error: error.message, eventId: undefined };
  }
}

/**
 * Validate Meta Conversions API configuration
 */
export function validateMetaConversionsConfig(): boolean {
  const hasToken = !!process.env.META_CONVERSIONS_API_TOKEN;
  const hasPixelId = !!process.env.VITE_ANALYTICS_WEBSITE_ID;

  if (!hasToken) {
    console.warn("[Meta Conversions API] Access token not configured");
  }
  if (!hasPixelId) {
    console.warn("[Meta Conversions API] Pixel ID not configured");
  }

  return hasToken && hasPixelId;
}
