ALTER TABLE votos
    ADD COLUMN valor INTEGER NOT NULL DEFAULT 1;

ALTER TABLE votos
    ADD CONSTRAINT ck_votos_valor CHECK (valor IN (-1, 1));
