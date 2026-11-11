import { Router } from "express";
import { readDb } from "../config/db";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const db = readDb();
    const incidents = db.incidents;

    const total = incidents.length;
    const critical = incidents.filter((i) => i.priority === "CRITICAL").length;
    const pending = incidents.filter((i) => !["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status)).length;
    const activeMaintenance = db.tasks.filter((t) => t.status !== "COMPLETED").length;
    const resolved = incidents.filter((i) => ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status)).length;

    const resolutionTimes = incidents
      .filter((i) => ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status))
      .map((i) => (new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime()) / (1000 * 3600));
    const avgResponseHours = resolutionTimes.length
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0;

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    incidents.forEach((i) => {
      byCategory[i.type] = (byCategory[i.type] || 0) + 1;
      bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
      if (i.department) byDepartment[i.department] = (byDepartment[i.department] || 0) + 1;
    });

    // Monthly trend over last 6 months (synthesized from createdAt)
    const now = new Date();
    const monthly: { month: string; incidents: number; resolved: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const monthIncidents = incidents.filter((i) => {
        const created = new Date(i.createdAt);
        return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      });
      monthly.push({
        month: label,
        incidents: monthIncidents.length,
        resolved: monthIncidents.filter((i) => ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(i.status)).length,
      });
    }

    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

    res.json({
      kpis: {
        total,
        critical,
        pending,
        activeMaintenance,
        resolved,
        avgResponseHours,
        resolutionRate,
      },
      byCategory,
      bySeverity,
      byDepartment,
      monthly,
      activityFeed: db.activityLog.slice(0, 15),
    });
  })
);

router.get(
  "/performance",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const db = readDb();
    const workers = db.users.filter((u) => u.role === "worker");
    const performance = workers.map((w) => {
      const tasks = db.tasks.filter((t) => t.workerId === w.id);
      const completed = tasks.filter((t) => t.status === "COMPLETED").length;
      return {
        workerId: w.id,
        name: w.name,
        department: w.department,
        assigned: tasks.length,
        completed,
        completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      };
    });
    res.json({ performance });
  })
);

export default router;
