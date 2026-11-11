import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Incident } from "../types";
import { StatusBadge } from "./Badges";

const SEVERITY_COLOR: Record<string, string> = {
  low: "#2E9E5B",
  moderate: "#E0A526",
  high: "#E07A2C",
  critical: "#D6483F",
};

export function MapView({
  incidents,
  center = [13.0418, 80.2341],
  height = "480px",
}: {
  incidents: Incident[];
  center?: [number, number];
  height?: string;
}) {
  return (
    <div className="rounded-xl2 overflow-hidden border border-line" style={{ height }}>
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.latitude, inc.longitude]}
            radius={inc.priority === "CRITICAL" ? 10 : 7}
            pathOptions={{
              color: SEVERITY_COLOR[inc.severity],
              fillColor: SEVERITY_COLOR[inc.severity],
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm space-y-1 min-w-[180px]">
                <p className="font-mono text-xs text-ink-muted">{inc.incidentCode}</p>
                <p className="font-semibold capitalize">{inc.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-ink-muted">{inc.address}</p>
                <p className="text-xs">
                  Risk: <span className="font-semibold">{inc.riskScore}/100</span>
                </p>
                <StatusBadge status={inc.status} />
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
