package br.com.olhodobairro.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String acao;

    @Column(name = "entidade_tipo", length = 50)
    private String entidadeTipo;

    @Column(name = "entidade_id")
    private UUID entidadeId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> detalhes;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    // Getters e Setters
    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    public String getEntidadeTipo() { return entidadeTipo; }
    public void setEntidadeTipo(String entidadeTipo) { this.entidadeTipo = entidadeTipo; }
    public UUID getEntidadeId() { return entidadeId; }
    public void setEntidadeId(UUID entidadeId) { this.entidadeId = entidadeId; }
    public Map<String, Object> getDetalhes() { return detalhes; }
    public void setDetalhes(Map<String, Object> detalhes) { this.detalhes = detalhes; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String ipHash) { this.ipHash = ipHash; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
}
