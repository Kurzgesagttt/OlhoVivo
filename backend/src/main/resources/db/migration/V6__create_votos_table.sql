CREATE TABLE votos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID                        NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    usuario_id    UUID                        NOT NULL REFERENCES usuarios(id)   ON DELETE CASCADE,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_votos_ocorrencia_usuario UNIQUE (ocorrencia_id, usuario_id)
);

CREATE INDEX idx_votos_ocorrencia_id ON votos (ocorrencia_id);
CREATE INDEX idx_votos_usuario_id    ON votos (usuario_id);
