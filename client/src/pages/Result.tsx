import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw } from "lucide-react";
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
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const generationStartedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  
  const generatePDFMutation = trpc.pdf.generateDiagnosticPDF.useMutation();
  const generateResultMutation = trpc.aiResult.generateFromResponses.useMutation();

  // Timer para contar o tempo restante
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

    if (!savedResponses) {
      clearQuizSessionState();
      setLocation("/quiz");
      return;
    }

    const parsed = JSON.parse(savedResponses) as Record<string, string>;
    setResponses(parsed);
    const name = parsed[0] || "Querido(a)";
    setUserName(name);

    const storedLeadId = localStorage.getItem("quizLeadId");
    const parsedLeadId = storedLeadId ? Number(storedLeadId) : undefined;
    const leadDataRaw = localStorage.getItem("leadData");
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;
    const leadId = Number.isFinite(parsedLeadId)
      ? parsedLeadId
      : typeof leadData?.leadId === "number"
        ? leadData.leadId
        : undefined;

    localStorage.removeItem("quizResult");

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
          recommendations: ["Comece pequeno: 5 minutos diários de oração", "Escolha um versículo para meditar cada dia", "Encontre um grupo de oração ou comunidade de fé"],
          nextSteps: ["Seu próximo passo é retomar a disciplina espiritual com compaixão por si mesmo. Deus não se afastou de você."],
        };
      }

      return {
        profileName: "✨ Buscador de Profundidade",
        profileDescription: "Sua vida espiritual está em transição. Você sente o chamado de Deus, mas enfrenta distrações e inconstância que impedem uma conexão mais profunda.",
        strengths: ["Sensibilidade espiritual aguçada", "Desejo genuíno de crescimento", "Capacidade de reflexão"],
        challenges: ["Manter disciplina espiritual", "Lidar com distrações do mundo", "Encontrar consistência na oração"],
        recommendations: ["Estabeleça um tempo fixo para oração diária", "Crie um espaço sagrado em sua casa", "Busque orientação espiritual de alguém de confiança"],
        nextSteps: ["O próximo passo é transformar seu desejo em ação. Comece hoje mesmo."],
      };
    };

    const applyFallbackResult = () => {
      const fallbackResult = buildFallbackResult(parsed);
      setResult(fallbackResult);
      setIsLoading(false);
      clearQuizSessionState();
    };

    // Se houver leadId, tentar gerar resultado com IA
    if (leadId) {
      generateResultMutation.mutate(
        { leadId, responses: parsed },
        {
          onSuccess: (data: any) => {
            if (data.success && data) {
              setResult(data);
              localStorage.setItem("quizResult", JSON.stringify(data));
              setIsLoading(false);
              clearQuizSessionState();
            } else {
              applyFallbackResult();
            }
          },
          onError: () => {
            if (fallbackTimeoutRef.current) {
              window.clearTimeout(fallbackTimeoutRef.current);
              fallbackTimeoutRef.current = null;
            }
            applyFallbackResult();
          },
        }
      );

      // Timeout de 30 segundos para fallback automático
      fallbackTimeoutRef.current = window.setTimeout(() => {
        if (isLoading) {
          applyFallbackResult();
        }
      }, 30000);
    } else {
      applyFallbackResult();
    }

    return () => {
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [setLocation, isLoading]);

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
        const binaryString = atob(pdfResponse.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagnostico-espiritual.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
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
        if (navigator.share) {
          await navigator.share({
            title: "Meu Diagnóstico Espiritual",
            text: text,
            url: currentUrl,
          });
        } else {
          await navigator.clipboard.writeText(text);
          toast.success("Resultado copiado para a área de transferência!");
        }
      }
    } catch (error) {
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
          onSuccess: (data) => {
            if (data.success && data.checkoutUrl) {
              window.open(data.checkoutUrl, '_blank');
              toast.success("Abrindo checkout...");
            }
            setIsBuyingGuide(false);
            setPaymentMethod(null);
          },
          onError: () => {
            toast.error("Erro ao criar checkout");
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
          onSuccess: (data) => {
            if (data.success && data.checkoutUrl) {
              window.open(data.checkoutUrl, '_blank');
              toast.success("Abrindo checkout...");
            }
            setIsBuyingGuide(false);
            setPaymentMethod(null);
          },
          onError: () => {
            toast.error("Erro ao criar checkout");
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
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
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

  return (
    <div className="spiritual-background min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{result.profileName}</h1>
          <p className="text-lg text-foreground/80">Seu Diagnóstico Espiritual</p>
        </div>

        {/* Main Result Card */}
        <div className="bg-card text-card-foreground rounded-lg shadow-lg p-8 space-y-6">
          {/* Profile Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-3">Quem você é</h2>
            <p className="text-lg leading-relaxed">{result.profileDescription}</p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-accent">Seus Pontos Fortes</h3>
            <ul className="space-y-2">
              {result.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-amber-600">Desafios a Superar</h3>
            <ul className="space-y-2">
              {result.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">Recomendações Personalizadas</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
            <h3 className="text-xl font-semibold mb-2 text-accent">Seu Próximo Passo</h3>
            <p className="text-lg">{result.nextSteps[0]}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center flex-wrap">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? "Gerando PDF..." : "Baixar Diagnóstico"}
          </Button>

          <Button
            onClick={() => handleShare()}
            disabled={isSharing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? "Compartilhando..." : "Compartilhar"}
          </Button>

          <Button
            onClick={handleRetakeQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer Quiz
          </Button>
        </div>

        {/* Devocional CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8 text-center space-y-4 border border-amber-200">
          <h3 className="text-2xl font-bold text-amber-900">Aprofunde Sua Jornada Espiritual</h3>
          <p className="text-amber-800">
            Receba um devocional de 7 dias personalizado baseado em seu diagnóstico
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={() => handleBuyGuide('stripe')}
              disabled={isBuyingGuide}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {paymentMethod === 'stripe' && isBuyingGuide ? "Processando..." : "Comprar com Cartão"}
            </Button>
            <Button
              onClick={() => handleBuyGuide('mercadopago')}
              disabled={isBuyingGuide}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {paymentMethod === 'mercadopago' && isBuyingGuide ? "Processando..." : "Comprar com MercadoPago"}
            </Button>
          </div>
        </div>

        {/* Time Left */}
        <div className="text-center text-sm text-foreground/60">
          Seu resultado estará disponível por: {formatTimeLeft(timeLeft)}
        </div>
      </div>
    </div>
  );
}
