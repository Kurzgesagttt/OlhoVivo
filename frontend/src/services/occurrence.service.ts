import api from './api'
import type { Ocorrencia, CriarOcorrenciaRequest, AtualizarStatusRequest } from '../types/occurrence'
import type { PageResponse } from '../types/api'

export const occurrenceService = {
  async listar(page = 0, size = 10): Promise<PageResponse<Ocorrencia>> {
    const response = await api.get<PageResponse<Ocorrencia>>('/ocorrencias', {
      params: { page, size, sort: 'criadoEm,desc' },
    })
    return response.data
  },

  async buscarPorId(id: string): Promise<Ocorrencia> {
    const response = await api.get<Ocorrencia>(`/ocorrencias/${id}`)
    return response.data
  },

  async criar(data: CriarOcorrenciaRequest): Promise<Ocorrencia> {
    const response = await api.post<Ocorrencia>('/ocorrencias', data)
    return response.data
  },

  async atualizarStatus(id: string, data: AtualizarStatusRequest): Promise<Ocorrencia> {
    const response = await api.patch<Ocorrencia>(`/ocorrencias/${id}/status`, data)
    return response.data
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/ocorrencias/${id}`)
  },
}
