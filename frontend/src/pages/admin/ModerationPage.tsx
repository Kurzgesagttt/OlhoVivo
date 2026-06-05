import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'
import { occurrenceService } from '../../services/occurrence.service'

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  RESOLVIDA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
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
    <PageShell>
      <AppHeader title="Moderacao" subtitle="Gerencie status de ocorrencias" backTo="/admin/dashboard" />
      <PageContainer className="space-y-4">
        {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>}

        <div className="space-y-3">
          {data?.content.map(ocorrencia => (
            <Card key={ocorrencia.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link to={`/ocorrencias/${ocorrencia.id}`} className="block truncate font-medium text-zinc-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400">
                  {ocorrencia.titulo}
                </Link>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{ocorrencia.categoria.nome} - {new Date(ocorrencia.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[ocorrencia.status]}`}>
                  {ocorrencia.status === 'PENDENTE' ? 'Pendente' : 'Resolvida'}
                </span>
                {ocorrencia.status === 'PENDENTE' ? (
                  <Button type="button" variant="primary" onClick={() => alterarStatus(ocorrencia.id, 'RESOLVIDA')} className="min-h-9 px-3 text-xs">Resolver</Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={() => alterarStatus(ocorrencia.id, 'PENDENTE')} className="min-h-9 px-3 text-xs">Reabrir</Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-4">
            <Button type="button" disabled={data.first} onClick={() => setPage(current => current - 1)}>Anterior</Button>
            <span className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">{page + 1} / {data.totalPages}</span>
            <Button type="button" disabled={data.last} onClick={() => setPage(current => current + 1)}>Proxima</Button>
          </div>
        )}
      </PageContainer>
    </PageShell>
  )
}
