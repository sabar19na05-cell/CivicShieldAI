import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ClipboardList } from "lucide-react";
import { IncidentAPI } from "../../services/api";
import { Incident, ISSUE_TYPE_LABELS, IncidentStatus } from "../../types";
import { Loader, EmptyState } from "../../components/Primitives";
import { SeverityBadge, StatusBadge, PriorityBadge, RiskScorePill } from "../../components/Badges";

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
const STATUSES: IncidentStatus[] = ["NEW", "AI_ANALYZED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "AI_VERIFIED", "CLOSED"];

export function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");

  useEffect(() => {
    IncidentAPI.list().then((res) => setIncidents(res.data.incidents));
  }, []);

  const filtered = useMemo(() => {
    let list = incidents || [];
    if (status) list = list.filter((i) => i.status === status);
    if (severity) list = list.filter((i) => i.severity === severity);
    if (q) {
      const query = q.toLowerCase();
      list = list.filter((i) => `${i.incidentCode} ${i.description} ${i.address}`.toLowerCase().includes(query));
    }
    return [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [incidents, q, status, severity]);

  if (!incidents) return <Loader label="Loading incidents" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Incident Management</h1>
        <p className="text-ink-muted text-sm mt-0.5">All reported incidents, auto-sorted by AI priority.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input className="input pl-9" placeholder="Search by ID, description, location" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select className="input w-auto" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          {["low", "moderate", "high", "critical"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardList} title="No incidents match your filters" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-sunken/60 text-ink-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 font-medium">Risk</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr key={inc.id} className="border-t border-line hover:bg-surface-sunken/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{inc.incidentCode}</td>
                    <td className="px-4 py-3">{ISSUE_TYPE_LABELS[inc.type]}</td>
                    <td className="px-4 py-3 text-ink-muted max-w-[160px] truncate">{inc.address}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={inc.priority} /></td>
                    <td className="px-4 py-3"><RiskScorePill score={inc.riskScore} /></td>
                    <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{inc.department || "Unassigned"}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/incidents/${inc.id}`} className="text-xs font-semibold text-signal">Manage →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
