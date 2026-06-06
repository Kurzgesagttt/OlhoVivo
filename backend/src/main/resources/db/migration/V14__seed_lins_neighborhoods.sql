INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Centro', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Centro' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Junqueira', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Junqueira' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Vila Clélia', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Vila Clélia' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Jardim Tangará', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Jardim Tangará' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'Jardim Santa Clara', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Jardim Santa Clara' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'Parque Aeroporto', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Parque Aeroporto' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'Jardim Aeroporto', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Jardim Aeroporto' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8', 'Ribeiro', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Ribeiro' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', 'Residencial Morumbi', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Residencial Morumbi' AND cidade = 'Lins' AND estado = 'SP');

INSERT INTO bairros (id, nome, cidade, estado)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10', 'Residencial San Fernando', 'Lins', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM bairros WHERE nome = 'Residencial San Fernando' AND cidade = 'Lins' AND estado = 'SP');
