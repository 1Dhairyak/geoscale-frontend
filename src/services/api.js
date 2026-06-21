// ─────────────────────────────────────────────────────────────
// api.js
// Shared axios instance.
// - Attaches the stored JWT to every request automatically.
// - On 401 / 403 responses, clears the token and redirects to /login.
// ─────────────────────────────────────────────────────────────
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every outgoing request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('geo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On auth errors, clear local state and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('geo_token')
      localStorage.removeItem('geo_username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
