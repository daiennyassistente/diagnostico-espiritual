import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface MercadoPagoCheckoutProps {
  email: string;
  leadId: string;
  quizId: string;
  resultId: number;
  profileName: string;
  userPhone: string;
  onSuccess?: (transactionId?: string) => void;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export function MercadoPagoCheckout({
  email,
  leadId,
  quizId,
  resultId,
  profileName,
  userPhone,
  onSuccess,
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [pixCode, setPixCode] = useState<string>("");
  const [pixQrCode, setPixQrCode] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPixInfo, setShowPixInfo] = useState(false);

  const createPaymentMutation = trpc.payment.createMercadoPagoPayment.useMutation();

  useEffect(() => {
    if (!showPixInfo || !transactionId) {
      console.log("[MercadoPagoCheckout] Polling não iniciado - showPixInfo:", showPixInfo, "transactionId:", transactionId);
      return;
    }

    console.log("[MercadoPagoCheckout] Iniciando polling com transactionId:", transactionId);

    const intervalId = window.setInterval(async () => {
      try {
        console.log("[MercadoPagoCheckout] Polling - Verificando status com transactionId:", transactionId);
        const url = `/api/check-payment?transaction_id=${encodeURIComponent(transactionId)}`;
        console.log("[MercadoPagoCheckout] Polling - Chamando API:", url);
        const response = await fetch(url);

        if (!response.ok) {
          console.log("[MercadoPagoCheckout] Polling - Resposta não OK:", response.status);
          return;
        }

        const data = await response.json();
        console.log("[MercadoPagoCheckout] Polling - Status retornado:", data.status);
        console.log("[MercadoPagoCheckout] Polling - Dados completos:", data);
        if (data.status === "approved") {
          console.log("[MercadoPagoCheckout] Polling - Pagamento aprovado! Redirecionando para /sucesso");
          window.clearInterval(intervalId);
          // Obter o valor da compra do localStorage
          const purchaseAmount = localStorage.getItem('purchaseAmount') || '9.90';
          window.location.href = `/sucesso?transaction_id=${encodeURIComponent(transactionId)}&amount=${encodeURIComponent(purchaseAmount)}`;
        }
      } catch (error) {
        console.error("Erro ao consultar status do pagamento PIX:", error);
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [showPixInfo, transactionId]);

  // SDK v2 já está carregado no index.html
  // Não precisa fazer nada aqui - a chave pública é passada ao criar instâncias

  const handleCardPayment = async () => {

    setIsLoading(true);
    try {
      // Create payment with card
      const result = await createPaymentMutation.mutateAsync({
        email,
        leadId,
        quizId,
        resultId,
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
        quizId,
        resultId,
        profileName,
        userPhone,
        paymentMethod: "pix",
      });

      if (result.success && result.pixCode && result.pixQrCode) {
        setPixCode(result.pixCode);
        setPixQrCode(result.pixQrCode);
        setTransactionId(result.transactionId || "");
        console.log("[MercadoPagoCheckout] DEBUG - transactionId capturado:", result.transactionId);
        console.log("[MercadoPagoCheckout] DEBUG - resultId enviado:", resultId);
        console.log("[MercadoPagoCheckout] DEBUG - Iniciando polling para transactionId:", result.transactionId);
        setShowPixInfo(true);
        onSuccess?.(result.transactionId);
        toast.success("QR Code PIX gerado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao gerar QR Code PIX");
        console.error("Erro ao gerar PIX:", result);
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
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Assim que o pagamento for aprovado, esta tela verifica automaticamente a confirmação e redireciona para /sucesso em até 3 segundos.
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
