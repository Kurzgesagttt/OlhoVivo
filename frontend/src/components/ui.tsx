import { Link, useNavigate } from 'react-router-dom'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  secondary: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
  ghost: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
}

// Shared action button. Use variant for visual intent and keep domain behavior in page handlers.
export function Button({ variant = 'secondary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariantClass[variant],
        className
      )}
    />
  )
}

// Shared card surface. Use padded=false for cards that manage their own internal spacing.
export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn('rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900', padded && 'p-4', className)}>
      {children}
    </section>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">{children}</div>
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
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/home" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">OB</span>
          <span className="hidden sm:inline">Olho do Bairro</span>
        </Link>

        {backTo && (
          <Button type="button" variant="ghost" onClick={() => (backTo === 'back' ? navigate(-1) : navigate(backTo))} className="hidden sm:inline-flex">
            Voltar
          </Button>
        )}

        {(title || subtitle) && (
          <div className="min-w-0">
            {title && <h1 className="truncate text-base font-semibold text-zinc-950 dark:text-zinc-100">{title}</h1>}
            {subtitle && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
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
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">OB</span>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100">{title}</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</label>
        {hint && <span className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  )
}

export const inputClassName = 'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-950'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClassName, props.className)} />
}

export function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'danger'; children: ReactNode }) {
  return (
    <p className={cn(
      'rounded-lg border px-4 py-2 text-sm',
      tone === 'danger'
        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
        : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
    )}>
      {children}
    </p>
  )
}
