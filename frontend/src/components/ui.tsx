import { Link, useNavigate, type LinkProps } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef } from 'react'
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react'
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const brandIconSrc = '/app-icon.png'

const brandMarkSizeClass = {
  sm: 'h-8 w-8 p-1.5',
  md: 'h-10 w-10 p-2',
  lg: 'h-12 w-12 p-2.5',
}

export function BrandMark({ size = 'sm', className }: { size?: keyof typeof brandMarkSizeClass; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-line/50', brandMarkSizeClass[size], className)}>
      <img src={brandIconSrc} alt="" className="h-full w-full object-contain" />
    </span>
  )
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-soft'
  | 'warning-soft'
  | 'success-soft'
  | 'info-soft'
  | 'link'
  | 'link-danger'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: 'border border-brand bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-hover active:bg-brand-dark',
  secondary: 'border border-zinc-300 bg-white text-zinc-900 shadow-sm shadow-black/5 hover:bg-zinc-100 dark:border-line dark:bg-surface-muted dark:text-foreground dark:hover:bg-surface-elevated',
  ghost: 'border border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-muted dark:hover:bg-surface-elevated dark:hover:text-foreground',
  danger: 'border border-status-danger bg-status-danger text-white shadow-sm shadow-status-danger/20 hover:bg-status-danger/90 active:bg-status-danger/80',
  'danger-soft': 'border border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20',
  'warning-soft': 'border border-status-pending/30 bg-status-pending/10 text-status-pending hover:bg-status-pending/20',
  'success-soft': 'border border-status-done/30 bg-status-done/10 text-status-done hover:bg-status-done/20',
  'info-soft': 'border border-status-progress/30 bg-status-progress/10 text-status-progress hover:bg-status-progress/20',
  link: 'h-auto border-none bg-transparent p-0 text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand',
  'link-danger': 'h-auto border-none bg-transparent p-0 text-status-danger underline decoration-status-danger/30 underline-offset-2 hover:decoration-status-danger',
}

const buttonSizeClass: Record<ButtonSize, string> = {
  xs: 'h-[26px] gap-1 rounded-md px-[10px] text-[11px]',
  sm: 'h-9 gap-1.5 rounded-md px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-md px-4 text-[14px]',
  lg: 'h-11 gap-2 rounded-md px-8 text-[15px]',
  xl: 'h-[52px] gap-2.5 rounded-xl px-[28px] text-[16px]',
}

// Shared action button. Use variant for visual intent and keep domain behavior in page handlers.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    pill = false,
    loading = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isLink = variant === 'link' || variant === 'link-danger'

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      {...props}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        !isLink && buttonSizeClass[size],
        !isLink && pill && 'rounded-full',
        buttonVariantClass[variant],
        fullWidth && 'w-full',
        loading && 'relative text-transparent',
        className
      )}
    >
      {loading && (
        <span
          className="absolute inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      )}
      {iconLeft && <span aria-hidden="true">{iconLeft}</span>}
      {children}
      {iconRight && <span aria-hidden="true">{iconRight}</span>}
    </button>
  )
})

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  pill = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const isLink = variant === 'link' || variant === 'link-danger'

  return (
    <Link
      {...props}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        !isLink && buttonSizeClass[size],
        !isLink && pill && 'rounded-full',
        buttonVariantClass[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {iconLeft && <span aria-hidden="true">{iconLeft}</span>}
      {children}
      {iconRight && <span aria-hidden="true">{iconRight}</span>}
    </Link>
  )
}

export interface VoteButtonProps {
  count: number
  voted?: boolean
  voteValue?: -1 | 1 | null
  onVote?: (dir: 'up' | 'down') => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function VoteButton({
  count,
  voted = false,
  voteValue,
  onVote,
  disabled = false,
  orientation = 'horizontal',
  className,
}: VoteButtonProps) {
  const activeVote = voteValue ?? (voted ? 1 : null)
  const hasActiveVote = activeVote !== null

  return (
    <div
      aria-orientation={orientation}
      className={cn(
        'inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse',
        disabled && 'opacity-60',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onVote?.('up')}
        disabled={disabled}
        aria-pressed={activeVote === 1}
        title={activeVote === 1 ? 'Seu voto positivo. Clique para remover.' : 'Votar positivo'}
        aria-label="Votar positivo"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-none rounded-s-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:z-10 hover:bg-brand/10 hover:text-brand focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed dark:border-line dark:bg-surface-muted dark:text-muted dark:hover:bg-brand-muted dark:hover:text-brand-100',
          activeVote === 1
            ? 'z-10 border-brand bg-brand text-white hover:bg-brand-hover hover:text-white dark:border-brand dark:bg-brand dark:text-white'
            : ''
        )}
      >
        <ChevronUp size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <span
        title={hasActiveVote ? 'Voce ja votou nesta ocorrencia' : undefined}
        className={cn(
          'flex h-9 min-w-11 items-center justify-center border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 dark:border-line dark:bg-surface-muted dark:text-foreground',
          activeVote === 1 && 'border-brand/40 bg-brand/10 text-brand dark:border-brand/40 dark:bg-brand-muted dark:text-brand-100',
          activeVote === -1 && 'border-status-danger/40 bg-status-danger/10 text-status-danger'
        )}
      >
        {count}
      </span>
      <button
        type="button"
        onClick={() => onVote?.('down')}
        disabled={disabled}
        aria-pressed={activeVote === -1}
        title={activeVote === -1 ? 'Seu voto negativo. Clique para remover.' : 'Votar negativo'}
        aria-label="Votar negativo"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-none rounded-e-lg border border-zinc-200 bg-white text-zinc-400 transition-colors hover:z-10 hover:bg-status-danger/10 hover:text-status-danger focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed dark:border-line dark:bg-surface-muted dark:text-subtle',
          activeVote === -1
            ? 'z-10 border-status-danger bg-status-danger text-white hover:bg-status-danger/90 hover:text-white'
            : ''
        )}
      >
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}

export interface BookmarkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  saved: boolean
  loading?: boolean
}

const bookmarkParticles = [
  { x: 20, y: 0, size: 4 },
  { x: 8, y: 14, size: 5 },
  { x: -13, y: 11, size: 4 },
  { x: -18, y: -6, size: 5 },
  { x: 5, y: -16, size: 4 },
]

export function BookmarkButton({
  saved,
  loading = false,
  disabled,
  className,
  ...props
}: BookmarkButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-pressed={saved}
      title={saved ? 'Remover dos salvos' : 'Salvar ocorrencia'}
      {...props}
      className={cn(
        'group relative inline-flex h-9 min-w-9 items-center justify-center overflow-visible rounded-full border px-3 text-xs font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50',
        saved
          ? 'border-brand/35 bg-brand/10 text-brand shadow-sm shadow-brand/10 ring-1 ring-brand/20 dark:border-brand/40 dark:bg-brand-muted dark:text-brand-100'
          : 'border-zinc-200 bg-white text-zinc-600 shadow-sm shadow-black/5 hover:border-brand/40 hover:bg-brand/10 hover:text-brand dark:border-line dark:bg-surface-muted dark:text-muted dark:hover:bg-brand-muted dark:hover:text-brand-100',
        className
      )}
    >
      {loading && (
        <span
          className="absolute inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current"
          aria-hidden="true"
        />
      )}
      <span className={cn('relative inline-flex items-center gap-1.5', loading && 'opacity-0')}>
        <span className="relative flex h-4 w-4 items-center justify-center">
          <motion.span
            initial={{ scale: 1 }}
            animate={{ scale: saved ? 1.1 : 1 }}
            whileTap={saved ? { scale: 1, rotate: 0 } : { scale: 0.85, rotate: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative flex items-center justify-center"
          >
            <Bookmark className="opacity-60" size={16} aria-hidden="true" />
            <Bookmark
              className="absolute inset-0 fill-brand text-brand transition-all duration-300"
              size={16}
              aria-hidden="true"
              style={{ opacity: saved ? 1 : 0 }}
            />
            <AnimatePresence>
              {saved && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(29,158,117,0.35) 0%, rgba(29,158,117,0) 80%)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.4, 1], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </motion.span>
          <AnimatePresence>
            {saved && (
              <motion.span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {bookmarkParticles.map((particle, index) => (
                  <motion.span
                    key={index}
                    className="absolute rounded-full bg-brand"
                    style={{ width: particle.size, height: particle.size, filter: 'blur(1px)' }}
                    initial={{ scale: 0, opacity: 0.3, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0.3, 0.8, 0],
                      x: [0, particle.x],
                      y: [0, particle.y],
                    }}
                    transition={{ duration: 0.62, delay: index * 0.04, ease: 'easeOut' }}
                  />
                ))}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="hidden sm:inline">{saved ? 'Salvo' : 'Salvar'}</span>
      </span>
    </button>
  )
}

export interface ButtonGroupOption {
  label: string
  value: string
  icon?: ReactNode
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[]
  value: string
  onChange: (value: string) => void
  size?: ButtonSize
}

export function ButtonGroup({ options, value, onChange, size = 'md' }: ButtonGroupProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-zinc-200 dark:border-line">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex items-center font-medium transition-all',
            buttonSizeClass[size],
            'rounded-none',
            index < options.length - 1 && 'border-r border-zinc-200 dark:border-line',
            value === option.value
              ? 'bg-zinc-100 text-zinc-950 dark:bg-surface-elevated dark:text-foreground'
              : 'bg-white text-zinc-500 hover:bg-zinc-50 dark:bg-surface dark:text-muted dark:hover:bg-surface-elevated'
          )}
        >
          {option.icon && <span aria-hidden="true">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export type ChipVariant =
  | 'default'
  | 'active'
  | 'ocorrencia'
  | 'alerta'
  | 'evento'
  | 'noticia'
  | 'servico'
  | 'infraestrutura'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant
  icon?: ReactNode
  removable?: boolean
  onRemove?: () => void
  children: ReactNode
}

const chipVariantClass: Record<ChipVariant, string> = {
  default: 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-950 dark:border-line dark:bg-surface-elevated dark:text-muted',
  active: 'border-brand/40 bg-brand/20 text-brand dark:border-brand/40 dark:bg-brand-muted dark:text-brand-100',
  ocorrencia: 'border-category-occurrence/40 bg-category-occurrence/10 text-category-occurrence',
  alerta: 'border-category-alert/40 bg-category-alert/10 text-category-alert',
  evento: 'border-category-event/40 bg-category-event/10 text-category-event',
  noticia: 'border-category-news/40 bg-category-news/10 text-category-news',
  servico: 'border-category-service/40 bg-category-service/10 text-category-service',
  infraestrutura: 'border-category-occurrence/40 bg-category-occurrence/10 text-category-occurrence',
}

export function Chip({ variant = 'default', icon, removable = false, onRemove, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors duration-100',
        chipVariantClass[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="text-[11px]" aria-hidden="true">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove?.()
          }}
          aria-label="Remover"
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
        >
          x
        </button>
      )}
    </span>
  )
}

const occurrenceStatusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluida',
  ENCERRADA: 'Encerrada',
  RESOLVIDA: 'Resolvida',
}

const occurrenceStatusClass: Record<string, string> = {
  PENDENTE: 'bg-status-pending/10 text-status-pending ring-1 ring-status-pending/30',
  EM_ANDAMENTO: 'bg-status-progress/10 text-status-progress ring-1 ring-status-progress/30',
  CONCLUIDA: 'bg-status-done/10 text-status-done ring-1 ring-status-done/30',
  ENCERRADA: 'bg-status-closed/10 text-status-closed ring-1 ring-status-closed/30',
  RESOLVIDA: 'bg-status-done/10 text-status-done ring-1 ring-status-done/30',
}

export function getStatusLabel(status: string) {
  return occurrenceStatusLabel[status] ?? status
}

function getStatusBadgeClass(status: string) {
  return occurrenceStatusClass[status] ?? occurrenceStatusClass.PENDENTE
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', getStatusBadgeClass(status), className)}>
      {getStatusLabel(status)}
    </span>
  )
}

export function getCategoryVariantFromName(name: string | undefined, icon?: string | null): ChipVariant {
  const key = `${icon ?? ''} ${name ?? ''}`.toLowerCase()

  if (key.includes('alerta') || key.includes('bell')) return 'alerta'
  if (key.includes('evento') || key.includes('calendar')) return 'evento'
  if (key.includes('noticia') || key.includes('news')) return 'noticia'
  if (key.includes('servico') || key.includes('tools')) return 'servico'
  if (key.includes('infra')) return 'infraestrutura'

  return 'ocorrencia'
}

// Shared card surface. Use padded=false for cards that manage their own internal spacing.
export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn('rounded-lg border border-zinc-200 bg-white dark:border-line dark:bg-surface', padded && 'p-4', className)}>
      {children}
    </section>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-app dark:text-foreground">{children}</div>
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn('mx-auto w-full max-w-6xl px-4 py-4', className)}>{children}</main>
}

export function AppHeader({
  title,
  subtitle,
  backTo,
  actions,
}: {
  title?: string
  subtitle?: string
  backTo?: string
  actions?: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-line dark:bg-app/95">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/home" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-foreground">
          <BrandMark />
          <span className="hidden sm:inline">Olho do Bairro</span>
        </Link>

        {backTo && (
          <Button type="button" variant="ghost" onClick={() => (backTo === 'back' ? navigate(-1) : navigate(backTo))} className="hidden sm:inline-flex">
            Voltar
          </Button>
        )}

        {(title || subtitle) && (
          <div className="min-w-0">
            {title && <h1 className="truncate text-base font-semibold text-zinc-950 dark:text-foreground">{title}</h1>}
            {subtitle && <p className="truncate text-xs text-zinc-500 dark:text-muted">{subtitle}</p>}
          </div>
        )}

        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <PageShell>
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <BrandMark size="md" className="mx-auto mb-3" />
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-muted">{subtitle}</p>
          </div>
          {children}
        </Card>
      </div>
    </PageShell>
  )
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-foreground">{label}</label>
        {hint && <span className="text-xs text-zinc-400 dark:text-subtle">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  )
}

const inputClassName = 'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:ring-brand/20'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClassName, props.className)} />
}

export function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'danger'; children: ReactNode }) {
  return (
    <p className={cn(
      'rounded-lg border px-4 py-2 text-sm',
      tone === 'danger'
        ? 'border-status-danger/30 bg-status-danger/10 text-status-danger'
        : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-line dark:bg-surface-muted dark:text-muted'
    )}>
      {children}
    </p>
  )
}
