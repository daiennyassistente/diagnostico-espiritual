import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';

interface UseMetaQuizEventsProps {
  hasStarted: boolean;
  isQuizComplete: boolean;
  leadData: {
    name: string;
    whatsapp: string;
    email: string;
  };
  leadId?: number;
}

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos

export function useMetaQuizEvents({
  hasStarted,
  isQuizComplete,
  leadData,
  leadId = 0,
}: UseMetaQuizEventsProps) {
  const sendMetaEventMutation = trpc.quiz.sendMetaEvent.useMutation();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const quizStartedRef = useRef(false);
  const quizCompletedRef = useRef(false);
  const abandonedRef = useRef(false);

  // Disparar evento QuizStarted quando o quiz é iniciado
  useEffect(() => {
    if (hasStarted && !quizStartedRef.current) {
      quizStartedRef.current = true;
      console.log('[Meta CAPI] Disparando evento QuizStarted');
      
      sendMetaEventMutation.mutate({
        eventName: 'QuizStarted',
        leadId: leadId || 0,
        email: leadData.email,
        phone: leadData.whatsapp,
        firstName: leadData.name,
        sourceUrl: window.location.href,
      });

      // Resetar timeout de inatividade quando quiz é iniciado
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      // Configurar novo timeout para detectar abandono por inatividade
      inactivityTimeoutRef.current = setTimeout(() => {
        if (!quizCompletedRef.current && !abandonedRef.current) {
          console.log('[Meta CAPI] Disparando evento QuizAbandoned (inatividade)');
          abandonedRef.current = true;
          
          sendMetaEventMutation.mutate({
            eventName: 'QuizAbandoned',
            leadId: leadId || 0,
            email: leadData.email,
            phone: leadData.whatsapp,
            firstName: leadData.name,
            reason: 'inactivity',
            sourceUrl: window.location.href,
          });
        }
      }, INACTIVITY_TIMEOUT);
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [hasStarted, leadData.email, leadData.whatsapp, leadId, sendMetaEventMutation]);

  // Disparar evento QuizCompleted quando o quiz é completado
  useEffect(() => {
    if (!isQuizComplete || quizCompletedRef.current || leadId <= 0) {
      return;
    }

    quizCompletedRef.current = true;
    console.log('[Meta CAPI] Disparando evento QuizCompleted');

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    sendMetaEventMutation.mutate({
      eventName: 'QuizCompleted',
      leadId,
      email: leadData.email,
      phone: leadData.whatsapp,
      firstName: leadData.name,
      sourceUrl: window.location.href,
    });
  }, [isQuizComplete, leadId, leadData.email, leadData.whatsapp, leadData.name, sendMetaEventMutation]);

  // Disparar evento QuizAbandoned quando a página é fechada ou o usuário sai
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasStarted && !quizCompletedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        console.log('[Meta CAPI] Disparando evento QuizAbandoned (beforeunload)');
        
        // Usar sendBeacon para garantir que o evento seja enviado mesmo com a página fechando
        sendMetaEventMutation.mutate({
          eventName: 'QuizAbandoned' as const,
          leadId: leadId || 0,
          email: leadData.email,
          phone: leadData.whatsapp,
          firstName: leadData.name,
          reason: 'page_unload',
          sourceUrl: window.location.href,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && !quizCompletedRef.current && !abandonedRef.current) {
        console.log('[Meta CAPI] Página minimizada/oculta - disparando QuizAbandoned');
        abandonedRef.current = true;

        sendMetaEventMutation.mutate({
          eventName: 'QuizAbandoned',
          leadId: leadId || 0,
          email: leadData.email,
          phone: leadData.whatsapp,
          firstName: leadData.name,
          reason: 'visibility_hidden',
          sourceUrl: window.location.href,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasStarted, leadData.email, leadData.whatsapp, leadId, sendMetaEventMutation]);
}
