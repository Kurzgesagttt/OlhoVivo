import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { useComments, useCreateComment } from '../hooks/useComments'
import { useDeleteOccurrence, useOccurrence, useOccurrences } from '../hooks/useOccurrences'
import { useVote } from '../hooks/useVote'
import { PageShell } from '../components/ui'
import type { Comentario } from '../types/comment'
import type { Ocorrencia } from '../types/occurrence'

const MAX_COMENTARIO = 500

const CATEGORY_STYLE = [
  'bg-red-50 text-red-700 ring-red-100 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
  'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
  'bg-lime-50 text-lime-700 ring-lime-100 dark:bg-lime-950 dark:text-lime-200 dark:ring-lime-800',
  'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950 dark:text-orange-200 dark:ring-orange-800',
  'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800',
]

const NEARBY_ICON_STYLE = [
  'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
]

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function getCategoryStyle(id: string | undefined) {
  const index = id ? id.charCodeAt(0) : 0
  return CATEGORY_STYLE[index % CATEGORY_STYLE.length]
}

function getCategoryIcon(name: string | undefined) {
  const key = (name ?? '').toLowerCase()

  if (key.includes('alert')) return '!'
  if (key.includes('evento')) return '#'
  if (key.includes('noticia')) return 'N'
  if (key.includes('servico')) return 'S'

  return 'O'
}

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { data: ocorrencia, isLoading, isError } = useOccurrence(id!)
  const { data: comentariosPage } = useComments(id!)
  const { data: ocorrenciasPage } = useOccurrences(0)
  const { votar, removerVoto, isVoting } = useVote(id!)
  const createComment = useCreateComment(id!)
  const deleteOccurrence = useDeleteOccurrence()
  const [novoComentario, setNovoComentario] = useState('')
  const [erroComentario, setErroComentario] = useState('')
  const [erroVoto, setErroVoto] = useState('')
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false)

  const podeAdministrar = usuario?.role === 'ADMIN' || usuario?.role === 'PREFEITURA'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark')
  }, [])

  const ocorrenciasProximas = useMemo(() => {
    const bairroAtual = ocorrencia?.bairro?.id
    return (ocorrenciasPage?.content ?? [])
      .filter(item => item.id !== ocorrencia?.id)
      .filter(item => !bairroAtual || item.bairro?.id === bairroAtual)
      .slice(0, 3)
  }, [ocorrencia, ocorrenciasPage])

  async function handleDeletar() {
    if (!confirmandoDeletar) {
      setConfirmandoDeletar(true)
      return
    }

    await deleteOccurrence.mutateAsync(id!)
    navigate('/home')
  }

  async function handleVote(action: 'add' | 'remove') {
    setErroVoto('')

    if (!usuario) {
      navigate('/login')
      return
    }

    try {
      if (action === 'add') {
        await votar()
      } else {
        await removerVoto()
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErroVoto(err.response.data.message)
      } else {
        setErroVoto(action === 'add' ? 'Voce ja confirmou esta ocorrencia.' : 'Voce ainda nao confirmou esta ocorrencia.')
      }
    }
  }

  async function enviarComentario(event: FormEvent) {
    event.preventDefault()
    setErroComentario('')

    const conteudo = novoComentario.trim()
    if (!conteudo) return

    if (conteudo.length < 3) {
      setErroComentario('Comentario deve ter pelo menos 3 caracteres.')
      return
    }

    try {
      await createComment.mutateAsync({ conteudo })
      setNovoComentario('')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErroComentario(err.response.data.message)
      } else {
        setErroComentario('Erro ao enviar comentario.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Carregando ocorrencia...
      </div>
    )
  }

  if (isError || !ocorrencia) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-red-600 dark:bg-zinc-950 dark:text-red-300">
        Ocorrencia nao encontrada.
      </div>
    )
  }

  const comentarios = comentariosPage?.content ?? []
  const autorNome = comentarios.find(comentario => comentario.usuarioId === ocorrencia.usuarioId)?.nomeUsuario ?? 'Morador'
  const novaOcorrenciaPath = usuario ? '/ocorrencias/nova' : '/login'

  return (
    <PageShell>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/home" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">OB</span>
            <span className="hidden sm:inline">Olho do Bairro</span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 sm:flex">
            <span>/</span>
            <Link to="/home" className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">Feed</Link>
            {ocorrencia.bairro && (
              <>
                <span>/</span>
                <span>{ocorrencia.bairro.nome}</span>
              </>
            )}
            <span>/</span>
            <span className="truncate">{ocorrencia.titulo}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="min-h-10 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Voltar
            </button>
            <Link
              to={novaOcorrenciaPath}
              className="hidden min-h-10 items-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 sm:flex"
            >
              Criar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-4">
          <PostCard
            ocorrencia={ocorrencia}
            autorNome={autorNome}
            onVote={() => handleVote('add')}
            onRemoveVote={() => handleVote('remove')}
            isVoting={isVoting}
            erroVoto={erroVoto}
            podeAdministrar={podeAdministrar}
            confirmandoDeletar={confirmandoDeletar}
            deleting={deleteOccurrence.isPending}
            onDelete={handleDeletar}
            onCancelDelete={() => setConfirmandoDeletar(false)}
          />

          <TimelineCard ocorrencia={ocorrencia} comentariosCount={comentariosPage?.totalElements ?? 0} />

          <CommentsCard
            comentarios={comentarios}
            total={comentariosPage?.totalElements ?? 0}
            usuarioLogado={!!usuario}
            novoComentario={novoComentario}
            erroComentario={erroComentario}
            enviando={createComment.isPending}
            onChangeComentario={value => setNovoComentario(value.slice(0, MAX_COMENTARIO))}
            onSubmit={enviarComentario}
          />
        </section>

        <aside className="space-y-4">
          <NearbyWidget ocorrencias={ocorrenciasProximas} />
          <AuthorWidget autorNome={autorNome} ocorrencia={ocorrencia} />
        </aside>
      </main>
    </PageShell>
  )
}

function PostCard({
  ocorrencia,
  autorNome,
  onVote,
  onRemoveVote,
  isVoting,
  erroVoto,
  podeAdministrar,
  confirmandoDeletar,
  deleting,
  onDelete,
  onCancelDelete,
}: {
  ocorrencia: Ocorrencia
  autorNome: string
  onVote: () => void | Promise<void>
  onRemoveVote: () => void | Promise<void>
  isVoting: boolean
  erroVoto: string
  podeAdministrar: boolean
  confirmandoDeletar: boolean
  deleting: boolean
  onDelete: () => void
  onCancelDelete: () => void
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-4 pb-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getCategoryStyle(ocorrencia.categoria.id)}`}>
            {getCategoryIcon(ocorrencia.categoria.nome)} {ocorrencia.categoria.nome}
          </span>
          {ocorrencia.bairro && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {ocorrencia.bairro.nome}
            </span>
          )}
          <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">{formatDateTime(ocorrencia.criadoEm)}</span>
        </div>

        <h1 className="text-xl font-semibold leading-snug text-zinc-950 dark:text-zinc-100">{ocorrencia.titulo}</h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
            {getInitials(autorNome)}
          </div>
          <div className="min-w-0 text-sm">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">u/{autorNome.toLowerCase().replace(/\s+/g, '_')}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Morador verificado</div>
          </div>
        </div>
      </div>

      <PhotoStrip ocorrencia={ocorrencia} />

      <p className="px-4 pb-4 text-sm leading-7 text-zinc-600 whitespace-pre-wrap dark:text-zinc-300">{ocorrencia.descricao}</p>

      <div className="mx-4 mb-4 flex h-36 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <span className="text-3xl text-emerald-700 dark:text-emerald-400" aria-hidden="true">+</span>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {ocorrencia.endereco || (ocorrencia.bairro ? `${ocorrencia.bairro.nome}, ${ocorrencia.bairro.cidade}` : 'Localizacao nao informada')}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">Referencia para exibicao no mapa</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => void onVote()}
            disabled={isVoting}
            className="px-1 text-lg leading-none text-zinc-500 hover:text-emerald-700 disabled:opacity-50 dark:hover:text-emerald-400"
          >
            ^
          </button>
          <span className="px-2 text-sm font-semibold">{ocorrencia.votosCount}</span>
          <button
            type="button"
            onClick={() => void onRemoveVote()}
            disabled={isVoting}
            className="px-1 text-lg leading-none text-zinc-400 hover:text-red-600 disabled:opacity-50"
          >
            v
          </button>
        </div>
        <button type="button" disabled title="Compartilhamento ainda nao implementado" className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-400 opacity-60 dark:border-zinc-700 dark:text-zinc-500">Compartilhar</button>
        <button type="button" disabled title="Salvar ocorrencia ainda nao implementado" className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-400 opacity-60 dark:border-zinc-700 dark:text-zinc-500">Salvar</button>
        <button
          type="button"
          onClick={() => void onVote()}
          disabled={isVoting}
          className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {isVoting ? 'Confirmando...' : 'Confirmar ocorrencia'}
        </button>

        {podeAdministrar && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={`ml-auto rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-60 ${
              confirmandoDeletar
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
            }`}
          >
            {deleting ? 'Deletando...' : confirmandoDeletar ? 'Confirmar exclusao' : 'Deletar'}
          </button>
        )}
        {confirmandoDeletar && (
          <button type="button" onClick={onCancelDelete} className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Cancelar
          </button>
        )}
        {erroVoto && <p className="basis-full text-xs text-red-600 dark:text-red-300">{erroVoto}</p>}
      </div>
    </article>
  )
}

function PhotoStrip({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  const hasImages = ocorrencia.imagensUrl.length > 0

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-4">
      {hasImages ? (
        ocorrencia.imagensUrl.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={`Imagem ${index + 1} da ocorrencia`}
            className="h-24 w-36 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
          />
        ))
      ) : (
        <>
          <PhotoPlaceholder label="Foto" tone="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200" />
          <PhotoPlaceholder label="Rua" tone="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200" />
          <PhotoPlaceholder label="Local" tone="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200" />
        </>
      )}
      <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-md border border-dashed border-zinc-300 text-2xl text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">+</div>
    </div>
  )
}

function PhotoPlaceholder({ label, tone }: { label: string; tone: string }) {
  return (
    <div className={`flex h-24 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-zinc-200 text-sm dark:border-zinc-700 ${tone}`}>
      <span className="text-2xl" aria-hidden="true">#</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

function TimelineCard({ ocorrencia, comentariosCount }: { ocorrencia: Ocorrencia; comentariosCount: number }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Atividade da comunidade
      </h2>
      <div className="space-y-0 p-4">
        <TimelineItem tone="emerald" title="Ocorrencia registrada" description="O relato foi publicado com descricao e localizacao para a comunidade." time={formatDateTime(ocorrencia.criadoEm)} />
        <TimelineItem tone="blue" title={`${ocorrencia.votosCount} moradores confirmaram`} description="Os votos ajudam a priorizar a ocorrencia no bairro." time={comentariosCount > 0 ? `${comentariosCount} comentarios na discussao` : 'Aguardando interacoes'} />
        <TimelineItem tone="zinc" title="Discussao aberta" description="Moradores podem comentar com detalhes, fotos e atualizacoes sobre o local." time="Disponivel para a comunidade" last />
      </div>
    </section>
  )
}

function TimelineItem({ tone, title, description, time, last }: { tone: 'blue' | 'emerald' | 'zinc'; title: string; description: string; time: string; last?: boolean }) {
  const toneClass = {
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    zinc: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  }[tone]

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className="absolute left-4 top-8 h-full w-px bg-zinc-200 dark:bg-zinc-800" />}
      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${toneClass}`}>*</span>
      <div className="pt-1">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
        <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</div>
        <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{time}</div>
      </div>
    </div>
  )
}

function CommentsCard({
  comentarios,
  total,
  usuarioLogado,
  novoComentario,
  erroComentario,
  enviando,
  onChangeComentario,
  onSubmit,
}: {
  comentarios: Comentario[]
  total: number
  usuarioLogado: boolean
  novoComentario: string
  erroComentario: string
  enviando: boolean
  onChangeComentario: (value: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {total} comentarios
      </h2>

      <div className="space-y-3 p-4">
        {usuarioLogado ? (
          <form onSubmit={onSubmit} className="flex gap-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">?</div>
            <div className="min-w-0 flex-1">
              <input
                value={novoComentario}
                onChange={event => onChangeComentario(event.target.value)}
                placeholder="Adicione um comentario ou atualizacao..."
                required
                maxLength={MAX_COMENTARIO}
                className="min-h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <div className="mt-1 text-right text-xs text-zinc-400">{novoComentario.length}/{MAX_COMENTARIO}</div>
            </div>
            <button type="submit" disabled={enviando} className="h-10 shrink-0 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {enviando ? '...' : 'Enviar'}
            </button>
          </form>
        ) : (
          <p className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">Faca login</Link> para comentar.
          </p>
        )}

        {erroComentario && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{erroComentario}</p>}

        {comentarios.map((comentario, index) => (
          <CommentItem
            key={comentario.id}
            comentario={comentario}
            official={index === 0 && !!comentario.nomeUsuario?.toLowerCase().includes('prefeitura')}
          />
        ))}

        {comentarios.length === 0 && (
          <p className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">Nenhum comentario ainda.</p>
        )}
      </div>
    </section>
  )
}

function CommentItem({ comentario, official }: { comentario: Comentario; official: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${official ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950'}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">{getInitials(comentario.nomeUsuario)}</span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">u/{comentario.nomeUsuario ?? 'anonimo'}</span>
        {official && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">Oficial</span>}
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">{formatDateTime(comentario.criadoEm)}</span>
      </div>
      <p className="text-sm leading-6 text-zinc-600 whitespace-pre-wrap dark:text-zinc-300">{comentario.conteudo}</p>
      <div className="mt-2 flex gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <button type="button" disabled title="Apoio em comentarios ainda nao implementado" className="opacity-50">^ Apoiar</button>
        <button type="button" disabled title="Respostas ainda nao implementadas" className="opacity-50">Responder</button>
      </div>
    </div>
  )
}

function NearbyWidget({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ocorrencias proximas</h2>
      <div className="space-y-1">
        {ocorrencias.map((ocorrencia, index) => (
          <Link key={ocorrencia.id} to={`/ocorrencias/${ocorrencia.id}`} className="flex items-center gap-3 rounded-md py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${NEARBY_ICON_STYLE[index % NEARBY_ICON_STYLE.length]}`}>
              {getCategoryIcon(ocorrencia.categoria.nome)}
            </span>
            <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{ocorrencia.titulo}</span>
            <span className="text-xs text-zinc-400">^{ocorrencia.votosCount}</span>
          </Link>
        ))}
        {ocorrencias.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma ocorrencia proxima encontrada.</p>}
      </div>
    </section>
  )
}

function AuthorWidget({ autorNome, ocorrencia }: { autorNome: string; ocorrencia: Ocorrencia }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sobre o autor</h2>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">{getInitials(autorNome)}</span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">u/{autorNome.toLowerCase().replace(/\s+/g, '_')}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{ocorrencia.bairro?.nome ?? 'Bairro nao informado'}</div>
        </div>
      </div>
      <InfoRow label="Posts" value="1+" />
      <InfoRow label="Confirmacoes" value={String(ocorrencia.votosCount)} />
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm last:border-b-0 dark:border-zinc-800">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="ml-3 truncate font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  )
}
