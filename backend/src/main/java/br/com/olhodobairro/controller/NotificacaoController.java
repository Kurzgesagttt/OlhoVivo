package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.response.NotificacaoResponse;
import br.com.olhodobairro.service.NotificacaoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificacaoResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(notificacaoService.listarDoUsuario(pageable));
    }

    @PatchMapping("/{id}/lida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarComoLida(@PathVariable UUID id) {
        notificacaoService.marcarComoLida(id);
        return ResponseEntity.noContent().build();
    }
}
