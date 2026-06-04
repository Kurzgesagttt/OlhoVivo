package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.response.NotificacaoResponse;
import br.com.olhodobairro.repository.NotificacaoRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final SecurityContextHelper securityContextHelper;

    public NotificacaoService(NotificacaoRepository notificacaoRepository,
                               SecurityContextHelper securityContextHelper) {
        this.notificacaoRepository = notificacaoRepository;
        this.securityContextHelper = securityContextHelper;
    }

    public Page<NotificacaoResponse> listarDoUsuario(Pageable pageable) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        return notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId, pageable)
                .map(n -> new NotificacaoResponse(
                        n.getId(),
                        n.getTitulo(),
                        n.getMensagem(),
                        n.getTipo(),
                        n.getOcorrencia() != null ? n.getOcorrencia().getId() : null,
                        n.getLidoEm() != null,
                        n.getCriadoEm()
                ));
    }

    @Transactional
    public void marcarComoLida(UUID notificacaoId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        var notificacao = notificacaoRepository.findById(notificacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));
        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        if (notificacao.getLidoEm() == null) {
            notificacao.setLidoEm(OffsetDateTime.now());
            notificacaoRepository.save(notificacao);
        }
    }
}
