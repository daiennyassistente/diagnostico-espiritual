import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, QrCode } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { parseStoredLeadData } from "@/lib/leadStorage";
import { useEffect, useState } from "react";

interface CheckoutProps {
  profileName?: string;
}

export default function Checkout({ profileName }: CheckoutProps) {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);

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

  const handleMercadoPagoPixPayment = async () => {
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "#4A3F35" }}>
          Pagamento via PIX
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Escaneie o QR Code com seu smartphone para realizar o pagamento
        </p>

        <Card className="p-8 bg-white space-y-6">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg" style={{ backgroundColor: "#F5F1EA" }}>
              <QrCode className="w-10 h-10" style={{ color: "#3E342C" }} />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: "#4A3F35" }}>
              Devocional: 7 Dias para se Aproximar de Deus
            </h2>
            <p className="text-gray-600">
              Valor: <span className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>R$ 12,90</span>
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Como funciona:</strong> Clique no botão abaixo para gerar o QR Code do PIX. 
              Escaneie com seu smartphone e confirme o pagamento. Você receberá seu devocional personalizado por email.
            </p>
          </div>

          <Button
            onClick={handleMercadoPagoPixPayment}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-semibold"
            style={{ backgroundColor: "#FFC700", color: "#000" }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando QR Code...
              </>
            ) : (
              "Gerar QR Code PIX"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Você será redirecionado para o Mercado Pago para escanear o QR Code do PIX
          </p>
        </Card>

        {/* Informações de Segurança */}
        <Card className="mt-8 p-6 bg-white">
          <h3 className="font-semibold mb-3" style={{ color: "#4A3F35" }}>
            🔒 Segurança Garantida
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ PIX é um método de pagamento seguro do Banco Central</li>
            <li>✓ Transação instantânea e sem intermediários</li>
            <li>✓ Seus dados nunca são armazenados em nossos servidores</li>
            <li>✓ Conformidade com PCI DSS</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
