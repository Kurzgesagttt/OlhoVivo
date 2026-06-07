import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppHeader, Button, Card, Chip, Notice, PageContainer, PageShell, type ChipVariant } from '../components/ui'
import { useCategories } from '../hooks/useCategories'
import { useNeighborhoods } from '../hooks/useNeighborhoods'
import { useCreateOccurrence } from '../hooks/useOccurrences'
import { useAuth } from '../hooks/useAuth'
import { occurrenceService } from '../services/occurrence.service'
import type { Categoria } from '../types/occurrence'

type Severity = 'Baixa' | 'Media' | 'Alta' | 'Critica'
type SelectedImage = {
  file: File
  previewUrl: string
}

const TAGS = ['infraestrutura', 'eletrica', 'urgente', 'prefeitura', 'transito', 'seguranca']

function getCategoryVariant(categoria: Categoria): ChipVariant {
  const key = `${categoria.icone ?? ''} ${categoria.nome}`.toLowerCase()

  if (key.includes('alerta') || key.includes('bell')) return 'alerta'
  if (key.includes('evento') || key.includes('calendar')) return 'evento'
  if (key.includes('noticia') || key.includes('news')) return 'noticia'
  if (key.includes('servico') || key.includes('tools')) return 'servico'
  if (key.includes('infra')) return 'infraestrutura'

  return 'ocorrencia'
}

export default function CreateOccurrencePage() {
  const navigate = useNavigate()
  const { usuario, isLoading: isLoadingAuth } = useAuth()
  const createOccurrence = useCreateOccurrence()
  const { data: categorias = [], isLoading: isLoadingCategorias, isError: isErroCategorias } = useCategories()
  const { data: bairros = [], isLoading: isLoadingBairros, isError: isErroBairros } = useNeighborhoods()
  const [form, setForm] = useState({ titulo: '', descricao: '', categoriaId: '', bairroId: '', endereco: '', latitude: '', longitude: '' })
  const [severity, setSeverity] = useState<Severity>('Media')
  const [anonymous, setAnonymous] = useState(false)
  const [tags, setTags] = useState<string[]>(['infraestrutura'])
  const [images, setImages] = useState<SelectedImage[]>([])
  const [erro, setErro] = useState('')
  const [locationStatus, setLocationStatus] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imagesRef = useRef<SelectedImage[]>([])

  const categoriaSelecionada = useMemo(
    () => categorias.find(categoria => categoria.id === form.categoriaId),
    [categorias, form.categoriaId],
  )
  const bairroSelecionado = useMemo(
    () => bairros.find(bairro => bairro.id === form.bairroId),
    [bairros, form.bairroId],
  )

  const formProgress = useMemo(() => {
    const checks = [
      form.categoriaId,
      form.titulo.trim().length >= 5,
      form.descricao.trim().length >= 20,
      form.bairroId || form.endereco.trim() || (form.latitude && form.longitude),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [form])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => () => {
    imagesRef.current.forEach(image => URL.revokeObjectURL(image.previewUrl))
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTag(tag: string) {
    setTags(current => (
      current.includes(tag)
        ? current.filter(item => item !== tag)
        : [...current, tag]
    ))
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setErro('')
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.length === 0) return

    const validFiles: SelectedImage[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErro('Apenas arquivos de imagem sao aceitos.')
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        setErro('Cada imagem deve ter no maximo 5MB.')
        continue
      }

      validFiles.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    setImages(current => {
      const availableSlots = Math.max(0, 5 - current.length)
      const nextImages = [...current, ...validFiles.slice(0, availableSlots)]

      validFiles.slice(availableSlots).forEach(image => URL.revokeObjectURL(image.previewUrl))
      if (validFiles.length > availableSlots) {
        setErro('Voce pode adicionar no maximo 5 imagens.')
      }

      return nextImages
    })
  }

  function removeImage(index: number) {
    setImages(current => {
      const image = current[index]
      if (image) URL.revokeObjectURL(image.previewUrl)
      return current.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  function useCurrentLocation() {
    setErro('')
    setLocationStatus('')

    if (!navigator.geolocation) {
      setErro('Seu navegador nao permite obter localizacao automaticamente.')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude.toFixed(6)
        const longitude = position.coords.longitude.toFixed(6)

        setForm(prev => ({
          ...prev,
          latitude,
          longitude,
          endereco: prev.endereco || `Localizacao atual (${latitude}, ${longitude})`,
        }))
        setLocationStatus('Localizacao atual adicionada a ocorrencia.')
        setIsGettingLocation(false)
      },
      () => {
        setErro('Nao foi possivel obter sua localizacao. Verifique a permissao do navegador ou informe o endereco manualmente.')
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErro('')

    if (!form.categoriaId) {
      setErro('Selecione uma categoria.')
      return
    }
    if (form.titulo.trim().length < 5) {
      setErro('Titulo deve ter pelo menos 5 caracteres.')
      return
    }
    if (form.descricao.trim().length < 20) {
      setErro('Descricao deve ter pelo menos 20 caracteres.')
      return
    }
    if (!form.bairroId && !form.endereco.trim() && (!form.latitude || !form.longitude)) {
      setErro('Informe um bairro, endereco ou use sua localizacao atual.')
      return
    }

    try {
      const ocorrencia = await createOccurrence.mutateAsync({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        categoriaId: form.categoriaId,
        ...(form.bairroId ? { bairroId: form.bairroId } : {}),
        ...(form.endereco.trim() ? { endereco: form.endereco.trim() } : {}),
        ...(form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : {}),
      })

      if (images.length > 0) {
        await occurrenceService.adicionarImagens(ocorrencia.id, images.map(image => image.file))
      }

      navigate(`/ocorrencias/${ocorrencia.id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErro(err.response.data.message)
      } else {
        setErro('Erro ao criar ocorrencia. Tente novamente.')
      }
    }
  }

  return (
    <PageShell>
      <AppHeader title="Nova ocorrencia" subtitle="Registre um problema do bairro" backTo="back" />
      <PageContainer>
        {isLoadingAuth && (
          <Card>
            <p className="text-sm text-zinc-500 dark:text-muted">Verificando sua sessao...</p>
          </Card>
        )}

        {!isLoadingAuth && !usuario && (
          <Card className="mx-auto max-w-xl space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950 dark:text-foreground">Entre para registrar uma ocorrencia</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-muted">
                Apenas usuarios logados podem publicar novas ocorrencias no bairro.
              </p>
            </div>
            <Button type="button" variant="primary" onClick={() => navigate('/login')}>
              Entrar
            </Button>
          </Card>
        )}

        {!isLoadingAuth && usuario && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-w-0 space-y-4">
              <Card className="flex flex-wrap items-center gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-zinc-950 dark:text-foreground">Nova ocorrencia</h1>
                  <p className="text-sm text-zinc-500 dark:text-muted">Preencha os detalhes principais antes de publicar.</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="hidden h-2 w-36 overflow-hidden rounded-full bg-zinc-100 dark:bg-surface-muted sm:block">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${formProgress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-muted">{formProgress}%</span>
                </div>
              </Card>

              <Card className="space-y-3">
                <SectionTitle icon="*" title="Tipo de ocorrencia" required />
                {isErroCategorias && <Notice tone="danger">Nao foi possivel carregar as categorias.</Notice>}
                <div className="flex flex-wrap gap-2">
                  {isLoadingCategorias && (
                    <p className="w-full text-sm text-zinc-500 dark:text-muted">Carregando categorias...</p>
                  )}
                  {categorias.map(categoria => {
                    const selected = form.categoriaId === categoria.id
                    return (
                      <button
                        key={categoria.id}
                        type="button"
                        onClick={() => set('categoriaId', categoria.id)}
                        className="rounded-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                      >
                        <Chip
                          variant={selected ? 'active' : getCategoryVariant(categoria)}
                          className="px-4 py-2 text-sm"
                        >
                          {categoria.nome}
                        </Chip>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="space-y-4">
                <SectionTitle icon="T" title="Detalhes" />
                <div>
                  <Label required>Titulo</Label>
                  <input
                    required
                    value={form.titulo}
                    onChange={event => set('titulo', event.target.value.slice(0, 80))}
                    placeholder="Descreva brevemente o problema"
                    className={inputClass}
                  />
                  <CharacterCount value={form.titulo.length} max={80} min={5} />
                </div>
                <div>
                  <Label required>Descricao completa</Label>
                  <textarea
                    required
                    value={form.descricao}
                    onChange={event => set('descricao', event.target.value.slice(0, 600))}
                    rows={5}
                    placeholder="Detalhe o que aconteceu, quando, quem foi afetado e o que ja foi tentado."
                    className={`${inputClass} resize-y leading-6`}
                  />
                  <CharacterCount value={form.descricao.length} max={600} min={20} />
                </div>
                <div>
                  <Label>Tags relacionadas</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => {
                      const selected = tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            selected
                              ? 'border-brand/40 bg-brand/20 text-brand dark:border-brand/40 dark:bg-brand-muted dark:text-brand-100'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:border-line dark:bg-surface-muted dark:text-muted dark:hover:bg-surface-elevated'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Card>

              <Card className="space-y-3">
                <SectionTitle icon="+" title="Fotos e videos" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 5}
                  className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-brand hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-line dark:bg-surface-muted dark:hover:border-brand dark:hover:bg-brand-muted"
                >
                  <span className="text-3xl text-brand">+</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-foreground">
                    {images.length >= 5 ? 'Limite de imagens atingido' : 'Adicionar fotos'}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-subtle">JPG, PNG, WEBP ou GIF - max. 5MB cada</span>
                </button>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {images.map((image, index) => (
                      <div key={image.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-line dark:bg-surface-muted">
                        <img src={image.previewUrl} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label="Remover imagem"
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 text-xs font-bold text-white opacity-90 transition hover:bg-status-danger"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="space-y-3">
                <SectionTitle icon="P" title="Localizacao" required />
                <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                  <div>
                    <Label>Bairro</Label>
                    <select
                      value={form.bairroId}
                      onChange={event => set('bairroId', event.target.value)}
                      disabled={isLoadingBairros || isErroBairros}
                      className={inputClass}
                    >
                      <option value="">{isLoadingBairros ? 'Carregando bairros...' : 'Selecione um bairro'}</option>
                      {bairros.map(bairro => <option key={bairro.id} value={bairro.id}>{bairro.nome}</option>)}
                    </select>
                    {isErroBairros && <p className="mt-1 text-xs text-status-danger">Nao foi possivel carregar os bairros.</p>}
                  </div>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-600 transition hover:border-brand hover:bg-brand/10 disabled:cursor-wait disabled:opacity-60 dark:border-line dark:bg-surface-muted dark:text-foreground dark:hover:border-brand dark:hover:bg-brand-muted"
                  >
                    <span className="text-2xl text-brand">+</span>
                    {isGettingLocation ? 'Obtendo GPS...' : 'Usar minha localizacao'}
                  </button>
                </div>
                <div>
                  <Label>Endereco de referencia</Label>
                  <input
                    value={form.endereco}
                    onChange={event => set('endereco', event.target.value)}
                    placeholder="Rua, numero, ponto de referencia"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Latitude</Label>
                    <input
                      value={form.latitude}
                      onChange={event => set('latitude', event.target.value)}
                      placeholder="-21.6737"
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <input
                      value={form.longitude}
                      onChange={event => set('longitude', event.target.value)}
                      placeholder="-49.7425"
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </div>
                </div>
                {(form.latitude && form.longitude) && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 p-3 text-sm text-brand dark:bg-brand-muted dark:text-brand-100">
                    <span className="font-medium">Ponto marcado:</span>
                    <span>{form.latitude}, {form.longitude}</span>
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(`${form.latitude},${form.longitude}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold hover:bg-brand/10 dark:hover:bg-brand-dark"
                    >
                      Abrir mapa
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        set('latitude', '')
                        set('longitude', '')
                        setLocationStatus('')
                      }}
                      className="rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold hover:bg-brand/10 dark:hover:bg-brand-dark"
                    >
                      Limpar
                    </button>
                  </div>
                )}
                {locationStatus && <p className="text-xs text-brand dark:text-brand-100">{locationStatus}</p>}
              </Card>

              <Card className="space-y-3">
                <SectionTitle icon="!" title="Severidade" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(['Baixa', 'Media', 'Alta', 'Critica'] as Severity[]).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSeverity(option)}
                      className={`min-h-12 rounded-lg border px-3 text-sm font-semibold transition ${
                        severity === option
                          ? severityClass(option)
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-line dark:bg-surface-muted dark:text-muted dark:hover:bg-surface-elevated'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <button
                  type="button"
                  onClick={() => setAnonymous(current => !current)}
                  className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left dark:border-line dark:bg-surface-muted"
                >
                  <span className={`relative h-6 w-11 rounded-full transition ${anonymous ? 'bg-brand' : 'bg-zinc-300 dark:bg-line'}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${anonymous ? 'left-6' : 'left-1'}`} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-foreground">Publicar anonimamente</span>
                    <span className="block text-xs text-zinc-500 dark:text-muted">
                      {anonymous ? 'Seu nome nao aparecera no post.' : `Publicando como ${usuario.nome}.`}
                    </span>
                  </span>
                </button>
              </Card>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <Card className="space-y-4">
                <SectionTitle icon=">" title="Resumo" />
                <div className="space-y-2">
                  <SummaryRow label="Categoria" value={categoriaSelecionada?.nome ?? 'Pendente'} tone={categoriaSelecionada ? 'ok' : 'muted'} />
                  <SummaryRow label="Severidade" value={severity} tone={severity === 'Baixa' ? 'ok' : 'warn'} />
                  <SummaryRow label="Imagens" value={images.length > 0 ? `${images.length} anexada${images.length > 1 ? 's' : ''}` : 'Nenhuma'} tone={images.length > 0 ? 'ok' : 'muted'} />
                  <SummaryRow label="Bairro" value={bairroSelecionado?.nome ?? 'Pendente'} tone={bairroSelecionado ? 'ok' : 'muted'} />
                  <SummaryRow label="Endereco" value={form.endereco.trim() ? 'Informado' : 'Opcional'} tone={form.endereco.trim() ? 'ok' : 'muted'} />
                  <SummaryRow label="Mapa" value={form.latitude && form.longitude ? 'Marcado' : 'Pendente'} tone={form.latitude && form.longitude ? 'ok' : 'muted'} />
                  <SummaryRow label="Anonimo" value={anonymous ? 'Sim' : 'Nao'} tone="muted" />
                </div>
                {erro && <Notice tone="danger">{erro}</Notice>}
                <Button type="submit" variant="primary" disabled={createOccurrence.isPending} className="w-full">
                  {createOccurrence.isPending ? 'Publicando...' : 'Publicar ocorrencia'}
                </Button>
                <button
                  type="button"
                  disabled
                  title="Rascunhos ainda nao implementados"
                  className="min-h-10 w-full rounded-full border border-zinc-200 text-sm font-semibold text-zinc-400 disabled:cursor-not-allowed dark:border-line dark:text-subtle"
                >
                  Salvar rascunho
                </button>
              </Card>

              <Card>
                <SectionTitle icon="?" title="Dica" />
                <p className="text-sm leading-6 text-zinc-600 dark:text-muted">
                  Quanto mais claro for o titulo, a descricao e o local, mais facil fica para outros moradores confirmarem a ocorrencia.
                </p>
              </Card>
            </aside>
          </form>
        )}
      </PageContainer>
    </PageShell>
  )
}

const inputClass = 'mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:ring-brand/20'

function SectionTitle({ icon, title, required }: { icon: string; title: string; required?: boolean }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-muted">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-surface-muted dark:text-foreground">{icon}</span>
      {title}
      {required && <span className="text-status-danger">*</span>}
    </h2>
  )
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-zinc-800 dark:text-foreground">
      {children} {required && <span className="text-status-danger">*</span>}
    </label>
  )
}

function CharacterCount({ value, min, max }: { value: number; min: number; max: number }) {
  const tone = value >= min ? 'text-brand dark:text-brand-100' : 'text-zinc-400 dark:text-subtle'
  return <p className={`mt-1 text-right text-xs ${tone}`}>{value} / {max}</p>
}

function severityClass(severity: Severity) {
  if (severity === 'Baixa') return 'border-status-done/30 bg-status-done/10 text-status-done'
  if (severity === 'Media') return 'border-status-pending/30 bg-status-pending/10 text-status-pending'
  return 'border-status-danger/30 bg-status-danger/10 text-status-danger'
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warn' | 'muted' }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm last:border-b-0 dark:border-line">
      <span className="text-zinc-500 dark:text-muted">{label}</span>
      <span className={`font-semibold ${
        tone === 'ok'
          ? 'text-brand dark:text-brand-100'
          : tone === 'warn'
            ? 'text-status-pending'
            : 'text-zinc-700 dark:text-foreground'
      }`}>
        {value}
      </span>
    </div>
  )
}
