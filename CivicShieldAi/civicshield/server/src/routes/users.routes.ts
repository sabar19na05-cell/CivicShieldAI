import { Router } from "express";
import { readDb } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const db = readDb();
    const { role } = req.query as { role?: string };
    let users = db.users;
    if (role) users = users.filter((u) => u.role === role);
    res.json({ users: users.map(({ passwordHash, ...rest }) => rest) });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) throw new ApiError(404, "User not found.");
    const { passwordHash, ...rest } = user;
    res.json({ user: rest });
  })
);

export default router;
