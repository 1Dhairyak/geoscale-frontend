import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout      from './layouts/AppLayout'

import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/LoginPage'
import GeoScaleMapPage from './pages/GeoScaleMapPage'
import QuizPage        from './pages/QuizPage'
import MatchPage       from './pages/MatchPage'
import ProfilePage     from './pages/ProfilePage'

// Wraps all authenticated routes with the shared top navigation layout
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  )
}

// The root "/" shows a spinner while auth is being resolved, then either
// shows the marketing landing page or bounces logged-in users to /map.
function RootRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#11132a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return user ? <Navigate to="/map" replace /> : <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"      element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — all wrapped in AppLayout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/map"     element={<GeoScaleMapPage />} />
            <Route path="/quiz"    element={<QuizPage />} />
            <Route path="/match"   element={<MatchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
