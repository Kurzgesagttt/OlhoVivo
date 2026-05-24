import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voteService } from '../services/vote.service'

export function useVote(ocorrenciaId: string) {
  const queryClient = useQueryClient()

  const votar = useMutation({
    mutationFn: () => voteService.votar(ocorrenciaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias', ocorrenciaId] }),
  })

  const removerVoto = useMutation({
    mutationFn: () => voteService.removerVoto(ocorrenciaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias', ocorrenciaId] }),
  })

  return { votar: votar.mutate, removerVoto: removerVoto.mutate }
}
