package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.enums.StatusOcorrencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {
    Page<Ocorrencia> findAllByStatus(StatusOcorrencia status, Pageable pageable);
    Page<Ocorrencia> findAllByCategoriaId(UUID categoriaId, Pageable pageable);
    Page<Ocorrencia> findAllByBairroId(UUID bairroId, Pageable pageable);
    Page<Ocorrencia> findAllByUsuarioId(UUID usuarioId, Pageable pageable);
}
