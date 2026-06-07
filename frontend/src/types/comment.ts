// Tipos de domínio: Comentário
export interface Comentario {
  id: string
  ocorrenciaId: string
  usuarioId: string | null
  comentarioPaiId: string | null
  nomeUsuario: string | null
  conteudo: string
  criadoEm: string
  curtidasCount: number
  curtidoPeloUsuario: boolean
  respostasCount: number
}

export interface CriarComentarioRequest {
  conteudo: string
}
