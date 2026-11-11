import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../services/api";
import { ErrorBanner } from "../../components/Primitives";
import { Role } from "../../types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", role: "citizen" as Role,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await register(form);
      navigate(u.role === "admin" ? "/admin" : u.role === "worker" ? "/worker" : "/citizen");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-surface-sunken/40">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-fadeUp">
          <div className="h-11 w-11 rounded-xl bg-signal-50 text-signal-dark flex items-center justify-center mb-5">
            <UserPlus size={20} />
          </div>
          <h1 className="text-2xl font-display font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-ink-muted mb-6">Join CivicShieldAI to report and track civic issues.</p>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ananya Krishnan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="98400 12345" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="min 6 characters" />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input className="input" type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="repeat password" />
              </div>
            </div>
            <div>
              <label className="label">I am registering as</label>
              <div className="grid grid-cols-3 gap-2">
                {(["citizen", "admin", "worker"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update("role", r)}
                    className={form.role === r ? "btn-primary text-xs py-2 capitalize" : "btn-secondary text-xs py-2 capitalize"}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink-faint mt-1.5">
                Expo demo note: role selection is open here so judges can test every dashboard. A production deployment would restrict admin/worker signup to invited staff.
              </p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-ink-muted text-center mt-6">
            Already have an account? <Link to="/login" className="text-signal font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
