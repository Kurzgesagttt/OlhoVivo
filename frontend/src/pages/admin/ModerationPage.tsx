import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader, Button, ButtonGroup, Card, PageContainer, PageShell, StatusBadge, getStatusLabel } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'
import { occurrenceService } from '../../services/occurrence.service'
import type { PageResponse } from '../../types/api'
import type { Ocorrencia, StatusOcorrencia } from '../../types/occurrence'

const STATUS_OPTIONS: StatusOcorrencia[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENCERRADA']
type StatusFilter = 'TODOS' | StatusOcorrencia

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendentes' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluidas' },
  { value: 'ENCERRADA', label: 'Encerradas' },
]

function isOccurrence(data: unknown): data is Ocorrencia {
  return !!data && typeof data === 'object' && 'id' in data && 'status' in data
}

function isOccurrencePage(data: unknown): data is PageResponse<Ocorrencia> {
  return !!data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Ocorrencia>).content)
}

function replaceOccurrence(data: unknown, updatedOccurrence: Ocorrencia) {
  if (isOccurrence(data)) {
    return data.id === updatedOccurrence.id ? updatedOccurrence : data
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === updatedOccurrence.id ? updatedOccurrence : ocorrencia
      )),
    }
  }

  return data
}

function updateOccurrenceStatus(data: unknown, id: string, status: StatusOcorrencia) {
  const resolvedAt = ['CONCLUIDA', 'ENCERRADA', 'RESOLVIDA'].includes(status)
    ? new Date().toISOString()
    : null

  if (isOccurrence(data)) {
    return data.id === id ? { ...data, status, resolvidoEm: resolvedAt } : data
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === id ? { ...ocorrencia, status, resolvidoEm: resolvedAt } : ocorrencia
      )),
    }
  }

  return data
}

export default function ModerationPage() {
  const [page, setPage] = useState(0)
  const [statusFiltro, setStatusFiltro] = useState<StatusFilter>('TODOS')
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null)
  const [erroStatus, setErroStatus] = useState('')
  const { data, isLoading } = useOccurrences(page)
  const queryClient = useQueryClient()
  const ocorrencias = data?.content ?? []
  const ocorrenciasFiltradas = statusFiltro === 'TODOS'
    ? ocorrencias
    : ocorrencias.filter(ocorrencia => ocorrencia.status === statusFiltro)
  const counts = FILTER_OPTIONS.reduce<Record<StatusFilter, number>>((acc, option) => {
    acc[option.value] = option.value === 'TODOS'
      ? ocorrencias.length
      : ocorrencias.filter(ocorrencia => ocorrencia.status === option.value).length
    return acc
  }, {} as Record<StatusFilter, number>)

  async function alterarStatus(id: string, status: StatusOcorrencia) {
    setAtualizandoId(id)
    setErroStatus('')
    await queryClient.cancelQueries({ queryKey: ['ocorrencias'] })
    const previousOccurrences = queryClient.getQueriesData({ queryKey: ['ocorrencias'] })
    queryClient.setQueriesData(
      { queryKey: ['ocorrencias'] },
      current => updateOccurrenceStatus(current, id, status),
    )

    try {
      const updatedOccurrence = await occurrenceService.atualizarStatus(id, { status })
      queryClient.setQueriesData(
        { queryKey: ['ocorrencias'] },
        current => replaceOccurrence(current, updatedOccurrence),
      )
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'], refetchType: 'inactive' })
    } catch (error) {
      previousOccurrences.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      setErroStatus('Nao foi possivel atualizar o status. Tente novamente.')
    } finally {
      setAtualizandoId(null)
    }
  }

  return (
    <PageShell>
      <AppHeader title="Moderacao" subtitle="Gerencie status de ocorrencias" backTo="/admin/dashboard" />
      <PageContainer className="space-y-4">
        <Card className="overflow-x-auto">
          <ButtonGroup
            value={statusFiltro}
            onChange={value => setStatusFiltro(value as StatusFilter)}
            options={FILTER_OPTIONS.map(option => ({
              value: option.value,
              label: `${option.label} ${counts[option.value] ?? 0}`,
            }))}
          />
        </Card>

        {isLoading && <p className="text-sm text-zinc-500 dark:text-muted">Carregando...</p>}
        {erroStatus && (
          <Card className="border-status-danger/30 bg-status-danger/10 text-sm text-status-danger">
            {erroStatus}
          </Card>
        )}

        <div className="space-y-3">
          {ocorrenciasFiltradas.map(ocorrencia => (
            <Card key={ocorrencia.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link to={`/ocorrencias/${ocorrencia.id}`} className="block truncate font-medium text-zinc-900 hover:text-brand dark:text-foreground dark:hover:text-brand-100">
                  {ocorrencia.titulo}
                </Link>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-muted">{ocorrencia.categoria.nome} - {new Date(ocorrencia.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={ocorrencia.status} />
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
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!isLoading && ocorrenciasFiltradas.length === 0 && (
          <Card className="text-center text-sm text-zinc-500 dark:text-muted">
            Nenhuma ocorrencia encontrada para este filtro nesta pagina.
          </Card>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-4">
            <Button type="button" disabled={data.first} onClick={() => setPage(current => current - 1)}>Anterior</Button>
            <span className="px-4 py-2 text-sm text-zinc-500 dark:text-muted">{page + 1} / {data.totalPages}</span>
            <Button type="button" disabled={data.last} onClick={() => setPage(current => current + 1)}>Proxima</Button>
          </div>
        )}
      </PageContainer>
    </PageShell>
  )
}
