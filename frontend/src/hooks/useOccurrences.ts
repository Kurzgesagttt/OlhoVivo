import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { occurrenceService } from '../services/occurrence.service'
import { useAuth } from './useAuth'
import type { CriarOcorrenciaRequest } from '../types/occurrence'

const OCCURRENCE_QUERY_OPTIONS = {
  staleTime: 30_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const

export function useOccurrences(page = 0) {
  const { usuario, isLoading } = useAuth()
  const authScope = usuario?.id ?? 'anon'

  return useQuery({
    queryKey: ['ocorrencias', authScope, page],
    queryFn: () => occurrenceService.listar(page),
    enabled: !isLoading,
    ...OCCURRENCE_QUERY_OPTIONS,
  })
}

export function useOccurrence(id: string) {
  const { usuario, isLoading } = useAuth()
  const authScope = usuario?.id ?? 'anon'

  return useQuery({
    queryKey: ['ocorrencias', authScope, id],
    queryFn: () => occurrenceService.buscarPorId(id),
    enabled: !!id && !isLoading,
    ...OCCURRENCE_QUERY_OPTIONS,
  })
}

export function useSavedOccurrences(page = 0, enabled = true) {
  const { usuario, isLoading } = useAuth()
  const authScope = usuario?.id ?? 'anon'

  return useQuery({
    queryKey: ['ocorrencias-salvas', authScope, page],
    queryFn: () => occurrenceService.listarSalvas(page),
    enabled: enabled && !!usuario && !isLoading,
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
