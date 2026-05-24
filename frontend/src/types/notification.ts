// Tipos de domínio: Notificação
export type TipoNotificacao =
  | 'STATUS_OCORRENCIA_ALTERADO'
  | 'NOVO_COMENTARIO'
  | 'VOTO_RECEBIDO'
  | 'SISTEMA'

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: TipoNotificacao
  ocorrenciaId: string | null
  lida: boolean
  criadoEm: string
}
