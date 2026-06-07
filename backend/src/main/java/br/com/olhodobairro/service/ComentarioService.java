package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CriarComentarioRequest;
import br.com.olhodobairro.dto.response.ComentarioResponse;
import br.com.olhodobairro.model.Comentario;
import br.com.olhodobairro.model.ComentarioCurtida;
import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.ComentarioCurtidaRepository;
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
    private final ComentarioCurtidaRepository comentarioCurtidaRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public ComentarioService(ComentarioRepository comentarioRepository,
                              ComentarioCurtidaRepository comentarioCurtidaRepository,
                              OcorrenciaRepository ocorrenciaRepository,
                              UsuarioRepository usuarioRepository,
                              SecurityContextHelper securityContextHelper) {
        this.comentarioRepository = comentarioRepository;
        this.comentarioCurtidaRepository = comentarioCurtidaRepository;
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia nao encontrada"));

        Usuario usuario = usuarioRepository.findById(securityContextHelper.getUsuarioIdAutenticado())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));

        Comentario comentario = new Comentario();
        comentario.setOcorrencia(ocorrencia);
        comentario.setUsuario(usuario);
        comentario.setConteudo(request.conteudo());

        return toResponse(comentarioRepository.save(comentario));
    }

    @Transactional
    public void deletar(UUID ocorrenciaId, UUID comentarioId) {
        Comentario comentario = buscarComentarioAtivoDaOcorrencia(ocorrenciaId, comentarioId);
        comentario.setDeletadoEm(OffsetDateTime.now());
        comentarioRepository.save(comentario);
    }

    @Transactional
    public ComentarioResponse curtir(UUID ocorrenciaId, UUID comentarioId) {
        Comentario comentario = buscarComentarioAtivoDaOcorrencia(ocorrenciaId, comentarioId);
        Usuario usuario = usuarioRepository.findById(securityContextHelper.getUsuarioIdAutenticado())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));

        if (comentario.getUsuario() != null && comentario.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao e possivel curtir seu proprio comentario");
        }

        if (comentarioCurtidaRepository.findByComentarioIdAndUsuarioId(comentarioId, usuario.getId()).isEmpty()) {
            ComentarioCurtida curtida = new ComentarioCurtida();
            curtida.setComentario(comentario);
            curtida.setUsuario(usuario);
            comentarioCurtidaRepository.save(curtida);
        }

        return toResponse(comentario);
    }

    @Transactional
    public ComentarioResponse descurtir(UUID ocorrenciaId, UUID comentarioId) {
        Comentario comentario = buscarComentarioAtivoDaOcorrencia(ocorrenciaId, comentarioId);
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();

        comentarioCurtidaRepository.findByComentarioIdAndUsuarioId(comentarioId, usuarioId)
                .ifPresent(comentarioCurtidaRepository::delete);

        return toResponse(comentario);
    }

    private Comentario buscarComentarioAtivoDaOcorrencia(UUID ocorrenciaId, UUID comentarioId) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario nao encontrado"));
        if (!comentario.getOcorrencia().getId().equals(ocorrenciaId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comentario nao pertence a esta ocorrencia");
        }
        if (comentario.isDeletado()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario nao encontrado");
        }
        return comentario;
    }

    private ComentarioResponse toResponse(Comentario comentario) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticadoOptional().orElse(null);

        return new ComentarioResponse(
                comentario.getId(),
                comentario.getOcorrencia().getId(),
                comentario.getUsuario() != null ? comentario.getUsuario().getId() : null,
                comentario.getUsuario() != null ? comentario.getUsuario().getNome() : "Anonimo",
                comentario.getConteudo(),
                comentario.getCriadoEm(),
                comentarioCurtidaRepository.countByComentarioId(comentario.getId()),
                usuarioId != null && comentarioCurtidaRepository.existsByComentarioIdAndUsuarioId(comentario.getId(), usuarioId)
        );
    }
}
