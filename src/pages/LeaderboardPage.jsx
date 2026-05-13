import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaderboardService } from "../services/gameServices";

const RANK_COLORS = { 1: "#f59e0b", 2: "#94a3b8", 3: "#cd7c47" };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const username = user?.username;
  const [tab, setTab] = useState("elo");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetch = tab === "elo"
      ? leaderboardService.global()
      : tab === "accuracy"
      ? leaderboardService.accuracy()
      : leaderboardService.speed();

    fetch
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, [tab]);

  // Normalise field names from backend DTOs
  // GlobalLeaderboardEntry:   { rank, username, eloRating, gamesPlayed }
  // AccuracyLeaderboardEntry: { rank, username, accuracyRate, gamesPlayed }
  // SpeedLeaderboardEntry:    { rank, username, avgResponseTimeMs, gamesPlayed }
  function getValue(row) {
    if (tab === "elo")      return row.eloRating ?? row.value ?? "—";
    if (tab === "accuracy") return row.accuracyRate != null ? `${row.accuracyRate}%` : (row.value ?? "—");
    if (tab === "speed")    return row.avgResponseTimeMs != null ? `${(row.avgResponseTimeMs / 1000).toFixed(1)}s` : (row.value ?? "—");
    return "—";
  }

  const tabs = [
    { key: "elo",      label: "Global ELO" },
    { key: "accuracy", label: "Accuracy" },
    { key: "speed",    label: "Speed" },
  ];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Rankings</p>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: 0 }}>Leaderboard</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f9fafb", padding: 4, borderRadius: 10, border: "1px solid #e8eaed", width: "fit-content", marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
            background: tab === t.key ? "#ffffff" : "transparent",
            color: tab === t.key ? "#7c3aed" : "#6b7280",
            boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div style={{ color: "#9ca3af", fontSize: 14, padding: "40px 0", textAlign: "center" }}>Loading...</div>
      )}
      {error && (
        <div style={{ color: "#dc2626", fontSize: 14, padding: "40px 0", textAlign: "center" }}>{error}</div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div style={{ color: "#9ca3af", fontSize: 14, padding: "40px 0", textAlign: "center" }}>No data yet.</div>
      )}

      {/* Table */}
      {!loading && !error && rows.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {rows.map((row, i) => {
            const rank = row.rank ?? i + 1;
            const isMe = row.username === username;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "14px 20px",
                borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none",
                background: isMe ? "#faf5ff" : "transparent",
                outline: isMe ? "1px solid #ddd6fe" : "none",
                borderRadius: isMe ? 8 : 0,
              }}>
                <div style={{ width: 36, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 15, color: RANK_COLORS[rank] || "#9ca3af" }}>
                  {rank <= 3 ? ["", "1st", "2nd", "3rd"][rank] : `#${rank}`}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isMe ? "#ede9fe" : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: isMe ? "#7c3aed" : "#6b7280",
                  marginRight: 12,
                }}>
                  {(row.username || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: isMe ? 700 : 600, color: "#1a1a2e" }}>{row.username}</span>
                  {isMe && <span style={{ marginLeft: 8, fontSize: 11, background: "#ede9fe", color: "#7c3aed", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>You</span>}
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{row.gamesPlayed ?? row.games ?? 0} games played</div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
                  {getValue(row)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
