package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CriarComentarioRequest;
import br.com.olhodobairro.dto.response.ComentarioResponse;
import br.com.olhodobairro.model.Comentario;
import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.ComentarioRepository;
import br.com.olhodobairro.repository.OcorrenciaRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public ComentarioService(ComentarioRepository comentarioRepository,
                              OcorrenciaRepository ocorrenciaRepository,
                              UsuarioRepository usuarioRepository,
                              SecurityContextHelper securityContextHelper) {
        this.comentarioRepository = comentarioRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
    }

    @Transactional
    public Page<ComentarioResponse> listar(UUID ocorrenciaId, Pageable pageable) {
        return comentarioRepository.findAtivosporOcorrencia(ocorrenciaId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ComentarioResponse criar(UUID ocorrenciaId, CriarComentarioRequest request) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada"));

        Usuario usuario = usuarioRepository.findById(securityContextHelper.getUsuarioIdAutenticado())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        Comentario comentario = new Comentario();
        comentario.setOcorrencia(ocorrencia);
        comentario.setUsuario(usuario);
        comentario.setConteudo(request.conteudo());

        return toResponse(comentarioRepository.save(comentario));
    }

    @Transactional
    public void deletar(UUID ocorrenciaId, UUID comentarioId) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentário não encontrado"));
        if (!comentario.getOcorrencia().getId().equals(ocorrenciaId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comentário não pertence a esta ocorrência");
        }
        comentario.setDeletadoEm(OffsetDateTime.now());
        comentarioRepository.save(comentario);
    }

    private ComentarioResponse toResponse(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getOcorrencia().getId(),
                c.getUsuario() != null ? c.getUsuario().getId() : null,
                c.getUsuario() != null ? c.getUsuario().getNome() : "Anônimo",
                c.getConteudo(),
                c.getCriadoEm()
        );
    }
}
