package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.RegistrarVotoRequest;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import br.com.olhodobairro.service.OcorrenciaService;
import br.com.olhodobairro.service.VotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ocorrencias/{ocorrenciaId}/votos")
public class VotoController {

    private final VotoService votoService;
    private final OcorrenciaService ocorrenciaService;

    public VotoController(VotoService votoService, OcorrenciaService ocorrenciaService) {
        this.votoService = votoService;
        this.ocorrenciaService = ocorrenciaService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OcorrenciaResponse> votar(@PathVariable UUID ocorrenciaId,
                                                    @RequestBody(required = false) RegistrarVotoRequest request) {
        int valor = request == null || request.valor() == null ? 1 : request.valor();
        votoService.alternarVoto(ocorrenciaId, valor);
        return ResponseEntity.ok(ocorrenciaService.buscarPorId(ocorrenciaId));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OcorrenciaResponse> removerVoto(@PathVariable UUID ocorrenciaId) {
        votoService.removerVoto(ocorrenciaId);
        return ResponseEntity.ok(ocorrenciaService.buscarPorId(ocorrenciaId));
    }
}
