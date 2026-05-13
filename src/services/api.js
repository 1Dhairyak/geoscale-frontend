import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('geo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally â€” clear token and redirect
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
