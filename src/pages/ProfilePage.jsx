// ─────────────────────────────────────────────────────────────
// ProfilePage.jsx
// Displays the logged-in user's stats and performance breakdown.
//
// Data strategy (no dedicated /profile endpoint exists):
//   - GET /leaderboard/global  → find user's ELO and rank
//   - GET /sessions            → aggregate accuracy, quiz count, win rate
//   - Category breakdown is built from session.categoryStats if the
//     backend populates that field.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { leaderboardService } from '../services/gameServices'
import api from '../services/api'

// Shared card style for the dark glassmorphic theme
const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
}

export default function ProfilePage() {
  const { username } = useAuth()

  const [stats,      setStats]      = useState(null)
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const [sessRes, lbRes] = await Promise.allSettled([
          api.get('/sessions'),
          leaderboardService.global(),
        ])

        const sessions    = sessRes.status === 'fulfilled' ? (sessRes.value.data?.content ?? sessRes.value.data ?? []) : []
        const leaderboard = lbRes.status   === 'fulfilled' ? (lbRes.value.data ?? []) : []

        // Find the current user in the global leaderboard
        const myEntry = leaderboard.find(e => e.username === username)
        const myRank  = myEntry ? leaderboard.indexOf(myEntry) + 1 : null
        const myElo   = myEntry?.eloRating ?? '—'

        // Aggregate session stats
        const completed    = sessions.filter(s => s.status === 'COMPLETED' || s.completedAt)
        const pvpSessions  = completed.filter(s => s.sessionType === 'PVP' || s.type === 'PVP')
        const pvpWins      = pvpSessions.filter(s => s.won || s.result === 'WIN').length
        const totalQuizzes = completed.length
        const totalCorrect = completed.reduce((a, s) => a + (s.correctAnswers ?? s.score ?? 0), 0)
        const totalAnswers  = completed.reduce((a, s) => a + (s.totalQuestions ?? 10), 0)
        const avgAccuracy  = totalAnswers > 0 ? Math.round(totalCorrect / totalAnswers * 100) : 0
        const wins         = completed.filter(s => s.won || s.result === 'WIN').length
        const winRate      = totalQuizzes > 0 ? Math.round(wins / totalQuizzes * 100) : 0
        const avgRespMs    = completed.reduce((a, s) => a + (s.avgResponseTimeMs ?? 0), 0) / (completed.length || 1)

        setStats({
          totalQuizzes,
          winRate:     `${winRate}%`,
          avgAccuracy: `${avgAccuracy}%`,
          pvpWins,
          avgResponse: avgRespMs > 0 ? `${(avgRespMs / 1000).toFixed(1)}s` : '—',
          elo:         myElo,
          rank:        myRank ? `#${myRank}` : '—',
        })

        // Build category breakdown from session.categoryStats (if backend provides it)
        const catMap = {}
        completed.forEach(s => {
          ;(s.categoryStats ?? []).forEach(c => {
            if (!catMap[c.category]) catMap[c.category] = { correct: 0, total: 0 }
            catMap[c.category].correct += c.correct ?? 0
            catMap[c.category].total   += c.total   ?? 0
          })
        })
        setCategories(
          Object.entries(catMap).map(([name, v]) => ({
            name,
            correct:  v.correct,
            total:    v.total,
            accuracy: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0,
          }))
        )
      } catch {
        setError('Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [username])

  const STAT_CARDS = stats ? [
    { label: 'Total Quizzes', value: stats.totalQuizzes },
    { label: 'Win Rate',      value: stats.winRate      },
    { label: 'Avg Accuracy',  value: stats.avgAccuracy  },
    { label: 'PvP Wins',      value: stats.pvpWins      },
    { label: 'Avg Response',  value: stats.avgResponse  },
    { label: 'ELO Rating',    value: stats.elo          },
  ] : []

  // ── Accuracy bar colour helper ─────────────────────────────
  function accuracyColor(pct) {
    if (pct >= 80) return '#4ade80'
    if (pct >= 70) return '#a78bfa'
    return '#fbbf24'
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'DM Sans, sans-serif', overflowY: 'auto', height: '100%' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--geo-subtle)', marginBottom: 4 }}>Account</p>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 26, color: 'var(--geo-text)', margin: 0 }}>Profile</h1>
      </div>

      {/* Avatar + badges */}
      <div style={{ ...cardStyle, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#ffffff', fontFamily: 'Sora, sans-serif',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
          flexShrink: 0,
        }}>
          {username[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--geo-text)', marginBottom: 8 }}>
            {username}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.4)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>PLAYER</span>
            {stats && <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--geo-muted)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>ELO {stats.elo}</span>}
            {stats && stats.rank !== '—' && <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--geo-muted)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>Rank {stats.rank}</span>}
          </div>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--geo-muted)', textAlign: 'center', padding: '40px 0' }}>Loading...</div>}
      {error   && <div style={{ color: '#fb7185',          textAlign: 'center', padding: '40px 0' }}>{error}</div>}

      {/* Stat grid */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ ...cardStyle, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--geo-text)', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--geo-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category breakdown table */}
      {!loading && categories.length > 0 && (
        <div style={cardStyle}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--geo-text)' }}>Category Breakdown</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Category', 'Correct', 'Total', 'Accuracy', ''].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--geo-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={i} style={{ borderBottom: i < categories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--geo-text)' }}>{c.name}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--geo-text)',  fontFamily: 'JetBrains Mono, monospace' }}>{c.correct}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--geo-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{c.total}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: accuracyColor(c.accuracy) }}>
                    {c.accuracy}%
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
                      <div style={{ width: `${c.accuracy}%`, height: '100%', borderRadius: 99, background: accuracyColor(c.accuracy) }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && categories.length === 0 && stats && (
        <div style={{ ...cardStyle, padding: '24px 20px', textAlign: 'center', color: 'var(--geo-muted)', fontSize: 13 }}>
          Category breakdown will appear after you complete some quizzes.
        </div>
      )}
    </div>
  )
}
