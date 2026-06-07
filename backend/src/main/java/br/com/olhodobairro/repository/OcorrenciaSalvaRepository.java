package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.OcorrenciaSalva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OcorrenciaSalvaRepository extends JpaRepository<OcorrenciaSalva, UUID> {
    boolean existsByOcorrenciaIdAndUsuarioId(UUID ocorrenciaId, UUID usuarioId);
    Optional<OcorrenciaSalva> findByOcorrenciaIdAndUsuarioId(UUID ocorrenciaId, UUID usuarioId);
}
