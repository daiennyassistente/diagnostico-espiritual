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
  contentName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
    if (!accessToken) {
      console.error("[Meta Conversions API] Access token not configured");
      return { success: false, error: "Access token not configured" };
    }

    // Get Pixel ID from environment
    const pixelId = process.env.VITE_ANALYTICS_WEBSITE_ID;
    if (!pixelId) {
      console.error("[Meta Conversions API] Pixel ID not configured");
      return { success: false, error: "Pixel ID not configured" };
    }

    // Create unique event ID based on transaction ID to prevent duplicates
    const eventId = `${transactionId}-${Date.now()}`;

    // Prepare conversion event
    const event: ConversionEvent = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: "https://diagnosticoespiritual.manus.space/checkout-success",
      user_data: {
        em: hashData(email),
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
          test_event_code: process.env.NODE_ENV === "development" ? "TEST123" : undefined,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta Conversions API] Error sending event:", result);
      return { success: false, error: result.error?.message || "Failed to send event" };
    }

    console.log("[Meta Conversions API] Event sent successfully:", {
      eventId,
      email,
      amount,
      transactionId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("[Meta Conversions API] Exception:", error);
    return { success: false, error: error.message };
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
