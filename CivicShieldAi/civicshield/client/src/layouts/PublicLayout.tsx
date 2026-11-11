import { Link, Outlet, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-signal flex items-center justify-center text-white">
        <Shield size={size * 0.6} strokeWidth={2.4} />
      </div>
      <span className="font-display font-semibold text-[17px] text-ink tracking-tight">
        CivicShield<span className="text-signal">AI</span>
      </span>
    </div>
  );
}

export function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const homePath = user ? (user.role === "admin" ? "/admin" : user.role === "worker" ? "/worker" : "/citizen") : "/login";

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-30 backdrop-blur bg-surface/85 border-b border-line">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-soft">
            <a href="/#features" className="hover:text-signal transition-colors">Features</a>
            <a href="/#how-it-works" className="hover:text-signal transition-colors">How it works</a>
            <a href="/#contact" className="hover:text-signal transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <button className="btn-primary" onClick={() => navigate(homePath)}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer id="contact" className="border-t border-line bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Logo />
            <p className="text-sm text-ink-muted mt-3 max-w-xs">
              AI-powered civic infrastructure early-warning, monitoring and response platform for smarter, safer cities.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li><a href="/#features" className="hover:text-signal">Features</a></li>
              <li><a href="/#how-it-works" className="hover:text-signal">How it works</a></li>
              <li><Link to="/register" className="hover:text-signal">Report an issue</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>civic-support@civicshield.example</li>
              <li>Chennai Civic Innovation Cell</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-ink-faint">
          © {new Date().getFullYear()} CivicShieldAI. Demo/prototype build — not affiliated with any government body.
        </div>
      </footer>
    </div>
  );
}
