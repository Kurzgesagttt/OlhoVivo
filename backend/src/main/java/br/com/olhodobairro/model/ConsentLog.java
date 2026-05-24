package br.com.olhodobairro.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "consent_log")
public class ConsentLog {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "versao_politica", nullable = false, length = 20)
    private String versaoPolitica;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "consentido_em", nullable = false, updatable = false)
    private OffsetDateTime consentidoEm = OffsetDateTime.now();

    // Getters e Setters
    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getVersaoPolitica() { return versaoPolitica; }
    public void setVersaoPolitica(String versaoPolitica) { this.versaoPolitica = versaoPolitica; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String ipHash) { this.ipHash = ipHash; }
    public OffsetDateTime getConsentidoEm() { return consentidoEm; }
}
