import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import type { Usuario } from '../../types/auth'
import type { PageResponse } from '../../types/api'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

const ROLE_COLOR: Record<string, string> = {
  MORADOR: 'bg-gray-100 text-gray-700',
  MODERADOR: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  PREFEITURA: 'bg-orange-100 text-orange-700',
}

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setIsLoading(true)
    api.get<PageResponse<Usuario>>('/admin/usuarios', { params: { page, size: 20 } })
      .then(r => { setUsuarios(r.data.content); setTotal(r.data.totalElements); setTotalPages(r.data.totalPages) })
      .catch(() => setErro('Não foi possível carregar os usuários.'))
      .finally(() => setIsLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800 text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold text-blue-700">Usuários</h1>
        </div>
        <span className="text-sm text-gray-500">{total} usuários</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <div className="space-y-3">
          {usuarios.map(u => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {u.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{u.nome}</p>
                  <p className="text-xs text-gray-400">Desde {new Date(u.criadoEm).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-700'}`}>
                {ROLE_LABEL[u.role] ?? u.role}
              </span>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">← Anterior</button>
            <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {totalPages}</span>
            <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">Próxima →</button>
          </div>
        )}
      </main>
    </div>
  )
}
