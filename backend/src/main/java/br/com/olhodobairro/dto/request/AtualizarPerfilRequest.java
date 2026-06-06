package br.com.olhodobairro.dto.request;

import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @Size(max = 500, message = "Descricao deve ter no maximo 500 caracteres")
        String bio
) {}
