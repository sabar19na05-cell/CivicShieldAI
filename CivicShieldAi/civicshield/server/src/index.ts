import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/auth.routes";
import incidentRoutes from "./routes/incidents.routes";
import aiRoutes from "./routes/ai.routes";
import sensorRoutes from "./routes/sensors.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notifications.routes";
import userRoutes from "./routes/users.routes";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createSocketServer } from "./socket/index";
import { setIO } from "./socket/ioInstance";
import { startSensorSimulation } from "./services/sensor.service";
import { UPLOAD_DIR } from "./middleware/upload";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api", limiter);

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CivicShieldAI API" }));

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);
const io = createSocketServer(httpServer);
setIO(io);
startSensorSimulation(io);

httpServer.listen(PORT, () => {
  console.log(`\n  CivicShieldAI API running →  http://localhost:${PORT}`);
  console.log(`  Socket.IO ready. Accepting client origin: ${CLIENT_URL}\n`);
});
