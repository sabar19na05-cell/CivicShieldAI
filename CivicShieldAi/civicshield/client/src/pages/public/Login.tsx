import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../services/api";
import { ErrorBanner } from "../../components/Primitives";

const DEMO_ACCOUNTS = [
  { label: "Citizen", email: "demo.citizen@example.com" },
  { label: "Admin", email: "demo.admin@example.com" },
  { label: "Worker", email: "demo.worker@example.com" },
];

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Demo@1234");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate(user.role === "admin" ? "/admin" : user.role === "worker" ? "/worker" : "/citizen");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : u.role === "worker" ? "/worker" : "/citizen");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-surface-sunken/40">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-fadeUp">
          <div className="h-11 w-11 rounded-xl bg-signal-50 text-signal-dark flex items-center justify-center mb-5">
            <LogIn size={20} />
          </div>
          <h1 className="text-2xl font-display font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-6">Log in to continue to CivicShieldAI.</p>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Log In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">Try a demo account</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword("Demo@1234");
                  }}
                  className="btn-secondary text-xs py-2"
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-faint mt-2">Password for all demo accounts: <span className="font-mono">Demo@1234</span></p>
          </div>

          <p className="text-sm text-ink-muted text-center mt-6">
            Don't have an account? <Link to="/register" className="text-signal font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
