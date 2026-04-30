/**
 * Facebook Click ID (fbclid) Management
 * Captures and persists fbclid from URL to _fbc cookie for improved event matching
 */

const DEBUG = process.env.NODE_ENV === 'development';

interface FbcCookie {
  version: number;
  timestamp: number;
  fbclid: string;
}

/**
 * Get fbclid from URL parameters
 */
export function getFbclidFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('fbclid');
  } catch (error) {
    if (DEBUG) console.error('[fbclid] Error parsing URL:', error);
    return null;
  }
}

/**
 * Format fbclid into _fbc cookie format
 * Format: fb.1.<timestamp>.<fbclid>
 */
export function formatFbcCookie(fbclid: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `fb.1.${timestamp}.${fbclid}`;
}

/**
 * Set _fbc cookie with fbclid value
 */
export function setFbcCookie(fbclid: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const fbcValue = formatFbcCookie(fbclid);
    
    // Set cookie with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    document.cookie = `_fbc=${encodeURIComponent(fbcValue)}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
    
    if (DEBUG) {
      console.log('[fbclid] _fbc cookie set:', fbcValue);
    }
  } catch (error) {
    if (DEBUG) console.error('[fbclid] Error setting _fbc cookie:', error);
  }
}

/**
 * Get _fbc cookie value
 */
export function getFbcCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbc' && value) {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    if (DEBUG) console.error('[fbclid] Error reading _fbc cookie:', error);
  }
  
  return null;
}

/**
 * Initialize fbclid tracking
 * Captures fbclid from URL and stores in _fbc cookie if not already set
 */
export function initializeFbclidTracking(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if _fbc cookie already exists
    const existingFbc = getFbcCookie();
    if (existingFbc) {
      if (DEBUG) {
        console.log('[fbclid] Existing _fbc cookie found:', existingFbc);
      }
      return;
    }
    
    // Try to capture fbclid from URL
    const fbclid = getFbclidFromUrl();
    if (fbclid) {
      setFbcCookie(fbclid);
      if (DEBUG) {
        console.log('[fbclid] Captured fbclid from URL:', fbclid);
      }
    } else if (DEBUG) {
      console.log('[fbclid] No fbclid found in URL');
    }
  } catch (error) {
    if (DEBUG) console.error('[fbclid] Initialization error:', error);
  }
}

/**
 * Get advanced matching data from user inputs
 * Hashes email and phone for Facebook's advanced matching
 */
export function getAdvancedMatchingData(email?: string, phone?: string): Record<string, string> {
  const data: Record<string, string> = {};
  
  if (email) {
    try {
      // Hash email using SHA-256 (Facebook expects lowercase, trimmed)
      const normalizedEmail = email.toLowerCase().trim();
      data.em = normalizedEmail; // fbq will hash automatically with advanced matching enabled
    } catch (error) {
      if (DEBUG) console.error('[fbclid] Error processing email:', error);
    }
  }
  
  if (phone) {
    try {
      // Normalize phone (remove non-digits)
      const normalizedPhone = phone.replace(/\D/g, '');
      data.ph = normalizedPhone; // fbq will hash automatically with advanced matching enabled
    } catch (error) {
      if (DEBUG) console.error('[fbclid] Error processing phone:', error);
    }
  }
  
  return data;
}

/**
 * Track event with advanced matching data
 * Automatically includes _fbc from cookie
 */
export function trackEventWithAdvancedMatching(
  eventName: string,
  eventData?: Record<string, any>,
  email?: string,
  phone?: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq === 'undefined') {
    if (DEBUG) console.warn('[fbclid] fbq not available');
    return;
  }
  
  try {
    const fbc = getFbcCookie();
    const advancedMatching = getAdvancedMatchingData(email, phone);
    
    const payload = {
      ...eventData,
      ...advancedMatching,
      ...(fbc && { fbc }),
    };
    
    if (DEBUG) {
      console.log(`[fbclid] Tracking ${eventName}:`, {
        eventName,
        hasAdvancedMatching: Object.keys(advancedMatching).length > 0,
        hasFbc: !!fbc,
      });
    }
    
    window.fbq('track', eventName, payload);
  } catch (error) {
    if (DEBUG) console.error('[fbclid] Error tracking event:', error);
  }
}
