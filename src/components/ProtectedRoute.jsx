import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#999999] text-sm">
        Memuat...
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
