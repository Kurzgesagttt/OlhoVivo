import { Link, useNavigate, type LinkProps } from 'react-router-dom'
import React, { forwardRef } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

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
  primary: 'border border-brand bg-brand text-white hover:bg-brand-hover active:bg-brand-dark',
  secondary: 'border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated',
  ghost: 'border border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-muted dark:hover:bg-surface-elevated dark:hover:text-foreground',
  danger: 'border border-status-danger bg-status-danger text-white hover:bg-status-danger/90 active:bg-status-danger/80',
  'danger-soft': 'border border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20',
  'warning-soft': 'border border-status-pending/30 bg-status-pending/10 text-status-pending hover:bg-status-pending/20',
  'success-soft': 'border border-status-done/30 bg-status-done/10 text-status-done hover:bg-status-done/20',
  'info-soft': 'border border-status-progress/30 bg-status-progress/10 text-status-progress hover:bg-status-progress/20',
  link: 'h-auto border-none bg-transparent p-0 text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand',
  'link-danger': 'h-auto border-none bg-transparent p-0 text-status-danger underline decoration-status-danger/30 underline-offset-2 hover:decoration-status-danger',
}

const buttonSizeClass: Record<ButtonSize, string> = {
  xs: 'h-[26px] gap-1 rounded-md px-[10px] text-[11px]',
  sm: 'h-[32px] gap-1.5 rounded-lg px-[14px] text-[13px]',
  md: 'h-[38px] gap-2 rounded-lg px-[18px] text-[14px]',
  lg: 'h-[44px] gap-2 rounded-lg px-[22px] text-[15px]',
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

export type IconButtonVariant = 'default' | 'primary' | 'danger'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
  round?: boolean
  icon: ReactNode
  label: string
}

const iconButtonSizeClass: Record<NonNullable<IconButtonProps['size']>, string> = {
  xs: 'h-[26px] w-[26px] rounded-md text-[14px]',
  sm: 'h-[32px] w-[32px] rounded-lg text-[16px]',
  md: 'h-[38px] w-[38px] rounded-lg text-[18px]',
  lg: 'h-[44px] w-[44px] rounded-xl text-[20px]',
}

const iconButtonVariantClass: Record<IconButtonVariant, string> = {
  default: 'border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100 dark:border-line dark:bg-surface dark:text-muted dark:hover:bg-surface-elevated',
  primary: 'border border-brand bg-brand text-white hover:bg-brand-hover',
  danger: 'border border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'default', size = 'md', round = false, icon, label, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40',
        iconButtonSizeClass[size],
        iconButtonVariantClass[variant],
        round && 'rounded-full',
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
})

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  icon: ReactNode
  label: string
  expanded?: string
}

const fabSizeClass: Record<NonNullable<FabProps['size']>, string> = {
  sm: 'h-[38px] w-[38px] text-[18px]',
  md: 'h-[48px] w-[48px] text-[22px]',
  lg: 'h-[58px] w-[58px] text-[26px]',
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { size = 'md', icon, label, expanded, className, ...props },
  ref
) {
  if (expanded) {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          'inline-flex h-[48px] items-center gap-3 rounded-full bg-brand px-5 text-[15px] font-medium text-white transition-all duration-100 hover:bg-brand-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="text-[22px]">{icon}</span>
        {expanded}
      </button>
    )
  }

  return (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-brand text-white transition-all duration-100 hover:bg-brand-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        fabSizeClass[size],
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
})

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

  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'inline-flex w-8 flex-col items-center overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm dark:border-line dark:bg-surface-muted',
          disabled && 'opacity-70',
          className
        )}
      >
        <button
          type="button"
          onClick={() => onVote?.('up')}
          disabled={disabled}
          title={activeVote === 1 ? 'Seu voto atual e positivo' : 'Votar positivo'}
          aria-label="Votar positivo"
          className={cn(
            'flex h-8 w-full items-center justify-center text-sm font-bold transition-colors disabled:cursor-not-allowed',
            activeVote === 1
              ? 'bg-brand-muted text-brand-100'
              : 'text-zinc-500 hover:bg-brand/10 hover:text-brand dark:text-muted dark:hover:bg-brand-muted dark:hover:text-brand-100'
          )}
        >
          <span aria-hidden="true">^</span>
        </button>
        <span className="flex min-h-7 w-full items-center justify-center border-y border-zinc-200 text-xs font-bold text-zinc-900 dark:border-line dark:text-foreground">
          {count}
        </span>
        <button
          type="button"
          onClick={() => onVote?.('down')}
          disabled={disabled}
          title={activeVote === -1 ? 'Seu voto atual e negativo' : 'Votar negativo'}
          aria-label="Votar negativo"
          className={cn(
            'flex h-8 w-full items-center justify-center text-sm font-bold transition-colors disabled:cursor-not-allowed',
            activeVote === -1
              ? 'bg-status-danger/10 text-status-danger'
              : 'text-zinc-300 hover:bg-status-danger/10 hover:text-status-danger dark:text-subtle'
          )}
        >
          <span aria-hidden="true">v</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm dark:border-line dark:bg-surface',
        disabled && 'opacity-70',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onVote?.('up')}
        disabled={disabled}
        title={activeVote === 1 ? 'Seu voto atual e positivo' : 'Votar positivo'}
        aria-label="Votar positivo"
        className={cn(
          'inline-flex h-8 items-center gap-1 px-3 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed',
          activeVote === 1
            ? 'bg-brand/10 text-brand'
            : 'text-zinc-500 hover:bg-brand/10 hover:text-brand dark:text-muted dark:hover:bg-brand-muted'
        )}
      >
        <span aria-hidden="true">^</span>
        <span>{count}</span>
      </button>
      <div className="h-5 w-px self-center bg-zinc-200 dark:bg-line" />
      <button
        type="button"
        onClick={() => onVote?.('down')}
        disabled={disabled}
        title={activeVote === -1 ? 'Seu voto atual e negativo' : 'Votar negativo'}
        aria-label="Votar negativo"
        className={cn(
          'inline-flex h-8 items-center px-2.5 text-[16px] transition-colors disabled:cursor-not-allowed',
          activeVote === -1
            ? 'bg-status-danger/10 text-status-danger'
            : 'text-zinc-300 hover:bg-status-danger/10 hover:text-status-danger dark:text-subtle'
        )}
      >
        <span aria-hidden="true">v</span>
      </button>
    </div>
  )
}

export interface SplitButtonProps {
  label: string
  onClick?: () => void
  onDropdown?: () => void
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
}

export function SplitButton({ label, onClick, onDropdown, size = 'md', loading = false, disabled = false }: SplitButtonProps) {
  return (
    <div className="inline-flex">
      <Button
        variant="primary"
        size={size}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        className="rounded-r-none border-r-0"
      >
        {label}
      </Button>
      <button
        type="button"
        onClick={onDropdown}
        disabled={disabled}
        aria-label="Mais opcoes"
        className={cn(
          'inline-flex items-center border-l border-white/25 bg-brand px-2.5 text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40',
          size === 'xl' ? 'h-[52px]' : size === 'lg' ? 'h-[44px]' : size === 'sm' ? 'h-[32px]' : size === 'xs' ? 'h-[26px]' : 'h-[38px]',
          'rounded-r-lg'
        )}
      >
        <span aria-hidden="true">v</span>
      </button>
    </div>
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

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
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

export const occurrenceStatusLabel: Record<string, string> = {
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

export function getStatusBadgeClass(status: string) {
  return occurrenceStatusClass[status] ?? occurrenceStatusClass.PENDENTE
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', getStatusBadgeClass(status), className)}>
      {getStatusLabel(status)}
    </span>
  )
}

export type OcorrenciaCategoria = 'ocorrencia' | 'alerta' | 'evento' | 'noticia' | 'servico' | 'infraestrutura'

const categoryChipConfig: Record<OcorrenciaCategoria, { label: string; icon: string; variant: ChipVariant }> = {
  ocorrencia: { label: 'Ocorrencia', icon: '', variant: 'ocorrencia' },
  alerta: { label: 'Alerta', icon: '', variant: 'alerta' },
  evento: { label: 'Evento', icon: '', variant: 'evento' },
  noticia: { label: 'Noticia', icon: '', variant: 'noticia' },
  servico: { label: 'Servico publico', icon: '', variant: 'servico' },
  infraestrutura: { label: 'Infraestrutura', icon: '', variant: 'infraestrutura' },
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

export interface CategoryChipProps {
  categoria: OcorrenciaCategoria
  className?: string
}

export function CategoryChip({ categoria, className }: CategoryChipProps) {
  const config = categoryChipConfig[categoria]
  return (
    <Chip variant={config.variant} icon={config.icon} className={className}>
      {config.label}
    </Chip>
  )
}

export interface TagFilterGroupProps {
  tags: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function TagFilterGroup({ tags, selected, onChange }: TagFilterGroupProps) {
  function toggle(tag: string) {
    onChange(selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag])
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Chip variant={selected.includes(tag) ? 'active' : 'default'}>{tag}</Chip>
        </button>
      ))}
    </div>
  )
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

export const inputClassName = 'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-line dark:bg-surface-muted dark:text-foreground dark:focus:ring-brand/20'

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
