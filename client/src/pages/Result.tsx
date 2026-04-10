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
    
    const name = parsed[0] || "Querido(a)";
    setUserName(name);

    const storedLeadId = localStorage.getItem("quizLeadId");
    const parsedLeadId = storedLeadId ? Number(storedLeadId) : undefined;
    const leadDataRaw = localStorage.getItem("leadData");
    const leadData = leadDataRaw ? JSON.parse(leadDataRaw) : null;

    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setResult(parsedResult);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao parsear resultado salvo:", error);
        setIsLoading(false);
      }
    } else {
      generateResultMutation.mutate(
        { responses: parsed, leadId: parsedLeadId },
        {
          onSuccess: (data) => {
            if (data.success && data.result) {
              setResult(data.result);
              localStorage.setItem("quizResult", JSON.stringify(data.result));
            } else {
              setResult(null);
            }
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Erro ao gerar resultado:", error);
            setIsLoading(false);
          },
        }
      );

      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }

      fallbackTimeoutRef.current = window.setTimeout(() => {
        if (result === null) {
          setIsLoading(false);
        }
      }, 30000);
    }

    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

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

  const emojiMatch = result.profileName.match(/^(.)\s/);
  const emoji = emojiMatch ? emojiMatch[1] : "✨";
  const profileTitle = result.profileName.replace(/^(.)\s/, "");

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-2xl">
        
        {/* ===== SEÇÃO DE RESULTADO COM ESTRUTURA PROFISSIONAL ===== */}
        
        {/* 🔍 TÍTULO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Seu resultado: {profileTitle}
          </h1>
          <div className="text-6xl mb-4">{emoji}</div>
        </div>

        {/* 💔 DIAGNÓSTICO (CONEXÃO) */}
        <div className="mb-8 p-6 bg-secondary/50 rounded-lg border-l-4 border-accent">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">💔</span> Diagnóstico
          </h3>
          <p className="text-foreground text-lg leading-relaxed mb-3">
            {result.profileDescription}
          </p>
          <p className="text-foreground/80 text-sm italic">
            Isso não significa que você perdeu sua fé… mas pode indicar que você está se afastando da presença Dele sem perceber.
          </p>
        </div>

        {/* ⚠️ IMPACTO (DOR) */}
        <div className="mb-8 p-6 bg-red-50/30 rounded-lg border border-red-200/50">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Impacto
          </h3>
          <p className="text-foreground mb-4 font-semibold">Isso pode estar gerando em você:</p>
          <div className="space-y-2">
            {result.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <p className="text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🙏 VERDADE (AUTORIDADE + FÉ) */}
        <div className="mb-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/30">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">🙏</span> Verdade
          </h3>
          <p className="text-foreground text-lg leading-relaxed font-semibold mb-3">
            A verdade é que Deus não se afastou de você.
          </p>
          <p className="text-foreground text-lg leading-relaxed font-semibold">
            Ele continua presente — esperando apenas que você volte a se aproximar.
          </p>
        </div>

        {/* ✨ ESPERANÇA */}
        <div className="mb-8 p-6 bg-blue-50/30 rounded-lg border border-blue-200/50">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-2xl">✨</span> Esperança
          </h3>
          <p className="text-foreground text-lg leading-relaxed font-semibold">
            E a boa notícia é que isso pode começar a mudar ainda hoje, com pequenos passos.
          </p>
          <div className="space-y-2 mt-4">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl">✓</span>
                <p className="text-foreground">{strength}</p>
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

        {/* ===== SEÇÃO DE OFERTA IRRESISTÍVEL ===== */}
        
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* 🔄 TRANSIÇÃO */}
        <div className="text-center mb-8">
          <p className="text-lg text-foreground font-semibold">
            Pensando nisso, com base nas suas respostas…
          </p>
        </div>

        {/* 💰 🎯 OFERTA */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-8 border-2 border-accent/40 mb-8">
          
          {/* Badge de oferta especial */}
          <div className="text-center mb-6">
            <span className="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              ✨ OFERTA ESPECIAL HOJE
            </span>
          </div>

          {/* 🧾 NOME */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
            Devocional: 7 Dias para se Reconectar com Deus
          </h2>

          {/* 🧠 PROMESSA */}
          <p className="text-center text-lg text-foreground/90 mb-6 leading-relaxed font-semibold">
            Um plano simples e guiado que vai te ajudar a retomar sua conexão com Deus, organizar sua vida espiritual e voltar a sentir paz e direção.
          </p>

          {/* 💬 QUEBRA DE OBJEÇÃO */}
          <div className="bg-white/60 rounded-lg p-4 mb-6 text-center">
            <p className="text-foreground italic">
              Mesmo que você esteja sem rotina, sem força ou se sentindo distante.
            </p>
          </div>

          {/* 📦 O QUE VOCÊ VAI RECEBER */}
          <div className="bg-white/40 rounded-lg p-6 mb-8">
            <h4 className="font-bold text-foreground mb-4 text-center">📦 O que você vai receber:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">📖</span>
                <p className="text-foreground">Devocional guiado por 7 dias</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">🙏</span>
                <p className="text-foreground">Passos práticos de oração (5 a 10 minutos por dia)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">📌</span>
                <p className="text-foreground">Versículos certos para cada momento</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">💡</span>
                <p className="text-foreground">Reflexões simples e profundas</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl">🎯</span>
                <p className="text-foreground">Direcionamento baseado no seu resultado</p>
              </div>
            </div>
          </div>

          {/* 🎁 BÔNUS */}
          <div className="bg-accent/10 rounded-lg p-4 mb-8 border border-accent/30">
            <h4 className="font-bold text-accent mb-2 text-center">🎁 BÔNUS (IMPORTANTE)</h4>
            <p className="text-center text-foreground font-semibold">✔ Checklist diário com Deus</p>
          </div>

          {/* PERSONALIZAÇÃO (OURO) */}
          <div className="bg-yellow-50/50 rounded-lg p-4 mb-6 text-center border border-yellow-200/50">
            <p className="text-foreground font-semibold">
              Baseado nas suas respostas, recomendamos que você comece ainda hoje.
            </p>
          </div>

          {/* ⏳ URGÊNCIA LEVE */}
          <div className="text-center mb-6">
            <p className="text-foreground font-semibold mb-2">
              Comece hoje e já perceba diferença nos próximos dias.
            </p>
          </div>

          {/* Preço e CTA */}
          <div className="text-center mb-6 p-4 bg-red-50/50 rounded-lg border border-red-200/50">
            <p className="text-sm text-foreground/70 mb-2">Investimento único:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-accent">R$ 12,90</span>
            </div>
            
            {/* Contador de Urgência */}
            <div className="bg-accent text-white rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold">⏰ Oferta disponível por:</p>
              <p className="text-2xl font-bold font-mono">{formatTimeLeft(timeLeft)}</p>
            </div>
            
            <p className="text-xs text-red-600 font-semibold">
              ⚠️ Esta oferta especial termina em 24 horas!
            </p>
          </div>

          {/* CTA (BOTÃO) */}
          <div className="space-y-3">
            <Button
              onClick={() => handleBuyGuide('mercadopago')}
              disabled={isBuyingGuide}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 md:py-6 text-sm md:text-lg rounded-lg transition-all duration-200 h-auto"
            >
              {isBuyingGuide && paymentMethod === 'mercadopago' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  👉 Quero me reconectar com Deus
                </>
              )}
            </Button>

            {/* 🧨 EXTRA (AUMENTA MUITO A CONVERSÃO) */}
            <div className="text-center p-3 bg-green-50/50 rounded-lg border border-green-200/50">
              <p className="text-sm text-foreground font-semibold">
                ✔ Acesso imediato
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
