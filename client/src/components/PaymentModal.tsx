import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  email: string;
  externalReference: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  title,
  email,
  externalReference,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const processCardPayment = trpc.payment.processCard.useMutation();
  const generatePixQrCode = trpc.payment.generatePixQrCode.useMutation();

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    try {
      // Format expiry date (MM/YY -> MM, YY)
      const [month, year] = expiryDate.split("/");

      const result = await processCardPayment.mutateAsync({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder,
        expiryMonth: month,
        expiryYear: `20${year}`,
        cvv,
        amount,
        email,
        externalReference,
        description: title,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Pagamento aprovado! Seu devocional será enviado em breve." });
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage({ type: "error", text: result.error || "Tente novamente" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao processar pagamento. Tente novamente mais tarde." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await generatePixQrCode.mutateAsync({
        amount,
        email,
        externalReference,
        description: title,
      });

      if (result.qrCode) {
        setMessage({ type: "success", text: "PIX gerado com sucesso! Escaneie o QR code para pagar." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao gerar PIX. Tente novamente." });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{0,2})/, "$1/$2")
      .slice(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escolha a forma de pagamento</DialogTitle>
        </DialogHeader>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {!paymentMethod ? (
          <div className="flex gap-4">
            <Button
              onClick={() => setPaymentMethod("card")}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              💳 Cartão de Crédito
            </Button>
            <Button
              onClick={() => setPaymentMethod("pix")}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              📱 PIX
            </Button>
          </div>
        ) : paymentMethod === "card" ? (
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                disabled={isProcessing}
              />
            </div>

            <div>
              <Label htmlFor="cardHolder">Nome do Titular</Label>
              <Input
                id="cardHolder"
                placeholder="JOÃO DA SILVA"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Validade (MM/YY)</Label>
                <Input
                  id="expiryDate"
                  placeholder="12/25"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentMethod(null)}
                disabled={isProcessing}
              >
                Voltar
              </Button>
              <Button type="submit" className="flex-1" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pagar R$ {(amount / 100).toFixed(2)}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR code abaixo com seu celular
              </p>
              <div className="bg-gray-100 p-8 rounded-lg">
                <div className="text-4xl">📱</div>
                <p className="text-xs text-gray-500 mt-2">QR Code será exibido aqui</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentMethod(null)}
                disabled={isProcessing}
              >
                Voltar
              </Button>
              <Button onClick={handlePixPayment} className="flex-1" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar PIX
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
