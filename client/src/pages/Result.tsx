import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { analyzeResponses, SpiritualProfile } from "@/lib/spiritualProfileAnalyzer";
import { Heart, Lightbulb, Target, TrendingUp, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Result() {
  const [location, setLocation] = useLocation();
  const [profile, setProfile] = useState<SpiritualProfile | null>(null);
  const [responses, setResponses] = useState<Record<number, string> | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const generatePDFMutation = trpc.pdf.generateDiagnosticPDF.useMutation();

  useEffect(() => {
    // Recuperar respostas do localStorage
    const savedResponses = localStorage.getItem("quizResponses");
    if (savedResponses) {
      const parsed = JSON.parse(savedResponses);
      setResponses(parsed);
      const analyzedProfile = analyzeResponses(parsed);
      setProfile(analyzedProfile);
    } else {
      // Redirecionar para o quiz se não houver respostas
      setLocation("/");
    }
  }, [setLocation]);

  if (!profile || !responses) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">✨</div>
          <p className="text-foreground">Analisando seu diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-background min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <div className="quiz-card w-full max-w-3xl">
        {/* Header com emoji e título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{profile.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {profile.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {profile.description}
          </p>
        </div>

        {/* Divisor */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Seção de Pontos Fortes */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Seus Pontos Fortes
            </h2>
          </div>
          <div className="grid gap-3">
            {profile.strengths.map((strength, index) => (
              <div
                key={index}
                className="p-4 bg-secondary rounded-lg border border-muted"
              >
                <p className="text-foreground">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Desafios */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Desafios a Trabalhar
            </h2>
          </div>
          <div className="grid gap-3">
            {profile.challenges.map((challenge, index) => (
              <div
                key={index}
                className="p-4 bg-secondary rounded-lg border border-muted"
              >
                <p className="text-foreground">{challenge}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Recomendações */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Recomendações Personalizadas
            </h2>
          </div>
          <div className="grid gap-3">
            {profile.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/20"
              >
                <div className="flex gap-3">
                  <div className="text-accent font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-foreground">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Próximos Passos */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Próximos Passos
            </h2>
          </div>
          <div className="grid gap-3">
            {profile.nextSteps.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-secondary rounded-lg border-l-4 border-accent"
              >
                <p className="text-foreground font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divisor */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8"></div>

        {/* Mensagem de Esperança */}
        <div className="bg-gradient-to-r from-accent/5 to-transparent p-6 rounded-lg mb-8 border border-accent/10">
          <p className="text-foreground text-center italic">
            "Lembre-se: sua jornada espiritual é única e valiosa. Cada passo,
            por menor que seja, é progresso. Deus caminha com você em cada
            etapa."
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={async () => {
              setIsGeneratingPDF(true);
              try {
                const result = await generatePDFMutation.mutateAsync({
                  profileName: profile.title,
                  profileDescription: profile.description,
                  strengths: profile.strengths,
                  challenges: profile.challenges,
                  recommendations: profile.recommendations,
                  nextSteps: profile.nextSteps,
                  responses: responses as Record<string, string>,
                });

                if (result.success && result.pdfBase64) {
                  const link = document.createElement("a");
                  link.href = `data:application/pdf;base64,${result.pdfBase64}`;
                  link.download = `diagnostico-espiritual-${profile.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success("PDF baixado com sucesso!");
                }
              } catch (error) {
                console.error("Erro ao gerar PDF:", error);
                toast.error("Erro ao gerar PDF. Tente novamente.");
              } finally {
                setIsGeneratingPDF(false);
              }
            }}
            disabled={isGeneratingPDF}
            className="flex-1"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Baixar Diagnóstico em PDF
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("quizResponses");
              setLocation("/");
            }}
            variant="outline"
            className="flex-1"
          >
            Fazer Diagnóstico Novamente
          </Button>
          <Button
            onClick={() => {
              // Compartilhar resultado
              const message = `Meu perfil espiritual é: ${profile.title}. Faça seu diagnóstico em: ${window.location.origin}`;
              if (navigator.share) {
                navigator.share({
                  title: "Diagnóstico Espiritual",
                  text: message,
                });
              } else {
                // Fallback para copiar
                navigator.clipboard.writeText(message);
                alert("Link copiado para compartilhar!");
              }
            }}
            className="flex-1"
          >
            Compartilhar Resultado
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl">
        <p>
          Este diagnóstico é uma ferramenta de reflexão espiritual. Para
          orientação profunda, busque um conselheiro ou pastor de sua
          comunidade.
        </p>
      </div>
    </div>
  );
}
