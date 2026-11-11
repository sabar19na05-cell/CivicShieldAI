import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
  Construction, Waves, Droplets, Trash2, Lightbulb, CloudRain, HelpCircle,
  Camera, MapPin, LocateFixed, FileText, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X,
} from "lucide-react";
import { IncidentAPI, apiErrorMessage } from "../../services/api";
import { IssueType, Incident, ISSUE_TYPE_LABELS } from "../../types";
import { ErrorBanner } from "../../components/Primitives";
import { SeverityBadge, RiskScorePill } from "../../components/Badges";

const ISSUE_OPTIONS: { type: IssueType; icon: typeof Construction }[] = [
  { type: "pothole", icon: Construction },
  { type: "road_crack", icon: Waves },
  { type: "water_leakage", icon: Droplets },
  { type: "drainage_blockage", icon: Trash2 },
  { type: "waste_overflow", icon: Trash2 },
  { type: "broken_streetlight", icon: Lightbulb },
  { type: "flood_risk", icon: CloudRain },
  { type: "damaged_infrastructure", icon: Construction },
  { type: "other", icon: HelpCircle },
];

const STEPS = ["Issue Type", "Photo", "Location", "Description", "Submit"];
const CHENNAI_CENTER: [number, number] = [13.0418, 80.2341];

function LocationPicker({ position, onPick }: { position: [number, number] | null; onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<IssueType | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Incident | null>(null);
  const [locating, setLocating] = useState(false);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5);
    setImages(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function useMyLocation() {
    setLocating(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser. Please pick a location on the map instead.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setError("Couldn't access your location. Please select a point on the map instead.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  function canProceed() {
    if (step === 0) return !!type;
    if (step === 2) return !!position;
    if (step === 3) return description.trim().length >= 10;
    return true;
  }

  async function submit() {
    if (!type || !position) return;
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("description", description);
      formData.append("latitude", String(position[0]));
      formData.append("longitude", String(position[1]));
      formData.append("address", address || `Pinned location (${position[0].toFixed(4)}, ${position[1].toFixed(4)})`);
      images.forEach((img) => formData.append("images", img));

      const res = await IncidentAPI.create(formData);
      setResult(res.data.incident);
      setStep(4);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your report. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Report a civic issue</h1>
        <p className="text-ink-muted text-sm mt-0.5">Takes about a minute. The AI analyzes your report as soon as you submit.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-1.5">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-signal" : "bg-surface-sunken"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs font-mono text-ink-muted -mt-4">Step {Math.min(step + 1, 4)} of 4 — {STEPS[Math.min(step, 3)]}</p>

      {error && <ErrorBanner message={error} />}

      <div className="card p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="font-display font-semibold mb-1">What's the issue?</h2>
            <p className="text-sm text-ink-muted mb-5">Choose the category that best matches what you're seeing.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ISSUE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setType(opt.type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    type === opt.type ? "border-signal bg-signal-50 shadow-sm" : "border-line hover:border-signal/40"
                  }`}
                >
                  <opt.icon size={20} className={type === opt.type ? "text-signal-dark" : "text-ink-muted"} />
                  <span className="text-xs font-medium">{ISSUE_TYPE_LABELS[opt.type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display font-semibold mb-1">Add a photo</h2>
            <p className="text-sm text-ink-muted mb-5">Photos help the AI classify the issue accurately (optional but recommended).</p>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl py-10 cursor-pointer hover:border-signal/50 hover:bg-signal-50/30 transition-colors">
              <Camera size={24} className="text-ink-faint" />
              <span className="text-sm font-medium text-ink-soft">Click to upload or capture a photo</span>
              <span className="text-xs text-ink-faint">JPEG, PNG or WEBP — up to 5 images</span>
              <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-line group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ink/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display font-semibold mb-1">Where is it?</h2>
            <p className="text-sm text-ink-muted mb-4">Use your current location or click the map to drop a pin.</p>
            <div className="flex gap-2 mb-4">
              <button onClick={useMyLocation} disabled={locating} className="btn-secondary text-sm">
                {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
                Use my location
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-line mb-4" style={{ height: 300 }}>
              <MapContainer center={position || CHENNAI_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <LocationPicker position={position} onPick={setPosition} />
              </MapContainer>
            </div>
            <div>
              <label className="label">Address / landmark (optional)</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Near Anna Nagar 2nd Avenue signal" />
            </div>
            {position && (
              <p className="text-xs text-ink-faint mt-2 font-mono flex items-center gap-1">
                <MapPin size={12} /> {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display font-semibold mb-1">Describe the issue</h2>
            <p className="text-sm text-ink-muted mb-4">A few sentences helps authorities understand the severity.</p>
            <textarea
              className="input min-h-[140px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Large pothole near the bus stop, causing two-wheelers to swerve into traffic..."
            />
            <p className="text-xs text-ink-faint mt-1.5">{description.trim().length}/10 characters minimum</p>
          </div>
        )}

        {step === 4 && result && (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-status-low/10 text-status-low flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-xl font-display font-semibold mb-1">Issue successfully reported</h2>
            <p className="text-sm text-ink-muted mb-6">The AI has already analyzed your report.</p>

            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="card p-4 bg-surface-sunken/50">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Issue ID</p>
                <p className="font-mono font-semibold">{result.incidentCode}</p>
              </div>
              <div className="card p-4 bg-surface-sunken/50">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">AI Detected</p>
                <p className="font-semibold capitalize">{result.aiDetection?.issueType.replace(/_/g, " ")} ({Math.round((result.aiDetection?.confidence || 0) * 100)}%)</p>
              </div>
              <div className="card p-4 bg-surface-sunken/50">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Severity</p>
                <SeverityBadge severity={result.severity} />
              </div>
              <div className="card p-4 bg-surface-sunken/50">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Risk score / priority</p>
                <RiskScorePill score={result.riskScore} />
                <p className="text-xs font-semibold mt-1">{result.priority}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-7">
              <button onClick={() => navigate(`/citizen/reports/${result.id}`)} className="btn-primary">
                <FileText size={16} /> View Full Details
              </button>
              <button onClick={() => navigate("/citizen")} className="btn-secondary">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="flex justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-secondary disabled:opacity-0">
            <ChevronLeft size={16} /> Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={!canProceed() || submitting} className="btn-primary">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Report"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
