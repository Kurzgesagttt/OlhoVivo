package br.com.olhodobairro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarCategoriaRequest(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 255) String descricao,
        @Size(max = 50) String icone
) {}
