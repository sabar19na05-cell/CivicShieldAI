/**
 * Signature element: an animated "detection sweep" — concentric rings pulse
 * outward from a civic pin the way a sonar/radar reading would, standing in
 * for the platform's core idea (continuously scanning infrastructure for
 * risk before it becomes an emergency). Used once, prominently, in the hero.
 */
export function RadarHero() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#EAF6F7" />
            <stop offset="100%" stopColor="#F5F7FA" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#mapBg)" />
        {/* faint grid lines to suggest a map/GIS surface */}
        {[80, 140, 200, 260, 320].map((v) => (
          <line key={`h${v}`} x1="20" y1={v} x2="380" y2={v} stroke="#0B2545" strokeOpacity="0.04" />
        ))}
        {[80, 140, 200, 260, 320].map((v) => (
          <line key={`v${v}`} x1={v} y1="20" x2={v} y2="380" stroke="#0B2545" strokeOpacity="0.04" />
        ))}

        {/* secondary detected points */}
        <circle cx="120" cy="150" r="5" fill="#E0A526" />
        <circle cx="290" cy="120" r="4" fill="#2E9E5B" />
        <circle cx="300" cy="270" r="5" fill="#D6483F" />
        <circle cx="110" cy="280" r="4" fill="#2E9E5B" />

        {/* sweep rings */}
        <circle cx="200" cy="200" r="40" fill="none" stroke="#0E7C86" strokeWidth="2" className="origin-center animate-sweep" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        <circle cx="200" cy="200" r="40" fill="none" stroke="#0E7C86" strokeWidth="2" className="origin-center animate-sweep" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: "0.9s" }} />
        <circle cx="200" cy="200" r="40" fill="none" stroke="#0E7C86" strokeWidth="2" className="origin-center animate-sweep" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: "1.8s" }} />

        {/* central civic pin */}
        <circle cx="200" cy="200" r="34" fill="#0E7C86" />
        <path
          d="M200 178 L216 187 L216 200 C216 212 209 220 200 224 C191 220 184 212 184 200 L184 187 Z"
          fill="white"
          opacity="0.95"
        />
        <circle cx="200" cy="200" r="7" fill="#0E7C86" className="animate-pulseDot" />
      </svg>

      <div className="absolute top-4 left-4 card px-3 py-2 shadow-pop animate-fadeUp" style={{ animationDelay: "0.3s" }}>
        <p className="text-[10px] font-mono text-ink-muted uppercase tracking-wide">CS1042</p>
        <p className="text-xs font-semibold text-status-critical">Critical · Pothole</p>
      </div>
      <div className="absolute bottom-6 right-2 card px-3 py-2 shadow-pop animate-fadeUp" style={{ animationDelay: "0.6s" }}>
        <p className="text-[10px] font-mono text-ink-muted uppercase tracking-wide">Risk Score</p>
        <p className="text-xs font-semibold text-signal-dark">87 / 100</p>
      </div>
    </div>
  );
}
