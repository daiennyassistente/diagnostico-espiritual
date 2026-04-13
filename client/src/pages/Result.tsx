import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, RotateCcw, Share2, Sparkles, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { readStoredQuizState, resolveLeadIdFromSources } from "@/lib/resultState";
import { extractQuizInsights } from "@/lib/resultPersonalization";
import { parseStoredLeadData } from "@/lib/leadStorage";

interface AIResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

const clearQuizSessionState = () => {
  sessionStorage.removeItem("quizStep");
  sessionStorage.removeItem("quizResponses");
  sessionStorage.removeItem("quizCurrentStep");
  sessionStorage.removeItem("quizResponsesDraft");
  sessionStorage.removeItem("quizShowLeadForm");
  sessionStorage.removeItem("quizLeadDraft");
  sessionStorage.removeItem("quizHasStarted");
  sessionStorage.removeItem("quizPendingResultRedirect");
};

const formatTimeLeft = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}min`;
};

const ensureArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return ensureArray(parsed);
    } catch {
      return [];
    }
  }

  return [];
};

const buildResponsesMap = (responses: Record<string, string>) => {
  const mapped: Record<string, string> = {};

  Object.entries(responses).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    if (key.startsWith("step")) {
      mapped[key] = value;
      return;
    }

    const stepNumber = Number.parseInt(key, 10);
    if (!Number.isNaN(stepNumber)) {
      mapped[`step${stepNumber + 1}`] = value;
    }
  });

  return mapped;
};

export default function Result() {
  const [, setLocation] = useLocation();
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();
  const checkoutMutation = trpc.quiz.createMercadoPagoCheckout.useMutation();
  const generateDiagnosisMutation = trpc.aiResult.generateFromResponses.useMutation();

  useEffect(() => {
    const resolvedLeadId = resolveLeadIdFromSources(
      window.location.search,
      window.localStorage.getItem("quizLeadId"),
    );

    if (resolvedLeadId) {
      setLeadId(resolvedLeadId);
    }
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: trpcResult, isLoading, refetch } = trpc.quiz.getResult.useQuery(
    { leadId: leadId || 0 },
    {
      enabled: !!leadId,
      retry: false,
    },
  );

  useEffect(() => {
    if (!trpcResult || trpcResult.diagnostic || !responses || !leadId || isGeneratingDiagnosis) {
      return;
    }

    setIsGeneratingDiagnosis(true);

    generateDiagnosisMutation.mutate(
      {
        responses: buildResponsesMap(responses),
        leadId,
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error("Não foi possível gerar seu diagnóstico agora.");
        },
        onSettled: () => {
          setIsGeneratingDiagnosis(false);
        },
      },
    );
  }, [generateDiagnosisMutation, isGeneratingDiagnosis, leadId, refetch, responses, trpcResult]);

  const result: AIResult | null = useMemo(() => {
    if (!trpcResult?.diagnostic) {
      return null;
    }

    return {
      profileName: trpcResult.diagnostic.profileName,
      profileDescription: trpcResult.diagnostic.profileDescription,
      strengths: ensureArray(trpcResult.diagnostic.strengths),
      challenges: ensureArray(trpcResult.diagnostic.challenges),
      recommendations: ensureArray(trpcResult.diagnostic.recommendations),
      nextSteps: ensureArray(trpcResult.diagnostic.nextSteps),
    };
  }, [trpcResult]);

  const displayName = userName || user?.name || trpcResult?.lead?.name || "você";
  const quizInsights = useMemo(() => extractQuizInsights(responses), [responses]);

  useEffect(() => {
    if (!trpcResult?.diagnostic) {
      return;
    }

    localStorage.setItem("quizResult", JSON.stringify(result));

    if (trpcResult.lead?.whatsapp) {
      localStorage.setItem("userWhatsapp", trpcResult.lead.whatsapp);
    }
  }, [result, trpcResult]);

  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center spiritual-background">
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg">Carregando seu diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (isLoading || isGeneratingDiagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center spiritual-background">
        <Card className="max-w-md mx-auto p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Estamos preparando seu resultado</h2>
          <p className="text-muted-foreground">
            Estamos cruzando suas respostas para montar um diagnóstico coerente com o que você viveu no quiz.
          </p>
        </Card>
      </div>
    );
  }

  if (!trpcResult || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center spiritual-background p-4">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Resultado não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Não conseguimos localizar seu diagnóstico neste momento. Refaça o quiz para gerar um novo resultado.
          </p>
          <Button onClick={() => setLocation("/quiz")}>Refazer quiz</Button>
        </Card>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const token = trpcResult.payment?.downloadToken;
      if (!token) {
        toast.error("Seu PDF será liberado após a confirmação do pagamento.");
        return;
      }

      const response = await trpc.pdf.downloadPDF.mutate({ token });
      if (response?.url) {
        const link = document.createElement("a");
        link.href = response.url;
        link.download = `diagnostico-espiritual-${displayName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast.error("Não foi possível baixar o PDF agora.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Diagnóstico Espiritual",
      text: `Acabei de receber meu diagnóstico espiritual: ${result.profileName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado com sucesso!");
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Não foi possível compartilhar agora.");
    }
  };

  const handleRetake = () => {
    clearQuizSessionState();
    localStorage.removeItem("quizLeadId");
    localStorage.removeItem("quizResponses");
    localStorage.removeItem("quizResult");
    localStorage.removeItem("userWhatsapp");
    setLocation("/quiz");
  };

  const handleCheckout = async () => {
    if (!trpcResult) {
      toast.error("Seu resultado ainda está sendo carregado.");
      return;
    }

    const storedLeadData = parseStoredLeadData(localStorage.getItem("leadData"));
    const email = trpcResult.lead?.email || storedLeadData?.email || user?.email || "";
    const userPhone = trpcResult.lead?.whatsapp || storedLeadData?.whatsapp || "";
    const payerName = displayName || storedLeadData?.name || "Usuário";

    if (!email) {
      toast.error("Não encontramos seu e-mail para iniciar o pagamento.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const checkout = await checkoutMutation.mutateAsync({
        email,
        profileName: result.profileName,
        userName: payerName,
        userPhone,
      });

      if (!checkout.checkoutUrl) {
        toast.error("Não foi possível abrir o checkout agora.");
        return;
      }

      toast.success("Redirecionando para o pagamento...");
      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast.error("Erro ao iniciar o pagamento. Tente novamente.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="spiritual-background min-h-screen py-10 px-4">
      <div className="container max-w-5xl">
        <section className="quiz-card mb-8 border border-accent/40 bg-[#FAF4E7] backdrop-blur">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary/70">Diagnóstico espiritual</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">
                {displayName}, seu perfil atual aponta para <span className="text-primary">{result.profileName}</span>
              </h1>
            </div>
          </div>

          <p className="text-lg leading-8 text-slate-700 whitespace-pre-line">
            {result.profileDescription}
          </p>
        </section>



        <section className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 border-[#D7C08A] bg-white">
            <h2 className="text-2xl font-semibold text-primary mb-4">Pontos de força que apareceram em você</h2>
            <ul className="space-y-3 text-[#27405F]">
              {result.strengths.map((item, index) => (
                <li key={index} className="rounded-lg bg-white/85 px-4 py-3 border border-[#E5D5B1]">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-[#D7C08A] bg-white">
            <h2 className="text-2xl font-semibold text-primary mb-4">Bloqueios que mais pesam hoje</h2>
            <ul className="space-y-3 text-[#27405F]">
              {result.challenges.map((item, index) => (
                <li key={index} className="rounded-lg bg-white/85 px-4 py-3 border border-[#E5D5B1]">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </section>



        {result.nextSteps.length > 0 && (
          <section className="quiz-card mb-8 border border-accent/40 bg-[linear-gradient(135deg,#1E4E8C_0%,#17406F_100%)] text-primary-foreground">
            <p className="text-sm uppercase tracking-[0.25em] text-primary-foreground/70 mb-3">Seu próximo passo</p>
            <h2 className="text-2xl font-semibold mb-4">Comece por aqui</h2>
            <p className="text-lg leading-8">{result.nextSteps[0]}</p>
          </section>
        )}

        <section className="quiz-card mb-10 bg-[#FAF4E7] border-[#D7C08A] text-[#27405F]">
          <h2 className="text-2xl font-semibold text-primary mb-4">Seu devocional de 7 dias foi pensado para este momento</h2>
          <p className="text-base leading-7 mb-6">
            Em vez de um material genérico, o próximo passo é receber um plano devocional alinhado ao seu perfil atual,
            aos bloqueios que surgiram e ao ritmo que você disse conseguir manter agora.
          </p>

          <div className="grid gap-3 md:grid-cols-3 mb-8 text-sm">
            <div className="rounded-xl bg-white/90 border border-[#E6D4AE] px-4 py-4">Textos e reflexões conectados ao seu perfil espiritual atual.</div>
            <div className="rounded-xl bg-white/90 border border-[#E6D4AE] px-4 py-4">Aplicações práticas baseadas nas dificuldades que você relatou.</div>
            <div className="rounded-xl bg-white/90 border border-[#E6D4AE] px-4 py-4">Um caminho simples para voltar à constância sem sobrecarga espiritual.</div>
          </div>

          <Button
            size="lg"
            className="w-full text-lg font-bold"
            style={{ backgroundColor: "#C9A54C", color: "#17395F" }}
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Abrindo pagamento...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Quero receber meu devocional personalizado
              </>
            )}
          </Button>

          <p className="text-center text-sm mt-4 text-slate-600">
            R$ 12,90. Pagamento seguro e redirecionamento imediato para o checkout.
          </p>
        </section>

        <section className="mb-10 flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={handleRetake}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer
          </Button>
        </section>

        <section className="text-center text-sm text-gray-500">
          <p>Seu resultado estará disponível por mais {formatTimeLeft(timeLeft)}</p>
        </section>
      </div>
    </div>
  );
}
