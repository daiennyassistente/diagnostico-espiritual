import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
      'Próxima de Deus, mas inconstante',
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
];

const PROCESSING_MESSAGES = [
  'Analisando suas respostas...',
  'Identificando padrões de constância, profundidade, direção e bloqueios espirituais...',
  'Organizando a direção mais indicada para você...',
  'Seu diagnóstico está pronto!',
];

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [leadData, setLeadData] = useState({ whatsapp: '', email: '' });

  const submitLeadMutation = trpc.quiz.submitLead.useMutation();
  const submitResponsesMutation = trpc.quiz.submitResponses.useMutation();

  const isQuizComplete = currentStep >= QUIZ_STEPS.length;

  const handleSelectOption = (option: string) => {
    setResponses({
      ...responses,
      [currentStep]: option,
    });
    
    // Avanço automático após 600ms para o usuário ver a seleção
    setTimeout(() => {
      if (currentStep < QUIZ_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowLeadForm(true);
      }
    }, 600);
  };

  const handleNext = () => {
    if (!responses[currentStep]) {
      toast.error('Por favor, selecione uma opção para continuar');
      return;
    }

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatWhatsApp = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadData.whatsapp || !leadData.email) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Validar WhatsApp
    const whatsappRegex = /^(\d{10,15})$/;
    if (!whatsappRegex.test(leadData.whatsapp.replace(/\D/g, ''))) {
      toast.error('WhatsApp inválido');
      return;
    }

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      toast.error('E-mail inválido');
      return;
    }

    setIsProcessing(true);
    setShowLeadForm(false);
    setProcessingStep(0);

    try {
      // Animar as etapas de processamento
      for (let i = 0; i < PROCESSING_MESSAGES.length; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Salvar lead
      const leadResult = await submitLeadMutation.mutateAsync({
        whatsapp: leadData.whatsapp.replace(/\D/g, ''),
        email: leadData.email,
      });

      if (leadResult.success && leadResult.leadId) {
        // Salvar respostas do quiz
        const responsesData = {
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
        };

        await submitResponsesMutation.mutateAsync(responsesData);

        // Salvar respostas no localStorage para a página de resultado
        localStorage.setItem('quizResponses', JSON.stringify(responses));
        
        // Salvar dados do lead para o checkout
        localStorage.setItem('leadData', JSON.stringify({
          email: leadData.email,
          whatsapp: leadData.whatsapp.replace(/\D/g, ''),
        }));

        toast.success('Diagnóstico enviado com sucesso!');
        // Redirecionar para página de resultado
        setTimeout(() => {
          setLocation('/result');
        }, 2000);
      } else {
        toast.error('Não foi possível salvar seus dados. Tente novamente.');
        setShowLeadForm(true);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast.error('Erro ao enviar dados. Tente novamente.');
      setShowLeadForm(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Tela de abertura
  if (currentStep === 0 && Object.keys(responses).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Diagnóstico Espiritual
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Responda algumas perguntas rápidas para identificar possíveis bloqueios espirituais e descobrir o que pode estar travando sua vida.
            </p>
            <p className="text-sm text-foreground/60">
              Leva menos de 2 minutos e pode te ajudar a enxergar com mais clareza a fase espiritual que você está vivendo agora.
            </p>
            <Button
              onClick={() => setCurrentStep(1)}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Quero começar meu diagnóstico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de processamento
  if (isProcessing) {
    const progress = ((processingStep + 1) / PROCESSING_MESSAGES.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 spiritual-background">
        <div className="quiz-card max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              {PROCESSING_MESSAGES[processingStep]}
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
                  i <= processingStep ? 'bg-primary' : 'bg-muted'
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
        <div className="quiz-card max-w-2xl w-full">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Seu diagnóstico está pronto
              </h2>
              <p className="text-foreground/80">
                Informe seus dados para receber seu resultado e a orientação personalizada para esta fase.
              </p>
            </div>

            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <Label htmlFor="whatsapp" className="text-foreground font-medium mb-2 block">
                  Número WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={leadData.whatsapp}
                  onChange={(e) => setLeadData({ ...leadData, whatsapp: formatWhatsApp(e.target.value) })}
                  className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3"
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
                  className="border-2 border-muted focus:border-primary rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <input type="checkbox" id="consent" defaultChecked />
                <label htmlFor="consent">
                  Quero receber meu diagnóstico e orientações pelo WhatsApp e e-mail.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold"
              >
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

  // Telas do quiz
  if (currentStep > 0 && currentStep <= QUIZ_STEPS.length) {
    const step = QUIZ_STEPS[currentStep - 1];
    const progress = (currentStep / QUIZ_STEPS.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 spiritual-background">
        <div className="quiz-card max-w-2xl w-full">
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
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {step.question}
            </h2>

            {/* Options */}
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
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1"
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStep === QUIZ_STEPS.length ? 'Finalizar' : 'Próximo'} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
