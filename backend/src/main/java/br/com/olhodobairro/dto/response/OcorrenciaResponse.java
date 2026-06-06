package br.com.olhodobairro.dto.response;

import br.com.olhodobairro.model.enums.StatusOcorrencia;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OcorrenciaResponse(
        UUID id,
        String titulo,
        String descricao,
        StatusOcorrencia status,
        CategoriaResponse categoria,
        BairroResponse bairro,
        UUID usuarioId,
        BigDecimal latitude,
        BigDecimal longitude,
        String endereco,
        int votosCount,
        boolean votadoPeloUsuario,
        List<String> imagensUrl,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm,
        OffsetDateTime resolvidoEm
) {}
