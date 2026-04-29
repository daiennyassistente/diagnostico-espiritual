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
import { MercadoPagoCheckout } from "@/components/MercadoPagoCheckout";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsAppReferralButton } from "@/components/WhatsAppReferralButton";
import { trackInitiateCheckout } from "@/lib/metaPixelTracking";

interface AIResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

export const shouldPreserveLocalQuizState = (hasUrlLeadId: boolean, isFreshQuizRedirect: boolean) => hasUrlLeadId && isFreshQuizRedirect;

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

export const extractBackendResponses = (value: unknown): Record<string, string> | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([key, entryValue]) => key.startsWith("step") && typeof entryValue === "string" && entryValue.trim().length > 0,
  );

  if (entries.length === 0) {
    return null;
  }

  return entries.reduce<Record<string, string>>((accumulator, [key, entryValue]) => {
    accumulator[key] = entryValue as string;
    return accumulator;
  }, {});
};

// Função para disparar evento Purchase do Pixel da Meta
const firePixelPurchaseEvent = (amount: number, productName: string) => {
  if (typeof window !== 'undefined' && typeof (window as any).fbq !== 'undefined') {
    (window as any).fbq('track', 'Purchase', {
      value: amount,
      currency: 'BRL',
      content_name: productName,
      content_type: 'product'
    });
    console.log('[Meta Pixel] Evento Purchase disparado:', { value: amount, currency: 'BRL', product: productName });
  }
};

export default function Result() {
  const [, setLocation] = useLocation();
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<string>("");
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();

  const generateDiagnosisMutation = trpc.aiResult.generateFromResponses.useMutation();
  const checkoutMutation = trpc.payment.createMercadoPagoCheckout.useMutation();
  const downloadResultMutation = trpc.download.downloadResult.useMutation();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLeadId = urlParams.get('leadId');
    
    const resolvedLeadId = resolveLeadIdFromSources(
      window.location.search,
      window.localStorage.getItem("quizLeadId"),
    );

    if (resolvedLeadId) {
      setLeadId(resolvedLeadId);

      const isFreshQuizRedirect = window.sessionStorage.getItem("quizPendingResultRedirect") === "1";

      // Quando o usuário acabou de sair do quiz, preservamos as respostas locais
      // para permitir a geração do diagnóstico caso ele ainda não exista no banco.
      // Em links compartilhados, limpamos apenas o nome local para evitar mistura visual.
      if (urlLeadId && !shouldPreserveLocalQuizState(Boolean(urlLeadId), isFreshQuizRedirect)) {
        console.log('[Result] acesso externo ao resultado, limpando apenas nome local');
        window.localStorage.removeItem("userName");
        window.sessionStorage.removeItem("userName");
      }
    }

    const storedQuizId = sessionStorage.getItem("quizId") || "";
    setQuizId(storedQuizId);
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

  // Disparar evento Purchase do Pixel quando o checkout for concluído
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    
    if (paymentSuccess === 'true' && trpcResult?.diagnostic) {
      const amount = 9.90; // Valor do diagnóstico
      const productName = trpcResult.diagnostic.profileName || 'Diagnóstico Espiritual';
      firePixelPurchaseEvent(amount, productName);
    }
  }, [trpcResult]);

  const backendResponses = useMemo(
    () => extractBackendResponses(trpcResult?.quizResponse),
    [trpcResult],
  );

  useEffect(() => {
    const responseSource = responses || backendResponses;

    if (!trpcResult || trpcResult.diagnostic || !responseSource || !leadId || isGeneratingDiagnosis) {
      return;
    }

    setIsGeneratingDiagnosis(true);

    generateDiagnosisMutation.mutate(
      {
        responses: buildResponsesMap(responseSource),
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
  }, [backendResponses, generateDiagnosisMutation, isGeneratingDiagnosis, leadId, refetch, responses, trpcResult]);

  useEffect(() => {
    if (!responses && backendResponses) {
      setResponses(backendResponses);
    }
  }, [backendResponses, responses]);

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

  const displayName = trpcResult?.lead?.name || userName || user?.name || "você";

  useEffect(() => {
    if (trpcResult?.lead?.name) {
      setUserName(trpcResult.lead.name);
    }

    if (window.sessionStorage.getItem("quizPendingResultRedirect") === "1") {
      window.sessionStorage.removeItem("quizPendingResultRedirect");
      window.sessionStorage.removeItem("quizPendingResultRedirectAt");
    }
  }, [trpcResult]);
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
      if (!leadId) {
        toast.error("Seu PDF será liberado após a confirmação do pagamento.");
        return;
      }
      
      const token = leadId.toString();

      const response = await downloadResultMutation.mutateAsync({ token: token || "" });
      if (response?.pdfBase64) {
        const binaryString = atob(response.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `diagnostico-espiritual-${displayName}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        // Remover o link após um pequeno delay para garantir que o clique foi processado
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast.error("Não foi possível baixar o PDF agora.");
    } finally {
      setIsGeneratingPDF(false);
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

    // Disparar evento InitiateCheckout quando checkout é iniciado
    trackInitiateCheckout(9.90);
    console.log('[Result] Evento InitiateCheckout disparado');

    setIsCheckingOut(true);

    try {
      const checkout = await checkoutMutation.mutateAsync({
        quizId,
        email,
        profileName: result.profileName,
        userPhone,
        leadId: leadId?.toString() || "",
      });

      if (!checkout.checkoutUrl) {
        toast.error("Não foi possível abrir o checkout agora.");
        return;
      }

      toast.success("Redirecionando para o pagamento...");
      // Use window.location.href para melhor compatibilidade com celulares
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
        <section className="quiz-card mb-8 border border-accent/40 bg-white backdrop-blur">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary/70">Diagnóstico espiritual</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">
                ⚠️ Possível bloqueio espiritual identificado
              </h1>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-base text-slate-700">
              <strong>Seu perfil atual:</strong> {result.profileName}
            </p>
            <p className="text-base text-slate-700 mt-2">
              {result.profileDescription}
            </p>
          </div>
        </section>



        <section className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 border-accent/40 bg-white backdrop-blur">
            <h2 className="text-2xl font-semibold text-primary mb-4">Pontos de força que apareceram em você</h2>
            <ul className="space-y-3">
              {result.strengths.map((item, index) => (
                <li key={index} className="rounded-lg bg-primary/5 px-4 py-3 border border-primary/20 text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-accent/40 bg-white backdrop-blur">
            <h2 className="text-2xl font-semibold text-primary mb-4">Bloqueios que mais pesam hoje</h2>
            <ul className="space-y-3">
              {result.challenges.map((item, index) => (
                <li key={index} className="rounded-lg bg-primary/5 px-4 py-3 border border-primary/20 text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="quiz-card mb-8 text-center bg-white border border-accent/40">
          <p className="text-lg leading-8 text-slate-700 font-semibold text-primary mb-6">
            Existe uma forma de mudar isso 🙏
          </p>
          <Button
            size="lg"
            className="w-full text-lg font-bold"
            style={{ backgroundColor: "#FFC700", color: "#17395F" }}
            onClick={() => setShowCheckout(true)}
            disabled={false}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Abrindo pagamento...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                🔐 Ver solução completa
              </>
            )}
          </Button>
          <p className="text-center text-sm mt-4 text-slate-600">
            R$ 9,90. Pagamento seguro e envio do pdf por e-mail<br />
            <span className="text-xs mt-2 block">Não esqueça de olhar a sua caixa de spam</span>
          </p>
        </section>

        <section className="mb-10 flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
          </Button>

          <Button variant="outline" onClick={handleRetake}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer
          </Button>
        </section>

        <section className="mb-10 text-center">
          <div className="border-t border-muted pt-6">
            <p className="text-sm text-foreground/60 mb-3">Prefere falar com um especialista?</p>
            <WhatsAppReferralButton
              phoneNumber="5585984463738"
              message="Olá! Gostaria de ser encaminhado para receber mais informações sobre o Diagnóstico Espiritual."
              label="Encaminhar para WhatsApp"
            />
          </div>
        </section>

        <section className="text-center text-sm text-gray-500">
          <p>Seu resultado estará disponível por mais {formatTimeLeft(timeLeft)}</p>
        </section>

        {showCheckout && result && trpcResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Pagamento</h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <MercadoPagoCheckout
                  email={trpcResult.lead?.email || parseStoredLeadData(localStorage.getItem("leadData"))?.email || user?.email || ""}
                  leadId={leadId?.toString() || ""}
                  quizId={quizId}
                  resultId={Number((trpcResult.diagnostic as { id?: number } | null)?.id ?? 0)}
                  profileName={result.profileName}
                  userPhone={trpcResult.lead?.whatsapp || parseStoredLeadData(localStorage.getItem("leadData"))?.whatsapp || ""}
                  onSuccess={() => {
                    toast.success("Pagamento processado com sucesso!");
                  }}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
      <WhatsAppButton />
    </div>
  );
}
