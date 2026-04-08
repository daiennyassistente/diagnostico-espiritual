import { useAuth } from "@/_core/hooks/useAuth";
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
    return users.filter((user) =>
      (user.name?.toLowerCase().includes(query) || false) ||
      (user.email?.toLowerCase().includes(query) || false)
    );
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
            eyebrow="Usuários autenticados"
            title="Contas e permissões"
            description="Esta seção usa a base real de autenticação do projeto para listar usuários, papel de acesso e atividade recente."
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
              label="Total de usuários"
              value={String(summary?.kpis.totalUsuarios ?? users.length)}
              helper="Base completa autenticada"
            />
            <MetricCard
              icon={ShieldCheck}
              label="Administradores"
              value={String(users.filter((item) => item.role === "admin").length)}
              helper="Acesso liberado ao painel"
            />
            <MetricCard
              icon={Activity}
              label="Novos usuários em 30 dias"
              value={String(summary?.kpis.novosUsuarios30Dias ?? 0)}
              helper="Evolução recente de acesso"
            />
          </div>

          {users.length === 0 ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              description="Assim que novas contas autenticarem no app, elas aparecerão aqui com papel e último acesso registrados na mesma base do site."
            />
          ) : (
            <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white/90 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-foreground">Nome</th>
                      <th className="px-5 py-4 font-semibold text-foreground">E-mail</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Papel</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Método</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Último acesso</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item) => (
                      <tr key={item.id} className="border-t border-border/50 align-top">
                        <td className="px-5 py-4 text-foreground">{item.name || "Sem nome"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{item.email || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(item.role)}`}>
                            {item.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{item.loginMethod || "-"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDateTime(item.lastSignedIn)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDateTime(item.createdAt)}</td>
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
              value={String(summary?.kpis.comprasAprovadas ?? approvedBuyers.length)}
              helper="Pagamentos com status confirmado"
            />
            <MetricCard
              icon={TrendingUp}
              label="Receita confirmada"
              value={formatCurrency(summary?.kpis.receitaTotal ?? 0)}
              helper="Soma dos pagamentos aprovados"
            />
            <MetricCard
              icon={Sparkles}
              label="Taxa de conversão"
              value={`${summary?.kpis.taxaConversao ?? 0}%`}
              helper="Conversão entre leads e compra"
            />
          </div>

          {buyers.length === 0 ? (
            <EmptyState
              title="Nenhum comprador registrado"
              description="Quando houver compras aprovadas ou pendentes no checkout do devocional, elas aparecerão aqui com produto, valor, status e identificadores do Stripe."
            />
          ) : (
            <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white/90 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/70 text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-foreground">Comprador</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Contato</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Produto</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Valor</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Status</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Stripe</th>
                      <th className="px-5 py-4 font-semibold text-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((buyer) => (
                      <tr key={buyer.id} className="border-t border-border/50 align-top">
                        <td className="px-5 py-4 text-foreground">{buyer.email}</td>
                        <td className="px-5 py-4 text-muted-foreground">{buyer.whatsapp || "-"}</td>
                        <td className="px-5 py-4 text-foreground">{buyer.productName}</td>
                        <td className="px-5 py-4 text-foreground">{formatCurrency(buyer.amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentBadgeClass(buyer.status)}`}>
                            {buyer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{buyer.stripePaymentIntentId}</td>
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

    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Dashboard de resultados"
          title="Funil e diagnósticos reais do site"
          description="Esta visão reúne a operação verdadeira do projeto: leads capturados, compras aprovadas, perfis espirituais gerados e histórico recente de resultados salvos no banco."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Sparkles}
            label="Diagnósticos gerados"
            value={String(summary?.kpis.totalDiagnosticos ?? diagnostics.length)}
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
            value={String(summary?.kpis.comprasAprovadas ?? approvedBuyers.length)}
            helper={formatCurrency(summary?.kpis.receitaTotal ?? 0)}
          />
          <MetricCard
            icon={TrendingUp}
            label="Taxa de conversão"
            value={`${summary?.kpis.taxaConversao ?? 0}%`}
            helper="Leads que viraram compra"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <div className="mb-5 space-y-1">
              <h3 className="text-xl text-foreground">Leads e compras por dia</h3>
              <p className="text-sm text-muted-foreground">
                Evolução do funil com base nas entradas reais dos últimos 30 dias.
              </p>
            </div>
            {summary?.timeline?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={summary.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4C9BD" />
                  <XAxis dataKey="date" stroke="#7A6F65" />
                  <YAxis stroke="#7A6F65" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3E342C" strokeWidth={3} name="Leads" />
                  <Line type="monotone" dataKey="pagamentos" stroke="#8B7355" strokeWidth={3} name="Compras" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sem movimentação suficiente"
                description="Os gráficos começam a preencher automaticamente quando novos leads e compras entram no funil real."
              />
            )}
          </Card>

          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <div className="mb-5 space-y-1">
              <h3 className="text-xl text-foreground">Distribuição de perfis</h3>
              <p className="text-sm text-muted-foreground">
                Perfis espirituais mais recorrentes entre os diagnósticos salvos.
              </p>
            </div>
            {summary?.perfilDistribuicao?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={summary.perfilDistribuicao}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {summary.perfilDistribuicao.map((item, index) => (
                      <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sem perfis registrados ainda"
                description="Assim que novos diagnósticos forem persistidos no histórico, esta distribuição passa a refletir o comportamento real do quiz."
              />
            )}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <div className="mb-5 space-y-1">
              <h3 className="text-xl text-foreground">Receita diária confirmada</h3>
              <p className="text-sm text-muted-foreground">
                Valores aprovados no checkout do devocional, ligados aos compradores reais.
              </p>
            </div>
            {summary?.timeline?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={summary.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4C9BD" />
                  <XAxis dataKey="date" stroke="#7A6F65" />
                  <YAxis stroke="#7A6F65" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receita" fill="#3E342C" radius={[8, 8, 0, 0]} name="Receita" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Ainda sem receita confirmada"
                description="Quando houver pagamentos aprovados, o gráfico passa a exibir o faturamento diário do devocional."
              />
            )}
          </Card>

          <Card className="rounded-[28px] border border-border/60 bg-white/90 p-6 shadow-lg">
            <div className="mb-5 space-y-1">
              <h3 className="text-xl text-foreground">Diagnósticos mais recentes</h3>
              <p className="text-sm text-muted-foreground">
                Últimos resultados persistidos automaticamente a partir do fluxo real do quiz.
              </p>
            </div>
            {latestDiagnostics.length === 0 ? (
              <EmptyState
                title="Nenhum diagnóstico salvo ainda"
                description="Os registros aparecem aqui quando o resultado é gerado e gravado no histórico do banco."
              />
            ) : (
              <div className="space-y-4">
                {latestDiagnostics.map((diagnostic) => (
                  <div
                    key={diagnostic.id}
                    className="rounded-3xl border border-border/60 bg-secondary/35 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {diagnostic.email}
                        </p>
                        <h4 className="text-lg text-foreground">{diagnostic.profileName}</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {diagnostic.profileDescription}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2 text-right text-xs text-muted-foreground">
                        <p>{diagnostic.whatsapp || "Sem WhatsApp"}</p>
                        <p className="mt-1">{formatDateTime(diagnostic.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
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
      adminOnly
    >
      <div className="space-y-6">
        <Card className="rounded-[32px] border border-border/60 bg-white/85 p-6 shadow-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Área protegida para admins/autorizados
              </p>
              <div className="space-y-2">
                <h1 className="text-4xl text-foreground md:text-5xl">
                  Administração conectada à operação real
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  A navegação abaixo usa a mesma paleta do site principal e consulta a base real do projeto para separar usuários autenticados, compradores do devocional e o dashboard de resultados do quiz.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <div className="rounded-full border border-border/70 bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                {user?.email || "Conta autenticada"}
              </div>
              <Button
                variant="outline"
                onClick={() => snapshotQuery.refetch()}
                disabled={snapshotQuery.isFetching}
              >
                {snapshotQuery.isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Atualizar dados
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-white/90 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
