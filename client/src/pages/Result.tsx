'use client';

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateDeepSpiritualDiagnosis } from "@/lib/deepSpiritualDiagnosis";

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
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#3E342C" }} />
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

  return (
    <div className="min-h-screen spiritual-background relative">
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* SEÇÃO 1: ABERTURA INTIMISTA */}
        <section className="mb-12 text-center">
          <div className="text-lg leading-relaxed text-foreground whitespace-pre-line font-medium mb-6">
            {diagnosis.opening}
          </div>
        </section>

        {/* SEÇÃO 2: EXPLICAÇÃO PROFUNDA */}
        <section className="quiz-card mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Sua situação espiritual</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.deepExplanation.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: RAIZ DO PROBLEMA */}
        <section className="quiz-card mb-12 border-l-4" style={{ borderLeftColor: "#3E342C" }}>
          <h2 className="text-2xl font-semibold mb-6 text-primary">A raiz do problema</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.rootOfProblem.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 4: CONSEQUÊNCIA REAL */}
        <section className="quiz-card mb-12" style={{ backgroundColor: "#FAF6F1" }}>
          <h2 className="text-2xl font-semibold mb-6 text-primary">O impacto real</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.realConsequence.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 5: CONEXÃO EMOCIONAL */}
        <section className="quiz-card mb-12" style={{ backgroundColor: "#F9F5F0" }}>
          <h2 className="text-2xl font-semibold mb-6 text-primary">Você não está sozinho</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.emotionalConnection.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 6: ACOLHIMENTO */}
        <section className="quiz-card text-center mb-12">
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4 italic">
            {diagnosis.acceptance.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 7: TRANSIÇÃO PARA SOLUÇÃO */}
        <section className="quiz-card mb-12 bg-gradient-to-br" style={{ backgroundColor: "#F5F1EA" }}>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4 font-medium">
            {diagnosis.transitionToSolution.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 8: SOLUÇÃO - PLANO PERSONALIZADO */}
        <section className="quiz-card mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Seu plano de transformação</h2>
          
          <div className="text-base leading-relaxed text-foreground mb-8">
            <p className="mb-4">Um plano simples de 7 dias. Não é um devocional comum. É um caminho de volta. Feito especialmente para você.</p>
            <p>Para sua situação. Para sua alma. Para sua transformação.</p>
          </div>

          {/* BENEFÍCIOS */}
          <div className="mb-8 bg-secondary/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-primary">O que você vai conseguir:</h3>
            <div className="space-y-3">
              {[
                "Clareza sobre sua vida espiritual",
                "Sentir a presença de Deus voltando",
                "Criar uma rotina que funciona",
                "Voltar a ter direção",
                "Transformação real em 7 dias"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span style={{ color: "#3E342C" }} className="text-lg flex-shrink-0 mt-1 font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHAMADO INTERNO */}
          <div className="rounded-lg p-6 mb-8 bg-muted/20 border-l-4" style={{ borderLeftColor: "#3E342C" }}>
            <div className="text-sm leading-relaxed text-foreground italic">
              <p className="mb-3">Talvez esse seja o momento. O momento em que você para de ignorar o que sente.</p>
              <p className="mb-3">O momento em que você decide voltar.</p>
              <p className="font-semibold">Não ignore isso dentro de você. Esse chamado que você está sentindo… é real.</p>
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <button
            onClick={() => {
              const checkoutUrl = `${window.location.origin}/checkout`;
              window.open(checkoutUrl, "_blank");
            }}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 mb-4 flex items-center justify-center gap-2 text-primary-foreground"
            style={{ backgroundColor: "#3E342C" }}
          >
            <Zap size={20} />
            Quero recomeçar com Deus
          </button>

          {/* PREÇO */}
          <div className="text-center bg-secondary/40 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-foreground font-medium">
              R$ 12,90<br />
              Menos que um café. Mas que pode mudar tudo.
            </p>
          </div>
        </section>

        {/* SEÇÃO 9: REFLEXÃO FINAL */}
        <section className="quiz-card text-center mb-12">
          <div className="text-base leading-relaxed text-foreground italic">
            <p className="font-semibold">Você merece estar perto de Deus.</p>
            <p className="mt-2">Você merece sentir paz.</p>
            <p className="mt-2">Você merece voltar.</p>
          </div>
        </section>

        {/* SEÇÃO 10: AÇÕES SECUNDÁRIAS */}
        <section className="mb-12">
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#3E342C", color: "#3E342C" }}
            >
              <Download size={18} className="mr-2" />
              {isGeneratingPDF ? "Baixando..." : "Baixar Resultado"}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#3E342C", color: "#3E342C" }}
            >
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="border-2"
              style={{ borderColor: "#3E342C", color: "#3E342C" }}
            >
              <RotateCcw size={18} className="mr-2" />
              Refazer Quiz
            </Button>
          </div>
        </section>

        {/* SEÇÃO 11: TIMER */}
        <section className="quiz-card text-center">
          <p className="text-foreground/60 text-sm mb-2">⏳ Seu resultado estará disponível por mais:</p>
          <p style={{ color: "#3E342C" }} className="font-bold text-2xl">
            {formatTimeLeft(timeLeft)}
          </p>
        </section>
      </div>
    </div>
  );
}
