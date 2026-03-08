import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { LogOut, Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";

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

/* Simulated server metrics — replace with real API calls */
const useServerMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 34,
    ram: 62,
    disk: 47,
    network: 12.4,
    uptime: "42d 7h 23m",
    containers: 18,
    containersRunning: 16,
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
        <span className="font-mono font-semibold text-foreground">{typeof value === "number" ? value.toFixed(1) : value}{unit}</span>
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
  const metrics = useServerMetrics();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatLastLogin = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm">🟢 Servidor Online</span>
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
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo, {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Último acesso: {formatLastLogin(lastLogin)}
          </p>
          <p className="sm:hidden mt-1 text-sm text-muted-foreground">{formatTime(clock)}</p>
        </div>

        {/* Server Metrics */}
        <h2 className="mb-4 text-lg font-semibold text-foreground">Métricas do Servidor</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
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

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
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

        {/* Apps */}
        <h2 className="mb-4 text-lg font-semibold text-foreground">Suas Aplicações</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {APPS.map((app, i) => (
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
      </main>
    </div>
  );
};

export default Dashboard;
