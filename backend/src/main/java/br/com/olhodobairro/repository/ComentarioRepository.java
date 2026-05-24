package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Comentario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ComentarioRepository extends JpaRepository<Comentario, UUID> {
    @Query("SELECT c FROM Comentario c WHERE c.ocorrencia.id = :ocorrenciaId AND c.deletadoEm IS NULL ORDER BY c.criadoEm ASC")
    Page<Comentario> findAtivosporOcorrencia(UUID ocorrenciaId, Pageable pageable);
}
