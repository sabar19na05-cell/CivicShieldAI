import { useEffect, useState } from "react";
import { Gauge, Lightbulb, Droplets, Waves, Trash2, Construction } from "lucide-react";
import { MaintenanceAPI } from "../../services/api";
import { InfrastructureAsset } from "../../types";
import { Loader } from "../../components/Primitives";

const ICONS: Record<InfrastructureAsset["type"], typeof Lightbulb> = {
  streetlight: Lightbulb,
  water_pipeline: Droplets,
  drainage: Waves,
  waste_bin: Trash2,
  road: Construction,
};

const CONDITION_STYLES: Record<InfrastructureAsset["condition"], string> = {
  Good: "text-status-low bg-status-low/10",
  Fair: "text-signal-dark bg-signal-50",
  Warning: "text-status-high bg-status-high/10",
  Critical: "text-status-critical bg-status-critical/10",
};

export function PredictiveMaintenance() {
  const [assets, setAssets] = useState<InfrastructureAsset[] | null>(null);
  const [type, setType] = useState("");

  useEffect(() => {
    MaintenanceAPI.assets(type || undefined).then((res) => setAssets(res.data.assets));
  }, [type]);

  if (!assets) return <Loader label="Loading asset health" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2"><Gauge size={22} className="text-signal" /> Predictive Maintenance</h1>
          <p className="text-ink-muted text-sm mt-0.5">Infrastructure assets ranked by failure probability.</p>
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All asset types</option>
          <option value="streetlight">Streetlights</option>
          <option value="water_pipeline">Water pipelines</option>
          <option value="drainage">Drainage</option>
          <option value="waste_bin">Waste bins</option>
          <option value="road">Roads</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((a) => {
          const Icon = ICONS[a.type];
          return (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-signal-50 text-signal-dark flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span className={`badge ${CONDITION_STYLES[a.condition]}`}>{a.condition}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-ink">{a.assetId}</p>
              <p className="text-xs text-ink-muted capitalize mb-3">{a.type.replace(/_/g, " ")} · {a.location.address}</p>

              <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
                <span>Failure probability</span>
                <span className="font-mono font-semibold text-ink">{a.failureProbability}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden mb-3">
                <div
                  className={`h-full ${a.failureProbability >= 70 ? "bg-status-critical" : a.failureProbability >= 40 ? "bg-status-high" : "bg-status-low"}`}
                  style={{ width: `${a.failureProbability}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted mb-3">
                <span>Age: <span className="text-ink font-medium">{a.age} yrs</span></span>
                <span>Failures: <span className="text-ink font-medium">{a.previousFailures}</span></span>
              </div>

              <div className="pt-3 border-t border-line">
                <p className="text-xs text-ink-muted mb-1">Recommended action</p>
                <p className="text-xs font-medium text-ink-soft">{a.recommendedAction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
