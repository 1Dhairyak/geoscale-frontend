import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { matchService } from "../services/gameServices";

export default function MatchPage() {
  const { username } = useAuth();
  const [phase, setPhase] = useState("lobby"); // lobby | waiting | active | result | error
  const [matchId, setMatchId] = useState(null);
  const [joinId, setJoinId] = useState("");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // { correct, correctAnswer, pointsEarned }
  const [myScore, setMyScore] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(20);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  // Countdown timer per question
  useEffect(() => {
    if (phase !== "active" || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, submitted]);

  // Poll for next question after submitting
  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await matchService.getQuestion(matchId);
        if (data && data.questionId) {
          clearInterval(pollRef.current);
          setPolling(false);
          setQuestion(data);
          setSelected(null);
          setSubmitted(false);
          setFeedback(null);
          setTimeLeft(20);
        }
      } catch (e) {
        // still waiting
      }
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [polling, matchId]);

  async function handleCreate() {
    try {
      const { data } = await matchService.create();
      setMatchId(data.matchId);
      setPhase("waiting");
    } catch (e) {
      setErrorMsg("Failed to create match. Try again.");
      setPhase("error");
    }
  }

  async function handleJoin() {
    try {
      const id = parseInt(joinId);
      if (!id) return;
      await matchService.join(id);
      setMatchId(id);
      await loadQuestion(id);
    } catch (e) {
      setErrorMsg("Failed to join match. Check the match ID.");
      setPhase("error");
    }
  }

  async function handleCheckActive() {
    try {
      const { data } = await matchService.getQuestion(matchId);
      if (data && data.questionId) {
        setQuestion(data);
        setPhase("active");
        setTimeLeft(20);
      }
    } catch (e) {
      // still waiting for opponent
    }
  }

  async function loadQuestion(id) {
    try {
      const { data } = await matchService.getQuestion(id);
      setQuestion(data);
      setPhase("active");
      setTimeLeft(20);
    } catch (e) {
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
        questionId: question.questionId,
        selectedAnswer: answer,
        timeTaken: (20 - timeLeft) * 1000,
      });
      setFeedback(data);
      setMyScore(s => s + (data.pointsEarned ?? 0));
      if (!data.nextQuestionAvailable) {
        setTimeout(() => checkResult(), 2000);
      } else {
        setPolling(true);
      }
    } catch (e) {
      setPolling(true);
    }
  }

  async function checkResult() {
    try {
      const { data } = await matchService.getResult(matchId);
      setResult(data);
      setPhase("result");
    } catch (e) {
      setErrorMsg("Could not load result.");
      setPhase("error");
    }
  }

  const urgent = timeLeft <= 5;
  const options = question?.options ? Object.values(question.options) : [];

  // ── LOBBY ──────────────────────────────────────────────────────────────
  if (phase === "lobby") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Live PvP</p>
      <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: "0 0 32px" }}>Multiplayer</h1>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", maxWidth: 600 }}>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "28px 24px", minWidth: 220 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16, color: "#1a1a2e", marginBottom: 8 }}>Create Match</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Start a new match and share the ID with a friend.</p>
          <button onClick={handleCreate} style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            Create
          </button>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "28px 24px", minWidth: 220 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16, color: "#1a1a2e", marginBottom: 8 }}>Join Match</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Enter a match ID to join a friend.</p>
          <input value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="Match ID" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e8eaed", borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: "border-box", fontFamily: "DM Sans, sans-serif" }} />
          <button onClick={handleJoin} style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            Join
          </button>
        </div>
      </div>
    </div>
  );

  // ── WAITING ─────────────────────────────────────────────────────────────
  if (phase === "waiting") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Live PvP</p>
      <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: "0 0 24px" }}>Waiting for opponent...</h1>
      <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "28px 24px", maxWidth: 360 }}>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Share this Match ID with your friend:</p>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 36, color: "#7c3aed", marginBottom: 20 }}>{matchId}</div>
        <button onClick={handleCheckActive} style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          Check if opponent joined
        </button>
      </div>
    </div>
  );

  // ── ERROR ───────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "#dc2626", fontWeight: 600 }}>{errorMsg}</p>
      <button onClick={() => { setPhase("lobby"); setErrorMsg(""); }} style={{ marginTop: 16, padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Back</button>
    </div>
  );

  // ── RESULT ──────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const iWon = result.winner === username;
    const isDraw = result.winner === "DRAW";
    return (
      <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Live PvP</p>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: "0 0 24px" }}>
          {isDraw ? "It's a Draw!" : iWon ? "You Won! 🎉" : "You Lost"}
        </h1>
        <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "28px 24px", maxWidth: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{result.player1Username}</div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 40, color: "#7c3aed" }}>{result.player1Score}</div>
            </div>
            <div style={{ textAlign: "center", alignSelf: "center", fontSize: 18, fontWeight: 700, color: "#9ca3af" }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{result.player2Username}</div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 40, color: "#1a1a2e" }}>{result.player2Score}</div>
            </div>
          </div>
          <button onClick={() => { setPhase("lobby"); setMyScore(0); setMatchId(null); setResult(null); }} style={{ width: "100%", padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Live PvP</p>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", margin: 0 }}>
            Question {question?.questionIndex ?? "?"} / {question?.totalQuestions ?? "?"}
          </h1>
        </div>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 40, color: urgent ? "#dc2626" : "#1a1a2e", transition: "color 0.3s" }}>
          {timeLeft}s
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "24px 28px", maxWidth: 620, marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 20, lineHeight: 1.5 }}>
          {question?.prompt}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let border = "1px solid #e8eaed", bg = "#fff", color = "#1a1a2e";
            if (submitted && feedback) {
              if (letter === feedback.correctAnswer) { border = "1.5px solid #16a34a"; bg = "#f0fdf4"; color = "#16a34a"; }
              else if (i === selected) { border = "1.5px solid #dc2626"; bg = "#fef2f2"; color = "#dc2626"; }
            } else if (selected === i) { border = "1.5px solid #7c3aed"; bg = "#faf5ff"; color = "#7c3aed"; }
            return (
              <button key={i} onClick={() => { if (!submitted) setSelected(i); }} style={{ padding: "13px 16px", borderRadius: 10, border, background: bg, fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500, color, cursor: submitted ? "default" : "pointer", textAlign: "left", transition: "all 0.15s" }}>
                <span style={{ fontWeight: 800, marginRight: 8, color: "#9ca3af" }}>{letter}.</span>{opt}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={selected === null} style={{ padding: "10px 24px", background: selected === null ? "#e8eaed" : "#7c3aed", color: selected === null ? "#9ca3af" : "#fff", border: "none", borderRadius: 8, cursor: selected === null ? "not-allowed" : "pointer", fontWeight: 600 }}>
              Submit
            </button>
          ) : (
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {feedback?.correct ? "✅ Correct! +" + feedback.pointsEarned + " pts" : "❌ Wrong"}
              {polling && " — waiting for next question..."}
            </div>
          )}
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 15, color: "#7c3aed" }}>Score: {myScore}</span>
        </div>
      </div>
    </div>
  );
}
