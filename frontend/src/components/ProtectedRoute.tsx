import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/occurrence'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { usuario, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-sm text-muted">
        Carregando...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/admin/login" replace />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/home" replace />
  }

  return children
}
