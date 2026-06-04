import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { usuario, isLoading, logout } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>
  if (!usuario) { navigate('/login'); return null }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm">← Voltar</button>
        <h1 className="text-xl font-bold text-blue-700">Meu perfil</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{usuario.nome}</p>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {ROLE_LABEL[usuario.role] ?? usuario.role}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Membro desde</span>
              <span className="text-gray-700 font-medium">{new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/login') }}
            className="w-full mt-2 border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg text-sm transition-colors">
            Sair da conta
          </button>
        </div>
      </main>
    </div>
  )
}
