import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, Loader2 } from "lucide-react";
import { MaintenanceAPI } from "../../services/api";
import { MaintenanceTask, ISSUE_TYPE_LABELS } from "../../types";
import { Loader, EmptyState } from "../../components/Primitives";
import { PriorityBadge } from "../../components/Badges";

const STATUS_FLOW: MaintenanceTask["status"][] = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];
const STATUS_LABEL: Record<MaintenanceTask["status"], string> = {
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export function AssignedTasks() {
  const [tasks, setTasks] = useState<MaintenanceTask[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const res = await MaintenanceAPI.tasks();
    setTasks(res.data.tasks);
  }

  useEffect(() => {
    load();
  }, []);

  async function advance(task: MaintenanceTask) {
    const idx = STATUS_FLOW.indexOf(task.status);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 2)]; // stop before COMPLETED (that happens via repair evidence)
    if (next === task.status) return;
    setUpdating(task.id);
    try {
      await MaintenanceAPI.updateTask(task.id, next);
      await load();
    } finally {
      setUpdating(null);
    }
  }

  if (!tasks) return <Loader label="Loading your tasks" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold flex items-center gap-2"><Wrench size={22} className="text-signal" /> Assigned Tasks</h1>
        <p className="text-ink-muted text-sm mt-0.5">Move each task through Accepted → In Progress, then submit repair evidence to complete it.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="card"><EmptyState icon={Wrench} title="No tasks assigned yet" subtitle="New assignments will appear here in real time." /></div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-ink-muted">{t.taskId}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="font-semibold text-ink">{t.incident ? ISSUE_TYPE_LABELS[t.incident.type] : "Task"}</p>
                <p className="text-xs text-ink-muted">{t.incident?.address}</p>
                <p className="text-[11px] text-ink-faint mt-1">Deadline: {new Date(t.deadline).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="badge bg-surface-sunken text-ink-soft">{STATUS_LABEL[t.status]}</span>
                {t.status !== "COMPLETED" && t.status !== "IN_PROGRESS" && (
                  <button onClick={() => advance(t)} disabled={updating === t.id} className="btn-secondary text-xs">
                    {updating === t.id ? <Loader2 size={13} className="animate-spin" /> : `Mark ${STATUS_FLOW[STATUS_FLOW.indexOf(t.status) + 1]}`}
                  </button>
                )}
                <Link to={`/worker/tasks/${t.incidentId}`} className="btn-primary text-xs">
                  {t.status === "COMPLETED" ? "View Details" : "Open Task"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
