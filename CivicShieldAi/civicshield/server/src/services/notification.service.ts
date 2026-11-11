import { Server as SocketServer } from "socket.io";
import { readDb, writeDb } from "../config/db";
import { newId } from "../utils/ids";
import { Notification, ActivityLog } from "../types";

export function pushNotification(
  io: SocketServer | null,
  userId: string | "ALL_ADMIN" | "ALL",
  title: string,
  message: string,
  type: Notification["type"] = "info"
) {
  const db = readDb();
  const notif: Notification = {
    id: newId(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
  db.notifications = db.notifications.slice(0, 300); // cap growth
  writeDb(db);

  if (io) {
    if (userId === "ALL" || userId === "ALL_ADMIN") {
      io.emit("notification", notif);
    } else {
      io.to(`user:${userId}`).emit("notification", notif);
    }
  }
  return notif;
}

export function logActivity(
  userId: string | null,
  userName: string,
  action: string,
  entity: string,
  entityId: string,
  description: string
) {
  const db = readDb();
  const entry: ActivityLog = {
    id: newId(),
    userId,
    userName,
    action,
    entity,
    entityId,
    description,
    timestamp: new Date().toISOString(),
  };
  db.activityLog.unshift(entry);
  db.activityLog = db.activityLog.slice(0, 500);
  writeDb(db);
  return entry;
}
