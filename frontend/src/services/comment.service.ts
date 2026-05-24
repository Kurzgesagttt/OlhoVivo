import api from './api'
import type { Comentario, CriarComentarioRequest } from '../types/comment'
import type { PageResponse } from '../types/api'

export const commentService = {
  async listar(ocorrenciaId: string, page = 0, size = 20): Promise<PageResponse<Comentario>> {
    const response = await api.get<PageResponse<Comentario>>(
      `/ocorrencias/${ocorrenciaId}/comentarios`,
      { params: { page, size } }
    )
    return response.data
  },

  async criar(ocorrenciaId: string, data: CriarComentarioRequest): Promise<Comentario> {
    const response = await api.post<Comentario>(`/ocorrencias/${ocorrenciaId}/comentarios`, data)
    return response.data
  },

  async deletar(ocorrenciaId: string, comentarioId: string): Promise<void> {
    await api.delete(`/ocorrencias/${ocorrenciaId}/comentarios/${comentarioId}`)
  },
}
