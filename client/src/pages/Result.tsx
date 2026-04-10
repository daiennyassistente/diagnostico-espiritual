import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, CheckCircle2, Zap } from "lucide-react";
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
  const [isBuyingGuide, setIsBuyingGuide] = useState(false);

  const formatProfileHeadline = (profileName: string) => {
    const sanitized = profileName
      .replace(/^[^A-Za-zÀ-ÿ0-9]+/, "")
      .trim();

    if (!sanitized) {
      return "Seu diagnóstico espiritual";
    }

    return /^você está/i.test(sanitized) ? sanitized : `Você está ${sanitized}`;
  };
  
  const generatePDFMutation = trpc.pdf.generateDiagnosticPDF.useMutation();
  const generateResultMutation = trpc.aiResult.generateFromResponses.useMutation();
  const createMercadoPagoCheckoutMutation = trpc.quiz.createMercadoPagoCheckout.useMutation();

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
          profileName: "espiritualmente em recomeço",
          profileDescription: "Seu coração deseja voltar para Deus. Existe um chamado real dentro de você para reconstruir essa conexão.",
          strengths: ["Disposição para recomeçar", "Sensibilidade espiritual", "Humildade"],
          challenges: ["Manter constância", "Superar culpa", "Voltar à rotina"],
          recommendations: ["Comece com 5 minutos diários de oração", "Escolha um versículo para cada dia", "Busque uma comunidade de fé"],
          nextSteps: ["Seu próximo passo é retomar a disciplina com compaixão por si mesmo."],
        };
      }

      return {
        profileName: "espiritualmente sobrecarregado(a)",
        profileDescription: "Sua vida espiritual está em transição. Você sente o chamado de Deus, mas enfrenta distrações que impedem uma conexão profunda.",
        strengths: ["Sensibilidade espiritual", "Desejo de crescimento", "Capacidade de reflexão"],
        challenges: ["Manter disciplina", "Lidar com distrações", "Encontrar consistência"],
        recommendations: ["Estabeleça um tempo fixo para oração", "Crie um espaço sagrado em casa", "Busque orientação espiritual"],
        nextSteps: ["O próximo passo é transformar seu desejo em ação."],
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
    const text = `Fiz um diagnóstico espiritual e descobri que: ${result?.profileName}\n\n${result?.profileDescription}`;
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

  const handleBuyDevocional = async () => {
    if (!result || !responses) return;
    
    const leadData = localStorage.getItem("leadData");
    if (!leadData) {
      toast.error("Email não encontrado. Por favor, complete o quiz novamente.");
      return;
    }
    
    const { email } = JSON.parse(leadData);
    
    setIsBuyingGuide(true);

    createMercadoPagoCheckoutMutation.mutate(
      {
        email,
        profileName: result.profileName,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            toast.error("Não foi possível abrir o checkout");
            setIsBuyingGuide(false);
          }
        },
        onError: () => {
          setIsBuyingGuide(false);
          toast.error("Erro ao criar checkout");
        },
      }
    );

  };

  if (isLoading) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{color: '#1E3A8A'}} />
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
    <div className="spiritual-background min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* AVISO NO TOPO */}
        <div className="text-center">
          <p className="text-xs" style={{color: '#9CA3AF'}}>Não esqueça de rolar até o final da página</p>
        </div>
        
        {/* ===== SEÇÃO DE RESULTADO ===== */}
        <div className="space-y-6">
          {/* TÍTULO - DIRETO E CLARO */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black" style={{color: '#1E3A8A', lineHeight: '1.2'}}>
              {formatProfileHeadline(result.profileName)}
            </h1>
            <p className="text-lg" style={{color: '#6B7280'}}>
              Seu diagnóstico mostra com clareza o que hoje está pesando na sua vida com Deus.
            </p>
          </div>

          {/* DIAGNÓSTICO - CURTO E IMPACTANTE */}
          <div className="rounded-xl p-6 shadow-md space-y-3" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
              {result.profileDescription}
            </p>
          </div>

          {/* IMPACTO */}
          <div className="rounded-xl p-6 space-y-3" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <h3 className="text-lg font-semibold" style={{color: '#1E3A8A'}}>Hoje isso aparece assim na sua vida:</h3>
            <ul className="space-y-2">
              {result.challenges.slice(0, 3).map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                  <span className="font-bold" style={{color: '#1E3A8A'}}>•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RECOMENDAÇÕES */}
          <div className="rounded-xl p-6 space-y-3" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <h3 className="text-lg font-semibold" style={{color: '#1E3A8A'}}>O que fazer agora:</h3>
            <ul className="space-y-2">
              {result.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#1E3A8A'}} />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center flex-wrap">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 font-semibold px-4 py-2 text-sm"
              style={{backgroundColor: '#FACC15', color: '#1F2937'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EAB308'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FACC15'}
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? "Gerando..." : "Baixar"}
            </Button>

            <Button
              onClick={() => handleShare()}
              disabled={isSharing}
              variant="outline"
              className="flex items-center gap-2 font-semibold px-4 py-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? "..." : "Compartilhar"}
            </Button>

            <Button
              onClick={handleRetakeQuiz}
              variant="outline"
              className="flex items-center gap-2 font-semibold px-4 py-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer
            </Button>
          </div>
        </div>

        {/* ===== TRANSIÇÃO FORTE PARA OFERTA ===== */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{borderTop: '2px solid #3B82F6'}}></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-4" style={{backgroundColor: '#FAF7F2'}}>
              <p className="text-center text-sm font-bold" style={{color: '#1E3A8A'}}>
                ⚡ MAS ESPERA... ISSO PODE MUDAR HOJE
              </p>
            </div>
          </div>
        </div>

        {/* ===== SEÇÃO DE OFERTA - MINIMALISTA E FOCADA ===== */}
        <div className="rounded-xl p-8 space-y-6 shadow-lg" style={{backgroundColor: '#FFFFFF', border: '2px solid #3B82F6'}}>
          
          {/* OFERTA - TÍTULO IMPACTANTE */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{color: '#1E3A8A'}}>
              Retome Sua Conexão com Deus
            </h2>
            <p className="text-lg font-semibold" style={{color: '#C9A646'}}>
              📖 Devocional: 7 Dias Guiados
            </p>
            <p className="text-base" style={{color: '#1F2937'}}>
              Um plano simples e profundo para voltar a sentir paz e direção.
            </p>
          </div>

          {/* O QUE INCLUI */}
          <div className="space-y-3 rounded-lg p-4" style={{backgroundColor: '#F2E8C9'}}>
            <p className="text-sm font-bold" style={{color: '#1E3A8A'}}>Você recebe:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span>7 dias de devocional guiado</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span>5-10 min de oração diária</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span>Versículos + reflexões</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span>Acesso imediato</span>
              </li>
            </ul>
          </div>

          {/* URGÊNCIA */}
          <div className="rounded-lg p-3 text-center" style={{backgroundColor: '#EFF6FF'}}>
            <p className="text-sm font-bold" style={{color: '#1E3A8A'}}>
              ⏳ Comece hoje e sinta a diferença nos próximos dias
            </p>
          </div>

          {/* CTA - Único E FORTE */}
          <div className="space-y-3">
            <Button
              onClick={handleBuyDevocional}
              disabled={isBuyingGuide}
              className="w-full font-bold text-base py-4 rounded-lg shadow-md"
              style={{backgroundColor: '#FACC15', color: '#1F2937'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EAB308'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FACC15'}
            >
              {isBuyingGuide ? "Processando..." : "👉 Quero me Reconectar com Deus"}
            </Button>
            <p className="text-center text-base font-bold" style={{color: '#FACC15'}}>R$ 12,90 investimento único</p>
            

          </div>
        </div>

        {/* TIMER */}
        <div className="text-center pb-4">
          <p className="text-sm font-semibold" style={{color: '#1E3A8A'}}>Seu resultado estará disponível por:</p>
          <p className="text-2xl font-black" style={{color: '#C9A646'}}>{formatTimeLeft(timeLeft)}</p>
        </div>
      </div>
    </div>
  );
}
