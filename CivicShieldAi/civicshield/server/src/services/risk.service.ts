import { Severity } from "../types";

/**
 * Civic Risk Score engine.
 *
 * Produces an explainable 0-100 score from a handful of weighted factors so
 * it can be defended in a demo ("why is this CRITICAL?") rather than being a
 * black box. Real deployments would tune these weights against historical
 * incident/outcome data.
 */
export interface RiskInputs {
  severity: Severity;
  confidence: number; // 0-1
  locationImportance?: number; // 0-1 (e.g. near school/hospital = higher)
  historicalIncidents?: number; // count nearby
  daysUnresolved?: number;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { low: 15, moderate: 40, high: 70, critical: 95 };

export function calculateRiskScore(inputs: RiskInputs): number {
  const severityComponent = SEVERITY_WEIGHT[inputs.severity] * 0.5;
  const confidenceComponent = inputs.confidence * 100 * 0.2;
  const locationComponent = (inputs.locationImportance ?? 0.4) * 100 * 0.15;
  const historyComponent = Math.min(10, (inputs.historicalIncidents ?? 0) * 2) * 0.1;
  const ageComponent = Math.min(10, (inputs.daysUnresolved ?? 0) * 0.5) * 0.05;

  const score = severityComponent + confidenceComponent + locationComponent + historyComponent + ageComponent;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function classifyRisk(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MODERATE";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
}
