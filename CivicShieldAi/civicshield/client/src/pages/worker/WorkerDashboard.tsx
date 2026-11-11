import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { MaintenanceAPI } from "../../services/api";
import { MaintenanceTask, ISSUE_TYPE_LABELS } from "../../types";
import { StatCard, Loader, EmptyState } from "../../components/Primitives";
import { PriorityBadge } from "../../components/Badges";

const STATUS_LABEL: Record<MaintenanceTask["status"], string> = {
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export function WorkerDashboard() {
  const [tasks, setTasks] = useState<MaintenanceTask[] | null>(null);

  useEffect(() => {
    MaintenanceAPI.tasks().then((res) => setTasks(res.data.tasks));
  }, []);

  if (!tasks) return <Loader label="Loading your tasks" />;

  const active = tasks.filter((t) => t.status !== "COMPLETED");
  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const dueSoon = active.filter((t) => new Date(t.deadline).getTime() - Date.now() < 3 * 24 * 3600 * 1000);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-display font-semibold">Your maintenance queue</h1>
        <p className="text-ink-muted text-sm mt-0.5">Tasks assigned to you, sorted by priority.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active tasks" value={active.length} icon={ListTodo} accent="signal" />
        <StatCard label="Due within 3 days" value={dueSoon.length} icon={Clock} accent="high" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} accent="low" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Wrench size={17} /> Active tasks</h2>
          <Link to="/worker/tasks" className="text-xs font-semibold text-signal">View all</Link>
        </div>
        {active.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All caught up" subtitle="You have no active tasks right now." />
        ) : (
          <div className="space-y-2.5">
            {active.slice(0, 6).map((t) => (
              <Link key={t.id} to={`/worker/tasks/${t.incidentId}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-line hover:bg-surface-sunken transition-colors">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-ink-muted">{t.taskId}</p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {t.incident ? ISSUE_TYPE_LABELS[t.incident.type] : "Task"}
                  </p>
                  <p className="text-xs text-ink-muted truncate max-w-xs">{t.incident?.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <p className="text-[11px] text-ink-faint mt-1.5">{STATUS_LABEL[t.status]}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
