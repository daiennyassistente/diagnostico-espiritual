import { useState, useEffect, useRef } from "react";
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
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas em segundos
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
    const savedResult = localStorage.getItem("quizResult");

    if (!savedResponses) {
      clearQuizSessionState();
      setLocation("/quiz");
      return;
    }

    const parsed = JSON.parse(savedResponses);
    setResponses(parsed);
    
    // Extrair o nome da primeira resposta (pergunta 1)
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

    const applyFallbackResult = (message: string) => {
      const fallbackResult = buildFallbackResult(parsed);
      setResult(fallbackResult);
      localStorage.setItem("quizResult", JSON.stringify(fallbackResult));
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
              applyFallbackResult("Resultado gerado com base em suas respostas.");
            }
          },
          onError: () => {
            if (fallbackTimeoutRef.current) {
              window.clearTimeout(fallbackTimeoutRef.current);
              fallbackTimeoutRef.current = null;
            }
            applyFallbackResult("A análise instantânea ficou indisponível. Exibimos seu diagnóstico com base nas respostas do quiz.");
          },
        }
      );
    } else {
      applyFallbackResult("Resultado gerado com base em suas respostas.");
    }

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

  // Extrair emoji do profileName
  const emojiMatch = result.profileName.match(/^(.)\s/);
  const emoji = emojiMatch ? emojiMatch[1] : "✨";
  const profileTitle = result.profileName.replace(/^(.)\s/, "");

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-2xl">
        {/* ===== SEÇÃO DE RESULTADO COM ALTA CONVERSÃO ===== */}
        
        {/* Título Impactante com Nome Personalizado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Seu resultado, {userName}:
          </h1>
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-accent mb-4">
            {profileTitle}
          </h2>
        </div>

        {/* 💔 DIAGNÓSTICO (DOR) - Conexão Emocional Profunda */}
        <div className="mb-8 p-6 bg-secondary/50 rounded-lg border-l-4 border-accent">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">💔</span> Seu Diagnóstico Espiritual
          </h3>
          <p className="text-foreground text-lg leading-relaxed">
            {result.profileDescription}
          </p>
          <p className="text-foreground/80 text-sm mt-4 italic">
            Você não está sozinho nessa jornada. Muitas pessoas passam pelo que você está vivenciando agora.
          </p>
        </div>

        {/* ⚠️ CONSEQUÊNCIAS - Mostrando o Impacto Real */}
        <div className="mb-8 p-6 bg-red-50/30 rounded-lg border border-red-200/50">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Se Você Continuar Assim...
          </h3>
          <div className="space-y-2">
            {result.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <p className="text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
          <p className="text-foreground/70 text-sm mt-4 italic">
            Mas a boa notícia é que você pode mudar isso a partir de hoje.
          </p>
        </div>

        {/* 🙏 ESPERANÇA - Mensagem Positiva e Transformadora */}
        <div className="mb-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/30">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">🙏</span> A Boa Notícia
          </h3>
          <p className="text-foreground text-lg leading-relaxed font-semibold mb-3">
            Deus não se afastou de você. Ele continua aqui, esperando que você retorne.
          </p>
          <p className="text-foreground leading-relaxed">
            Sua situação espiritual pode mudar completamente. Muitas pessoas que estavam exatamente no seu lugar conseguiram:
          </p>
          <div className="space-y-2 mt-4">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl">✨</span>
                <p className="text-foreground">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 PRÓXIMAS AÇÕES - Recomendações Práticas */}
        <div className="mb-8 p-6 bg-blue-50/30 rounded-lg border border-blue-200/50">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Seus Próximos Passos
          </h3>
          <div className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de ação secundários */}
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
                Baixar Resultado
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

        {/* ===== SEÇÃO DE OFERTA DO GUIA DEVOCIONAL (ALTA CONVERSÃO) ===== */}
        
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Oferta Principal com Urgência */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-8 border-2 border-accent/40 mb-8">
          {/* Badge de oferta especial com urgência */}
          <div className="text-center mb-6">
            <span className="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              ✨ OFERTA ESPECIAL HOJE
            </span>
          </div>

          {/* Headline Principal */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Você não precisa continuar se sentindo distante de Deus.
          </h2>

          {/* Subheadline */}
          <p className="text-center text-lg text-foreground/90 mb-6 leading-relaxed">
            Esse plano simples de 7 dias já ajudou muitas pessoas a retomarem sua vida espiritual — mesmo começando do zero.
          </p>

          {/* Título do Produto */}
          <div className="text-center mb-6 p-4 bg-white/60 rounded-lg">
            <h3 className="text-2xl font-bold text-accent mb-2">📖 Devocional: 7 Dias para se Reconectar com Deus</h3>
            <p className="text-foreground font-semibold">
              Baseado nas suas respostas, recomendamos que você comece hoje esse devocional.
            </p>
          </div>

          {/* Descrição emocional e urgente */}
          <div className="bg-white/60 rounded-lg p-6 mb-6">
            <p className="text-foreground text-center leading-relaxed mb-3">
              <strong>Em apenas 7 dias, você pode restaurar sua conexão com Deus, voltar a sentir paz e ter direção espiritual novamente.</strong>
            </p>
            <p className="text-foreground text-center leading-relaxed mb-4">
              Mesmo que você esteja sem rotina, sem força ou se sentindo distante.
            </p>
            <p className="text-foreground text-center leading-relaxed">
              Este devocional foi criado especialmente para sua situação espiritual. Você receberá 7 dias de reflexões bíblicas profundas, versículos específicos por situação, práticas espirituais diárias (5-10 min) e direcionamento espiritual baseado no seu resultado.
            </p>
          </div>

          {/* O que você recebe */}
          <div className="bg-white/40 rounded-lg p-6 mb-8">
            <h4 className="font-bold text-foreground mb-4 text-center">📦 O que você recebe:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">Devocional guiado (7 dias)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">Versículos específicos por situação</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">Reflexões simples e profundas</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">Passos práticos diários (5–10 min)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">Direcionamento espiritual baseado no resultado</p>
              </div>
            </div>
          </div>

          {/* Bônus */}
          <div className="bg-accent/10 rounded-lg p-4 mb-8 border border-accent/30">
            <h4 className="font-bold text-accent mb-2 text-center">🎁 BÔNUS ESPECIAL</h4>
            <p className="text-center text-foreground font-semibold">✓ Checklist diário com Deus</p>
          </div>

          {/* Preço e CTA com Contador de Urgência */}
          <div className="text-center mb-6 p-4 bg-red-50/50 rounded-lg border border-red-200/50">
            <p className="text-sm text-foreground/70 mb-2">Investimento único:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-accent">R$ 12,90</span>
            </div>
            <p className="text-xs text-foreground/60 mb-3">Acesso imediato ao PDF + Suporte por 7 dias</p>
            
            {/* Contador de Urgência */}
            <div className="bg-accent text-white rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold">⏰ Oferta disponível por:</p>
              <p className="text-2xl font-bold font-mono">{formatTimeLeft(timeLeft)}</p>
            </div>
            
            <p className="text-xs text-red-600 font-semibold">
              ⚠️ Esta oferta especial termina em 24 horas!
            </p>
          </div>

          {/* Botão de compra principal */}
          <div className="space-y-3">
            <Button
              onClick={() => handleBuyGuide('mercadopago')}
              disabled={isBuyingGuide}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg"
            >
              {isBuyingGuide && paymentMethod === 'mercadopago' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Quero me reconectar com Deus
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

          {/* Depoimento social proof */}
          <div className="bg-white/40 rounded-lg p-4">
            <p className="text-sm text-foreground italic text-center">
              "Este devocional mudou minha forma de orar e me aproximou muito mais de Deus. Recomendo para quem quer uma conexão real e transformadora."
            </p>
            <p className="text-xs text-foreground/70 text-center mt-2">— Marina S., Brasília</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground">
          Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.
        </p>
      </div>
    </div>
  );
}
