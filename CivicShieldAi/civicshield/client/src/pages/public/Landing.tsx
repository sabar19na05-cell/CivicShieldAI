import { Link } from "react-router-dom";
import {
  ScanEye, MapPinned, Gauge, Radio, ShieldCheck, ArrowRight, Camera,
  ClipboardCheck, Users, TrendingUp, Droplets, Trash2, Lightbulb,
  Construction, Waves, Bell,
} from "lucide-react";
import { RadarHero } from "../../components/RadarHero";

const STATS = [
  { value: "2,450+", label: "Issues Monitored" },
  { value: "94%", label: "Detection Accuracy" },
  { value: "78%", label: "Faster Response" },
  { value: "1,250+", label: "Infrastructure Points" },
];

const ISSUE_TYPES = [
  { icon: Construction, label: "Potholes" },
  { icon: Waves, label: "Road Cracks" },
  { icon: Droplets, label: "Water Leakage" },
  { icon: Trash2, label: "Drainage Blockage" },
  { icon: Trash2, label: "Waste Overflow" },
  { icon: Lightbulb, label: "Broken Streetlights" },
];

const FEATURES = [
  {
    icon: ScanEye,
    title: "AI Computer Vision",
    body: "Upload a photo and the AI Detection Center classifies the issue, estimates severity and returns a confidence score in seconds.",
  },
  {
    icon: Gauge,
    title: "Civic Risk Score",
    body: "Every report gets an explainable 0–100 risk score built from severity, confidence, location importance and history.",
  },
  {
    icon: Radio,
    title: "IoT Monitoring",
    body: "Simulated waste, water-flow and flood sensors stream live readings over Socket.IO — alerts fire the instant a threshold is crossed.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Maintenance",
    body: "Infrastructure assets are scored for failure probability so crews can act before something breaks, not after.",
  },
  {
    icon: MapPinned,
    title: "Smart Infrastructure Map",
    body: "Every incident and asset plotted live on an interactive map, filterable by severity, type, status and department.",
  },
  {
    icon: ClipboardCheck,
    title: "AI Repair Verification",
    body: "Workers upload after-repair photos; AI compares before/after and either passes the fix or reopens the task automatically.",
  },
];

const STEPS = [
  { title: "Report", body: "A citizen photographs a problem, drops a pin, and submits it in under a minute." },
  { title: "Detect", body: "The AI engine classifies the issue and assigns severity and a confidence score." },
  { title: "Prioritize", body: "The risk engine converts that into an explainable 0–100 score and a priority level." },
  { title: "Assign", body: "Authorities route the incident to the right department and maintenance worker." },
  { title: "Repair & Verify", body: "The worker submits after-photos; AI verifies the fix before the case is closed." },
];

const STACK = ["React", "TypeScript", "Node.js", "Express", "Socket.IO", "Leaflet", "Tailwind CSS", "JWT Auth"];

export function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div className="animate-fadeUp">
          <div className="inline-flex items-center gap-2 rounded-full bg-signal-50 text-signal-dark text-xs font-semibold px-3 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulseDot" />
            AI-Powered Civic Infrastructure Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.08] tracking-tight text-ink">
            Detect early.
            <br />
            Predict risk.
            <br />
            <span className="text-signal">Protect communities.</span>
          </h1>
          <p className="text-ink-muted text-lg mt-6 max-w-lg leading-relaxed">
            CivicShieldAI turns scattered civic complaints into a single intelligent pipeline —
            detect infrastructure problems before they become community emergencies.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link to="/register" className="btn-primary text-[15px] px-5 py-3">
              Report an Issue <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary text-[15px] px-5 py-3">
              Explore Dashboard
            </Link>
            <a href="#how-it-works" className="btn-ghost text-[15px] px-5 py-3">
              See how it works
            </a>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-line max-w-lg">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-xl font-semibold text-ink">{s.value}</p>
                <p className="text-[11px] text-ink-muted mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <RadarHero />
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-status-critical mb-2">The Problem</p>
            <h2 className="text-2xl font-display font-semibold mb-3">Civic reporting is reactive</h2>
            <p className="text-ink-muted leading-relaxed">
              A citizen reports a problem, an official manually inspects it, then maintenance gets assigned —
              days or weeks later. There's no reliable way to tell which of hundreds of open complaints is
              actually dangerous right now.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-signal mb-2">The Solution</p>
            <h2 className="text-2xl font-display font-semibold mb-3">Detect → Predict → Prioritize → Resolve</h2>
            <p className="text-ink-muted leading-relaxed">
              CivicShieldAI scores every report the moment it's filed, keeps watching infrastructure
              through simulated IoT sensors, and automatically routes the most dangerous issues to the
              front of the queue — with an AI-verified close-out loop.
            </p>
          </div>
        </div>
      </section>

      {/* ISSUE TYPES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-semibold text-center mb-2">Built for the problems that actually get reported</h2>
        <p className="text-ink-muted text-center max-w-xl mx-auto mb-10">
          From potholes to flood risk, the AI Detection Center recognizes the everyday categories that make up most civic complaints.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {ISSUE_TYPES.map((t) => (
            <div key={t.label} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-pop transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-signal-50 text-signal-dark flex items-center justify-center">
                <t.icon size={18} />
              </div>
              <p className="text-xs font-medium text-ink-soft">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-surface-sunken/60 border-y border-line">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-display font-semibold text-center mb-2">Everything a smart-city command center needs</h2>
          <p className="text-ink-muted text-center max-w-xl mx-auto mb-10">
            A full pipeline, not a form: AI vision, explainable scoring, live IoT, maps, and analytics.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="h-10 w-10 rounded-lg bg-signal-50 text-signal-dark flex items-center justify-center mb-4">
                  <f.icon size={19} />
                </div>
                <h3 className="font-display font-semibold text-ink mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-semibold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-5 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-full bg-signal text-white font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <div className="hidden md:block h-px flex-1 bg-line" />}
              </div>
              <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          <div>
            <ShieldCheck className="text-signal-light mb-4" size={26} />
            <h3 className="font-display font-semibold mb-2">Safer, faster response</h3>
            <p className="text-white/60 text-sm leading-relaxed">Critical issues surface immediately instead of waiting behind a first-come queue.</p>
          </div>
          <div>
            <Bell className="text-signal-light mb-4" size={26} />
            <h3 className="font-display font-semibold mb-2">Everyone stays informed</h3>
            <p className="text-white/60 text-sm leading-relaxed">Citizens, admins and workers get real-time updates the moment status changes.</p>
          </div>
          <div>
            <Users className="text-signal-light mb-4" size={26} />
            <h3 className="font-display font-semibold mb-2">Built for every role</h3>
            <p className="text-white/60 text-sm leading-relaxed">Purpose-built dashboards for citizens, authorities and maintenance crews.</p>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-muted mb-6">Built with a real production stack</p>
        <div className="flex flex-wrap justify-center gap-3">
          {STACK.map((s) => (
            <span key={s} className="px-3.5 py-1.5 rounded-full border border-line bg-white text-xs font-mono text-ink-soft">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="card p-10 sm:p-14 text-center bg-signal-50/60 border-signal/20">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink mb-3">Ready to see it in action?</h2>
          <p className="text-ink-muted mb-7 max-w-md mx-auto">
            Create a free demo account and file your first report — the AI will analyze it instantly.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3">Get Started <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn-secondary px-6 py-3">I already have an account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
