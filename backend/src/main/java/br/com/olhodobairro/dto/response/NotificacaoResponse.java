package br.com.olhodobairro.dto.response;

import br.com.olhodobairro.model.enums.TipoNotificacao;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificacaoResponse(
        UUID id,
        String titulo,
        String mensagem,
        TipoNotificacao tipo,
        UUID ocorrenciaId,
        boolean lida,
        OffsetDateTime criadoEm
) {}
