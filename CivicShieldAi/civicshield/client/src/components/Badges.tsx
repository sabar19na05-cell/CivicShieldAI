import { IncidentStatus, Priority, Severity } from "../types";

const SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-status-low/10 text-status-low",
  moderate: "bg-status-moderate/10 text-[#946213]",
  high: "bg-status-high/10 text-status-high",
  critical: "bg-status-critical/10 text-status-critical",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`badge ${SEVERITY_STYLES[severity]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-status-low/10 text-status-low",
  MODERATE: "bg-status-moderate/10 text-[#946213]",
  HIGH: "bg-status-high/10 text-status-high",
  CRITICAL: "bg-status-critical/10 text-status-critical",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge ${PRIORITY_STYLES[priority]}`}>{priority}</span>;
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  NEW: "New",
  AI_ANALYZED: "AI Analyzed",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  AI_VERIFIED: "AI Verified",
  CLOSED: "Closed",
};

const STATUS_STYLES: Record<IncidentStatus, string> = {
  NEW: "bg-slate-100 text-ink-soft",
  AI_ANALYZED: "bg-signal-50 text-signal-dark",
  VERIFIED: "bg-signal-50 text-signal-dark",
  ASSIGNED: "bg-amber-50 text-[#946213]",
  IN_PROGRESS: "bg-amber-50 text-[#946213]",
  RESOLVED: "bg-emerald-50 text-status-low",
  AI_VERIFIED: "bg-emerald-50 text-status-low",
  CLOSED: "bg-slate-100 text-ink-muted",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return <span className={`badge ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function RiskScorePill({ score }: { score: number }) {
  const color =
    score >= 76 ? "text-status-critical" : score >= 51 ? "text-status-high" : score >= 26 ? "text-status-moderate" : "text-status-low";
  const barColor =
    score >= 76 ? "bg-status-critical" : score >= 51 ? "bg-status-high" : score >= 26 ? "bg-status-moderate" : "bg-status-low";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-surface-sunken overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-mono text-xs font-semibold ${color}`}>{score}/100</span>
    </div>
  );
}
