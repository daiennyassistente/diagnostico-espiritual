import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MercadoPagoSecureFields } from "@/components/MercadoPagoSecureFields";
import { parseStoredLeadData } from "@/lib/leadStorage";

interface CheckoutProps {
  profileName?: string;
}

export default function Checkout({ profileName }: CheckoutProps) {
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"preference" | "secure-fields" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);

  const processSecureFieldsPaymentMutation = trpc.quiz.processSecureFieldsPayment.useMutation();
  const createMercadoPagoCheckoutMutation = trpc.quiz.createMercadoPagoCheckout.useMutation();

  useEffect(() => {
    const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
    if (!leadData?.leadId) {
      toast.error("Dados não encontrados. Redirecionando...");
      setLocation("/quiz");
      return;
    }

    setLeadId(leadData.leadId);
  }, [setLocation]);

  const handleSecureFieldsPayment = async (cardToken: string) => {
    if (!leadId) {
      toast.error("Lead ID não encontrado");
      return;
    }

    const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
    if (!leadData?.email) {
      toast.error("Dados não encontrados");
      return;
    }

    const { email } = leadData;

    setIsProcessing(true);

    try {
      const result = await processSecureFieldsPaymentMutation.mutateAsync({
        cardToken,
        email,
        profileName: profileName || "Diagnóstico Espiritual",
        leadId,
      });

      if (result.success) {
        toast.success("Pagamento processado com sucesso!");
        // Redirecionar para página de sucesso
        setLocation(`/checkout-success?leadId=${leadId}`);
      } else {
        toast.error("Erro ao processar pagamento");
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMercadoPagoPreference = async () => {
    const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
    if (!leadData?.email) {
      toast.error("Email não encontrado");
      return;
    }

    const { email, whatsapp } = leadData;

    setIsProcessing(true);

    createMercadoPagoCheckoutMutation.mutate(
      {
        email,
        profileName: profileName || "Diagnóstico Espiritual",
        userPhone: whatsapp,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            toast.error("Não foi possível abrir o checkout");
            setIsProcessing(false);
          }
        },
        onError: () => {
          setIsProcessing(false);
          toast.error("Erro ao criar checkout");
        },
      }
    );
  };

  if (!leadId) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#1E3A8A" }} />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-background min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "#4A3F35" }}>
          Escolha seu Método de Pagamento
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Selecione a forma mais segura e conveniente para você
        </p>

        {paymentMethod === null && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Opção 1: Secure Fields */}
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-[#3E342C]">
              <div onClick={() => setPaymentMethod("secure-fields")} className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: "#F5F1EA" }}>
                  <CreditCard className="w-6 h-6" style={{ color: "#3E342C" }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: "#4A3F35" }}>
                  Cartão de Crédito Seguro
                </h2>
                <p className="text-gray-600 text-sm">
                  Pague diretamente com seu cartão usando nossa tecnologia segura com criptografia SSL/TLS.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Campos seguros (Secure Fields)</li>
                  <li>✓ PCI Compliance</li>
                  <li>✓ Processamento imediato</li>
                </ul>
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#3E342C" }}
                  onClick={() => setPaymentMethod("secure-fields")}
                >
                  Pagar com Cartão
                </Button>
              </div>
            </Card>

            {/* Opção 2: Mercado Pago Preference */}
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-[#3E342C]">
              <div onClick={() => setPaymentMethod("preference")} className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: "#F5F1EA" }}>
                  <Zap className="w-6 h-6" style={{ color: "#3E342C" }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: "#4A3F35" }}>
                  Mercado Pago
                </h2>
                <p className="text-gray-600 text-sm">
                  Pague com sua conta do Mercado Pago ou escolha entre várias opções de pagamento.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Múltiplos métodos</li>
                  <li>✓ Pix, Cartão, Boleto</li>
                  <li>✓ Parcelamento disponível</li>
                </ul>
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#3E342C" }}
                  onClick={() => setPaymentMethod("preference")}
                >
                  Pagar com Mercado Pago
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Secure Fields Form */}
        {paymentMethod === "secure-fields" && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setPaymentMethod(null)}
              disabled={isProcessing}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <MercadoPagoSecureFields
              publicKey={process.env.VITE_MERCADOPAGO_PUBLIC_KEY || ""}
              onPaymentReady={handleSecureFieldsPayment}
              onError={(error) => toast.error(error)}
              isLoading={isProcessing}
            />
          </div>
        )}

        {/* Mercado Pago Preference Button */}
        {paymentMethod === "preference" && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setPaymentMethod(null)}
              disabled={isProcessing}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <Card className="p-8 text-center space-y-4">
              <h2 className="text-xl font-semibold" style={{ color: "#4A3F35" }}>
                Você será redirecionado para o Mercado Pago
              </h2>
              <p className="text-gray-600">
                Clique no botão abaixo para prosseguir com o pagamento seguro.
              </p>
              <Button
                onClick={handleMercadoPagoPreference}
                disabled={isProcessing}
                className="w-full"
                style={{ backgroundColor: "#3E342C" }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Ir para Mercado Pago"
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* Informações de Segurança */}
        <Card className="mt-8 p-6" style={{ backgroundColor: "#F5F1EA" }}>
          <h3 className="font-semibold mb-3" style={{ color: "#4A3F35" }}>
            🔒 Segurança Garantida
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ Certificado SSL/TLS 1.2+</li>
            <li>✓ Criptografia de dados de pagamento</li>
            <li>✓ Conformidade com PCI DSS</li>
            <li>✓ Seus dados nunca são armazenados em nossos servidores</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
