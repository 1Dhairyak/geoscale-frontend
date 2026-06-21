// ─────────────────────────────────────────────────────────────
// gameServices.js
// All REST API calls, grouped by feature domain.
// Uses the shared axios instance from api.js (JWT injected automatically).
// ─────────────────────────────────────────────────────────────
import api from './api'

// Auth
export const authService = {
  login:    (username, password)        => api.post('/auth/login',    { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
}

// Multiplayer match
export const matchService = {
  create:      ()              => api.post('/match/create'),
  join:        (matchId)       => api.post(`/match/join/${matchId}`),
  getQuestion: (matchId)       => api.get(`/match/${matchId}/question`),
  answer:      (matchId, body) => api.post(`/match/${matchId}/answer`, body),
  getResult:   (matchId)       => api.get(`/match/${matchId}/result`),
}

// Solo quiz sessions
export const quizService = {
  startSession:    (quizId)              => api.post(`/sessions/start/${quizId}`),
  getSession:      (sessionId)           => api.get(`/sessions/${sessionId}`),
  getQuestion:     (sessionId, index)    => api.get(`/sessions/${sessionId}/question/${index}`),
  submitAnswer:    (sessionId, body)     => api.post(`/sessions/${sessionId}/answer`, body),
  completeSession: (sessionId)           => api.patch(`/sessions/${sessionId}/complete`),
}

// Leaderboard
export const leaderboardService = {
  global:   () => api.get('/leaderboard/global'),
  accuracy: () => api.get('/leaderboard/accuracy'),
  speed:    () => api.get('/leaderboard/speed'),
}
