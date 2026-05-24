package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.response.NotificacaoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificacaoService {

    public Page<NotificacaoResponse> listarDoUsuario(Pageable pageable) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public void marcarComoLida(UUID notificacaoId) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
