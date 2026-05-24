package br.com.olhodobairro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarComentarioRequest(
        @NotBlank(message = "Conteúdo é obrigatório")
        @Size(min = 3, max = 500, message = "Comentário deve ter entre 3 e 500 caracteres")
        String conteudo
) {}
