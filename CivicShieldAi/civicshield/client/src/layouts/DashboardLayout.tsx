import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, FilePlus2, ListChecks, Map, ScanEye, Gauge, Wrench,
  Radio, BarChart3, LogOut, Menu, ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "../components/NotificationBell";
import { Logo } from "./PublicLayout";
import { useSocket } from "../context/SocketContext";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const CITIZEN_NAV: NavItem[] = [
  { to: "/citizen", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/citizen/report", label: "Report Issue", icon: FilePlus2 },
  { to: "/citizen/my-reports", label: "My Reports", icon: ListChecks },
  { to: "/citizen/map", label: "Nearby Issues", icon: Map },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/incidents", label: "Incident Management", icon: ClipboardList },
  { to: "/admin/map", label: "Infrastructure Map", icon: Map },
  { to: "/admin/ai-center", label: "AI Detection Center", icon: ScanEye },
  { to: "/admin/predictive", label: "Predictive Maintenance", icon: Gauge },
  { to: "/admin/iot", label: "IoT Monitoring", icon: Radio },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const WORKER_NAV: NavItem[] = [
  { to: "/worker", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/worker/tasks", label: "Assigned Tasks", icon: Wrench },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { connected } = useSocket();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = user?.role === "admin" ? ADMIN_NAV : user?.role === "worker" ? WORKER_NAV : CITIZEN_NAV;

  const roleLabel = user?.role === "admin" ? "Authority Admin" : user?.role === "worker" ? "Maintenance Worker" : "Citizen";

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-line shrink-0">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) => (isActive ? "nav-link-active" : "nav-link")}
          >
            <item.icon size={17} strokeWidth={2.2} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-line shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-status-low animate-pulseDot" : "bg-ink-faint"}`} />
          <span className="text-[11px] text-ink-faint">{connected ? "Live updates connected" : "Connecting…"}</span>
        </div>
        <button onClick={logout} className="nav-link w-full text-status-critical hover:bg-status-critical/5">
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-line bg-white">{SidebarContent}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-64 bg-white h-full animate-fadeUp">{SidebarContent}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line bg-white/90 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-surface-sunken" onClick={() => setDrawerOpen(true)}>
              <Menu size={19} />
            </button>
            <div>
              <p className="text-sm font-semibold text-ink leading-tight">{roleLabel}</p>
              <p className="text-xs text-ink-muted">Welcome back, {user?.name?.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => navigate(user?.role === "admin" ? "/admin" : user?.role === "worker" ? "/worker" : "/citizen")}
              className="h-9 w-9 rounded-full bg-signal text-white font-display font-semibold text-sm flex items-center justify-center"
              title={user?.name}
            >
              {user?.name?.charAt(0)}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-7 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
