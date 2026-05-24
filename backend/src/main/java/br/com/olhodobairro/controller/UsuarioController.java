package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.response.UsuarioResponse;
import br.com.olhodobairro.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> perfil() {
        return ResponseEntity.ok(usuarioService.perfilAutenticado());
    }

    @GetMapping("/data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> exportarDados() {
        return ResponseEntity.ok(usuarioService.exportarDados());
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> anonimizar() {
        usuarioService.anonimizarConta();
        return ResponseEntity.noContent().build();
    }
}
