'use client';

import { useState, useEffect } from "react";
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

  const copy = generateSpiritualPageCopy(
    result.profileName,
    result.profileDescription,
    result.challenges,
    userName
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* SEÇÃO 1: ABERTURA */}
        <section className="mb-12 text-center">
          <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line font-medium mb-6">
            {copy.opening}
          </div>
        </section>

        {/* SEÇÃO 2: IDENTIFICAÇÃO */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0B5FD3" }}>Você não está sozinho</h2>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {copy.identification}
          </div>
        </section>

        {/* SEÇÃO 3: DIAGNÓSTICO */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm border-l-4" style={{ borderLeftColor: "#C9A24A" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0B5FD3" }}>Seu diagnóstico</h2>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {copy.revelation}
          </div>
        </section>

        {/* SEÇÃO 4: CONFRONTO COM AMOR */}
        <section className="mb-12 bg-red-50 rounded-lg p-8 border-l-4 border-red-400">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#991B1B" }}>A verdade que importa</h2>
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line" style={{ color: "#7F1D1D" }}>
            {copy.truthWithLove}
          </div>
        </section>

        {/* SEÇÃO 5: VERDADE BÍBLICA */}
        <section className="mb-12 bg-blue-50 rounded-lg p-8 border-l-4 border-blue-400">
          <div className="text-base leading-relaxed font-semibold" style={{ color: "#0B5FD3" }}>
            <div className="whitespace-pre-line">{copy.biblicalTruth}</div>
          </div>
        </section>

        {/* SEÇÃO 6: ESPERANÇA */}
        <section className="mb-12 text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line italic">
            {copy.hope}
          </div>
        </section>

        {/* SEÇÃO 7: SOLUÇÃO */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#0B5FD3" }}>Seu plano personalizado</h2>
          
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line mb-8">
            {copy.solutionIntro}
          </div>

          {/* BENEFÍCIOS */}
          <div className="mb-8 bg-white rounded-lg p-6">
            <h3 className="font-bold mb-4" style={{ color: "#0B5FD3" }}>O que você vai conseguir:</h3>
            <div className="space-y-3">
              {copy.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span style={{ color: "#C9A24A" }} className="text-lg flex-shrink-0 mt-1">
                    ✔
                  </span>
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHAMADO INTERNO */}
          <div className="rounded-lg p-6 mb-8 bg-white border-l-4" style={{ borderLeftColor: "#C9A24A" }}>
            <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line italic">
              {copy.internalCall}
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <button
            onClick={() => {
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 mb-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#FFD700", color: "#000" }}
          >
            <Zap size={20} />
            {copy.ctaPrimary}
          </button>

          {/* PREÇO */}
          <div className="text-center bg-white rounded-lg p-4">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line font-semibold">
              {copy.priceMessage}
            </p>
          </div>
        </section>

        {/* SEÇÃO 8: REFLEXÃO FINAL */}
        <section className="mb-12 text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line italic">
            {copy.closingReflection}
          </div>
        </section>

        {/* SEÇÃO 9: AÇÕES SECUNDÁRIAS */}
        <section className="mb-12">
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#0B5FD3", color: "#0B5FD3" }}
            >
              <Download size={18} className="mr-2" />
              {isGeneratingPDF ? "Baixando..." : "Baixar Resultado"}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#0B5FD3", color: "#0B5FD3" }}
            >
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#0B5FD3", color: "#0B5FD3" }}
            >
              <RotateCcw size={18} className="mr-2" />
              Refazer Quiz
            </Button>
          </div>
        </section>

        {/* SEÇÃO 10: TIMER */}
        <section className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-2">⏳ Seu resultado estará disponível por mais:</p>
          <p style={{ color: "#C9A24A" }} className="font-bold text-2xl">
            {formatTimeLeft(timeLeft)}
          </p>
        </section>
      </div>
    </div>
  );
}
