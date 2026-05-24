// Tipos utilitários de API
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ErroResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
