import { AIDetection, IssueType, Severity } from "../types";

/**
 * Mock AI Computer Vision service.
 *
 * This is a clearly-labelled SIMULATION, not a trained model. It exists so the
 * complete CivicShieldAI workflow (upload -> classify -> score -> prioritize ->
 * assign -> verify) can be demonstrated end-to-end without a GPU or dataset.
 *
 * Swap-in path for a real model:
 *   Replace only the body of `analyzeImage()` below with a call to a
 *   YOLO / TensorFlow / PyTorch / OpenCV inference server (e.g. a Python
 *   FastAPI microservice under /ai). The function signature (filename in,
 *   AIDetection out) is intentionally the entire contract the rest of the
 *   backend depends on, so nothing else needs to change.
 */

const ISSUE_LIBRARY: { type: IssueType; label: string; severityBias: Severity[] }[] = [
  { type: "pothole", label: "Pothole", severityBias: ["moderate", "high", "critical"] },
  { type: "road_crack", label: "Road Crack", severityBias: ["low", "moderate"] },
  { type: "water_leakage", label: "Water Leakage", severityBias: ["moderate", "high"] },
  { type: "drainage_blockage", label: "Drainage Blockage", severityBias: ["moderate", "high"] },
  { type: "waste_overflow", label: "Waste Overflow", severityBias: ["low", "moderate", "high"] },
  { type: "broken_streetlight", label: "Broken Streetlight", severityBias: ["low", "moderate"] },
  { type: "damaged_infrastructure", label: "Damaged Infrastructure", severityBias: ["moderate", "high", "critical"] },
];

const ACTIONS: Record<Severity, string> = {
  low: "Log for routine inspection during the next maintenance cycle.",
  moderate: "Schedule inspection within 7 days.",
  high: "Dispatch inspection team within 48 hours.",
  critical: "Immediate inspection and emergency response required.",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededFromString(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Analyze an uploaded infrastructure image (identified by filename/hint) and
 * return a simulated but internally-consistent detection result.
 *
 * If `issueTypeHint` is provided (citizen already selected a category in the
 * report form), the simulation stays consistent with that category so the
 * demo always feels coherent rather than random.
 */
export function analyzeImage(fileNameOrHint: string, issueTypeHint?: IssueType): AIDetection {
  const seed = seededFromString(fileNameOrHint + Date.now().toString().slice(-4));
  const entry =
    ISSUE_LIBRARY.find((i) => i.type === issueTypeHint) || ISSUE_LIBRARY[seed % ISSUE_LIBRARY.length];

  const severity = pick(entry.severityBias);
  const baseConfidence = 82 + (seed % 15); // 82 - 96
  const confidence = Math.min(99, baseConfidence) / 100;

  const severityFloor: Record<Severity, number> = { low: 5, moderate: 30, high: 55, critical: 78 };
  const severityCeiling: Record<Severity, number> = { low: 29, moderate: 54, high: 82, critical: 100 };
  const riskScore = Math.round(
    severityFloor[severity] + (seed % (severityCeiling[severity] - severityFloor[severity] + 1))
  );

  return {
    issueType: entry.type,
    confidence: Number(confidence.toFixed(3)),
    severity,
    riskScore,
    recommendedAction: ACTIONS[severity],
  };
}

/**
 * Compare a "before" and "after" repair image and decide whether the repair
 * passed. Simulated, but biased so that most repairs pass — mirroring a
 * reasonably competent maintenance crew — while still occasionally failing
 * so the "reopen" workflow can be demonstrated.
 */
export function verifyRepair(beforeHint: string, afterHint: string) {
  const seed = seededFromString(beforeHint + afterHint);
  const passed = seed % 10 !== 0; // ~90% pass rate
  const confidence = passed ? 88 + (seed % 11) : 55 + (seed % 20);
  return {
    passed,
    confidence: Number((confidence / 100).toFixed(3)),
    note: passed
      ? "After-image shows the reported defect has been resolved and surface/structure matches surrounding infrastructure."
      : "After-image still shows signs of the original defect. Recommend re-inspection before closing.",
  };
}
