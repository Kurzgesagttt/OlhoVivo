package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Voto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VotoRepository extends JpaRepository<Voto, UUID> {
    Optional<Voto> findByOcorrenciaIdAndUsuarioId(UUID ocorrenciaId, UUID usuarioId);
}
