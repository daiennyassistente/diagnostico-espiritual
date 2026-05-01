import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { MercadoPagoCheckout } from "@/components/MercadoPagoCheckout";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { parseStoredLeadData } from "@/lib/leadStorage";

export function OfferWhatsAppPage() {
  const [location, setLocation] = useLocation();
  const [showCheckout, setShowCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos

  // Extrair leadId da URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const leadId = searchParams.get('leadId') || '';
  const numericLeadId = Number(leadId);
  const storedLeadData = parseStoredLeadData(typeof window !== "undefined" ? window.localStorage.getItem("leadData") : null);
  const { data: resultData } = trpc.quiz.getResult.useQuery(
    { leadId: numericLeadId },
    { enabled: Number.isFinite(numericLeadId) && numericLeadId > 0 },
  );

  const checkoutEmail = resultData?.lead?.email || storedLeadData?.email || "";
  const checkoutPhone = resultData?.lead?.whatsapp || storedLeadData?.whatsapp || "";
  const checkoutQuizId = resultData?.quizResponse?.quizId || `offer-whatsapp-${leadId}`;
  const checkoutResultId = Number(resultData?.diagnostic?.id ?? 0);
  const checkoutProfileName = resultData?.diagnostic?.profileName || "Devocional WhatsApp";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft === 0;

  const handleCheckout = () => {
    if (isExpired) {
      toast.error("Oferta expirada! Volte ao WhatsApp para obter um novo link.");
      return;
    }
    if (!numericLeadId) {
      toast.error("Não conseguimos identificar seu acesso. Refaça o quiz.");
      return;
    }
    if (!checkoutEmail) {
      toast.error("Não conseguimos identificar seu e-mail. Refaça o quiz.");
      return;
    }
    if (!checkoutResultId) {
      toast.error("Seu resultado ainda não está pronto para pagamento. Volte ao resultado e tente novamente.");
      return;
    }
    setShowCheckout(true);
  };
  
  const handlePaymentSuccess = () => {
    // Redirecionar para página de sucesso
    setLocation('/checkout-success');
  };

  return (
    <div className="spiritual-background min-h-screen py-6 px-4">
      <div className="container max-w-2xl">
        {/* Urgency Banner */}
        <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-600 animate-pulse" />
            <p className="text-sm font-bold text-red-600">OFERTA ESPECIAL DO WHATSAPP</p>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <p className="text-xs text-red-600 mt-1">Essa oferta expira em 30 minutos</p>
        </div>

        {/* Hero Section */}
        <section className="mb-8 text-center">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground shadow-none font-bold mb-3 leading-tight">
              🎁 Você Quase Garantiu Seu Acesso...
            </h1>
            <p className="text-lg text-foreground shadow-none font-bold">
              Não perca essa chance! Seu devocional personalizado está esperando por você.
            </p>
          </div>
        </section>

        {/* Main Offer Card */}
        <section className="mb-8">
          <Card className="p-6 border-3 border-yellow-400 bg-secondary/30 backdrop-blur-md shadow-none border-border">
            {/* Price Section */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground shadow-none mb-2">Preço normal: R$ 9,90</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-4xl font-bold text-foreground shadow-none font-bold line-through opacity-50">R$ 9,90</div>
                <div className="text-5xl font-bold text-red-600">R$ 7,90</div>
              </div>
              <p className="text-sm font-bold text-green-600 mt-2">✓ Economize R$ 2,00 (20% OFF)</p>
            </div>

            {/* What You Get */}
            <div className="mb-6 bg-secondary/50 rounded-lg p-4 shadow-none border border-border">
              <h2 className="text-lg font-bold text-foreground shadow-none font-bold mb-3">Você vai receber:</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-foreground shadow-none font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground shadow-none font-bold">7 Dias de Devocional 100% Personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-foreground shadow-none font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground shadow-none font-bold">Meditações Bíblicas Profundas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-foreground shadow-none font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground shadow-none font-bold">Orações Transformadoras</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-foreground shadow-none font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground shadow-none font-bold">PDF para Baixar Imediatamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-foreground shadow-none font-bold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground shadow-none font-bold">Suporte por WhatsApp</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black py-6 md:py-8 text-sm md:text-lg uppercase tracking-wider mb-4 whitespace-normal leading-tight"
              onClick={handleCheckout}
              disabled={isExpired}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isExpired ? "Oferta Expirada" : "FINALIZAR MINHA COMPRA"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Trust Badges */}
            <p className="text-xs text-muted-foreground shadow-none text-center">
              ✓ Acesso Imediato | ✓ Pagamento Seguro via Pix | ✓ Sem Cobranças Recorrentes
            </p>
          </Card>
        </section>

        {/* Urgency Section */}
        <section className="mb-8 bg-secondary/30 rounded-lg p-6 border border-border shadow-none">
          <h3 className="font-bold text-foreground shadow-none font-bold text-center mb-4">⏰ Por que agir AGORA?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-lg font-bold text-foreground shadow-none font-bold">1</span>
              <p className="text-sm text-foreground shadow-none font-bold"><strong>Essa oferta é exclusiva</strong> - Válida apenas para quem recebeu via WhatsApp</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg font-bold text-foreground shadow-none font-bold">2</span>
              <p className="text-sm text-foreground shadow-none font-bold"><strong>Tempo limitado</strong> - Expira em 30 minutos</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg font-bold text-foreground shadow-none font-bold">3</span>
              <p className="text-sm text-foreground shadow-none font-bold"><strong>Desconto de 20%</strong> - Economize R$ 2,00</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg font-bold text-foreground shadow-none font-bold">4</span>
              <p className="text-sm text-foreground shadow-none font-bold"><strong>Acesso imediato</strong> - Comece hoje mesmo</p>
            </li>
          </ul>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <Button
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black py-6 md:py-8 text-base md:text-lg uppercase tracking-wider whitespace-normal leading-tight"
            onClick={handleCheckout}
            disabled={isExpired}
          >
            <Zap className="w-5 h-5 mr-2" />
            {isExpired ? "Oferta Expirada" : "GARANTIR MEU ACESSO AGORA"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground shadow-none mt-3">
            Pagamento 100% seguro via Pix • Sem cobranças recorrentes
          </p>
        </section>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                email={checkoutEmail}
                leadId={leadId}
                quizId={checkoutQuizId}
                resultId={checkoutResultId}
                profileName={checkoutProfileName}
                userPhone={checkoutPhone}
                amount={7.9}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
