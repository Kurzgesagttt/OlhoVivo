import { Link } from 'react-router-dom'
import { AppHeader, Card, PageContainer, PageShell } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'

const metricStyle = {
  total: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
}

export default function DashboardPage() {
  const { data } = useOccurrences(0)

  const total = data?.totalElements ?? 0
  const resolvidas = data?.content.filter(ocorrencia => ocorrencia.status === 'RESOLVIDA').length ?? 0
  const pendentes = data?.content.filter(ocorrencia => ocorrencia.status === 'PENDENTE').length ?? 0

  return (
    <PageShell>
      <AppHeader title="Painel Admin" subtitle="Visao geral do sistema" actions={<Link to="/home" className="text-sm font-medium text-zinc-600 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400">Voltar ao site</Link>} />
      <PageContainer className="space-y-6">
        <section>
          <h1 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-100">Visao geral</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total de ocorrencias', value: total, className: metricStyle.total },
              { label: 'Pendentes', value: pendentes, className: metricStyle.pending },
              { label: 'Resolvidas', value: resolvidas, className: metricStyle.done },
            ].map(card => (
              <Card key={card.label} className={card.className}>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="mt-1 text-sm opacity-80">{card.label}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminLink to="/admin/moderacao" title="Moderacao" description="Gerenciar e resolver ocorrencias" />
          <AdminLink
            title="Usuarios"
            description="Endpoint de usuarios ainda nao existe no backend"
            disabled
          />
        </section>
      </PageContainer>
    </PageShell>
  )
}

function AdminLink({ to, title, description, disabled }: { to?: string; title: string; description: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div title="Feature desabilitada: endpoint backend ainda nao implementado">
        <Card className="cursor-not-allowed opacity-60">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </Card>
      </div>
    )
  }

  return (
    <Link to={to ?? '#'}>
      <Card className="transition hover:border-emerald-300 dark:hover:border-emerald-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </Card>
    </Link>
  )
}
