package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.response.BairroResponse;
import br.com.olhodobairro.service.BairroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bairros")
public class BairroController {

    private final BairroService bairroService;

    public BairroController(BairroService bairroService) {
        this.bairroService = bairroService;
    }

    @GetMapping
    public ResponseEntity<List<BairroResponse>> listar(
            @RequestParam(defaultValue = "Lins") String cidade,
            @RequestParam(defaultValue = "SP") String estado) {
        return ResponseEntity.ok(bairroService.listarPorCidade(cidade, estado));
    }
}
