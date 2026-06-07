ALTER TABLE comentarios
    ADD COLUMN comentario_pai_id UUID REFERENCES comentarios(id) ON DELETE CASCADE;

CREATE INDEX idx_comentarios_comentario_pai_id ON comentarios (comentario_pai_id);
