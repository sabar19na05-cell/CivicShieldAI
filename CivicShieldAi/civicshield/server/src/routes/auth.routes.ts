import { Router } from "express";
import bcrypt from "bcryptjs";
import { readDb, writeDb } from "../config/db";
import { newId } from "../utils/ids";
import { signToken } from "../utils/jwt";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { logActivity } from "../services/notification.service";
import { Role, User } from "../types";

const router = Router();

function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, phone, password, confirmPassword, role } = req.body as {
      name: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      role: Role;
    };

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      throw new ApiError(400, "All fields are required.");
    }
    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match.");
    }
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters.");
    }
    if (!["citizen", "admin", "worker"].includes(role)) {
      throw new ApiError(400, "Invalid role selected.");
    }

    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: newId(),
      name,
      email,
      phone,
      passwordHash,
      role,
      department: role === "worker" ? "Public Works" : undefined,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    logActivity(user.id, user.name, "USER_REGISTERED", "User", user.id, `${user.name} registered as ${role}`);

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    res.status(201).json({ token, user: publicUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) throw new ApiError(400, "Email and password are required.");

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ApiError(401, "Invalid email or password.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    logActivity(user.id, user.name, "USER_LOGIN", "User", user.id, `${user.name} logged in`);
    res.json({ token, user: publicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const user = db.users.find((u) => u.id === req.user!.id);
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ user: publicUser(user) });
  })
);

export default router;
