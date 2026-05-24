CREATE TABLE ocorrencias (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo        VARCHAR(100)                NOT NULL,
    descricao     VARCHAR(500)                NOT NULL,
    status        VARCHAR(20)                 NOT NULL DEFAULT 'PENDENTE'
                      CHECK (status IN ('PENDENTE', 'RESOLVIDA')),
    categoria_id  UUID                        NOT NULL REFERENCES categorias(id),
    bairro_id     UUID                                 REFERENCES bairros(id),
    usuario_id    UUID                                 REFERENCES usuarios(id) ON DELETE SET NULL,
    latitude      DECIMAL(9, 6),
    longitude     DECIMAL(9, 6),
    endereco      VARCHAR(255),
    votos_count   INTEGER                     NOT NULL DEFAULT 0,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    resolvido_em  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ocorrencias_status       ON ocorrencias (status);
CREATE INDEX idx_ocorrencias_categoria_id ON ocorrencias (categoria_id);
CREATE INDEX idx_ocorrencias_bairro_id    ON ocorrencias (bairro_id);
CREATE INDEX idx_ocorrencias_usuario_id   ON ocorrencias (usuario_id);
CREATE INDEX idx_ocorrencias_criado_em    ON ocorrencias (criado_em);
CREATE INDEX idx_ocorrencias_votos_count  ON ocorrencias (votos_count);
