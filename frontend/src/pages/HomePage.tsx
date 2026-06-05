import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOccurrences } from '../hooks/useOccurrences'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useNeighborhoods } from '../hooks/useNeighborhoods'
import { PageShell } from '../components/ui'
import type { Ocorrencia } from '../types/occurrence'

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  RESOLVIDA: 'Resolvida',
}

const STATUS_STYLE: Record<string, string> = {
  PENDENTE: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
  RESOLVIDA: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
}

const CATEGORY_STYLE = [
  'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
  'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
  'bg-lime-50 text-lime-700 ring-lime-100 dark:bg-lime-950 dark:text-lime-200 dark:ring-lime-800',
  'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950 dark:text-orange-200 dark:ring-orange-800',
  'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800',
]

const NEIGHBORHOOD_DOT_COLORS = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-lime-500',
  'bg-fuchsia-500',
  'bg-teal-500',
  'bg-sky-500',
]

type SortMode = 'hot' | 'recent' | 'top'

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

function getCategoryStyle(index: number) {
  return CATEGORY_STYLE[index % CATEGORY_STYLE.length]
}

function getCategoryIcon(icon: string | null, name: string) {
  const key = (icon ?? name).toLowerCase()

  if (key.includes('alert')) return '!'
  if (key.includes('calendar') || key.includes('evento')) return '#'
  if (key.includes('news') || key.includes('noticia')) return 'N'
  if (key.includes('bell') || key.includes('alerta')) return 'A'
  if (key.includes('tools') || key.includes('servico')) return 'S'

  return '-'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [bairroSelecionado, setBairroSelecionado] = useState('Todos')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  const [sortMode, setSortMode] = useState<SortMode>('hot')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
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
  const totalResolvidas = ocorrencias.filter(ocorrencia => ocorrencia.status === 'RESOLVIDA').length
  const totalVotos = ocorrencias.reduce((total, ocorrencia) => total + ocorrencia.votosCount, 0)

  return (
    <PageShell>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              OB
            </span>
            <span className="hidden sm:inline">Olho do Bairro</span>
          </Link>

          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 text-sm text-zinc-500 focus-within:border-emerald-500 focus-within:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:focus-within:bg-zinc-900">
            <span aria-hidden="true" className="text-base">/</span>
            <span className="sr-only">Buscar ocorrencias</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {darkMode ? '☼' : '☾'}
            </button>

            {usuario ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900 sm:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    {getInitials(usuario.nome)}
                  </span>
                  <span className="max-w-28 truncate text-sm text-zinc-700 dark:text-zinc-200">{usuario.nome}</span>
                </div>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="min-h-11 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden min-h-11 items-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 sm:flex"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="hidden min-h-11 items-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 sm:flex"
                >
                  Registrar
                </Link>
              </>
            )}
            <Link
              to="/ocorrencias/nova"
              className="flex min-h-11 items-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Criar
            </Link>
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
                      ? 'bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
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
                <div className="px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">Carregando...</div>
              )}
              {bairros.length > 4 && (
                <button
                  type="button"
                  onClick={() => setMostrarTodosBairros(current => !current)}
                  className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
            <div className="space-y-1">
              <button
                onClick={() => setCategoriaSelecionada('Todas')}
                className={`flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm ${
                  categoriaSelecionada === 'Todas'
                    ? 'bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span aria-hidden="true" className="w-5 text-center text-sm">-</span>
                Todas
              </button>

              {isLoadingCategorias && (
                <div className="px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">Carregando...</div>
              )}

              {categorias.map((categoria, index) => (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaSelecionada(categoria.nome)}
                  className={`flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm ${
                    categoriaSelecionada === categoria.nome
                      ? 'bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 items-center justify-center rounded-sm text-xs ring-1 ${getCategoryStyle(index)}`}
                  >
                    {getCategoryIcon(categoria.icone, categoria.nome)}
                  </span>
                  {categoria.nome}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Mapa do bairro">
            <Link
              to="/ocorrencias/nova"
              className="flex h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-center text-sm text-zinc-600 hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-950"
            >
              <span className="text-2xl text-emerald-700 dark:text-emerald-400" aria-hidden="true">+</span>
              Informar ponto no mapa
            </Link>
          </Panel>

          <Panel title="Resumo">
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="Posts" value={String(data?.totalElements ?? ocorrencias.length)} />
              <StatBox label="Pendentes" value={String(totalPendentes)} />
              <StatBox label="Resolvidas" value={String(totalResolvidas)} />
              <StatBox label="Votos" value={String(totalVotos)} />
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
                    <span className="ml-2 font-medium text-zinc-800 hover:text-emerald-700 dark:text-zinc-200 dark:hover:text-emerald-400">{ocorrencia.titulo}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-500">{ocorrencia.votosCount} votos</span>
                  </Link>
                ))}
            </div>
          </Panel>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center gap-2">
              {([
                ['hot', 'Em alta'],
                ['recent', 'Recentes'],
                ['top', 'Mais votadas'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`min-h-10 rounded-full px-4 text-sm font-medium ${
                    sortMode === mode
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {label}
                </button>
              ))}
              <Link
                to="/ocorrencias/nova"
                className="ml-auto hidden min-h-10 items-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex"
              >
                Nova ocorrencia
              </Link>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
            <select
              value={bairroSelecionado}
              onChange={event => setBairroSelecionado(event.target.value)}
              aria-label="Filtrar por bairro"
              className="min-h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
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
              className="min-h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option>Todas</option>
              {categorias.map(categoria => (
                <option key={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Carregando ocorrencias...
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              Nao foi possivel carregar as ocorrencias. Tente novamente em instantes.
            </div>
          )}

          <div className="space-y-3">
            {ocorrenciasFiltradas.map((ocorrencia, index) => (
              <OccurrencePostCard key={ocorrencia.id} ocorrencia={ocorrencia} categoryIndex={index} />
            ))}
          </div>

          {!isLoading && ocorrenciasFiltradas.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Nenhuma ocorrencia encontrada.</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Ajuste os filtros ou publique um novo relato.</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                disabled={data.first}
                onClick={() => setPage(currentPage => currentPage - 1)}
                className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{page + 1} / {data.totalPages}</span>
              <button
                disabled={data.last}
                onClick={() => setPage(currentPage => currentPage + 1)}
                className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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

function OccurrencePostCard({ ocorrencia, categoryIndex }: { ocorrencia: Ocorrencia; categoryIndex: number }) {
  return (
    <Link
      to={`/ocorrencias/${ocorrencia.id}`}
      className="group grid grid-cols-[44px_minmax(0,1fr)] overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:grid-cols-[44px_minmax(0,1fr)_104px]"
    >
      <div className="flex flex-col items-center gap-1 bg-zinc-50 px-2 py-3 dark:bg-zinc-950">
        <span aria-hidden="true" className="text-lg leading-none text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">^</span>
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{ocorrencia.votosCount}</span>
        <span aria-hidden="true" className="text-lg leading-none text-zinc-300 dark:text-zinc-600">v</span>
      </div>

      <article className="min-w-0 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getCategoryStyle(categoryIndex)}`}>
            {ocorrencia.categoria.nome}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {ocorrencia.bairro?.nome ? `em ${ocorrencia.bairro.nome}` : 'sem bairro'}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">por morador - {formatRelativeDate(ocorrencia.criadoEm)}</span>
          <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[ocorrencia.status]}`}>
            {STATUS_LABEL[ocorrencia.status]}
          </span>
        </div>

        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-950 group-hover:text-emerald-800 dark:text-zinc-100 dark:group-hover:text-emerald-400">
          {ocorrencia.titulo}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{ocorrencia.descricao}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Comentarios</span>
          <span className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Compartilhar</span>
          {ocorrencia.endereco && <span className="truncate rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">{ocorrencia.endereco}</span>}
        </div>
      </article>

      <div className="hidden items-center justify-center bg-zinc-50 dark:bg-zinc-950 sm:flex">
        {ocorrencia.imagensUrl.length > 0 ? (
          <img
            src={ocorrencia.imagensUrl[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl text-zinc-300 dark:text-zinc-700" aria-hidden="true">o</span>
        )}
      </div>
    </Link>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-950">
      <div className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}
