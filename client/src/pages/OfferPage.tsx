import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { parseStoredLeadData } from '@/lib/leadStorage';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MercadoPagoPixModal } from '@/components/MercadoPagoPixModal';

export default function OfferPage() {
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [timerExpired, setTimerExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const leadId = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('leadId');
    if (fromUrl) return Number(fromUrl);

    const stored = parseStoredLeadData(localStorage.getItem('leadData'));
    return stored?.leadId ?? null;
  }, []);

  const resultQuery = trpc.quiz.getResult.useQuery(
    { leadId: leadId ?? 0 },
    { enabled: Boolean(leadId) }
  );

  const createPayment = trpc.payment.createMercadoPagoPayment.useMutation();

  useEffect(() => {
    if (timerExpired) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckout = () => {
    if (!leadId) {
      toast.error('Não foi possível identificar o usuário da oferta');
      navigate('/quiz', { replace: true });
      return;
    }

    if (!resultQuery.data?.lead?.email || !resultQuery.data?.diagnostic?.id) {
      toast.error('Ainda estamos preparando os dados do pagamento');
      return;
    }

    setIsProcessing(true);
    localStorage.setItem('purchaseAmount', '7.90');

    createPayment.mutate(
      {
        email: resultQuery.data.lead.email,
        leadId: String(leadId),
        quizId: 'offer-whatsapp',
        resultId: Number(resultQuery.data.diagnostic.id),
        profileName: resultQuery.data.diagnostic.profileName || 'Diagnóstico Espiritual',
        userPhone: resultQuery.data.lead.whatsapp || '',
        paymentMethod: 'pix',
        amount: 7.9,
      } as any,
      {
        onSuccess: (data: any) => {
          setIsProcessing(false);

          if (data.success && data.pixCode && data.pixQrCode && data.transactionId) {
            setPixCode(data.pixCode);
            setPixQrCode(data.pixQrCode);
            setTransactionId(data.transactionId);
            setShowPixModal(true);
            toast.success('QR Code PIX gerado com sucesso');
            return;
          }

          toast.error(data.error || 'Não foi possível gerar o pagamento PIX');
        },
        onError: (error: any) => {
          setIsProcessing(false);
          console.error('Erro ao gerar PIX da oferta:', error);
          toast.error('Erro ao gerar o pagamento PIX');
        },
      }
    );
  };

  if (timerExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50 p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">⏰ Oferta Expirada</h1>
          <p className="mb-6 text-gray-700">
            Infelizmente, o tempo para aproveitar essa oferta exclusiva acabou. Mas você ainda pode voltar ao início e refazer o processo.
          </p>
          <Button
            onClick={() => navigate('/', { replace: true })}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
          >
            VOLTAR PARA INÍCIO
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <Card className="w-full max-w-md p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-full bg-red-600 px-6 py-3 text-lg font-bold text-white">
              ⏱️ {formatTime(timeLeft)}
            </div>
            <p className="text-sm font-semibold text-red-600">Essa condição pode sair do ar a qualquer momento</p>
          </div>

          <h1 className="mb-4 text-center text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            Você quase garantiu o seu acesso…
          </h1>

          <p className="mb-6 text-center text-lg font-semibold text-gray-700">Não perca isso agora!</p>

          <div className="mb-6 rounded border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              Vi que você chegou até aqui, mas não finalizou. Então resolvi te dar mais uma chance. Essa oferta é <strong>exclusiva para quem veio pelo WhatsApp</strong> e expira em <strong>{formatTime(timeLeft)}</strong>.
            </p>
          </div>

          <div className="mb-6 rounded-lg border-2 border-green-400 p-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Preço original:</p>
            <p className="mb-3 text-2xl font-bold text-gray-400 line-through">R$ 9,90</p>
            <p className="mb-2 text-xs font-bold text-green-600">OFERTA EXCLUSIVA WHATSAPP</p>
            <p className="mb-4 text-4xl font-bold text-green-600">R$ 7,90</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ <strong>Acesso imediato</strong> ao devocional</p>
              <p>✅ <strong>Garantia de 7 dias</strong> de satisfação</p>
              <p>✅ <strong>Suporte completo</strong> por WhatsApp</p>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <h3 className="mb-4 text-center font-bold text-gray-900">O que você vai receber:</h3>
            <p className="text-sm text-gray-700">📖 <strong>Devocional personalizado</strong> baseado no seu diagnóstico espiritual</p>
            <p className="text-sm text-gray-700">⚡ <strong>Acesso imediato</strong> para baixar assim que o pagamento for aprovado</p>
            <p className="text-sm text-gray-700">🛡️ <strong>Garantia de 7 dias</strong> para sua compra</p>
            <p className="text-sm text-gray-700">💬 <strong>Suporte via WhatsApp</strong> para qualquer dúvida</p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center text-xs text-gray-600">
            <p className="mb-2">🔒 <strong>Pagamento 100% seguro</strong> com Mercado Pago</p>
            <p>✓ Você receberá o acesso imediatamente após a confirmação</p>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={timerExpired || !leadId || resultQuery.isLoading || isProcessing}
            className="mb-3 w-full rounded-lg bg-green-600 py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando PIX...
              </>
            ) : resultQuery.isLoading ? (
              '⏳ Carregando...'
            ) : (
              '🎁 FINALIZAR MINHA COMPRA'
            )}
          </Button>

          <Button
            onClick={() => navigate('/', { replace: true })}
            variant="outline"
            className="w-full rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700"
            disabled={isProcessing}
          >
            Não, obrigado
          </Button>

          <p className="mt-4 text-center text-xs font-semibold text-red-600">
            ⚠️ Essa oferta é válida apenas por {formatTime(timeLeft)}
          </p>
        </Card>
      </div>

      <MercadoPagoPixModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        qrCode={pixQrCode}
        pixCode={pixCode}
        transactionId={transactionId}
        amount={7.9}
      />
    </>
  );
}
