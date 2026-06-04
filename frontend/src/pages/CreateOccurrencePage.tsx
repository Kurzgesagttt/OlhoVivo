import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateOccurrence } from '../hooks/useOccurrences'
import api from '../services/api'
import type { Categoria } from '../types/occurrence'
import axios from 'axios'

export default function CreateOccurrencePage() {
  const navigate = useNavigate()
  const createOccurrence = useCreateOccurrence()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState({ titulo: '', descricao: '', categoriaId: '', endereco: '' })
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get<Categoria[]>('/categorias').then(r => setCategorias(r.data)).catch(() => {})
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (form.titulo.trim().length < 5) {
      setErro('Título deve ter pelo menos 5 caracteres.')
      return
    }
    if (form.descricao.trim().length < 20) {
      setErro('Descrição deve ter pelo menos 20 caracteres.')
      return
    }

    try {
      const o = await createOccurrence.mutateAsync({
        titulo: form.titulo,
        descricao: form.descricao,
        categoriaId: form.categoriaId,
        ...(form.endereco ? { endereco: form.endereco } : {}),
      })
      navigate(`/ocorrencias/${o.id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErro(err.response.data.message)
      } else {
        setErro('Erro ao criar ocorrência. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm">← Voltar</button>
        <h1 className="text-xl font-bold text-blue-700">Nova ocorrência</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <span className="text-xs text-gray-400">{form.titulo.length}/100 (mín. 5)</span>
              </div>
              <input type="text" required value={form.titulo} onChange={e => set('titulo', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Resumo do problema" maxLength={100} minLength={5} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <span className={`text-xs ${form.descricao.length < 20 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.descricao.length}/500 (mín. 20)
                </span>
              </div>
              <textarea required value={form.descricao} onChange={e => set('descricao', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4} placeholder="Descreva o problema com detalhes (mínimo 20 caracteres)" maxLength={500} minLength={20} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select required value={form.categoriaId} onChange={e => set('categoriaId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione uma categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (opcional)</label>
              <input type="text" value={form.endereco} onChange={e => set('endereco', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua, número, bairro" />
            </div>

            {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{erro}</p>}

            <button type="submit" disabled={createOccurrence.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {createOccurrence.isPending ? 'Enviando...' : 'Registrar ocorrência'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
