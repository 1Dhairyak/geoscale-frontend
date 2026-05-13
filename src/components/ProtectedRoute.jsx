import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-geo-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-geo-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}
