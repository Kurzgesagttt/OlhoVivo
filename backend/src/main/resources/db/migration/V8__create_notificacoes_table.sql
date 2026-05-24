CREATE TABLE notificacoes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    UUID                        NOT NULL REFERENCES usuarios(id)   ON DELETE CASCADE,
    titulo        VARCHAR(100)                NOT NULL,
    mensagem      VARCHAR(500)                NOT NULL,
    tipo          VARCHAR(50)                 NOT NULL
                      CHECK (tipo IN ('STATUS_OCORRENCIA_ALTERADO', 'NOVO_COMENTARIO', 'VOTO_RECEBIDO', 'SISTEMA')),
    ocorrencia_id UUID                                 REFERENCES ocorrencias(id) ON DELETE SET NULL,
    lido_em       TIMESTAMP WITH TIME ZONE,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_usuario_id ON notificacoes (usuario_id);
CREATE INDEX idx_notificacoes_lido_em    ON notificacoes (lido_em);
CREATE INDEX idx_notificacoes_criado_em  ON notificacoes (criado_em);
