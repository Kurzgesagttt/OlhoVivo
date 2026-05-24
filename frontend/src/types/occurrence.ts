// Tipos de domínio: Ocorrência, Categoria, Bairro
export type Role = 'MORADOR' | 'MODERADOR' | 'ADMIN' | 'PREFEITURA'
export type StatusOcorrencia = 'PENDENTE' | 'RESOLVIDA'

export interface Categoria {
  id: string
  nome: string
  descricao: string | null
  icone: string | null
}

export interface Bairro {
  id: string
  nome: string
  cidade: string
  estado: string
  latitude: number | null
  longitude: number | null
}

export interface Ocorrencia {
  id: string
  titulo: string
  descricao: string
  status: StatusOcorrencia
  categoria: Categoria
  bairro: Bairro | null
  usuarioId: string | null
  latitude: number | null
  longitude: number | null
  endereco: string | null
  votosCount: number
  imagensUrl: string[]
  criadoEm: string
  atualizadoEm: string
  resolvidoEm: string | null
}

export interface CriarOcorrenciaRequest {
  titulo: string
  descricao: string
  categoriaId: string
  bairroId?: string
  latitude?: number
  longitude?: number
  endereco?: string
}

export interface AtualizarStatusRequest {
  status: StatusOcorrencia
}
