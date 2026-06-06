// Tipos de domínio: Usuário e Autenticação
import type { Role } from './occurrence'

export interface Usuario {
  id: string
  nome: string
  role: Role
  bio: string | null
  fotoPerfilUrl: string | null
  criadoEm: string
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface CadastroRequest {
  nome: string
  email: string
  cpf: string
  senha: string
  aceitouPolitica: boolean
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface AtualizarPerfilRequest {
  bio: string
}
