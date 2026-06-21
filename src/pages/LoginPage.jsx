// ─────────────────────────────────────────────────────────────
// LoginPage.jsx
// Handles both Sign In and Create Account in a single page via
// a tab switcher. Redirects to /map on successful login.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function StrengthMeter({ password }) {
  function score(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }
  const s = score(password);
  const labels = ["", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["#e8eaed", "#ef4444", "#f59e0b", "#10b981", "#7c3aed"];
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= s ? colors[s] : "#e8eaed",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      {password && (
        <span style={{ fontSize: 11, color: colors[s], fontWeight: 600 }}>{labels[s]}</span>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "register" ? "register" : "login");

  // Login state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regUser, setRegUser] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(loginUser, loginPass);
      navigate("/map");
    } catch (err) {
      setLoginError("Invalid username or password.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegError('')
    if (regPass !== regConfirm) { setRegError('Passwords do not match.'); return; }
    setRegLoading(true)
    try {
      await api.post('/auth/register', { username: regUser, email: regEmail, password: regPass })
      setRegSuccess(true)
      setTimeout(() => { setTab('login'); setRegSuccess(false) }, 1800)
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      {/* Left decorative panel */}
      <div style={{
        width: "45%", background: "#1a1a2e", position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px", overflow: "hidden",
      }}>
        {/* Background grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}
          viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#a78bfa" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="#a78bfa" strokeWidth="0.5" />
          ))}
        </svg>

        {/* World map SVG simplified */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
          viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="400" cy="250" rx="380" ry="220" stroke="#7c3aed" strokeWidth="1" fill="none" />
          <ellipse cx="400" cy="250" rx="280" ry="220" stroke="#7c3aed" strokeWidth="0.5" fill="none" />
          <line x1="400" y1="30" x2="400" y2="470" stroke="#7c3aed" strokeWidth="0.5" />
          <line x1="20" y1="250" x2="780" y2="250" stroke="#7c3aed" strokeWidth="0.5" />
        </svg>

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 20, color: "#ffffff" }}>
              GeoScale
            </span>
          </Link>

          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 36, color: "#ffffff", lineHeight: 1.2, marginBottom: 16 }}>
            Geography.<br />Ranked.<br />Real-time.
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, marginBottom: 40 }}>
            Test your knowledge of countries, capitals and borders — solo or in live PvP matches against players worldwide.
          </p>

          {/* Stat badges */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Players", value: "2.4k+" },
              { label: "Countries", value: "195" },
              { label: "Live PvP", value: "Active" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 8, padding: "8px 14px",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa", fontFamily: "Sora, sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#ffffff", padding: "48px",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "#f9fafb", borderRadius: 10,
            padding: 4, marginBottom: 32, border: "1px solid #e8eaed",
          }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none", cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
                background: tab === t ? "#ffffff" : "transparent",
                color: tab === t ? "#7c3aed" : "#6b7280",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}>
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", marginBottom: 6 }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>Sign in to your GeoScale account</p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Username</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Your username"
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowLoginPass(v => !v)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                    {showLoginPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: "#7c3aed", cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
              </div>

              {loginError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                  {loginError}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loginLoading}
                style={{ width: "100%", padding: "10px", fontSize: 14 }}>
                {loginLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", marginBottom: 6 }}>
                Join GeoScale
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>Create your account and start climbing the ranks</p>

              {regSuccess && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                  Account created! Redirecting to sign in...
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Username</label>
                <input className="input" type="text" placeholder="Choose a username" value={regUser} onChange={e => setRegUser(e.target.value)} required />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Password</label>
                <input className="input" type="password" placeholder="Create a password" value={regPass} onChange={e => setRegPass(e.target.value)} required />
                {regPass && <div style={{ marginTop: 8 }}><StrengthMeter password={regPass} /></div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Confirm password</label>
                <input className="input" type="password" placeholder="Repeat password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required />
              </div>

              {regError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>
                  {regError}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={regLoading}
                style={{ width: "100%", padding: "10px", fontSize: 14 }}>
                {regLoading ? "Creating account..." : "Create account"}
              </button>

              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>
                By registering you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
