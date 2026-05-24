package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revogadoEm = :agora WHERE r.usuario.id = :usuarioId AND r.revogadoEm IS NULL")
    void revogarTodosDoUsuario(UUID usuarioId, OffsetDateTime agora);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiraEm < :agora")
    void deletarExpirados(OffsetDateTime agora);
}
