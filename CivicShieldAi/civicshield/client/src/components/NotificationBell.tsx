import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { NotificationAPI } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { Notification } from "../types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_DOT: Record<Notification["type"], string> = {
  info: "bg-signal",
  success: "bg-status-low",
  warning: "bg-status-high",
  critical: "bg-status-critical",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const { liveNotification } = useSocket();

  async function load() {
    const res = await NotificationAPI.list();
    setItems(res.data.notifications);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (liveNotification) setItems((prev) => [liveNotification, ...prev].slice(0, 50));
  }, [liveNotification]);

  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    await NotificationAPI.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-ink-soft hover:bg-surface-sunken transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-status-critical text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 card z-50 overflow-hidden animate-fadeUp">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <p className="font-semibold text-sm">Notifications</p>
              <button onClick={markAllRead} className="text-xs text-signal font-semibold flex items-center gap-1 hover:text-signal-dark">
                <Check size={13} /> Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 && <p className="text-sm text-ink-muted text-center py-8">No notifications yet.</p>}
              {items.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-line last:border-0 ${!n.read ? "bg-signal-50/40" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${TYPE_DOT[n.type]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink leading-snug">{n.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-ink-faint mt-1 font-mono">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
