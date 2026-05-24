// Tipos de domínio: Comentário
export interface Comentario {
  id: string
  ocorrenciaId: string
  usuarioId: string | null
  nomeUsuario: string | null
  conteudo: string
  criadoEm: string
}

export interface CriarComentarioRequest {
  conteudo: string
}
