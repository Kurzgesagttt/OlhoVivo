CREATE TABLE bairros (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome      VARCHAR(100)                NOT NULL,
    cidade    VARCHAR(100)                NOT NULL,
    estado    CHAR(2)                     NOT NULL,
    latitude  DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    criado_em TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bairros_cidade_estado ON bairros (cidade, estado);
