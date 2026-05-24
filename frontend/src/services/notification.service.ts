import api from './api'
import type { Notificacao } from '../types/notification'
import type { PageResponse } from '../types/api'

export const notificationService = {
  async listar(page = 0, size = 20): Promise<PageResponse<Notificacao>> {
    const response = await api.get<PageResponse<Notificacao>>('/notificacoes', {
      params: { page, size },
    })
    return response.data
  },

  async marcarComoLida(id: string): Promise<void> {
    await api.patch(`/notificacoes/${id}/lida`)
  },
}
