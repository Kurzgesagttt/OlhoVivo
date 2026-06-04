import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OccurrenceDetailPage from './pages/OccurrenceDetailPage'
import CreateOccurrencePage from './pages/CreateOccurrencePage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/admin/DashboardPage'
import ModerationPage from './pages/admin/ModerationPage'
import UsersPage from './pages/admin/UsersPage'

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
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/moderacao" element={<ModerationPage />} />
        <Route path="/admin/usuarios" element={<UsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
