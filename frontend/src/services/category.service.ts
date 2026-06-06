import api from './api'
import type { Categoria } from '../types/occurrence'

export const categoryService = {
  async listar(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>('/categorias')
    return response.data
  },
}
