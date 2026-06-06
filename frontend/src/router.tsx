import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OccurrenceDetailPage from './pages/OccurrenceDetailPage'
import CreateOccurrencePage from './pages/CreateOccurrencePage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ModerationPage from './pages/admin/ModerationPage'

const ADMIN_ROLES = ['ADMIN', 'MODERADOR', 'PREFEITURA'] as const

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/ocorrencias/:id" element={<OccurrenceDetailPage />} />
        <Route path="/ocorrencias/nova" element={<CreateOccurrencePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={[...ADMIN_ROLES]}><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/moderacao" element={<ProtectedRoute roles={[...ADMIN_ROLES]}><ModerationPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
