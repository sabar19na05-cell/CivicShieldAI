import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Notification, Sensor, ActivityLog, Incident, MaintenanceTask } from "../types";

interface SocketContextValue {
  connected: boolean;
  liveNotification: Notification | null;
  liveSensors: Sensor[] | null;
  liveActivity: ActivityLog | null;
  liveIncident: Incident | null;
  liveTask: MaintenanceTask | null;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  liveNotification: null,
  liveSensors: null,
  liveActivity: null,
  liveIncident: null,
  liveTask: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [liveNotification, setLiveNotification] = useState<Notification | null>(null);
  const [liveSensors, setLiveSensors] = useState<Sensor[] | null>(null);
  const [liveActivity, setLiveActivity] = useState<ActivityLog | null>(null);
  const [liveIncident, setLiveIncident] = useState<Incident | null>(null);
  const [liveTask, setLiveTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = io("/", { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("auth", token);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("notification", (n: Notification) => setLiveNotification(n));
    socket.on("sensors:update", (s: Sensor[]) => setLiveSensors(s));
    socket.on("activity:new", (a: ActivityLog) => setLiveActivity(a));
    socket.on("incident:new", (i: Incident) => setLiveIncident(i));
    socket.on("incident:updated", (i: Incident) => setLiveIncident(i));
    socket.on("task:new", (t: MaintenanceTask) => setLiveTask(t));
    socket.on("task:updated", (t: MaintenanceTask) => setLiveTask(t));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ connected, liveNotification, liveSensors, liveActivity, liveIncident, liveTask }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
