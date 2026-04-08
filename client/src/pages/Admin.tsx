'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Edit, Trash2, Plus } from 'lucide-react';

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

interface QuizQuestion {
  id: number;
  step: number;
  question: string;
  options: string[];
  createdAt: Date;
  updatedAt: Date;
}

const STEP_LABELS = [
  'Como você se sente espiritualmente hoje?',
  'O que mais tem dificultado sua constância com Deus?',
  'Como está sua rotina com a Palavra?',
  'Como você descreveria sua vida de oração hoje?',
  'O que você mais sente falta hoje na sua vida com Deus?',
  'O que você sente que mais tem sido tratado em você nessa fase?',
  'O que você mais deseja viver com Deus agora?',
  'Quanto tempo por dia você consegue dedicar com intencionalidade?',
  'Qual é sua maior dificuldade?',
  'Como você se descreve espiritualmente neste momento?',
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'respostas' | 'estatisticas' | 'perguntas'>('respostas');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newStep, setNewStep] = useState(1);

  const { data: allResponses, isLoading: loadingResponses } = trpc.quiz.getAllResponses.useQuery();
  const { data: statistics, isLoading: loadingStats } = trpc.quiz.getStatistics.useQuery();
  const { data: questions, isLoading: loadingQuestions, refetch: refetchQuestions } = trpc.admin.getQuestions.useQuery();
  const updateQuestionMutation = trpc.admin.updateQuestion.useMutation({ onSuccess: () => refetchQuestions() });
  const createQuestionMutation = trpc.admin.createQuestion.useMutation({ onSuccess: () => { refetchQuestions(); setNewQuestion(''); setNewOptions(['', '', '', '']); setNewStep(1); } });
  const deleteQuestionMutation = trpc.admin.deleteQuestion.useMutation({ onSuccess: () => refetchQuestions() });

  const filteredResponses = allResponses?.filter((r: QuizResponse) => {
    const query = searchQuery.toLowerCase();
    return (
      r.email.toLowerCase().includes(query) ||
      r.whatsapp.toLowerCase().includes(query)
    );
  }) || [];

  const handleEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setNewQuestion(q.question);
    setNewOptions(q.options);
    setNewStep(q.step);
  };

  const handleSaveQuestion = async () => {
    if (editingQuestion) {
      await updateQuestionMutation.mutateAsync({
        id: editingQuestion.id,
        question: newQuestion,
        options: newOptions.filter(o => o.trim())
      });
      setEditingQuestion(null);
    }
  };

  const handleCreateQuestion = async () => {
    await createQuestionMutation.mutateAsync({
      step: newStep,
      question: newQuestion,
      options: newOptions.filter(o => o.trim())
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Painel de Admin</h1>
          <p className="text-foreground/60">Visualize todas as respostas do quiz e estatísticas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('respostas')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'respostas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Todas as Respostas
          </button>
          <button
            onClick={() => setActiveTab('estatisticas')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'estatisticas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('perguntas')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'perguntas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Gerenciar Perguntas
          </button>
        </div>

        {/* Respostas Tab */}
        {activeTab === 'respostas' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por e-mail ou WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loadingResponses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Nenhuma resposta encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">WhatsApp</th>
                      <th className="text-left py-3 px-4 font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response: QuizResponse) => (
                      <tr key={response.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{response.email}</td>
                        <td className="py-3 px-4">{response.whatsapp}</td>
                        <td className="py-3 px-4">{new Date(response.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(statistics).map(([step, data]: [string, any]) => (
                  <div key={step} className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">{STEP_LABELS[parseInt(step) - 1]}</h3>
                    <div className="space-y-2">
                      {Object.entries(data).map(([option, count]: [string, any]) => (
                        <div key={option} className="flex justify-between">
                          <span className="text-foreground/70">{option}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/60">Nenhuma estatística disponível</p>
              </div>
            )}
          </div>
        )}

        {/* Gerenciar Perguntas Tab */}
        {activeTab === 'perguntas' && (
          <div className="space-y-6">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Nova Pergunta */}
                <div className="border border-border rounded-lg p-6 bg-muted/50">
                  <h3 className="font-semibold mb-4">Adicionar Nova Pergunta</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Etapa</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newStep}
                        onChange={(e) => setNewStep(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pergunta</label>
                      <Input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Digite a pergunta"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Opções</label>
                      {newOptions.map((option, idx) => (
                        <Input
                          key={idx}
                          value={option}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Opção ${idx + 1}`}
                          className="mt-1 mb-2"
                        />
                      ))}
                    </div>
                    <Button
                      onClick={handleCreateQuestion}
                      disabled={createQuestionMutation.isPending || !newQuestion}
                      className="w-full"
                    >
                      {createQuestionMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                      Adicionar Pergunta
                    </Button>
                  </div>
                </div>

                {/* Lista de Perguntas */}
                <div className="space-y-4">
                  {questions?.map((q: QuizQuestion) => (
                    <div key={q.id} className="border border-border rounded-lg p-6">
                      {editingQuestion?.id === q.id ? (
                        <div className="space-y-4">
                          <Input
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Pergunta"
                          />
                          {newOptions.map((option, idx) => (
                            <Input
                              key={idx}
                              value={option}
                              onChange={(e) => {
                                const updated = [...newOptions];
                                updated[idx] = e.target.value;
                                setNewOptions(updated);
                              }}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          ))}
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveQuestion}
                              disabled={updateQuestionMutation.isPending}
                              variant="default"
                              className="flex-1"
                            >
                              {updateQuestionMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                              Salvar
                            </Button>
                            <Button
                              onClick={() => setEditingQuestion(null)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">Etapa {q.step}</h4>
                              <p className="text-foreground/70 mt-1">{q.question}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditQuestion(q)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteQuestionMutation.mutate({ id: q.id })}
                                disabled={deleteQuestionMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {q.options.map((option, idx) => (
                              <div key={idx} className="text-sm text-foreground/60">
                                • {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
