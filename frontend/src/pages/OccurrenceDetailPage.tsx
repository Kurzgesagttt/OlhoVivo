import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useOccurrence, useDeleteOccurrence } from '../hooks/useOccurrences'
import { useComments, useCreateComment } from '../hooks/useComments'
import { useVote } from '../hooks/useVote'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  RESOLVIDA: 'bg-green-100 text-green-800',
}

const MAX_COMENTARIO = 500

export default function OccurrenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { data: ocorrencia, isLoading, isError } = useOccurrence(id!)
  const { data: comentariosPage } = useComments(id!)
  const { votar, removerVoto } = useVote(id!)
  const createComment = useCreateComment(id!)
  const deleteOccurrence = useDeleteOccurrence()
  const [novoComentario, setNovoComentario] = useState('')
  const [erroComentario, setErroComentario] = useState('')
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false)

  const podeAdministrar = usuario?.role === 'ADMIN' || usuario?.role === 'PREFEITURA'

  async function handleDeletar() {
    if (!confirmandoDeletar) { setConfirmandoDeletar(true); return }
    await deleteOccurrence.mutateAsync(id!)
    navigate('/')
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault()
    setErroComentario('')
    if (!novoComentario.trim()) return
    if (novoComentario.trim().length < 3) {
      setErroComentario('Comentário deve ter pelo menos 3 caracteres.')
      return
    }
    try {
      await createComment.mutateAsync({ conteudo: novoComentario })
      setNovoComentario('')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErroComentario(err.response.data.message)
      } else {
        setErroComentario('Erro ao enviar comentário.')
      }
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>
  if (isError || !ocorrencia) return <div className="min-h-screen flex items-center justify-center text-red-500">Ocorrência não encontrada.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm">← Voltar</button>
        <h1 className="text-xl font-bold text-blue-700">Olho do Bairro</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800 break-words min-w-0">{ocorrencia.titulo}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[ocorrencia.status]}`}>
              {ocorrencia.status === 'PENDENTE' ? 'Pendente' : 'Resolvida'}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">{ocorrencia.descricao}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
            <span>📂 {ocorrencia.categoria.nome}</span>
            {ocorrencia.bairro && <span>📍 {ocorrencia.bairro.nome}, {ocorrencia.bairro.cidade}</span>}
            {ocorrencia.endereco && <span className="break-all">🏠 {ocorrencia.endereco}</span>}
            <span>📅 {new Date(ocorrencia.criadoEm).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex gap-3 mt-5 flex-wrap">
            <button onClick={() => votar()}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
              ▲ {ocorrencia.votosCount} votos
            </button>
            <button onClick={() => removerVoto()}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Remover voto
            </button>
            {podeAdministrar && (
              <button
                onClick={handleDeletar}
                disabled={deleteOccurrence.isPending}
                className={`ml-auto text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
                  confirmandoDeletar
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                {deleteOccurrence.isPending ? 'Deletando...' : confirmandoDeletar ? 'Confirmar exclusão' : 'Deletar ocorrência'}
              </button>
            )}
            {confirmandoDeletar && (
              <button onClick={() => setConfirmandoDeletar(false)}
                className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Comentários ({comentariosPage?.totalElements ?? 0})</h3>
          <div className="space-y-4 mb-6">
            {comentariosPage?.content.map(c => (
              <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-sm font-medium text-gray-700">{c.nomeUsuario ?? 'Anônimo'}</p>
                <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap">{c.conteudo}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(c.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
            {comentariosPage?.content.length === 0 && <p className="text-sm text-gray-400">Nenhum comentário ainda.</p>}
          </div>
          {usuario ? (
            <div className="space-y-2">
              <form onSubmit={enviarComentario} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    value={novoComentario}
                    onChange={e => setNovoComentario(e.target.value.slice(0, MAX_COMENTARIO))}
                    placeholder="Escreva um comentário... (mín. 3 caracteres)"
                    required
                    maxLength={MAX_COMENTARIO}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className={`text-xs mt-1 text-right ${novoComentario.length >= MAX_COMENTARIO ? 'text-red-500' : 'text-gray-400'}`}>
                    {novoComentario.length}/{MAX_COMENTARIO}
                  </p>
                </div>
                <button type="submit" disabled={createComment.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0">
                  {createComment.isPending ? '...' : 'Enviar'}
                </button>
              </form>
              {erroComentario && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">{erroComentario}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500"><Link to="/login" className="text-blue-600 hover:underline">Faça login</Link> para comentar.</p>
          )}
        </div>
      </main>
    </div>
  )
}
