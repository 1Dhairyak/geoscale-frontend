import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import DashboardPage   from './pages/DashboardPage'
import QuizPage        from './pages/QuizPage'
import MatchPage       from './pages/MatchPage'
import LeaderboardPage from './pages/LeaderboardPage'
import GeoScaleMapPage from './pages/GeoScaleMapPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage     from './pages/ProfilePage'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/"           element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/quiz"        element={<QuizPage />} />
            <Route path="/match"       element={<MatchPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/map" element={<GeoScaleMapPage />} />
            <Route path="/friends"     element={<FriendsPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
