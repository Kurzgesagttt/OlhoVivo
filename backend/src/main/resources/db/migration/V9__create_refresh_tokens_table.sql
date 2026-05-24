CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID                        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(64)                 NOT NULL UNIQUE,
    expira_em  TIMESTAMP WITH TIME ZONE    NOT NULL,
    revogado_em TIMESTAMP WITH TIME ZONE,
    criado_em  TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_usuario_id ON refresh_tokens (usuario_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expira_em  ON refresh_tokens (expira_em);
