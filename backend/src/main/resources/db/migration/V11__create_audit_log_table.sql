CREATE TABLE audit_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    UUID                                 REFERENCES usuarios(id) ON DELETE SET NULL,
    acao          VARCHAR(100)                NOT NULL,
    entidade_tipo VARCHAR(50),
    entidade_id   UUID,
    detalhes      JSONB,
    ip_hash       VARCHAR(64),
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_usuario_id ON audit_log (usuario_id);
CREATE INDEX idx_audit_log_acao       ON audit_log (acao);
CREATE INDEX idx_audit_log_criado_em  ON audit_log (criado_em);
CREATE INDEX idx_audit_log_entidade   ON audit_log (entidade_tipo, entidade_id);
