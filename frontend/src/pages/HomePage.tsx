import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOccurrences } from '../hooks/useOccurrences'
import { useAuth } from '../hooks/useAuth'

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  RESOLVIDA: 'Resolvida',
}

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  RESOLVIDA: 'bg-green-100 text-green-800',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useOccurrences(page)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">Olho do Bairro</h1>
        <div className="flex items-center gap-4">
          {usuario && <span className="text-sm text-gray-600">Olá, {usuario.nome}</span>}
          <Link to="/ocorrencias/nova" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Nova ocorrência
          </Link>
          <button onClick={() => { logout(); navigate('/login') }}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sair</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Ocorrências recentes</h2>

        {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
        {isError && <p className="text-red-500 text-sm">Erro ao carregar ocorrências.</p>}

        <div className="space-y-4">
          {data?.content.map(o => (
            <Link to={`/ocorrencias/${o.id}`} key={o.id}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{o.titulo}</p>
                  <p className="text-sm text-gray-500 mt-1">{o.categoria.nome}{o.bairro ? ` · ${o.bairro.nome}` : ''}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span>▲ {o.votosCount} votos</span>
                <span>{new Date(o.criadoEm).toLocaleDateString('pt-BR')}</span>
              </div>
            </Link>
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={data.first} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
              ← Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
            <button disabled={data.last} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
              Próxima →
            </button>
          </div>
        )}

        {data?.content.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-12">Nenhuma ocorrência encontrada.</p>
        )}
      </main>
    </div>
  )
}
