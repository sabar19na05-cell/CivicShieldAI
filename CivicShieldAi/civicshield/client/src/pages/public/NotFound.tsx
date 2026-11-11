import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface">
      <div className="h-14 w-14 rounded-2xl bg-signal-50 text-signal-dark flex items-center justify-center mb-5">
        <Compass size={26} />
      </div>
      <h1 className="text-3xl font-display font-semibold mb-2">Page not found</h1>
      <p className="text-ink-muted mb-6 max-w-sm">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary px-5 py-2.5">Back to home</Link>
    </div>
  );
}
