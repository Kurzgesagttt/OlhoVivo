package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.AtualizarStatusRequest;
import br.com.olhodobairro.dto.request.CriarOcorrenciaRequest;
import br.com.olhodobairro.dto.response.BairroResponse;
import br.com.olhodobairro.dto.response.CategoriaResponse;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import br.com.olhodobairro.model.Categoria;
import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.CategoriaRepository;
import br.com.olhodobairro.repository.OcorrenciaRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class OcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public OcorrenciaService(OcorrenciaRepository ocorrenciaRepository,
                              CategoriaRepository categoriaRepository,
                              UsuarioRepository usuarioRepository,
                              SecurityContextHelper securityContextHelper) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
    }

    @Transactional
    public Page<OcorrenciaResponse> listar(Pageable pageable) {
        return ocorrenciaRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public OcorrenciaResponse buscarPorId(UUID id) {
        return toResponse(ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada")));
    }

    @Transactional
    public OcorrenciaResponse criar(CriarOcorrenciaRequest request) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria não encontrada"));

        Ocorrencia ocorrencia = new Ocorrencia();
        ocorrencia.setTitulo(request.titulo());
        ocorrencia.setDescricao(request.descricao());
        ocorrencia.setCategoria(categoria);
        ocorrencia.setUsuario(usuario);
        ocorrencia.setLatitude(request.latitude());
        ocorrencia.setLongitude(request.longitude());
        ocorrencia.setEndereco(request.endereco());

        return toResponse(ocorrenciaRepository.save(ocorrencia));
    }

    @Transactional
    public OcorrenciaResponse atualizarStatus(UUID id, AtualizarStatusRequest request) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada"));
        ocorrencia.setStatus(request.status());
        if ("RESOLVIDA".equals(request.status().name())) {
            ocorrencia.setResolvidoEm(java.time.OffsetDateTime.now());
        }
        return toResponse(ocorrenciaRepository.save(ocorrencia));
    }

    @Transactional
    public void deletar(UUID id) {
        if (!ocorrenciaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada");
        }
        ocorrenciaRepository.deleteById(id);
    }

    private OcorrenciaResponse toResponse(Ocorrencia o) {
        CategoriaResponse cat = new CategoriaResponse(
                o.getCategoria().getId(),
                o.getCategoria().getNome(),
                o.getCategoria().getDescricao(),
                o.getCategoria().getIcone()
        );
        BairroResponse bairro = o.getBairro() == null ? null : new BairroResponse(
                o.getBairro().getId(),
                o.getBairro().getNome(),
                o.getBairro().getCidade(),
                o.getBairro().getEstado(),
                o.getBairro().getLatitude(),
                o.getBairro().getLongitude()
        );
        return new OcorrenciaResponse(
                o.getId(),
                o.getTitulo(),
                o.getDescricao(),
                o.getStatus(),
                cat,
                bairro,
                o.getUsuario() != null ? o.getUsuario().getId() : null,
                o.getLatitude(),
                o.getLongitude(),
                o.getEndereco(),
                o.getVotosCount(),
                List.of(),
                o.getCriadoEm(),
                o.getAtualizadoEm(),
                o.getResolvidoEm()
        );
    }
}
