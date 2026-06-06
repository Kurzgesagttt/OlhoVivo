import { Link, useNavigate } from 'react-router-dom'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useOccurrences } from '../hooks/useOccurrences'
import type { Ocorrencia } from '../types/occurrence'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

const BADGES = [
  { name: 'Primeiro passo', icon: '1', earned: true },
  { name: 'Morador verificado', icon: 'V', earned: true },
  { name: 'Voz ativa', icon: '+', earned: false },
  { name: 'Influente', icon: '*', earned: false },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { usuario, isLoading, logout } = useAuth()
  const { data: ocorrenciasPage } = useOccurrences(0)

  if (isLoading) {
    return <PageShell><div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Carregando...</div></PageShell>
  }

  if (!usuario) {
    navigate('/login')
    return null
  }

  const ocorrencias = ocorrenciasPage?.content ?? []
  const minhasOcorrencias = ocorrencias.filter(ocorrencia => ocorrencia.usuarioId === usuario.id)
  const totalVotos = minhasOcorrencias.reduce((total, ocorrencia) => total + ocorrencia.votosCount, 0)
  const resolvidas = minhasOcorrencias.filter(ocorrencia => ocorrencia.status === 'RESOLVIDA').length
  const bairroPrincipal = minhasOcorrencias.find(ocorrencia => ocorrencia.bairro)?.bairro?.nome ?? 'Lins'
  const karma = minhasOcorrencias.length * 25 + totalVotos * 5 + resolvidas * 40

  return (
    <PageShell>
      <AppHeader title="Meu perfil" subtitle="Historico e participacao no bairro" backTo="back" />
      <PageContainer>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              <div className="relative h-28 bg-gradient-to-br from-emerald-600 to-emerald-950">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:18px_18px]" />
              </div>
              <div className="px-5 pb-5">
                <div className="-mt-9 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-zinc-900 bg-emerald-600 text-2xl font-semibold text-white">
                    {getInitials(usuario.nome)}
                  </div>
                  <div className="flex gap-2 pb-1">
                    <button
                      type="button"
                      disabled
                      title="Seguidores ainda nao implementados"
                      className="min-h-10 rounded-full bg-zinc-800 px-4 text-sm font-semibold text-zinc-400 disabled:cursor-not-allowed"
                    >
                      Seguir
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Mensagens ainda nao implementadas"
                      className="min-h-10 rounded-full border border-zinc-700 px-4 text-sm font-semibold text-zinc-400 disabled:cursor-not-allowed"
                    >
                      Mensagem
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold text-zinc-100">{usuario.nome}</h1>
                    <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      {ROLE_LABEL[usuario.role] ?? usuario.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">u/{usuario.nome.toLowerCase().replace(/\s+/g, '_')}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                    Morador participante do Olho de Bairro. Suas ocorrencias, votos e comentarios ajudam a organizar prioridades da comunidade.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>{bairroPrincipal}</span>
                    <span>Desde {formatDate(usuario.criadoEm)}</span>
                    <span>Conta verificada</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800 pt-5 sm:grid-cols-4">
                  <StatBox label="Posts" value={String(minhasOcorrencias.length)} />
                  <StatBox label="Resolvidos" value={String(resolvidas)} tone="green" />
                  <StatBox label="Karma" value={String(karma)} />
                  <StatBox label="Votos" value={String(totalVotos)} />
                </div>
              </div>
            </section>

            <Card className="space-y-3">
              <SectionTitle title="Conquistas" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BADGES.map(badge => (
                  <div
                    key={badge.name}
                    className={`rounded-lg border p-3 text-center ${
                      badge.earned
                        ? 'border-emerald-800 bg-emerald-950 text-emerald-200'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold">
                      {badge.icon}
                    </div>
                    <div className="text-xs font-semibold">{badge.name}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <SectionTitle title="Ocorrencias publicadas" />
              {minhasOcorrencias.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center">
                  <p className="text-sm font-medium text-zinc-300">Nenhuma ocorrencia publicada ainda.</p>
                  <Link to="/ocorrencias/nova" className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    Criar primeira ocorrencia
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {minhasOcorrencias.map(ocorrencia => <ProfileOccurrence key={ocorrencia.id} ocorrencia={ocorrencia} />)}
                </div>
              )}
            </Card>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <SectionTitle title="Karma do bairro" />
              <div className="py-3 text-center">
                <div className="text-4xl font-semibold text-emerald-400">{karma}</div>
                <div className="text-xs text-zinc-500">pontos acumulados</div>
              </div>
              <KarmaRow label="Posts" value={minhasOcorrencias.length * 25} />
              <KarmaRow label="Resolvidos" value={resolvidas * 40} />
              <KarmaRow label="Votos recebidos" value={totalVotos * 5} />
            </Card>

            <Card>
              <SectionTitle title="Impacto real" />
              <InfoRow label="Problemas registrados" value={String(minhasOcorrencias.length)} />
              <InfoRow label="Problemas resolvidos" value={String(resolvidas)} tone="ok" />
              <InfoRow label="Bairro principal" value={bairroPrincipal} />
              <InfoRow label="Precisao" value={minhasOcorrencias.length > 0 ? `${Math.round((resolvidas / minhasOcorrencias.length) * 100)}%` : '0%'} />
            </Card>

            <Card className="space-y-3">
              <SectionTitle title="Conta" />
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="w-full"
              >
                Sair da conta
              </Button>
            </Card>
          </aside>
        </div>
      </PageContainer>
    </PageShell>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-semibold ${tone === 'green' ? 'text-emerald-400' : 'text-zinc-100'}`}>{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  )
}

function ProfileOccurrence({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  return (
    <Link to={`/ocorrencias/${ocorrencia.id}`} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 py-3 hover:bg-zinc-950">
      <div className="flex flex-col items-center text-zinc-500">
        <span>^</span>
        <span className="text-xs font-semibold text-zinc-300">{ocorrencia.votosCount}</span>
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">{ocorrencia.categoria.nome}</span>
          {ocorrencia.status === 'RESOLVIDA' && <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-300">Resolvido</span>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 hover:text-emerald-300">{ocorrencia.titulo}</h3>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>{ocorrencia.bairro?.nome ?? 'Sem bairro'}</span>
          <span>{formatRelativeDate(ocorrencia.criadoEm)}</span>
        </div>
      </div>
    </Link>
  )
}

function KarmaRow({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, value)
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-semibold text-zinc-200">+{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: 'ok' }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-2 text-sm last:border-b-0">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-semibold ${tone === 'ok' ? 'text-emerald-400' : 'text-zinc-200'}`}>{value}</span>
    </div>
  )
}
