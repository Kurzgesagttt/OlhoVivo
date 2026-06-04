import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOccurrences } from '../../hooks/useOccurrences'
import { occurrenceService } from '../../services/occurrence.service'
import { useQueryClient } from '@tanstack/react-query'

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  RESOLVIDA: 'bg-green-100 text-green-800',
}

export default function ModerationPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useOccurrences(page)
  const queryClient = useQueryClient()

  async function alterarStatus(id: string, status: 'PENDENTE' | 'RESOLVIDA') {
    await occurrenceService.atualizarStatus(id, { status })
    queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800 text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold text-blue-700">Moderação</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
        <div className="space-y-3">
          {data?.content.map(o => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/ocorrencias/${o.id}`} className="font-medium text-gray-800 hover:text-blue-600 truncate block">{o.titulo}</Link>
                <p className="text-sm text-gray-500 mt-0.5">{o.categoria.nome} · {new Date(o.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>
                  {o.status === 'PENDENTE' ? 'Pendente' : 'Resolvida'}
                </span>
                {o.status === 'PENDENTE'
                  ? <button onClick={() => alterarStatus(o.id, 'RESOLVIDA')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">Resolver</button>
                  : <button onClick={() => alterarStatus(o.id, 'PENDENTE')} className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors">Reabrir</button>}
              </div>
            </div>
          ))}
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={data.first} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">← Anterior</button>
            <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
            <button disabled={data.last} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100">Próxima →</button>
          </div>
        )}
      </main>
    </div>
  )
}
