import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { parseStoredLeadData } from "@/lib/leadStorage";
import { useEffect, useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [price, setPrice] = useState(9.90);
  const [isOfferPrice, setIsOfferPrice] = useState(false);

  const createStripeCheckoutMutation = trpc.payment.createStripeCheckout.useMutation();

  useEffect(() => {
    // Usar window.location.search em vez de wouter location para capturar query params
    const params = new URLSearchParams(window.location.search);
    const offerPrice = params.get('price');
    const isOffer = params.get('offer') === 'whatsapp';
    const urlLeadId = params.get('leadId');
    
    console.log('[Checkout] URL params - offerPrice:', offerPrice, 'isOffer:', isOffer, 'urlLeadId:', urlLeadId);
    
    if (offerPrice && isOffer) {
      const parsedPrice = parseFloat(offerPrice);
      console.log('[Checkout] Setting offer price:', parsedPrice);
      setPrice(parsedPrice);
      setIsOfferPrice(true);
    } else {
      console.log('[Checkout] Not an offer, using default price');
      setIsOfferPrice(false);
    }

    // Priorizar leadId da URL, depois do localStorage
    let finalLeadId = urlLeadId ? parseInt(urlLeadId) : null;
    
    if (!finalLeadId) {
      const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
      if (leadData?.leadId) {
        finalLeadId = leadData.leadId;
      }
    }

    if (!finalLeadId) {
      toast.error("Dados não encontrados. Redirecionando...");
      setLocation("/quiz");
      return;
    }

    setLeadId(finalLeadId);
  }, []); // Executar apenas uma vez ao montar o componente

  const handleMercadoPagoPayment = async () => {
    const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
    if (!leadData?.email) {
      toast.error("Email não encontrado");
      return;
    }

    const { email, whatsapp } = leadData;

    setIsProcessing(true);

    createStripeCheckoutMutation.mutate(
      {
        email,
        profileName: "Diagnóstico Espiritual",
        userPhone: whatsapp,
        leadId: leadId?.toString() || "",
      },
      {
        onSuccess: (data: any) => {
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
          Pagamento Seguro
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Finalize seu pedido com segurança
        </p>

        <Card className="p-8 bg-white space-y-6">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg" style={{ backgroundColor: "#F5F1EA" }}>
              <CreditCard className="w-10 h-10" style={{ color: "#3E342C" }} />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: "#4A3F35" }}>
              Devocional: 7 Dias para se Aproximar de Deus
            </h2>
            <p className="text-gray-600">
              {isOfferPrice && (
                <>
                  <span className="line-through text-gray-400 mr-2">R$ 9,90</span>
                </>
              )}
              Valor: <span className="text-2xl font-bold" style={{ color: isOfferPrice ? "#16A34A" : "#1E3A8A" }}>R$ {price.toFixed(2)}</span>
            </p>
            {isOfferPrice && (
              <p className="text-sm font-bold text-green-600">🎁 Oferta exclusiva do WhatsApp!</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>O que você vai receber:</strong> Um guia devocional personalizado com 7 dias de reflexões bíblicas, versículos e práticas espirituais baseadas no seu diagnóstico.
            </p>
          </div>

          <Button
            onClick={handleMercadoPagoPayment}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-semibold"
            style={{ backgroundColor: isOfferPrice ? "#16A34A" : "#FFC700", color: isOfferPrice ? "#fff" : "#000" }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                {isOfferPrice ? "🎁 Pagar com Mercado Pago" : "Pagar com Mercado Pago"}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Você será redirecionado para o Mercado Pago para completar o pagamento de forma segura
          </p>
        </Card>

        {/* Informações de Segurança */}
        <Card className="mt-8 p-6 bg-white">
          <h3 className="font-semibold mb-3" style={{ color: "#4A3F35" }}>
            🔒 Segurança Garantida
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ Pagamento processado pelo Mercado Pago (empresa líder em segurança de pagamentos)</li>
            <li>✓ Seus dados de cartão nunca são armazenados em nossos servidores</li>
            <li>✓ Conformidade com PCI DSS (padrão de segurança internacional)</li>
            <li>✓ Transação criptografada e protegida</li>
          </ul>
        </Card>
      </div>
      <WhatsAppButton />
    </div>
  );
}
