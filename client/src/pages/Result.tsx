import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2, RotateCcw } from "lucide-react";
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
          onSuccess: (data) => {
            setResult(data);
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
  }, [setLocation]);

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
        {/* Header com emoji e título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {profileTitle}
          </h1>
        </div>

        {/* Descrição conversacional */}
        <div className="mb-8 p-6 bg-secondary rounded-lg border border-muted">
          <p className="text-foreground text-lg leading-relaxed">
            {result.profileDescription}
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

        {/* Divisor */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <p className="text-center text-sm text-muted-foreground mt-8">
          Este diagnóstico é uma ferramenta de reflexão espiritual. Para orientação profunda, busque um conselheiro ou pastor de sua comunidade.
        </p>
      </div>
    </div>
  );
}
