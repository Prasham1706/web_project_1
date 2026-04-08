import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, loading, user } = useAuth()
  const location = useLocation()

  if (loading && token) {
    return (
      <div className="app-shell app-shell--center">
        <div className="spinner" aria-label="Loading" />
        <p className="muted">Loading your workspace…</p>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
