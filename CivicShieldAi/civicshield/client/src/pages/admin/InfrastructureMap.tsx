import { useEffect, useState } from "react";
import { IncidentAPI } from "../../services/api";
import { Incident, ISSUE_TYPE_LABELS, IssueType, Severity } from "../../types";
import { Loader } from "../../components/Primitives";
import { MapView } from "../../components/MapView";

export function InfrastructureMap() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [severity, setSeverity] = useState<Severity | "">("");
  const [type, setType] = useState<IssueType | "">("");

  useEffect(() => {
    IncidentAPI.list().then((res) => setIncidents(res.data.incidents));
  }, []);

  if (!incidents) return <Loader label="Loading infrastructure map" />;

  const filtered = incidents.filter((i) => (!severity || i.severity === severity) && (!type || i.type === type));

  const legend: { label: string; color: string }[] = [
    { label: "Critical", color: "#D6483F" },
    { label: "High", color: "#E07A2C" },
    { label: "Moderate", color: "#E0A526" },
    { label: "Low / Resolved", color: "#2E9E5B" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Infrastructure Map</h1>
        <p className="text-ink-muted text-sm mt-0.5">Every reported incident, plotted live across the city.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
          <option value="">All severities</option>
          {["low", "moderate", "high", "critical"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value as IssueType | "")}>
          <option value="">All types</option>
          {Object.entries(ISSUE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs text-ink-muted font-mono ml-auto">{filtered.length} of {incidents.length} incidents shown</span>
      </div>

      <div className="card p-2">
        <MapView incidents={filtered} height="600px" />
      </div>

      <div className="flex flex-wrap gap-4">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
