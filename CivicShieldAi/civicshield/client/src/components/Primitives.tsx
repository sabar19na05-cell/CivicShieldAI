import { ReactNode, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "signal",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "signal" | "critical" | "high" | "low" | "moderate";
}) {
  const accentClasses: Record<string, string> = {
    signal: "bg-signal-50 text-signal-dark",
    critical: "bg-status-critical/10 text-status-critical",
    high: "bg-status-high/10 text-status-high",
    low: "bg-status-low/10 text-status-low",
    moderate: "bg-status-moderate/10 text-[#946213]",
  };
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fadeUp">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon size={19} />
        </div>
        {trend && <span className="text-xs font-semibold text-status-low">{trend}</span>}
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-ink">{value}</p>
        <p className="text-xs text-ink-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-signal-50" />
        <div className="absolute inset-0 rounded-full border-2 border-signal border-t-transparent animate-spin" />
      </div>
      <p className="text-sm">{label}…</p>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-surface-sunken animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }: { icon: LucideIcon; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-12 w-12 rounded-full bg-surface-sunken flex items-center justify-center text-ink-faint mb-3">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink-muted mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-status-critical/10 border border-status-critical/20 text-status-critical text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function Toast({ message, type = "info", onDone }: { message: string; type?: "info" | "success" | "critical" | "warning"; onDone: () => void }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(false), 4200);
    const t2 = setTimeout(onDone, 4600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  const styles: Record<string, string> = {
    info: "border-signal/30 bg-white",
    success: "border-status-low/30 bg-white",
    critical: "border-status-critical/30 bg-white",
    warning: "border-status-high/30 bg-white",
  };
  const dot: Record<string, string> = {
    info: "bg-signal",
    success: "bg-status-low",
    critical: "bg-status-critical",
    warning: "bg-status-high",
  };

  return (
    <div
      className={`pointer-events-auto card border ${styles[type]} px-4 py-3 flex items-start gap-3 w-80 transition-all duration-300 ${
        show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 animate-pulseDot ${dot[type]}`} />
      <p className="text-sm text-ink-soft leading-snug">{message}</p>
    </div>
  );
}
