CREATE TABLE ocorrencias_salvas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id  UUID                        NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    usuario_id     UUID                        NOT NULL REFERENCES usuarios(id)   ON DELETE CASCADE,
    criado_em      TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_ocorrencias_salvas_ocorrencia_usuario UNIQUE (ocorrencia_id, usuario_id)
);

CREATE INDEX idx_ocorrencias_salvas_ocorrencia_id ON ocorrencias_salvas (ocorrencia_id);
CREATE INDEX idx_ocorrencias_salvas_usuario_id    ON ocorrencias_salvas (usuario_id);

ALTER TABLE public.ocorrencias_salvas ENABLE ROW LEVEL SECURITY;
