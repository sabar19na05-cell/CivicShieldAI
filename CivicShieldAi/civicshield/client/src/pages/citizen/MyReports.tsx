import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Plus } from "lucide-react";
import { IncidentAPI } from "../../services/api";
import { Incident, ISSUE_TYPE_LABELS } from "../../types";
import { Loader, EmptyState, SkeletonRows } from "../../components/Primitives";
import { SeverityBadge, StatusBadge, RiskScorePill } from "../../components/Badges";

export function MyReports() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    IncidentAPI.list().then((res) => setIncidents(res.data.incidents));
  }, []);

  const filtered = (incidents || []).filter((i) => {
    if (status && i.status !== status) return false;
    if (q && !`${i.incidentCode} ${i.description} ${i.address}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">My Reports</h1>
          <p className="text-ink-muted text-sm mt-0.5">Every issue you've reported, with live status.</p>
        </div>
        <Link to="/citizen/report" className="btn-primary"><Plus size={16} /> Report New Issue</Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input className="input pl-9" placeholder="Search by ID, description or location" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["NEW", "AI_ANALYZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "AI_VERIFIED", "CLOSED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {!incidents ? (
        <div className="card p-6"><SkeletonRows rows={5} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileText} title="No reports match" subtitle="Try adjusting your filters, or report a new issue." />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-sunken/60 text-ink-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Issue ID</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Severity</th>
                  <th className="text-left px-4 py-3 font-medium">Risk</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Reported</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr key={inc.id} className="border-t border-line hover:bg-surface-sunken/40">
                    <td className="px-4 py-3">
                      <Link to={`/citizen/reports/${inc.id}`} className="font-mono text-xs font-semibold text-signal">{inc.incidentCode}</Link>
                    </td>
                    <td className="px-4 py-3">{ISSUE_TYPE_LABELS[inc.type]}</td>
                    <td className="px-4 py-3 text-ink-muted max-w-[180px] truncate">{inc.address}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                    <td className="px-4 py-3"><RiskScorePill score={inc.riskScore} /></td>
                    <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{new Date(inc.createdAt).toLocaleDateString()}</td>
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
