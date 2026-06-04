import { Link } from 'react-router-dom'
import { useOccurrences } from '../../hooks/useOccurrences'

export default function DashboardPage() {
  const { data } = useOccurrences(0)

  const total = data?.totalElements ?? 0
  const resolvidas = data?.content.filter(o => o.status === 'RESOLVIDA').length ?? 0
  const pendentes = data?.content.filter(o => o.status === 'PENDENTE').length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">Painel Admin</h1>
        <Link to="/home" className="text-sm text-gray-500 hover:text-gray-800">← Voltar ao site</Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Visão geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[{ label: 'Total de ocorrências', value: total, color: 'text-blue-700 bg-blue-50' },
            { label: 'Pendentes', value: pendentes, color: 'text-yellow-700 bg-yellow-50' },
            { label: 'Resolvidas', value: resolvidas, color: 'text-green-700 bg-green-50' }]
            .map(card => (
              <div key={card.label} className={`rounded-xl p-5 ${card.color} border border-opacity-20`}>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm mt-1 opacity-80">{card.label}</p>
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/moderacao" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-800">Moderação</p>
            <p className="text-sm text-gray-500 mt-1">Gerenciar e resolver ocorrências</p>
          </Link>
          <Link to="/admin/usuarios" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-800">Usuários</p>
            <p className="text-sm text-gray-500 mt-1">Visualizar e gerenciar usuários</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
