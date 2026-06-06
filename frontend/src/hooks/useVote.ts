import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voteService } from '../services/vote.service'
import type { PageResponse } from '../types/api'
import type { Ocorrencia } from '../types/occurrence'

type VoteContext = {
  previousOccurrences: Array<[readonly unknown[], unknown]>
}

function isOccurrence(data: unknown): data is Ocorrencia {
  return !!data && typeof data === 'object' && 'id' in data && 'votosCount' in data
}

function isOccurrencePage(data: unknown): data is PageResponse<Ocorrencia> {
  return !!data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Ocorrencia>).content)
}

function updateOccurrenceVotes(data: unknown, ocorrenciaId: string, delta: number) {
  if (isOccurrence(data)) {
    if (data.id !== ocorrenciaId) return data
    return { ...data, votosCount: Math.max(0, data.votosCount + delta) }
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === ocorrenciaId
          ? { ...ocorrencia, votosCount: Math.max(0, ocorrencia.votosCount + delta) }
          : ocorrencia
      )),
    }
  }

  return data
}

export function useVote(ocorrenciaId: string) {
  const queryClient = useQueryClient()

  async function applyOptimisticVote(delta: number): Promise<VoteContext> {
    await queryClient.cancelQueries({ queryKey: ['ocorrencias'] })

    const previousOccurrences = queryClient.getQueriesData({ queryKey: ['ocorrencias'] })

    queryClient.setQueriesData(
      { queryKey: ['ocorrencias'] },
      current => updateOccurrenceVotes(current, ocorrenciaId, delta),
    )

    return { previousOccurrences }
  }

  function rollbackVote(context: VoteContext | undefined) {
    context?.previousOccurrences.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data)
    })
  }

  const votar = useMutation({
    mutationFn: () => voteService.votar(ocorrenciaId),
    onMutate: () => applyOptimisticVote(1),
    onError: (_error, _variables, context) => rollbackVote(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })

  const removerVoto = useMutation({
    mutationFn: () => voteService.removerVoto(ocorrenciaId),
    onMutate: () => applyOptimisticVote(-1),
    onError: (_error, _variables, context) => rollbackVote(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })

  return {
    votar: votar.mutateAsync,
    removerVoto: removerVoto.mutateAsync,
    isVoting: votar.isPending || removerVoto.isPending,
    voteError: votar.error ?? removerVoto.error,
  }
}
