'use client';

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, CheckCircle2, Zap, AlertCircle } from "lucide-react";
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
  return "Você não está sozinho nesse sentimento. Muitos cristãos passam por exatamente o que você está vivendo agora.";
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

const formatTimeLeft = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const buildFallbackResult = (responses: Record<string, string>): AIResult => {
  const profileName = "em busca de profundidade espiritual";
  return {
    profileName,
    profileDescription: "Você está vivendo uma fase espiritualmente marcada por uma sede profunda, porém sem direção clara. Há um anseio real de reencontro com Deus.",
    strengths: [
      "Reconhecimento genuíno da necessidade de Deus",
      "Desejo sincero de mudança e transformação",
      "Abertura para receber orientação espiritual",
    ],
    challenges: [
      "Falta de disciplina que impede a constância na Palavra e oração",
      "Sensação de ausência de direção espiritual clara",
      "Dificuldade para manter a sensibilidade espiritual ativa",
    ],
    recommendations: [
      "Estruture uma rotina diária simples de 15 minutos focados na leitura bíblica e oração, priorizando qualidade sobre quantidade",
      "Busque orar pedindo especificamente por direção do Espírito Santo, reconhecendo que Deus guia os corações que se entregam",
    ],
    nextSteps: [],
  };
};

const clearQuizSessionState = () => {
  sessionStorage.removeItem("quizStep");
  sessionStorage.removeItem("quizResponses");
  sessionStorage.removeItem("quizPendingResultRedirect");
};

export default function Result() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<AIResult | null>(null);
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("userName");
    const storedResponses = sessionStorage.getItem("quizResponses");

    if (storedUserName) setUserName(storedUserName);
    if (storedResponses) setResponses(JSON.parse(storedResponses));

    const fetchResult = async () => {
      try {
        const result = await trpc.quiz.getResult.query();
        if (result) {
          setResult(result);
          return;
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      }
      
      // Only set fallback if API failed
      const fallback = buildFallbackResult(storedResponses ? JSON.parse(storedResponses) : {});
      setResult(fallback);
    };

    fetchResult();

    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await trpc.quiz.downloadPDF.mutate();
      if (response?.url) {
        const link = document.createElement("a");
        link.href = response.url;
        link.download = `diagnostico-espiritual-${userName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Erro ao baixar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    const text = `Fiz meu diagnóstico espiritual e descobri coisas importantes sobre minha vida com Deus! Você também deveria fazer: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: "Diagnóstico Espiritual", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleRetake = () => {
    clearQuizSessionState();
    setLocation("/quiz");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#0B5FD3" }} />
          <p className="text-gray-700 font-medium">Gerando seu diagnóstico personalizado...</p>
          <p className="text-sm text-gray-500 mt-2">Se a análise inteligente demorar, mostraremos um resultado padrão.</p>
        </div>
      </div>
    );
  }

  const headline = formatProfileHeadline(result.profileName);
  const introMessage = generateIntroductoryMessage(result.profileName);
  const consequenceMessage = generateConsequenceMessage(result.profileName, result.challenges);

  return (
    <div className="min-h-screen bg-background px-4 py-8 spiritual-background">
      <div className="max-w-2xl mx-auto">
        {/* Header Note */}
        <div className="text-center mb-8 text-sm text-gray-600">
          Não esqueça de rolar até o final da página
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ color: "#0B5FD3" }}>
          {headline}
        </h1>

        {/* Intro Text */}
        <div className="text-center mb-8 text-gray-700">
          <p className="mb-4">{introMessage}</p>
          <p className="mb-4">
            E a boa notícia? <span style={{ color: "#0B5FD3" }} className="font-bold">Isso tem solução.</span>
          </p>
        </div>

        {/* Diagnosis Box */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <p className="text-gray-700 mb-4">
            Seu resultado mostra com precisão o que está acontecendo na sua vida espiritual neste momento. Não é coincidência você estar aqui. Deus sabe exatamente o que você precisa.
          </p>
          <p className="text-gray-700">
            <span style={{ color: "#0B5FD3" }} className="font-bold">Seu diagnóstico:</span> {userName}, {result.profileDescription}
          </p>
        </div>

        {/* Pain/Consequence Box */}
        <div className="mb-8 rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#DC2626", backgroundColor: "#FEE2E2" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "#DC2626" }}>
            Se você continuar assim, o que vai acontecer?
          </h2>
          <p className="text-gray-700 mb-4">{consequenceMessage}</p>
          <p style={{ color: "#DC2626" }} className="font-bold">
            Mas aqui está o ponto: você NÃO precisa deixar isso acontecer.
          </p>
        </div>

        {/* Challenges Box */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0B5FD3" }}>
            Você reconhece isso na sua vida?
          </h2>
          <ul className="space-y-3">
            {result.challenges && result.challenges.map((challenge: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700">
                <CheckCircle2 size={20} style={{ color: "#0B5FD3", flexShrink: 0, marginTop: "2px" }} />
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations Box */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0B5FD3" }}>
            O caminho para voltar é mais simples do que você pensa:
          </h2>
          <ul className="space-y-3">
            {result.recommendations && result.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700">
                <CheckCircle2 size={20} style={{ color: "#0B5FD3", flexShrink: 0, marginTop: "2px" }} />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            variant="outline"
            className="border-2"
            style={{ borderColor: "#FFD700", color: "#2B2B2B" }}
          >
            <Download size={18} className="mr-2" />
            {isGeneratingPDF ? "Baixando..." : "Baixar"}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-2"
            style={{ borderColor: "#FFD700", color: "#2B2B2B" }}
          >
            <Share2 size={18} className="mr-2" />
            Compartilhar
          </Button>
          <Button
            onClick={handleRetake}
            variant="outline"
            className="border-2"
            style={{ borderColor: "#FFD700", color: "#2B2B2B" }}
          >
            <RotateCcw size={18} className="mr-2" />
            Refazer
          </Button>
        </div>

        {/* Transition Section - No Card */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#0B5FD3" }}>
            <Zap size={24} className="inline mr-2" style={{ color: "#C9A24A" }} />
            MAS AQUI ESTÁ O SEGREDO: Você não precisa fazer isso sozinho
          </h2>

          <p className="mb-4 text-gray-700">
            Sabe aquele sentimento de estar perdido espiritualmente? De não saber por onde começar? De querer voltar para Deus, mas não saber como?
          </p>
          <p className="mb-6 text-gray-700">
            Existe um caminho. E ele foi criado especialmente para você.
          </p>
        </div>

        {/* Offer Section - Single Card */}
        <div className="mb-8 bg-white rounded-lg p-8 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <h3 className="text-xl font-bold text-center mb-2" style={{ color: "#0B5FD3" }}>
            Um Plano Espiritual Guiado de 7 Dias Para Restaurar Sua Vida Com Deus
          </h3>
          <p className="text-gray-700 text-center text-sm">
            Este não é um devocional comum. É um plano criado especialmente para <span className="font-bold">VOCÊ</span>, baseado no seu diagnóstico espiritual. Cada dia foi pensado para levar você de volta à presença de Deus, passo a passo, sem pressa, sem julgamento.
          </p>
          <p className="text-gray-700 text-center text-sm mt-3">
            Você vai descobrir como reconectar com Deus de forma profunda e real. Como sentir aquela paz que você sente falta. Como voltar a ter constância e propósito na sua vida espiritual.
          </p>

          <h3 className="text-lg font-bold mt-6 mb-4" style={{ color: "#0B5FD3" }}>
            O que você vai ganhar:
          </h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-gray-700 text-sm">
              <span style={{ color: "#C9A24A" }} className="text-lg">✨</span>
              <span><span className="font-bold">Saiba exatamente o que fazer cada dia</span> — sem dúvidas, sem culpa, sem se sentir perdido</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700 text-sm">
              <span style={{ color: "#C9A24A" }} className="text-lg">💎</span>
              <span><span className="font-bold">Sinta a presença de Deus voltando</span> — aquela paz que você sente falta vai voltar</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700 text-sm">
              <span style={{ color: "#C9A24A" }} className="text-lg">🙏</span>
              <span><span className="font-bold">Tenha uma rotina espiritual que funciona</span> — constância que você sempre quis</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700 text-sm">
              <span style={{ color: "#C9A24A" }} className="text-lg">📖</span>
              <span><span className="font-bold">Versículos que falam direto com seu coração</span> — não genéricos, mas para VOCÊ</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700 text-sm">
              <span style={{ color: "#C9A24A" }} className="text-lg">⚡</span>
              <span><span className="font-bold">Transformação real em 7 dias</span> — não promessas vazias, mas mudança que você vai sentir</span>
            </li>
          </ul>

          <div className="rounded-lg p-4 mb-6" style={{ borderLeftColor: "#DC2626", backgroundColor: "#FEE2E2", borderLeft: "4px solid #DC2626" }}>
            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "#DC2626" }}>
              <AlertCircle size={18} />
              Seu diagnóstico é único e pode expirar em {formatTimeLeft(timeLeft)}
            </h4>
            <p style={{ color: "#DC2626" }} className="text-xs">
              Se você sair agora, pode perder esse direcionamento espiritual que foi criado especialmente para você. Deus está falando com você AGORA.
            </p>
          </div>

          <p className="text-gray-700 text-center text-sm mb-4">
            Imagine como seria acordar amanhã com clareza. Sentir Deus perto de você novamente. Ter uma direção, um propósito, uma paz que você não sente há tempo.
          </p>
          <p style={{ color: "#0B5FD3" }} className="font-bold text-center mb-6">
            Isso pode começar hoje.
          </p>

          {/* Purchase Button Inside Card */}
          <button
            onClick={() => {
              // Trigger checkout
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "#FFD700", color: "#000" }}
          >
            <Zap size={20} className="inline mr-2" />
            Quero Voltar a Sentir a Presença de Deus
          </button>
          <p className="text-center mt-2 font-semibold" style={{ color: "#C9A24A" }}>
            R$ 12,90 — Menos que um café ☕
          </p>
        </div>

        {/* Timer Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">⏳ Seu resultado personalizado estará disponível por mais:</p>
          <p style={{ color: "#C9A24A" }} className="font-bold text-lg">
            {formatTimeLeft(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
}
