import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useOccurrences } from '../hooks/useOccurrences'
import { authService } from '../services/auth.service'
import type { Ocorrencia } from '../types/occurrence'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

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
  const queryClient = useQueryClient()
  const { usuario, isLoading, logout } = useAuth()
  const { data: ocorrenciasPage } = useOccurrences(0)
  const [bio, setBio] = useState('')
  const [savingBio, setSavingBio] = useState(false)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setBio(usuario?.bio ?? '')
  }, [usuario?.bio])

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

  async function handleSaveBio(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSavingBio(true)

    try {
      await authService.atualizarPerfil({ bio })
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      setMessage('Descricao atualizada.')
    } catch (err) {
      setError(getErrorMessage(err, 'Nao foi possivel atualizar a descricao.'))
    } finally {
      setSavingBio(false)
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setMessage('')
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem valida.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A foto deve ter no maximo 5MB.')
      return
    }

    setSavingPhoto(true)
    try {
      await authService.atualizarFotoPerfil(file)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      setMessage('Foto de perfil atualizada.')
    } catch (err) {
      setError(getErrorMessage(err, 'Nao foi possivel atualizar a foto.'))
    } finally {
      setSavingPhoto(false)
    }
  }

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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={savingPhoto}
                    title="Alterar foto de perfil"
                    className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-900 bg-emerald-600 text-2xl font-semibold text-white disabled:cursor-wait"
                  >
                    {usuario.fotoPerfilUrl ? (
                      <img src={usuario.fotoPerfilUrl} alt="Foto de perfil" className="h-full w-full bg-zinc-950 object-contain p-1" />
                    ) : (
                      getInitials(usuario.nome)
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-zinc-950/80 py-1 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100">
                      {savingPhoto ? 'Salvando' : 'Trocar'}
                    </span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
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
                    {usuario.bio || 'Adicione uma descricao para contar um pouco sobre sua relacao com o bairro.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>{bairroPrincipal}</span>
                    <span>Desde {formatDate(usuario.criadoEm)}</span>
                    <span>Conta verificada</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-800 pt-5">
                  <StatBox label="Posts" value={String(minhasOcorrencias.length)} />
                  <StatBox label="Resolvidos" value={String(resolvidas)} tone="green" />
                  <StatBox label="Votos" value={String(totalVotos)} />
                </div>
              </div>
            </section>

            <Card className="space-y-3">
              <SectionTitle title="Editar perfil" />
              <form onSubmit={handleSaveBio} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-zinc-200">Descricao</label>
                  <textarea
                    value={bio}
                    onChange={event => setBio(event.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="Conte um pouco sobre voce e sua relacao com o bairro."
                    className="mt-1 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950"
                  />
                  <p className="mt-1 text-right text-xs text-zinc-500">{bio.length} / 500</p>
                </div>
                {(message || error) && (
                  <p className={`rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-900 bg-red-950 text-red-200' : 'border-emerald-900 bg-emerald-950 text-emerald-200'}`}>
                    {error || message}
                  </p>
                )}
                <Button type="submit" variant="primary" disabled={savingBio}>
                  {savingBio ? 'Salvando...' : 'Salvar descricao'}
                </Button>
              </form>
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

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: 'ok' }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-2 text-sm last:border-b-0">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-semibold ${tone === 'ok' ? 'text-emerald-400' : 'text-zinc-200'}`}>{value}</span>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message
  }
  return fallback
}
