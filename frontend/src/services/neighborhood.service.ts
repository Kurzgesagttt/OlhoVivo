import api from './api'
import type { Bairro } from '../types/occurrence'

export const neighborhoodService = {
  async listar(): Promise<Bairro[]> {
    const response = await api.get<Bairro[]>('/bairros', {
      params: { cidade: 'Lins', estado: 'SP' },
    })
    return response.data
  },
}
