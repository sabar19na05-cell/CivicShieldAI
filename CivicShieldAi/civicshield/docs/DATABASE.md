# CivicShieldAI — Database Design

## Current setup: zero-install JSON file database

By default the app persists data to `server/src/data/db.json`, generated automatically
the first time the server runs and populated with realistic Chennai-based demo data
by `npm run seed`. This means you can clone the repo and be fully up and running —
including data that survives server restarts — without installing MongoDB.

The read/write logic lives entirely in `server/src/config/db.ts`. Every route talks to
`readDb()` / `writeDb()`, never to the file directly, so this is the *only* file you'd
need to change to move to a real database.

## Migrating to MongoDB (optional, for a production deployment)

The collections below mirror the JSON shape 1:1 (see `server/src/types.ts`), so moving
to Mongoose is a drop-in replacement, not a redesign.

### users
| field | type |
|---|---|
| name | String |
| email | String, unique |
| phone | String |
| passwordHash | String (bcrypt) |
| role | Enum: citizen, admin, worker |
| department | String (workers only) |
| createdAt | Date |

### incidents
| field | type |
|---|---|
| incidentCode | String, unique (e.g. CS1042) |
| reportedBy | ObjectId → users |
| type | Enum (pothole, road_crack, water_leakage, drainage_blockage, waste_overflow, broken_streetlight, flood_risk, damaged_infrastructure, other) |
| description | String |
| images | [String] (file URLs) |
| latitude / longitude / address | Number / Number / String |
| aiDetection | { issueType, confidence, severity, riskScore, recommendedAction } |
| severity | Enum: low, moderate, high, critical |
| riskScore | Number (0–100) |
| priority | Enum: LOW, MODERATE, HIGH, CRITICAL |
| status | Enum: NEW, AI_ANALYZED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, AI_VERIFIED, CLOSED |
| assignedWorker | ObjectId → users, nullable |
| department | String, nullable |
| notes | [{ author, text, at }] |
| history | [{ status, at, by }] |
| repairEvidence | { before: [String], after: [String] }, nullable |
| repairVerification | { passed, confidence, note }, nullable |
| createdAt / updatedAt | Date |

### assets (InfrastructureAsset)
assetId, type (streetlight/water_pipeline/drainage/waste_bin/road), location,
condition (Good/Fair/Warning/Critical), age, previousFailures, lastMaintenance,
riskScore, failureProbability, recommendedAction

### tasks (MaintenanceTask)
taskId, incidentId → incidents, workerId → users, department, priority, status
(ASSIGNED/ACCEPTED/IN_PROGRESS/COMPLETED), deadline, createdAt, completedAt

### sensors
sensorId, type (waste_bin/water_flow/flood), location, value, unit, status
(Normal/Warning/Critical), meta, lastUpdated

### notifications
userId (or "ALL_ADMIN" / "ALL"), title, message, type (info/success/warning/critical),
read, createdAt

### activityLog
userId, userName, action, entity, entityId, description, timestamp

## Steps to switch

1. `npm install mongoose --prefix server`
2. Create Mongoose schemas matching the tables above under `server/src/models/`.
3. Replace the body of `readDb()` / `writeDb()` in `server/src/config/db.ts` with
   Mongoose queries (or refactor each route to call the models directly).
4. Set `USE_MONGO=true` and `MONGO_URI=...` in `server/.env`.

No frontend changes are required — the REST API contract stays identical.
