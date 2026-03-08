import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { LogOut, Cpu, HardDrive, MemoryStick, Wifi, Search, AlertTriangle, ShieldAlert, Info, XCircle, LayoutDashboard, AppWindow, Clock } from "lucide-react";
import MetricCharts from "@/components/MetricCharts";
import ActivityLog from "@/components/ActivityLog";
import TopApps from "@/components/TopApps";

/* ============================================================
   CONFIGURAÇÃO: Adicione ou remova aplicações aqui
   ============================================================ */
const APPS = [
  { name: "Wazuh SIEM", icon: "🛡️", desc: "Monitoramento de segurança", url: "https://wazuh.local" },
  { name: "Portainer", icon: "🐳", desc: "Gerenciamento de containers Docker", url: "https://portainer.local" },
  { name: "Grafana", icon: "📊", desc: "Dashboards e métricas", url: "https://grafana.local" },
  { name: "pfSense", icon: "🔥", desc: "Firewall e roteamento", url: "https://pfsense.local" },
  { name: "Proxmox VE", icon: "🖥️", desc: "Virtualização e hypervisor", url: "https://proxmox.local" },
  { name: "Zabbix", icon: "📡", desc: "Monitoramento de infraestrutura", url: "https://zabbix.local" },
  { name: "Netdata", icon: "⚡", desc: "Métricas em tempo real", url: "https://netdata.local" },
  { name: "Nginx Proxy", icon: "🌐", desc: "Proxy reverso e SSL", url: "https://nginx.local" },
  { name: "Pi-hole", icon: "🕳️", desc: "Bloqueio de DNS e ads", url: "https://pihole.local" },
  { name: "Uptime Kuma", icon: "📈", desc: "Monitoramento de uptime", url: "https://uptime.local" },
  { name: "Guacamole", icon: "🥑", desc: "Acesso remoto via browser", url: "https://guacamole.local" },
  { name: "Vault", icon: "🔐", desc: "Gerenciamento de secrets", url: "https://vault.local" },
];

type AlertSeverity = "critical" | "high" | "medium" | "info";

interface SecurityAlert {
  id: number;
  severity: AlertSeverity;
  title: string;
  source: string;
  time: string;
  dismissed: boolean;
}

const INITIAL_ALERTS: SecurityAlert[] = [
  { id: 1, severity: "critical", title: "Tentativa de brute-force detectada em SSH (192.168.1.45)", source: "Wazuh", time: "há 3 min", dismissed: false },
  { id: 2, severity: "high", title: "Certificado SSL expira em 2 dias (grafana.local)", source: "Uptime Kuma", time: "há 15 min", dismissed: false },
  { id: 3, severity: "medium", title: "Container 'redis-cache' reiniciou 3x na última hora", source: "Portainer", time: "há 42 min", dismissed: false },
  { id: 4, severity: "info", title: "Atualização disponível: pfSense 2.7.2 → 2.8.0", source: "pfSense", time: "há 2h", dismissed: false },
  { id: 5, severity: "high", title: "Regra de firewall bloqueou 1.2k conexões suspeitas", source: "pfSense", time: "há 1h", dismissed: false },
  { id: 6, severity: "medium", title: "Uso de disco /var/log acima de 80%", source: "Zabbix", time: "há 30 min", dismissed: false },
];

const severityConfig: Record<AlertSeverity, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: ShieldAlert },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: AlertTriangle },
  info: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Info },
};

type Tab = "overview" | "alerts" | "apps" | "logs";

/* Simulated server metrics */
const useServerMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 34, ram: 62, disk: 47, network: 12.4,
    uptime: "42d 7h 23m", containers: 18, containersRunning: 16,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() - 0.5) * 8)),
        ram: Math.min(100, Math.max(20, prev.ram + (Math.random() - 0.5) * 4)),
        disk: Math.min(100, Math.max(30, prev.disk + (Math.random() - 0.5) * 1)),
        network: Math.max(0.1, +(prev.network + (Math.random() - 0.5) * 3).toFixed(1)),
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return metrics;
};

const MetricBar = ({ label, value, icon: Icon, unit = "%" }: { label: string; value: number; icon: React.ElementType; unit?: string }) => {
  const color = value > 85 ? "bg-destructive" : value > 60 ? "bg-yellow-500" : "bg-primary";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="font-mono font-semibold text-foreground">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, lastLogin, logout } = useAuth();
  const [clock, setClock] = useState(new Date());
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [alertFilter, setAlertFilter] = useState<AlertSeverity | "all">("all");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const metrics = useServerMetrics();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filteredApps = useMemo(() => {
    if (!search.trim()) return APPS;
    const q = search.toLowerCase();
    return APPS.filter((a) => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  }, [search]);

  const activeAlerts = useMemo(() => {
    const visible = alerts.filter((a) => !a.dismissed);
    if (alertFilter === "all") return visible;
    return visible.filter((a) => a.severity === alertFilter);
  }, [alerts, alertFilter]);

  const alertCounts = useMemo(() => {
    const active = alerts.filter((a) => !a.dismissed);
    return {
      critical: active.filter((a) => a.severity === "critical").length,
      high: active.filter((a) => a.severity === "high").length,
      medium: active.filter((a) => a.severity === "medium").length,
      info: active.filter((a) => a.severity === "info").length,
      total: active.length,
    };
  }, [alerts]);

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatLastLogin = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "alerts", label: "Alertas", icon: ShieldAlert, badge: alertCounts.total },
    { id: "apps", label: "Aplicações", icon: AppWindow },
    { id: "logs", label: "Atividades", icon: Clock },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm">🟢 Servidor Online</span>
            {alertCounts.critical > 0 && (
              <button
                onClick={() => setActiveTab("alerts")}
                className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition-colors"
              >
                <XCircle className="h-3 w-3" /> {alertCounts.critical} crítico{alertCounts.critical > 1 ? "s" : ""}
              </button>
            )}
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {formatDate(clock)} • {formatTime(clock)}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ===================== TAB: Visão Geral ===================== */}
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                Bem-vindo, {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}! 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Último acesso: {formatLastLogin(lastLogin)}
              </p>
              <p className="sm:hidden mt-1 text-sm text-muted-foreground">{formatTime(clock)}</p>
            </div>
            {/* Quick alert summary */}
            {alertCounts.critical + alertCounts.high > 0 && (
              <button
                onClick={() => setActiveTab("alerts")}
                className="w-full mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-left transition-colors hover:bg-red-500/15"
              >
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {alertCounts.critical + alertCounts.high} alerta{alertCounts.critical + alertCounts.high > 1 ? "s" : ""} importante{alertCounts.critical + alertCounts.high > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alertCounts.critical > 0 && `${alertCounts.critical} crítico`}
                    {alertCounts.critical > 0 && alertCounts.high > 0 && " • "}
                    {alertCounts.high > 0 && `${alertCounts.high} alto`}
                    {" — Clique para ver detalhes"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Ver →</span>
              </button>
            )}

            {/* Metric bars */}
            <h2 className="mb-4 text-lg font-semibold text-foreground">Métricas do Servidor</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="rounded-xl border border-border bg-card p-4">
                <MetricBar label="CPU" value={metrics.cpu} icon={Cpu} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <MetricBar label="RAM" value={metrics.ram} icon={MemoryStick} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <MetricBar label="Disco" value={metrics.disk} icon={HardDrive} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <MetricBar label="Rede" value={metrics.network} icon={Wifi} unit=" MB/s" />
              </div>
            </div>

            {/* Charts */}
            <div className="mb-8">
              <MetricCharts />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{metrics.containersRunning}/{metrics.containers}</p>
                <p className="text-xs text-muted-foreground mt-1">Containers Ativos</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{metrics.uptime}</p>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </div>
              <div className="hidden sm:block rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{APPS.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Aplicações</p>
              </div>
            </div>

            {/* Top Apps */}
            <div className="mb-0">
              <TopApps />
            </div>
          </div>
        )}

        {/* ===================== TAB: Alertas ===================== */}
        {activeTab === "alerts" && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Alertas de Segurança
                {alertCounts.total > 0 && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">{alertCounts.total}</span>
                )}
              </h2>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "critical", "high", "medium", "info"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAlertFilter(sev)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      alertFilter === sev
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sev === "all" ? "Todos" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                    {sev !== "all" && ` (${alertCounts[sev]})`}
                  </button>
                ))}
              </div>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                ✅ Nenhum alerta ativo
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map((alert) => {
                  const cfg = severityConfig[alert.severity];
                  const AlertIcon = cfg.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all`}
                    >
                      <AlertIcon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.source} • {alert.time}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Dispensar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: Aplicações ===================== */}
        {activeTab === "apps" && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Suas Aplicações</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar aplicações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Nenhuma aplicação encontrada para &quot;{search}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredApps.map((app, i) => (
                  <div
                    key={app.name}
                    className={`rounded-xl border border-border bg-card p-5 card-hover animate-fade-in animate-fade-in-delay-${(i % 4) + 1}`}
                  >
                    <div className="text-3xl mb-3">{app.icon}</div>
                    <h3 className="font-bold text-foreground">{app.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">{app.desc}</p>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Acessar →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: Atividades ===================== */}
        {activeTab === "logs" && (
          <div className="animate-fade-in">
            <ActivityLog />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
