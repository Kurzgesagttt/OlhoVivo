import { useRef } from 'react'
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
  const previousScore = previousVote ?? 0
  const nextScore = nextVote ?? 0

  return {
    ...ocorrencia,
    votosCount: ocorrencia.votosCount + nextScore - previousScore,
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

function replaceOccurrence(data: unknown, updatedOccurrence: Ocorrencia) {
  if (isOccurrence(data)) {
    return data.id === updatedOccurrence.id ? updatedOccurrence : data
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === updatedOccurrence.id ? updatedOccurrence : ocorrencia
      )),
    }
  }

  return data
}

function findOccurrenceVote(data: unknown, ocorrenciaId: string): ValorVoto | null | undefined {
  if (isOccurrence(data)) {
    return data.id === ocorrenciaId ? currentVoteValue(data) : undefined
  }

  if (isOccurrencePage(data)) {
    const ocorrencia = data.content.find(item => item.id === ocorrenciaId)
    return ocorrencia ? currentVoteValue(ocorrencia) : undefined
  }

  return undefined
}

export function useVote(ocorrenciaId: string) {
  const queryClient = useQueryClient()
  const inFlightRef = useRef(false)

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
    onSuccess: (updatedOccurrence) => {
      queryClient.setQueriesData(
        { queryKey: ['ocorrencias'] },
        current => replaceOccurrence(current, updatedOccurrence),
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })

  const removerVoto = useMutation({
    mutationFn: () => voteService.removerVoto(ocorrenciaId),
    onMutate: () => applyOptimisticVote(null),
    onError: (_error, _variables, context) => rollbackVote(context),
    onSuccess: (updatedOccurrence) => {
      queryClient.setQueriesData(
        { queryKey: ['ocorrencias'] },
        current => replaceOccurrence(current, updatedOccurrence),
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] }),
  })

  async function runOnce<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (inFlightRef.current) return undefined

    inFlightRef.current = true
    try {
      return await action()
    } finally {
      inFlightRef.current = false
    }
  }

  function getCachedVote(fallback: ValorVoto | null): ValorVoto | null {
    const occurrenceQueries = queryClient.getQueriesData({ queryKey: ['ocorrencias'] })

    for (const [, data] of occurrenceQueries) {
      const cachedVote = findOccurrenceVote(data, ocorrenciaId)
      if (cachedVote !== undefined) return cachedVote
    }

    return fallback
  }

  return {
    votar: (valor: ValorVoto) => runOnce(() => votar.mutateAsync(valor)),
    removerVoto: () => runOnce(() => removerVoto.mutateAsync()),
    alternarVoto: (votoAtual: ValorVoto | null, proximoVoto: ValorVoto) =>
      runOnce(() => {
        const votoMaisRecente = getCachedVote(votoAtual)
        return votoMaisRecente === proximoVoto ? removerVoto.mutateAsync() : votar.mutateAsync(proximoVoto)
      }),
    isVoting: votar.isPending || removerVoto.isPending,
    voteError: votar.error ?? removerVoto.error,
  }
}
