import { useEffect, useState } from "react";
import { Radio, Trash2, Droplets, CloudRain, Zap } from "lucide-react";
import { SensorAPI } from "../../services/api";
import { Sensor } from "../../types";
import { Loader } from "../../components/Primitives";
import { useSocket } from "../../context/SocketContext";

const STATUS_STYLES: Record<Sensor["status"], string> = {
  Normal: "text-status-low bg-status-low/10",
  Warning: "text-status-high bg-status-high/10",
  Critical: "text-status-critical bg-status-critical/10",
};

function SensorCard({ sensor }: { sensor: Sensor }) {
  const icon = sensor.type === "waste_bin" ? Trash2 : sensor.type === "water_flow" ? Droplets : CloudRain;
  const Icon = icon;
  const max = sensor.type === "water_flow" ? 220 : 100;
  const pct = Math.min(100, (sensor.value / max) * 100);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-signal-50 text-signal-dark flex items-center justify-center">
          <Icon size={18} />
        </div>
        <span className={`badge ${STATUS_STYLES[sensor.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full bg-current ${sensor.status === "Critical" ? "animate-pulseDot" : ""}`} />
          {sensor.status}
        </span>
      </div>
      <p className="font-mono text-sm font-semibold text-ink">{sensor.sensorId}</p>
      <p className="text-xs text-ink-muted capitalize mb-3">{sensor.location.address}</p>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-display font-semibold text-ink transition-all duration-500">{sensor.value}</span>
        <span className="text-xs text-ink-muted">{sensor.unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${
            sensor.status === "Critical" ? "bg-status-critical" : sensor.status === "Warning" ? "bg-status-high" : "bg-status-low"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {sensor.meta && (
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-line text-xs text-ink-muted">
          {Object.entries(sensor.meta).map(([k, v]) => (
            <span key={k} className="capitalize">{k.replace(/([A-Z])/g, " $1")}: <span className="text-ink font-medium">{v}</span></span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-ink-faint font-mono mt-2">Updated {new Date(sensor.lastUpdated).toLocaleTimeString()}</p>
    </div>
  );
}

export function IoTMonitoring() {
  const [sensors, setSensors] = useState<Sensor[] | null>(null);
  const { liveSensors } = useSocket();

  useEffect(() => {
    SensorAPI.list().then((res) => setSensors(res.data.sensors));
  }, []);

  useEffect(() => {
    if (liveSensors) setSensors(liveSensors);
  }, [liveSensors]);

  if (!sensors) return <Loader label="Connecting to sensor network" />;

  const wasteBins = sensors.filter((s) => s.type === "waste_bin");
  const waterFlow = sensors.filter((s) => s.type === "water_flow");
  const flood = sensors.filter((s) => s.type === "flood");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2"><Radio size={22} className="text-signal" /> IoT Monitoring</h1>
          <p className="text-ink-muted text-sm mt-0.5">Simulated sensor network — values update live every few seconds.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-status-low font-semibold">
          <Zap size={14} className="animate-pulseDot" /> Live
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Smart waste monitoring</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wasteBins.map((s) => <SensorCard key={s.id} sensor={s} />)}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Water leakage monitoring</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waterFlow.map((s) => <SensorCard key={s.id} sensor={s} />)}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Flood / drainage risk</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flood.map((s) => <SensorCard key={s.id} sensor={s} />)}
        </div>
      </div>
    </div>
  );
}
