import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, FileText, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SharePage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      toast.error("Token inválido");
      setLocation("/");
      return;
    }
    
    setToken(tokenParam);
    setLoading(false);
  }, [setLocation]);

  const downloadResultMutation = trpc.download.downloadResult.useMutation();
  const downloadDevotionalMutation = trpc.download.downloadDevotional.useMutation();

  const handleDownloadResult = async () => {
    try {
      downloadResultMutation.mutate(
        { token },
        {
          onSuccess: (data: any) => {
            if (data.pdfBase64) {
              const binaryString = atob(data.pdfBase64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "Diagnostico-Espiritual.pdf";
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
              }, 100);
              toast.success("Resultado baixado com sucesso!");
            }
          },
          onError: (error: any) => {
            toast.error("Erro ao baixar resultado");
            console.error(error);
          },
        }
      );
    } catch (error) {
      toast.error("Erro ao processar download");
      console.error(error);
    }
  };

  const handleDownloadDevotional = async () => {
    try {
      downloadDevotionalMutation.mutate(
        { token },
        {
          onSuccess: (data: any) => {
            if (data.pdfBase64) {
              const binaryString = atob(data.pdfBase64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: "application/pdf" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "Devocional-7-Dias.pdf";
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
              }, 100);
              toast.success("Devocional baixado com sucesso!");
            }
          },
          onError: (error: any) => {
            toast.error("Erro ao baixar devocional");
            console.error(error);
          },
        }
      );
    } catch (error) {
      toast.error("Erro ao processar download");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="spiritual-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Seus Documentos
          </h1>
          <p className="text-muted-foreground">
            Baixe seu diagnóstico espiritual e devocional de 7 dias
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleDownloadResult}
            disabled={downloadResultMutation.isPending}
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            variant="default"
          >
            {downloadResultMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              Baixar Diagnóstico Espiritual
            </span>
            <span className="text-xs opacity-75">PDF - Seu resultado personalizado</span>
          </Button>

          <Button
            onClick={handleDownloadDevotional}
            disabled={downloadDevotionalMutation.isPending}
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            variant="outline"
          >
            {downloadDevotionalMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              Baixar Devocional de 7 Dias
            </span>
            <span className="text-xs opacity-75">PDF - Guia espiritual personalizado</span>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Este link expira em 7 dias. Baixe seus documentos agora.
          </p>
        </div>
      </Card>
    </div>
  );
}
