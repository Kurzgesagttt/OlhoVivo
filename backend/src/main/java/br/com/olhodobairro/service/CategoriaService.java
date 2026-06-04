package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CriarCategoriaRequest;
import br.com.olhodobairro.dto.response.CategoriaResponse;
import br.com.olhodobairro.model.Categoria;
import br.com.olhodobairro.repository.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaResponse> listarAtivas() {
        return categoriaRepository.findAllByAtivoTrue().stream()
                .map(c -> new CategoriaResponse(c.getId(), c.getNome(), c.getDescricao(), c.getIcone()))
                .toList();
    }

    public CategoriaResponse criar(CriarCategoriaRequest request) {
        if (categoriaRepository.existsByNomeIgnoreCase(request.nome())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria com este nome já existe");
        }
        Categoria categoria = new Categoria();
        categoria.setNome(request.nome().trim());
        categoria.setDescricao(request.descricao());
        categoria.setIcone(request.icone());
        Categoria salva = categoriaRepository.save(categoria);
        return new CategoriaResponse(salva.getId(), salva.getNome(), salva.getDescricao(), salva.getIcone());
    }
}
