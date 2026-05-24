CREATE TABLE categorias (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome      VARCHAR(100)                NOT NULL UNIQUE,
    descricao VARCHAR(255),
    icone     VARCHAR(50),
    ativo     BOOLEAN                     NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categorias_ativo ON categorias (ativo);
