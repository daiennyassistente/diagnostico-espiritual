import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Zap, Heart, BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import { MercadoPagoCheckout } from "@/components/MercadoPagoCheckout";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function OfferPage() {
  const [, setLocation] = useLocation();
  const [showCheckout, setShowCheckout] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();

  const handleCheckout = () => {
    if (!user?.email) {
      toast.error("Não conseguimos identificar seu e-mail. Refaça o quiz.");
      return;
    }
    setShowCheckout(true);
  };

  return (
    <div className="spiritual-background min-h-screen py-10 px-4">
      <div className="container max-w-4xl">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
              Sua Libertação Espiritual Começa Aqui
            </h1>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              Um devocional de 7 dias especialmente criado para sua situação espiritual, com meditações, orações e ações práticas para reconstruir sua conexão com Deus.
            </p>
          </div>
        </section>

        {/* Main Offer Card */}
        <section className="mb-12">
          <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">O que você vai receber:</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-primary">7 Dias de Devocional Personalizado</p>
                      <p className="text-sm text-slate-600">Cada dia é especialmente criado para sua situação espiritual</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-primary">Meditações Bíblicas Profundas</p>
                      <p className="text-sm text-slate-600">Versículos selecionados para sua caminhada espiritual</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-primary">Orações Transformadoras</p>
                      <p className="text-sm text-slate-600">Orações estruturadas para sua libertação e cura</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-primary">Ações Práticas Diárias</p>
                      <p className="text-sm text-slate-600">Passos concretos para reconstruir sua vida espiritual</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-primary">PDF para Baixar</p>
                      <p className="text-sm text-slate-600">Acesso imediato após o pagamento</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right: CTA */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-primary mb-2">R$ 9,90</div>
                  <p className="text-slate-600 mb-4">Investimento único para sua transformação</p>
                  <p className="text-sm text-slate-500">Pagamento seguro via Pix</p>
                </div>

                <Button
                  size="lg"
                  className="w-full text-lg font-bold mb-4 py-6"
                  style={{ backgroundColor: "#FFC700", color: "#17395F" }}
                  onClick={handleCheckout}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Começar Minha Transformação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  ✓ Acesso imediato após pagamento<br/>
                  ✓ Garantia de satisfação<br/>
                  ✓ Suporte por WhatsApp
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Social Proof */}
        <section className="mb-12 bg-white rounded-lg p-8 border border-accent/40">
          <h3 className="text-xl font-bold text-primary text-center mb-6">Por que este devocional funciona?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold text-primary mb-2">100% Personalizado</p>
              <p className="text-sm text-slate-600">Criado especificamente para sua situação espiritual identificada no diagnóstico</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold text-primary mb-2">Fundamentado na Bíblia</p>
              <p className="text-sm text-slate-600">Cada meditação é baseada na Palavra de Deus e verdades cristãs</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold text-primary mb-2">Suporte Disponível</p>
              <p className="text-sm text-slate-600">Dúvidas? Estamos aqui para ajudar via WhatsApp</p>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="mb-12 bg-primary/5 rounded-lg p-8 border border-primary/20">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-slate-700 italic mb-4 leading-relaxed">
              "Este devocional me ajudou a entender que meu cansaço espiritual não era fraqueza, mas um convite para me reconectar com Deus. Em 7 dias, senti uma transformação real em meu coração."
            </p>
            <p className="font-semibold text-primary">— Maria, São Paulo</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-primary text-center mb-8">Perguntas Frequentes</h3>
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="font-semibold text-primary mb-2">Como funciona o acesso ao devocional?</h4>
              <p className="text-slate-700">Após o pagamento via Pix, você receberá um link para baixar o PDF imediatamente. Também enviaremos por e-mail.</p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold text-primary mb-2">Posso usar o devocional quantas vezes quiser?</h4>
              <p className="text-slate-700">Sim! O devocional é seu para sempre. Você pode fazer os 7 dias quantas vezes precisar.</p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold text-primary mb-2">Qual é a garantia de satisfação?</h4>
              <p className="text-slate-700">Se não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas.</p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold text-primary mb-2">Preciso de ajuda?</h4>
              <p className="text-slate-700">Claro! Estamos disponíveis via WhatsApp para responder suas dúvidas sobre o devocional.</p>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Sua Transformação Espiritual Começa Agora
          </h2>
          <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
            Não deixe para depois. Cada dia que passa é uma oportunidade de se reconectar com Deus. Comece hoje mesmo.
          </p>
          <Button
            size="lg"
            className="text-lg font-bold py-6 px-8"
            style={{ backgroundColor: "#FFC700", color: "#17395F" }}
            onClick={handleCheckout}
          >
            <Zap className="w-5 h-5 mr-2" />
            Começar Minha Transformação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>

        {/* Trust Badges */}
        <section className="text-center py-8 border-t border-accent/40">
          <p className="text-sm text-slate-600 mb-4">Pagamento seguro e protegido</p>
          <p className="text-xs text-slate-500">
            ✓ Processamento seguro via Pix<br/>
            ✓ Seus dados são protegidos<br/>
            ✓ Sem cobranças recorrentes
          </p>
        </section>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
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
                email={user?.email || ""}
                leadId=""
                quizId=""
                resultId={0}
                profileName="Devocional"
                userPhone=""
                onSuccess={() => {
                  toast.success("Pagamento processado com sucesso!");
                  setShowCheckout(false);
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
