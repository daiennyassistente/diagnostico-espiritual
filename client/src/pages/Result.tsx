import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw, Heart, BookOpen, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AIResult {
  profileName: string;
  profileDescription: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  nextSteps: string[];
}

export default function Result() {
  const [location, setLocation] = useLocation();
  const [result, setResult] = useState<AIResult | null>(null);
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  
  const generatePDFMutation = trpc.pdf.generateDiagnosticPDF.useMutation();
  const generateResultMutation = trpc.aiResult.generateFromResponses.useMutation();

  useEffect(() => {
    // Recuperar respostas do localStorage
    const savedResponses = localStorage.getItem("quizResponses");
    if (savedResponses) {
      const parsed = JSON.parse(savedResponses);
      setResponses(parsed);
      
      // Gerar resultado com IA
      generateResultMutation.mutate(
        { responses: parsed },
        {
          onSuccess: (data: any) => {
            setResult(data);
            // Salvar resultado no localStorage para uso na página de sucesso
            localStorage.setItem('quizResult', JSON.stringify(data));
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Erro ao gerar resultado:", error);
            toast.error("Erro ao gerar seu diagnóstico");
            setIsLoading(false);
          },
        }
      );
    } else {
      // Redirecionar para o quiz se não houver respostas
      setLocation("/");
    }
  }, [generateResultMutation, setLocation]);

  const handleDownloadPDF = async () => {
    if (!result || !responses) return;

    setIsGeneratingPDF(true);
    try {
      const pdfResponse = await generatePDFMutation.mutateAsync({
        profileName: result.profileName,
        profileDescription: result.profileDescription,
        strengths: result.strengths,
        challenges: result.challenges,
        recommendations: result.recommendations,
        nextSteps: result.nextSteps,
        responses: responses,
      });

      if (pdfResponse.success && pdfResponse.pdfBase64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${pdfResponse.pdfBase64}`;
        link.download = "diagnostico-espiritual.pdf";
        link.click();
        toast.success("PDF baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizResponses");
    localStorage.removeItem("quizLeadId");
    setLocation("/quiz");
  };

  const handleShare = async () => {
    setIsSharing(true);
    const text = `Fiz um diagnóstico espiritual e descobri que sou: ${result?.profileName}\n\n${result?.profileDescription}`;
    const encodedText = encodeURIComponent(text);
    
    try {
      // Tentar usar Web Share API primeiro (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "Meu Diagnóstico Espiritual",
          text: text,
        });
      } else {
        // Fallback: tentar WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        const popup = window.open(whatsappUrl, '_blank');
        if (!popup) {
          // Se popup foi bloqueado, copiar para clipboard
          await navigator.clipboard.writeText(text);
          toast.success("Resultado copiado para a área de transferência!");
        } else {
          toast.success("Abrindo WhatsApp...");
        }
      }
    } catch (error) {
      // Se tudo falhar, copiar para clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Resultado copiado para a área de transferência!");
      } catch {
        toast.error("Erro ao compartilhar resultado");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const [isBuyingGuide, setIsBuyingGuide] = useState(false);
  const createCheckoutMutation = trpc.quiz.createDevocionalCheckout.useMutation();

  const handleBuyGuide = async () => {
    if (!result || !responses) return;
    
    setIsBuyingGuide(true);
    
    // Obter email do localStorage (salvo durante captura de leads)
    const leadData = localStorage.getItem("leadData");
    if (!leadData) {
      toast.error("Email não encontrado. Por favor, complete o quiz novamente.");
      setIsBuyingGuide(false);
      return;
    }
    
    const { email } = JSON.parse(leadData);
    
    createCheckoutMutation.mutate(
      {
        email,
        profileName: result.profileName,
      },
      {
        onSuccess: (data: any) => {
          if (data.checkoutUrl) {
            window.open(data.checkoutUrl, "_blank");
            toast.success("Redirecionando para o checkout...");
          }
        },
        onError: (error: any) => {
          console.error("Erro ao criar checkout:", error);
          toast.error("Erro ao processar pagamento. Tente novamente.");
        },
        onSettled: () => {
          setIsBuyingGuide(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">✨</div>
          <p className="text-foreground text-lg">Gerando seu diagnóstico personalizado...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-foreground text-lg">Erro ao carregar resultado</p>
          <Button onClick={handleRetakeQuiz} className="mt-4">
            Voltar ao Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Extrair emoji do profileName
  const emojiMatch = result.profileName.match(/^(.)\s/);
  const emoji = emojiMatch ? emojiMatch[1] : "✨";
  const profileTitle = result.profileName.replace(/^(.)\s/, "");

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-2xl">
        {/* ===== RESULTADO GRATUITO ===== */}
        
        {/* Header com emoji e título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {profileTitle}
          </h1>
          <p className="text-sm text-accent font-semibold">Seu Diagnóstico Espiritual</p>
        </div>

        {/* Descrição conversacional com urgência */}
        <div className="mb-8 p-6 bg-secondary rounded-lg border border-muted">
          <p className="text-foreground text-lg leading-relaxed">
            {result.profileDescription}
          </p>
          <p className="text-foreground text-sm mt-4 italic border-l-4 border-accent pl-4">
            "Este é o momento certo para dar o próximo passo em sua jornada com Deus."
          </p>
        </div>

        {/* Seção de Pontos Fortes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Seus Pontos Fortes
          </h2>
          <div className="space-y-2">
            {result.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">✓</span>
                <p className="text-foreground">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Desafios */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Desafios a Trabalhar
          </h2>
          <div className="space-y-2">
            {result.challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">•</span>
                <p className="text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Recomendações
          </h2>
          <div className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-accent font-semibold">{index + 1}.</span>
                <p className="text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximo Passo */}
        <div className="mb-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-foreground italic">
            "{result.nextSteps[0] || 'Continue sua jornada espiritual com fé e esperança.'}"
          </p>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="w-full"
            variant="outline"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>

          <Button
            onClick={handleRetakeQuiz}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Fazer Novamente
          </Button>

          <Button
            onClick={handleShare}
            className="w-full"
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mb-8">
          Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.
        </p>

        {/* ===== SEÇÃO DE OFERTA DO GUIA DEVOCIONAL ===== */}
        
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Oferta Principal */}
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-8 border-2 border-accent/30 mb-8">
          {/* Badge de oferta especial */}
          <div className="text-center mb-6">
            <span className="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              ✨ OFERTA ESPECIAL
            </span>
          </div>

          {/* Título da oferta */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            📖 Devocional: 7 Dias para se Aproximar de Deus de Verdade
          </h2>
          <p className="text-center text-accent font-semibold mb-6">
            Personalizado para sua jornada espiritual
          </p>

          {/* Descrição emocional */}
          <div className="bg-white/50 rounded-lg p-6 mb-6">
            <p className="text-foreground text-center leading-relaxed">
              Você recebeu seu diagnóstico. Agora é hora de <strong>agir</strong>.
            </p>
            <p className="text-foreground text-center leading-relaxed mt-3">
              Este devocional foi criado especialmente para sua situação espiritual atual. 
              Com base em seu resultado, você receberá 7 dias de reflexões bíblicas profundas, 
              práticas espirituais e orações que vão transformar sua conexão com Deus.
            </p>
          </div>

          {/* Benefícios do guia */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Devocional 100% Personalizado</p>
                <p className="text-sm text-foreground/80">Baseado especificamente no seu diagnóstico e desafios espirituais</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Fundamentado na Bíblia</p>
                <p className="text-sm text-foreground/80">Cada dia inclui versículos, reflexões profundas e aplicações práticas baseadas na Palavra de Deus</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Transformação Real em 7 Dias</p>
                <p className="text-sm text-foreground/80">Práticas espirituais diárias que você pode começar hoje mesmo</p>
              </div>
            </div>
          </div>

          {/* Preço e CTA */}
          <div className="text-center mb-6">
            <p className="text-sm text-foreground/70 mb-2">Investimento único:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-accent">R$ 9,90</span>
            </div>
            <p className="text-xs text-foreground/60">Acesso imediato ao PDF + Suporte por 30 dias</p>
          </div>

          {/* Botão de compra com urgência */}
          <Button
            onClick={handleBuyGuide}
            disabled={isBuyingGuide}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg mb-4"
          >
            {isBuyingGuide ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 mr-2" />
                Obter Meu Devocional Agora
              </>
            )}
          </Button>

          {/* Garantia */}
          <p className="text-center text-xs text-foreground/70">
            ✓ Garantia: Se não gostar, devolvemos seu dinheiro em 7 dias
          </p>
        </div>

        {/* Depoimento social proof (opcional) */}
        <div className="bg-white/30 rounded-lg p-4 mb-8">
          <p className="text-sm text-foreground italic text-center">
            "Este devocional mudou minha forma de orar e me aproximou muito mais de Deus. 
            Recomendo para quem quer uma conexão real e transformadora."
          </p>
          <p className="text-xs text-foreground/70 text-center mt-2">— Marina S., Brasília</p>
        </div>

        {/* CTA secundária */}
        <div className="text-center">
          <p className="text-foreground text-sm mb-3">
            Não tem certeza? Comece com seu diagnóstico grátis e veja a diferença.
          </p>
          <p className="text-xs text-foreground/60">
            Oferta válida por tempo limitado. Aproveite agora!
          </p>
        </div>
      </div>
    </div>
  );
}
