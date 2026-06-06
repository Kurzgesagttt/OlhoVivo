package br.com.olhodobairro.dto.response;

import br.com.olhodobairro.model.enums.Role;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        Role role,
        String bio,
        String fotoPerfilUrl,
        OffsetDateTime criadoEm
) {}
