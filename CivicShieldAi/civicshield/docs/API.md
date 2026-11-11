# CivicShieldAI — API Reference

Base URL (dev): `http://localhost:5000/api`
All endpoints except `/auth/register` and `/auth/login` require an `Authorization: Bearer <token>` header.

## Auth
| Method | Path | Role | Description |
|---|---|---|---|
| POST | /auth/register | public | Create an account (name, email, phone, password, confirmPassword, role) |
| POST | /auth/login | public | Returns `{ token, user }` |
| GET | /auth/me | any | Current user profile |

## Incidents
| Method | Path | Role | Description |
|---|---|---|---|
| GET | /incidents | any | List incidents (citizens see their own, workers see assigned, admins see all). Query: type, severity, status, department, q |
| GET | /incidents/:id | any | Single incident |
| POST | /incidents | citizen | multipart/form-data: type, description, latitude, longitude, address, images[] — runs AI analysis + risk scoring immediately |
| PUT | /incidents/:id | admin | Update status / department / add a note |
| POST | /incidents/:id/assign | admin | Assign a worker + department, creates a MaintenanceTask |
| POST | /incidents/:id/repair-evidence | worker | multipart/form-data: images[] — runs AI repair verification |
| PUT | /incidents/:id/close | admin | Close a verified/resolved incident |
| DELETE | /incidents/:id | admin | Remove an incident |

## AI (standalone demo tools)
| Method | Path | Description |
|---|---|---|
| POST | /ai/analyze-image | multipart: image, optional issueTypeHint — used by the AI Detection Center |
| POST | /ai/calculate-risk | JSON: severity, confidence, locationImportance?, historicalIncidents?, daysUnresolved? |
| POST | /ai/verify-repair | multipart: before, after — standalone before/after verification |

## Sensors
| Method | Path | Description |
|---|---|---|
| GET | /sensors | List all sensors (optional `type` query) |
| POST | /sensors/simulate | Force an immediate simulation tick |

## Maintenance
| Method | Path | Role |
|---|---|---|
| GET | /maintenance/tasks | any (scoped) |
| PUT | /maintenance/tasks/:id | worker/admin — update status |
| GET | /maintenance/assets | any — infrastructure assets sorted by failure probability |
| GET | /maintenance/workers | admin — list of worker accounts |

## Analytics
| Method | Path |
|---|---|
| GET | /analytics/dashboard | KPIs, category/severity/department breakdowns, 6-month trend, recent activity |
| GET | /analytics/performance | Per-worker assigned/completed/completion rate |

## Notifications
| Method | Path |
|---|---|
| GET | /notifications | Current user's notifications |
| PUT | /notifications/:id/read | Mark one as read |
| PUT | /notifications/read-all | Mark all as read |

## Users
| Method | Path | Role |
|---|---|---|
| GET | /users | admin — optional `role` filter |
| GET | /users/:id | any |

## Real-time (Socket.IO)
Client connects, then emits `auth` with the JWT so the server can join it to
`user:<id>` and `role:<role>` rooms. Server emits:
- `notification` — a new Notification for this user/role
- `sensors:update` — full sensor array, every ~6s
- `activity:new` — a new ActivityLog entry
- `incident:new` / `incident:updated`
- `task:new` / `task:updated`
