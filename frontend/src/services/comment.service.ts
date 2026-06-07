import api from './api'
import type { Comentario, CriarComentarioRequest } from '../types/comment'
import type { PageResponse } from '../types/api'

export const commentService = {
  async listar(ocorrenciaId: string, page = 0, size = 50): Promise<PageResponse<Comentario>> {
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

  async responder(ocorrenciaId: string, comentarioId: string, data: CriarComentarioRequest): Promise<Comentario> {
    const response = await api.post<Comentario>(`/ocorrencias/${ocorrenciaId}/comentarios/${comentarioId}/respostas`, data)
    return response.data
  },

  async curtir(ocorrenciaId: string, comentarioId: string): Promise<Comentario> {
    const response = await api.post<Comentario>(`/ocorrencias/${ocorrenciaId}/comentarios/${comentarioId}/curtida`)
    return response.data
  },

  async descurtir(ocorrenciaId: string, comentarioId: string): Promise<Comentario> {
    const response = await api.delete<Comentario>(`/ocorrencias/${ocorrenciaId}/comentarios/${comentarioId}/curtida`)
    return response.data
  },
}
