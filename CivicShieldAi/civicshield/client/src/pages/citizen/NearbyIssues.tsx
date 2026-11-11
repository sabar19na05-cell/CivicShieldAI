import { useEffect, useState } from "react";
import { IncidentAPI } from "../../services/api";
import { Incident } from "../../types";
import { Loader } from "../../components/Primitives";
import { MapView } from "../../components/MapView";

export function NearbyIssues() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);

  useEffect(() => {
    IncidentAPI.list().then((res) => setIncidents(res.data.incidents));
  }, []);

  if (!incidents) return <Loader label="Loading map" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Nearby infrastructure issues</h1>
        <p className="text-ink-muted text-sm mt-0.5">Your reported issues plotted on the civic map.</p>
      </div>
      <div className="card p-2">
        <MapView incidents={incidents} height="600px" />
      </div>
    </div>
  );
}
