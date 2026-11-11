import { Router } from "express";
import { readDb, writeDb } from "../config/db";
import { newId, incidentCode } from "../utils/ids";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { upload } from "../middleware/upload";
import { analyzeImage, verifyRepair } from "../services/ai.service";
import { calculateRiskScore, classifyRisk } from "../services/risk.service";
import { pushNotification, logActivity } from "../services/notification.service";
import { getIO } from "../socket/ioInstance";
import { Incident, IncidentStatus, IssueType } from "../types";

const router = Router();

// GET /api/incidents - list with optional filters (role-aware)
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    let list = [...db.incidents];

    if (req.user!.role === "citizen") {
      list = list.filter((i) => i.reportedBy === req.user!.id);
    } else if (req.user!.role === "worker") {
      list = list.filter((i) => i.assignedWorker === req.user!.id);
    }

    const { type, severity, status, department, q } = req.query as Record<string, string>;
    if (type) list = list.filter((i) => i.type === type);
    if (severity) list = list.filter((i) => i.severity === severity);
    if (status) list = list.filter((i) => i.status === status);
    if (department) list = list.filter((i) => i.department === department);
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.incidentCode.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.address.toLowerCase().includes(query)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ incidents: list, total: list.length });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const db = readDb();
    const incident = db.incidents.find((i) => i.id === req.params.id);
    if (!incident) throw new ApiError(404, "Incident not found.");
    res.json({ incident });
  })
);

// POST /api/incidents - citizen reports a new issue (with images)
router.post(
  "/",
  requireAuth,
  requireRole("citizen"),
  upload.array("images", 5),
  asyncHandler(async (req: AuthRequest, res) => {
    const { type, description, latitude, longitude, address } = req.body as {
      type: IssueType;
      description: string;
      latitude: string;
      longitude: string;
      address: string;
    };

    if (!type || !description || !latitude || !longitude) {
      throw new ApiError(400, "Issue type, description and location are required.");
    }

    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const images = files.map((f) => `/uploads/${f.filename}`);

    const db = readDb();
    const seq = db.incidents.length + 1;

    // Run the AI simulation immediately so the citizen sees a result on submit.
    const aiDetection = analyzeImage(images[0] || description, type);
    const riskScore = calculateRiskScore({
      severity: aiDetection.severity,
      confidence: aiDetection.confidence,
      locationImportance: 0.5,
      historicalIncidents: 0,
      daysUnresolved: 0,
    });
    const priority = classifyRisk(riskScore);

    const now = new Date().toISOString();
    const incident: Incident = {
      id: newId(),
      incidentCode: incidentCode(seq),
      reportedBy: req.user!.id,
      type,
      description,
      images,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || "Location pin dropped on map",
      aiDetection,
      severity: aiDetection.severity,
      riskScore,
      priority,
      status: "AI_ANALYZED",
      assignedWorker: null,
      department: null,
      notes: [],
      history: [
        { status: "NEW", at: now, by: req.user!.name },
        { status: "AI_ANALYZED", at: now, by: "AI Engine" },
      ],
      repairEvidence: null,
      repairVerification: null,
      createdAt: now,
      updatedAt: now,
    };

    db.incidents.push(incident);
    writeDb(db);

    const io = getIO();
    logActivity(
      req.user!.id,
      req.user!.name,
      "INCIDENT_REPORTED",
      "Incident",
      incident.id,
      `${req.user!.name} reported ${aiDetection.issueType.replace("_", " ")} (${incident.incidentCode})`
    );
    logActivity(
      null,
      "AI Engine",
      "AI_DETECTION",
      "Incident",
      incident.id,
      `AI detected ${aiDetection.severity} severity ${aiDetection.issueType.replace("_", " ")} — risk ${riskScore}/100`
    );
    pushNotification(
      io,
      "ALL_ADMIN",
      priority === "CRITICAL" ? "🚨 Critical infrastructure issue detected" : "New incident reported",
      `${incident.incidentCode}: ${aiDetection.issueType.replace("_", " ")} at ${incident.address} — risk ${riskScore}/100`,
      priority === "CRITICAL" ? "critical" : "info"
    );
    if (io) io.emit("incident:new", incident);

    res.status(201).json({ incident });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const idx = db.incidents.findIndex((i) => i.id === req.params.id);
    if (idx === -1) throw new ApiError(404, "Incident not found.");

    const { status, department, note } = req.body as {
      status?: IncidentStatus;
      department?: string;
      note?: string;
    };

    const incident = db.incidents[idx];
    if (status && status !== incident.status) {
      incident.status = status;
      incident.history.push({ status, at: new Date().toISOString(), by: req.user!.name });
    }
    if (department) incident.department = department;
    if (note) incident.notes.push({ author: req.user!.name, text: note, at: new Date().toISOString() });
    incident.updatedAt = new Date().toISOString();

    db.incidents[idx] = incident;
    writeDb(db);

    logActivity(req.user!.id, req.user!.name, "INCIDENT_UPDATED", "Incident", incident.id, `Status changed to ${incident.status}`);
    const io = getIO();
    if (io) io.emit("incident:updated", incident);
    pushNotification(io, incident.reportedBy, "Your report was updated", `${incident.incidentCode} is now ${incident.status.replace("_", " ")}`, "info");

    res.json({ incident });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const db = readDb();
    const before = db.incidents.length;
    db.incidents = db.incidents.filter((i) => i.id !== req.params.id);
    if (db.incidents.length === before) throw new ApiError(404, "Incident not found.");
    writeDb(db);
    res.json({ message: "Incident deleted." });
  })
);

// POST /api/incidents/:id/assign - admin assigns a worker
router.post(
  "/:id/assign",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const { workerId, department, deadline } = req.body as { workerId: string; department: string; deadline: string };
    const db = readDb();
    const incident = db.incidents.find((i) => i.id === req.params.id);
    if (!incident) throw new ApiError(404, "Incident not found.");
    const worker = db.users.find((u) => u.id === workerId && u.role === "worker");
    if (!worker) throw new ApiError(400, "Selected worker was not found.");

    incident.assignedWorker = workerId;
    incident.department = department;
    incident.status = "ASSIGNED";
    incident.history.push({ status: "ASSIGNED", at: new Date().toISOString(), by: req.user!.name });
    incident.updatedAt = new Date().toISOString();

    const task = {
      id: newId(),
      taskId: `TASK-${500 + db.tasks.length}`,
      incidentId: incident.id,
      workerId,
      department,
      priority: incident.priority,
      status: "ASSIGNED" as const,
      deadline: deadline || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    db.tasks.push(task);
    writeDb(db);

    const io = getIO();
    logActivity(req.user!.id, req.user!.name, "WORKER_ASSIGNED", "Incident", incident.id, `${worker.name} assigned to ${incident.incidentCode}`);
    pushNotification(io, workerId, "🚧 New maintenance task assigned", `${incident.incidentCode}: ${incident.type.replace("_", " ")} at ${incident.address}`, "info");
    pushNotification(io, incident.reportedBy, "A worker has been assigned", `${incident.incidentCode} is now being handled by the ${department} department.`, "info");
    if (io) {
      io.emit("incident:updated", incident);
      io.emit("task:new", task);
    }

    res.json({ incident, task });
  })
);

// POST /api/incidents/:id/repair-evidence - worker uploads after-repair image(s)
router.post(
  "/:id/repair-evidence",
  requireAuth,
  requireRole("worker"),
  upload.array("images", 5),
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const incident = db.incidents.find((i) => i.id === req.params.id);
    if (!incident) throw new ApiError(404, "Incident not found.");
    if (incident.assignedWorker !== req.user!.id) throw new ApiError(403, "This task is not assigned to you.");

    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const afterImages = files.map((f) => `/uploads/${f.filename}`);

    incident.repairEvidence = {
      before: incident.images,
      after: afterImages,
    };

    const verification = verifyRepair(incident.images[0] || incident.id, afterImages[0] || newId());
    incident.repairVerification = verification;
    incident.status = verification.passed ? "AI_VERIFIED" : "IN_PROGRESS";
    incident.history.push({ status: incident.status, at: new Date().toISOString(), by: "AI Engine" });
    incident.updatedAt = new Date().toISOString();

    const task = db.tasks.find((t) => t.incidentId === incident.id);
    if (task) {
      task.status = "COMPLETED";
      task.completedAt = new Date().toISOString();
    }

    writeDb(db);
    const io = getIO();
    logActivity(
      req.user!.id,
      req.user!.name,
      "REPAIR_SUBMITTED",
      "Incident",
      incident.id,
      `Repair evidence uploaded for ${incident.incidentCode}`
    );
    logActivity(
      null,
      "AI Engine",
      "AI_VERIFICATION",
      "Incident",
      incident.id,
      `Repair verification ${verification.passed ? "PASSED" : "FAILED"} (${Math.round(verification.confidence * 100)}% confidence)`
    );
    pushNotification(
      io,
      "ALL_ADMIN",
      verification.passed ? "✅ Repair successfully verified" : "⚠️ Repair verification failed",
      `${incident.incidentCode}: ${verification.note}`,
      verification.passed ? "success" : "warning"
    );
    if (io) io.emit("incident:updated", incident);

    res.json({ incident, verification });
  })
);

// PUT /api/incidents/:id/close - admin closes a verified incident
router.put(
  "/:id/close",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const db = readDb();
    const incident = db.incidents.find((i) => i.id === req.params.id);
    if (!incident) throw new ApiError(404, "Incident not found.");
    incident.status = "CLOSED";
    incident.history.push({ status: "CLOSED", at: new Date().toISOString(), by: req.user!.name });
    incident.updatedAt = new Date().toISOString();
    writeDb(db);

    const io = getIO();
    logActivity(req.user!.id, req.user!.name, "INCIDENT_CLOSED", "Incident", incident.id, `${incident.incidentCode} verified and closed`);
    pushNotification(io, incident.reportedBy, "Your report has been resolved", `${incident.incidentCode} has been closed after successful repair.`, "success");
    if (io) io.emit("incident:updated", incident);

    res.json({ incident });
  })
);

export default router;
