package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.RegistrarVotoRequest;
import br.com.olhodobairro.service.VotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ocorrencias/{ocorrenciaId}/votos")
public class VotoController {

    private final VotoService votoService;

    public VotoController(VotoService votoService) {
        this.votoService = votoService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> votar(@PathVariable UUID ocorrenciaId,
                                      @RequestBody(required = false) RegistrarVotoRequest request) {
        int valor = request == null || request.valor() == null ? 1 : request.valor();
        votoService.votar(ocorrenciaId, valor);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removerVoto(@PathVariable UUID ocorrenciaId) {
        votoService.removerVoto(ocorrenciaId);
        return ResponseEntity.noContent().build();
    }
}
