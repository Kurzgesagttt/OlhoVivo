import { Link } from 'react-router-dom'
import { Card, PageShell } from '../components/ui'

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <Card className="w-full max-w-md p-8">
          <p className="mb-4 text-7xl font-bold text-emerald-100 dark:text-emerald-950">404</p>
          <h1 className="mb-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">Pagina nao encontrada</h1>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">O endereco que voce acessou nao existe.</p>
          <Link to="/home" className="inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700">
            Voltar para o inicio
          </Link>
        </Card>
      </div>
    </PageShell>
  )
}
