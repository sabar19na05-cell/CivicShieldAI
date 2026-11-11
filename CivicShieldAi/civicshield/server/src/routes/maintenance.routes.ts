import { Router } from "express";
import { readDb, writeDb } from "../config/db";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { pushNotification, logActivity } from "../services/notification.service";
import { getIO } from "../socket/ioInstance";

const router = Router();

router.get(
  "/tasks",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    let tasks = db.tasks;
    if (req.user!.role === "worker") tasks = tasks.filter((t) => t.workerId === req.user!.id);

    const enriched = tasks
      .map((t) => ({
        ...t,
        incident: db.incidents.find((i) => i.id === t.incidentId) || null,
        worker: db.users.find((u) => u.id === t.workerId) || null,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ tasks: enriched });
  })
);

router.put(
  "/tasks/:id",
  requireAuth,
  requireRole("worker", "admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const task = db.tasks.find((t) => t.id === req.params.id);
    if (!task) throw new ApiError(404, "Task not found.");
    if (req.user!.role === "worker" && task.workerId !== req.user!.id) {
      throw new ApiError(403, "This task is not assigned to you.");
    }

    const { status } = req.body as { status: typeof task.status };
    if (status) {
      task.status = status;
      if (status === "COMPLETED") task.completedAt = new Date().toISOString();

      const incident = db.incidents.find((i) => i.id === task.incidentId);
      if (incident) {
        incident.status = status === "COMPLETED" ? incident.status : "IN_PROGRESS";
        incident.history.push({ status: incident.status, at: new Date().toISOString(), by: req.user!.name });
        incident.updatedAt = new Date().toISOString();
      }
    }

    writeDb(db);
    const io = getIO();
    logActivity(req.user!.id, req.user!.name, "TASK_UPDATED", "MaintenanceTask", task.id, `Task ${task.taskId} status -> ${task.status}`);
    if (io) io.emit("task:updated", task);
    res.json({ task });
  })
);

router.get(
  "/assets",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    let assets = db.assets;
    const { type } = req.query as { type?: string };
    if (type) assets = assets.filter((a) => a.type === type);
    assets = [...assets].sort((a, b) => b.failureProbability - a.failureProbability);
    res.json({ assets });
  })
);

router.get(
  "/workers",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const db = readDb();
    const workers = db.users.filter((u) => u.role === "worker").map(({ passwordHash, ...rest }) => rest);
    res.json({ workers });
  })
);

export default router;
