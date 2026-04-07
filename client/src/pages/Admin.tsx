import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

interface QuizResponse {
  id: number;
  leadId: number;
  whatsapp: string;
  email: string;
  step1: string | null;
  step2: string | null;
  step3: string | null;
  step4: string | null;
  step5: string | null;
  step6: string | null;
  step7: string | null;
  step8: string | null;
  step9: string | null;
  step10: string | null;
  createdAt: Date;
}

const STEP_LABELS = [
  'Como você se sente espiritualmente hoje?',
  'O que mais tem dificultado sua constância com Deus?',
  'Como está sua rotina com a Palavra?',
  'Como você descreveria sua vida de oração hoje?',
  'O que você mais sente falta hoje na sua vida com Deus?',
  'O que você sente que mais tem sido tratado em você nessa fase?',
  'O que você mais deseja viver com Deus agora?',
  'Quanto tempo por dia você consegue separar com intencionalidade?',
  'Você sente que sua dificuldade maior é mais…',
  'Hoje, no fundo, você sente que está…',
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'respostas' | 'estatisticas'>('respostas');
  const [searchEmail, setSearchEmail] = useState('');

  const { data: allResponses, isLoading: loadingResponses } = trpc.quiz.getAllResponses.useQuery();
  const { data: statistics, isLoading: loadingStats } = trpc.quiz.getStatistics.useQuery();

  const filteredResponses = allResponses?.filter((r: QuizResponse) =>
    r.email.toLowerCase().includes(searchEmail.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Painel de Admin</h1>
          <p className="text-foreground/60">Visualize todas as respostas do quiz e estatísticas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('respostas')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'respostas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Todas as Respostas
          </button>
          <button
            onClick={() => setActiveTab('estatisticas')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'estatisticas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Estatísticas
          </button>
        </div>

        {/* Respostas Tab */}
        {activeTab === 'respostas' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por e-mail..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loadingResponses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                Nenhuma resposta encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResponses.map((response: QuizResponse) => (
                  <div key={response.id} className="bg-white rounded-lg p-6 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-foreground/60">E-mail</p>
                        <p className="font-medium text-foreground">{response.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/60">WhatsApp</p>
                        <p className="font-medium text-foreground">{response.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/60">Data</p>
                        <p className="font-medium text-foreground">
                          {String(new Date(response.createdAt as any).toLocaleDateString('pt-BR'))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-border pt-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                        const stepKey = `step${step}` as keyof QuizResponse;
                        const answer = response[stepKey];
                        return (
                          <div key={step} className="text-sm">
                            <p className="font-medium text-foreground mb-1">
                              Etapa {step}: {STEP_LABELS[step - 1]}
                            </p>
                            <p className="text-foreground/80 ml-4">
                              {String(answer || '(sem resposta)')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estatísticas Tab */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : statistics ? (
              <>
                <div className="bg-white rounded-lg p-6 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Total de Respostas: {statistics.totalRespostas}
                  </h2>
                </div>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                  const stepKey = `step${step}` as keyof typeof statistics;
                  const stepStats = statistics[stepKey] as Record<string, number>;

                  return (
                    <div key={step} className="bg-white rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">
                        Etapa {step}: {STEP_LABELS[step - 1]}
                      </h3>

                      <div className="space-y-3">
                        {Object.entries(stepStats)
                          .sort(([, a], [, b]) => b - a)
                          .map(([answer, count]) => {
                            const percentage = statistics.totalRespostas
                              ? Math.round((count / statistics.totalRespostas) * 100)
                              : 0;

                            return (
                              <div key={answer} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-foreground">{answer}</span>
                                  <span className="text-foreground/60">
                                    {count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
