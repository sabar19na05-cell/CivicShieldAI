import { useEffect, useState } from "react";
import {
  AlertOctagon, ClipboardList, Wrench, CheckCircle2, Clock, Percent,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { AnalyticsAPI } from "../../services/api";
import { StatCard, Loader } from "../../components/Primitives";
import { useSocket } from "../../context/SocketContext";
import { ActivityLog } from "../../types";
import { ISSUE_TYPE_LABELS } from "../../types";

const COLORS = ["#0E7C86", "#E0A526", "#E07A2C", "#D6483F", "#2E9E5B", "#3A4A63", "#12989F", "#946213"];

interface DashboardData {
  kpis: {
    total: number; critical: number; pending: number; activeMaintenance: number;
    resolved: number; avgResponseHours: number; resolutionRate: number;
  };
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  monthly: { month: string; incidents: number; resolved: number }[];
  activityFeed: ActivityLog[];
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { liveActivity } = useSocket();

  async function load() {
    const res = await AnalyticsAPI.dashboard();
    setData(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (liveActivity && data) {
      setData((prev) => (prev ? { ...prev, activityFeed: [liveActivity, ...prev.activityFeed].slice(0, 15) } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveActivity]);

  if (!data) return <Loader label="Loading command center" />;

  const categoryData = Object.entries(data.byCategory).map(([k, v]) => ({
    name: ISSUE_TYPE_LABELS[k as keyof typeof ISSUE_TYPE_LABELS] || k,
    value: v,
  }));
  const severityData = Object.entries(data.bySeverity).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-display font-semibold">Command Center</h1>
        <p className="text-ink-muted text-sm mt-0.5">Real-time overview of civic infrastructure health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Total issues" value={data.kpis.total} icon={ClipboardList} accent="signal" />
        <StatCard label="Critical" value={data.kpis.critical} icon={AlertOctagon} accent="critical" />
        <StatCard label="Pending" value={data.kpis.pending} icon={Clock} accent="moderate" />
        <StatCard label="Active maintenance" value={data.kpis.activeMaintenance} icon={Wrench} accent="high" />
        <StatCard label="Resolved" value={data.kpis.resolved} icon={CheckCircle2} accent="low" />
        <StatCard label="Resolution rate" value={`${data.kpis.resolutionRate}%`} icon={Percent} accent="signal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display font-semibold mb-4">Monthly incidents vs. resolved</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7A90" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7A90" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="incidents" stroke="#0E7C86" strokeWidth={2.5} dot={false} name="Reported" />
              <Line type="monotone" dataKey="resolved" stroke="#2E9E5B" strokeWidth={2.5} dot={false} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold mb-4">By severity</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {severityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {severityData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-ink-muted capitalize">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display font-semibold mb-4">Issues by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7A90" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#3A4A63" }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="value" fill="#0E7C86" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold mb-4">Live activity feed</h2>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {data.activityFeed.map((a) => (
              <div key={a.id} className="flex gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal shrink-0" />
                <div>
                  <p className="text-ink-soft leading-snug">{a.description}</p>
                  <p className="text-[11px] text-ink-faint font-mono mt-0.5">{new Date(a.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
