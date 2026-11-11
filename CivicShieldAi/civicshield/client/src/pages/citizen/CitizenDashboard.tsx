import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, Activity, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { IncidentAPI } from "../../services/api";
import { Incident } from "../../types";
import { StatCard, Loader, EmptyState } from "../../components/Primitives";
import { SeverityBadge, StatusBadge, RiskScorePill } from "../../components/Badges";
import { MapView } from "../../components/MapView";
import { ISSUE_TYPE_LABELS } from "../../types";

export function CitizenDashboard() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);

  useEffect(() => {
    IncidentAPI.list().then((res) => setIncidents(res.data.incidents));
  }, []);

  if (!incidents) return <Loader label="Loading your dashboard" />;

  const total = incidents.length;
  const pending = incidents.filter((i) => !["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status)).length;
  const inProgress = incidents.filter((i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED").length;
  const resolved = incidents.filter((i) => ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status)).length;
  const highPriority = incidents.filter((i) => i.priority === "CRITICAL" || i.priority === "HIGH").length;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">Your civic dashboard</h1>
          <p className="text-ink-muted text-sm mt-0.5">Track everything you've reported, in one place.</p>
        </div>
        <Link to="/citizen/report" className="btn-primary">
          <Plus size={16} /> Report New Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total reports" value={total} icon={FileText} accent="signal" />
        <StatCard label="Pending" value={pending} icon={Clock} accent="moderate" />
        <StatCard label="In progress" value={inProgress} icon={Activity} accent="high" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} accent="low" />
        <StatCard label="High priority" value={highPriority} icon={AlertTriangle} accent="critical" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent reports</h2>
            <Link to="/citizen/my-reports" className="text-xs font-semibold text-signal">View all</Link>
          </div>
          {incidents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No reports yet"
              subtitle="File your first report and the AI will analyze it instantly."
              action={<Link to="/citizen/report" className="btn-primary">Report an issue</Link>}
            />
          ) : (
            <div className="space-y-2.5">
              {incidents.slice(0, 6).map((inc) => (
                <Link
                  to={`/citizen/reports/${inc.id}`}
                  key={inc.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors border border-line"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-muted">{inc.incidentCode}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <p className="text-sm font-medium text-ink mt-1">{ISSUE_TYPE_LABELS[inc.type]}</p>
                    <p className="text-xs text-ink-muted truncate max-w-xs">{inc.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={inc.status} />
                    <div className="mt-2"><RiskScorePill score={inc.riskScore} /></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display font-semibold mb-4">Nearby infrastructure issues</h2>
          <MapView incidents={incidents} height="320px" />
        </div>
      </div>
    </div>
  );
}
