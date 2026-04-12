'use client';

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateSpiritualPageCopy } from "@/lib/spiritualCopy";

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
  return {
    profileName: "em busca de profundidade espiritual",
    profileDescription: "Você está vivendo uma fase espiritualmente marcada por uma sede profunda, porém sem direção clara.",
    strengths: [
      "Reconhecimento genuíno da necessidade de Deus",
      "Desejo sincero de mudança",
      "Abertura para receber orientação espiritual",
    ],
    challenges: [
      "Falta de disciplina na Palavra e oração",
      "Sensação de ausência de direção espiritual",
      "Dificuldade para manter a sensibilidade espiritual",
    ],
    recommendations: [],
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
    const text = `Fiz meu diagnóstico espiritual e descobri coisas importantes sobre minha jornada com Deus! Você também deveria fazer: ${window.location.origin}`;
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
        </div>
      </div>
    );
  }

  // Gerar copywriting espiritual
  const copy = generateSpiritualPageCopy(
    result.profileName,
    result.profileDescription,
    result.challenges,
    userName
  );

  return (
    <div className="min-h-screen bg-background px-4 py-12 spiritual-background">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 🔴 ABERTURA */}
        <div className="text-center space-y-4">
          <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line font-medium">
            {copy.opening}
          </div>
        </div>

        {/* 🟡 IDENTIFICAÇÃO */}
        <div className="text-center space-y-4">
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {copy.identification}
          </div>
        </div>

        {/* 🔵 REVELAÇÃO */}
        <div className="bg-white rounded-lg p-8 border-l-4" style={{ borderLeftColor: "#C9A24A" }}>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {copy.revelation}
          </div>
        </div>

        {/* 🟠 CONFRONTO COM AMOR */}
        <div className="rounded-lg p-8 border-l-4" style={{ borderLeftColor: "#DC2626", backgroundColor: "#FEE2E2" }}>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line" style={{ color: "#991B1B" }}>
            {copy.truthWithLove}
          </div>
        </div>

        {/* 🟢 VERDADE BÍBLICA */}
        <div className="text-center space-y-4">
          <div className="text-base leading-relaxed font-semibold" style={{ color: "#0B5FD3" }}>
            <div className="whitespace-pre-line">{copy.biblicalTruth}</div>
          </div>
        </div>

        {/* 🟣 ESPERANÇA */}
        <div className="text-center space-y-4">
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line italic">
            {copy.hope}
          </div>
        </div>

        {/* 🟤 SOLUÇÃO */}
        <div className="bg-white rounded-lg p-8 border-l-4" style={{ borderLeftColor: "#0B5FD3" }}>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line mb-8">
            {copy.solutionIntro}
          </div>

          {/* BENEFÍCIOS */}
          <div className="mb-8">
            <div className="text-sm leading-relaxed space-y-3">
              {copy.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <span style={{ color: "#C9A24A" }} className="text-lg flex-shrink-0 mt-1">
                    ✔
                  </span>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHAMADO INTERNO */}
          <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: "#F5F1E8" }}>
            <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line italic">
              {copy.internalCall}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 mb-4"
            style={{ backgroundColor: "#FFD700", color: "#000" }}
          >
            <Zap size={20} className="inline mr-2" />
            {copy.ctaPrimary}
          </button>

          {/* PREÇO */}
          <p className="text-center text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {copy.priceMessage}
          </p>
        </div>

        {/* REFLEXÃO DE FECHAMENTO */}
        <div className="text-center space-y-4">
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line italic">
            {copy.closingReflection}
          </div>
        </div>

        {/* AÇÕES SECUNDÁRIAS */}
        <div className="flex gap-3 flex-wrap justify-center">
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

        {/* TIMER */}
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">⏳ Seu resultado estará disponível por mais:</p>
          <p style={{ color: "#C9A24A" }} className="font-bold text-lg">
            {formatTimeLeft(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
}
