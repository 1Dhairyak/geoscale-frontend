// ─────────────────────────────────────────────────────────────
// ProtectedRoute.jsx
// Wraps any route that requires authentication.
// Shows a spinner while the auth state is being restored from
// localStorage, then either renders the children or redirects
// unauthenticated users to /login.
// ─────────────────────────────────────────────────────────────
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#11132a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
