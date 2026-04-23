import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Home, Loader2, CheckCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CheckoutSuccess() {
  const [location, setLocation] = useLocation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const generateDevotionalMutation = trpc.pdf.generateDevocionalPDF.useMutation();
  const resendViaWhatsAppMutation = trpc.admin.resendViaWhatsApp.useMutation();

  const handleDownloadDevocional = async () => {
    // Se já foi gerado, não fazer nada
    if (pdfGenerated) return;
    if (!result || !responses) return;

    setIsGeneratingPDF(true);

    generateDevotionalMutation.mutate(
      {
        profileName: result.profileName,
        profileDescription: result.profileDescription,
        challenges: result.challenges,
        recommendations: result.recommendations,
        strengths: result.strengths,
        nextSteps: result.nextSteps,
        responses: responses,
        userName: responses["0"] || responses["step1"] || "",
      },
      {
        onSuccess: (data) => {
          if (data.pdfBase64) {
            // Converter base64 para blob e fazer download
            const byteCharacters = atob(data.pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Devocional-7-Dias.pdf";
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) {
                document.body.removeChild(link);
              }
              window.URL.revokeObjectURL(url);
            }, 100);

            setPdfGenerated(true);
            toast.success("Devocional baixado com sucesso!");
          }
        },
        onError: (error) => {
          console.error("Erro ao gerar devocional:", error);
          toast.error("Erro ao gerar devocional. Tente novamente.");
        },
        onSettled: () => {
          setIsGeneratingPDF(false);
        },
      }
    );
  };

  useEffect(() => {
    // Extrair leadId, token ou transaction_id do URL
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    const token = params.get('token');
    const transactionId = params.get('transaction_id');

    // Recuperar dados do resultado e respostas do localStorage
    const savedResponses = localStorage.getItem("quizResponses");
    const savedResult = localStorage.getItem("quizResult");
    const savedWhatsapp = localStorage.getItem("userWhatsapp");
    const savedPdfUrl = localStorage.getItem("generatedPdfUrl");

    if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);
    if (savedPdfUrl) setPdfUrl(savedPdfUrl);

    if (savedResponses && savedResult) {
      const parsedResponses = JSON.parse(savedResponses);
      const parsedResult = JSON.parse(savedResult);
      setResponses(parsedResponses);
      setResult(parsedResult);
      setIsLoading(false);
      
      // Baixar PDF automaticamente após 1 segundo
      setTimeout(() => {
        handleDownloadDevocional();
      }, 1000);
    } else if (token || leadId || transactionId) {
      // Se houver token, leadId ou transaction_id, mostrar mensagem de sucesso genérica
      setIsLoading(false);
      setResult({
        profileName: "Seu Perfil Espiritual",
        profileDescription: "Seu diagnóstico foi processado com sucesso.",
        challenges: [],
        recommendations: [],
        strengths: [],
        nextSteps: []
      });
      setResponses({});
      toast.success("Pagamento confirmado! Seu devocional está pronto.");
    } else {
      // Se não houver dados, redirecionar para o quiz
      toast.error("Dados não encontrados. Redirecionando para o quiz...");
      setTimeout(() => {
        setLocation("/quiz");
      }, 2000);
    }
  }, [setLocation]);

  const handleResendViaWhatsApp = async () => {
    if (!whatsappNumber || !pdfUrl) {
      toast.error("Número de WhatsApp ou URL do PDF não disponível");
      return;
    }

    resendViaWhatsAppMutation.mutate(
      {
        whatsappNumber,
        pdfUrl,
        userName: responses?.["0"] || responses?.["step1"] || "Usuário",
      },
      {
        onSuccess: () => {
          toast.success("PDF reenviado via WhatsApp com sucesso!");
        },
        onError: (error) => {
          console.error("Erro ao reenviar via WhatsApp:", error);
          toast.error("Erro ao reenviar PDF via WhatsApp. Tente novamente.");
        },
      }
    );
  };

  const handleBackToHome = () => {
    // Limpar dados do localStorage
    localStorage.removeItem("quizResponses");
    localStorage.removeItem("quizResult");
    localStorage.removeItem("leadData");
    localStorage.removeItem("userWhatsapp");
    localStorage.removeItem("generatedPdfUrl");
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">✨</div>
          <p className="text-foreground text-lg">Carregando seu devocional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-2xl">
        {/* Ícone de sucesso */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-accent" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Pagamento Confirmado! 🎉
          </h1>
          <p className="text-lg text-accent font-semibold mb-4">
            Seu devocional personalizado está pronto
          </p>
        </div>

        {/* Mensagem de sucesso */}
        <div className="mb-8 p-6 bg-secondary rounded-lg border border-muted">
          <p className="text-foreground text-lg leading-relaxed mb-4">
            Obrigado por sua compra! Seu devocional personalizado de 7 dias foi criado especialmente para sua jornada espiritual.
          </p>
          <p className="text-foreground text-sm italic border-l-4 border-accent pl-4">
            "Este é o começo de uma transformação real. Que Deus abençoe cada dia de sua jornada."
          </p>
        </div>

        {/* Detalhes do devocional */}
        <div className="mb-8 p-6 bg-accent/5 rounded-lg border border-accent/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            📖 Seu Devocional Inclui:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1">✓</span>
              <div>
                <p className="font-semibold text-foreground">7 Dias de Reflexões Personalizadas</p>
                <p className="text-sm text-foreground/80">Baseado no seu perfil espiritual e desafios</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1">✓</span>
              <div>
                <p className="font-semibold text-foreground">Versículos Bíblicos Diários</p>
                <p className="text-sm text-foreground/80">Selecionados especificamente para sua situação</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1">✓</span>
              <div>
                <p className="font-semibold text-foreground">Orações e Aplicações Práticas</p>
                <p className="text-sm text-foreground/80">Para você colocar em prática imediatamente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1">✓</span>
              <div>
                <p className="font-semibold text-foreground">Acesso Vitalício</p>
                <p className="text-sm text-foreground/80">Releia sempre que precisar de encorajamento</p>
              </div>
            </li>
          </ul>
        </div>


        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleDownloadDevocional}
            disabled={isGeneratingPDF || pdfGenerated}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : pdfGenerated ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                PDF Baixado
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Baixar Devocional
              </>
            )}
          </Button>

          {whatsappNumber && pdfUrl && (
            <Button
              onClick={handleResendViaWhatsApp}
              disabled={resendViaWhatsAppMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
            >
              {resendViaWhatsAppMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Reenviar via WhatsApp
                </>
              )}
            </Button>
          )}
        </div>

        {!whatsappNumber && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 Para reenviar o PDF via WhatsApp, atualize seu número na próxima compra.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleBackToHome}
            className="w-full"
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </div>

        <div className="text-center p-4 bg-secondary/50 rounded-lg">
          <p className="text-xs text-foreground/70 mb-2">
            ✓ Suporte disponível por 7 dias após a compra
          </p>
          <p className="text-xs text-foreground/60">
            Suporte disponível por email: suporte@diagnosticoespiritual.com.br
          </p>
        </div>

        {/* Mensagem de bênção */}
        <div className="mt-8 text-center">
          <p className="text-foreground italic text-sm">
            "Que o Senhor te abençoe e te guarde durante estes 7 dias de transformação espiritual."
          </p>
          <p className="text-accent font-semibold mt-2">Números 6:24</p>
        </div>
      </div>
    </div>
  );
}
