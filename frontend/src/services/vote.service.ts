import api from './api'
import type { Ocorrencia, ValorVoto } from '../types/occurrence'

export const voteService = {
  async votar(ocorrenciaId: string, valor: ValorVoto): Promise<Ocorrencia> {
    const response = await api.post<Ocorrencia>(`/ocorrencias/${ocorrenciaId}/votos`, { valor })
    return response.data
  },

  async removerVoto(ocorrenciaId: string): Promise<Ocorrencia> {
    const response = await api.delete<Ocorrencia>(`/ocorrencias/${ocorrenciaId}/votos`)
    return response.data
  },
}
