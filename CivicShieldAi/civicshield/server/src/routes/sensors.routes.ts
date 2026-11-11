import { Router } from "express";
import { readDb, writeDb } from "../config/db";
import { requireAuth } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getIO } from "../socket/ioInstance";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    let sensors = db.sensors;
    const { type } = req.query as { type?: string };
    if (type) sensors = sensors.filter((s) => s.type === type);
    res.json({ sensors });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const sensor = db.sensors.find((s) => s.id === req.params.id);
    if (!sensor) throw new ApiError(404, "Sensor not found.");
    res.json({ sensor });
  })
);

// POST /api/sensors/simulate - force an immediate tick (useful for demos)
router.post(
  "/simulate",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const db = readDb();
    db.sensors = db.sensors.map((s) => ({
      ...s,
      value: Number((s.value + (Math.random() - 0.4) * 6).toFixed(1)),
      lastUpdated: new Date().toISOString(),
    }));
    writeDb(db);
    const io = getIO();
    if (io) io.emit("sensors:update", db.sensors);
    res.json({ sensors: db.sensors });
  })
);

export default router;
