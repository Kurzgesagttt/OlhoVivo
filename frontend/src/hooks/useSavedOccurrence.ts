import { useMutation, useQueryClient } from '@tanstack/react-query'
import { savedOccurrenceService } from '../services/saved-occurrence.service'
import type { PageResponse } from '../types/api'
import type { Ocorrencia } from '../types/occurrence'

type SaveContext = {
  previousOccurrences: Array<[readonly unknown[], unknown]>
}

function isOccurrence(data: unknown): data is Ocorrencia {
  return !!data && typeof data === 'object' && 'id' in data && 'salvoPeloUsuario' in data
}

function isOccurrencePage(data: unknown): data is PageResponse<Ocorrencia> {
  return !!data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<Ocorrencia>).content)
}

function updateOccurrenceSaved(data: unknown, ocorrenciaId: string, salvoPeloUsuario: boolean) {
  if (isOccurrence(data)) {
    if (data.id !== ocorrenciaId) return data
    return { ...data, salvoPeloUsuario }
  }

  if (isOccurrencePage(data)) {
    return {
      ...data,
      content: data.content.map(ocorrencia => (
        ocorrencia.id === ocorrenciaId ? { ...ocorrencia, salvoPeloUsuario } : ocorrencia
      )),
    }
  }

  return data
}

export function useSavedOccurrence(ocorrenciaId: string) {
  const queryClient = useQueryClient()

  async function applyOptimisticSave(salvoPeloUsuario: boolean): Promise<SaveContext> {
    await queryClient.cancelQueries({ queryKey: ['ocorrencias'] })

    const previousOccurrences = queryClient.getQueriesData({ queryKey: ['ocorrencias'] })

    queryClient.setQueriesData(
      { queryKey: ['ocorrencias'] },
      current => updateOccurrenceSaved(current, ocorrenciaId, salvoPeloUsuario),
    )

    return { previousOccurrences }
  }

  function rollbackSave(context: SaveContext | undefined) {
    context?.previousOccurrences.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data)
    })
  }

  const salvar = useMutation({
    mutationFn: () => savedOccurrenceService.salvar(ocorrenciaId),
    onMutate: () => applyOptimisticSave(true),
    onError: (_error, _variables, context) => rollbackSave(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-salvas'] })
    },
  })

  const remover = useMutation({
    mutationFn: () => savedOccurrenceService.remover(ocorrenciaId),
    onMutate: () => applyOptimisticSave(false),
    onError: (_error, _variables, context) => rollbackSave(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-salvas'] })
    },
  })

  return {
    salvar: salvar.mutateAsync,
    remover: remover.mutateAsync,
    isSaving: salvar.isPending || remover.isPending,
    saveError: salvar.error ?? remover.error,
  }
}
