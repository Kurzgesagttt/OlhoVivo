UPDATE ocorrencias o
SET votos_count = (
    SELECT COUNT(*)
    FROM votos v
    WHERE v.ocorrencia_id = o.id
);
