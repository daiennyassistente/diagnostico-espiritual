'use client';
import { useState, useMemo, useEffect } from 'react';
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

    // Usar dados do lead se disponível, senão usar fallback do localStorage
    const email = resultQuery.data?.lead?.email || localStorage.getItem('leadEmail') || 'nao-informado@oferta.com';
    const phone = resultQuery.data?.lead?.whatsapp || localStorage.getItem('leadPhone') || '';
    const diagnosticId = resultQuery.data?.diagnostic?.id || 1;
    const profileName = resultQuery.data?.diagnostic?.profileName || 'Diagnóstico Espiritual';

    setIsProcessing(true);
    localStorage.setItem('purchaseAmount', '7.90');

    createPayment.mutate(
      {
        email: email,
        leadId: String(leadId),
        quizId: 'offer-whatsapp',
        resultId: Number(diagnosticId),
        profileName: profileName,
        userPhone: phone,
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-50 to-white p-4">
        <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
          {/* Header com timer */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center text-white sm:px-8">
            <div className="mb-3 text-5xl font-bold">
              ⏱️ {formatTime(timeLeft)}
            </div>
            <p className="text-sm font-semibold opacity-90">Essa condição pode sair do ar a qualquer momento</p>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6 sm:p-8">
            <h1 className="mb-3 text-center text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Você quase garantiu o seu acesso…
            </h1>

            <p className="mb-8 text-center text-xl font-semibold text-green-600">Não perca isso agora!</p>

            {/* Mensagem de exclusividade */}
            <div className="mb-8 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-5">
              <p className="text-base text-blue-900">
                Vi que você chegou até aqui, mas não finalizou. Então resolvi te dar mais uma chance. Essa oferta é <strong>exclusiva para quem veio pelo WhatsApp</strong> e expira em <strong>{formatTime(timeLeft)}</strong>.
              </p>
            </div>

            {/* Preço e oferta */}
            <div className="mb-8 rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-white p-8 text-center">
              <p className="mb-2 text-sm font-semibold text-gray-600">Preço original:</p>
              <p className="mb-4 text-3xl font-bold text-gray-400 line-through">R$ 9,90</p>
              <p className="mb-3 inline-block rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">🎁 OFERTA EXCLUSIVA WHATSAPP</p>
              <p className="mb-6 text-5xl font-bold text-green-600">R$ 7,90</p>
              <div className="space-y-3 text-base text-gray-700">
                <p>✅ <strong>Acesso imediato</strong> ao devocional</p>
                <p>✅ <strong>Garantia de 2 dias</strong> de satisfação</p>
                <p>✅ <strong>Suporte completo</strong> por WhatsApp</p>
              </div>
            </div>

            {/* O que você vai receber */}
            <div className="mb-8 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-5 text-center text-lg font-bold text-gray-900">O que você vai receber:</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-bold text-gray-900">Devocional personalizado</p>
                    <p className="text-sm text-gray-600">Baseado no seu diagnóstico espiritual</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-gray-900">Acesso imediato</p>
                    <p className="text-sm text-gray-600">Baixe assim que pagar</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-bold text-gray-900">Garantia de 2 dias</p>
                    <p className="text-sm text-gray-600">Satisfação garantida</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-gray-900">Suporte via WhatsApp</p>
                    <p className="text-sm text-gray-600">Para qualquer dúvida</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="mb-8 rounded-lg bg-blue-50 p-5 text-center">
              <p className="mb-2 text-sm font-bold text-blue-900">🔒 <strong>Pagamento 100% seguro</strong> com Mercado Pago</p>
              <p className="text-sm text-blue-800">✓ Você receberá o acesso imediatamente após a confirmação</p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={timerExpired || isProcessing}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-5 text-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  '🎁 FINALIZAR MINHA COMPRA'
                )}
              </Button>

              <Button
                onClick={() => navigate('/', { replace: true })}
                variant="outline"
                className="w-full rounded-lg border-2 border-gray-300 py-4 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                disabled={isProcessing}
              >
                Não, obrigado
              </Button>
            </div>

            <p className="mt-6 text-center text-xs font-bold text-red-600">
              ⚠️ Essa oferta é válida apenas por {formatTime(timeLeft)}
            </p>
          </div>
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
