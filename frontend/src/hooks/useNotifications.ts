import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notification.service'

export function useNotifications() {
  return useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => notificationService.listar(),
    refetchInterval: 30_000, // polling a cada 30s
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.marcarComoLida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] }),
  })
}
