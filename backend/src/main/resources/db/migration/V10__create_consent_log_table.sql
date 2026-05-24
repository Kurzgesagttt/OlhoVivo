CREATE TABLE consent_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id       UUID                        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    versao_politica  VARCHAR(20)                 NOT NULL,
    ip_hash          VARCHAR(64)                 NOT NULL,
    consentido_em    TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_log_usuario_id ON consent_log (usuario_id);
