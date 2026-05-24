package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Notificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {
    Page<Notificacao> findByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notificacao n WHERE n.usuario.id = :usuarioId AND n.lidoEm IS NULL")
    long countNaoLidasByUsuarioId(UUID usuarioId);
}
