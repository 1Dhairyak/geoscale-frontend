// ProfilePage.jsx — fetches real data from backend
// Uses: GET /sessions (paginated) to compute stats
// and GET /leaderboard/global to find user rank + ELO
// No dedicated /profile endpoint exists; we aggregate from available APIs.

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaderboardService, quizService, friendService } from "../services/gameServices";

export default function ProfilePage() {
  const { user } = useAuth();
  const username = user?.username ?? "Player";

  const [stats, setStats]       = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [sessRes, lbRes, frRes] = await Promise.allSettled([
          quizService.getUserSessions(),
          leaderboardService.global(),
          friendService.list(),
        ]);

        const sessions   = sessRes.status  === "fulfilled" ? (sessRes.value.data?.content  ?? sessRes.value.data  ?? []) : [];
        const leaderboard = lbRes.status   === "fulfilled" ? (lbRes.value.data   ?? []) : [];
        const friends    = frRes.status    === "fulfilled" ? (frRes.value.data    ?? []) : [];

        // Find current user in leaderboard
        const myEntry = leaderboard.find(e => e.username === username);
        const myRank  = myEntry ? (leaderboard.indexOf(myEntry) + 1) : null;
        const myElo   = myEntry?.eloRating ?? "—";

        // Compute stats from sessions
        const completed = sessions.filter(s => s.status === "COMPLETED" || s.completedAt);
        const pvpSessions = completed.filter(s => s.sessionType === "PVP" || s.type === "PVP");
        const pvpWins = pvpSessions.filter(s => s.won || s.result === "WIN").length;

        const totalQuizzes  = completed.length;
        const totalCorrect  = completed.reduce((a, s) => a + (s.correctAnswers ?? s.score ?? 0), 0);
        const totalAnswered = completed.reduce((a, s) => a + (s.totalQuestions ?? 10), 0);
        const avgAccuracy   = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;

        const wins    = completed.filter(s => s.won || s.result === "WIN").length;
        const winRate = totalQuizzes > 0 ? Math.round(wins / totalQuizzes * 100) : 0;

        const avgResponseMs = completed.reduce((a, s) => a + (s.avgResponseTimeMs ?? 0), 0) / (completed.length || 1);
        const avgResponseS  = (avgResponseMs / 1000).toFixed(1);

        setStats({
          totalQuizzes,
          winRate:     `${winRate}%`,
          avgAccuracy: `${avgAccuracy}%`,
          pvpWins,
          avgResponse: avgResponseMs > 0 ? `${avgResponseS}s` : "—",
          friends:     friends.length,
          elo:         myElo,
          rank:        myRank ? `#${myRank}` : "—",
        });

        // Category breakdown from sessions (if backend returns category data)
        // Sessions may have categoryStats: [{ category, correct, total }]
        const catMap = {};
        completed.forEach(s => {
          (s.categoryStats ?? []).forEach(c => {
            if (!catMap[c.category]) catMap[c.category] = { correct: 0, total: 0 };
            catMap[c.category].correct += c.correct ?? 0;
            catMap[c.category].total   += c.total   ?? 0;
          });
        });
        const cats = Object.entries(catMap).map(([name, v]) => ({
          name,
          correct:  v.correct,
          total:    v.total,
          accuracy: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0,
        }));
        setCategories(cats);
      } catch (e) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [username]);

  const STAT_CARDS = stats ? [
    { label: "Total Quizzes", value: stats.totalQuizzes },
    { label: "Win Rate",      value: stats.winRate },
    { label: "Avg Accuracy",  value: stats.avgAccuracy },
    { label: "PvP Wins",      value: stats.pvpWins },
    { label: "Avg Response",  value: stats.avgResponse },
    { label: "Friends",       value: stats.friends },
  ] : [];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Account</p>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: 0 }}>Profile</h1>
      </div>

      {/* Avatar + info */}
      <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 14, padding: "24px 28px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: "#ffffff", fontFamily: "Sora, sans-serif",
        }}>
          {username[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 20, color: "#1a1a2e", marginBottom: 2 }}>
            {username}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>PLAYER</span>
            {stats && <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>ELO {stats.elo}</span>}
            {stats && stats.rank !== "—" && <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>Rank {stats.rank}</span>}
          </div>
        </div>
      </div>

      {loading && <div style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>Loading...</div>}
      {error   && <div style={{ color: "#dc2626", textAlign: "center", padding: "40px 0" }}>{error}</div>}

      {/* Stat grid */}
      {!loading && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category breakdown */}
      {!loading && categories.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8eaed" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Category Breakdown</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8eaed" }}>
                {["Category", "Correct", "Total", "Accuracy", ""].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={i} style={{ borderBottom: i < categories.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{c.name}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#1a1a2e", fontFamily: "JetBrains Mono, monospace" }}>{c.correct}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#9ca3af", fontFamily: "JetBrains Mono, monospace" }}>{c.total}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
                    color: c.accuracy >= 80 ? "#16a34a" : c.accuracy >= 70 ? "#7c3aed" : "#f59e0b" }}>
                    {c.accuracy}%
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ width: 80, height: 4, background: "#e8eaed", borderRadius: 99 }}>
                      <div style={{ width: `${c.accuracy}%`, height: "100%", borderRadius: 99,
                        background: c.accuracy >= 80 ? "#10b981" : c.accuracy >= 70 ? "#7c3aed" : "#f59e0b" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* If no category data available from backend */}
      {!loading && !error && categories.length === 0 && stats && (
        <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, padding: "24px 20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
          Category breakdown will appear after you complete some quizzes.
        </div>
      )}
    </div>
  );
}
