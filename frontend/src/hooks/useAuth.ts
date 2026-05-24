import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import type { CadastroRequest, LoginRequest } from '../types/auth'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.perfil,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  const cadastroMutation = useMutation({
    mutationFn: (data: CadastroRequest) => authService.cadastrar(data),
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => queryClient.clear(),
  })

  return {
    usuario,
    isLoading,
    isAutenticado: !!usuario,
    login: loginMutation.mutateAsync,
    cadastrar: cadastroMutation.mutateAsync,
    logout: logoutMutation.mutate,
  }
}
