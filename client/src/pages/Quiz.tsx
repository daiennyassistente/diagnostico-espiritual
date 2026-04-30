import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { WhatsAppReferralButton } from '@/components/WhatsAppReferralButton';
import { trackViewContent, trackLead } from '@/lib/metaPixelTracking';
import { useMetaQuizEvents } from '@/hooks/useMetaQuizEvents';

interface QuizStep {
  id: number;
  question: string;
  options: string[];
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    question: 'Como você se sente espiritualmente hoje?',
    options: [
      'Próxima de Deus',
      'Distante e querendo voltar',
      'Com sede, mas sem direção',
      'Cansada espiritualmente',
      'Em processo de recomeço',
    ],
  },
  {
    id: 2,
    question: 'O que mais tem dificultado sua constância com Deus?',
    options: [
      'Distrações',
      'Cansaço',
      'Desânimo',
      'Falta de disciplina',
      'Confusão mental/emocional',
      'Rotina corrida',
    ],
  },
  {
    id: 3,
    question: 'Como está sua rotina com a Palavra?',
    options: [
      'Frequente e profunda',
      'Frequente, mas superficial',
      'Irregular',
      'Quase parada',
      'Quero voltar, mas não consigo manter',
    ],
  },
  {
    id: 4,
    question: 'Como você descreveria sua vida de oração hoje?',
    options: [
      'Sincera, mas instável',
      'Muito emocional e pouco constante',
      'Quase inexistente',
      'Quero voltar a orar com profundidade',
      'Viva e constante',
    ],
  },
  {
    id: 5,
    question: 'O que você mais sente falta hoje na sua vida com Deus?',
    options: [
      'Intimidade',
      'Constância',
      'Direção',
      'Paz',
      'Sensibilidade espiritual',
      'Profundidade',
    ],
  },
  {
    id: 6,
    question: 'O que você sente que mais tem sido tratado em você nessa fase?',
    options: [
      'Disciplina',
      'Espera',
      'Cura emocional',
      'Identidade',
      'Obediência',
      'Vigilância',
      'Maturidade',
    ],
  },
  {
    id: 7,
    question: 'O que você mais deseja viver com Deus agora?',
    options: [
      'Voltar ao secreto',
      'Criar constância',
      'Ouvir melhor a voz de Deus',
      'Amadurecer espiritualmente',
      'Ter mais paz e alinhamento',
    ],
  },
  {
    id: 8,
    question: 'Quanto tempo por dia você consegue dedicar com intencionalidade?',
    options: [
      '5 minutos',
      '10 minutos',
      '15 minutos',
      '20 minutos ou mais',
    ],
  },
  {
    id: 9,
    question: 'Qual é sua maior dificuldade?',
    options: [
      'Emocional',
      'De disciplina',
      'De foco',
      'De profundidade',
      'De direção',
    ],
  },
  {
    id: 10,
    question: 'Como você se descreve espiritualmente neste momento?',
    options: [
      'Com fome de Deus',
      'Cansada',
      'Travada',
      'Em reconstrução',
      'Amadurecendo',
      'Precisando recomeçar',
    ],
  },
  {
    id: 11,
    question: 'Algo que você queira acrescentar ou desabafar?',
    options: [], // Campo de texto livre
  },
];

const PROCESSING_MESSAGES = [
  'Analisando suas respostas...',
  'Identificando padrões de constância, profundidade, direção e bloqueios espirituais...',
  'Organizando a direção mais indicada para você...',
  'Seu diagnóstico está pronto!',
];

const readSessionJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const storedValue = window.sessionStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    return fallback;
  }
};

const readSessionNumber = (key: string, fallback: number) => {
  if (typeof window === 'undefined') return fallback;

  const storedValue = window.sessionStorage.getItem(key);
  const parsedValue = storedValue ? Number(storedValue) : fallback;
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const readRecentNavigationFlag = () => {
  if (typeof window === 'undefined') return false;

  const startedAt = Number(window.sessionStorage.getItem('quizNavigationStartedAt') || '0');
  const isFlagged = window.sessionStorage.getItem('quizIsNavigatingToResult') === '1';

  return isFlagged && Date.now() - startedAt < 15000;
};

const readRecentProcessingFlag = () => {
  if (typeof window === 'undefined') return false;

  const startedAt = Number(window.sessionStorage.getItem('quizProcessingStartedAt') || '0');
  const isFlagged = window.sessionStorage.getItem('quizIsProcessing') === '1';

  return isFlagged && Date.now() - startedAt < 30000;
};

const readPendingResultRedirect = () => {
  if (typeof window === 'undefined') return false;

  const startedAt = Number(window.sessionStorage.getItem('quizPendingResultRedirectAt') || '0');
  const isFlagged = window.sessionStorage.getItem('quizPendingResultRedirect') === '1';

  return isFlagged && Date.now() - startedAt < 15000;
};

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(() => readSessionNumber('quizCurrentStep', 0));
  const [responses, setResponses] = useState<Record<number, string>>(() =>
    readSessionJSON<Record<number, string>>('quizResponsesDraft', {})
  );
  const [showLeadForm, setShowLeadForm] = useState(() => readSessionJSON<boolean>('quizShowLeadForm', false));
  const [isProcessing, setIsProcessing] = useState(() => readRecentProcessingFlag());
  const [processingStep, setProcessingStep] = useState(() => readSessionNumber('quizProcessingStep', 0));
  const [leadData, setLeadData] = useState(() =>
    readSessionJSON('quizLeadDraft', { name: '', whatsapp: '', email: '' })
  );
  const [hasStarted, setHasStarted] = useState(() => {
    const storedStarted = readSessionJSON<boolean>('quizHasStarted', false);
    const storedStep = readSessionNumber('quizCurrentStep', 0);
    const storedResponses = readSessionJSON<Record<number, string>>('quizResponsesDraft', {});

    return storedStarted || storedStep > 0 || Object.keys(storedResponses).length > 0;
  });
  const [isNavigatingToResult, setIsNavigatingToResult] = useState(() => readRecentNavigationFlag() || readPendingResultRedirect());
  const [quizId] = useState(() => {
    const storedQuizId = sessionStorage.getItem('quizId');
    if (storedQuizId) return storedQuizId;
    const newQuizId = uuidv4();
    sessionStorage.setItem('quizId', newQuizId);
    return newQuizId;
  });
  const [userId] = useState(() => {
    // Gerar novo userId a cada entrada, mesmo que seja a mesma pessoa
    const newUserId = uuidv4();
    return newUserId;
  });
  
  const [submittedLeadId, setSubmittedLeadId] = useState<number>(0);
  const [hasClickedFinish, setHasClickedFinish] = useState(() =>
    readSessionJSON<boolean>('quizHasClickedFinish', false)
  );

  // Integrar eventos de quiz com Meta CAPI
  useMetaQuizEvents({
    hasStarted: hasStarted && !isNavigatingToResult,
    isQuizComplete: hasClickedFinish,
    leadData,
    leadId: submittedLeadId,
  });
  const [viewContentTracked, setViewContentTracked] = useState(false);
  const [showInitialScreen, setShowInitialScreen] = useState(() => {
    const storedShowInitial = readSessionJSON<boolean>('quizShowInitialScreen', true);
    return storedShowInitial;
  });
  const advanceTimeoutRef = useRef<number | null>(null);

  const submitLeadMutation = trpc.quiz.submitLead.useMutation();
  const submitResponsesMutation = trpc.quiz.submitResponses.useMutation();

  const isQuizComplete = currentStep >= QUIZ_STEPS.length;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem('quizCurrentStep', String(currentStep));
    window.sessionStorage.setItem('quizResponsesDraft', JSON.stringify(responses));
    window.sessionStorage.setItem('quizShowLeadForm', JSON.stringify(showLeadForm));
    window.sessionStorage.setItem('quizLeadDraft', JSON.stringify(leadData));
    window.sessionStorage.setItem('quizHasStarted', JSON.stringify(hasStarted));
    window.sessionStorage.setItem('quizHasClickedFinish', JSON.stringify(hasClickedFinish));
  }, [currentStep, responses, showLeadForm, leadData, hasStarted, hasClickedFinish]);

  // Nota: Evento QuizStarted é disparado via useMetaQuizEvents apenas
  // quando o usuário realmente inicia o quiz por clique ou interação.

  // Disparar evento ViewContent quando o quiz é visualizado
  useEffect(() => {
    if (!viewContentTracked && hasStarted && currentStep === 1) {
      trackViewContent();
      setViewContentTracked(true);
      // [Otimização] console.log removido
    }
  }, [viewContentTracked, hasStarted, currentStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isNavigatingToResult) {
      window.sessionStorage.setItem('quizIsNavigatingToResult', '1');
      window.sessionStorage.setItem('quizNavigationStartedAt', String(Date.now()));
      return;
    }

    window.sessionStorage.removeItem('quizIsNavigatingToResult');
    window.sessionStorage.removeItem('quizNavigationStartedAt');
  }, [isNavigatingToResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isProcessing) {
      window.sessionStorage.setItem('quizIsProcessing', '1');
      window.sessionStorage.setItem('quizProcessingStartedAt', String(Date.now()));
      window.sessionStorage.setItem('quizProcessingStep', String(processingStep));
      return;
    }

    window.sessionStorage.removeItem('quizIsProcessing');
    window.sessionStorage.removeItem('quizProcessingStartedAt');
    window.sessionStorage.removeItem('quizProcessingStep');
  }, [isProcessing, processingStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!readPendingResultRedirect()) return;

    setHasStarted(true);
    setShowLeadForm(false);
    setIsProcessing(false);
    setIsNavigatingToResult(true);
    window.sessionStorage.setItem('quizIsNavigatingToResult', '1');
    window.sessionStorage.setItem('quizNavigationStartedAt', String(Date.now()));

    const redirectTimer = window.setTimeout(() => {
      const leadId = localStorage.getItem('quizLeadId');
      if (leadId) {
        setLocation(`/result?leadId=${leadId}`);
      } else {
        setLocation('/result');
      }
    }, 0);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [setLocation]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectOption = (option: string) => {
    const selectedStep = currentStep;

    setHasStarted(true);
    setResponses((previousResponses) => ({
      ...previousResponses,
      [selectedStep - 1]: option,
    }));

    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
    }

    // Avanço automático após 600ms para o usuário ver a seleção
    advanceTimeoutRef.current = window.setTimeout(() => {
      if (selectedStep < QUIZ_STEPS.length) {
        setCurrentStep((previousStep) => previousStep + 1);
      } else {
        setShowLeadForm(true);
      }
    }, 600);
  };

  const handleNext = () => {
    // Pergunta 12 (desabafo) é opcional, todas as outras são obrigatórias
    const isLastQuestion = currentStep === QUIZ_STEPS.length;
    if (!isLastQuestion && !responses[currentStep - 1]) {
      toast.error('Por favor, selecione uma opção para continuar');
      return;
    }

    setHasStarted(true);

    if (currentStep < QUIZ_STEPS.length) {
      setCurrentStep((previousStep) => previousStep + 1);
    } else {
      setHasClickedFinish(true);
      setShowLeadForm(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatWhatsApp = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    
    // Se o usuário digitou +55 no início, remove para processar
    if (value.startsWith('+55')) {
      cleaned = value.slice(3).replace(/\D/g, '');
    }
    
    // Se não começar com 55 e tiver menos de 11 dígitos, assume que é Brasil
    if (!cleaned.startsWith('55') && cleaned.length <= 11) {
      // Formata como (XX) XXXXX-XXXX com +55 no início
      if (cleaned.length === 0) return '+55 ';
      if (cleaned.length <= 2) return `+55 (${cleaned}`;
      if (cleaned.length <= 7) return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    // Se já tem 55 no início
    if (cleaned.startsWith('55')) {
      const withoutCountry = cleaned.slice(2);
      if (withoutCountry.length <= 2) return `+55 (${withoutCountry}`;
      if (withoutCountry.length <= 7) return `+55 (${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2)}`;
      return `+55 (${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7, 11)}`;
    }
    
    return `+55 ${cleaned}`;
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadData.name || !leadData.whatsapp || !leadData.email) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const whatsappRegex = /^(\d{10,15})$/;
    if (!whatsappRegex.test(leadData.whatsapp.replace(/\D/g, ''))) {
      toast.error('WhatsApp inválido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      toast.error('E-mail inválido');
      return;
    }

    let redirectedToResult = false;

    setHasStarted(true);
    setIsNavigatingToResult(false);
    setIsProcessing(true);
    setShowLeadForm(false);
    setProcessingStep(0);

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('quizIsProcessing', '1');
      window.sessionStorage.setItem('quizProcessingStartedAt', String(Date.now()));
      window.sessionStorage.setItem('quizProcessingStep', '0');
      window.sessionStorage.setItem('quizHasStarted', JSON.stringify(true));
      window.sessionStorage.setItem('quizShowLeadForm', JSON.stringify(false));
    }

    try {
      for (let i = 0; i < PROCESSING_MESSAGES.length; i++) {
        setProcessingStep(i);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('quizProcessingStep', String(i));
        }

        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Disparar evento Lead quando o lead é capturado
      trackLead(leadData.email, leadData.whatsapp.replace(/\D/g, ''));
      // [Otimização] console.log removido
      
      // Nota: Evento QuizCompleted será disparado via useMetaQuizEvents
      // quando currentStep >= QUIZ_STEPS.length (isQuizComplete = true)

      const leadResult = await submitLeadMutation.mutateAsync({
        userId: userId,
        whatsapp: leadData.whatsapp.replace(/\D/g, ''),
        email: leadData.email,
        name: leadData.name,
      });

      if (leadResult.success && leadResult.leadId) {
        // Atualizar leadId para o hook de eventos Meta
        setSubmittedLeadId(leadResult.leadId);
        
        const responsesData = {
          quizId: quizId,
          leadId: leadResult.leadId,
          step1: responses[0],
          step2: responses[1],
          step3: responses[2],
          step4: responses[3],
          step5: responses[4],
          step6: responses[5],
          step7: responses[6],
          step8: responses[7],
          step9: responses[8],
          step10: responses[9],
          step11: responses[10],
          step12: responses[11] || '', // Desabafo (opcional)
        };

        await submitResponsesMutation.mutateAsync(responsesData);

        localStorage.setItem('quizResponses', JSON.stringify(responses));
        localStorage.setItem('quizLeadId', String(leadResult.leadId));
        localStorage.setItem('leadData', JSON.stringify({
          leadId: leadResult.leadId,
          email: leadData.email,
          whatsapp: leadData.whatsapp.replace(/\D/g, ''),
        }));

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('quizIsNavigatingToResult', '1');
          window.sessionStorage.setItem('quizNavigationStartedAt', String(Date.now()));
          window.sessionStorage.setItem('quizPendingResultRedirect', '1');
          window.sessionStorage.setItem('quizPendingResultRedirectAt', String(Date.now()));
        }

        redirectedToResult = true;
        setIsNavigatingToResult(true);
        toast.success('Diagnóstico enviado com sucesso!');
        const leadId = leadResult.leadId;
        if (leadId) {
          setLocation(`/result?leadId=${leadId}`);
        } else {
          setLocation('/result');
        }
        return;
      }

      toast.error('Não foi possível salvar seus dados. Tente novamente.');
      setShowLeadForm(true);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast.error('Erro ao enviar dados. Tente novamente.');
      setShowLeadForm(true);
    } finally {
      if (!redirectedToResult) {
        setIsProcessing(false);
        setIsNavigatingToResult(false);
      }
    }
  };

  const hasPendingResultRedirect = readPendingResultRedirect();



  // Tela de processamento
  if (isProcessing || isNavigatingToResult || hasPendingResultRedirect) {
    const visibleProcessingStep = (isNavigatingToResult || hasPendingResultRedirect)
      ? PROCESSING_MESSAGES.length - 1
      : processingStep;
    const progress = ((visibleProcessingStep + 1) / PROCESSING_MESSAGES.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full text-center space-y-8 bg-white">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-primary">
              {PROCESSING_MESSAGES[visibleProcessingStep]}
            </h2>
            <p className="text-foreground/60">
              Processando seu diagnóstico espiritual...
            </p>
          </div>

          <div className="space-y-3">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                  transition: 'width 0.8s ease-in-out',
                }}
              />
            </div>
            <p className="text-sm text-foreground/60">
              {Math.round(progress)}%
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= visibleProcessingStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela de captura de leads
  if (showLeadForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full bg-white">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">
                Seu diagnóstico está pronto
              </h2>
              <p className="text-foreground/80">
                Informe seus dados para receber seu resultado e a orientação personalizada para esta fase.
              </p>
            </div>

            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground font-medium mb-2 block">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3 bg-card/90"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-foreground font-medium mb-2 block">
                  Número WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={leadData.whatsapp}
                  onChange={(e) => setLeadData({ ...leadData, whatsapp: formatWhatsApp(e.target.value) })}
                   className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3 bg-card/90"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground font-medium mb-2 block">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3 bg-card/90"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <input type="checkbox" id="consent" defaultChecked />
                <label htmlFor="consent">
                  Quero receber meu diagnóstico e orientações pelo WhatsApp e e-mail.
                </label>
              </div>

              <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold">
                Ver meu diagnóstico espiritual
              </Button>

              <p className="text-center text-xs text-foreground/60">
                Suas respostas serão usadas apenas para gerar seu diagnóstico personalizado.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Tela inicial do quiz
  if (hasStarted && currentStep === 0 && showInitialScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full bg-white">
          <div className="space-y-6 text-center">
            {/* Título */}
            <div className="inline-block bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-4">
              <p className="text-sm font-semibold text-primary">✨ Diagnóstico Gratuito</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Existe algo invisível travando sua vida...
            </h1>

            {/* Subtítulo */}
            <p className="text-lg text-foreground/80">
              Descubra em menos de 2 minutos se há um bloqueio espiritual impedindo sua paz e direção 🙏
            </p>

            {/* Texto de apoio */}
            <p className="text-sm text-foreground/60">
              ✨ Mais de 1.000 pessoas já fizeram esse diagnóstico
            </p>

            {/* Bullets */}
            <div className="space-y-3 my-8">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <span className="text-lg">✔</span>
                <span>Rápido</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground">
                <span className="text-lg">✔</span>
                <span>Confidencial</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground">
                <span className="text-lg">✔</span>
                <span>Resultado imediato ⚡</span>
              </div>
            </div>

            {/* Botão principal */}
            <Button
              onClick={() => {
                setShowInitialScreen(false);
                setHasClickedFinish(false);
                setHasStarted(true);
                setCurrentStep(1);
                // [Otimização] console.log removido
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 font-bold"
            >
              🔍 Começar diagnóstico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Telas do quiz
  if (currentStep > 0 && currentStep <= QUIZ_STEPS.length) {
    const step = QUIZ_STEPS[currentStep - 1];
    const progress = (currentStep / QUIZ_STEPS.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full bg-white">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-foreground/60 text-center">
              Etapa {currentStep} de {QUIZ_STEPS.length}
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {step.question}
            </h2>

            {/* Options or Text Input */}
            {step.options.length > 0 ? (
              <div className="space-y-3">
                {step.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(option)}
                    className={`quiz-button ${
                      responses[currentStep - 1] === option ? 'selected' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                placeholder={currentStep === 1 ? 'Digite seu nome aqui...' : 'Escreva aqui o que você queira acrescentar ou desabafar...'}
                value={responses[currentStep - 1] || ''}
                onChange={(e) => {
                  setResponses((prev) => ({
                    ...prev,
                    [currentStep - 1]: e.target.value,
                  }));
                  setHasStarted(true);
                }}
                className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3 w-full min-h-[100px] resize-none bg-card/90"
              />
            )}
          </div>

          {/* Microcopy de confiança */}
          <div className="text-center mb-6">
            <p className="text-xs text-foreground/60">
              Suas respostas são 100% confidenciais 🙏
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1 border-primary/30 text-primary hover:bg-primary/8"
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStep === QUIZ_STEPS.length ? 'Finalizar' : 'Continuar'} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tela inicial (antes do quiz começar)
  if (!hasStarted && currentStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full bg-white">
          <div className="space-y-8 text-center">
            {/* Ícone/Emoji */}
            <div className="text-6xl">🙏</div>

            {/* Título principal */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-primary">
                Existe algo invisível travando sua vida...
              </h1>
              <p className="text-lg text-foreground/80 font-medium">
                Descubra em menos de 2 minutos se há um bloqueio espiritual impedindo sua paz e direção 🙏
              </p>
            </div>

            {/* Texto de apoio */}
            <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
              <p className="text-sm text-foreground/70">
                ✨ Mais de 1.000 pessoas já fizeram esse diagnóstico
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✔</span>
                <span className="text-foreground">Rápido</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✔</span>
                <span className="text-foreground">Confidencial</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✔</span>
                <span className="text-foreground">Resultado imediato ⚡</span>
              </div>
            </div>

            {/* Botão principal */}
            <Button
              onClick={() => {
                setHasClickedFinish(false);
                setHasStarted(true);
                setCurrentStep(1);
                // [Otimização] console.log removido
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-lg text-sm md:text-lg font-semibold"
            >
              🔍 Começar diagnóstico
            </Button>

            {/* Texto de confiança */}
            <p className="text-xs text-foreground/60">
              Suas respostas são 100% confidenciais 🙏
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: se nenhum estado foi atingido, mostrar a tela inicial
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
      <div className="quiz-card max-w-2xl w-full bg-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Diagnóstico Espiritual
          </h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            Responda algumas perguntas rápidas para identificar possíveis bloqueios espirituais e descobrir o que pode estar travando sua vida.
          </p>
          <Button
            onClick={() => {
              setHasClickedFinish(false);
              setHasStarted(true);
              setCurrentStep(1);
            }}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold"
          >
            Quero começar meu diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
}
