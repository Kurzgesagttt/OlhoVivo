package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.AtualizarStatusRequest;
import br.com.olhodobairro.dto.request.CriarOcorrenciaRequest;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OcorrenciaService {

    public Page<OcorrenciaResponse> listar(Pageable pageable) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public OcorrenciaResponse buscarPorId(UUID id) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public OcorrenciaResponse criar(CriarOcorrenciaRequest request) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public OcorrenciaResponse atualizarStatus(UUID id, AtualizarStatusRequest request) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public void deletar(UUID id) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
