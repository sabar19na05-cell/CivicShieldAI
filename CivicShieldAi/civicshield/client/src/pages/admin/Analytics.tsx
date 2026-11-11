import { useEffect, useState } from "react";
import { BarChart3, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnalyticsAPI } from "../../services/api";
import { Loader } from "../../components/Primitives";

interface Performance {
  workerId: string;
  name: string;
  department?: string;
  assigned: number;
  completed: number;
  completionRate: number;
}

export function Analytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [performance, setPerformance] = useState<Performance[] | null>(null);

  useEffect(() => {
    AnalyticsAPI.dashboard().then((res) => setDashboard(res.data));
    AnalyticsAPI.performance().then((res) => setPerformance(res.data.performance));
  }, []);

  if (!dashboard || !performance) return <Loader label="Building analytics" />;

  const deptData = Object.entries(dashboard.byDepartment as Record<string, number>).map(([name, value]) => ({ name, value }));

  function exportCsv() {
    const rows = [
      ["Metric", "Value"],
      ["Total incidents", dashboard.kpis.total],
      ["Critical", dashboard.kpis.critical],
      ["Resolved", dashboard.kpis.resolved],
      ["Resolution rate (%)", dashboard.kpis.resolutionRate],
      ["Avg response time (hrs)", dashboard.kpis.avgResponseHours],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "civicshieldai-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2"><BarChart3 size={22} className="text-signal" /> Analytics & Reports</h1>
          <p className="text-ink-muted text-sm mt-0.5">Response performance across departments and workers.</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary"><Download size={16} /> Export CSV</button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Avg response time</p>
          <p className="text-2xl font-display font-semibold">{dashboard.kpis.avgResponseHours}h</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Resolution rate</p>
          <p className="text-2xl font-display font-semibold">{dashboard.kpis.resolutionRate}%</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Total resolved</p>
          <p className="text-2xl font-display font-semibold">{dashboard.kpis.resolved}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Total incidents</p>
          <p className="text-2xl font-display font-semibold">{dashboard.kpis.total}</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold mb-4">Incidents by department</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7A90" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7A90" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Bar dataKey="value" fill="#0E7C86" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 pb-0">
          <h2 className="font-display font-semibold mb-4">Worker performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-sunken/60 text-ink-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Worker</th>
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-left px-5 py-3 font-medium">Assigned</th>
                <th className="text-left px-5 py-3 font-medium">Completed</th>
                <th className="text-left px-5 py-3 font-medium">Completion rate</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((p) => (
                <tr key={p.workerId} className="border-t border-line">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{p.department}</td>
                  <td className="px-5 py-3 font-mono">{p.assigned}</td>
                  <td className="px-5 py-3 font-mono">{p.completed}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-surface-sunken overflow-hidden">
                        <div className="h-full bg-signal" style={{ width: `${p.completionRate}%` }} />
                      </div>
                      <span className="font-mono text-xs">{p.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
