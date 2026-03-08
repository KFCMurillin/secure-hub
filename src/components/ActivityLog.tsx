import { LogOut as LogOutIcon, User, Shield, Server, Terminal, Clock } from "lucide-react";

interface ActivityEntry {
  id: number;
  type: "login" | "logout" | "alert" | "system" | "access";
  message: string;
  time: string;
  icon: React.ElementType;
}

const ACTIVITY_LOG: ActivityEntry[] = [
  { id: 1, type: "login", message: "Login realizado com sucesso", time: "agora", icon: User },
  { id: 2, type: "access", message: "Acesso ao Grafana", time: "há 12 min", icon: Terminal },
  { id: 3, type: "alert", message: "Alerta crítico: brute-force SSH detectado", time: "há 18 min", icon: Shield },
  { id: 4, type: "system", message: "Backup automático concluído", time: "há 1h", icon: Server },
  { id: 5, type: "access", message: "Acesso ao Portainer", time: "há 2h", icon: Terminal },
  { id: 6, type: "system", message: "Atualização de regras do firewall", time: "há 3h", icon: Shield },
  { id: 7, type: "login", message: "Login realizado (IP: 192.168.1.10)", time: "há 5h", icon: User },
  { id: 8, type: "system", message: "Container 'nginx-proxy' reiniciado", time: "há 6h", icon: Server },
  { id: 9, type: "access", message: "Acesso ao Wazuh SIEM", time: "há 8h", icon: Terminal },
  { id: 10, type: "logout", message: "Sessão encerrada", time: "há 12h", icon: LogOutIcon },
];

const typeStyles: Record<string, string> = {
  login: "text-green-400",
  logout: "text-muted-foreground",
  alert: "text-red-400",
  system: "text-blue-400",
  access: "text-primary",
};

const ActivityLog = () => {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Log de Atividades
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          {ACTIVITY_LOG.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < ACTIVITY_LOG.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${typeStyles[entry.type]}`} />
                <p className="flex-1 text-sm text-foreground truncate">{entry.message}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
