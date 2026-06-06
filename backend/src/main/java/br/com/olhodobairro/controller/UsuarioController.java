package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.AtualizarPerfilRequest;
import br.com.olhodobairro.dto.response.UsuarioResponse;
import br.com.olhodobairro.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> atualizarPerfil(@Valid @RequestBody AtualizarPerfilRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarPerfil(request));
    }

    @PostMapping(value = "/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> atualizarFotoPerfil(@RequestPart("foto") MultipartFile foto) {
        return ResponseEntity.ok(usuarioService.atualizarFotoPerfil(foto));
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
