package br.com.olhodobairro.controller;

import br.com.olhodobairro.service.OcorrenciaSalvaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ocorrencias/{ocorrenciaId}/salvamentos")
public class OcorrenciaSalvaController {

    private final OcorrenciaSalvaService ocorrenciaSalvaService;

    public OcorrenciaSalvaController(OcorrenciaSalvaService ocorrenciaSalvaService) {
        this.ocorrenciaSalvaService = ocorrenciaSalvaService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> salvar(@PathVariable UUID ocorrenciaId) {
        ocorrenciaSalvaService.salvar(ocorrenciaId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> remover(@PathVariable UUID ocorrenciaId) {
        ocorrenciaSalvaService.remover(ocorrenciaId);
        return ResponseEntity.noContent().build();
    }
}
