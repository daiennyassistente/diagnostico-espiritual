import { useState, useEffect, useRef, useMemo } from "react";
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

// Funções auxiliares FORA do componente para evitar problemas de inicialização
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
  
  // Memoizar o subtítulo introdutório para que não mude a cada render
  const memoizedIntroductoryMessage = useMemo(
    () => result ? generateIntroductoryMessage(result.profileName) : "",
    [result?.profileName]
  );
  
  // Memoizar a mensagem de consequência para que não mude a cada render
  const memoizedConsequenceMessage = useMemo(
    () => result ? generateConsequenceMessage(result.profileName, result.challenges) : "",
    [result?.profileName, result?.challenges]
  );
  
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
  }, [setLocation, generateResultMutation, isLoading]);

  const handleDownloadPDF = async () => {
    if (!result || !userName) return;

    setIsGeneratingPDF(true);
    try {
      generatePDFMutation.mutate(
        {
          profileName: result.profileName,
          profileDescription: result.profileDescription,
          strengths: result.strengths,
          challenges: result.challenges,
          recommendations: result.recommendations,
          nextSteps: result.nextSteps,
          responses: responses || {},
        },
        {
          onSuccess: (data: any) => {
            if (data.url) {
              const link = document.createElement("a");
              link.href = data.url;
              link.download = `diagnostico-espiritual-${userName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success("PDF baixado com sucesso!");
            }
            setIsGeneratingPDF(false);
          },
          onError: () => {
            toast.error("Erro ao gerar PDF. Tente novamente.");
            setIsGeneratingPDF(false);
          },
        }
      );
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
      setIsGeneratingPDF(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!result || !userName) return;

    setIsSharing(true);
    try {
      const message = `Olá! Fiz um diagnóstico espiritual e descobri que sou "${result.profileName}". Quer fazer também? Acesse: ${window.location.origin}/quiz`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
      toast.success("Compartilhado com sucesso!");
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Erro ao compartilhar. Tente novamente.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizResult");
    localStorage.removeItem("quizResponses");
    localStorage.removeItem("quizLeadId");
    localStorage.removeItem("leadData");
    clearQuizSessionState();
    setLocation("/quiz");
  };

  const handleBuyDevocional = async () => {
    if (!result || !userName) return;

    setIsBuyingGuide(true);
    try {
      createMercadoPagoCheckoutMutation.mutate(
        {
          email: localStorage.getItem("quizEmail") || "",
          profileName: result.profileName,
          userName: userName,
          userPhone: localStorage.getItem("quizPhone") || "",
        },
        {
          onSuccess: (data: any) => {
            if (data.url) {
              window.open(data.url, "_blank");
            }
            setIsBuyingGuide(false);
          },
          onError: () => {
            toast.error("Erro ao processar pagamento. Tente novamente.");
            setIsBuyingGuide(false);
          },
        }
      );
    } catch (error) {
      console.error("Erro ao comprar devocional:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
      setIsBuyingGuide(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin #0B1F3A mx-auto mb-4" />
          <p className="#2B2B2B font-medium">Gerando seu diagnóstico espiritual...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="#2B2B2B font-medium">Resultado não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br #FFFFFF py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 text-sm #2B2B2B">
          Não esqueça de rolar até o final da página
        </div>

        {/* Seção Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Título Dinâmico */}
          <h1 className="text-3xl md:text-4xl font-bold text-center #0B1F3A mb-4">
            {formatProfileHeadline(result.profileName)}
          </h1>

          {/* Subtítulo Dinâmico */}
          <p className="text-center #2B2B2B mb-6 text-lg leading-relaxed">
            {memoizedIntroductoryMessage}
          </p>

          <p className="text-center #2B2B2B mb-8">
            E a boa notícia? <span className="font-semibold #0B1F3A">Isso tem solução.</span>
          </p>

          {/* Caixa de Resultado */}
          <div className="#F5F1E8 border-l-4 #C9A24A p-6 mb-8 rounded">
            <p className="#2B2B2B mb-4">
              Seu resultado mostra com precisão o que está acontecendo na sua vida espiritual neste momento. Não é coincidência você estar aqui. Deus sabe exatamente o que você precisa.
            </p>
            <p className="#2B2B2B">
              <span className="font-semibold #0B1F3A">Seu diagnóstico:</span> {result.profileDescription}
            </p>
          </div>

          {/* Seção de Dor/Consequência */}
          <div className="#FFE8E8 border-l-4 border-red-600 p-6 mb-8 rounded">
            <h3 className="text-xl font-bold #0B1F3A mb-4">Se você continuar assim, o que vai acontecer?</h3>
            <p className="#2B2B2B mb-4">
              {memoizedConsequenceMessage}
            </p>
            <p className="#0B1F3A font-semibold">
              Mas aqui está o ponto: você NÃO precisa deixar isso acontecer.
            </p>
          </div>

          {/* Seção de Desafios */}
          <div className="#F5F1E8 border-l-4 #C9A24A p-6 mb-8 rounded">
            <h3 className="text-xl font-bold #0B1F3A mb-4">Você reconhece isso na sua vida?</h3>
            <ul className="space-y-2">
              {result.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start #2B2B2B">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Seção de Recomendações */}
          <div className="#F5F1E8 border-l-4 #C9A24A p-6 mb-8 rounded">
            <h3 className="text-xl font-bold #0B1F3A mb-4">O caminho para voltar é mais simples do que você pensa:</h3>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start #2B2B2B">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ações Rápidas */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Baixar
            </Button>
            <Button
              onClick={handleShareWhatsApp}
              disabled={isSharing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Compartilhar
            </Button>
            <Button
              onClick={handleRetakeQuiz}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer
            </Button>
          </div>
        </div>

        {/* Seção de Oferta */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-[#0B1F3A]">
          <div className="flex items-start gap-3 mb-6">
            <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
            <h2 className="text-2xl md:text-3xl font-bold">MAS AQUI ESTÁ O SEGREDO: Você não precisa fazer isso sozinho</h2>
          </div>

          <p className="#8B7D6B mb-6 text-lg">
            Sabe aquele sentimento de estar perdido espiritualmente? De não saber por onde começar? De querer voltar para Deus, mas não saber como?
          </p>

          <p className="#8B7D6B mb-8 text-lg font-semibold">
            Existe um caminho. E ele foi criado especialmente para você.
          </p>

          {/* Oferta */}
          <div className="bg-[#F5F1E8] rounded-lg p-8 mb-8 border border-[#C9A24A]">
            <h3 className="text-2xl font-bold mb-2">Um Plano Espiritual Guiado de 7 Dias Para Restaurar Sua Vida Com Deus</h3>
            <p className="#8B7D6B mb-6">Seu Guia Pessoal Para Voltar a Sentir a Presença de Deus</p>

            <p className="#8B7D6B mb-6">
              Este não é um devocional comum. É um plano criado especialmente para <span className="font-bold">VOCÊ</span>, baseado no seu diagnóstico espiritual. Cada dia foi pensado para levar você de volta à presença de Deus, passo a passo, sem pressa, sem julgamento.
            </p>

            <p className="#8B7D6B mb-8">
              Você vai descobrir como reconectar com Deus de forma profunda e real. Como sentir aquela paz que você sente falta. Como voltar a ter constância e propósito na sua vida espiritual.
            </p>

            <div className="bg-[#F5F1E8] border border-[#C9A24A] rounded p-4 mb-8">
              <p className="text-[#0B1F3A] font-semibold mb-4">⚠️ Este devocional foi criado especialmente para você</p>
              <ul className="space-y-3 #8B7D6B">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0B1F3A]">✨</span>
                  <span><span className="font-semibold">Saiba exatamente o que fazer cada dia</span> — sem dúvidas, sem culpa, sem se sentir perdido</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0B1F3A]">💎</span>
                  <span><span className="font-semibold">Sinta a presença de Deus voltando</span> — aquela paz que você sente falta vai voltar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0B1F3A]">🙏</span>
                  <span><span className="font-semibold">Tenha uma rotina espiritual que funciona</span> — constância que você sempre quis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0B1F3A]">📖</span>
                  <span><span className="font-semibold">Versículos que falam direto com seu coração</span> — não genéricos, mas para VOCÊ</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#0B1F3A]">⚡</span>
                  <span><span className="font-semibold">Transformação real em 7 dias</span> — não promessas vazias, mas mudança que você vai sentir</span>
                </li>
              </ul>
            </div>

            <div className="#FFE8E80 bg-opacity-20 border border-red-300 border-opacity-30 rounded p-4 mb-8">
              <p className="text-[#0B1F3A] font-bold mb-2">⚠️ Seu diagnóstico é único e pode expirar em {formatTimeLeft(timeLeft)}</p>
              <p className="#8B7D6B">
                Se você sair agora, pode perder esse direcionamento espiritual que foi criado especialmente para você. Deus está falando com você AGORA.
              </p>
            </div>

            <p className="#8B7D6B mb-8 text-lg italic">
              Imagine como seria acordar amanhã com clareza. Sentir Deus perto de você novamente. Ter uma direção, um propósito, uma paz que você não sente há tempo.
            </p>

            <p className="text-[#0B1F3A] font-bold text-lg mb-8">
              Isso pode começar hoje.
            </p>

            <Button
              onClick={handleBuyDevocional}
              disabled={isBuyingGuide}
              className="w-full #C9A24A #B8932A text-gray-900 font-bold py-6 text-lg rounded-lg flex items-center justify-center gap-2"
            >
              {isBuyingGuide ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Quero Voltar a Sentir a Presença de Deus
            </Button>

            <p className="text-center #8B7D6B mt-4 font-semibold">
              R$ 12,90 — Menos que um café ☕
            </p>
          </div>

          <div className="text-center">
            <p className="#8B7D6B mb-2">⏳ Seu resultado personalizado estará disponível por mais:</p>
            <p className="text-3xl font-bold text-yellow-300">{formatTimeLeft(timeLeft)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
