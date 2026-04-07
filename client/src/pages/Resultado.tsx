import { Button } from '@/components/ui/button';

export default function Resultado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="quiz-card max-w-2xl w-full text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Seu diagnóstico foi enviado!
          </h1>
          <p className="text-lg text-foreground/80">
            Obrigado por compartilhar suas respostas conosco. Em breve você receberá sua leitura espiritual e orientações personalizadas no WhatsApp e e-mail.
          </p>
        </div>

        <div className="bg-secondary/30 rounded-lg p-6 space-y-3">
          <p className="text-foreground font-semibold">
            O que você pode esperar:
          </p>
          <ul className="text-left space-y-2 text-foreground/80">
            <li>✓ Análise personalizada da sua fase espiritual</li>
            <li>✓ Identificação de possíveis bloqueios</li>
            <li>✓ Orientações práticas para avançar</li>
            <li>✓ Próximos passos recomendados</li>
          </ul>
        </div>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold"
        >
          Voltar para a página inicial
        </Button>
      </div>
    </div>
  );
}
