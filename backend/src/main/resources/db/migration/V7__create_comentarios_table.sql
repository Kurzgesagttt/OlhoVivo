CREATE TABLE comentarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID                        NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    usuario_id    UUID                                 REFERENCES usuarios(id)    ON DELETE SET NULL,
    conteudo      VARCHAR(500)                NOT NULL,
    deletado_em   TIMESTAMP WITH TIME ZONE,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comentarios_ocorrencia_id ON comentarios (ocorrencia_id);
CREATE INDEX idx_comentarios_usuario_id    ON comentarios (usuario_id);
CREATE INDEX idx_comentarios_criado_em     ON comentarios (criado_em);
CREATE INDEX idx_comentarios_deletado_em   ON comentarios (deletado_em);
