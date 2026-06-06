INSERT INTO categorias (id, nome, descricao, icone, ativo)
VALUES
    ('11111111-1111-4111-8111-111111111111', 'Ocorrencia', 'Problemas urbanos, zeladoria, riscos e demandas do bairro.', 'alert-triangle', TRUE),
    ('22222222-2222-4222-8222-222222222222', 'Alerta', 'Avisos urgentes que exigem atencao rapida da comunidade.', 'bell-ringing', TRUE),
    ('33333333-3333-4333-8333-333333333333', 'Evento', 'Acoes comunitarias, eventos publicos e encontros locais.', 'calendar-event', TRUE),
    ('44444444-4444-4444-8444-444444444444', 'Noticia', 'Informacoes relevantes sobre o bairro e a cidade.', 'news', TRUE),
    ('55555555-5555-4555-8555-555555555555', 'Servico publico', 'Comunicados sobre coleta, saude, transporte e atendimento publico.', 'tools', TRUE)
ON CONFLICT (nome) DO UPDATE
SET descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ativo = TRUE;
