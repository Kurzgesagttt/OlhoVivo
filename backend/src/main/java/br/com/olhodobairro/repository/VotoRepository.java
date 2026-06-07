package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface VotoRepository extends JpaRepository<Voto, UUID> {
    Optional<Voto> findByOcorrenciaIdAndUsuarioId(UUID ocorrenciaId, UUID usuarioId);

    @Query("select coalesce(sum(v.valor), 0) from Voto v where v.ocorrencia.id = :ocorrenciaId")
    int sumValorByOcorrenciaId(@Param("ocorrenciaId") UUID ocorrenciaId);
}
