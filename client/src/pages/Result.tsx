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

  const generateIntroductoryMessage = (profileName: string) => {
    const messages = [
      "Você não está sozinho nesse sentimento. Muitos cristãos passam por exatamente o que você está vivendo agora.",
      "Essa é uma realidade que muitos cristãos enfrentam em algum momento da vida.",
      "Você não é o único que sente isso. Muitos irmãos na fé passam por situações semelhantes.",
      "Essa é uma jornada que muitos cristãos vivem, e a boa notícia é que tem solução.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const generateConsequenceMessage = (profileName: string, challenges: string[]) => {
    const profileLower = profileName.toLowerCase();
    const challenge = challenges && challenges.length > 0 ? challenges[0].toLowerCase() : "essa situação";
    
    if (profileLower.includes("sobrecarregado")) {
      return `Sem direcionamento, essa sobrecarga espiritual tende a aumentar. Você pode acordar daqui a 6 meses, 1 ano, e perceber que se afastou ainda mais de Deus. Que a fé que você tinha ficou fraca. Que aquela paz que Deus promete parece cada vez mais distante.`;
    } else if (profileLower.includes("distante")) {
      return `Sem um plano claro, essa distância de Deus tende a aumentar. O cansaço espiritual vai crescer. Você pode acordar daqui a poucos meses e perceber que está ainda mais longe da presença de Deus.`;
    } else if (profileLower.includes("confuso")) {
      return `Sem clareza, essa confusão espiritual vai aumentar. Você pode ficar preso em dúvidas, sem saber qual caminho seguir. E cada dia que passa, mais difícil fica voltar.`;
    } else if (profileLower.includes("fraco")) {
      return `Sem força espiritual, essa fraqueza tende a aumentar. Você pode acordar daqui a poucos meses e perceber que perdeu a fé que tinha. Que aquela força para enfrentar a vida desapareceu.`;
    } else if (profileLower.includes("perdido")) {
      return `Sem um caminho claro, você pode ficar ainda mais perdido. Os meses passam, a distância de Deus aumenta, e de repente você percebe que se afastou demais.`;
    }
    
    return `Sem direcionamento, essa situação espiritual tende a piorar. Você pode acordar daqui a 6 meses, 1 ano, e perceber que se afastou ainda mais de Deus. Que a fé que você tinha ficou fraca. Que aquela paz que Deus promete parece cada vez mais distante.`;
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

    // Verificar se há resultado salvo no localStorage
    const savedResult = localStorage.getItem("quizResult");
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setResult(parsedResult);
        setIsLoading(false);
        clearQuizSessionState();
        return;
      } catch (e) {
        console.error("Erro ao parsear resultado salvo", e);
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
    
    const { email, name, whatsapp } = JSON.parse(leadData);
    
    setIsBuyingGuide(true);

    createMercadoPagoCheckoutMutation.mutate(
      {
        email,
        profileName: result.profileName,
        userName: name,
        userPhone: whatsapp,
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
          {/* TÍTULO - IMPACTANTE E CURIOSO */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black" style={{color: '#1E3A8A', lineHeight: '1.2'}}>
              {formatProfileHeadline(result.profileName)}
            </h1>
            <p className="text-lg mt-4" style={{color: '#1F2937'}}>
              {generateIntroductoryMessage(result.profileName)}
            </p>
            <p className="text-base mt-3" style={{color: '#6B7280'}}>
              E a boa notícia? <strong style={{color: '#1E3A8A'}}>Isso tem solução.</strong>
            </p>
          </div>

          {/* DIAGNÓSTICO - EMOCIONAL E PESSOAL */}
          <div className="rounded-xl p-6 shadow-md space-y-4" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
              Seu resultado mostra com precisão o que está acontecendo na sua vida espiritual neste momento. Não é coincidência você estar aqui. Deus sabe exatamente o que você precisa.
            </p>
            <div style={{borderTop: '1px solid #E5E7EB', paddingTop: '1rem'}}>
              <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
                <strong style={{color: '#1E3A8A'}}>Seu diagnóstico:</strong> {result.profileDescription}
              </p>
            </div>
          </div>

          {/* SEÇÃO DE DOR + CONSEQUÊNCIA */}
          <div className="rounded-xl p-6 space-y-4" style={{backgroundColor: '#FEF2F2', borderLeft: '4px solid #DC2626'}}>
            <h3 className="text-lg font-semibold" style={{color: '#991B1B'}}>Se você continuar assim, o que vai acontecer?</h3>
            <p className="text-base leading-relaxed" style={{color: '#7F1D1D'}}>
              {generateConsequenceMessage(result.profileName, result.challenges)}
            </p>
            <p className="text-base font-semibold" style={{color: '#991B1B'}}>
              Mas aqui está o ponto: você NÃO precisa deixar isso acontecer.
            </p>
          </div>

          {/* IMPACTO - RECONHECIMENTO */}
          <div className="rounded-xl p-6 space-y-3" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <h3 className="text-lg font-semibold" style={{color: '#1E3A8A'}}>Você reconhece isso na sua vida?</h3>
            <ul className="space-y-2">
              {result.challenges.slice(0, 3).map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                  <span className="font-bold" style={{color: '#1E3A8A'}}>✓</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RECOMENDAÇÕES - CAMINHO SIMPLES */}
          <div className="rounded-xl p-6 space-y-3" style={{backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E3A8A'}}>
            <h3 className="text-lg font-semibold" style={{color: '#1E3A8A'}}>O caminho para voltar é mais simples do que você pensa:</h3>
            <ul className="space-y-3">
              {result.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm" style={{color: '#1F2937'}}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#1E3A8A'}} />
                  <span className="leading-relaxed">{rec}</span>
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

        {/* ===== TRANSIÇÃO PARA OFERTA ===== */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{borderTop: '2px solid #3B82F6'}}></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-4" style={{backgroundColor: '#FAF7F2'}}>
              <p className="text-center text-sm font-bold" style={{color: '#1E3A8A'}}>
                ⚡ MAS AQUI ESTÁ O SEGREDO: Você não precisa fazer isso sozinho
              </p>
            </div>
          </div>
        </div>

        {/* PARÁGRAFO DE TRANSIÇÃO */}
        <div className="text-center space-y-4 px-4">
          <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
            Sabe aquele sentimento de estar perdido espiritualmente? De não saber por onde começar? De querer voltar para Deus, mas não saber como?
          </p>
          <p className="text-lg font-semibold" style={{color: '#1E3A8A'}}>
            Existe um caminho. E ele foi criado especialmente para você.
          </p>
        </div>

        {/* ===== SEÇÃO DE OFERTA - OTIMIZADA ===== */}
        <div className="rounded-xl p-8 space-y-6 shadow-lg" style={{backgroundColor: '#FFFFFF', border: '2px solid #3B82F6'}}>
          
          {/* OFERTA - TÍTULO TRANSFORMADOR */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{color: '#1E3A8A'}}>
              Um Plano Espiritual Guiado de 7 Dias Para Restaurar Sua Vida Com Deus
            </h2>
            <p className="text-xl font-semibold" style={{color: '#C9A646'}}>
              Seu Guia Pessoal Para Voltar a Sentir a Presença de Deus
            </p>
            <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
              Este não é um devocional comum. É um plano criado especialmente para <strong>VOCÊ</strong>, baseado no seu diagnóstico espiritual. Cada dia foi pensado para levar você de volta à presença de Deus, passo a passo, sem pressa, sem julgamento.
            </p>
            <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
              Você vai descobrir como reconectar com Deus de forma profunda e real. Como sentir aquela paz que você sente falta. Como voltar a ter constância e propósito na sua vida espiritual.
            </p>
            <p className="text-sm font-semibold" style={{color: '#DC2626'}}>
              ⚠️ Este devocional foi criado especialmente para você
            </p>
          </div>

          {/* BENEFÍCIOS EMOCIONAIS */}
          <div className="space-y-3 rounded-lg p-4" style={{backgroundColor: '#F2E8C9'}}>
            <p className="text-sm font-bold" style={{color: '#1E3A8A'}}>O que você vai ganhar:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span><strong>✨ Saiba exatamente o que fazer cada dia</strong> — sem dúvidas, sem culpa, sem se sentir perdido</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span><strong>💎 Sinta a presença de Deus voltando</strong> — aquela paz que você sente falta vai voltar</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span><strong>🙏 Tenha uma rotina espiritual que funciona</strong> — constância que você sempre quis</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span><strong>📖 Versículos que falam direto com seu coração</strong> — não genéricos, mas para VOCÊ</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{color: '#1F2937'}}>
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#C9A646'}} />
                <span><strong>⚡ Transformação real em 7 dias</strong> — não promessas vazias, mas mudança que você vai sentir</span>
              </li>
            </ul>
          </div>

          {/* URGÊNCIA - EMOCIONAL */}
          <div className="rounded-lg p-4 text-center" style={{backgroundColor: '#FEE2E2', border: '2px solid #DC2626'}}>
            <p className="text-sm font-bold" style={{color: '#991B1B'}}>
              ⚠️ Seu diagnóstico é único e pode expirar em {formatTimeLeft(timeLeft)}
            </p>
            <p className="text-xs mt-2" style={{color: '#7F1D1D'}}>
              Se você sair agora, pode perder esse direcionamento espiritual que foi criado especialmente para você. Deus está falando com você AGORA.
            </p>
          </div>

          {/* PRÉ-BOTÃO - VISUALIZAÇÃO EMOCIONAL */}
          <div className="text-center space-y-4 px-4 py-4" style={{backgroundColor: '#F9FAFB', borderRadius: '0.5rem'}}>
            <p className="text-base leading-relaxed" style={{color: '#1F2937'}}>
              Imagine como seria acordar amanhã com clareza. Sentir Deus perto de você novamente. Ter uma direção, um propósito, uma paz que você não sente há tempo.
            </p>
            <p className="text-lg font-semibold" style={{color: '#1E3A8A'}}>
              Isso pode começar hoje.
            </p>
          </div>

          {/* CTA - TRANSFORMADO */}
          <div className="space-y-3">
            <Button
              onClick={handleBuyDevocional}
              disabled={isBuyingGuide}
              className="w-full font-bold text-base py-4 rounded-lg shadow-md"
              style={{backgroundColor: '#FACC15', color: '#1F2937'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EAB308'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FACC15'}
            >
              {isBuyingGuide ? "Processando..." : "✨ Quero Voltar a Sentir a Presença de Deus"}
            </Button>
            <p className="text-center text-base font-bold" style={{color: '#FACC15'}}>R$ 12,90 — Menos que um café ☕</p>
          </div>
        </div>

        {/* TIMER - REESCRITO */}
        <div className="text-center pb-4">
          <p className="text-sm font-semibold" style={{color: '#1E3A8A'}}>⏳ Seu resultado personalizado estará disponível por mais:</p>
          <p className="text-3xl font-black" style={{color: '#DC2626'}}>{formatTimeLeft(timeLeft)}</p>
        </div>
      </div>
    </div>
  );
}
