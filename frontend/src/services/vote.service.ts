import api from './api'

export const voteService = {
  async votar(ocorrenciaId: string): Promise<void> {
    await api.post(`/ocorrencias/${ocorrenciaId}/votos`)
  },

  async removerVoto(ocorrenciaId: string): Promise<void> {
    await api.delete(`/ocorrencias/${ocorrenciaId}/votos`)
  },
}
