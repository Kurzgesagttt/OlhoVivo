import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'
import { occurrenceService } from '../../services/occurrence.service'
import type { StatusOcorrencia } from '../../types/occurrence'

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  EM_ANDAMENTO: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  CONCLUIDA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  ENCERRADA: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  RESOLVIDA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
}

const STATUS_LABEL: Record<StatusOcorrencia, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluida',
  ENCERRADA: 'Encerrada',
  RESOLVIDA: 'Resolvida',
}

const STATUS_OPTIONS: StatusOcorrencia[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENCERRADA']

export default function ModerationPage() {
  const [page, setPage] = useState(0)
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null)
  const { data, isLoading } = useOccurrences(page)
  const queryClient = useQueryClient()

  async function alterarStatus(id: string, status: StatusOcorrencia) {
    setAtualizandoId(id)
    try {
      await occurrenceService.atualizarStatus(id, { status })
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
    } finally {
      setAtualizandoId(null)
    }
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
                  {STATUS_LABEL[ocorrencia.status]}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  {STATUS_OPTIONS.map(status => (
                    <Button
                      key={status}
                      type="button"
                      variant={ocorrencia.status === status ? 'primary' : 'secondary'}
                      disabled={atualizandoId === ocorrencia.id || ocorrencia.status === status}
                      onClick={() => alterarStatus(ocorrencia.id, status)}
                      className="min-h-9 px-3 text-xs"
                    >
                      {STATUS_LABEL[status]}
                    </Button>
                  ))}
                </div>
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
