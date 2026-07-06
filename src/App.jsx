import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Piket from './pages/public/Piket'
import JadwalView from './pages/public/JadwalView'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import JadwalEdit from './pages/admin/JadwalEdit'
import Gallery from './pages/admin/Gallery'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Piket />} />
      <Route path="/jadwal" element={<JadwalView />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jadwal"
        element={
          <ProtectedRoute>
            <JadwalEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/foto"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
