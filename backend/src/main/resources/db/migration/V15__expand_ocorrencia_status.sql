ALTER TABLE ocorrencias DROP CONSTRAINT IF EXISTS ocorrencias_status_check;

ALTER TABLE ocorrencias
    ADD CONSTRAINT ocorrencias_status_check
    CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENCERRADA', 'RESOLVIDA'));
