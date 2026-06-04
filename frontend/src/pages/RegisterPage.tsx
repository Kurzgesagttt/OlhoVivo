import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/auth.service'
import axios from 'axios'

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

  function validar(): boolean {
    const erros: Partial<Record<Campos, string>> = {}
    if (!form.nome.trim() || form.nome.trim().length < 2) erros.nome = 'Nome deve ter pelo menos 2 caracteres.'
    if (!form.email.trim() || !form.email.includes('@')) erros.email = 'Informe um e-mail válido.'
    const cpfSoNumeros = form.cpf.replace(/\D/g, '')
    if (cpfSoNumeros.length !== 11) erros.cpf = 'CPF deve conter 11 dígitos numéricos.'
    if (!form.senha || form.senha.length < 8) erros.senha = 'Senha deve ter pelo menos 8 caracteres.'
    setCamposErro(erros)
    return Object.keys(erros).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.aceitouPolitica) { setErro('Você deve aceitar a política de privacidade.'); return }
    if (!validar()) return
    setErro('')
    setCarregando(true)
    try {
      await authService.cadastrar({ ...form, cpf: form.cpf.replace(/\D/g, '') })
      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg: string = err.response.data.message
        // Tenta mapear o erro ao campo específico
        const campoMapeado = (Object.keys(CAMPO_LABEL) as Campos[]).find(c =>
          msg.toLowerCase().includes(CAMPO_LABEL[c].toLowerCase()) || msg.toLowerCase().includes(c)
        )
        if (campoMapeado) {
          setCamposErro({ [campoMapeado]: msg })
        } else {
          setErro(msg)
        }
      } else {
        setErro('Erro ao cadastrar. Verifique os dados e tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  const inputClass = (campo: Campos) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
      camposErro[campo]
        ? 'border-red-400 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-blue-500'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Criar conta</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Junte-se à comunidade Olho do Bairro</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input type="text" required value={form.nome} onChange={e => set('nome', e.target.value)}
              className={inputClass('nome')} placeholder="Seu nome" maxLength={100} />
            {camposErro.nome && <p className="text-xs text-red-500 mt-1">{camposErro.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
              className={inputClass('email')} placeholder="seu@email.com" maxLength={254} />
            {camposErro.email && <p className="text-xs text-red-500 mt-1">{camposErro.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input type="text" required value={form.cpf} onChange={e => set('cpf', e.target.value)}
              className={inputClass('cpf')} placeholder="000.000.000-00" maxLength={14} />
            {camposErro.cpf
              ? <p className="text-xs text-red-500 mt-1">{camposErro.cpf}</p>
              : <p className="text-xs text-gray-400 mt-1">Apenas os 11 dígitos, com ou sem formatação.</p>}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <span className={`text-xs ${form.senha.length > 0 && form.senha.length < 8 ? 'text-red-400' : 'text-gray-400'}`}>
                {form.senha.length}/72 (mín. 8)
              </span>
            </div>
            <input type="password" required value={form.senha} onChange={e => set('senha', e.target.value)}
              className={inputClass('senha')} placeholder="Mínimo 8 caracteres" minLength={8} maxLength={72} />
            {camposErro.senha && <p className="text-xs text-red-500 mt-1">{camposErro.senha}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.aceitouPolitica} onChange={e => set('aceitouPolitica', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-600">Li e aceito a <span className="text-blue-600 underline">Política de Privacidade</span></span>
          </label>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{erro}</p>
          )}

          <button type="submit" disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            {carregando ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
