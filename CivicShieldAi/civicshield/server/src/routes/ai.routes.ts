import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { upload } from "../middleware/upload";
import { analyzeImage, verifyRepair } from "../services/ai.service";
import { calculateRiskScore, classifyRisk } from "../services/risk.service";
import { logActivity } from "../services/notification.service";
import { IssueType } from "../types";

const router = Router();

// POST /api/ai/analyze-image - standalone analysis (AI Detection Center demo tool)
router.post(
  "/analyze-image",
  requireAuth,
  upload.single("image"),
  asyncHandler(async (req: AuthRequest, res) => {
    const file = req.file;
    if (!file) throw new ApiError(400, "Please upload an image to analyze.");
    const hint = (req.body?.issueTypeHint as IssueType) || undefined;

    const detection = analyzeImage(file.filename, hint);
    const riskScore = calculateRiskScore({
      severity: detection.severity,
      confidence: detection.confidence,
      locationImportance: 0.5,
    });

    logActivity(
      req.user!.id,
      req.user!.name,
      "AI_DETECTION_CENTER_RUN",
      "AI",
      file.filename,
      `Ran AI detection on an uploaded image — result: ${detection.issueType}`
    );

    res.json({
      imageUrl: `/uploads/${file.filename}`,
      detection,
      riskScore,
      priority: classifyRisk(riskScore),
    });
  })
);

// POST /api/ai/calculate-risk - recompute a risk score from arbitrary inputs
router.post(
  "/calculate-risk",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { severity, confidence, locationImportance, historicalIncidents, daysUnresolved } = req.body;
    if (!severity || confidence === undefined) {
      throw new ApiError(400, "severity and confidence are required.");
    }
    const riskScore = calculateRiskScore({
      severity,
      confidence,
      locationImportance,
      historicalIncidents,
      daysUnresolved,
    });
    res.json({ riskScore, priority: classifyRisk(riskScore) });
  })
);

// POST /api/ai/verify-repair - standalone before/after repair verification
router.post(
  "/verify-repair",
  requireAuth,
  upload.fields([{ name: "before", maxCount: 1 }, { name: "after", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const before = files?.before?.[0];
    const after = files?.after?.[0];
    if (!before || !after) throw new ApiError(400, "Both before and after images are required.");

    const result = verifyRepair(before.filename, after.filename);
    res.json({
      beforeUrl: `/uploads/${before.filename}`,
      afterUrl: `/uploads/${after.filename}`,
      ...result,
    });
  })
);

export default router;
