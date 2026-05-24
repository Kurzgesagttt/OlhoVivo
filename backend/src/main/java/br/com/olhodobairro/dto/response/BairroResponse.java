package br.com.olhodobairro.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record BairroResponse(
        UUID id,
        String nome,
        String cidade,
        String estado,
        BigDecimal latitude,
        BigDecimal longitude
) {}
