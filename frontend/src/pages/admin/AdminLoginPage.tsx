import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell, Button, Field, Notice, TextInput } from '../../components/ui'
import { authService } from '../../services/auth.service'
import type { Role } from '../../types/occurrence'

const ADMIN_ROLES: Role[] = ['ADMIN', 'MODERADOR', 'PREFEITURA']

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await authService.login({ email, senha })
      queryClient.removeQueries({ queryKey: ['me'] })
      queryClient.removeQueries({ queryKey: ['ocorrencias'] })
      queryClient.removeQueries({ queryKey: ['ocorrencias-salvas'] })
      const usuario = await authService.perfil()

      if (!ADMIN_ROLES.includes(usuario.role)) {
        await authService.logout()
        queryClient.clear()
        setErro('Esta conta nao tem permissao para acessar o painel administrativo.')
        return
      }

      queryClient.setQueryData(['me'], usuario)
      navigate('/admin/dashboard')
    } catch {
      setErro('Credenciais invalidas ou usuario sem permissao administrativa.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthShell title="Painel Admin" subtitle="Acesso restrito para moderacao de ocorrencias">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="E-mail">
          <TextInput
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="admin@email.com"
          />
        </Field>

        <Field label="Senha">
          <TextInput
            id="admin-senha"
            type="password"
            required
            value={senha}
            onChange={event => setSenha(event.target.value)}
            placeholder="Senha administrativa"
          />
        </Field>

        {erro && <Notice tone="danger">{erro}</Notice>}

        <Button type="submit" variant="primary" disabled={carregando} className="w-full">
          {carregando ? 'Verificando...' : 'Entrar no painel'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-muted">
        Voltar para{' '}
        <Link to="/login" className="font-medium text-brand hover:text-brand-hover dark:text-brand-100">
          login do morador
        </Link>
      </p>
    </AuthShell>
  )
}
