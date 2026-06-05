import { useNavigate } from 'react-router-dom'
import { AppHeader, Button, Card, PageContainer, PageShell } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { usuario, isLoading, logout } = useAuth()

  if (isLoading) {
    return <PageShell><div className="flex min-h-screen items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">Carregando...</div></PageShell>
  }

  if (!usuario) {
    navigate('/login')
    return null
  }

  return (
    <PageShell>
      <AppHeader title="Meu perfil" subtitle="Dados da sua conta" backTo="back" />
      <PageContainer className="max-w-lg">
        <Card className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">{usuario.nome}</h1>
              <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {ROLE_LABEL[usuario.role] ?? usuario.role}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Membro desde</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

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
      </PageContainer>
    </PageShell>
  )
}
