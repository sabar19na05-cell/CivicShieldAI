# CivicShieldAI

**AI-Powered Civic Infrastructure Early-Warning, Monitoring and Response Platform**

_"Detect Early. Predict Risk. Protect Communities."_

A full-stack, production-styled web app: citizens report civic issues (potholes, water
leakage, waste overflow, broken streetlights, flood risk, etc.), an AI simulation layer
classifies severity and computes an explainable risk score, admins triage and assign
maintenance crews on a live map and command-center dashboard, and workers close the
loop with AI-verified before/after repair photos — all with real-time updates over
Socket.IO and a simulated IoT sensor network.

---

## 1. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Leaflet |
| Backend | Node.js, Express, TypeScript, Socket.IO |
| Auth | JWT + bcrypt, role-based access (citizen / admin / worker) |
| Database | Zero-setup embedded JSON file store (see `docs/DATABASE.md` for the MongoDB migration path) |
| Real-time | Socket.IO — live notifications, IoT sensor updates, activity feed, task/incident updates |

## 2. Prerequisites

- **Node.js 18+** and npm (check with `node -v`)
- No database installation required — the app ships with a self-contained JSON store.

## 3. Setup (run once)

Open the `civicshield` folder in VS Code, open a terminal (`` Ctrl+` ``), and run:

```bash
# 1. Install dependencies for both server and client
npm run install:all

# 2. Copy the server environment file and (optionally) edit the JWT secret
cp server/.env.example server/.env

# 3. Seed realistic demo data (18 users, 30 incidents, 15 assets, 10 sensors, 20 tasks)
npm run seed
```

## 4. Run the app

From the project root:

```bash
npm run dev
```

This starts **both** the API (port 5000) and the frontend (port 5173) together via
`concurrently`. Open **http://localhost:5173** in your browser.

If you'd rather run them in two separate terminals:

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

## 5. Demo accounts

All demo accounts share the password **`Demo@1234`** (also documented in `server/.env.example` as `DEMO_PASSWORD`).

| Role | Email |
|---|---|
| Citizen | demo.citizen@example.com |
| Admin | demo.admin@example.com |
| Worker | demo.worker@example.com |

The login page also has one-click buttons to fill these in.

## 6. Try the full workflow

1. **Log in as Citizen** → *Report Issue* → pick a category, add a photo, drop a map
   pin (or use "Use my location"), describe it, submit. You'll see the AI's instant
   classification, confidence, severity and risk score.
2. **Log in as Admin** → *Incident Management* shows it sorted by AI priority. Open it
   and assign a worker/department. Check the *Infrastructure Map* and *IoT Monitoring*
   pages — sensors update live every ~6 seconds.
3. **Log in as Worker** → *Assigned Tasks* → open the task, accept/progress it, then
   upload an "after" repair photo. The AI verifies the repair automatically.
4. **Back as Admin** → the incident shows `AI_VERIFIED`; click *Close Incident*.
5. Check the *Analytics* page — resolution rate and monthly trend update immediately.

Everything above is backed by real API calls and file persistence — refreshing the
page or restarting the server does not lose your data (until you re-run `npm run seed`,
which resets it).

## 7. Project structure

```
civicshield/
  server/
    src/
      config/db.ts          JSON-file persistence layer
      middleware/            auth, upload, error handling
      routes/                 REST endpoints
      services/               AI mock engine, risk scoring, IoT simulation, notifications
      socket/                 Socket.IO setup
      seed.ts                 demo data generator
      index.ts                app entrypoint
  client/
    src/
      components/             shared UI (badges, map, notification bell, etc.)
      context/                Auth + Socket React contexts
      layouts/                Public layout, Dashboard layout (sidebar/topbar)
      pages/
        public/                Landing, Login, Register, 404
        citizen/                Dashboard, Report Issue, My Reports, Issue Details, Map
        admin/                  Dashboard, Incidents, Map, AI Center, Predictive Maintenance, IoT, Analytics
        worker/                 Dashboard, Assigned Tasks
      services/api.ts         Axios client + endpoint wrappers
  docs/
    API.md                    Full REST API reference
    DATABASE.md                Schema + MongoDB migration guide
```

## 8. Notes on the AI layer

The AI Computer Vision and repair-verification services (`server/src/services/ai.service.ts`)
are clearly-labeled **simulations**, not trained models — this is called out explicitly
in the code and in the AI Detection Center UI. They're written so the function
signature (image in, structured detection out) is the entire contract the rest of the
app depends on, so a real YOLO/TensorFlow/PyTorch model can be swapped in later without
touching any route or frontend code.

## 9. Troubleshooting

- **Port already in use**: change `PORT` in `server/.env` or the `server.port` in
  `client/vite.config.ts` (keep the proxy target in sync).
- **"Cannot find module" after cloning**: re-run `npm run install:all` from the root.
- **Uploaded images don't show**: the backend serves them from `server/uploads/`,
  auto-created on first upload — make sure the server is running.
- **Want a clean slate**: delete `server/src/data/db.json` and re-run `npm run seed`.
