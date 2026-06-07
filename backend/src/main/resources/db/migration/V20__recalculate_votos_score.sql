UPDATE ocorrencias o
SET votos_count = (
    SELECT COALESCE(SUM(v.valor), 0)
    FROM votos v
    WHERE v.ocorrencia_id = o.id
);
