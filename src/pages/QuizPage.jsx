// ─────────────────────────────────────────────────────────────
// QuizPage.jsx — Solo geography quiz
// Starts a session, steps through questions with a 15-second
// countdown, shows animated feedback, and renders a results
// screen when all questions are answered.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizService } from '../services/gameServices'

const DEFAULT_QUIZ_ID = 1;
const TIMER_SECONDS = 15;

const CONFETTI_COLORS = ["#f472b6", "#38bdf8", "#a78bfa", "#4ade80", "#facc15"];

function makeConfetti() {
  return Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 0.9 + Math.random() * 0.6,
    rotation: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    drift: (Math.random() - 0.5) * 60,
    size: 6 + Math.random() * 5,
  }));
}

export default function QuizPage() {
  const navigate = useNavigate();

  const [phase, setPhase]       = useState("idle"); // idle | loading | question | done | error
  const [session, setSession]   = useState(null);
  const [question, setQuestion] = useState(null);
  const [stats, setStats]       = useState(null);
  const [orderIndex, setOrderIndex] = useState(1);
  const [score, setScore]       = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected]     = useState(null);
  const [revealed, setRevealed]     = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [timedOut, setTimedOut]     = useState(false);
  const [timeLeft, setTimeLeft]     = useState(TIMER_SECONDS);

  const [confetti, setConfetti]     = useState([]);
  const [showFlash, setShowFlash]   = useState(false);
  const [xpKey, setXpKey]           = useState(0);

  const questionStartTimeRef = useRef(Date.now());
  const totalQuestions = session?.totalQuestions ?? 10;
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession();
  }, []);

  // 15s countdown per question — pauses once an answer is revealed
  useEffect(() => {
    if (phase !== "question" || revealed) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealed, timeLeft]);

  async function startSession() {
    setPhase("loading");
    try {
      const { data } = await quizService.startSession(DEFAULT_QUIZ_ID);
      setSession(data);
      setScore(0);
      setOrderIndex(1);
      await fetchQuestion(data.id, 1);
    } catch (e) {
      setErrorMsg("Could not start quiz. Is the backend running?");
      setPhase("error");
    }
  }

  async function fetchQuestion(sessionId, index) {
    setPhase("loading");
    resetQuestionState();
    try {
      const { data } = await quizService.getQuestion(sessionId, index);
      setQuestion(data);
      questionStartTimeRef.current = Date.now();
      setPhase("question");
      // Optionally fetch stats if you want, but safely (direct api call)
      const qid = data.questionId ?? data.id;
      if (qid) {
        import('../services/api').then(({ default: api }) => {
          api.get(`/question-stats/${qid}`).then((r) => setStats(r.data)).catch(() => {});
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e)
      setErrorMsg("Failed to load question.");
      setPhase("error");
    }
  }

  function resetQuestionState() {
    setSelected(null);
    setRevealed(false);
    setCorrectIndex(null);
    setTimedOut(false);
    setTimeLeft(TIMER_SECONDS);
    setStats(null);
    setConfetti([]);
    setShowFlash(false);
  }

  function getCorrectIndex() {
    return question?.correctAnswer !== undefined ? parseInt(question.correctAnswer) : null;
  }

  function triggerReward() {
    setConfetti(makeConfetti());
    setShowFlash(true);
    setXpKey((k) => k + 1);
    setTimeout(() => setConfetti([]), 1500);
    setTimeout(() => setShowFlash(false), 600);
  }

  async function handleSelect(i) {
    if (revealed || !session || !question) return;
    setSelected(i);
    setRevealed(true);
    try {
      const body = {
        questionId: question.id,
        answer: String(i),
        responseTimeMs: Date.now() - questionStartTimeRef.current,
      };
      const { data } = await quizService.submitAnswer(session.id, body);
      setScore(data.score);
      setSession(data);
      const correctIdx = getCorrectIndex();
      setCorrectIndex(correctIdx);
      if (correctIdx === i) triggerReward();
    } catch (e) {
      setCorrectIndex(null);
    }
  }

  function handleTimeout() {
    setTimedOut(true);
    setRevealed(true);
    setCorrectIndex(getCorrectIndex());
  }

  async function handleNext() {
    const nextIndex = orderIndex + 1;
    if (nextIndex > totalQuestions) {
      try { await quizService.completeSession(session.id); } catch (_) {}
      setPhase("done");
      return;
    }
    setOrderIndex(nextIndex);
    await fetchQuestion(session.id, nextIndex);
  }

  function handleRestart() {
    startedRef.current = false;
    startSession();
  }

  function getOptionText(opt) {
    if (typeof opt === "string") return opt;
    return opt?.text ?? opt?.answer ?? JSON.stringify(opt);
  }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const maxScore = totalQuestions * 10;

  return (
    <div className="gs-quiz-shell">
      <style>{`
        .gs-quiz-shell {
          min-height: 100%; height: 100%; width: 100%;
          background: transparent;
          font-family: "DM Sans", sans-serif;
          color: #f3f4f6;
          position: relative;
          overflow-y: auto;
          padding: clamp(20px, 4vw, 48px) 16px;
          display: flex; align-items: flex-start; justify-content: center;
        }
        .gs-corner {
          position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; z-index: 0;
        }
        .gs-quiz-card {
          width: 100%; max-width: 440px; position: relative; z-index: 1;
          animation: gsCardIn 0.35s ease;
        }
        @keyframes gsCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gs-quiz-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
        .gs-eyebrow {
          font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: #8b8fa3; margin: 0 0 4px;
        }
        .gs-quiz-title { font-family: "Sora", sans-serif; font-weight: 700; font-size: 19px; color: #fff; margin: 0; }
        .gs-quiz-score { font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 15px; color: #a78bfa; }
        .gs-timer-track {
          height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08);
          margin-bottom: 22px; overflow: hidden; position: relative;
        }
        .gs-timer-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #f472b6, #38bdf8);
          transition: width 1s linear;
        }
        .gs-timer-fill.gs-urgent { background: linear-gradient(90deg, #fb7185, #f97316); }
        .gs-timer-label {
          position: absolute; right: 0; top: -19px; font-family: "JetBrains Mono", monospace;
          font-size: 11px; color: #8b8fa3;
        }
        .gs-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 26px 22px 22px; position: relative; overflow: hidden;
        }
        .gs-flash {
          position: absolute; inset: 0; pointer-events: none; border-radius: 20px;
          background: radial-gradient(circle at 50% 30%, rgba(74,222,128,0.45), transparent 70%);
          animation: gsFlash 0.6s ease forwards;
        }
        @keyframes gsFlash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
        .gs-prompt { font-size: 16.5px; font-weight: 600; color: #f3f4f6; line-height: 1.5; margin: 0 0 20px; }
        .gs-stats-hint { font-size: 11.5px; color: #6b7280; margin-bottom: 14px; }
        .gs-option {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 999px; margin-bottom: 10px;
          background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1);
          color: #e5e7eb; font-family: "DM Sans", sans-serif; font-size: 14px; font-weight: 500;
          text-align: left; cursor: pointer; transition: all 0.15s ease;
        }
        .gs-option:hover:not(.gs-locked) { border-color: rgba(167,139,250,0.5); background: rgba(124,58,237,0.1); }
        .gs-option.gs-correct { border-color: #4ade80; background: rgba(74,222,128,0.14); color: #bbf7d0; }
        .gs-option.gs-incorrect { border-color: #fb7185; background: rgba(251,113,133,0.14); color: #fecdd3; animation: gsShake 0.4s ease; }
        .gs-option.gs-dimmed { opacity: 0.42; }
        @keyframes gsShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .gs-option-badge {
          width: 24px; height: 24px; min-width: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.08); font-size: 11px; font-weight: 700; color: #9ca3af;
        }
        .gs-option.gs-correct .gs-option-badge { background: #4ade80; color: #052e16; }
        .gs-option.gs-incorrect .gs-option-badge { background: #fb7185; color: #450a0a; }
        .gs-timeout-banner {
          font-family: "JetBrains Mono", monospace; font-size: 12px; color: #fdba74;
          background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.3);
          border-radius: 10px; padding: 8px 12px; margin-bottom: 16px;
        }
        .gs-next-btn {
          width: 100%; margin-top: 6px; padding: 14px; border-radius: 999px; border: none;
          background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff;
          font-family: "DM Sans", sans-serif; font-weight: 700; font-size: 14.5px; cursor: pointer;
          box-shadow: 0 10px 26px rgba(124,58,237,0.35); transition: transform 0.15s ease;
        }
        .gs-next-btn:hover { transform: translateY(-1px); }
        .gs-xp-popup {
          position: absolute; top: 14px; right: 18px; z-index: 2;
          font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 13px;
          color: #4ade80; background: rgba(74,222,128,0.14); border: 1px solid rgba(74,222,128,0.35);
          padding: 4px 10px; border-radius: 999px;
          animation: gsXpFloat 1.3s ease forwards;
        }
        @keyframes gsXpFloat {
          0% { opacity: 0; transform: translateY(6px) scale(0.9); }
          15% { opacity: 1; transform: translateY(0) scale(1.05); }
          30% { transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-22px) scale(1); }
        }
        .gs-confetti-piece {
          position: absolute; top: -10px; border-radius: 2px; pointer-events: none; z-index: 3;
          animation-name: gsConfettiFall; animation-timing-function: ease-in; animation-fill-mode: forwards;
        }
        @keyframes gsConfettiFall {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--gs-drift), 340px) rotate(540deg); opacity: 0; }
        }
        .gs-end-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 36px 28px; text-align: center; max-width: 420px; margin: 0 auto;
        }
        .gs-end-score { font-family: "JetBrains Mono", monospace; font-weight: 800; font-size: 46px; margin-bottom: 6px; }
        .gs-end-msg { font-size: 14px; color: #9ca3af; margin-bottom: 28px; }
        .gs-pill-btn {
          padding: 12px 28px; border-radius: 999px; border: none; cursor: pointer;
          font-family: "DM Sans", sans-serif; font-weight: 700; font-size: 14px;
        }
        .gs-pill-primary { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; box-shadow: 0 10px 26px rgba(124,58,237,0.35); }
        .gs-pill-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.16); color: #e5e7eb; margin-left: 10px; }
      `}</style>

      <div className="gs-corner" style={{ top: -40, left: -40, width: 200, height: 200, background: "#7c3aed", opacity: 0.3 }} />
      <div className="gs-corner" style={{ top: 60, right: -60, width: 220, height: 220, background: "#38bdf8", opacity: 0.2 }} />
      <div className="gs-corner" style={{ bottom: -60, left: "20%", width: 240, height: 240, background: "#f472b6", opacity: 0.12 }} />

      {phase === "loading" && (
        <div className="gs-quiz-card">
          <p className="gs-eyebrow">Geography Quiz</p>
          <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: 15, marginTop: 12 }}>Loading…</div>
        </div>
      )}

      {phase === "error" && (
        <div className="gs-quiz-card">
          <p className="gs-eyebrow">Geography Quiz</p>
          <p style={{ color: "#fb7185", fontWeight: 600 }}>{errorMsg}</p>
          <button className="gs-pill-btn gs-pill-primary" onClick={handleRestart} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="gs-quiz-card">
          <p className="gs-eyebrow" style={{ textAlign: "center" }}>Geography Quiz</p>
          <div className="gs-end-card">
            <div
              className="gs-end-score"
              style={{
                background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}
            >
              {score}/{maxScore}
            </div>
            <div className="gs-end-msg">
              {score >= maxScore * 0.8 ? "Excellent! 🌟" : score >= maxScore * 0.5 ? "Good job! 👍" : "Keep practising! 💪"}
            </div>
            <button className="gs-pill-btn gs-pill-primary" onClick={handleRestart}>Play again</button>
            <button className="gs-pill-btn gs-pill-ghost" onClick={() => navigate("/map")}>Back to map</button>
          </div>
        </div>
      )}

      {phase === "question" && question && (
        <div className="gs-quiz-card">
          <div className="gs-quiz-header">
            <div>
              <p className="gs-eyebrow">Geography Quiz</p>
              <h1 className="gs-quiz-title">Question {orderIndex} of {totalQuestions}</h1>
            </div>
            <span className="gs-quiz-score">{score} pts</span>
          </div>

          <div className="gs-timer-track">
            <span className="gs-timer-label">{timeLeft}s</span>
            <div
              className={`gs-timer-fill${timeLeft <= 5 ? " gs-urgent" : ""}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>

          <div className="gs-card">
            {showFlash && <div className="gs-flash" />}
            {confetti.length > 0 && (
              <>
                {confetti.map((p) => (
                  <div
                    key={`${xpKey}-${p.id}`}
                    className="gs-confetti-piece"
                    style={{
                      left: `${p.left}%`,
                      width: p.size, height: p.size * 0.5,
                      background: p.color,
                      animationDuration: `${p.duration}s`,
                      animationDelay: `${p.delay}s`,
                      "--gs-drift": `${p.drift}px`,
                    }}
                  />
                ))}
              </>
            )}
            {revealed && correctIndex !== null && selected === correctIndex && (
              <div key={xpKey} className="gs-xp-popup">+10 XP 🔥</div>
            )}

            {stats && <div className="gs-stats-hint">{stats.message}</div>}

            <p className="gs-prompt">
              {question.prompt ?? question.questionText ?? question.text ?? question.question}
            </p>

            {timedOut && <div className="gs-timeout-banner">⏱ Time's up — here's the right answer</div>}

            <div>
              {(question.options ?? []).map((opt, i) => {
                let cls = "gs-option";
                if (!revealed) {
                  // no extra class — neutral state until answered
                } else if (i === correctIndex) {
                  cls += " gs-correct";
                } else if (i === selected) {
                  cls += " gs-incorrect";
                } else {
                  cls += " gs-dimmed";
                }
                if (revealed) cls += " gs-locked";
                return (
                  <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={revealed}>
                    <span className="gs-option-badge">
                      {revealed && i === correctIndex ? "✓" : revealed && i === selected ? "✕" : String.fromCharCode(65 + i)}
                    </span>
                    {getOptionText(opt)}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <button className="gs-next-btn" onClick={handleNext}>
                {orderIndex >= totalQuestions ? "See results" : "Next question →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
