import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CYCLE_WORDS = ["Japan.", "most of Europe.", "the UK.", "France.", "Germany."];

const FEATURES = [
  {
    title: "True Size Map",
    desc: "Drag any two countries onto the same canvas and see them at actual scale — no Mercator inflation.",
    icon: MapIcon,
    color: "#7c3aed",
  },
  {
    title: "Ranked Quiz",
    desc: "Capitals, borders, flags. Ten questions, a clock, and a score that doesn't lie to you.",
    icon: QuizIcon,
    color: "#38bdf8",
  },
  {
    title: "Live PvP",
    desc: "Real-time head-to-head matches over WebSocket. Same questions, same clock, one winner.",
    icon: MultiIcon,
    color: "#f472b6",
  },
  {
    title: "ELO Leaderboard",
    desc: "Every match moves your rating. Track accuracy and speed separately from raw rank.",
    icon: TrophyIcon,
    color: "#22d3ee",
  },
];

const STATS = [
  { label: "Players", value: "2.4k+" },
  { label: "Countries", value: "195" },
  { label: "Live PvP", value: "Active" },
];

function MapIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function QuizIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function MultiIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function TrophyIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="8 22 12 17 16 22" />
      <path d="M6 2h12v6a6 6 0 0 1-12 0V2z" />
      <path d="M6 7H4a2 2 0 0 0 0 4h2" />
      <path d="M18 7h2a2 2 0 0 0 0-4h-2" />
      <line x1="12" y1="17" x2="12" y2="13" />
    </svg>
  );
}
function ArrowIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Typewriter cycling through countries that fit inside Africa at true scale
function useTypewriter(words, { typeSpeed = 55, deleteSpeed = 28, pause = 1500 } = {}) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    let timeout;

    if (!deleting && sub === current) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && sub === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setSub((s) => current.slice(0, deleting ? s.length - 1 : s.length + 1));
      }, deleting ? deleteSpeed : typeSpeed);
    }
    return () => clearTimeout(timeout);
  }, [sub, deleting, index, words, typeSpeed, deleteSpeed, pause]);

  return sub;
}

// Signature hero visual: a big blob ("Africa") with a small blob ("Greenland")
// tiled across it to show the true-size relationship, plus a count-up "14x".
function TrueSizeMockup() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 1300;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(p * 14));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 6 });
  }
  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const tiles = [
    { x: 90, y: 40, s: 0.82, r: -8 },
    { x: 150, y: 95, s: 0.7, r: 12 },
    { x: 70, y: 150, s: 0.9, r: 4 },
    { x: 165, y: 200, s: 0.66, r: -14 },
    { x: 100, y: 250, s: 0.78, r: 18 },
    { x: 60, y: 300, s: 0.6, r: -6 },
  ];

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="gs-mockup"
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className="gs-mockup-chip">
        <span className="gs-dot-live" /> True Size Of
      </div>

      <svg viewBox="0 0 300 360" width="100%" height="100%" style={{ maxHeight: 320 }}>
        <defs>
          <linearGradient id="gsAfricaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        <path
          d="M150,10 C210,8 250,40 260,90 C270,140 250,160 260,200 C272,245 240,270 230,310 C220,345 190,355 165,352 C140,349 130,320 115,300 C95,275 70,260 60,225 C48,185 55,150 45,115 C35,78 55,40 90,22 C112,10 130,12 150,10 Z"
          fill="url(#gsAfricaGrad)"
          opacity="0.9"
        />

        {tiles.map((t, i) => (
          <path
            key={i}
            className="gs-tile"
            style={{ animationDelay: `${0.4 + i * 0.18}s` }}
            d="M60,5 C85,2 105,15 112,35 C118,55 108,72 90,80 C70,88 45,85 28,75 C10,65 2,45 8,28 C14,12 38,8 60,5 Z"
            transform={`translate(${t.x} ${t.y}) scale(${t.s}) rotate(${t.r})`}
            fill="#0a0a18"
            fillOpacity="0.35"
            stroke="#f9fafb"
            strokeOpacity="0.55"
            strokeWidth="1.4"
          />
        ))}
      </svg>

      <div className="gs-mockup-caption">
        <div className="gs-mockup-count">{count}&times;</div>
        <div className="gs-mockup-label">Greenland fits inside Africa {count} times.<br />Most maps don't show that.</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const cycling = useTypewriter(CYCLE_WORDS);

  return (
    <div className="gs-landing">
      <style>{`
        .gs-landing {
          min-height: 100vh;
          background: radial-gradient(ellipse 900px 600px at 12% -10%, rgba(124,58,237,0.35), transparent 60%),
                      radial-gradient(ellipse 800px 600px at 90% 20%, rgba(56,189,248,0.18), transparent 55%),
                      #0a0a18;
          color: #f3f4f6;
          font-family: "DM Sans", sans-serif;
          overflow-x: hidden;
          position: relative;
        }
        .gs-corner-dot {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          animation: gsFloat 9s ease-in-out infinite;
        }
        @keyframes gsFloat {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(14px,-18px); }
        }
        .gs-nav {
          position: sticky; top: 0; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px clamp(20px, 5vw, 64px);
          backdrop-filter: blur(10px);
          background: rgba(10,10,24,0.55);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .gs-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; border: none; border-radius: 10px;
          font-family: "DM Sans", sans-serif; font-weight: 600; font-size: 14px;
          padding: 11px 22px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }
        .gs-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }
        .gs-btn-primary:active { transform: translateY(0); }
        .gs-btn-ghost {
          background: transparent; color: #e5e7eb;
          border: 1px solid rgba(255,255,255,0.16); border-radius: 10px;
          font-family: "DM Sans", sans-serif; font-weight: 600; font-size: 14px;
          padding: 10px 20px; cursor: pointer; transition: all 0.15s ease;
        }
        .gs-btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); }
        .gs-hero {
          display: flex; align-items: center; gap: 56px;
          padding: clamp(40px, 8vw, 96px) clamp(20px, 5vw, 64px) 60px;
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
        }
        .gs-hero-copy { flex: 1.05; min-width: 0; }
        .gs-hero-visual { flex: 0.95; display: flex; justify-content: center; min-width: 0; }
        .gs-eyebrow {
          font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase; color: #a78bfa;
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px;
        }
        .gs-eyebrow::before {
          content: ""; width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.2);
        }
        .gs-h1 {
          font-family: "Sora", sans-serif; font-weight: 800;
          font-size: clamp(32px, 4.4vw, 52px); line-height: 1.12; letter-spacing: -0.01em;
          margin: 0 0 22px; color: #ffffff;
        }
        .gs-h1 .gs-accent {
          background: linear-gradient(90deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .gs-cursor {
          display: inline-block; width: 3px; height: 0.85em; background: #38bdf8;
          margin-left: 2px; vertical-align: -0.05em; animation: gsBlink 1s step-end infinite;
        }
        @keyframes gsBlink { 50% { opacity: 0; } }
        .gs-sub {
          font-size: clamp(14px, 1.6vw, 16.5px); line-height: 1.65; color: #9ca3af;
          max-width: 480px; margin: 0 0 32px;
        }
        .gs-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
        .gs-stats-strip { display: flex; gap: 28px; flex-wrap: wrap; }
        .gs-stat .gs-stat-value {
          font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 20px; color: #f9fafb;
        }
        .gs-stat .gs-stat-label { font-size: 11.5px; color: #6b7280; margin-top: 2px; }
        .gs-mockup {
          position: relative; width: min(340px, 100%); aspect-ratio: 5/6;
          background: linear-gradient(165deg, rgba(124,58,237,0.12), rgba(56,189,248,0.06));
          border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
          padding: 22px 22px 18px; box-shadow: 0 30px 80px rgba(0,0,0,0.45);
          transition: transform 0.12s ease-out;
        }
        .gs-mockup-chip {
          align-self: flex-start; font-family: "JetBrains Mono", monospace; font-size: 11px;
          color: #c4b5fd; background: rgba(124,58,237,0.18); border: 1px solid rgba(124,58,237,0.35);
          padding: 5px 10px; border-radius: 999px; margin-bottom: 6px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .gs-dot-live { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
        .gs-tile { opacity: 0; animation: gsTileIn 0.6s ease forwards; }
        @keyframes gsTileIn { from { opacity: 0; transform-origin: center; } to { opacity: 1; } }
        .gs-mockup-caption { text-align: center; margin-top: 4px; }
        .gs-mockup-count {
          font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 30px;
          background: linear-gradient(90deg, #f472b6, #38bdf8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .gs-mockup-label { font-size: 11.5px; color: #9ca3af; line-height: 1.5; margin-top: 2px; }
        .gs-section { max-width: 1280px; margin: 0 auto; padding: 30px clamp(20px, 5vw, 64px) 0; position: relative; z-index: 1; }
        .gs-section-label {
          font-family: "JetBrains Mono", monospace; font-size: 11.5px; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase; color: #6b7280; margin-bottom: 10px;
        }
        .gs-section-title { font-family: "Sora", sans-serif; font-weight: 700; font-size: 26px; color: #f9fafb; margin: 0 0 36px; }
        .gs-feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 80px; }
        .gs-feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 22px; transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .gs-feature-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .gs-feature-icon {
          width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .gs-feature-title { font-family: "Sora", sans-serif; font-weight: 700; font-size: 15px; color: #f3f4f6; margin: 0 0 8px; }
        .gs-feature-desc { font-size: 13px; color: #8b8fa3; line-height: 1.55; margin: 0; }
        .gs-cta-band {
          max-width: 1280px; margin: 0 auto 70px; padding: 0 clamp(20px, 5vw, 64px);
          position: relative; z-index: 1;
        }
        .gs-cta-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(56,189,248,0.08));
          border: 1px solid rgba(124,58,237,0.3); border-radius: 24px;
          padding: 44px clamp(24px, 5vw, 56px); text-align: center;
        }
        .gs-cta-card h3 { font-family: "Sora", sans-serif; font-weight: 800; font-size: 26px; color: #fff; margin: 0 0 10px; }
        .gs-cta-card p { color: #a5a9bd; font-size: 14px; margin: 0 0 26px; }
        .gs-footer {
          border-top: 1px solid rgba(255,255,255,0.06); padding: 26px clamp(20px, 5vw, 64px);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
          color: #6b7280; font-size: 12.5px; position: relative; z-index: 1;
        }
        @media (max-width: 880px) {
          .gs-hero { flex-direction: column; }
          .gs-hero-copy { order: 2; }
          .gs-hero-visual { order: 1; }
          .gs-feature-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .gs-feature-grid { grid-template-columns: 1fr; }
          .gs-nav .gs-btn-ghost { display: none; }
        }
        .gs-landing a:focus-visible, .gs-landing button:focus-visible {
          outline: 2px solid #38bdf8; outline-offset: 2px;
        }
      `}</style>

      <div className="gs-corner-dot" style={{ top: -60, left: -60, width: 220, height: 220, background: "#7c3aed", opacity: 0.35 }} />
      <div className="gs-corner-dot" style={{ top: 120, right: -80, width: 260, height: 260, background: "#38bdf8", opacity: 0.25, animationDelay: "1.5s" }} />
      <div className="gs-corner-dot" style={{ bottom: -100, left: "30%", width: 300, height: 300, background: "#f472b6", opacity: 0.15, animationDelay: "3s" }} />

      {/* Nav */}
      <nav className="gs-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>GeoScale</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="gs-btn-ghost" onClick={() => navigate("/login")}>Sign in</button>
          <button className="gs-btn-primary" onClick={() => navigate("/login?tab=register")}>
            Get started <ArrowIcon />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="gs-hero">
        <div className="gs-hero-copy">
          <div className="gs-eyebrow">True scale, no distortion</div>
          <h1 className="gs-h1">
            Africa is big enough to hide the USA, China, India — and{" "}
            <span className="gs-accent">
              {cycling}
              <span className="gs-cursor" />
            </span>
          </h1>
          <p className="gs-sub">
            Standard maps inflate countries near the poles and shrink everything near the equator.
            GeoScale's True Size tool puts any two countries on the same canvas — then a ranked
            geography quiz tests what you actually remember.
          </p>
          <div className="gs-cta-row">
            <button className="gs-btn-primary" onClick={() => navigate("/login?tab=register")} style={{ padding: "13px 26px", fontSize: 15 }}>
              Start playing <ArrowIcon />
            </button>
            <button className="gs-btn-ghost" onClick={() => navigate("/login")} style={{ padding: "13px 24px", fontSize: 15 }}>
              Sign in
            </button>
          </div>
          <div className="gs-stats-strip">
            {STATS.map((s) => (
              <div key={s.label} className="gs-stat">
                <div className="gs-stat-value">{s.value}</div>
                <div className="gs-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="gs-hero-visual">
          <TrueSizeMockup />
        </div>
      </section>

      {/* Features */}
      <section className="gs-section">
        <div className="gs-section-label">What you get</div>
        <h2 className="gs-section-title">One account, four ways to learn the map</h2>
        <div className="gs-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="gs-feature-card">
              <div className="gs-feature-icon" style={{ background: f.color + "22", color: f.color }}>
                <f.icon />
              </div>
              <h3 className="gs-feature-title">{f.title}</h3>
              <p className="gs-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="gs-cta-band">
        <div className="gs-cta-card">
          <h3>Find out how big Madagascar really is.</h3>
          <p>Free account, no credit card. Ranked from your very first quiz.</p>
          <button className="gs-btn-primary" onClick={() => navigate("/login?tab=register")} style={{ padding: "13px 28px", fontSize: 15 }}>
            Create your account <ArrowIcon />
          </button>
        </div>
      </section>

      <footer className="gs-footer">
        <span>&copy; {new Date().getFullYear()} GeoScale</span>
        <span>Built for people who actually want to know how big Madagascar is.</span>
      </footer>
    </div>
  );
}
