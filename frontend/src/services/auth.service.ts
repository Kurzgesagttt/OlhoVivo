import api from './api'
import type { CadastroRequest, LoginRequest, TokenResponse, Usuario } from '../types/auth'

export const authService = {
  async cadastrar(data: CadastroRequest): Promise<void> {
    await api.post('/auth/cadastro', data)
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data)
    localStorage.setItem('access_token', response.data.accessToken)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('access_token')
  },

  async perfil(): Promise<Usuario> {
    const response = await api.get<Usuario>('/me')
    return response.data
  },
}
