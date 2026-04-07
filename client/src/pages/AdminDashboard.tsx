import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CreditCard, TrendingUp, Mail, LogOut } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "leads" | "pagamentos" | "emails">("dashboard");
  
  const { data: allResponses, isLoading: loadingResponses } = trpc.quiz.getAllResponses.useQuery();
  const { data: statistics, isLoading: loadingStats } = trpc.quiz.getStatistics.useQuery();
  const { data: meQuery } = trpc.auth.me.useQuery();
  
  // Verificar se é admin
  useEffect(() => {
    if (meQuery && meQuery.role !== "admin") {
      setLocation("/");
    }
  }, [meQuery, setLocation]);
  
  if (meQuery && meQuery.role !== "admin") {
    return null;
  }

  // Dados de exemplo para gráficos
  const leadsData = [
    { date: "01/04", leads: 12 },
    { date: "02/04", leads: 19 },
    { date: "03/04", leads: 15 },
    { date: "04/04", leads: 25 },
    { date: "05/04", leads: 22 },
    { date: "06/04", leads: 28 },
    { date: "07/04", leads: 32 },
  ];

  const paymentData = [
    { date: "01/04", pagamentos: 2 },
    { date: "02/04", pagamentos: 3 },
    { date: "03/04", pagamentos: 2 },
    { date: "04/04", pagamentos: 5 },
    { date: "05/04", pagamentos: 4 },
    { date: "06/04", pagamentos: 6 },
    { date: "07/04", pagamentos: 8 },
  ];

  const profileDistribution = [
    { name: "Amadurecendo na Fé", value: 35 },
    { name: "Buscando Direção", value: 28 },
    { name: "Restaurando Relacionamento", value: 22 },
    { name: "Vivendo Plenamente", value: 15 },
  ];

  const COLORS = ["#4A3F35", "#3E342C", "#8B7355", "#A0826D"];
  
  const handleLogout = async () => {
    await trpc.auth.logout.useMutation().mutateAsync();
    setLocation("/");
  };

  return (
    <div className="spiritual-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">📊 Dashboard Admin</h1>
            <p className="text-muted-foreground mt-2">Gerenciamento completo da plataforma</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-muted">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "dashboard"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "leads"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab("pagamentos")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "pagamentos"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Pagamentos
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "emails"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Emails
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Leads</p>
                    <p className="text-3xl font-bold text-foreground">
                      {loadingResponses ? "-" : allResponses?.length || 0}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-accent" />
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamentos Recebidos</p>
                    <p className="text-3xl font-bold text-foreground">R$ 1.430</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-accent" />
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-foreground">18.4%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-accent" />
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Emails Enviados</p>
                    <p className="text-3xl font-bold text-foreground">28</p>
                  </div>
                  <Mail className="w-10 h-10 text-accent" />
                </div>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-lg font-semibold text-foreground mb-4">Leads por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#4A3F35" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-lg font-semibold text-foreground mb-4">Pagamentos por Dia</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pagamentos" fill="#4A3F35" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Perfis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={profileDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {profileDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="text-lg font-semibold text-foreground mb-4">Leads Capturados</h3>
            {loadingResponses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left py-2 px-4 text-foreground font-semibold">Email</th>
                      <th className="text-left py-2 px-4 text-foreground font-semibold">WhatsApp</th>
                      <th className="text-left py-2 px-4 text-foreground font-semibold">Data</th>
                      <th className="text-left py-2 px-4 text-foreground font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResponses?.map((response: any) => (
                      <tr key={response.id} className="border-b border-muted/50 hover:bg-accent/5">
                        <td className="py-3 px-4 text-foreground">{response.email}</td>
                        <td className="py-3 px-4 text-foreground">{response.whatsapp}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Pagamentos Tab */}
        {activeTab === "pagamentos" && (
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pagamentos Recebidos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Email</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Valor</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Data</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50 hover:bg-accent/5">
                    <td className="py-3 px-4 text-foreground">usuario@example.com</td>
                    <td className="py-3 px-4 text-foreground font-semibold">R$ 9,90</td>
                    <td className="py-3 px-4 text-muted-foreground">07/04/2026</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Pago
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="text-lg font-semibold text-foreground mb-4">Histórico de Emails</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Destinatário</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Assunto</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Data</th>
                    <th className="text-left py-2 px-4 text-foreground font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50 hover:bg-accent/5">
                    <td className="py-3 px-4 text-foreground">usuario@example.com</td>
                    <td className="py-3 px-4 text-foreground">Seu Devocional Chegou!</td>
                    <td className="py-3 px-4 text-muted-foreground">07/04/2026 14:30</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Enviado
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
