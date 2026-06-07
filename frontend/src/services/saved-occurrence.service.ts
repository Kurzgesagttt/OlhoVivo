import api from './api'

export const savedOccurrenceService = {
  async salvar(ocorrenciaId: string): Promise<void> {
    await api.post(`/ocorrencias/${ocorrenciaId}/salvamentos`)
  },

  async remover(ocorrenciaId: string): Promise<void> {
    await api.delete(`/ocorrencias/${ocorrenciaId}/salvamentos`)
  },
}
