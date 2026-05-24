package br.com.olhodobairro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CriarOcorrenciaRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(min = 5, max = 100, message = "Título deve ter entre 5 e 100 caracteres")
        String titulo,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 20, max = 500, message = "Descrição deve ter entre 20 e 500 caracteres")
        String descricao,

        @NotNull(message = "Categoria é obrigatória")
        UUID categoriaId,

        UUID bairroId,
        BigDecimal latitude,
        BigDecimal longitude,

        @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
        String endereco
) {}
