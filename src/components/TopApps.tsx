import { Star } from "lucide-react";

interface App {
  name: string;
  icon: string;
  desc: string;
  url: string;
}

const TOP_APPS: { app: App; accesses: number }[] = [
  { app: { name: "Grafana", icon: "📊", desc: "Dashboards e métricas", url: "https://grafana.local" }, accesses: 142 },
  { app: { name: "Portainer", icon: "🐳", desc: "Gerenciamento de containers", url: "https://portainer.local" }, accesses: 98 },
  { app: { name: "Wazuh SIEM", icon: "🛡️", desc: "Monitoramento de segurança", url: "https://wazuh.local" }, accesses: 87 },
  { app: { name: "pfSense", icon: "🔥", desc: "Firewall e roteamento", url: "https://pfsense.local" }, accesses: 64 },
];

const TopApps = () => {
  const maxAccesses = TOP_APPS[0]?.accesses ?? 1;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        Mais Acessadas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOP_APPS.map(({ app, accesses }, i) => (
          <a
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-hover group"
          >
            <span className="text-2xl">{app.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground truncate">{app.name}</h3>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  #{i + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(accesses / maxAccesses) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{accesses}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Abrir →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TopApps;
