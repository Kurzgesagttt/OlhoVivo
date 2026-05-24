CREATE TABLE usuarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(100)                NOT NULL,
    email_hash    VARCHAR(64)                 NOT NULL UNIQUE,
    cpf_hash      VARCHAR(64)                 NOT NULL UNIQUE,
    senha_hash    VARCHAR(60)                 NOT NULL,
    role          VARCHAR(20)                 NOT NULL
                      CHECK (role IN ('MORADOR', 'MODERADOR', 'ADMIN', 'PREFEITURA')),
    ativo         BOOLEAN                     NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email_hash ON usuarios (email_hash);
CREATE INDEX idx_usuarios_role       ON usuarios (role);
CREATE INDEX idx_usuarios_ativo      ON usuarios (ativo);
