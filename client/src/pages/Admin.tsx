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
  const [activeTab, setActiveTab] = useState<'respostas' | 'estatisticas' | 'perguntas' | 'compradores'>('respostas');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newStep, setNewStep] = useState(1);

  const { data: allResponses, isLoading: loadingResponses } = trpc.quiz.getAllResponses.useQuery();
  const { data: statistics, isLoading: loadingStats } = trpc.quiz.getStatistics.useQuery();
  const { data: questions, isLoading: loadingQuestions, refetch: refetchQuestions } = trpc.admin.getQuestions.useQuery();
  const { data: allLeads, isLoading: loadingLeads } = trpc.admin.getAllLeads.useQuery();
  const sendDevotionalMutation = trpc.quiz.sendDevotionalEmail.useMutation();
  const updateQuestionMutation = trpc.admin.updateQuestion.useMutation({ onSuccess: () => refetchQuestions() });
  const createQuestionMutation = trpc.admin.createQuestion.useMutation({ onSuccess: () => { refetchQuestions(); setNewQuestion(''); setNewOptions(['', '', '', '']); setNewStep(1); } });
  const deleteQuestionMutation = trpc.admin.deleteQuestion.useMutation({ onSuccess: () => refetchQuestions() });

  const handleSendDevotional = async (leadId: number) => {
    try {
      await sendDevotionalMutation.mutateAsync({ leadId: leadId.toString() });
      alert('Email enviado com sucesso!');
    } catch (error) {
      alert('Erro ao enviar email');
    }
  };

  const filteredResponses = allResponses?.filter((r: QuizResponse) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      r.email.toLowerCase().includes(query) ||
      r.whatsapp.toLowerCase().includes(query)
    );
    
    if (!matchesSearch) return false;
    
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const responseDate = new Date(r.createdAt);
      if (start && responseDate < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (responseDate > endOfDay) return false;
      }
    }
    
    return true;
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerenciar respostas do quiz, estatísticas e perguntas</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('respostas')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'respostas'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Respostas
        </button>
        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'estatisticas'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Estatísticas
        </button>
        <button
          onClick={() => setActiveTab('compradores')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'compradores'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Compradores
        </button>
        <button
          onClick={() => setActiveTab('perguntas')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'perguntas'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Perguntas
        </button>
      </div>

        {activeTab === 'respostas' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-end">
              <Input
                type="text"
                placeholder="Buscar por email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Data de Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border/60 bg-white/90 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Data de Término</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border/60 bg-white/90 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-4 py-2 rounded-lg border border-border/60 bg-white/90 text-foreground hover:bg-muted transition-colors"
                >
                  Limpar datas
                </button>
              )}
            </div>

            {loadingResponses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Email</th>
                      <th className="px-4 py-2 font-semibold">WhatsApp</th>
                      <th className="px-4 py-2 font-semibold">Data</th>
                      <th className="px-4 py-2 font-semibold">Respostas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response: QuizResponse) => (
                      <tr key={response.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-2">{response.email}</td>
                        <td className="px-4 py-2">{response.whatsapp}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {[response.step1, response.step2, response.step3, response.step4, response.step5, response.step6, response.step7, response.step8, response.step9, response.step10].filter(Boolean).length}/10
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'estatisticas' && (
          <div className="space-y-4">
            {loadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total de Respostas</div>
                  <div className="text-3xl font-bold text-foreground">{statistics?.totalResponses || 0}</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Respostas Completas</div>
                  <div className="text-3xl font-bold text-foreground">{statistics?.completeResponses || 0}</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Taxa de Conclusão</div>
                  <div className="text-3xl font-bold text-foreground">
                    {statistics?.totalResponses ? Math.round((statistics.completeResponses / statistics.totalResponses) * 100) : 0}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'perguntas' && (
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-secondary/30">
              <h3 className="font-semibold mb-4">Adicionar Nova Pergunta</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Etapa</label>
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
                  <label className="text-sm font-medium text-foreground">Pergunta</label>
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Digite a pergunta..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Opções</label>
                  <div className="space-y-2 mt-1">
                    {newOptions.map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOpts = [...newOptions];
                          newOpts[index] = e.target.value;
                          setNewOptions(newOpts);
                        }}
                        placeholder={`Opção ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateQuestion}
                  disabled={createQuestionMutation.isPending}
                  className="w-full"
                >
                  {createQuestionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Pergunta
                    </>
                  )}
                </Button>
              </div>
            </div>

            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions?.map((question: QuizQuestion) => (
                  <div key={question.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Etapa {question.step}</div>
                        <div className="font-semibold text-foreground">{question.question}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuestionMutation.mutateAsync({ id: question.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {question.options.map((option, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compradores' && (
          <div className="space-y-4">
            {loadingLeads ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Email</th>
                      <th className="px-4 py-2 font-semibold">WhatsApp</th>
                      <th className="px-4 py-2 font-semibold">Data</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold">Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeads?.filter((lead: any) => lead.hasPayment).map((lead: any) => (
                      <tr key={lead.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-2">{lead.email}</td>
                        <td className="px-4 py-2">{lead.whatsapp}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Comprador</span>
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendDevotional(lead.id)}
                            disabled={sendDevotionalMutation.isPending}
                          >
                            {sendDevotionalMutation.isPending ? 'Enviando...' : 'Enviar Email'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
