package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.CriarComentarioRequest;
import br.com.olhodobairro.dto.response.ComentarioResponse;
import br.com.olhodobairro.service.ComentarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ocorrencias/{ocorrenciaId}/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping
    public ResponseEntity<Page<ComentarioResponse>> listar(@PathVariable UUID ocorrenciaId, Pageable pageable) {
        return ResponseEntity.ok(comentarioService.listar(ocorrenciaId, pageable));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioResponse> criar(@PathVariable UUID ocorrenciaId, @Valid @RequestBody CriarComentarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comentarioService.criar(ocorrenciaId, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletar(@PathVariable UUID ocorrenciaId, @PathVariable UUID id) {
        comentarioService.deletar(ocorrenciaId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/curtida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioResponse> curtir(@PathVariable UUID ocorrenciaId, @PathVariable UUID id) {
        return ResponseEntity.ok(comentarioService.curtir(ocorrenciaId, id));
    }

    @DeleteMapping("/{id}/curtida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioResponse> descurtir(@PathVariable UUID ocorrenciaId, @PathVariable UUID id) {
        return ResponseEntity.ok(comentarioService.descurtir(ocorrenciaId, id));
    }
}
