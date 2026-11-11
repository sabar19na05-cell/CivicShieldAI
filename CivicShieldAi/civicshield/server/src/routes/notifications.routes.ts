import { Router } from "express";
import { readDb, writeDb } from "../config/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const role = req.user!.role;
    const roleWide = role === "admin" ? "ALL_ADMIN" : null;
    const list = db.notifications
      .filter((n) => n.userId === req.user!.id || n.userId === "ALL" || n.userId === roleWide)
      .slice(0, 50);
    res.json({ notifications: list, unreadCount: list.filter((n) => !n.read).length });
  })
);

router.put(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      writeDb(db);
    }
    res.json({ notification: notif || null });
  })
);

router.put(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const role = req.user!.role;
    const roleWide = role === "admin" ? "ALL_ADMIN" : null;
    db.notifications.forEach((n) => {
      if (n.userId === req.user!.id || n.userId === "ALL" || n.userId === roleWide) n.read = true;
    });
    writeDb(db);
    res.json({ message: "All notifications marked as read." });
  })
);

export default router;
