import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOccurrences } from '../hooks/useOccurrences'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useNeighborhoods } from '../hooks/useNeighborhoods'
import { useVote } from '../hooks/useVote'
import { useSavedOccurrence } from '../hooks/useSavedOccurrence'
import { BrandMark, Button, ButtonGroup, ButtonLink, Chip, PageShell, StatusBadge, VoteButton, getCategoryVariantFromName } from '../components/ui'
import type { Ocorrencia, ValorVoto } from '../types/occurrence'

const NEIGHBORHOOD_DOT_COLORS = [
  'bg-status-progress',
  'bg-category-occurrence',
  'bg-brand',
  'bg-status-pending',
  'bg-status-done',
  'bg-category-service',
  'bg-status-danger',
  'bg-category-news',
  'bg-brand-dark',
  'bg-status-closed',
  'bg-brand-hover',
]

type SortMode = 'hot' | 'recent' | 'top' | 'closed'

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))

  if (minutes < 60) return `${minutes}min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return date.toLocaleDateString('pt-BR')
}

function getInitials(name: string | undefined) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export default function HomePage() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [bairroSelecionado, setBairroSelecionado] = useState('Todos')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  const [sortMode, setSortMode] = useState<SortMode>('hot')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [mostrarTodosBairros, setMostrarTodosBairros] = useState(false)
  const { data, isLoading, isError } = useOccurrences(page)
  const { data: categorias = [], isLoading: isLoadingCategorias } = useCategories()
  const { data: bairrosData = [], isLoading: isLoadingBairros } = useNeighborhoods()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const ocorrencias = data?.content ?? []

  const bairros = useMemo(() => bairrosData.map(bairro => bairro.nome), [bairrosData])
  const bairrosVisiveis = mostrarTodosBairros ? bairros : bairros.slice(0, 4)

  const ocorrenciasFiltradas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = ocorrencias.filter(ocorrencia => {
      const isEncerrada = ocorrencia.status === 'ENCERRADA'
      if ((sortMode === 'closed' && !isEncerrada) || (sortMode !== 'closed' && isEncerrada)) {
        return false
      }

      const matchesQuery =
        !normalizedQuery ||
        ocorrencia.titulo.toLowerCase().includes(normalizedQuery) ||
        ocorrencia.descricao.toLowerCase().includes(normalizedQuery) ||
        ocorrencia.categoria.nome.toLowerCase().includes(normalizedQuery) ||
        ocorrencia.bairro?.nome.toLowerCase().includes(normalizedQuery)

      const matchesBairro =
        bairroSelecionado === 'Todos' || ocorrencia.bairro?.nome === bairroSelecionado

      const matchesCategoria =
        categoriaSelecionada === 'Todas' || ocorrencia.categoria.nome === categoriaSelecionada

      return matchesQuery && matchesBairro && matchesCategoria
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'closed') {
        return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()
      }

      if (sortMode === 'recent') {
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      }

      if (sortMode === 'top') {
        return b.votosCount - a.votosCount
      }

      const scoreA = a.votosCount * 2 + (a.status === 'PENDENTE' ? 8 : 0)
      const scoreB = b.votosCount * 2 + (b.status === 'PENDENTE' ? 8 : 0)
      return scoreB - scoreA
    })
  }, [bairroSelecionado, categoriaSelecionada, ocorrencias, query, sortMode])

  const totalPendentes = ocorrencias.filter(ocorrencia => ocorrencia.status === 'PENDENTE').length
  const totalConcluidas = ocorrencias.filter(ocorrencia => ocorrencia.status === 'CONCLUIDA' || ocorrencia.status === 'RESOLVIDA').length
  const totalEncerradas = ocorrencias.filter(ocorrencia => ocorrencia.status === 'ENCERRADA').length
  const totalVotos = ocorrencias.reduce((total, ocorrencia) => total + ocorrencia.votosCount, 0)
  const novaOcorrenciaPath = usuario ? '/ocorrencias/nova' : '/login'

  return (
    <PageShell>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-line dark:bg-app/95">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/home" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-foreground">
            <BrandMark />
            <span className="hidden sm:inline">Olho do Bairro</span>
          </Link>

          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 text-sm text-zinc-500 focus-within:border-brand focus-within:bg-white dark:border-line dark:bg-surface dark:text-muted dark:focus-within:bg-surface-elevated">
            <span aria-hidden="true" className="text-base">/</span>
            <span className="sr-only">Buscar ocorrencias</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-foreground dark:placeholder:text-subtle"
              placeholder="Buscar no seu bairro"
              type="search"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(current => !current)}
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated"
            >
              {darkMode ? '☼' : '☾'}
            </button>

            {usuario ? (
              <>
                <Link
                  to="/perfil"
                  title="Abrir perfil"
                  className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 transition hover:bg-zinc-100 dark:border-line dark:bg-surface dark:hover:bg-surface-elevated sm:flex"
                >
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand text-xs font-semibold text-white">
                    {usuario.fotoPerfilUrl ? (
                      <img src={usuario.fotoPerfilUrl} alt="" className="h-full w-full bg-app object-contain p-0.5" />
                    ) : (
                      getInitials(usuario.nome)
                    )}
                  </span>
                  <span className="max-w-28 truncate text-sm text-zinc-700 dark:text-foreground">{usuario.nome}</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="min-h-11 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden min-h-11 items-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated sm:flex"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="hidden min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover sm:flex"
                >
                  Registrar
                </Link>
              </>
            )}
            <ButtonLink
              to={novaOcorrenciaPath}
              variant="primary"
              size="lg"
              pill
              className="hidden sm:inline-flex"
            >
              Nova ocorrencia
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-3 lg:flex">
          <Panel title="Bairros">
            <div className="space-y-1">
              {bairrosVisiveis.map((bairro, index) => (
                <button
                  key={bairro}
                  onClick={() => setBairroSelecionado(bairro)}
                  className={`flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm ${
                    bairroSelecionado === bairro
                      ? 'bg-brand/10 font-medium text-brand dark:bg-brand-muted dark:text-brand-100'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-muted dark:hover:bg-surface-elevated'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${NEIGHBORHOOD_DOT_COLORS[index % NEIGHBORHOOD_DOT_COLORS.length]}`}
                  />
                  {bairro}
                </button>
              ))}
              {isLoadingBairros && (
                <div className="px-2 py-2 text-sm text-zinc-500 dark:text-muted">Carregando...</div>
              )}
              {bairros.length > 4 && (
                <button
                  type="button"
                  onClick={() => setMostrarTodosBairros(current => !current)}
                  className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-muted dark:hover:bg-surface-elevated"
                >
                  <span aria-hidden="true" className="w-2 text-center text-base leading-none">
                    {mostrarTodosBairros ? '-' : '+'}
                  </span>
                  {mostrarTodosBairros ? 'Ver menos' : 'Ver todos'}
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Categorias">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoriaSelecionada('Todas')}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Chip variant={categoriaSelecionada === 'Todas' ? 'active' : 'default'} className="px-3 py-1">
                  Todas
                </Chip>
              </button>

              {isLoadingCategorias && (
                <div className="w-full px-2 py-2 text-sm text-zinc-500 dark:text-muted">Carregando...</div>
              )}

              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => setCategoriaSelecionada(categoria.nome)}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <Chip
                    variant={categoriaSelecionada === categoria.nome ? 'active' : getCategoryVariantFromName(categoria.nome, categoria.icone)}
                    className="px-3 py-1"
                  >
                    {categoria.nome}
                  </Chip>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Mapa do bairro">
            <Link
              to={novaOcorrenciaPath}
              className="flex h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-center text-sm text-zinc-600 hover:border-brand hover:bg-brand/10 dark:border-line dark:bg-surface-muted dark:text-muted dark:hover:border-brand dark:hover:bg-brand-muted"
            >
              <span className="text-2xl text-brand" aria-hidden="true">+</span>
              Informar ponto no mapa
            </Link>
          </Panel>

          <Panel title="Resumo">
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="Posts" value={String(data?.totalElements ?? ocorrencias.length)} />
              <StatBox label="Pendentes" value={String(totalPendentes)} />
              <StatBox label="Concluidas" value={String(totalConcluidas)} />
              <StatBox label="Encerradas" value={String(totalEncerradas)} />
              <StatBox label="Pontuacao" value={String(totalVotos)} />
            </div>
          </Panel>

          <Panel title="Em destaque">
            <div className="space-y-3">
              {ocorrencias
                .slice()
                .sort((a, b) => b.votosCount - a.votosCount)
                .slice(0, 3)
                .map((ocorrencia, index) => (
                  <Link key={ocorrencia.id} to={`/ocorrencias/${ocorrencia.id}`} className="block text-sm">
                    <span className="text-xs text-zinc-400">#{index + 1}</span>
                    <span className="ml-2 font-medium text-zinc-800 hover:text-brand dark:text-foreground dark:hover:text-brand-100">{ocorrencia.titulo}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-subtle">{ocorrencia.votosCount} pontos</span>
                  </Link>
                ))}
            </div>
          </Panel>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 rounded-lg border border-zinc-200 bg-white p-2 dark:border-line dark:bg-surface">
            <div className="flex flex-wrap items-center gap-2">
              <ButtonGroup
                value={sortMode}
                onChange={value => setSortMode(value as SortMode)}
                options={[
                  { value: 'hot', label: 'Em alta' },
                  { value: 'recent', label: 'Recentes' },
                  { value: 'top', label: 'Mais pontuadas' },
                  { value: 'closed', label: 'Encerradas' },
                ]}
              />
              <ButtonLink
                to={novaOcorrenciaPath}
                variant="primary"
                size="md"
                pill
                className="ml-auto"
              >
                Nova ocorrencia
              </ButtonLink>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
            <select
              value={bairroSelecionado}
              onChange={event => setBairroSelecionado(event.target.value)}
              aria-label="Filtrar por bairro"
              className="min-h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-800 dark:border-line dark:bg-surface dark:text-foreground"
            >
              <option>Todos</option>
              {bairros.map(bairro => (
                <option key={bairro}>{bairro}</option>
              ))}
            </select>
            <select
              value={categoriaSelecionada}
              onChange={event => setCategoriaSelecionada(event.target.value)}
              aria-label="Filtrar por categoria"
              className="min-h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-800 dark:border-line dark:bg-surface dark:text-foreground"
            >
              <option>Todas</option>
              {categorias.map(categoria => (
                <option key={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-line dark:bg-surface dark:text-muted">
              Carregando ocorrencias...
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 p-6 text-sm text-status-danger">
              Nao foi possivel carregar as ocorrencias. Tente novamente em instantes.
            </div>
          )}

          <div className="space-y-3">
            {ocorrenciasFiltradas.map(ocorrencia => (
              <OccurrencePostCard
                key={ocorrencia.id}
                ocorrencia={ocorrencia}
                usuarioLogado={!!usuario}
              />
            ))}
          </div>

          {!isLoading && ocorrenciasFiltradas.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-line dark:bg-surface">
              <p className="text-sm font-medium text-zinc-800 dark:text-foreground">Nenhuma ocorrencia encontrada.</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-muted">Ajuste os filtros ou publique um novo relato.</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                disabled={data.first}
                onClick={() => setPage(currentPage => currentPage - 1)}
                className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:border-line dark:bg-surface dark:text-foreground dark:hover:bg-surface-elevated"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500 dark:text-muted">{page + 1} / {data.totalPages}</span>
              <button
                disabled={data.last}
                onClick={() => setPage(currentPage => currentPage + 1)}
                className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:border-line dark:bg-surface dark:text-foreground dark:hover:bg-surface-elevated"
              >
                Proxima
              </button>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  )
}

function OccurrencePostCard({
  ocorrencia,
  usuarioLogado,
}: {
  ocorrencia: Ocorrencia
  usuarioLogado: boolean
}) {
  const navigate = useNavigate()
  const { votar, isVoting } = useVote(ocorrencia.id)
  const { salvar, remover, isSaving } = useSavedOccurrence(ocorrencia.id)
  const [voteMessage, setVoteMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const hasImage = ocorrencia.imagensUrl.length > 0

  async function handleVote(valor: ValorVoto) {
    setVoteMessage('')

    if (!usuarioLogado) {
      navigate('/login')
      return
    }

    if (ocorrencia.votoDoUsuario === valor) {
      setVoteMessage('Este ja e o seu voto atual.')
      return
    }

    try {
      await votar(valor)
    } catch {
      setVoteMessage('Nao foi possivel atualizar seu voto.')
    }
  }

  async function handleSave() {
    setSaveMessage('')

    if (!usuarioLogado) {
      navigate('/login')
      return
    }

    try {
      if (ocorrencia.salvoPeloUsuario) {
        await remover()
      } else {
        await salvar()
      }
    } catch {
      setSaveMessage('Nao foi possivel atualizar o salvamento.')
    }
  }

  return (
    <article
      className={`group grid grid-cols-[44px_minmax(0,1fr)] overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-zinc-300 dark:border-line dark:bg-surface dark:hover:border-muted ${
        hasImage ? 'sm:grid-cols-[44px_minmax(0,1fr)_104px]' : ''
      }`}
    >
      <div className="flex items-start justify-center bg-zinc-50 px-2 py-3 dark:bg-surface-muted">
        <VoteButton
          count={ocorrencia.votosCount}
          voted={ocorrencia.votadoPeloUsuario}
          voteValue={ocorrencia.votoDoUsuario}
          disabled={isVoting}
          orientation="vertical"
          onVote={direction => void handleVote(direction === 'up' ? 1 : -1)}
        />
        {voteMessage && <span className="sr-only" role="status">{voteMessage}</span>}
      </div>

      <div className="min-w-0 p-4">
        <Link to={`/ocorrencias/${ocorrencia.id}`} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Chip
            variant={getCategoryVariantFromName(ocorrencia.categoria.nome, ocorrencia.categoria.icone)}
          >
            {ocorrencia.categoria.nome}
          </Chip>
          <span className="text-xs text-zinc-500 dark:text-muted">
            {ocorrencia.bairro?.nome ? `em ${ocorrencia.bairro.nome}` : 'sem bairro'}
          </span>
          <span className="text-xs text-zinc-400 dark:text-subtle">por morador - {formatRelativeDate(ocorrencia.criadoEm)}</span>
          <StatusBadge status={ocorrencia.status} className="ml-auto" />
        </div>

        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-950 group-hover:text-brand dark:text-foreground dark:group-hover:text-brand-100">
          {ocorrencia.titulo}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-muted">{ocorrencia.descricao}</p>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="info-soft"
            size="sm"
            pill
            onClick={() => navigate(`/ocorrencias/${ocorrencia.id}`)}
          >
            Comentarios
          </Button>
          <Button
            type="button"
            variant={ocorrencia.salvoPeloUsuario ? 'success-soft' : 'ghost'}
            size="sm"
            pill
            loading={isSaving}
            onClick={() => void handleSave()}
          >
            {ocorrencia.salvoPeloUsuario ? 'Salvo' : 'Salvar'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            pill
            disabled
            title="Compartilhamento ainda nao implementado"
          >
            Compartilhar
          </Button>
          {ocorrencia.endereco && <span className="truncate rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-surface-elevated">{ocorrencia.endereco}</span>}
        </div>
        {saveMessage && <span className="sr-only" role="status">{saveMessage}</span>}
      </div>

      {hasImage && (
        <Link to={`/ocorrencias/${ocorrencia.id}`} className="hidden items-center justify-center bg-zinc-50 dark:bg-surface-muted sm:flex">
          <img
            src={ocorrencia.imagensUrl[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
      )}
    </article>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-line dark:bg-surface">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-muted">{title}</h2>
      {children}
    </section>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-100 p-3 dark:bg-surface-muted">
      <div className="text-lg font-semibold text-zinc-950 dark:text-foreground">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-muted">{label}</div>
    </div>
  )
}
