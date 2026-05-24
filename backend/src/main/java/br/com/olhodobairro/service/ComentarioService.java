package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CriarComentarioRequest;
import br.com.olhodobairro.dto.response.ComentarioResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ComentarioService {

    public Page<ComentarioResponse> listar(UUID ocorrenciaId, Pageable pageable) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public ComentarioResponse criar(UUID ocorrenciaId, CriarComentarioRequest request) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public void deletar(UUID ocorrenciaId, UUID comentarioId) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
