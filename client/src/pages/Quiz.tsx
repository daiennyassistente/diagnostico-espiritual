import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { v4 as uuidv4 } from 'uuid';
import { trackViewContent } from '@/lib/metaPixelTracking';
import { useMetaQuizEvents } from '@/hooks/useMetaQuizEvents';

declare global {
  interface Window {
    quizStarted?: boolean;
    quizCompleted?: boolean;
    fbq?: (action: string, eventName: string, data?: any) => void;
  }
}

interface QuizStep {
  id: number;
  question: string;
  options: string[];
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    question: 'Como você se sente espiritualmente hoje?',
    options: ['Próxima de Deus', 'Distante e querendo voltar', 'Com sede, mas sem direção', 'Cansada espiritualmente', 'Em processo de recomeço'],
  },
  {
    id: 2,
    question: 'O que mais tem dificultado sua constância com Deus?',
    options: ['Distrações', 'Cansaço', 'Desânimo', 'Falta de disciplina', 'Confusão mental/emocional', 'Rotina corrida'],
  },
  {
    id: 3,
    question: 'Como está sua rotina com a Palavra?',
    options: ['Frequente e profunda', 'Frequente, mas superficial', 'Irregular', 'Quase parada', 'Quero voltar, mas não consigo manter'],
  },
  {
    id: 4,
    question: 'Como você descreveria sua vida de oração hoje?',
    options: ['Sincera, mas instável', 'Muito emocional e pouco constante', 'Quase inexistente', 'Quero voltar a orar com profundidade', 'Viva e constante'],
  },
  {
    id: 5,
    question: 'O que você mais sente falta hoje na sua vida com Deus?',
    options: ['Intimidade', 'Constância', 'Direção', 'Paz', 'Sensibilidade espiritual', 'Profundidade'],
  },
  {
    id: 6,
    question: 'O que você sente que mais tem sido tratado em você nessa fase?',
    options: ['Disciplina', 'Espera', 'Cura emocional', 'Identidade', 'Obediência', 'Vigilância', 'Maturidade'],
  },
  {
    id: 7,
    question: 'O que você mais deseja viver com Deus agora?',
    options: ['Voltar ao secreto', 'Criar constância', 'Ouvir melhor a voz de Deus', 'Amadurecer espiritualmente', 'Ter mais paz e alinhamento'],
  },
  {
    id: 8,
    question: 'Quanto tempo por dia você consegue dedicar com intencionalidade?',
    options: ['5 minutos', '10 minutos', '15 minutos', '20 minutos ou mais'],
  },
  {
    id: 9,
    question: 'Qual é sua maior dificuldade?',
    options: ['Emocional', 'De disciplina', 'De foco', 'De profundidade', 'De direção'],
  },
  {
    id: 10,
    question: 'Como você se descreve espiritualmente neste momento?',
    options: ['Com fome de Deus', 'Cansada', 'Travada', 'Em reconstrução', 'Amadurecendo', 'Precisando recomeçar'],
  },
  {
    id: 11,
    question: 'Algo que você queira acrescentar ou desabafar?',
    options: [],
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
  } catch { return fallback; }
};

const readSessionNumber = (key: string, fallback: number) => {
  if (typeof window === 'undefined') return fallback;
  const storedValue = window.sessionStorage.getItem(key);
  const parsedValue = storedValue ? Number(storedValue) : fallback;
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(() => readSessionNumber('quizCurrentStep', 0));
  const [responses, setResponses] = useState<Record<number, string>>(() => readSessionJSON<Record<number, string>>('quizResponsesDraft', {}));
  const [showLeadForm, setShowLeadForm] = useState(() => readSessionJSON<boolean>('quizShowLeadForm', false));
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [leadData, setLeadData] = useState(() => readSessionJSON('quizLeadDraft', { name: '', whatsapp: '', email: '' }));
  const [hasStarted, setHasStarted] = useState(() => readSessionJSON<boolean>('quizHasStarted', false));
  const [hasClickedFinish, setHasClickedFinish] = useState(() => readSessionJSON<boolean>('quizHasClickedFinish', false));
  const [showInitialScreen, setShowInitialScreen] = useState(() => readSessionJSON<boolean>('quizShowInitialScreen', true));

  useMetaQuizEvents({
    hasStarted: hasStarted,
    isQuizComplete: hasClickedFinish,
    leadData,
    leadId: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem('quizCurrentStep', String(currentStep));
    window.sessionStorage.setItem('quizResponsesDraft', JSON.stringify(responses));
    window.sessionStorage.setItem('quizShowLeadForm', JSON.stringify(showLeadForm));
    window.sessionStorage.setItem('quizLeadDraft', JSON.stringify(leadData));
    window.sessionStorage.setItem('quizHasStarted', JSON.stringify(hasStarted));
    window.sessionStorage.setItem('quizHasClickedFinish', JSON.stringify(hasClickedFinish));
    window.sessionStorage.setItem('quizShowInitialScreen', JSON.stringify(showInitialScreen));
  }, [currentStep, responses, showLeadForm, leadData, hasStarted, hasClickedFinish, showInitialScreen]);

  const handleNext = () => {
    if (currentStep < QUIZ_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowInitialScreen(true);
      setHasStarted(false);
    }
  };

  const handleSelectOption = (option: string) => {
    setResponses({ ...responses, [currentStep - 1]: option });
    setTimeout(handleNext, 300);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full text-center space-y-8">
          <h2 className="text-2xl font-bold text-foreground">{PROCESSING_MESSAGES[processingStep]}</h2>
          <div className="flex gap-2 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= processingStep ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showLeadForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">Seu diagnóstico está pronto</h2>
              <p className="text-muted-foreground">Informe seus dados para receber seu resultado e a orientação personalizada para esta fase.</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsProcessing(true); }}>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome" className="bg-secondary/50 border-border text-foreground" />
              </div>
              <div>
                <Label htmlFor="whatsapp">Número WhatsApp</Label>
                <Input id="whatsapp" placeholder="+55 (11) 99999-9999" className="bg-secondary/50 border-border text-foreground" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" placeholder="seu@email.com" className="bg-secondary/50 border-border text-foreground" />
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-6">
                Ver meu diagnóstico espiritual
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showInitialScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full p-4 md:p-8">
          <div className="space-y-4 md:space-y-6 text-center">
            <div className="inline-block bg-accent/10 border border-accent/30 rounded-full px-3 py-1 mb-2">
              <p className="text-xs md:text-sm font-semibold text-accent">Diagnóstico Gratuito</p>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">Algo está afastando você de Deus?</h1>
            <p className="text-base md:text-lg text-foreground/80 font-bold">baseado na Bíblia</p>
            <p className="text-sm md:text-lg text-foreground/80">
              Identifique em <span className="font-semibold">60 segundos</span> o bloqueio espiritual que está impedindo sua paz. 🙏
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 my-4 text-xs md:text-sm text-foreground">
              <div className="flex items-center gap-1"><span>🔒</span><span>Rápido</span></div>
              <div className="flex items-center gap-1"><span>🔒</span><span>Confidencial</span></div>
              <div className="flex items-center gap-1"><span>⚡</span><span>Imediato</span></div>
            </div>

            <Button
              onClick={() => { setShowInitialScreen(false); setHasStarted(true); setCurrentStep(1); }}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base md:text-lg py-6 md:py-8 font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              🙏 QUERO DESCOBRIR AGORA
            </Button>
            <p className="text-[10px] md:text-sm text-muted-foreground">✨ +1.000 pessoas já iniciaram hoje.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep > 0 && currentStep <= QUIZ_STEPS.length) {
    const step = QUIZ_STEPS[currentStep - 1];
    const progress = (currentStep / QUIZ_STEPS.length) * 100;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full">
          <div className="mb-8">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <p className="text-sm text-muted-foreground text-center">Etapa {currentStep} de {QUIZ_STEPS.length}</p>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{step.question}</h2>
            {step.options.length > 0 ? (
              <div className="space-y-3">
                {step.options.map((option, index) => (
                  <button key={index} onClick={() => handleSelectOption(option)} className={`quiz-button ${responses[currentStep - 1] === option ? 'selected' : ''}`}>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                placeholder="Digite sua resposta aqui..."
                value={responses[currentStep - 1] || ''}
                onChange={(e) => setResponses({ ...responses, [currentStep - 1]: e.target.value })}
                className="border border-border focus:border-accent rounded-lg px-4 py-3 w-full min-h-[100px] resize-none bg-secondary/50 text-foreground"
              />
            )}
          </div>
          <div className="flex gap-4 justify-between">
            <Button onClick={handlePrevious} variant="outline" className="flex-1 border-border text-foreground">← Voltar</Button>
            <Button onClick={handleNext} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              {currentStep === QUIZ_STEPS.length ? 'Finalizar' : 'Continuar'} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
