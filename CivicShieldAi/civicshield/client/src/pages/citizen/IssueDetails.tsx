import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Calendar, User as UserIcon, Camera, Loader2, UserCog, CheckCircle2,
  XCircle, ClipboardList, ArrowLeft,
} from "lucide-react";
import { IncidentAPI, MaintenanceAPI, apiErrorMessage } from "../../services/api";
import { Incident, ISSUE_TYPE_LABELS } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Loader, ErrorBanner } from "../../components/Primitives";
import { SeverityBadge, StatusBadge, RiskScorePill, PriorityBadge } from "../../components/Badges";
import { MapView } from "../../components/MapView";

const DEPARTMENTS = ["Road Maintenance", "Sanitation", "Water Board", "Electrical", "Public Works"];

export function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [workers, setWorkers] = useState<{ id: string; name: string; department?: string }[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [assigning, setAssigning] = useState(false);

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing] = useState(false);

  async function load() {
    if (!id) return;
    try {
      const res = await IncidentAPI.get(id);
      setIncident(res.data.incident);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load this report."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (user?.role === "admin") {
      MaintenanceAPI.workers().then((res) => setWorkers(res.data.workers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAssign() {
    if (!id || !selectedWorker) return;
    setAssigning(true);
    setError("");
    try {
      const res = await IncidentAPI.assign(id, { workerId: selectedWorker, department: selectedDept });
      setIncident(res.data.incident);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not assign a worker."));
    } finally {
      setAssigning(false);
    }
  }

  async function handleUploadEvidence() {
    if (!id || evidenceFiles.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      evidenceFiles.forEach((f) => formData.append("images", f));
      const res = await IncidentAPI.uploadRepairEvidence(id, formData);
      setIncident(res.data.incident);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not upload repair evidence."));
    } finally {
      setUploading(false);
    }
  }

  async function handleClose() {
    if (!id) return;
    setClosing(true);
    try {
      const res = await IncidentAPI.close(id);
      setIncident(res.data.incident);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not close this incident."));
    } finally {
      setClosing(false);
    }
  }

  if (loading) return <Loader label="Loading report" />;
  if (error && !incident) return <ErrorBanner message={error} />;
  if (!incident) return null;

  const backPath = user?.role === "admin" ? "/admin/incidents" : user?.role === "worker" ? "/worker/tasks" : "/citizen/my-reports";
  const isMyWorkerTask = user?.role === "worker" && incident.assignedWorker === user.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to={backPath} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-signal">
        <ArrowLeft size={15} /> Back
      </Link>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-ink-muted">{incident.incidentCode}</span>
            <StatusBadge status={incident.status} />
          </div>
          <h1 className="text-2xl font-display font-semibold capitalize">{ISSUE_TYPE_LABELS[incident.type]}</h1>
          <p className="text-ink-muted text-sm mt-1 flex items-center gap-1.5"><MapPin size={14} /> {incident.address}</p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={incident.severity} />
          <PriorityBadge priority={incident.priority} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-display font-semibold mb-2">Description</h2>
            <p className="text-sm text-ink-soft leading-relaxed">{incident.description}</p>
          </div>

          {incident.images.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2"><Camera size={16} /> Reported photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {incident.images.map((img) => (
                  <img key={img} src={img} alt="" className="rounded-lg border border-line aspect-square object-cover" />
                ))}
              </div>
            </div>
          )}

          {incident.aiDetection && (
            <div className="card p-5 bg-signal-50/40 border-signal/20">
              <h2 className="font-display font-semibold mb-3">AI Analysis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-1">Detected</p>
                  <p className="font-semibold capitalize">{incident.aiDetection.issueType.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-1">Confidence</p>
                  <p className="font-semibold font-mono">{Math.round(incident.aiDetection.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-1">Risk score</p>
                  <RiskScorePill score={incident.riskScore} />
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-1">Recommended action</p>
                  <p className="text-xs">{incident.aiDetection.recommendedAction}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h2 className="font-display font-semibold mb-3">Location</h2>
            <MapView incidents={[incident]} center={[incident.latitude, incident.longitude]} height="280px" />
          </div>

          {incident.repairEvidence && (
            <div className="card p-5">
              <h2 className="font-display font-semibold mb-3">Repair evidence</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-2">Before</p>
                  <div className="grid grid-cols-2 gap-2">
                    {incident.repairEvidence.before.map((img) => <img key={img} src={img} className="rounded-lg border border-line aspect-square object-cover" />)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase mb-2">After</p>
                  <div className="grid grid-cols-2 gap-2">
                    {incident.repairEvidence.after.map((img) => <img key={img} src={img} className="rounded-lg border border-line aspect-square object-cover" />)}
                  </div>
                </div>
              </div>
              {incident.repairVerification && (
                <div className={`mt-4 p-3.5 rounded-lg flex items-start gap-3 ${incident.repairVerification.passed ? "bg-status-low/10" : "bg-status-critical/10"}`}>
                  {incident.repairVerification.passed ? <CheckCircle2 size={18} className="text-status-low mt-0.5" /> : <XCircle size={18} className="text-status-critical mt-0.5" />}
                  <div>
                    <p className={`text-sm font-semibold ${incident.repairVerification.passed ? "text-status-low" : "text-status-critical"}`}>
                      Repair Verification: {incident.repairVerification.passed ? "PASSED" : "FAILED"} ({Math.round(incident.repairVerification.confidence * 100)}%)
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">{incident.repairVerification.note}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2"><ClipboardList size={16} /> Timeline</h2>
            <ol className="relative border-l border-line ml-2 space-y-4">
              {incident.history.map((h, i) => (
                <li key={i} className="ml-4">
                  <div className="absolute -ml-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-signal" />
                  <p className="text-sm font-medium">{h.status.replace(/_/g, " ")}</p>
                  <p className="text-xs text-ink-muted">{new Date(h.at).toLocaleString()} · {h.by}</p>
                </li>
              ))}
            </ol>
          </div>

          {user?.role === "admin" && !incident.assignedWorker && (
            <div className="card p-5">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2"><UserCog size={16} /> Assign worker</h2>
              <div className="space-y-3">
                <select className="input" value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
                  <option value="">Select a worker</option>
                  {workers.map((w) => <option key={w.id} value={w.id}>{w.name} — {w.department}</option>)}
                </select>
                <select className="input" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={handleAssign} disabled={!selectedWorker || assigning} className="btn-primary w-full">
                  {assigning ? <Loader2 size={15} className="animate-spin" /> : "Assign Worker"}
                </button>
              </div>
            </div>
          )}

          {user?.role === "admin" && incident.assignedWorker && (
            <div className="card p-5">
              <h2 className="font-display font-semibold mb-2 flex items-center gap-2"><UserIcon size={16} /> Assigned to</h2>
              <p className="text-sm">{incident.department}</p>
              {["AI_VERIFIED", "RESOLVED"].includes(incident.status) && (
                <button onClick={handleClose} disabled={closing} className="btn-primary w-full mt-3">
                  {closing ? <Loader2 size={15} className="animate-spin" /> : "Close Incident"}
                </button>
              )}
            </div>
          )}

          {isMyWorkerTask && !incident.repairEvidence && (
            <div className="card p-5">
              <h2 className="font-display font-semibold mb-2">Upload repair evidence</h2>
              <p className="text-xs text-ink-muted mb-3">Upload an after-repair photo. AI will verify it automatically.</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setEvidenceFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="text-xs mb-3"
              />
              <button onClick={handleUploadEvidence} disabled={evidenceFiles.length === 0 || uploading} className="btn-primary w-full">
                {uploading ? <Loader2 size={15} className="animate-spin" /> : "Submit & Verify"}
              </button>
            </div>
          )}

          <div className="card p-5">
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2"><Calendar size={16} /> Reported</h2>
            <p className="text-sm text-ink-soft">{new Date(incident.createdAt).toLocaleString()}</p>
            <p className="text-xs text-ink-muted mt-1">Last updated {new Date(incident.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
