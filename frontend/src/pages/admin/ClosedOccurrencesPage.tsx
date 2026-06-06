import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'

export default function ClosedOccurrencesPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useOccurrences(page)
  const encerradas = (data?.content ?? []).filter(ocorrencia => ocorrencia.status === 'ENCERRADA')

  return (
    <PageShell>
      <AppHeader title="Ocorrencias encerradas" subtitle="Historico de ocorrencias fechadas pela equipe" backTo="/admin/dashboard" />
      <PageContainer className="space-y-4">
        {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>}

        <div className="space-y-3">
          {encerradas.map(ocorrencia => (
            <Card key={ocorrencia.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link to={`/ocorrencias/${ocorrencia.id}`} className="block truncate font-medium text-zinc-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400">
                  {ocorrencia.titulo}
                </Link>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {ocorrencia.categoria.nome} - {ocorrencia.bairro?.nome ?? 'Sem bairro'} - {new Date(ocorrencia.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                Encerrada
              </span>
            </Card>
          ))}
        </div>

        {!isLoading && encerradas.length === 0 && (
          <Card className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma ocorrencia encerrada encontrada nesta pagina.
          </Card>
        )}

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
