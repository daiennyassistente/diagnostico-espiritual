/**
 * Meta Pixel Tracking Utilities
 * Provides functions to track events in Meta Pixel with proper deduplication
 * 
 * NOTA: Os eventos QuizStarted, QuizCompleted, QuizAbandoned são enviados
 * via Meta Conversions API (server-side) através do hook useMetaQuizEvents
 * Este arquivo mantém apenas o evento Purchase que é disparado após pagamento
 */

/**
 * Track a Meta Pixel event
 */
export function trackMetaPixelEvent(
  eventName: string,
  eventData?: Record<string, any>,
  eventId?: string
): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (!fbq) {
    console.warn(`[Meta Pixel] fbq não disponível para rastrear ${eventName}`);
    return;
  }
  try {
    const options = eventId ? { eventID: eventId } : {};
    fbq('track', eventName, eventData || {}, options);
    console.log(`[Meta Pixel] Evento ${eventName} rastreado:`, {
      eventData,
      eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[Meta Pixel] Erro ao rastrear ${eventName}:`, error);
  }
}

/**
 * Track ViewContent event (quando usuário visualiza o quiz)
 * NOTA: Este evento é opcional e pode ser removido se não for necessário
 */
export function trackViewContent(): void {
  trackMetaPixelEvent('ViewContent', {
    content_name: 'Diagnóstico Espiritual Quiz',
    content_type: 'product',
    currency: 'BRL',
    value: 12.90,
  });
}

/**
 * Track Lead event (quando usuário submete lead)
 * NOTA: Este evento é disparado após submissão do formulário de lead
 */
export function trackLead(email?: string, phone?: string): void {
  trackMetaPixelEvent('Lead', {
    content_name: 'Diagnóstico Espiritual',
    currency: 'BRL',
    value: 12.90,
    ...(email && { email }),
    ...(phone && { phone_number: phone }),
  });
}

/**
 * Track InitiateCheckout event (quando usuário inicia checkout)
 */
export function trackInitiateCheckout(amount: number = 12.90): void {
  trackMetaPixelEvent('InitiateCheckout', {
    content_name: 'Devocional Personalizado',
    content_type: 'product',
    currency: 'BRL',
    value: amount,
  });
}

/**
 * Track Purchase event (quando pagamento é confirmado)
 * Usa eventId para deduplicação perfeita entre frontend e backend
 */
export function trackPurchase(
  amount: number,
  transactionId: string,
  productName?: string
): void {
  const eventId = `purchase_${transactionId}`;
  trackMetaPixelEvent(
    'Purchase',
    {
      value: amount,
      currency: 'BRL',
      content_name: productName || 'Devocional Personalizado',
      content_type: 'product',
    },
    eventId
  );
}
