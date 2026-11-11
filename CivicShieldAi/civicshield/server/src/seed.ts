import "dotenv/config";
import bcrypt from "bcryptjs";
import { resetDb, readDb, writeDb } from "./config/db";
import { newId, incidentCode, assetCode, taskCode } from "./utils/ids";
import { analyzeImage } from "./services/ai.service";
import { calculateRiskScore, classifyRisk } from "./services/risk.service";
import { DB, Incident, InfrastructureAsset, IssueType, MaintenanceTask, Sensor, User, Severity } from "./types";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Demo@1234";

// Realistic Chennai-style civic locations (public landmarks / area names only — no personal data).
const AREAS = [
  { name: "Anna Nagar", lat: 13.0850, lng: 80.2101 },
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341 },
  { name: "Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "Velachery", lat: 12.9791, lng: 80.2213 },
  { name: "Mylapore", lat: 13.0339, lng: 80.2619 },
  { name: "Perambur", lat: 13.1148, lng: 80.2340 },
  { name: "Guindy", lat: 13.0067, lng: 80.2206 },
  { name: "Tambaram", lat: 12.9249, lng: 80.1000 },
  { name: "Porur", lat: 13.0374, lng: 80.1575 },
  { name: "Besant Nagar", lat: 12.9986, lng: 80.2666 },
  { name: "Kilpauk", lat: 13.0778, lng: 80.2412 },
  { name: "Ambattur", lat: 13.1143, lng: 80.1548 },
  { name: "Nungambakkam", lat: 13.0603, lng: 80.2417 },
  { name: "Sholinganallur", lat: 12.9010, lng: 80.2279 },
  { name: "Chromepet", lat: 12.9516, lng: 80.1462 },
];

const ISSUE_TYPES: IssueType[] = [
  "pothole",
  "road_crack",
  "water_leakage",
  "drainage_blockage",
  "waste_overflow",
  "broken_streetlight",
  "flood_risk",
  "damaged_infrastructure",
];

const DEPARTMENTS = ["Road Maintenance", "Sanitation", "Water Board", "Electrical", "Public Works"];

const DESCRIPTIONS: Record<IssueType, string[]> = {
  pothole: ["Large pothole causing traffic slowdown near the main junction.", "Deep pothole formed after recent rain, risky for two-wheelers."],
  road_crack: ["Long crack running across the road surface.", "Surface cracking spreading near the bus stop."],
  water_leakage: ["Continuous water leakage from an underground pipe for two days.", "Pipeline leak flooding the side of the road."],
  drainage_blockage: ["Storm drain blocked with debris, water stagnating.", "Drainage clogged, causing overflow onto the street."],
  waste_overflow: ["Garbage bin overflowing for several days, not collected.", "Waste spilling onto the footpath near the market."],
  broken_streetlight: ["Streetlight has been non-functional for over a week.", "Flickering streetlight, area unsafe at night."],
  flood_risk: ["Low-lying stretch prone to waterlogging during heavy rain.", "Water accumulates quickly here even in moderate rain."],
  damaged_infrastructure: ["Footpath tiles broken and uneven, tripping hazard.", "Public bench and railing damaged near the park."],
  other: ["Civic issue affecting pedestrian safety in this area."],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
}

async function seed() {
  console.log("Seeding CivicShieldAI demo data...");
  resetDb();
  const db: DB = readDb();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- USERS ----------
  const admins: User[] = [
    { id: newId(), name: "Divya Prasad", email: "demo.admin@example.com", phone: "9840012345", passwordHash, role: "admin", createdAt: daysAgo(120) },
    { id: newId(), name: "Karthik Subramaniam", email: "karthik.admin@civicshield.example", phone: "9840012346", passwordHash, role: "admin", createdAt: daysAgo(110) },
    { id: newId(), name: "Meera Iyer", email: "meera.admin@civicshield.example", phone: "9840012347", passwordHash, role: "admin", createdAt: daysAgo(100) },
  ];

  const workerNames = ["Suresh Kumar", "Lakshmi Narayanan", "Arun Prakash", "Priya Dharshini", "Vignesh Raja"];
  const workers: User[] = workerNames.map((name, i) => ({
    id: newId(),
    name,
    email: i === 0 ? "demo.worker@example.com" : `${name.split(" ")[0].toLowerCase()}.worker@civicshield.example`,
    phone: `98400${20000 + i}`,
    passwordHash,
    role: "worker",
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    createdAt: daysAgo(90 - i),
  }));

  const citizenNames = [
    "Ramesh Babu", "Ananya Krishnan", "Vijay Anand", "Deepa Rajan", "Senthil Kumar",
    "Nithya Raman", "Gopal Krishnan", "Kavya Sundar", "Mohan Das", "Sowmya Balaji",
  ];
  const citizens: User[] = citizenNames.map((name, i) => ({
    id: newId(),
    name,
    email: i === 0 ? "demo.citizen@example.com" : `${name.split(" ")[0].toLowerCase()}.citizen@civicshield.example`,
    phone: `98400${30000 + i}`,
    passwordHash,
    role: "citizen",
    createdAt: daysAgo(80 - i),
  }));

  db.users = [...admins, ...workers, ...citizens];

  // ---------- INCIDENTS ----------
  const incidents: Incident[] = [];
  const statuses: Incident["status"][] = [
    "NEW", "AI_ANALYZED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "AI_VERIFIED", "CLOSED",
  ];

  for (let i = 0; i < 30; i++) {
    const area = pick(AREAS);
    const type = pick(ISSUE_TYPES);
    const reporter = pick(citizens);
    const detection = analyzeImage(`seed-${i}`, type);
    const riskScore = calculateRiskScore({
      severity: detection.severity,
      confidence: detection.confidence,
      locationImportance: Math.random(),
      historicalIncidents: randInt(0, 6),
      daysUnresolved: randInt(0, 20),
    });
    const priority = classifyRisk(riskScore);
    const status = pick(statuses);
    const createdAt = daysAgo(randInt(0, 75));
    const isDone = ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(status);
    const worker = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "AI_VERIFIED", "CLOSED"].includes(status) ? pick(workers) : null;

    const incident: Incident = {
      id: newId(),
      incidentCode: incidentCode(i + 1),
      reportedBy: reporter.id,
      type,
      description: pick(DESCRIPTIONS[type] || DESCRIPTIONS.other),
      images: [],
      latitude: area.lat + (Math.random() - 0.5) * 0.02,
      longitude: area.lng + (Math.random() - 0.5) * 0.02,
      address: `${area.name}, Chennai`,
      aiDetection: detection,
      severity: detection.severity,
      riskScore,
      priority,
      status,
      assignedWorker: worker ? worker.id : null,
      department: worker ? worker.department! : null,
      notes: [],
      history: [{ status: "NEW", at: createdAt, by: reporter.name }],
      repairEvidence: null,
      repairVerification: isDone
        ? { passed: true, confidence: 0.9 + Math.random() * 0.09, note: "After-image confirms the reported defect has been resolved." }
        : null,
      createdAt,
      updatedAt: isDone ? daysAgo(randInt(0, 10)) : createdAt,
    };
    incidents.push(incident);
  }
  db.incidents = incidents;

  // ---------- MAINTENANCE TASKS ----------
  const tasks: MaintenanceTask[] = [];
  const assignedIncidents = incidents.filter((i) => i.assignedWorker);
  assignedIncidents.slice(0, 20).forEach((inc, i) => {
    const status: MaintenanceTask["status"] = ["RESOLVED", "AI_VERIFIED", "CLOSED"].includes(inc.status)
      ? "COMPLETED"
      : pick(["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] as const);
    tasks.push({
      id: newId(),
      taskId: taskCode(i + 1),
      incidentId: inc.id,
      workerId: inc.assignedWorker,
      department: inc.department || pick(DEPARTMENTS),
      priority: inc.priority,
      status,
      deadline: daysAgo(-randInt(1, 7)),
      createdAt: inc.createdAt,
      completedAt: status === "COMPLETED" ? inc.updatedAt : null,
    });
  });
  db.tasks = tasks;

  // ---------- INFRASTRUCTURE ASSETS ----------
  const assets: InfrastructureAsset[] = [];
  const assetTypes: InfrastructureAsset["type"][] = ["streetlight", "water_pipeline", "drainage", "waste_bin", "road"];
  const conditions: InfrastructureAsset["condition"][] = ["Good", "Fair", "Warning", "Critical"];
  const prefixMap: Record<InfrastructureAsset["type"], string> = {
    streetlight: "SL",
    water_pipeline: "WP",
    drainage: "DR",
    waste_bin: "WB",
    road: "RD",
  };
  for (let i = 0; i < 15; i++) {
    const type = assetTypes[i % assetTypes.length];
    const condition = pick(conditions);
    const failureProbability =
      condition === "Critical" ? randInt(70, 95) : condition === "Warning" ? randInt(40, 69) : condition === "Fair" ? randInt(15, 39) : randInt(0, 14);
    const area = pick(AREAS);
    assets.push({
      id: newId(),
      assetId: assetCode(prefixMap[type], i + 100),
      type,
      location: { latitude: area.lat + (Math.random() - 0.5) * 0.02, longitude: area.lng + (Math.random() - 0.5) * 0.02, address: `${area.name}, Chennai` },
      condition,
      age: randInt(1, 20),
      previousFailures: randInt(0, 5),
      lastMaintenance: daysAgo(randInt(10, 300)),
      riskScore: failureProbability,
      failureProbability,
      recommendedAction:
        condition === "Critical"
          ? "Maintenance within 3 days"
          : condition === "Warning"
          ? "Schedule maintenance within 2 weeks"
          : "Routine inspection on next cycle",
    });
  }
  db.assets = assets;

  // ---------- SENSORS ----------
  const sensors: Sensor[] = [];
  for (let i = 0; i < 5; i++) {
    const area = pick(AREAS);
    const value = randInt(20, 95);
    sensors.push({
      id: newId(),
      sensorId: `WB-${String(i + 1).padStart(3, "0")}`,
      type: "waste_bin",
      location: { latitude: area.lat, longitude: area.lng, address: `${area.name}, Chennai` },
      value,
      unit: "%",
      status: value >= 85 ? "Critical" : value >= 60 ? "Warning" : "Normal",
      lastUpdated: new Date().toISOString(),
    });
  }
  for (let i = 0; i < 3; i++) {
    const area = pick(AREAS);
    const flow = randInt(90, 160);
    sensors.push({
      id: newId(),
      sensorId: `WF-${String(i + 1).padStart(3, "0")}`,
      type: "water_flow",
      location: { latitude: area.lat, longitude: area.lng, address: `${area.name}, Chennai` },
      value: flow,
      unit: "L/min",
      status: flow >= 130 ? "Critical" : flow >= 115 ? "Warning" : "Normal",
      meta: { normalFlow: 100, pressure: randInt(2, 6), temperature: randInt(24, 32) },
      lastUpdated: new Date().toISOString(),
    });
  }
  for (let i = 0; i < 2; i++) {
    const area = pick(AREAS);
    const risk = randInt(10, 90);
    sensors.push({
      id: newId(),
      sensorId: `FR-${String(i + 1).padStart(3, "0")}`,
      type: "flood",
      location: { latitude: area.lat, longitude: area.lng, address: `${area.name}, Chennai` },
      value: risk,
      unit: "%",
      status: risk >= 80 ? "Critical" : risk >= 50 ? "Warning" : "Normal",
      meta: { rainfallMm: randInt(0, 90), drainageCapacity: randInt(40, 100) },
      lastUpdated: new Date().toISOString(),
    });
  }
  db.sensors = sensors;

  // ---------- NOTIFICATIONS ----------
  db.notifications = incidents.slice(0, 12).map((inc) => ({
    id: newId(),
    userId: "ALL_ADMIN" as const,
    title: inc.priority === "CRITICAL" ? "🚨 Critical infrastructure issue detected" : "New incident reported",
    message: `${inc.incidentCode}: ${inc.type.replace("_", " ")} at ${inc.address} — risk ${inc.riskScore}/100`,
    type: inc.priority === "CRITICAL" ? ("critical" as const) : ("info" as const),
    read: Math.random() > 0.5,
    createdAt: inc.createdAt,
  }));

  // ---------- ACTIVITY LOG ----------
  db.activityLog = incidents.slice(0, 20).flatMap((inc) => {
    const reporter = db.users.find((u) => u.id === inc.reportedBy)!;
    return [
      {
        id: newId(),
        userId: reporter.id,
        userName: reporter.name,
        action: "INCIDENT_REPORTED",
        entity: "Incident",
        entityId: inc.id,
        description: `${reporter.name} reported ${inc.type.replace("_", " ")} (${inc.incidentCode})`,
        timestamp: inc.createdAt,
      },
      {
        id: newId(),
        userId: null,
        userName: "AI Engine",
        action: "AI_DETECTION",
        entity: "Incident",
        entityId: inc.id,
        description: `AI detected ${inc.severity} severity — risk ${inc.riskScore}/100`,
        timestamp: inc.createdAt,
      },
    ];
  });

  writeDb(db);

  console.log("\n  CivicShieldAI demo data seeded successfully.\n");
  console.log("  Demo accounts (password for all: " + DEMO_PASSWORD + ")");
  console.log("  ------------------------------------------------------------");
  console.log("  Citizen : demo.citizen@example.com");
  console.log("  Admin   : demo.admin@example.com");
  console.log("  Worker  : demo.worker@example.com\n");
  console.log(`  Seeded: ${db.users.length} users, ${db.incidents.length} incidents, ${db.assets.length} assets,`);
  console.log(`          ${db.sensors.length} sensors, ${db.tasks.length} tasks, ${db.notifications.length} notifications.\n`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
