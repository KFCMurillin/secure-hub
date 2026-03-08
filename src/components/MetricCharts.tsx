import { useEffect, useState, useRef } from "react";
import { Cpu, MemoryStick } from "lucide-react";

interface DataPoint {
  time: string;
  cpu: number;
  ram: number;
}

const generateInitialData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now - i * 10000);
    data.push({
      time: t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      cpu: Math.floor(20 + Math.random() * 50),
      ram: Math.floor(40 + Math.random() * 35),
    });
  }
  return data;
};

const MiniChart = ({ data, dataKey, color, label }: { data: DataPoint[]; dataKey: "cpu" | "ram"; color: string; label: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const values = data.map((d) => d[dataKey]);
    const max = 100;
    const min = 0;
    const range = max - min || 1;

    // Draw grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw area
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "05");

    ctx.beginPath();
    ctx.moveTo(0, h);
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Current value dot
    const lastX = w;
    const lastY = h - ((values[values.length - 1] - min) / range) * h;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [data, dataKey, color]);

  const currentValue = data[data.length - 1]?.[dataKey] ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-bold text-foreground">{currentValue.toFixed(0)}%</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-24"
        style={{ display: "block" }}
      />
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>{data[0]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
    </div>
  );
};

const MetricCharts = () => {
  const [data, setData] = useState<DataPoint[]>(generateInitialData);

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        const newPoint: DataPoint = {
          time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          cpu: Math.min(100, Math.max(5, (prev[prev.length - 1]?.cpu ?? 30) + (Math.random() - 0.5) * 12)),
          ram: Math.min(100, Math.max(20, (prev[prev.length - 1]?.ram ?? 60) + (Math.random() - 0.5) * 6)),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
        📈 Histórico de Métricas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MiniChart data={data} dataKey="cpu" color="#00d4ff" label="CPU (últimos 5 min)" />
        <MiniChart data={data} dataKey="ram" color="#a855f7" label="RAM (últimos 5 min)" />
      </div>
    </div>
  );
};

export default MetricCharts;
