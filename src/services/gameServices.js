import api from './api'

export const authService = {
  login:    (username, password)        => api.post('/auth/login',    { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
}

export const matchService = {
  create:      ()              => api.post('/match/create'),
  join:        (matchId)       => api.post(`/match/join/${matchId}`),
  getQuestion: (matchId)       => api.get(`/match/${matchId}/question`),
  answer:      (matchId, body) => api.post(`/match/${matchId}/answer`, body),
  getResult:   (matchId)       => api.get(`/match/${matchId}/result`),
}

export const quizService = {
  startSession:    (quizId)                  => api.post(`/sessions/start/${quizId}`),
  getSession:      (sessionId)               => api.get(`/sessions/${sessionId}`),
  getQuestion:     (sessionId, orderIndex)   => api.get(`/sessions/${sessionId}/question/${orderIndex}`),
  submitAnswer:    (sessionId, body)         => api.post(`/sessions/${sessionId}/answer`, body),
  completeSession: (sessionId)               => api.patch(`/sessions/${sessionId}/complete`),
  getUserSessions: ()                        => api.get('/sessions'),
}

export const questionService = {
  getStats: (questionId) => api.get(`/questions/${questionId}/stats`),
}

export const leaderboardService = {
  global:   () => api.get('/leaderboard/global'),
  accuracy: () => api.get('/leaderboard/accuracy'),
  speed:    () => api.get('/leaderboard/speed'),
}

export const friendService = {
  list:        ()              => api.get('/friends'),
  pending:     ()              => api.get('/friends/requests/pending'),
  sent:        ()              => api.get('/friends/requests/sent'),
  sendRequest: (username)      => api.post(`/friends/request/${username}`),
  accept:      (friendshipId)  => api.post(`/friends/request/${friendshipId}/accept`),
  reject:      (friendshipId)  => api.post(`/friends/request/${friendshipId}/reject`),
  remove:      (username)      => api.delete(`/friends/${username}`),
  challenge:   (username)      => api.post(`/friends/challenge/${username}`),
}

export const inviteService = {
  send: (email, message) => api.post('/invite', { email, message }),
}
