import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { occurrenceService } from '../services/occurrence.service'
import type { CriarOcorrenciaRequest } from '../types/occurrence'

export function useOccurrences(page = 0) {
  return useQuery({
    queryKey: ['ocorrencias', page],
    queryFn: () => occurrenceService.listar(page),
  })
}

export function useOccurrence(id: string) {
  return useQuery({
    queryKey: ['ocorrencias', id],
    queryFn: () => occurrenceService.buscarPorId(id),
    enabled: !!id,
  })
}

export function useCreateOccurrence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CriarOcorrenciaRequest) => occurrenceService.criar(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })
}

export function useDeleteOccurrence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => occurrenceService.deletar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })
}
