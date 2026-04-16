import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface MercadoPagoCheckoutProps {
  email: string;
  leadId: string;
  profileName: string;
  userPhone: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export function MercadoPagoCheckout({
  email,
  leadId,
  profileName,
  userPhone,
  onSuccess,
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [pixCode, setPixCode] = useState<string>("");
  const [pixQrCode, setPixQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPixInfo, setShowPixInfo] = useState(false);

  const createPaymentMutation = trpc.payment.createMercadoPagoPayment.useMutation();

  // Load Mercado Pago SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(
          import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
        );
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleCardPayment = async () => {
    if (!window.MercadoPago) {
      toast.error("Mercado Pago SDK não carregou");
      return;
    }

    setIsLoading(true);
    try {
      // Create payment with card
      const result = await createPaymentMutation.mutateAsync({
        email,
        leadId,
        profileName,
        userPhone,
        paymentMethod: "card",
      });

      if (result.success) {
        toast.success("Pagamento processado com sucesso!");
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePixPayment = async () => {
    setIsLoading(true);
    try {
      const result = await createPaymentMutation.mutateAsync({
        email,
        leadId,
        profileName,
        userPhone,
        paymentMethod: "pix",
      });

      if (result.success && result.pixCode && result.pixQrCode) {
        setPixCode(result.pixCode);
        setPixQrCode(result.pixQrCode);
        setShowPixInfo(true);
        toast.success("QR Code PIX gerado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao gerar QR Code PIX");
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      toast.error("Erro ao gerar PIX. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (showPixInfo) {
    return (
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Pagamento PIX</h3>
        <div className="space-y-4">
          {pixQrCode && (
            <div className="flex justify-center">
              <img
                src={pixQrCode}
                alt="QR Code PIX"
                className="w-64 h-64 border rounded"
              />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Código PIX (cópia e cola):</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixCode}
                readOnly
                className="flex-1 px-3 py-2 border rounded text-sm font-mono"
              />
              <Button
                onClick={copyPixCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Escaneie o QR Code ou copie o código para fazer o pagamento no seu
            banco.
          </p>
          <Button
            onClick={() => setShowPixInfo(false)}
            variant="outline"
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Escolha a forma de pagamento</h3>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setPaymentMethod("card")}
          variant={paymentMethod === "card" ? "default" : "outline"}
          disabled={isLoading}
        >
          Cartão de Crédito
        </Button>
        <Button
          onClick={() => setPaymentMethod("pix")}
          variant={paymentMethod === "pix" ? "default" : "outline"}
          disabled={isLoading}
        >
          PIX
        </Button>
      </div>

      <Button
        onClick={
          paymentMethod === "card" ? handleCardPayment : handlePixPayment
        }
        disabled={isLoading}
        className="w-full gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {paymentMethod === "card"
          ? "Pagar com Cartão"
          : "Gerar QR Code PIX"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Pagamento seguro com Mercado Pago
      </p>
    </Card>
  );
}
