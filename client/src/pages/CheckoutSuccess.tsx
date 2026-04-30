import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Home, Loader2, CheckCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { trackPurchase } from "@/lib/metaPixelTracking";



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
    // Suporta ambos os formatos: transaction_id (snake_case) e transactionId (camelCase)
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    const token = params.get('token');
    const transactionId = params.get('transaction_id') || params.get('transactionId');
    const amount = params.get('amount');
    
    console.log('[CheckoutSuccess] URL params:', {
      leadId,
      token,
      transactionId,
      amount,
      fullSearch: window.location.search
    });

    // Recuperar dados do resultado e respostas do localStorage
    const savedResponses = localStorage.getItem("quizResponses");
    const savedResult = localStorage.getItem("quizResult");
    const savedWhatsapp = localStorage.getItem("userWhatsapp");
    const savedPdfUrl = localStorage.getItem("generatedPdfUrl");
    const savedAmount = localStorage.getItem("purchaseAmount");

    if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);
    if (savedPdfUrl) setPdfUrl(savedPdfUrl);

    if (savedResponses && savedResult) {
      const parsedResponses = JSON.parse(savedResponses);
      const parsedResult = JSON.parse(savedResult);
      setResponses(parsedResponses);
      setResult(parsedResult);
      setIsLoading(false);
      
      // Disparar evento Purchase no Meta Pixel com deduplicação
      if (transactionId && (amount || savedAmount)) {
        const purchaseAmount = parseFloat(amount || savedAmount || '0');
        console.log('[CheckoutSuccess] Disparando Purchase:', {
          transactionId,
          purchaseAmount,
          profileName: parsedResult.profileName,
          eventId: `purchase_${transactionId}`
        });
        trackPurchase(purchaseAmount, transactionId, parsedResult.profileName || 'Devocional Personalizado');
        console.log(`[CheckoutSuccess] Meta Pixel Purchase disparado com transactionId: ${transactionId}`);
      } else {
        console.log('[CheckoutSuccess] Purchase NAO disparado:', {
          hasTransactionId: !!transactionId,
          hasAmount: !!(amount || savedAmount),
          transactionId,
          amount,
          savedAmount
        });
      }
      
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
      
      // Disparar evento Purchase no Meta Pixel com deduplicação
      if (transactionId && (amount || localStorage.getItem('purchaseAmount'))) {
        const purchaseAmount = parseFloat(amount || localStorage.getItem('purchaseAmount') || '0');
        console.log('[CheckoutSuccess] Disparando Purchase (fallback):', {
          transactionId,
          purchaseAmount,
          eventId: `purchase_${transactionId}`
        });
        trackPurchase(purchaseAmount, transactionId, 'Devocional Personalizado');
        console.log(`[CheckoutSuccess] Meta Pixel Purchase disparado com transactionId: ${transactionId}`);
      } else {
        console.log('[CheckoutSuccess] Purchase NAO disparado (fallback):', {
          hasTransactionId: !!transactionId,
          hasAmount: !!(amount || localStorage.getItem('purchaseAmount')),
          transactionId,
          amount
        });
      }
      
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
    localStorage.removeItem("purchaseAmount");
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
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">
            Pagamento Confirmado! 🎉
          </h1>
          <p className="text-base md:text-lg text-accent font-semibold mb-4">
            Seu devocional personalizado está pronto
          </p>
        </div>

        {/* Mensagem de sucesso */}
        <div className="mb-8 p-4 md:p-6 bg-secondary/40 rounded-lg border border-border">
          <p className="text-foreground text-base md:text-lg leading-relaxed mb-4">
            Obrigado por sua compra! Seu devocional personalizado de 7 dias foi criado especialmente para sua jornada espiritual.
          </p>
          <p className="text-foreground text-sm italic border-l-4 border-primary pl-4">
            "Este é o começo de uma transformação real. Que Deus abençoe cada dia de sua jornada."
          </p>
        </div>

        {/* Detalhes do devocional */}
        <div className="mb-8 p-4 md:p-6 bg-primary/5 rounded-lg border border-primary/20">
          <h2 className="text-base md:text-lg font-semibold text-primary mb-4">
            📖 Seu Devocional Inclui:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl mt-1 flex-shrink-0">✓</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">7 Dias de Reflexões Personalizadas</p>
                <p className="text-xs md:text-sm text-foreground/80">Baseado no seu perfil espiritual e desafios</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1 flex-shrink-0">✓</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">Versículos Bíblicos Diários</p>
                <p className="text-xs md:text-sm text-foreground/80">Selecionados especificamente para sua situação</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1 flex-shrink-0">✓</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">Orações e Aplicações Práticas</p>
                <p className="text-xs md:text-sm text-foreground/80">Para você colocar em prática imediatamente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl mt-1 flex-shrink-0">✓</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">Acesso Vitalício</p>
                <p className="text-xs md:text-sm text-foreground/80">Releia sempre que precisar de encorajamento</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Botões de ação - Responsivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <Button
            onClick={handleDownloadDevocional}
            disabled={isGeneratingPDF || pdfGenerated}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black py-8 uppercase tracking-wider"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                <span className="truncate">Gerando PDF...</span>
              </>
            ) : pdfGenerated ? (
              <>
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="truncate">PDF Baixado</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="truncate">Baixar Devocional</span>
              </>
            )}
          </Button>

          {whatsappNumber && pdfUrl && (
            <Button
              onClick={handleResendViaWhatsApp}
              disabled={resendViaWhatsAppMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 md:py-6 text-sm md:text-base"
            >
              {resendViaWhatsAppMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  <span className="truncate">Enviando...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  <span className="truncate">Reenviar via WhatsApp</span>
                </>
              )}
            </Button>
          )}
        </div>

        {!whatsappNumber && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs md:text-sm text-foreground/70">
              💡 Para reenviar o PDF via WhatsApp, atualize seu número na próxima compra.
            </p>
          </div>
        )}

        {/* Botões secundários */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <Button
            onClick={() => window.open('https://wa.me/5585984463738?text=Ol%C3%A1%21%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20meu%20devocional%20personalizado.', '_blank')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 md:py-6 text-sm md:text-base"
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <span className="truncate">Suporte via WhatsApp</span>
          </Button>
          <Button
            onClick={handleBackToHome}
            className="w-full text-sm md:text-base"
            variant="outline"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="truncate">Voltar para Home</span>
          </Button>
        </div>

        {/* Informações de suporte */}
        <div className="text-center p-3 md:p-4 bg-secondary/30 rounded-lg border border-border">
          <p className="text-xs text-foreground/70 mb-2">
            ✓ Suporte disponível por 7 dias após a compra
          </p>
          <p className="text-xs text-foreground/60">
            Suporte disponível por email: suporte@diagnosticoespiritual.com.br
          </p>
          {/* Meta Pixel noscript tag for tracking */}
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }} 
              src={`https://www.facebook.com/tr?id=${import.meta.env.VITE_ANALYTICS_WEBSITE_ID || ''}&ev=Purchase&noscript=1`}
              alt=""
            />
          </noscript>
        </div>

        {/* Mensagem de bênção */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-foreground italic text-xs md:text-sm">
            "Que o Senhor te abençoe e te guarde durante estes 7 dias de transformação espiritual."
          </p>
          <p className="text-primary font-semibold mt-2 text-xs md:text-sm">Números 6:24</p>
        </div>
      </div>
    </div>
  );
}
