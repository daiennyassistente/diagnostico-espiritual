import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Heart, BookOpen, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AIResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

export default function Result() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<AIResult | null>(null);
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const generationStartedRef = useRef(false);
  
  const generatePDFMutation = trpc.pdf.generateDiagnosticPDF.useMutation();
  const generateResultMutation = trpc.aiResult.generateFromResponses.useMutation();

  const clearQuizSessionState = () => {
    if (typeof window === "undefined") return;

    window.sessionStorage.removeItem("quizIsNavigatingToResult");
    window.sessionStorage.removeItem("quizNavigationStartedAt");
    window.sessionStorage.removeItem("quizIsProcessing");
    window.sessionStorage.removeItem("quizProcessingStartedAt");
    window.sessionStorage.removeItem("quizProcessingStep");
    window.sessionStorage.removeItem("quizCurrentStep");
    window.sessionStorage.removeItem("quizResponsesDraft");
    window.sessionStorage.removeItem("quizShowLeadForm");
    window.sessionStorage.removeItem("quizLeadDraft");
    window.sessionStorage.removeItem("quizHasStarted");
    window.sessionStorage.removeItem("quizPendingResultRedirect");
    window.sessionStorage.removeItem("quizPendingResultRedirectAt");
  };

  useEffect(() => {
    if (generationStartedRef.current) {
      return;
    }

    generationStartedRef.current = true;

    const savedResponses = localStorage.getItem("quizResponses");
    const savedResult = localStorage.getItem("quizResult");

    if (!savedResponses) {
      clearQuizSessionState();
      setLocation("/quiz");
      return;
    }

    const parsed = JSON.parse(savedResponses);
    setResponses(parsed);

    const storedLeadId = localStorage.getItem("quizLeadId");
    const parsedLeadId = storedLeadId ? Number(storedLeadId) : undefined;
    const leadDataRaw = localStorage.getItem("leadData");
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
    const leadId = Number.isFinite(parsedLeadId)
      ? parsedLeadId
      : typeof leadData?.leadId === "number"
        ? leadData.leadId
        : undefined;

    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setResult(parsedResult);
        setIsLoading(false);
        clearQuizSessionState();
        return;
      } catch {
        localStorage.removeItem("quizResult");
      }
    }

    const buildFallbackResult = (answers: Record<string, string>) => {
      const step1 = answers["0"] || "";
      const step3 = answers["2"] || "";
      const step4 = answers["3"] || "";
      const step5 = answers["4"] || "";
      const step10 = answers["9"] || "";

      if (step10.includes("recomeçar") || step10.includes("reconstrução") || step1.includes("voltar") || step1.includes("recomeço")) {
        return {
          profileName: "🌱 Coração em Recomeço",
          profileDescription: "Você está em um momento de renovação espiritual. Existe dentro de você um desejo verdadeiro de voltar ao secreto, reconstruir sua constância e se aproximar de Deus com mais leveza e sinceridade.",
          strengths: ["Disposição para recomeçar", "Sensibilidade espiritual", "Humildade para reconhecer a necessidade de Deus"],
          challenges: ["Manter constância", "Superar culpa ou frustração", "Voltar à rotina espiritual com paz"],
          recommendations: ["Separe alguns minutos diários para oração simples", "Recomece pela Palavra com metas pequenas", "Busque apoio espiritual de alguém maduro na fé"],
          nextSteps: ["Dê hoje um passo simples e consistente na sua caminhada com Deus."]
        };
      }

      if (step10.includes("cansada") || step5.includes("Paz") || step5.includes("paz")) {
        return {
          profileName: "😔 Fé Cansada",
          profileDescription: "Você ama a Deus, mas tem carregado um peso maior do que deveria. Seu coração precisa de descanso, cuidado e renovação para voltar a viver a presença de Deus com profundidade e paz.",
          strengths: ["Desejo de permanecer na fé", "Consciência de que precisa de cuidado", "História de caminhada com Deus"],
          challenges: ["Cansaço emocional e espiritual", "Desânimo", "Dificuldade de manter energia espiritual"],
          recommendations: ["Simplifique sua rotina devocional por alguns dias", "Escolha passagens bíblicas de descanso e esperança", "Ore com honestidade, sem tentar performar"],
          nextSteps: ["Permita-se descansar em Deus antes de tentar acelerar novamente."]
        };
      }

      if (step10.includes("Travada") || step10.includes("travada") || step3.includes("parada")) {
        return {
          profileName: "🔗 Travada Espiritualmente",
          profileDescription: "Você sente que existe algo interrompendo seu avanço espiritual. Há sede de mudança, mas também bloqueios internos que precisam ser identificados e tratados com verdade, oração e constância.",
          strengths: ["Consciência do bloqueio", "Desejo real de mudança", "Potencial de transformação"],
          challenges: ["Romper ciclos repetitivos", "Retomar foco espiritual", "Vencer travas emocionais"],
          recommendations: ["Anote os padrões que mais te afastam de Deus", "Ore com objetividade sobre suas travas", "Busque aconselhamento cristão se possível"],
          nextSteps: ["Seu próximo passo é identificar a raiz do que tem te paralisado."]
        };
      }

      if (step10.includes("Amadurecendo") || step10.includes("amadurecendo") || step3.includes("Frequente e profunda") || step3.includes("frequente e profunda")) {
        return {
          profileName: "🌳 Amadurecendo na Fé",
          profileDescription: "Você está em uma fase saudável de crescimento espiritual. Há sinais de profundidade, sede pela Palavra e disposição para viver uma caminhada mais consistente, madura e frutífera.",
          strengths: ["Constância crescente", "Desejo de profundidade", "Capacidade de amadurecer com propósito"],
          challenges: ["Evitar acomodação", "Continuar avançando", "Manter sensibilidade espiritual"],
          recommendations: ["Aprofunde seu tempo de estudo bíblico", "Transforme constância em estilo de vida", "Sirva outras pessoas com aquilo que Deus já te ensinou"],
          nextSteps: ["Continue crescendo com constância e intencionalidade diante de Deus."]
        };
      }

      if (step5.includes("Direção") || step5.includes("direção") || step1.includes("sem direção") || step10.includes("fome")) {
        return {
          profileName: "🧭 Buscando Direção",
          profileDescription: "Você tem fome de Deus e quer viver algo mais profundo, mas ainda sente falta de clareza para entender o próximo passo. Deus está trabalhando direção no meio da sua busca sincera.",
          strengths: ["Fome espiritual genuína", "Desejo de ouvir Deus", "Abertura para mudança"],
          challenges: ["Confusão sobre o próximo passo", "Ansiedade por respostas rápidas", "Dificuldade em discernir direção"],
          recommendations: ["Separe tempo de silêncio e oração", "Leia a Bíblia buscando princípios de direção", "Evite decisões precipitadas enquanto busca clareza"],
          nextSteps: ["Deus pode estar te guiando primeiro à clareza interior, antes da resposta externa."]
        };
      }

      if (step4.includes("instável") || step4.includes("pouco constante") || step3.includes("Irregular") || step3.includes("irregular")) {
        return {
          profileName: "📈 Fé Inconsistente",
          profileDescription: "Sua caminhada com Deus tem sido marcada por fases de aproximação e afastamento. Ainda assim, existe dentro de você um desejo verdadeiro de viver uma constância mais saudável e madura.",
          strengths: ["Desejo sincero de estar com Deus", "Consciência dos altos e baixos", "Capacidade de recomeçar"],
          challenges: ["Falta de consistência", "Oscilações emocionais", "Dificuldade em manter disciplina"],
          recommendations: ["Crie uma rotina espiritual simples e realista", "Associe seu momento com Deus a um horário fixo", "Evite metas grandes demais no início"],
          nextSteps: ["Pequenos passos consistentes vão te levar mais longe do que grandes promessas ocasionais."]
        };
      }

      return {
        profileName: "✨ Caminho de Crescimento",
        profileDescription: "Seu diagnóstico mostra que você está em um processo de crescimento espiritual com áreas importantes a fortalecer. Há potencial, fome e espaço para viver uma caminhada mais profunda com Deus a partir de agora.",
        strengths: ["Desejo de crescer", "Abertura para aprender", "Sensibilidade espiritual"],
        challenges: ["Criar constância", "Manter foco", "Transformar intenção em prática"],
        recommendations: ["Escolha um horário diário para se dedicar a Deus", "Comece com um plano bíblico simples", "Ore com constância, mesmo que por poucos minutos"],
        nextSteps: ["Seu próximo nível espiritual começa com consistência nas pequenas decisões."]
      };
    };

    const applyFallbackResult = (message?: string) => {
      const fallbackResult = buildFallbackResult(parsed);
      setResult(fallbackResult);
      localStorage.setItem("quizResult", JSON.stringify(fallbackResult));
      if (message) {
        toast.error(message);
      }
      setIsLoading(false);
      clearQuizSessionState();
    };

    fallbackTimeoutRef.current = window.setTimeout(() => {
      applyFallbackResult("A análise inteligente demorou mais que o esperado. Exibimos seu diagnóstico com base nas respostas do quiz.");
    }, 8000);

    generateResultMutation.mutate(
      { responses: parsed, leadId },
      {
        onSuccess: (data: any) => {
          if (fallbackTimeoutRef.current) {
            window.clearTimeout(fallbackTimeoutRef.current);
            fallbackTimeoutRef.current = null;
          }
          setResult(data);
          localStorage.setItem("quizResult", JSON.stringify(data));
          setIsLoading(false);
          clearQuizSessionState();
        },
        onError: (error) => {
          console.error("Erro ao gerar resultado:", error);
          if (fallbackTimeoutRef.current) {
            window.clearTimeout(fallbackTimeoutRef.current);
            fallbackTimeoutRef.current = null;
          }
          applyFallbackResult("A análise instantânea ficou indisponível. Exibimos seu diagnóstico com base nas respostas do quiz.");
        },
      }
    );

    return () => {
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [setLocation]);

  const handleDownloadPDF = async () => {
    if (!result || !responses) return;

    setIsGeneratingPDF(true);
    try {
      const pdfResponse = await generatePDFMutation.mutateAsync({
        profileName: result.profileName,
        profileDescription: result.profileDescription,
        strengths: result.strengths,
        challenges: result.challenges,
        recommendations: result.recommendations,
        nextSteps: result.nextSteps,
        responses: responses,
      });

      if (pdfResponse.success && pdfResponse.pdfBase64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${pdfResponse.pdfBase64}`;
        link.download = "diagnostico-espiritual.pdf";
        link.click();
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizResponses");
    localStorage.removeItem("quizResult");
    localStorage.removeItem("quizLeadId");
    clearQuizSessionState();
    setLocation("/quiz");
  };

  const handleShare = async (platform?: string) => {
    setIsSharing(true);
    const text = `Fiz um diagnóstico espiritual e descobri que sou: ${result?.profileName}\n\n${result?.profileDescription}`;
    const encodedText = encodeURIComponent(text);
    const currentUrl = window.location.origin;
    
    try {
      if (platform === 'whatsapp') {
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
        toast.success("Abrindo WhatsApp...");
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodedText}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        toast.success("Abrindo Facebook...");
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(currentUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        toast.success("Abrindo Twitter...");
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
        toast.success("Abrindo LinkedIn...");
      } else {
        // Tentar usar Web Share API primeiro (mobile)
        if (navigator.share) {
          await navigator.share({
            title: "Meu Diagnóstico Espiritual",
            text: text,
            url: currentUrl,
          });
        } else {
          // Fallback: copiar para clipboard
          await navigator.clipboard.writeText(text);
          toast.success("Resultado copiado para a área de transferência!");
        }
      }
    } catch (error) {
      // Se tudo falhar, copiar para clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Resultado copiado para a área de transferência!");
      } catch {
        toast.error("Erro ao compartilhar resultado");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const [isBuyingGuide, setIsBuyingGuide] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago' | null>(null);
  const createCheckoutMutation = trpc.quiz.createDevocionalCheckout.useMutation();
  const createMercadoPagoCheckoutMutation = trpc.quiz.createMercadoPagoCheckout.useMutation();

  const handleBuyGuide = async (method: 'stripe' | 'mercadopago') => {
    if (!result || !responses) return;
    
    setIsBuyingGuide(true);
    setPaymentMethod(method);
    
    // Obter email do localStorage (salvo durante captura de leads)
    const leadData = localStorage.getItem("leadData");
    if (!leadData) {
      toast.error("Email não encontrado. Por favor, complete o quiz novamente.");
      setIsBuyingGuide(false);
      setPaymentMethod(null);
      return;
    }
    
    const { email } = JSON.parse(leadData);
    
    if (method === 'stripe') {
      createCheckoutMutation.mutate(
        {
          email,
          profileName: result.profileName,
        },
        {
          onSuccess: (data: any) => {
            if (data.checkoutUrl) {
              window.open(data.checkoutUrl, "_blank");
              toast.success("Redirecionando para o checkout...");
            }
          },
          onError: (error: any) => {
            console.error("Erro ao criar checkout:", error);
            toast.error("Erro ao processar pagamento. Tente novamente.");
          },
          onSettled: () => {
            setIsBuyingGuide(false);
            setPaymentMethod(null);
          },
        }
      );
    } else if (method === 'mercadopago') {
      createMercadoPagoCheckoutMutation.mutate(
        {
          email,
          profileName: result.profileName,
        },
        {
          onSuccess: (data: any) => {
            if (data.checkoutUrl) {
              window.open(data.checkoutUrl, "_blank");
              toast.success("Redirecionando para o Pix...");
            }
          },
          onError: (error: any) => {
            console.error("Erro ao criar checkout Mercado Pago:", error);
            toast.error("Erro ao processar pagamento. Tente novamente.");
          },
          onSettled: () => {
            setIsBuyingGuide(false);
            setPaymentMethod(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">✨</div>
          <p className="text-foreground text-lg">Gerando seu diagnóstico personalizado...</p>
          <p className="text-foreground/70 text-sm mt-2">Se a análise inteligente demorar, mostraremos automaticamente um resultado com base nas suas respostas.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-foreground text-lg">Erro ao carregar resultado</p>
          <Button onClick={handleRetakeQuiz} className="mt-4">
            Voltar ao Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Extrair emoji do profileName
  const emojiMatch = result.profileName.match(/^(.)\s/);
  const emoji = emojiMatch ? emojiMatch[1] : "✨";
  const profileTitle = result.profileName.replace(/^(.)\s/, "");

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-2xl">
        {/* ===== RESULTADO GRATUITO ===== */}
        
        {/* Header com emoji e título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {profileTitle}
          </h1>
          <p className="text-sm text-accent font-semibold">Seu Diagnóstico Espiritual</p>
        </div>

        {/* Descrição conversacional com urgência */}
        <div className="mb-8 p-6 bg-secondary rounded-lg border border-muted">
          <p className="text-foreground text-lg leading-relaxed">
            {result.profileDescription}
          </p>
          <p className="text-foreground text-sm mt-4 italic border-l-4 border-accent pl-4">
            "Este é o momento certo para dar o próximo passo em sua jornada com Deus."
          </p>
        </div>

        {/* Seção de Pontos Fortes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Seus Pontos Fortes
          </h2>
          <div className="space-y-2">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">✓</span>
                <p className="text-foreground">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Desafios */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Desafios a Trabalhar
          </h2>
          <div className="space-y-2">
            {result.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">•</span>
                <p className="text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Recomendações
          </h2>
          <div className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent font-semibold">{index + 1}.</span>
                <p className="text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximo Passo */}
        <div className="mb-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-foreground italic">
            "{result.nextSteps[0] || 'Continue sua jornada espiritual com fé e esperança.'}"
          </p>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="w-full"
            variant="outline"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>

          <Button
            onClick={handleRetakeQuiz}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Fazer Novamente
          </Button>

          <Button
            onClick={() => handleShare()}
            className="w-full"
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mb-8">
          Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.
        </p>

        {/* ===== SEÇÃO DE OFERTA DO GUIA DEVOCIONAL ===== */}
        
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Oferta Principal */}
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-8 border-2 border-accent/30 mb-8">
          {/* Badge de oferta especial */}
          <div className="text-center mb-6">
            <span className="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              ✨ OFERTA ESPECIAL
            </span>
          </div>

          {/* Título da oferta */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            📖 Devocional: 7 Dias para se Aproximar de Deus de Verdade
          </h2>
          <p className="text-center text-accent font-semibold mb-6">
            Personalizado para sua jornada espiritual
          </p>

          {/* Descrição emocional */}
          <div className="bg-white/50 rounded-lg p-6 mb-6">
            <p className="text-foreground text-center leading-relaxed">
              Você recebeu seu diagnóstico. Agora é hora de <strong>agir</strong>.
            </p>
            <p className="text-foreground text-center leading-relaxed mt-3">
              Este devocional foi criado especialmente para sua situação espiritual atual. 
              Com base em seu resultado, você receberá 7 dias de reflexões bíblicas profundas, 
              práticas espirituais e orações que vão transformar sua conexão com Deus.
            </p>
          </div>

          {/* Benefícios do guia */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Devocional 100% Personalizado</p>
                <p className="text-sm text-foreground/80">Baseado especificamente no seu diagnóstico e desafios espirituais</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Fundamentado na Bíblia</p>
                <p className="text-sm text-foreground/80">Cada dia inclui versículos, reflexões profundas e aplicações práticas baseadas na Palavra de Deus</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Transformação Real em 7 Dias</p>
                <p className="text-sm text-foreground/80">Práticas espirituais diárias que você pode começar hoje mesmo</p>
              </div>
            </div>
          </div>

          {/* Preço e CTA */}
          <div className="text-center mb-6">
            <p className="text-sm text-foreground/70 mb-2">Investimento único:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-accent">R$ 9,90</span>
            </div>
            <p className="text-xs text-foreground/60">Acesso imediato ao PDF + Suporte por 7 dias</p>
          </div>

          {/* Botões de compra com opções de pagamento */}
          <div className="space-y-3">
            <Button
              onClick={() => handleBuyGuide('stripe')}
              disabled={isBuyingGuide}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg"
            >
              {isBuyingGuide && paymentMethod === 'stripe' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Comprar com Cartão
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleBuyGuide('mercadopago')}
              disabled={isBuyingGuide}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
            >
              {isBuyingGuide && paymentMethod === 'mercadopago' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Comprar com Pix
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-foreground/70 mb-6">
            <p>
              ✓ Entrega imediata do PDF após a confirmação do pagamento
            </p>
            <p className="text-xs mt-2">Escolha sua forma de pagamento preferida</p>
          </div>

          {/* Depoimento social proof (opcional) */}
          <div className="bg-white/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-foreground italic text-center">
              "Este devocional mudou minha forma de orar e me aproximou muito mais de Deus.
              Recomendo para quem quer uma conexão real e transformadora."
            </p>
            <p className="text-xs text-foreground/70 text-center mt-2">— Marina S., Brasília</p>
          </div>

          {/* CTA secundária */}
          <div className="text-center">
            <p className="text-foreground text-sm mb-3">
              Não tem certeza? Comece com seu diagnóstico grátis e veja a diferença.
            </p>
            <p className="text-xs text-foreground/60">
              Oferta válida por tempo limitado. Aproveite agora!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
