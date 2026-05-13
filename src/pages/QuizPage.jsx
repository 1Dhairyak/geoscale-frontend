import { useState, useEffect, useRef } from "react";
import { quizService, questionService } from "../services/gameServices";

const DEFAULT_QUIZ_ID = 1;

export default function QuizPage() {
  const [phase, setPhase]               = useState("idle");
  const [session, setSession]           = useState(null);
  const [question, setQuestion]         = useState(null);
  const [stats, setStats]               = useState(null);
  const [orderIndex, setOrderIndex]     = useState(1);
  const [selected, setSelected]         = useState(null);
  const [submitted, setSubmitted]       = useState(false);
  const [correct, setCorrect]           = useState(null);
  const [score, setScore]               = useState(0);
  const [errorMsg, setErrorMsg]         = useState("");
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const totalQuestions                  = session?.totalQuestions ?? 10;
  const startedRef                      = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession();
  }, []);

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
    setSelected(null);
    setSubmitted(false);
    setCorrect(null);
    setStats(null);
    try {
      const { data } = await quizService.getQuestion(sessionId, index);
      setQuestion(data);
      setQuestionStartTime(Date.now());
      setPhase("question");
      const qid = data.questionId ?? data.id;
      if (qid) {
        questionService.getStats(qid).then(r => setStats(r.data)).catch(() => {});
      }
    } catch (e) {
      setErrorMsg("Failed to load question.");
      setPhase("error");
    }
  }

  async function handleSubmit() {
    if (selected === null || !session || !question) return;
    setSubmitted(true);
    try {
      const body = {
        questionId:     question.id,
        answer:         String(selected),
        responseTimeMs: Date.now() - questionStartTime,
      };
      const { data } = await quizService.submitAnswer(session.id, body);
      console.log("SUBMIT RESPONSE:", JSON.stringify(data));
      setScore(data.score);
      setSession(data);
      const correctIdx = question?.correctAnswer !== undefined ? parseInt(question.correctAnswer) : null;
      setCorrect(correctIdx);
    } catch (e) {
      setCorrect(null);
    }
  }

  async function handleNext() {
    const nextIndex = orderIndex + 1;
    if (nextIndex > totalQuestions) {
      try { await quizService.completeSession(session.id); } catch (_) {}
      setPhase("done");
      return;
    }
    setSubmitted(false);
    setSelected(null);
    setCorrect(null);
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

  function optionStyle(i) {
    const base = {
      width: "100%", padding: "14px 18px", borderRadius: 10,
      border: "1px solid #e8eaed", background: "#ffffff",
      cursor: submitted ? "default" : "pointer",
      fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500,
      color: "#1a1a2e", textAlign: "left", transition: "all 0.15s",
      marginBottom: 10, display: "block",
    };
    if (!submitted) {
      if (selected === i) return { ...base, border: "1.5px solid #7c3aed", background: "#faf5ff", fontWeight: 600 };
      return base;
    }
    if (correct !== null) {
      if (i === correct) return { ...base, border: "1.5px solid #16a34a", background: "#f0fdf4", color: "#16a34a", fontWeight: 700 };
      if (selected === i) return { ...base, border: "1.5px solid #dc2626", background: "#fef2f2", color: "#dc2626" };
    }
    return { ...base, opacity: 0.5 };
  }

  const progress = ((orderIndex - 1) / totalQuestions) * 100;

  if (phase === "loading") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Geography Quiz</p>
      <div style={{ color: "#7c3aed", fontWeight: 600, fontSize: 15, marginTop: 20 }}>Loading...</div>
    </div>
  );

  if (phase === "error") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "#dc2626", fontWeight: 600 }}>{errorMsg}</p>
      <button onClick={handleRestart} style={{ marginTop: 16, padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Try again</button>
    </div>
  );

  if (phase === "done") return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>Geography Quiz</p>
      <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: "0 0 24px" }}>Quiz Complete!</h1>
      <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 14, padding: "32px 28px", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 48, color: "#7c3aed", marginBottom: 8 }}>
          {score}/{totalQuestions * 10}
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
          {score >= totalQuestions * 10 * 0.8 ? "Excellent! \uD83C\uDF1F" : score >= totalQuestions * 10 * 0.5 ? "Good job! \uD83D\uDC4D" : "Keep practising! \uD83D\uDCAA"}
        </div>
        <button onClick={handleRestart} style={{ padding: "10px 32px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Play again</button>
      </div>
    </div>
  );

  if (!question) return null;

  const options = question.options ?? [];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Geography Quiz</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", margin: 0 }}>
            Question {orderIndex} of {totalQuestions}
          </h1>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 15, color: "#7c3aed" }}>
            Score: {score}
          </span>
        </div>
      </div>

      <div style={{ height: 4, background: "#e8eaed", borderRadius: 99, marginBottom: 28 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#7c3aed", borderRadius: 99, transition: "width 0.4s" }} />
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 14, padding: "28px 28px 24px", maxWidth: 640 }}>
        {stats && (
          <div style={{ marginBottom: 20, fontSize: 12, color: "#9ca3af" }}>{stats.message}</div>
        )}
        <p style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.5, marginBottom: 24 }}>
          {question.prompt ?? question.questionText ?? question.text ?? question.question}
        </p>
        <div>
          {options.map((opt, i) => (
            <button key={i} onClick={() => { if (!submitted) setSelected(i); }} style={optionStyle(i)}>
              <span style={{
                display: "inline-block", width: 22, height: 22, borderRadius: 6,
                background: selected === i && !submitted ? "#ede9fe" : "#f3f4f6",
                color: selected === i && !submitted ? "#7c3aed" : "#6b7280",
                fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "22px",
                marginRight: 10, verticalAlign: "middle",
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {getOptionText(opt)}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={selected === null} style={{ padding: "10px 24px", background: selected === null ? "#e8eaed" : "#7c3aed", color: selected === null ? "#9ca3af" : "#fff", border: "none", borderRadius: 8, cursor: selected === null ? "not-allowed" : "pointer", fontWeight: 600 }}>
              Submit answer
            </button>
          ) : (
            <button onClick={handleNext} style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {orderIndex >= totalQuestions ? "See results" : "Next question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
