import { useEffect, useState } from 'react'
import { AppHeader, Button, Card, Notice, PageContainer, PageShell } from '../../components/ui'
import api from '../../services/api'
import type { PageResponse } from '../../types/api'
import type { Usuario } from '../../types/auth'

const ROLE_LABEL: Record<string, string> = {
  MORADOR: 'Morador',
  MODERADOR: 'Moderador',
  ADMIN: 'Administrador',
  PREFEITURA: 'Prefeitura',
}

const ROLE_COLOR: Record<string, string> = {
  MORADOR: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  MODERADOR: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  ADMIN: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
  PREFEITURA: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
}

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setIsLoading(true)
    setErro('')
    // BROKEN: endpoint GET /api/v1/admin/usuarios ainda nao existe no backend.
    api.get<PageResponse<Usuario>>('/admin/usuarios', { params: { page, size: 20 } })
      .then(response => {
        setUsuarios(response.data.content)
        setTotal(response.data.totalElements)
        setTotalPages(response.data.totalPages)
      })
      .catch(() => setErro('Nao foi possivel carregar os usuarios.'))
      .finally(() => setIsLoading(false))
  }, [page])

  return (
    <PageShell>
      <AppHeader title="Usuarios" subtitle={`${total} usuarios cadastrados`} backTo="/admin/dashboard" />
      <PageContainer className="space-y-4">
        {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>}
        {erro && <Notice tone="danger">{erro}</Notice>}

        <div className="space-y-3">
          {usuarios.map(usuario => (
            <Card key={usuario.id} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                  {usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{usuario.nome}</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Desde {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLOR[usuario.role] ?? ROLE_COLOR.MORADOR}`}>
                {ROLE_LABEL[usuario.role] ?? usuario.role}
              </span>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-4">
            <Button type="button" disabled={page === 0} onClick={() => setPage(current => current - 1)}>Anterior</Button>
            <span className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">{page + 1} / {totalPages}</span>
            <Button type="button" disabled={page === totalPages - 1} onClick={() => setPage(current => current + 1)}>Proxima</Button>
          </div>
        )}
      </PageContainer>
    </PageShell>
  )
}
