import api from './api'
import type { ValorVoto } from '../types/occurrence'

export const voteService = {
  async votar(ocorrenciaId: string, valor: ValorVoto): Promise<void> {
    await api.post(`/ocorrencias/${ocorrenciaId}/votos`, { valor })
  },

  async removerVoto(ocorrenciaId: string): Promise<void> {
    await api.delete(`/ocorrencias/${ocorrenciaId}/votos`)
  },
}
