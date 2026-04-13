'use client';

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateDeepSpiritualDiagnosis } from "@/lib/deepSpiritualDiagnosis";
import { generatePersonalizedTitle } from "@/lib/personalizedTitles";
import { generateSpiritualPageCopy } from "@/lib/spiritualCopy";
import { readStoredQuizState, resolveLeadIdFromSources } from "@/lib/resultState";
import { buildResultHeadline } from "@/lib/resultHeadline";

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

const clearQuizSessionState = () => {
  sessionStorage.removeItem("quizStep");
  sessionStorage.removeItem("quizResponses");
  sessionStorage.removeItem("quizPendingResultRedirect");
};

export default function Result() {
  const [, setLocation] = useLocation();
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);

  // Get leadId from URL query string, with localStorage fallback
  useEffect(() => {
    const resolvedLeadId = resolveLeadIdFromSources(
      window.location.search,
      window.localStorage.getItem('quizLeadId')
    );

    if (resolvedLeadId) {
      setLeadId(resolvedLeadId);
    }
  }, []);

  // Get stored data from the latest persisted source
  useEffect(() => {
    const storedQuizState = readStoredQuizState({
      sessionUserName: window.sessionStorage.getItem("userName"),
      localUserName: window.localStorage.getItem("userName"),
      localResponses: window.localStorage.getItem("quizResponses"),
      sessionResponses: window.sessionStorage.getItem("quizResponses"),
    });

    if (storedQuizState.userName) {
      setUserName(storedQuizState.userName);
    }

    if (storedQuizState.responses) {
      setResponses(storedQuizState.responses);
    }
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch result using tRPC hook (only when leadId is available)
  const { data: trpcResult, isLoading, refetch } = trpc.quiz.getResult.useQuery(
    leadId ? { leadId } : undefined,
    { enabled: !!leadId }
  );

  // Generate diagnosis mutation
  const generateDiagnosisMutation = trpc.aiResult.generateFromResponses.useMutation();

  // Generate diagnosis if needed
  useEffect(() => {
    if (trpcResult && !trpcResult.diagnostic && !isGeneratingDiagnosis && responses && leadId) {
      setIsGeneratingDiagnosis(true);
      
      // Convert responses to the format expected by the API
      const responsesMap: Record<string, string> = {};
      Object.entries(responses).forEach(([key, value]) => {
        const stepNum = parseInt(key, 10) + 1;
        responsesMap[`step${stepNum}`] = value;
      });
      
      generateDiagnosisMutation.mutate(
        {
          responses: responsesMap,
          leadId: leadId,
        },
        {
          onSuccess: () => {
            // Refetch the result after generating diagnosis
            setTimeout(() => {
              refetch();
              setIsGeneratingDiagnosis(false);
            }, 2000);
          },
          onError: (error) => {
            console.error('Error generating diagnosis:', error);
            setIsGeneratingDiagnosis(false);
            toast.error('Erro ao gerar diagnóstico');
          },
        }
      );
    }
  }, [trpcResult, isGeneratingDiagnosis, responses, leadId, generateDiagnosisMutation, refetch]);

  // Show loading state while fetching
  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center spiritual-background">
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1E40AF" }} />
          <p className="text-foreground font-medium">Preparando seu resultado...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !trpcResult || !trpcResult.diagnostic || isGeneratingDiagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center spiritual-background">
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1E40AF" }} />
          <p className="text-foreground font-medium">Gerando seu diagnóstico personalizado...</p>
        </div>
      </div>
    );
  }

  const result = trpcResult.diagnostic;

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

  const spiritualCopy = generateSpiritualPageCopy(
    result.profileName,
    result.profileDescription,
    result.challenges,
    userName
  );

  const resultHeadline = buildResultHeadline({
    profileName: result.profileName,
    personalizedTitle,
  });

  // Cores
  const AZUL_PROFUNDO = "#1E40AF";
  const OURO = "#D4AF37";
  const OURO_CLARO = "#F4E4C1";
  const AZUL_CLARO = "#EFF6FF";

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

  return (
    <div className="min-h-screen spiritual-background relative">
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* SEÇÃO 1: ABERTURA INTIMISTA */}
        <section className="mb-4 text-center">
          <p className="text-sm font-medium mb-6" style={{ color: AZUL_PROFUNDO }}>👇 Não esqueça de rolar até o final</p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-6" style={{ color: AZUL_PROFUNDO }}>
            {resultHeadline}
          </h1>
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

        {/* SEÇÃO 5: ACOLHIMENTO */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Você não está sozinho</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.acceptance.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 6: ESPERANÇA */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Há esperança</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {spiritualCopy.hope.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 7: TRANSIÇÃO PARA SOLUÇÃO */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>E aqui está o mais importante</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {diagnosis.transitionToSolution.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 8: APRESENTAÇÃO DA SOLUÇÃO */}
        <section className="quiz-card mb-12 text-slate-900" style={{ backgroundColor: "#F5EFE0" }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>✨ Seu plano de transformação</h2>
          <div className="text-base leading-relaxed whitespace-pre-line space-y-4 mb-8 text-center">
            {spiritualCopy.solutionIntro.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

          {/* Benefícios */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">O que você vai conseguir:</h3>
            <ul className="space-y-3">
              {spiritualCopy.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span style={{ color: OURO }} className="text-xl">✔</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chamado interno */}
          <div className="p-6 rounded-lg border mb-8" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)", borderColor: "#BFDBFE" }}>
            <p className="text-center text-lg font-medium">
              {spiritualCopy.internalCall}
            </p>
          </div>

          {/* CTA Principal */}
          <Button 
            size="lg" 
            className="w-full text-lg font-bold"
            style={{ backgroundColor: OURO, color: "#000" }}
          >
            <Zap className="w-5 h-5 mr-2" />
            {spiritualCopy.ctaPrimary}
          </Button>

          {/* Preço */}
          <p className="text-center text-sm mt-4 text-slate-600">
            {spiritualCopy.priceMessage}
          </p>
        </section>

        {/* SEÇÃO 9: REFLEXÃO FINAL */}
        <section className="quiz-card mb-12 bg-white border-2" style={{ borderColor: AZUL_PROFUNDO }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: AZUL_PROFUNDO }}>Você merece</h2>
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line space-y-4">
            {spiritualCopy.closingReflection.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* SEÇÃO 10: AÇÕES SECUNDÁRIAS */}
        <section className="mb-12 flex gap-4 justify-center flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRetake}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer
          </Button>
        </section>

        {/* SEÇÃO 11: TIMER */}
        <section className="text-center text-sm text-gray-500">
          <p>Seu resultado estará disponível por mais {formatTimeLeft(timeLeft)}</p>
        </section>
      </div>
    </div>
  );
}
