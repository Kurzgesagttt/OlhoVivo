package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.AtualizarStatusRequest;
import br.com.olhodobairro.dto.request.CriarOcorrenciaRequest;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import br.com.olhodobairro.service.OcorrenciaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ocorrencias")
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    public OcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @GetMapping
    public ResponseEntity<Page<OcorrenciaResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(ocorrenciaService.listar(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OcorrenciaResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(ocorrenciaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MORADOR', 'ADMIN')")
    public ResponseEntity<OcorrenciaResponse> criar(@Valid @RequestBody CriarOcorrenciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ocorrenciaService.criar(request));
    }

    @PostMapping(value = "/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MORADOR', 'ADMIN')")
    public ResponseEntity<OcorrenciaResponse> adicionarImagens(
            @PathVariable UUID id,
            @RequestPart("imagens") List<MultipartFile> imagens) {
        return ResponseEntity.ok(ocorrenciaService.adicionarImagens(id, imagens));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MODERADOR', 'ADMIN', 'PREFEITURA')")
    public ResponseEntity<OcorrenciaResponse> atualizarStatus(@PathVariable UUID id, @Valid @RequestBody AtualizarStatusRequest request) {
        return ResponseEntity.ok(ocorrenciaService.atualizarStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PREFEITURA')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        ocorrenciaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
