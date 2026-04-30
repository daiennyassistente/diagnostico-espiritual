/**
 * Meta Conversions API Integration for Quiz Events
 * Sends quiz events (QuizStarted, QuizCompleted, QuizAbandoned) to Meta's server-side API
 * Also saves events to database for admin tracking
 */

import crypto from "crypto";
import { saveQuizEvent, getLatestQuizStatus } from "./quiz-events-db";

function getMetaPixelId(): string {
  if (typeof process.env.META_PIXEL_ID === "string") {
    return process.env.META_PIXEL_ID.trim();
  }
  return "948457397777180";
}

interface QuizConversionEvent {
  event_name: "QuizStarted" | "QuizCompleted" | "QuizAbandoned" | "Lead";
  event_time: number;
  event_id: string;
  event_source_url: string;
  user_data: {
    em?: string; // Email hashed
    ph?: string; // Phone hashed
    fn?: string; // First name hashed
    external_id?: string; // Lead ID
  };
  custom_data?: {
    profile_name?: string;
    current_step?: number;
    total_steps?: number;
    reason?: string;
    [key: string]: any;
  };
}

/**
 * Hash email or phone for Meta Conversions API
 */
function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

/**
 * Send Quiz event to Meta Conversions API and save to database
 */
export async function sendQuizMetaEvent(
  eventName: "QuizStarted" | "QuizCompleted" | "QuizAbandoned" | "Lead",
  leadId: number,
  email?: string,
  phone?: string,
  profileName?: string,
  currentStep?: number,
  totalSteps?: number,
  reason?: string,
  firstName?: string,
  sourceUrl?: string
): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
    if (!accessToken) {
      console.error("[Meta Quiz Events] Access token not configured");
      return { success: false, error: "Access token not configured" };
    }

    const pixelId = getMetaPixelId();
    if (!pixelId) {
      console.error("[Meta Quiz Events] Pixel ID not configured");
      return { success: false, error: "Pixel ID not configured" };
    }

    // Create unique event ID for deduplication
    const eventId = `quiz_${eventName}_${leadId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare quiz event
    const event: QuizConversionEvent = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || "https://diagnosticoespiritual.manus.space/quiz",
      user_data: {
        ...(email && { em: hashData(email) }),
        ...(phone && { ph: hashData(phone) }),
        ...(firstName && { fn: hashData(firstName) }),
        external_id: hashData(leadId.toString()),
      },
      custom_data: {
        ...(profileName && { profile_name: profileName }),
        ...(currentStep && { current_step: currentStep }),
        ...(totalSteps && { total_steps: totalSteps }),
        ...(reason && { reason: reason }),
      },
    };

    console.log(`[Meta Quiz Events] Preparando evento ${eventName}:`, {
      event_name: event.event_name,
      event_id: event.event_id,
      user_data: event.user_data,
      custom_data: event.custom_data,
    });

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
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

    console.log(`[Meta Quiz Events] Meta CAPI Response (${eventName}):`, {
      status: response.status,
      statusText: response.statusText,
      result: JSON.stringify(result, null, 2),
    });

    if (!response.ok) {
      console.error("[Meta Quiz Events] Error sending event:", result);
      return { success: false, error: result.error?.message || "Failed to send event" };
    }

    console.log(`[Meta Quiz Events] ${eventName} event sent successfully:`, {
      eventId,
      leadId,
      email: email ? email.substring(0, 3) + "***" : "N/A",
      response: result,
    });

    // Save event to database for admin tracking
    try {
      await saveQuizEvent(
        leadId,
        eventName,
        eventId,
        email,
        phone,
        profileName,
        currentStep,
        totalSteps,
        reason
      );
      console.log(`[Meta Quiz Events] Event saved to database for leadId ${leadId}`);
    } catch (dbError) {
      console.error(`[Meta Quiz Events] Error saving event to database:`, dbError);
      // Don't fail the whole operation if DB save fails
    }

    return { success: true, eventId };
  } catch (error: any) {
    console.error("[Meta Quiz Events] Exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current quiz status for a lead
 */
export async function getQuizStatusForLead(leadId: number): Promise<string | null> {
  try {
    return await getLatestQuizStatus(leadId);
  } catch (error) {
    console.error(`[Meta Quiz Events] Error getting quiz status for lead ${leadId}:`, error);
    return null;
  }
}

/**
 * Validate Meta Quiz Events configuration
 */
export function validateMetaQuizEventsConfig(): boolean {
  const hasToken = !!process.env.META_CONVERSIONS_API_TOKEN;
  const hasPixelId = !!getMetaPixelId();

  if (!hasToken) {
    console.warn("[Meta Quiz Events] Access token not configured");
  }
  if (!hasPixelId) {
    console.warn("[Meta Quiz Events] Pixel ID not configured");
  }

  return hasToken && hasPixelId;
}
