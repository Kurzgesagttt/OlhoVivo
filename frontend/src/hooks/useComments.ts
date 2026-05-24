import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../services/comment.service'
import type { CriarComentarioRequest } from '../types/comment'

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
