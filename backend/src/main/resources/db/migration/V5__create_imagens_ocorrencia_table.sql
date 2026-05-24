CREATE TABLE imagens_ocorrencia (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID                        NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    url           VARCHAR(500)                NOT NULL,
    mime_type     VARCHAR(50)                 NOT NULL,
    criado_em     TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_imagens_ocorrencia_id ON imagens_ocorrencia (ocorrencia_id);
