import { useEffect, useState } from 'react';
import { X, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MercadoPagoPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  pixCode: string;
  transactionId: string;
  amount?: number;
}

export function MercadoPagoPixModal({
  isOpen,
  onClose,
  qrCode,
  pixCode,
  transactionId,
  amount = 7.9,
}: MercadoPagoPixModalProps) {
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [secondsUntilRedirect, setSecondsUntilRedirect] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isOpen || !transactionId || paymentConfirmed) return;

    let isMounted = true;
    const intervalId = window.setInterval(async () => {
      if (!isMounted) return;
      
      try {
        const response = await fetch(`/api/check-payment?transaction_id=${encodeURIComponent(transactionId)}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.status === 'approved' && isMounted) {
          window.clearInterval(intervalId);
          setPaymentConfirmed(true);
          toast.success('Pagamento aprovado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento PIX:', error);
      }
    }, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isOpen, transactionId, paymentConfirmed]);

  useEffect(() => {
    if (!paymentConfirmed) return;

    let isMounted = true;
    const countdown = window.setInterval(() => {
      if (!isMounted) return;
      
      setSecondsUntilRedirect((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdown);
          if (isMounted) {
            setIsRedirecting(true);
            window.location.href = `/sucesso?transaction_id=${encodeURIComponent(transactionId)}&amount=${encodeURIComponent(amount.toFixed(2))}`;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      window.clearInterval(countdown);
    };
  }, [paymentConfirmed, transactionId, amount]);

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código copiado');
      const timeoutId = window.setTimeout(() => setCopied(false), 2000);
      return () => window.clearTimeout(timeoutId);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      toast.error('Não foi possível copiar o código PIX');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Pagamento</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={paymentConfirmed || isRedirecting}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {!paymentConfirmed ? (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-center text-base font-semibold text-gray-900">Pagamento PIX</h3>

                <div className="mb-4 flex justify-center">
                  <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    <img
                      src={qrCode}
                      alt="QR Code PIX"
                      className="h-64 w-64 max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Código PIX (copia e cola):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixCode}
                      readOnly
                      className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPixCode}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Escaneie o QR Code ou copie o código para fazer o pagamento no seu banco.
              </p>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-800">
                  Assim que o pagamento for aprovado, esta tela será atualizada automaticamente e você será redirecionado em até 5 segundos.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Voltar
              </button>
            </>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-green-600">Pagamento confirmado</h3>
                <p className="text-sm text-gray-600">
                  Seu devocional será liberado e enviado por e-mail automaticamente.
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  Redirecionando em {secondsUntilRedirect}s...
                </p>
              </div>
              {isRedirecting && (
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparando seu download...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
