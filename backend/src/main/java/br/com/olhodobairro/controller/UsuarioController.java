package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.AtualizarPerfilRequest;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import br.com.olhodobairro.dto.response.UsuarioResponse;
import br.com.olhodobairro.service.OcorrenciaService;
import br.com.olhodobairro.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/me")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final OcorrenciaService ocorrenciaService;

    public UsuarioController(UsuarioService usuarioService, OcorrenciaService ocorrenciaService) {
        this.usuarioService = usuarioService;
        this.ocorrenciaService = ocorrenciaService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> perfil() {
        return ResponseEntity.ok(usuarioService.perfilAutenticado());
    }

    @GetMapping("/ocorrencias-salvas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OcorrenciaResponse>> ocorrenciasSalvas(Pageable pageable) {
        return ResponseEntity.ok(ocorrenciaService.listarSalvasDoUsuario(pageable));
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

}
