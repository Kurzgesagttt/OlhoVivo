package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.ImagemOcorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ImagemOcorrenciaRepository extends JpaRepository<ImagemOcorrencia, UUID> {
    List<ImagemOcorrencia> findByOcorrenciaId(UUID ocorrenciaId);
}
