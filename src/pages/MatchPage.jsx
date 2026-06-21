// ── MatchPage — Live PvP / Multiplayer game page ────────────────────────────
// Phases: lobby → waiting → active → result | error
// All game logic (create/join, polling, countdown, submit, result) is unchanged.
// Dark-theme colours applied throughout; purple accent (#7c3aed) kept as-is.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { matchService } from "../services/gameServices";

// ── Shared style tokens ──────────────────────────────────────────────────────
const FONT_BODY   = "DM Sans, sans-serif";
const FONT_HEAD   = "Sora, sans-serif";
const COLOR_LABEL = "#9ca3af";
const COLOR_HEAD  = "#f3f4f6";
const COLOR_SUB   = "#9ca3af";
const COLOR_ACCENT = "#7c3aed";

const CARD = {
  background : "rgba(255,255,255,0.06)",
  border     : "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding    : "28px 24px",
};

const BTN_PRIMARY = {
  padding     : "10px 24px",
  background  : COLOR_ACCENT,
  color       : "#fff",
  border      : "none",
  borderRadius: 8,
  cursor      : "pointer",
  fontWeight  : 600,
  fontSize    : 14,
};

const PAGE_WRAP = {
  padding   : "32px 36px",
  fontFamily: FONT_BODY,
};

// ── Small reusable components ────────────────────────────────────────────────
function PageLabel() {
  return (
    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: COLOR_LABEL, marginBottom: 4 }}>
      Live PvP
    </p>
  );
}

function PageTitle({ children, style = {} }) {
  return (
    <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 26,
                 color: COLOR_HEAD, margin: "0 0 24px", ...style }}>
      {children}
    </h1>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MatchPage() {
  const { username } = useAuth();

  const [phase,     setPhase]     = useState("lobby"); // lobby | waiting | active | result | error
  const [matchId,   setMatchId]   = useState(null);
  const [joinId,    setJoinId]    = useState("");
  const [question,  setQuestion]  = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback,  setFeedback]  = useState(null);  // { correct, correctAnswer, pointsEarned }
  const [myScore,   setMyScore]   = useState(0);
  const [result,    setResult]    = useState(null);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [timeLeft,  setTimeLeft]  = useState(20);
  const [polling,   setPolling]   = useState(false);

  const pollRef = useRef(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Countdown timer — fires auto-submit when it hits 0
  useEffect(() => {
    if (phase !== "active" || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, submitted]);

  // Poll for the next question after the current answer is submitted
  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await matchService.getQuestion(matchId);
        if (data?.questionId) {
          clearInterval(pollRef.current);
          setPolling(false);
          setQuestion(data);
          setSelected(null);
          setSubmitted(false);
          setFeedback(null);
          setTimeLeft(20);
        }
      } catch {
        // still waiting — silently retry
      }
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [polling, matchId]);

  // ── Game actions ───────────────────────────────────────────────────────────

  async function handleCreate() {
    try {
      const { data } = await matchService.create();
      setMatchId(data.matchId);
      setPhase("waiting");
    } catch {
      setErrorMsg("Failed to create match. Try again.");
      setPhase("error");
    }
  }

  async function handleJoin() {
    const id = parseInt(joinId, 10);
    if (!id) return;
    try {
      await matchService.join(id);
      setMatchId(id);
      await loadQuestion(id);
    } catch {
      setErrorMsg("Failed to join match. Check the match ID.");
      setPhase("error");
    }
  }

  async function handleCheckActive() {
    try {
      const { data } = await matchService.getQuestion(matchId);
      if (data?.questionId) {
        setQuestion(data);
        setPhase("active");
        setTimeLeft(20);
      }
    } catch {
      // opponent hasn't joined yet — do nothing
    }
  }

  async function loadQuestion(id) {
    try {
      const { data } = await matchService.getQuestion(id);
      setQuestion(data);
      setPhase("active");
      setTimeLeft(20);
    } catch {
      setErrorMsg("Failed to load question.");
      setPhase("error");
    }
  }

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const answer = selected !== null ? String.fromCharCode(65 + selected) : "X";
    try {
      const { data } = await matchService.answer(matchId, {
        questionId    : question.questionId,
        selectedAnswer: answer,
        timeTaken     : (20 - timeLeft) * 1000,
      });
      setFeedback(data);
      setMyScore(s => s + (data.pointsEarned ?? 0));
      if (!data.nextQuestionAvailable) {
        setTimeout(() => checkResult(), 2000);
      } else {
        setPolling(true);
      }
    } catch {
      setPolling(true);
    }
  }

  async function checkResult() {
    try {
      const { data } = await matchService.getResult(matchId);
      setResult(data);
      setPhase("result");
    } catch {
      setErrorMsg("Could not load result.");
      setPhase("error");
    }
  }

  function resetToLobby() {
    setPhase("lobby");
    setMatchId(null);
    setJoinId("");
    setQuestion(null);
    setSelected(null);
    setSubmitted(false);
    setFeedback(null);
    setMyScore(0);
    setResult(null);
    setErrorMsg("");
    setTimeLeft(20);
    setPolling(false);
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const isUrgent = timeLeft <= 5;
  const options  = question?.options ? Object.values(question.options) : [];

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (phase === "lobby") return (
    <div style={PAGE_WRAP}>
      <PageLabel />
      <PageTitle style={{ marginBottom: 32 }}>Multiplayer</PageTitle>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", maxWidth: 600 }}>

        {/* Create match card */}
        <div style={{ ...CARD, flex: 1, minWidth: 220 }}>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 16,
                       color: COLOR_HEAD, marginBottom: 8 }}>
            Create Match
          </h2>
          <p style={{ fontSize: 13, color: COLOR_SUB, marginBottom: 20 }}>
            Start a new match and share the ID with a friend.
          </p>
          <button onClick={handleCreate} style={BTN_PRIMARY}>Create</button>
        </div>

        {/* Join match card */}
        <div style={{ ...CARD, flex: 1, minWidth: 220 }}>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 16,
                       color: COLOR_HEAD, marginBottom: 8 }}>
            Join Match
          </h2>
          <p style={{ fontSize: 13, color: COLOR_SUB, marginBottom: 12 }}>
            Enter a match ID to join a friend.
          </p>
          <input
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            placeholder="Match ID"
            style={{
              width       : "100%",
              padding     : "9px 12px",
              background  : "rgba(255,255,255,0.08)",
              border      : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              fontSize    : 14,
              color       : COLOR_HEAD,
              marginBottom: 12,
              boxSizing   : "border-box",
              fontFamily  : FONT_BODY,
              outline     : "none",
            }}
          />
          <button onClick={handleJoin} style={BTN_PRIMARY}>Join</button>
        </div>

      </div>
    </div>
  );

  // ── WAITING ────────────────────────────────────────────────────────────────
  if (phase === "waiting") return (
    <div style={PAGE_WRAP}>
      <PageLabel />
      <PageTitle>Waiting for opponent…</PageTitle>

      <div style={{ ...CARD, maxWidth: 360 }}>
        <p style={{ fontSize: 13, color: COLOR_SUB, marginBottom: 8 }}>
          Share this Match ID with your friend:
        </p>
        <div style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 36,
                      color: COLOR_ACCENT, marginBottom: 20 }}>
          {matchId}
        </div>
        <button onClick={handleCheckActive} style={BTN_PRIMARY}>
          Check if opponent joined
        </button>
      </div>
    </div>
  );

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={PAGE_WRAP}>
      <p style={{ color: "#f87171", fontWeight: 600 }}>{errorMsg}</p>
      <button
        onClick={() => { setPhase("lobby"); setErrorMsg(""); }}
        style={{ ...BTN_PRIMARY, marginTop: 16 }}
      >
        Back
      </button>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const iWon   = result.winner === username;
    const isDraw = result.winner === "DRAW";
    return (
      <div style={PAGE_WRAP}>
        <PageLabel />
        <PageTitle>
          {isDraw ? "It's a Draw!" : iWon ? "You Won! 🎉" : "You Lost"}
        </PageTitle>

        <div style={{ ...CARD, maxWidth: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 24 }}>

            {/* Player 1 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLOR_LABEL, marginBottom: 4 }}>
                {result.player1Username}
              </div>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 40,
                            color: COLOR_ACCENT }}>
                {result.player1Score}
              </div>
            </div>

            <div style={{ alignSelf: "center", fontSize: 18, fontWeight: 700,
                          color: COLOR_LABEL }}>
              VS
            </div>

            {/* Player 2 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLOR_LABEL, marginBottom: 4 }}>
                {result.player2Username}
              </div>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 40,
                            color: COLOR_HEAD }}>
                {result.player2Score}
              </div>
            </div>

          </div>

          <button onClick={resetToLobby} style={{ ...BTN_PRIMARY, width: "100%" }}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE (question screen) ───────────────────────────────────────────────
  return (
    <div style={PAGE_WRAP}>

      {/* Header row: question progress + countdown */}
      <div style={{ marginBottom: 24, display: "flex",
                    justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <PageLabel />
          <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 22,
                       color: COLOR_HEAD, margin: 0 }}>
            Question {question?.questionIndex ?? "?"} / {question?.totalQuestions ?? "?"}
          </h1>
        </div>
        <div style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 40,
                      color: isUrgent ? "#f87171" : COLOR_HEAD,
                      transition: "color 0.3s" }}>
          {timeLeft}s
        </div>
      </div>

      {/* Question card */}
      <div style={{ ...CARD, background: "rgba(255,255,255,0.04)",
                    maxWidth: 620, marginBottom: 16,
                    padding: "24px 28px" }}>

        <p style={{ fontSize: 16, fontWeight: 600, color: COLOR_HEAD,
                    marginBottom: 20, lineHeight: 1.5 }}>
          {question?.prompt}
        </p>

        {/* Answer option grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);

            // Determine per-option styling based on submission state
            let border = "1px solid rgba(255,255,255,0.1)";
            let bg     = "rgba(255,255,255,0.06)";
            let color  = COLOR_HEAD;

            if (submitted && feedback) {
              if (letter === feedback.correctAnswer) {
                border = "1.5px solid #16a34a";
                bg     = "rgba(22,163,74,0.12)";
                color  = "#4ade80";
              } else if (i === selected) {
                border = "1.5px solid #dc2626";
                bg     = "rgba(220,38,38,0.12)";
                color  = "#f87171";
              }
            } else if (selected === i) {
              border = "1.5px solid #7c3aed";
              bg     = "rgba(124,58,237,0.15)";
              color  = "#c4b5fd";
            }

            return (
              <button
                key={i}
                onClick={() => { if (!submitted) setSelected(i); }}
                style={{
                  padding     : "13px 16px",
                  borderRadius: 10,
                  border,
                  background  : bg,
                  fontFamily  : FONT_BODY,
                  fontSize    : 13,
                  fontWeight  : 500,
                  color,
                  cursor      : submitted ? "default" : "pointer",
                  textAlign   : "left",
                  transition  : "all 0.15s",
                }}
              >
                <span style={{ fontWeight: 800, marginRight: 8, color: COLOR_LABEL }}>
                  {letter}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Submit row */}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              style={{
                ...BTN_PRIMARY,
                background: selected === null ? "rgba(255,255,255,0.08)" : COLOR_ACCENT,
                color     : selected === null ? COLOR_LABEL : "#fff",
                cursor    : selected === null ? "not-allowed" : "pointer",
              }}
            >
              Submit
            </button>
          ) : (
            <div style={{ fontSize: 13, color: COLOR_SUB }}>
              {feedback?.correct
                ? `✅ Correct! +${feedback.pointsEarned} pts`
                : "❌ Wrong"}
              {polling && " — waiting for next question…"}
            </div>
          )}

          <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 15,
                         color: COLOR_ACCENT }}>
            Score: {myScore}
          </span>
        </div>

      </div>
    </div>
  );
}
