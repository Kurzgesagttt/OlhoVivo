package br.com.olhodobairro.dto.response;

import java.util.UUID;

public record CategoriaResponse(
        UUID id,
        String nome,
        String descricao,
        String icone
) {}
