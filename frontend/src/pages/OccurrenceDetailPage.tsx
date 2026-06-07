import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { useComments, useCreateComment } from '../hooks/useComments'
import { useDeleteOccurrence, useOccurrence, useOccurrences } from '../hooks/useOccurrences'
import { useVote } from '../hooks/useVote'
import { useSavedOccurrence } from '../hooks/useSavedOccurrence'
import { BrandMark, Button, ButtonLink, Chip, PageShell, VoteButton, getCategoryVariantFromName } from '../components/ui'
import type { Comentario } from '../types/comment'
import type { Ocorrencia, ValorVoto } from '../types/occurrence'

const MAX_COMENTARIO = 500

const NEARBY_ICON_STYLE = [
  'bg-status-pending/10 text-status-pending',
  'bg-brand/10 text-brand dark:bg-brand-muted dark:text-brand-100',
  'bg-status-danger/10 text-status-danger',
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

function getCategoryIcon(name: string | undefined) {
  const key = (name ?? '').toLowerCase()

  if (key.includes('alert')) return '!'
  if (key.includes('evento')) return '#'
  if (key.includes('noticia')) return 'N'
  if (key.includes('servico')) return 'S'

  return 'O'
}

function getMapUrl(ocorrencia: Ocorrencia) {
  if (ocorrencia.latitude && ocorrencia.longitude) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${ocorrencia.latitude},${ocorrencia.longitude}`)}`
  }

  const address = ocorrencia.endereco || (ocorrencia.bairro ? `${ocorrencia.bairro.nome}, ${ocorrencia.bairro.cidade}` : '')
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null
}

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { data: ocorrencia, isLoading, isError } = useOccurrence(id!)
  const { data: comentariosPage } = useComments(id!)
  const { data: ocorrenciasPage } = useOccurrences(0)
  const { votar, isVoting } = useVote(id!)
  const { salvar, remover, isSaving } = useSavedOccurrence(id!)
  const createComment = useCreateComment(id!)
  const deleteOccurrence = useDeleteOccurrence()
  const [novoComentario, setNovoComentario] = useState('')
  const [erroComentario, setErroComentario] = useState('')
  const [erroVoto, setErroVoto] = useState('')
  const [erroSalvamento, setErroSalvamento] = useState('')
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false)

  const podeAdministrar = usuario?.role === 'ADMIN' || usuario?.role === 'PREFEITURA'

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

  async function handleVote(valor: ValorVoto) {
    setErroVoto('')

    if (!ocorrencia) return

    if (!usuario) {
      navigate('/login')
      return
    }

    try {
      await votar(valor)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErroVoto(err.response.data.message)
      } else {
        setErroVoto('Nao foi possivel atualizar seu voto.')
      }
    }
  }

  async function handleSave() {
    setErroSalvamento('')

    if (!ocorrencia) return

    if (!usuario) {
      navigate('/login')
      return
    }

    try {
      if (ocorrencia.salvoPeloUsuario) {
        await remover()
      } else {
        await salvar()
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErroSalvamento(err.response.data.message)
      } else {
        setErroSalvamento('Nao foi possivel atualizar o salvamento.')
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-app dark:text-muted">
        Carregando ocorrencia...
      </div>
    )
  }

  if (isError || !ocorrencia) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-status-danger dark:bg-app">
        Ocorrencia nao encontrada.
      </div>
    )
  }

  const comentarios = comentariosPage?.content ?? []
  const autorNome = comentarios.find(comentario => comentario.usuarioId === ocorrencia.usuarioId)?.nomeUsuario ?? 'Morador'
  const novaOcorrenciaPath = usuario ? '/ocorrencias/nova' : '/login'
  const mapUrl = getMapUrl(ocorrencia)

  return (
    <PageShell>
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-line dark:bg-app/95">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/home" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-foreground">
            <BrandMark />
            <span className="hidden sm:inline">Olho do Bairro</span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 text-sm text-zinc-500 dark:text-muted sm:flex">
            <span>/</span>
            <Link to="/home" className="text-brand hover:text-brand-hover dark:text-brand-100">Feed</Link>
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
              className="min-h-10 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated"
            >
              Voltar
            </button>
            <ButtonLink
              to={novaOcorrenciaPath}
              variant="primary"
              size="md"
              pill
              className="hidden sm:inline-flex"
            >
              Nova ocorrencia
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-4">
          <PostCard
            ocorrencia={ocorrencia}
            autorNome={autorNome}
            onVote={() => handleVote(1)}
            onRemoveVote={() => handleVote(-1)}
            isVoting={isVoting}
            erroVoto={erroVoto}
            erroSalvamento={erroSalvamento}
            onSave={handleSave}
            isSaving={isSaving}
            podeAdministrar={podeAdministrar}
            confirmandoDeletar={confirmandoDeletar}
            deleting={deleteOccurrence.isPending}
            mapUrl={mapUrl}
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
  erroSalvamento,
  onSave,
  isSaving,
  podeAdministrar,
  confirmandoDeletar,
  deleting,
  mapUrl,
  onDelete,
  onCancelDelete,
}: {
  ocorrencia: Ocorrencia
  autorNome: string
  onVote: () => void | Promise<void>
  onRemoveVote: () => void | Promise<void>
  isVoting: boolean
  erroVoto: string
  erroSalvamento: string
  onSave: () => void | Promise<void>
  isSaving: boolean
  podeAdministrar: boolean
  confirmandoDeletar: boolean
  deleting: boolean
  mapUrl: string | null
  onDelete: () => void
  onCancelDelete: () => void
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-line dark:bg-surface">
      <div className="p-4 pb-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip variant={getCategoryVariantFromName(ocorrencia.categoria.nome, ocorrencia.categoria.icone)}>
            {ocorrencia.categoria.nome}
          </Chip>
          {ocorrencia.bairro && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-surface-muted dark:text-muted">
              {ocorrencia.bairro.nome}
            </span>
          )}
          <span className="ml-auto text-xs text-zinc-400 dark:text-subtle">{formatDateTime(ocorrencia.criadoEm)}</span>
        </div>

        <h1 className="text-xl font-semibold leading-snug text-zinc-950 dark:text-foreground">{ocorrencia.titulo}</h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
            {getInitials(autorNome)}
          </div>
          <div className="min-w-0 text-sm">
            <div className="font-medium text-zinc-900 dark:text-foreground">u/{autorNome.toLowerCase().replace(/\s+/g, '_')}</div>
            <div className="text-xs text-zinc-500 dark:text-muted">Morador verificado</div>
          </div>
        </div>
      </div>

      <PhotoStrip ocorrencia={ocorrencia} />

      <p className="px-4 pb-4 text-sm leading-7 text-zinc-600 whitespace-pre-wrap dark:text-muted">{ocorrencia.descricao}</p>

      <div className="mx-4 mb-4 flex h-36 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-center dark:border-line dark:bg-surface-muted">
        <span className="text-3xl text-brand" aria-hidden="true">+</span>
        <span className="text-sm text-zinc-700 dark:text-foreground">
          {ocorrencia.endereco || (ocorrencia.bairro ? `${ocorrencia.bairro.nome}, ${ocorrencia.bairro.cidade}` : 'Localizacao nao informada')}
        </span>
        {ocorrencia.latitude && ocorrencia.longitude && (
          <span className="text-xs text-zinc-500 dark:text-subtle">{ocorrencia.latitude}, {ocorrencia.longitude}</span>
        )}
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover"
          >
            Abrir no mapa
          </a>
        ) : (
          <span className="text-xs text-zinc-500 dark:text-subtle">Referencia para exibicao no mapa</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 p-4 dark:border-line">
        <VoteButton
          count={ocorrencia.votosCount}
          voted={ocorrencia.votadoPeloUsuario}
          voteValue={ocorrencia.votoDoUsuario}
          disabled={isVoting}
          onVote={direction => void (direction === 'up' ? onVote() : onRemoveVote())}
        />
        <Button type="button" variant="info-soft" size="sm" pill onClick={() => document.getElementById('comentarios')?.scrollIntoView({ behavior: 'smooth' })}>
          Comentarios
        </Button>
        <Button type="button" disabled title="Compartilhamento ainda nao implementado" variant="secondary" size="sm" pill>
          Compartilhar
        </Button>
        <Button
          type="button"
          variant={ocorrencia.salvoPeloUsuario ? 'success-soft' : 'ghost'}
          size="sm"
          pill
          loading={isSaving}
          onClick={() => void onSave()}
        >
          {ocorrencia.salvoPeloUsuario ? 'Salvo' : 'Salvar'}
        </Button>

        {podeAdministrar && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={`ml-auto rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-60 ${
              confirmandoDeletar
                ? 'bg-status-danger text-white hover:bg-status-danger/90'
                : 'border border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20'
            }`}
          >
            {deleting ? 'Deletando...' : confirmandoDeletar ? 'Confirmar exclusao' : 'Deletar'}
          </button>
        )}
        {confirmandoDeletar && (
          <button type="button" onClick={onCancelDelete} className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated">
            Cancelar
          </button>
        )}
        {erroVoto && <p className="basis-full text-xs text-status-danger">{erroVoto}</p>}
        {erroSalvamento && <p className="basis-full text-xs text-status-danger">{erroSalvamento}</p>}
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
            className="h-24 w-36 shrink-0 rounded-md border border-zinc-200 object-cover dark:border-line"
          />
        ))
      ) : (
        <>
          <PhotoPlaceholder label="Foto" tone="bg-status-pending/10 text-status-pending" />
          <PhotoPlaceholder label="Rua" tone="bg-status-progress/10 text-status-progress" />
          <PhotoPlaceholder label="Local" tone="bg-status-danger/10 text-status-danger" />
        </>
      )}
      <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-md border border-dashed border-zinc-300 text-2xl text-zinc-400 dark:border-line dark:text-subtle">+</div>
    </div>
  )
}

function PhotoPlaceholder({ label, tone }: { label: string; tone: string }) {
  return (
    <div className={`flex h-24 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-zinc-200 text-sm dark:border-line ${tone}`}>
      <span className="text-2xl" aria-hidden="true">#</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

function TimelineCard({ ocorrencia, comentariosCount }: { ocorrencia: Ocorrencia; comentariosCount: number }) {
  return (
    <section id="comentarios" className="rounded-lg border border-zinc-200 bg-white dark:border-line dark:bg-surface">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-line dark:text-muted">
        Atividade da comunidade
      </h2>
      <div className="space-y-0 p-4">
        <TimelineItem tone="emerald" title="Ocorrencia registrada" description="O relato foi publicado com descricao e localizacao para a comunidade." time={formatDateTime(ocorrencia.criadoEm)} />
        <TimelineItem tone="blue" title={`${ocorrencia.votosCount} moradores votaram`} description="Os votos ajudam a priorizar a ocorrencia no bairro." time={comentariosCount > 0 ? `${comentariosCount} comentarios na discussao` : 'Aguardando interacoes'} />
        <TimelineItem tone="zinc" title="Discussao aberta" description="Moradores podem comentar com detalhes, fotos e atualizacoes sobre o local." time="Disponivel para a comunidade" last />
      </div>
    </section>
  )
}

function TimelineItem({ tone, title, description, time, last }: { tone: 'blue' | 'emerald' | 'zinc'; title: string; description: string; time: string; last?: boolean }) {
  const toneClass = {
    blue: 'bg-status-progress/10 text-status-progress',
    emerald: 'bg-brand/10 text-brand dark:bg-brand-muted dark:text-brand-100',
    zinc: 'bg-zinc-100 text-zinc-500 dark:bg-surface-muted dark:text-muted',
  }[tone]

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className="absolute left-4 top-8 h-full w-px bg-zinc-200 dark:bg-line" />}
      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${toneClass}`}>*</span>
      <div className="pt-1">
        <div className="text-sm font-semibold text-zinc-900 dark:text-foreground">{title}</div>
        <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-muted">{description}</div>
        <div className="mt-1 text-xs text-zinc-400 dark:text-subtle">{time}</div>
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
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-line dark:bg-surface">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-line dark:text-muted">
        {total} comentarios
      </h2>

      <div className="space-y-3 p-4">
        {usuarioLogado ? (
          <form onSubmit={onSubmit} className="flex gap-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-line dark:bg-surface-muted">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">?</div>
            <div className="min-w-0 flex-1">
              <input
                value={novoComentario}
                onChange={event => onChangeComentario(event.target.value)}
                placeholder="Adicione um comentario ou atualizacao..."
                required
                maxLength={MAX_COMENTARIO}
                className="min-h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-line dark:bg-surface dark:text-foreground"
              />
              <div className="mt-1 text-right text-xs text-zinc-400 dark:text-subtle">{novoComentario.length}/{MAX_COMENTARIO}</div>
            </div>
            <Button type="submit" variant="primary" size="sm" pill loading={enviando} className="shrink-0">
              {enviando ? '...' : 'Enviar'}
            </Button>
          </form>
        ) : (
          <p className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-surface-muted dark:text-muted">
            <Link to="/login" className="font-medium text-brand hover:text-brand-hover dark:text-brand-100">Faca login</Link> para comentar.
          </p>
        )}

        {erroComentario && <p className="rounded-md border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs text-status-danger">{erroComentario}</p>}

        {comentarios.map((comentario, index) => (
          <CommentItem
            key={comentario.id}
            comentario={comentario}
            official={index === 0 && !!comentario.nomeUsuario?.toLowerCase().includes('prefeitura')}
          />
        ))}

        {comentarios.length === 0 && (
          <p className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-surface-muted dark:text-muted">Nenhum comentario ainda.</p>
        )}
      </div>
    </section>
  )
}

function CommentItem({ comentario, official }: { comentario: Comentario; official: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${official ? 'border-brand/30 bg-brand/10 dark:bg-brand-muted' : 'border-zinc-200 bg-zinc-50 dark:border-line dark:bg-surface-muted'}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-status-progress text-xs font-semibold text-white">{getInitials(comentario.nomeUsuario)}</span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-foreground">u/{comentario.nomeUsuario ?? 'anonimo'}</span>
        {official && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">Oficial</span>}
        <span className="ml-auto text-xs text-zinc-400 dark:text-subtle">{formatDateTime(comentario.criadoEm)}</span>
      </div>
      <p className="text-sm leading-6 text-zinc-600 whitespace-pre-wrap dark:text-muted">{comentario.conteudo}</p>
      <div className="mt-2 flex gap-3 text-xs font-medium text-zinc-500 dark:text-muted">
        <button type="button" disabled title="Apoio em comentarios ainda nao implementado" className="opacity-50">^ Apoiar</button>
        <button type="button" disabled title="Respostas ainda nao implementadas" className="opacity-50">Responder</button>
      </div>
    </div>
  )
}

function NearbyWidget({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-line dark:bg-surface">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-muted">Ocorrencias proximas</h2>
      <div className="space-y-1">
        {ocorrencias.map((ocorrencia, index) => (
          <Link key={ocorrencia.id} to={`/ocorrencias/${ocorrencia.id}`} className="flex items-center gap-3 rounded-md py-2 text-sm hover:bg-zinc-50 dark:hover:bg-surface-elevated">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${NEARBY_ICON_STYLE[index % NEARBY_ICON_STYLE.length]}`}>
              {getCategoryIcon(ocorrencia.categoria.nome)}
            </span>
            <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-foreground">{ocorrencia.titulo}</span>
            <span className="text-xs text-zinc-400 dark:text-subtle">^{ocorrencia.votosCount}</span>
          </Link>
        ))}
        {ocorrencias.length === 0 && <p className="text-sm text-zinc-500 dark:text-muted">Nenhuma ocorrencia proxima encontrada.</p>}
      </div>
    </section>
  )
}

function AuthorWidget({ autorNome, ocorrencia }: { autorNome: string; ocorrencia: Ocorrencia }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-line dark:bg-surface">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-muted">Sobre o autor</h2>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{getInitials(autorNome)}</span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-foreground">u/{autorNome.toLowerCase().replace(/\s+/g, '_')}</div>
          <div className="text-xs text-zinc-500 dark:text-muted">{ocorrencia.bairro?.nome ?? 'Bairro nao informado'}</div>
        </div>
      </div>
      <InfoRow label="Posts" value="1+" />
      <InfoRow label="Votos" value={String(ocorrencia.votosCount)} />
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm last:border-b-0 dark:border-line">
      <span className="text-zinc-500 dark:text-muted">{label}</span>
      <span className="ml-3 truncate font-medium text-zinc-900 dark:text-foreground">{value}</span>
    </div>
  )
}
