import { Link } from 'react-router-dom'
import { AppHeader, Card, PageContainer, PageShell } from '../../components/ui'
import { useOccurrences } from '../../hooks/useOccurrences'

const metricStyle = {
  total: 'bg-status-progress/10 text-status-progress',
  pending: 'bg-status-pending/10 text-status-pending',
  progress: 'bg-status-progress/10 text-status-progress',
  done: 'bg-status-done/10 text-status-done',
  closed: 'bg-status-closed/10 text-status-closed',
}

export default function DashboardPage() {
  const { data } = useOccurrences(0)

  const total = data?.totalElements ?? 0
  const concluidas = data?.content.filter(ocorrencia => ocorrencia.status === 'CONCLUIDA' || ocorrencia.status === 'RESOLVIDA').length ?? 0
  const emAndamento = data?.content.filter(ocorrencia => ocorrencia.status === 'EM_ANDAMENTO').length ?? 0
  const encerradas = data?.content.filter(ocorrencia => ocorrencia.status === 'ENCERRADA').length ?? 0
  const pendentes = data?.content.filter(ocorrencia => ocorrencia.status === 'PENDENTE').length ?? 0

  return (
    <PageShell>
      <AppHeader title="Painel Admin" subtitle="Visao geral do sistema" actions={<Link to="/home" className="text-sm font-medium text-zinc-600 hover:text-brand dark:text-muted dark:hover:text-brand-100">Voltar ao site</Link>} />
      <PageContainer className="space-y-6">
        <section>
          <h1 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-foreground">Visao geral</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Total de ocorrencias', value: total, className: metricStyle.total },
              { label: 'Pendentes', value: pendentes, className: metricStyle.pending },
              { label: 'Em andamento', value: emAndamento, className: metricStyle.progress },
              { label: 'Concluidas', value: concluidas, className: metricStyle.done },
              { label: 'Encerradas', value: encerradas, className: metricStyle.closed },
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
          <AdminLink to="/admin/encerradas" title="Ocorrencias encerradas" description="Consultar ocorrencias fechadas pela equipe" />
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
          <h2 className="font-semibold text-zinc-900 dark:text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-muted">{description}</p>
        </Card>
      </div>
    )
  }

  return (
    <Link to={to ?? '#'}>
      <Card className="transition hover:border-brand/40">
        <h2 className="font-semibold text-zinc-900 dark:text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-muted">{description}</p>
      </Card>
    </Link>
  )
}
