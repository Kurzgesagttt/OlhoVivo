import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voteService } from '../services/vote.service'
import type { PageResponse } from '../types/api'
import type { Ocorrencia, ValorVoto } from '../types/occurrence'

type VoteContext = {
  previousOccurrences: Array<[readonly unknown[], unknown]>
}

function isOccurrence(data: unknown): data is Ocorrencia {
  return !!data && typeof data === 'object' && 'id' in data && 'votosCount' in data
}

function isOccurrencePage(data: unknown): data is PageResponse<Ocorrencia> {
  return !!data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Ocorrencia>).content)
}

function currentVoteValue(ocorrencia: Ocorrencia): ValorVoto | null {
  return ocorrencia.votoDoUsuario ?? (ocorrencia.votadoPeloUsuario ? 1 : null)
}

function applyVoteToOccurrence(ocorrencia: Ocorrencia, nextVote: ValorVoto | null): Ocorrencia {
  const previousVote = currentVoteValue(ocorrencia)
  const delta =
    previousVote === null && nextVote !== null
      ? 1
      : previousVote !== null && nextVote === null
        ? -1
        : 0

  return {
    ...ocorrencia,
    votosCount: Math.max(0, ocorrencia.votosCount + delta),
    votadoPeloUsuario: nextVote !== null,
    votoDoUsuario: nextVote,
  }
}

function updateOccurrenceVotes(data: unknown, ocorrenciaId: string, nextVote: ValorVoto | null) {
  if (isOccurrence(data)) {
    return data.id === ocorrenciaId ? applyVoteToOccurrence(data, nextVote) : data
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === ocorrenciaId ? applyVoteToOccurrence(ocorrencia, nextVote) : ocorrencia
      )),
    }
  }

  return data
}

export function useVote(ocorrenciaId: string) {
  const queryClient = useQueryClient()

  async function applyOptimisticVote(nextVote: ValorVoto | null): Promise<VoteContext> {
    await queryClient.cancelQueries({ queryKey: ['ocorrencias'] })

    const previousOccurrences = queryClient.getQueriesData({ queryKey: ['ocorrencias'] })

    queryClient.setQueriesData(
      { queryKey: ['ocorrencias'] },
      current => updateOccurrenceVotes(current, ocorrenciaId, nextVote),
    )

    return { previousOccurrences }
  }

  function rollbackVote(context: VoteContext | undefined) {
    context?.previousOccurrences.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data)
    })
  }

  const votar = useMutation({
    mutationFn: (valor: ValorVoto) => voteService.votar(ocorrenciaId, valor),
    onMutate: (valor) => applyOptimisticVote(valor),
    onError: (_error, _variables, context) => rollbackVote(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })

  const removerVoto = useMutation({
    mutationFn: () => voteService.removerVoto(ocorrenciaId),
    onMutate: () => applyOptimisticVote(null),
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
