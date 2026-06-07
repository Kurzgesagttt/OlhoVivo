CREATE TABLE comentario_curtidas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comentario_id  UUID                        NOT NULL REFERENCES comentarios(id) ON DELETE CASCADE,
    usuario_id     UUID                        NOT NULL REFERENCES usuarios(id)    ON DELETE CASCADE,
    criado_em      TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_comentario_curtidas_comentario_usuario UNIQUE (comentario_id, usuario_id)
);

CREATE INDEX idx_comentario_curtidas_comentario_id ON comentario_curtidas (comentario_id);
CREATE INDEX idx_comentario_curtidas_usuario_id    ON comentario_curtidas (usuario_id);

ALTER TABLE public.comentario_curtidas ENABLE ROW LEVEL SECURITY;
