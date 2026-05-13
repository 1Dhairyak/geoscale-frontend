import { useAuth } from "../context/AuthContext";

const STATS = [
  { label: "ELO Rating", value: "1,204", delta: "+12 this week", icon: StarIcon, color: "#7c3aed" },
  { label: "Quizzes Played", value: "87", delta: "+5 today", icon: QuizIcon, color: "#0ea5e9" },
  { label: "Win Rate", value: "63%", delta: "PvP matches", icon: TrophyIcon, color: "#10b981" },
  { label: "Accuracy", value: "74%", delta: "All questions", icon: TargetIcon, color: "#f59e0b" },
];

const SESSIONS = [
  { type: "PvP", result: "Win", opponent: "GeoKing_99", score: "8-5", date: "Today, 4:41 PM", elo: "+14" },
  { type: "Solo", result: "Win", opponent: null, score: "9/10", date: "Today, 3:10 PM", elo: null },
  { type: "PvP", result: "Loss", opponent: "MapMaster_7", score: "4-8", date: "Yesterday", elo: "-10" },
  { type: "Solo", result: "Win", opponent: null, score: "7/10", date: "Yesterday", elo: null },
  { type: "PvP", result: "Win", opponent: "BordersOnly", score: "6-4", date: "2 days ago", elo: "+11" },
];

function StarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function QuizIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function TrophyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 22 12 17 16 22"/><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 7H4a2 2 0 0 0 0 4h2"/><path d="M18 7h2a2 2 0 0 0 0-4h-2"/><line x1="12" y1="17" x2="12" y2="13"/></svg>;
}
function TargetIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

export default function DashboardPage() {
  const { username } = useAuth();

  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
          Overview
        </p>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: 0 }}>
          Welcome back, {username || "Player"}
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12,
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color, marginBottom: 14,
            }}>
              <s.icon />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", fontFamily: "Sora, sans-serif", marginBottom: 2 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Session history */}
      <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e8eaed", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Recent Sessions</span>
          <span style={{ fontSize: 12, color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>View all</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8eaed" }}>
              {["Type", "Result", "Opponent", "Score", "ELO Change", "Date"].map(h => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s, i) => (
              <tr key={i} style={{ borderBottom: i < SESSIONS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    background: s.type === "PvP" ? "#ede9fe" : "#f0fdf4",
                    color: s.type === "PvP" ? "#7c3aed" : "#16a34a",
                  }}>{s.type}</span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: s.result === "Win" ? "#16a34a" : "#dc2626",
                  }}>{s.result}</span>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#1a1a2e" }}>
                  {s.opponent || <span style={{ color: "#9ca3af" }}>—</span>}
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#1a1a2e", fontFamily: "JetBrains Mono, monospace" }}>
                  {s.score}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {s.elo ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.elo.startsWith("+") ? "#16a34a" : "#dc2626", fontFamily: "JetBrains Mono, monospace" }}>
                      {s.elo}
                    </span>
                  ) : <span style={{ color: "#9ca3af" }}>—</span>}
                </td>
                <td style={{ padding: "14px 20px", fontSize: 12, color: "#6b7280" }}>{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
