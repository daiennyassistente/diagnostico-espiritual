'use client';

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, CheckCircle2, Zap, AlertCircle, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateConversionCopy } from "@/lib/conversionCopy";

interface AIResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

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

  // Gerar copywriting personalizado
  const copy = generateConversionCopy(
    result.profileName,
    result.profileDescription,
    result.challenges,
    userName
  );

  return (
    <div className="min-h-screen bg-background px-4 py-8 spiritual-background">
      <div className="max-w-2xl mx-auto">
        {/* 🔴 1. HEADLINE FORTE E DIRETA */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#0B5FD3" }}>
            {copy.headline}
          </h1>
          <p className="text-sm text-gray-600">
            Seu diagnóstico espiritual personalizado está aqui
          </p>
        </div>

        {/* 🟡 2. IDENTIFICAÇÃO + VALIDAÇÃO */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <p className="text-gray-700 text-center leading-relaxed">
            {copy.identification}
          </p>
        </div>

        {/* 🔵 3. REVELAÇÃO DO DIAGNÓSTICO */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#C9A24A" }}>
          <div className="flex items-start gap-3 mb-3">
            <Heart size={24} style={{ color: "#C9A24A", flexShrink: 0 }} />
            <div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#0B5FD3" }}>
                Seu diagnóstico é único
              </h3>
              <p className="text-gray-700 text-sm">
                {result.profileDescription}
              </p>
            </div>
          </div>
        </div>

        {/* 🟠 4. ESCALADA DE DOR (IMPORTANTE) */}
        <div className="mb-8 rounded-lg p-6 border-l-4" style={{ borderLeftColor: "#DC2626", backgroundColor: "#FEE2E2" }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#DC2626" }}>
            <AlertCircle size={20} />
            Se você continuar assim...
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {copy.painEscalation}
          </p>
        </div>

        {/* 🟢 5. VIRADA (ESPERANÇA) */}
        <div className="mb-8 text-center">
          <p className="text-lg font-bold" style={{ color: "#0B5FD3" }}>
            {copy.hope}
          </p>
        </div>

        {/* 🟣 6. APRESENTAÇÃO DO PRODUTO */}
        <div className="mb-8 bg-white rounded-lg p-8 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <h3 className="text-2xl font-bold text-center mb-4" style={{ color: "#0B5FD3" }}>
            {copy.productTitle}
          </h3>
          <p className="text-gray-700 text-center text-sm leading-relaxed mb-4">
            {copy.productDescription}
          </p>

          {/* 🟤 7. BENEFÍCIOS (EM BULLET POINTS) */}
          <h4 className="font-bold text-lg mb-4 text-center" style={{ color: "#0B5FD3" }}>
            O que você vai ganhar:
          </h4>
          <ul className="space-y-3 mb-6">
            {copy.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700 text-sm">
                <span style={{ color: "#C9A24A" }} className="text-lg flex-shrink-0">
                  {benefit.split(" ")[0]}
                </span>
                <span>{benefit.substring(benefit.indexOf(" ") + 1)}</span>
              </li>
            ))}
          </ul>

          {/* 🔴 8. PROVA SOCIAL */}
          <div className="text-center mb-6 p-4 rounded-lg" style={{ backgroundColor: "#F5F1E8" }}>
            <p className="text-sm font-semibold" style={{ color: "#0B5FD3" }}>
              ✨ {copy.socialProof}
            </p>
          </div>

          {/* ⚫ 9. URGÊNCIA FORTE */}
          <div className="rounded-lg p-4 mb-6" style={{ borderLeftColor: "#DC2626", backgroundColor: "#FEE2E2", borderLeft: "4px solid #DC2626" }}>
            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: "#DC2626" }}>
              <Zap size={18} />
              Atenção: Seu resultado expira em {formatTimeLeft(timeLeft)}
            </h4>
            <p style={{ color: "#DC2626" }} className="text-xs leading-relaxed">
              {copy.urgencyMessage}
            </p>
          </div>

          {/* 🟢 11. FECHAMENTO EMOCIONAL */}
          <p className="text-gray-700 text-center text-sm leading-relaxed mb-6 italic">
            "{copy.closingStatement}"
          </p>

          {/* 🟡 10. CTA (BOTÃO) */}
          <button
            onClick={() => {
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 mb-2"
            style={{ backgroundColor: "#FFD700", color: "#000" }}
          >
            <Zap size={20} className="inline mr-2" />
            {copy.ctaPrimary}
          </button>

          {/* 🟢 11. PREÇO */}
          <p className="text-center font-semibold" style={{ color: "#C9A24A" }}>
            R$ 12,90 — Menos que um café ☕
          </p>
        </div>

        {/* AÇÕES SECUNDÁRIAS */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            variant="outline"
            className="border-2"
            style={{ borderColor: "#FFD700", color: "#2B2B2B" }}
          >
            <Download size={18} className="mr-2" />
            {isGeneratingPDF ? "Baixando..." : "Baixar Resultado"}
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
            Refazer Quiz
          </Button>
        </div>

        {/* TIMER FINAL */}
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
