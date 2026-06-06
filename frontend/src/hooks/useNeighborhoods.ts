import { useQuery } from '@tanstack/react-query'
import { neighborhoodService } from '../services/neighborhood.service'

export function useNeighborhoods() {
  return useQuery({
    queryKey: ['bairros', 'Lins', 'SP'],
    queryFn: neighborhoodService.listar,
  })
}
