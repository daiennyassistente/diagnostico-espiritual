import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseStoredLeadData } from '@/lib/leadStorage';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function OfferPage() {
  const [location, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [timerExpired, setTimerExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mercadoPagoReady, setMercadoPagoReady] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);

  // Verificar se veio do WhatsApp
  const isFromWhatsApp = new URLSearchParams(location.split('?')[1]).get('source') === 'whatsapp';

  // Hook para criar checkout do Mercado Pago
  const createStripeCheckoutMutation = trpc.payment.createStripeCheckout.useMutation();

  // Tentar ler leadId do localStorage continuamente
  useEffect(() => {
    const checkLeadId = () => {
      const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
      if (leadData?.leadId) {
        setLeadId(leadData.leadId);
        console.log('[OfferPage] leadId carregado:', leadData.leadId);
      }
    };

    // Verificar imediatamente
    checkLeadId();

    // Tentar novamente a cada 500ms por 10 segundos
    const interval = setInterval(checkLeadId, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '');
        setMercadoPagoReady(true);
        console.log('[OfferPage] Mercado Pago SDK carregado');
      }
    };
    document.head.appendChild(script);
  }, []);

  // Timer de contagem regressiva
  useEffect(() => {
    if (timerExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerExpired]);

  // Formatar tempo para MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Abrir Mercado Pago Checkout Pro em modal
  const handleCheckout = async () => {
    console.log('[OfferPage] handleCheckout chamado, leadId:', leadId);
    
    if (!leadId) {
      console.log('[OfferPage] leadId não encontrado');
      toast.error("Por favor, complete o quiz primeiro para continuar");
      navigate('/quiz', { replace: true });
      return;
    }

    if (!mercadoPagoReady) {
      console.log('[OfferPage] Mercado Pago não está pronto');
      toast.error("Mercado Pago não carregou. Tente novamente.");
      return;
    }

    const leadData = parseStoredLeadData(localStorage.getItem("leadData"));
    if (!leadData?.email) {
      console.log('[OfferPage] Email não encontrado');
      toast.error("Email não encontrado");
      return;
    }

    console.log('[OfferPage] Iniciando checkout com leadId:', leadId);
    setIsProcessing(true);

    createStripeCheckoutMutation.mutate(
      {
        email: leadData.email,
        profileName: "Diagnóstico Espiritual",
        userPhone: leadData.whatsapp,
        leadId: leadId.toString(),
      },
      {
        onSuccess: (data: any) => {
          console.log('[OfferPage] Checkout criado com sucesso:', data);
          if (data.success && data.preferenceId) {
            // Abrir Mercado Pago Checkout Pro em modal
            console.log('[OfferPage] Abrindo Mercado Pago Checkout com preferenceId:', data.preferenceId);
            const checkout = new window.MercadoPago.Checkout({
              preference: {
                id: data.preferenceId,
              },
              autoOpen: true,
            });
            setIsProcessing(false);
          } else {
            console.log('[OfferPage] Erro: preferenceId não retornado');
            toast.error("Não foi possível abrir o checkout");
            setIsProcessing(false);
          }
        },
        onError: (error) => {
          console.error('[OfferPage] Erro ao criar checkout:', error);
          setIsProcessing(false);
          toast.error("Erro ao criar checkout");
        },
      }
    );
  };

  if (timerExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center border-red-200 bg-red-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ⏰ Oferta Expirada
          </h1>
          <p className="text-gray-700 mb-6">
            Infelizmente, o tempo para aproveitar essa oferta exclusiva acabou. Mas não se preocupe, você ainda pode adquirir o devocional pelo preço regular.
          </p>
          <Button
            onClick={() => navigate('/checkout', { replace: true })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            ACESSAR CHECKOUT REGULAR
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl">
        {/* Timer - Destaque Principal */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg mb-4">
            ⏱️ {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-red-600 font-semibold">
            Essa condição pode sair do ar a qualquer momento
          </p>
        </div>

        {/* Headline Principal */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4 leading-tight">
          Você quase garantiu o seu acesso…
        </h1>

        <p className="text-center text-lg text-gray-700 mb-6 font-semibold">
          Não perca isso agora! 🙏
        </p>

        {/* Seção de Conexão - Estilo WhatsApp */}
        <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mb-6 rounded">
          <p className="text-gray-800 text-sm leading-relaxed">
            Vi que você chegou até aqui, mas não finalizou… então resolvi te dar mais uma chance. Essa oferta é <strong>exclusiva para quem veio pelo WhatsApp</strong> e <strong>expira em {formatTime(timeLeft)}</strong>.
          </p>
        </div>

        {/* Oferta Especial */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 p-6 mb-6 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">Preço original:</p>
          <p className="text-2xl font-bold text-gray-400 line-through mb-3">
            R$ 9,90
          </p>

          <p className="text-xs text-green-600 font-bold mb-2">OFERTA EXCLUSIVA WHATSAPP</p>
          <p className="text-4xl font-bold text-green-600 mb-4">
            R$ 7,90
          </p>

          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              ✅ <strong>Acesso imediato</strong> ao devocional
            </p>
            <p className="text-gray-700">
              ✅ <strong>Garantia de 7 dias</strong> de satisfação
            </p>
            <p className="text-gray-700">
              ✅ <strong>Suporte completo</strong> por WhatsApp
            </p>
          </div>
        </div>

        {/* Benefícios / Transformação */}
        <div className="mb-6 space-y-3">
          <h3 className="font-bold text-gray-900 text-center mb-4">
            O que você vai receber:
          </h3>

          <div className="flex items-start gap-3">
            <span className="text-xl">📖</span>
            <p className="text-sm text-gray-700">
              <strong>Devocional personalizado</strong> baseado no seu diagnóstico espiritual
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">⚡</span>
            <p className="text-sm text-gray-700">
              <strong>Acesso imediato</strong> - Baixe agora mesmo
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <p className="text-sm text-gray-700">
              <strong>Garantia de 7 dias</strong> - Se não gostar, devolvemos seu dinheiro
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <p className="text-sm text-gray-700">
              <strong>Suporte via WhatsApp</strong> para qualquer dúvida
            </p>
          </div>
        </div>

        {/* Quebra de Objeções */}
        <div className="bg-gray-50 p-4 mb-6 rounded-lg text-center text-xs text-gray-600">
          <p className="mb-2">
            🔒 <strong>Pagamento 100% seguro</strong> - Protegido por Mercado Pago
          </p>
          <p>
            ✓ Você receberá o acesso <strong>imediatamente</strong> após a confirmação
          </p>
        </div>

        {/* CTA Principal */}
        <Button
          onClick={handleCheckout}
          disabled={timerExpired || !leadId || isProcessing || !mercadoPagoReady}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg rounded-lg mb-3 transition-all duration-200 transform hover:scale-105"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Abrindo Pagamento...
            </>
          ) : !leadId ? (
            <>
              ⏳ Carregando...
            </>
          ) : (
            <>
              🎁 FINALIZAR MINHA COMPRA
            </>
          )}
        </Button>

        {/* CTA Secundário */}
        <Button
          onClick={() => navigate('/', { replace: true })}
          variant="outline"
          className="w-full text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300"
          disabled={isProcessing}
        >
          Não, obrigado
        </Button>

        {/* Urgência Final */}
        <p className="text-center text-xs text-red-600 font-bold mt-4">
          ⚠️ Essa oferta é válida apenas por {formatTime(timeLeft)}
        </p>
      </Card>
    </div>
  );
}
