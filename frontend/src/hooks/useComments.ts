import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/comment.service'
import type { PageResponse } from '../types/api'
import type { Comentario, CriarComentarioRequest } from '../types/comment'

export function useComments(ocorrenciaId: string) {
  return useQuery({
    queryKey: ['comentarios', ocorrenciaId],
    queryFn: () => commentService.listar(ocorrenciaId),
    enabled: !!ocorrenciaId,
  })
}

export function useCreateComment(ocorrenciaId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CriarComentarioRequest) => commentService.criar(ocorrenciaId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comentarios', ocorrenciaId] }),
  })
}

export function useToggleCommentLike(ocorrenciaId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['comentarios', ocorrenciaId]

  return useMutation({
    mutationFn: ({ comentarioId, curtido }: { comentarioId: string; curtido: boolean }) =>
      curtido
        ? commentService.descurtir(ocorrenciaId, comentarioId)
        : commentService.curtir(ocorrenciaId, comentarioId),
    onSuccess: (comentarioAtualizado) => {
      queryClient.setQueryData<PageResponse<Comentario>>(queryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          content: current.content.map((comentario) =>
            comentario.id === comentarioAtualizado.id ? comentarioAtualizado : comentario
          ),
        }
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
