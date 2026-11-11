import { v4 as uuidv4 } from "uuid";

export function newId(): string {
  return uuidv4();
}

export function incidentCode(seq: number): string {
  return `CS${String(1000 + seq)}`;
}

export function assetCode(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(3, "0")}`;
}

export function taskCode(seq: number): string {
  return `TASK-${String(500 + seq)}`;
}
