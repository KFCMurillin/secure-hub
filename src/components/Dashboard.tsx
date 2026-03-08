import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const APPS = [
  { name: "Wazuh SIEM", icon: "🛡️", desc: "Monitoramento de segurança", url: "https://wazuh.local" },
  { name: "Portainer", icon: "🐳", desc: "Gerenciamento de containers Docker", url: "https://portainer.local" },
  { name: "Grafana", icon: "📊", desc: "Dashboards e métricas", url: "https://grafana.local" },
  { name: "pfSense", icon: "🔥", desc: "Firewall e roteamento", url: "https://pfsense.local" },
];

const Dashboard = () => {
  const { user, lastLogin, logout } = useAuth();
  const [clock, setClock] = useState(new Date());

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

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo, {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Último acesso: {formatLastLogin(lastLogin)}
          </p>
          <p className="sm:hidden mt-1 text-sm text-muted-foreground">
            {formatTime(clock)}
          </p>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-foreground">Suas Aplicações</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app, i) => (
            <div
              key={app.name}
              className={`rounded-xl border border-border bg-card p-5 card-hover animate-fade-in animate-fade-in-delay-${i + 1}`}
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
