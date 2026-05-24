package br.com.olhodobairro.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "revogado_em")
    private OffsetDateTime revogadoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    public boolean isValido() {
        return revogadoEm == null && expiraEm.isAfter(OffsetDateTime.now());
    }

    // Getters e Setters
    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public void setExpiraEm(OffsetDateTime expiraEm) { this.expiraEm = expiraEm; }
    public OffsetDateTime getRevogadoEm() { return revogadoEm; }
    public void setRevogadoEm(OffsetDateTime revogadoEm) { this.revogadoEm = revogadoEm; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
}
