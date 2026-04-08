import DashboardLayout, {
  type DashboardLayoutMenuItem,
} from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BookHeart,
  CreditCard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/_core/hooks/useAuth";

type AdminSection = "dashboard" | "usuarios" | "compradores";

const MENU_ITEMS: DashboardLayoutMenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard de Resultados",
    icon: Sparkles,
    helperText: "Funil, perfis e diagnósticos",
  },
  {
    id: "usuarios",
    label: "Usuários",
    icon: Users,
    helperText: "Contas autenticadas e permissões",
  },
  {
    id: "compradores",
    label: "Compradores",
    icon: CreditCard,
    helperText: "Pagamentos e devocionais vendidos",
  },
];

const CHART_COLORS = ["#3E342C", "#6C5B4E", "#8B7355", "#B49A84", "#D4C9BD"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((value || 0) / 100);

const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const roleBadgeClass = (role: string) =>
  role === "admin"
    ? "bg-accent text-accent-foreground"
    : "bg-secondary text-secondary-foreground";

const paymentBadgeClass = (status: string) => {
  switch (status) {
    case "succeeded":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h2 className="text-3xl text-foreground">{title}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-[28px] border border-dashed border-border/80 bg-white/80 p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <BookHeart className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl text-foreground">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-full bg-secondary/20 p-3">
          <Icon className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const snapshotQuery = trpc.admin.snapshot.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchOnWindowFocus: false,
  });

  const summary = snapshotQuery.data?.summary;
  const users = snapshotQuery.data?.users ?? [];
  const buyers = snapshotQuery.data?.buyers ?? [];
  const diagnostics = snapshotQuery.data?.diagnostics ?? [];

  const approvedBuyers = useMemo(
    () => buyers.filter((buyer) => buyer.status === "succeeded"),
    [buyers],
  );

  const latestDiagnostics = useMemo(() => diagnostics.slice(0, 6), [diagnostics]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const nameStr = typeof user.name === 'string' ? user.name : String(user.name || '');
      const emailStr = typeof user.email === 'string' ? user.email : String(user.email || '');
      return (
        nameStr.toLowerCase().includes(query) ||
        emailStr.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  const renderContent = () => {
    if (snapshotQuery.isLoading) {
      return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="h-36 animate-pulse rounded-[28px] border border-border/60 bg-white/85 shadow-sm"
            />
          ))}
        </div>
      );
    }

    if (snapshotQuery.error) {
      return (
        <EmptyState
          title="Não foi possível carregar a área administrativa"
          description="A autenticação está protegida corretamente, mas houve uma falha ao consultar os dados reais do projeto. Atualize a página ou tente novamente em instantes."
        />
      );
    }

    if (activeSection === "usuarios") {
      return (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Pessoas que fizeram o quiz"
            title="Leads e participantes"
            description="Lista de todas as pessoas que responderam o quiz de diagnóstico espiritual, com informações de contato e data de resposta."
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-border/60 bg-white/90 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={Users}
              label="Total que fizeram o quiz"
              value={String(filteredUsers.length)}
              helper="Participantes do diagnóstico"
            />
            <MetricCard
              icon={ShieldCheck}
              label="Administradores"
              value={String(users.filter((item) => {
                const roleStr = typeof item.role === 'string' ? item.role : String(item.role || '');
                return roleStr === "admin";
              }).length)}
              helper="Acesso liberado ao painel"
            />
            <MetricCard
              icon={Activity}
              label="Novos participantes"
              value={String(summary?.kpis.novosUsuarios30Dias ?? 0)}
              helper="Últimos 30 dias"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState
              title="Nenhum participante encontrado"
              description="Assim que pessoas responderem o quiz, elas aparecerão aqui com suas informações de contato e data de resposta."
            />
          ) : (
            <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white/90 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-foreground">Nome</th>
                      <th className="px-5 py-4 font-semibold text-foreground">E-mail</th>
                      <th className="px-5 py-4 font-semibold text-foreground">WhatsApp</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Tipo</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Data da resposta</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item) => {
                      const nameStr = typeof item.name === 'string' ? item.name : String(item.name || '');
                      const emailStr = typeof item.email === 'string' ? item.email : String(item.email || '');
                      const whatsappStr = typeof item.whatsapp === 'string' ? item.whatsapp : String(item.whatsapp || '');
                      const roleStr = typeof item.role === 'string' ? item.role : String(item.role || '');
                      return (
                        <tr key={item.id} className="border-t border-border/50 align-top">
                          <td className="px-5 py-4 text-foreground">{nameStr || "Sem nome"}</td>
                          <td className="px-5 py-4 text-muted-foreground">{emailStr || "-"}</td>
                          <td className="px-5 py-4 text-muted-foreground">{whatsappStr || "-"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(roleStr)}`}>
                              {roleStr === "admin" ? "Administrador" : "Participante"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{formatDateTime(item.updatedAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              {whatsappStr && (
                                <a
                                  href={`https://wa.me/${whatsappStr.split('').filter((c) => /[0-9]/.test(c)).join('')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                  title="Abrir WhatsApp"
                                >
                                  💬
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  const resendMutation = trpc.admin.resendEmail.useMutation();
                                  resendMutation.mutate({ email: emailStr, type: 'result' });
                                }}
                                className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                title="Reenviar resultado"
                              >
                                📧
                              </button>
                              <button
                                onClick={() => {
                                  const linkMutation = trpc.admin.generateDownloadLink.useQuery({ leadId: item.id, type: 'result' });
                                  if (linkMutation.data?.downloadUrl) {
                                    window.open(linkMutation.data.downloadUrl, '_blank');
                                  }
                                }}
                                className="inline-flex items-center justify-center px-2 py-1 text-xs rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                title="Link para resultado + guia"
                              >
                                🔗
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      );
    }

    if (activeSection === "compradores") {
      return (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Compradores reais"
            title="Pagamentos e devocionais vendidos"
            description="Aqui ficam os pagamentos vinculados ao funil real do Diagnóstico Espiritual, usando a mesma base de leads e os registros do checkout."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={CreditCard}
              label="Compras aprovadas"
              value={String(approvedBuyers.length)}
              helper="Transações confirmadas"
            />
            <MetricCard
              icon={TrendingUp}
              label="Receita confirmada"
              value={formatCurrency(approvedBuyers.reduce((sum, b) => sum + (b.amount || 0), 0))}
              helper="Total de vendas"
            />
            <MetricCard
              icon={Activity}
              label="Taxa de conversão"
              value={`${users.length > 0 ? Math.round((approvedBuyers.length / users.length) * 100) : 0}%`}
              helper="Leads que viraram compra"
            />
          </div>

          {approvedBuyers.length === 0 ? (
            <EmptyState
              title="Nenhum comprador registrado"
              description="Assim que alguém completar a compra do devocional, os dados aparecerão aqui com status de pagamento e informações de transação."
            />
          ) : (
            <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white/90 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-foreground">E-mail</th>
                      <th className="px-5 py-4 font-semibold text-foreground">WhatsApp</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Valor</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Produto</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Status</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Data</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedBuyers.map((buyer) => (
                      <tr key={buyer.id} className="border-t border-border/50 align-top">
                        <td className="px-5 py-4 text-foreground">{buyer.email || "-"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{buyer.whatsapp || "-"}</td>
                        <td className="px-5 py-4 font-semibold text-foreground">{formatCurrency(buyer.amount || 0)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{buyer.productName || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(buyer.status)}`}>
                            {buyer.status === "succeeded" ? "Aprovado" : buyer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDateTime(buyer.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      );
    }

    // Dashboard section
    return (
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Dashboard de Resultados"
          title="Funil e diagnósticos reais do site"
          description="Esta visão reúne a operação verdadeira do projeto: leads capturados, compras aprovadas, perfis espirituais gerados e histórico recente de resultados salvos no banco."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={BookHeart}
            label="Diagnósticos gerados"
            value={String(diagnostics.length)}
              helper={`+${summary?.kpis.diagnosticos30Dias ?? 0} nos últimos 30 dias`}
          />
              <MetricCard
              icon={Users}
              label="Leads capturados"
              value={String(summary?.kpis.totalLeads ?? 0)}
              helper={`+${summary?.kpis.leads30Dias ?? 0} nos últimos 30 dias`}
            />
          <MetricCard
            icon={CreditCard}
            label="Compras aprovadas"
            value={String(approvedBuyers.length)}
            helper={formatCurrency(approvedBuyers.reduce((sum, b) => sum + (b.amount || 0), 0))}
          />
          <MetricCard
            icon={TrendingUp}
            label="Taxa de conversão"
            value={`${users.length > 0 ? Math.round((approvedBuyers.length / users.length) * 100) : 0}%`}
            helper="Leads que viraram compra"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Leads e compras por dia</h3>
            <p className="mb-4 text-sm text-muted-foreground">Evolução do funil com base nas entradas reais dos últimos 30 dias.</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke={CHART_COLORS[0]} />
                <Line type="monotone" dataKey="purchases" stroke={CHART_COLORS[2]} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Distribuição de perfis</h3>
            <p className="mb-4 text-sm text-muted-foreground">Perfis espirituais mais recorrentes entre os diagnósticos salvos.</p>
            {(!summary?.perfilDistribuicao || summary.perfilDistribuicao.length === 0) ? (
              <div className="flex h-[300px] items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">Sem perfis registrados ainda</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary?.perfilDistribuicao || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(summary?.perfilDistribuicao || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Receita diária confirmada</h3>
          <p className="mb-4 text-sm text-muted-foreground">Valores aprovados no checkout do devocional, ligados aos compradores reais.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="revenue" fill={CHART_COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Diagnósticos mais recentes</h3>
          <p className="mb-6 text-sm text-muted-foreground">Últimos resultados persistidos automaticamente a partir do fluxo real do quiz.</p>
          {latestDiagnostics.length === 0 ? (
            <EmptyState
              title="Nenhum diagnóstico salvo ainda"
              description="Os registros aparecem aqui quando o resultado é gerado e gravado no histórico do banco."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestDiagnostics.map((diag) => (
                <Card key={diag.id} className="rounded-[28px] border border-border/60 bg-white/90 p-5 shadow-sm">
                  <p className="font-semibold text-foreground">{diag.profileName}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{diag.profileDescription}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(diag.createdAt)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Painel Administrativo"
      subtitle="Diagnóstico Espiritual"
      menuItems={MENU_ITEMS}
      activeItem={activeSection}
      onItemSelect={(id) => setActiveSection(id as AdminSection)}
      adminOnly={true}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => snapshotQuery.refetch()}
            disabled={snapshotQuery.isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${snapshotQuery.isLoading ? "animate-spin" : ""}`} />
            Atualizar dados
          </Button>
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
