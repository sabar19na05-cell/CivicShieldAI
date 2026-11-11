import { Server as SocketServer } from "socket.io";
import { readDb, writeDb } from "../config/db";
import { pushNotification, logActivity } from "./notification.service";
import { Sensor } from "../types";

/**
 * IoT Simulation Engine.
 *
 * Periodically nudges every sensor's value up/down within a realistic range
 * and re-derives its status. When a value crosses a critical threshold it
 * raises a notification + activity log entry and broadcasts the update over
 * Socket.IO so connected dashboards, the map, and the notification bell all
 * update live — without a page refresh.
 */

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function statusForSensor(sensor: Sensor): Sensor["status"] {
  if (sensor.type === "waste_bin") {
    if (sensor.value >= 85) return "Critical";
    if (sensor.value >= 60) return "Warning";
    return "Normal";
  }
  if (sensor.type === "water_flow") {
    const normal = Number(sensor.meta?.normalFlow ?? 100);
    const deviation = ((sensor.value - normal) / normal) * 100;
    if (deviation >= 30) return "Critical";
    if (deviation >= 15) return "Warning";
    return "Normal";
  }
  // flood
  if (sensor.value >= 80) return "Critical";
  if (sensor.value >= 50) return "Warning";
  return "Normal";
}

function stepSensor(sensor: Sensor): Sensor {
  const drift = (Math.random() - 0.45) * (sensor.type === "waste_bin" ? 4 : 8);
  let value = sensor.value + drift;

  if (sensor.type === "waste_bin") value = clamp(value, 0, 100);
  if (sensor.type === "water_flow") value = clamp(value, 60, 220);
  if (sensor.type === "flood") value = clamp(value, 0, 100);

  const updated: Sensor = {
    ...sensor,
    value: Number(value.toFixed(1)),
    lastUpdated: new Date().toISOString(),
  };
  updated.status = statusForSensor(updated);
  return updated;
}

export function startSensorSimulation(io: SocketServer) {
  setInterval(() => {
    const db = readDb();
    let anyCritical = false;

    db.sensors = db.sensors.map((s) => {
      const prevStatus = s.status;
      const updated = stepSensor(s);
      if (updated.status === "Critical" && prevStatus !== "Critical") {
        anyCritical = true;
        const label =
          updated.type === "waste_bin"
            ? `Waste bin ${updated.sensorId} is ${updated.value}% full`
            : updated.type === "water_flow"
            ? `Abnormal water flow detected at ${updated.sensorId} (${updated.value} L/min)`
            : `Flood risk elevated near ${updated.sensorId}`;
        pushNotification(
          io,
          "ALL_ADMIN",
          updated.type === "water_flow" ? "💧 Possible water leakage detected" : "🚨 Sensor threshold crossed",
          label,
          "critical"
        );
        logActivity(null, "IoT Engine", "SENSOR_ALERT", "Sensor", updated.sensorId, label);
      }
      return updated;
    });

    writeDb(db);
    io.emit("sensors:update", db.sensors);
    if (anyCritical) {
      io.emit("activity:new", db.activityLog[0]);
    }
  }, 6000);
}
