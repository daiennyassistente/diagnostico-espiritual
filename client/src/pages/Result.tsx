'use client';

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateDeepSpiritualDiagnosis } from "@/lib/deepSpiritualDiagnosis";
import { generatePersonalizedTitle } from "@/lib/personalizedTitles";

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
      <div className="min-h-screen flex items-center justify-center spiritual-background">
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1E40AF" }} />
          <p className="text-foreground font-medium">Gerando seu diagnóstico personalizado...</p>
        </div>
      </div>
    );
  }

  const diagnosis = generateDeepSpiritualDiagnosis(
    result.profileName,
    result.challenges,
    userName
  );

  const personalizedTitle = generatePersonalizedTitle(
    result.profileName,
    result.challenges,
    userName
  );

  // Cores
  const AZUL_PROFUNDO = "#1E40AF"; // Azul para títulos
  const OURO = "#D4AF37"; // Ouro vibrante
  const OURO_CLARO = "#F4E4C1"; // Ouro claro para fundos
  const AZUL_CLARO = "#EFF6FF"; // Azul muito claro para fundos

  return (
    <div className="min-h-screen spiritual-background relative">
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* SEÇÃO 1: ABERTURA INTIMISTA */}
        <section className="mb-12 text-center">
          <div className="text-lg leading-relaxed text-foreground whitespace-pre-line font-medium mb-6">
            {personalizedTitle}
          </div>
        </section>

        {/* SEÇÃO 2: EXPLICAÇÃO PROFUNDA */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Sua situação espiritual</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.deepExplanation.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: RAIZ DO PROBLEMA */}
        <section className="quiz-card mb-12 border-l-4 bg-white" style={{ borderLeftColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>A raiz do problema</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.rootOfProblem.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 4: CONSEQUÊNCIA REAL */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>O impacto real</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.realConsequence.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 5: CONEXÃO EMOCIONAL */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Você não está sozinho</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.emotionalConnection.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 6: ACOLHIMENTO */}
        <section className="quiz-card text-center mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Há esperança</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4 italic">
            {diagnosis.acceptance.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 7: TRANSIÇÃO PARA SOLUÇÃO */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4 font-medium">
            {diagnosis.transitionToSolution.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 8: SOLUÇÃO - PLANO PERSONALIZADO */}
        <section className="quiz-card mb-12 bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-2xl border-0">
          <h2 className="text-3xl font-bold mb-6 text-white" style={{ color: OURO }}>✨ Seu plano de transformação</h2>
          
          <div className="text-base leading-relaxed text-white/95 mb-8">
            <p className="mb-4 text-lg">Um plano simples de 7 dias. Não é um devocional comum. É um caminho de volta. Feito especialmente para você.</p>
            <p className="text-lg">Para sua situação. Para sua alma. Para sua transformação.</p>
          </div>

          {/* BENEFÍCIOS */}
          <div className="mb-8 bg-white/10 backdrop-blur rounded-lg p-6 border-2" style={{ borderColor: OURO }}>
            <h3 className="font-bold mb-4 text-white text-lg">O que você vai conseguir:</h3>
            <div className="space-y-3">
              {[
                "Clareza sobre sua vida espiritual",
                "Sentir a presença de Deus voltando",
                "Criar uma rotina que funciona",
                "Voltar a ter direção",
                "Transformação real em 7 dias"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-1 font-bold" style={{ color: OURO }}>
                    ✓
                  </span>
                  <span className="text-base text-white/95">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHAMADO INTERNO */}
          <div className="rounded-lg p-6 mb-8 bg-white/10 border-2 backdrop-blur" style={{ borderColor: OURO }}>
            <div className="text-base leading-relaxed text-white italic font-medium">
              <p className="mb-3">Talvez esse seja o momento. O momento em que você para de ignorar o que sente.</p>
              <p className="mb-3">O momento em que você decide voltar.</p>
              <p className="font-bold text-white text-lg">Não ignore isso dentro de você. Esse chamado que você está sentindo… é real.</p>
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <button
            onClick={() => {
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-5 rounded-xl font-bold text-xl transition-all hover:scale-105 mb-4 flex items-center justify-center gap-2 shadow-lg border-2"
            style={{ backgroundColor: OURO, color: "#000", borderColor: OURO }}
          >
            <Zap size={24} />
            <span>Quero recomeçar com Deus</span>
          </button>

          {/* PREÇO */}
          <div className="text-center bg-white/10 backdrop-blur rounded-lg p-4 border-2" style={{ borderColor: OURO }}>
            <p className="text-lg leading-relaxed text-white font-bold">
              R$ 12,90<br />
              <span className="text-base text-white/90">Menos que um café. Mas que pode mudar tudo.</span>
            </p>
          </div>
        </section>

        {/* SEÇÃO 9: REFLEXÃO FINAL */}
        <section className="quiz-card text-center mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Você merece</h2>
          <div className="text-base leading-relaxed text-foreground italic">
            <p className="font-bold text-lg">Você merece estar perto de Deus.</p>
            <p className="mt-3">Você merece sentir paz.</p>
            <p className="mt-3">Você merece voltar.</p>
          </div>
        </section>

        {/* SEÇÃO 10: AÇÕES SECUNDÁRIAS */}
        <section className="mb-12">
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="border-2 font-semibold"
              style={{ borderColor: AZUL_PROFUNDO, color: AZUL_PROFUNDO }}
            >
              <Download size={18} className="mr-2" />
              {isGeneratingPDF ? "Baixando..." : "Baixar Resultado"}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-2 font-semibold"
              style={{ borderColor: AZUL_PROFUNDO, color: AZUL_PROFUNDO }}
            >
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="border-2 font-semibold"
              style={{ borderColor: AZUL_PROFUNDO, color: AZUL_PROFUNDO }}
            >
              <RotateCcw size={18} className="mr-2" />
              Refazer Quiz
            </Button>
          </div>
        </section>

        {/* SEÇÃO 11: TIMER */}
        <section className="quiz-card text-center bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <p className="text-foreground/60 text-sm mb-2">⏳ Seu resultado estará disponível por mais:</p>
          <p style={{ color: AZUL_PROFUNDO }} className="font-bold text-3xl">
            {formatTimeLeft(timeLeft)}
          </p>
        </section>
      </div>
    </div>
  );
}
