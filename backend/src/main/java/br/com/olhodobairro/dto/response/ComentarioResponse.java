package br.com.olhodobairro.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ComentarioResponse(
        UUID id,
        UUID ocorrenciaId,
        UUID usuarioId,
        UUID comentarioPaiId,
        String nomeUsuario,
        String conteudo,
        OffsetDateTime criadoEm,
        int curtidasCount,
        boolean curtidoPeloUsuario,
        int respostasCount
) {}
