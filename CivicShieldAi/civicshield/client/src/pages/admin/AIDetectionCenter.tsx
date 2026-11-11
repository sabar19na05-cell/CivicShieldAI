import { useState } from "react";
import { ScanEye, Upload, Loader2, Sparkles } from "lucide-react";
import { AiAPI, apiErrorMessage } from "../../services/api";
import { ErrorBanner } from "../../components/Primitives";
import { SeverityBadge, RiskScorePill, PriorityBadge } from "../../components/Badges";

interface AnalysisResult {
  imageUrl: string;
  detection: {
    issueType: string;
    confidence: number;
    severity: "low" | "moderate" | "high" | "critical";
    riskScore: number;
    recommendedAction: string;
  };
  riskScore: number;
  priority: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export function AIDetectionCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  function onFile(f: File | null) {
    setFile(f);
    setResult(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function analyze() {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await AiAPI.analyzeImage(formData);
      setResult(res.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not analyze this image."));
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold flex items-center gap-2"><ScanEye size={22} className="text-signal" /> AI Detection Center</h1>
        <p className="text-ink-muted text-sm mt-0.5">
          Upload any infrastructure photo to see the computer-vision simulation classify it. This is a labeled
          mock service — see <code className="font-mono text-xs">server/src/services/ai.service.ts</code> for the swap-in path to a real model.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl py-10 cursor-pointer hover:border-signal/50 hover:bg-signal-50/30 transition-colors">
            {preview ? (
              <img src={preview} alt="" className="max-h-48 rounded-lg object-cover" />
            ) : (
              <>
                <Upload size={24} className="text-ink-faint" />
                <span className="text-sm font-medium text-ink-soft">Upload an infrastructure image</span>
                <span className="text-xs text-ink-faint">JPEG, PNG or WEBP</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
          </label>
          <button onClick={analyze} disabled={!file || analyzing} className="btn-primary w-full mt-4">
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {analyzing ? "Analyzing…" : "Run AI Analysis"}
          </button>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold mb-4">AI Analysis</h2>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-ink-faint">
              <ScanEye size={28} className="mb-3" />
              <p className="text-sm">Upload and analyze an image to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Detected Issue</p>
                <p className="text-lg font-display font-semibold capitalize">{result.detection.issueType.replace(/_/g, " ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Confidence</p>
                  <p className="font-mono font-semibold">{(result.detection.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Severity</p>
                  <SeverityBadge severity={result.detection.severity} />
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Estimated Risk</p>
                  <RiskScorePill score={result.riskScore} />
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Priority</p>
                  <PriorityBadge priority={result.priority} />
                </div>
              </div>
              <div className="pt-2 border-t border-line">
                <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Recommended Action</p>
                <p className="text-sm text-ink-soft">{result.detection.recommendedAction}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
