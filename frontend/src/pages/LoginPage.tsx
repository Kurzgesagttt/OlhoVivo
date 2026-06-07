import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { AuthShell, Button, Field, Notice, TextInput } from '../components/ui'

export default function LoginPage() {
  const navigate = useNavigate()
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
      navigate('/home')
    } catch {
      setErro('Email ou senha invalidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthShell title="Olho do Bairro" subtitle="Entre na sua conta para continuar">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="E-mail">
          <TextInput
            id="email"
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="seu@email.com"
          />
        </Field>

        <Field label="Senha">
          <TextInput
            id="senha"
            type="password"
            required
            value={senha}
            onChange={event => setSenha(event.target.value)}
            placeholder="Minimo 8 caracteres"
          />
        </Field>

        {erro && <Notice tone="danger">{erro}</Notice>}

        <Button type="submit" variant="primary" disabled={carregando} className="w-full">
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-muted">
        Nao tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-brand hover:text-brand-hover dark:text-brand-100">
          Cadastre-se
        </Link>
      </p>

      <div className="mt-6 border-t border-zinc-200 pt-5 text-center dark:border-line">
        <Link
          to="/admin/login"
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-line dark:text-foreground dark:hover:bg-surface-elevated"
        >
          Acesso de responsaveis
        </Link>
      </div>
    </AuthShell>
  )
}
