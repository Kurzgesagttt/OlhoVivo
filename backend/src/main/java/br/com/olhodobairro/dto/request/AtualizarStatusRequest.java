package br.com.olhodobairro.dto.request;

import br.com.olhodobairro.model.enums.StatusOcorrencia;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusRequest(
        @NotNull(message = "Status é obrigatório")
        StatusOcorrencia status
) {}
