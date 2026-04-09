import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'

import PublicChangelog from './pages/PublicChangelog.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import EditorPage     from './pages/EditorPage.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><span className="spinner" /></div>
  if (!user)   return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"            element={<PublicChangelog />} />
      <Route path="/login"       element={<LoginPage />} />

      {/* Protected admin */}
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor"      element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      <Route path="/editor/:id"  element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}
