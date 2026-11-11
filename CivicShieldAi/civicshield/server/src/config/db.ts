import fs from "fs";
import path from "path";
import { DB } from "../types";

/**
 * CivicShieldAI persistence layer.
 *
 * For the demo/expo build, data is persisted to a JSON file on disk
 * (server/src/data/db.json). This gives real persistence across restarts
 * with zero external setup (no MongoDB install required to try the app).
 *
 * The shape of `DB` mirrors the MongoDB collections documented in
 * /docs/DATABASE.md 1:1, so swapping this module for real Mongoose models
 * later does not require changing any route or service code — only this
 * file's read()/write() implementation.
 */

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const emptyDb: DB = {
  users: [],
  incidents: [],
  assets: [],
  tasks: [],
  sensors: [],
  notifications: [],
  activityLog: [],
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
  }
}

export function readDb(): DB {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DB;
  } catch {
    return { ...emptyDb };
  }
}

export function writeDb(db: DB): void {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function resetDb(): void {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb, null, 2));
}
