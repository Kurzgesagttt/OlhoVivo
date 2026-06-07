package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.ComentarioCurtida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ComentarioCurtidaRepository extends JpaRepository<ComentarioCurtida, UUID> {
    Optional<ComentarioCurtida> findByComentarioIdAndUsuarioId(UUID comentarioId, UUID usuarioId);

    boolean existsByComentarioIdAndUsuarioId(UUID comentarioId, UUID usuarioId);

    int countByComentarioId(UUID comentarioId);
}
