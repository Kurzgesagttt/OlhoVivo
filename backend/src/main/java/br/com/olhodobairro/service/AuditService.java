package br.com.olhodobairro.service;

import br.com.olhodobairro.model.AuditLog;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void registrar(Usuario usuario, String acao, String entidadeTipo, UUID entidadeId, Map<String, Object> detalhes, String ipHash) {
        AuditLog log = new AuditLog();
        log.setUsuario(usuario);
        log.setAcao(acao);
        log.setEntidadeTipo(entidadeTipo);
        log.setEntidadeId(entidadeId);
        log.setDetalhes(detalhes);
        log.setIpHash(ipHash);
        auditLogRepository.save(log);
    }
}
