export type Role = "citizen" | "admin" | "worker";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  department?: string;
  profileImage?: string;
  createdAt: string;
}

export type IssueType =
  | "pothole"
  | "road_crack"
  | "water_leakage"
  | "drainage_blockage"
  | "waste_overflow"
  | "broken_streetlight"
  | "flood_risk"
  | "damaged_infrastructure"
  | "other";

export type Severity = "low" | "moderate" | "high" | "critical";

export type IncidentStatus =
  | "NEW"
  | "AI_ANALYZED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "AI_VERIFIED"
  | "CLOSED";

export interface AIDetection {
  issueType: IssueType;
  confidence: number;
  severity: Severity;
  riskScore: number;
  recommendedAction: string;
}

export interface Incident {
  id: string;
  incidentCode: string;
  reportedBy: string;
  type: IssueType;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
  address: string;
  aiDetection: AIDetection | null;
  severity: Severity;
  riskScore: number;
  priority: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  status: IncidentStatus;
  assignedWorker: string | null;
  department: string | null;
  notes: { author: string; text: string; at: string }[];
  history: { status: IncidentStatus; at: string; by: string }[];
  repairEvidence: { before: string[]; after: string[] } | null;
  repairVerification: { passed: boolean; confidence: number; note: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructureAsset {
  id: string;
  assetId: string;
  type: "streetlight" | "water_pipeline" | "drainage" | "waste_bin" | "road";
  location: { latitude: number; longitude: number; address: string };
  condition: "Good" | "Fair" | "Warning" | "Critical";
  age: number;
  previousFailures: number;
  lastMaintenance: string;
  riskScore: number;
  failureProbability: number;
  recommendedAction: string;
}

export interface MaintenanceTask {
  id: string;
  taskId: string;
  incidentId: string;
  workerId: string | null;
  department: string;
  priority: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  status: "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
  deadline: string;
  createdAt: string;
  completedAt: string | null;
}

export interface Sensor {
  id: string;
  sensorId: string;
  type: "waste_bin" | "water_flow" | "flood";
  location: { latitude: number; longitude: number; address: string };
  value: number;
  unit: string;
  status: "Normal" | "Warning" | "Critical";
  meta?: Record<string, number | string>;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  userId: string | "ALL_ADMIN" | "ALL";
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical";
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface DB {
  users: User[];
  incidents: Incident[];
  assets: InfrastructureAsset[];
  tasks: MaintenanceTask[];
  sensors: Sensor[];
  notifications: Notification[];
  activityLog: ActivityLog[];
}
