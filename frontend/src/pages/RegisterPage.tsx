import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthShell, Button, Field, Notice, TextInput } from '../components/ui'
import { authService } from '../services/auth.service'

type Campos = 'nome' | 'email' | 'cpf' | 'senha'

const CAMPO_LABEL: Record<Campos, string> = {
  nome: 'Nome completo',
  email: 'E-mail',
  cpf: 'CPF',
  senha: 'Senha',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', senha: '', aceitouPolitica: false })
  const [erro, setErro] = useState('')
  const [camposErro, setCamposErro] = useState<Partial<Record<Campos, string>>>({})
  const [carregando, setCarregando] = useState(false)

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field in CAMPO_LABEL) {
      setCamposErro(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function validar() {
    const erros: Partial<Record<Campos, string>> = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) erros.nome = 'Nome deve ter pelo menos 2 caracteres.'
    if (!form.email.trim() || !form.email.includes('@')) erros.email = 'Informe um e-mail valido.'
    if (form.cpf.replace(/\D/g, '').length !== 11) erros.cpf = 'CPF deve conter 11 digitos numericos.'
    if (!form.senha || form.senha.length < 8) erros.senha = 'Senha deve ter pelo menos 8 caracteres.'
    setCamposErro(erros)
    return Object.keys(erros).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!form.aceitouPolitica) {
      setErro('Voce deve aceitar a politica de privacidade.')
      return
    }

    if (!validar()) return

    setErro('')
    setCarregando(true)

    try {
      await authService.cadastrar({ ...form, cpf: form.cpf.replace(/\D/g, '') })
      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg: string = err.response.data.message
        const campoMapeado = (Object.keys(CAMPO_LABEL) as Campos[]).find(c =>
          msg.toLowerCase().includes(CAMPO_LABEL[c].toLowerCase()) || msg.toLowerCase().includes(c)
        )
        if (campoMapeado) setCamposErro({ [campoMapeado]: msg })
        else setErro(msg)
      } else {
        setErro('Erro ao cadastrar. Verifique os dados e tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthShell title="Criar conta" subtitle="Junte-se a comunidade Olho do Bairro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo" error={camposErro.nome}>
          <TextInput required value={form.nome} onChange={event => set('nome', event.target.value)} placeholder="Seu nome" maxLength={100} />
        </Field>

        <Field label="E-mail" error={camposErro.email}>
          <TextInput required type="email" value={form.email} onChange={event => set('email', event.target.value)} placeholder="seu@email.com" maxLength={254} />
        </Field>

        <Field label="CPF" hint="Apenas numeros" error={camposErro.cpf}>
          <TextInput required value={form.cpf} onChange={event => set('cpf', event.target.value)} placeholder="000.000.000-00" maxLength={14} />
        </Field>

        <Field label="Senha" hint={`${form.senha.length}/72 (min. 8)`} error={camposErro.senha}>
          <TextInput required type="password" value={form.senha} onChange={event => set('senha', event.target.value)} placeholder="Minimo 8 caracteres" minLength={8} maxLength={72} />
        </Field>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.aceitouPolitica}
            onChange={event => set('aceitouPolitica', event.target.checked)}
            className="mt-1 h-4 w-4 accent-brand"
          />
          <span className="text-sm text-zinc-600 dark:text-muted">Li e aceito a <span className="text-brand underline dark:text-brand-100">Politica de Privacidade</span></span>
        </label>

        {erro && <Notice tone="danger">{erro}</Notice>}

        <Button type="submit" variant="primary" disabled={carregando} className="w-full">
          {carregando ? 'Cadastrando...' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-muted">
        Ja tem conta?{' '}
        <Link to="/login" className="font-medium text-brand hover:text-brand-hover dark:text-brand-100">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
