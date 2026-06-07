package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.AtualizarStatusRequest;
import br.com.olhodobairro.dto.request.CriarOcorrenciaRequest;
import br.com.olhodobairro.dto.response.BairroResponse;
import br.com.olhodobairro.dto.response.CategoriaResponse;
import br.com.olhodobairro.dto.response.OcorrenciaResponse;
import br.com.olhodobairro.model.Categoria;
import br.com.olhodobairro.model.ImagemOcorrencia;
import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.BairroRepository;
import br.com.olhodobairro.repository.CategoriaRepository;
import br.com.olhodobairro.repository.ImagemOcorrenciaRepository;
import br.com.olhodobairro.repository.OcorrenciaRepository;
import br.com.olhodobairro.repository.OcorrenciaSalvaRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.repository.VotoRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final CategoriaRepository categoriaRepository;
    private final BairroRepository bairroRepository;
    private final UsuarioRepository usuarioRepository;
    private final VotoRepository votoRepository;
    private final OcorrenciaSalvaRepository ocorrenciaSalvaRepository;
    private final ImagemOcorrenciaRepository imagemOcorrenciaRepository;
    private final SecurityContextHelper securityContextHelper;
    private final Path uploadPath;

    public OcorrenciaService(OcorrenciaRepository ocorrenciaRepository,
                              CategoriaRepository categoriaRepository,
                              BairroRepository bairroRepository,
                              UsuarioRepository usuarioRepository,
                              VotoRepository votoRepository,
                              OcorrenciaSalvaRepository ocorrenciaSalvaRepository,
                              ImagemOcorrenciaRepository imagemOcorrenciaRepository,
                              SecurityContextHelper securityContextHelper,
                              @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.categoriaRepository = categoriaRepository;
        this.bairroRepository = bairroRepository;
        this.usuarioRepository = usuarioRepository;
        this.votoRepository = votoRepository;
        this.ocorrenciaSalvaRepository = ocorrenciaSalvaRepository;
        this.imagemOcorrenciaRepository = imagemOcorrenciaRepository;
        this.securityContextHelper = securityContextHelper;
        this.uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public Page<OcorrenciaResponse> listar(Pageable pageable) {
        return ocorrenciaRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public Page<OcorrenciaResponse> listarSalvasDoUsuario(Pageable pageable) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        return ocorrenciaSalvaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId, pageable)
                .map(salva -> toResponse(salva.getOcorrencia()));
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
        if (request.bairroId() != null) {
            ocorrencia.setBairro(bairroRepository.findById(request.bairroId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bairro nao encontrado")));
        }

        return toResponse(ocorrenciaRepository.save(ocorrencia));
    }

    @Transactional
    public OcorrenciaResponse atualizarStatus(UUID id, AtualizarStatusRequest request) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada"));
        ocorrencia.setStatus(request.status());
        if ("CONCLUIDA".equals(request.status().name())
                || "ENCERRADA".equals(request.status().name())
                || "RESOLVIDA".equals(request.status().name())) {
            ocorrencia.setResolvidoEm(java.time.OffsetDateTime.now());
        } else {
            ocorrencia.setResolvidoEm(null);
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

    @Transactional
    public OcorrenciaResponse adicionarImagens(UUID id, List<MultipartFile> imagens) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia nao encontrada"));

        if (ocorrencia.getUsuario() == null || !ocorrencia.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor pode adicionar imagens nesta ocorrencia");
        }

        if (imagens == null || imagens.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie pelo menos uma imagem");
        }

        List<ImagemOcorrencia> imagensSalvas = new ArrayList<>();
        for (MultipartFile imagem : imagens) {
            imagensSalvas.add(salvarImagem(ocorrencia, imagem));
        }

        imagemOcorrenciaRepository.saveAll(imagensSalvas);
        return toResponse(ocorrencia);
    }

    private ImagemOcorrencia salvarImagem(Ocorrencia ocorrencia, MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem vazia");
        }

        String mimeType = arquivo.getContentType();
        if (mimeType == null || !mimeType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas arquivos de imagem sao aceitos");
        }

        if (arquivo.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada imagem deve ter no maximo 5MB");
        }

        String extension = extensionFromMimeType(mimeType);
        String fileName = UUID.randomUUID() + extension;
        Path occurrenceDir = uploadPath.resolve("ocorrencias").resolve(ocorrencia.getId().toString()).normalize();
        Path destination = occurrenceDir.resolve(fileName).normalize();

        if (!destination.startsWith(uploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de arquivo invalido");
        }

        try {
            Files.createDirectories(occurrenceDir);
            arquivo.transferTo(destination);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar a imagem");
        }

        ImagemOcorrencia imagem = new ImagemOcorrencia();
        imagem.setOcorrencia(ocorrencia);
        imagem.setMimeType(mimeType);
        imagem.setUrl("/uploads/ocorrencias/" + ocorrencia.getId() + "/" + fileName);
        return imagem;
    }

    private String extensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
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
        boolean votadoPeloUsuario = securityContextHelper.getUsuarioIdAutenticadoOptional()
                .map(usuarioId -> votoRepository.existsByOcorrenciaIdAndUsuarioId(o.getId(), usuarioId))
                .orElse(false);
        boolean salvoPeloUsuario = securityContextHelper.getUsuarioIdAutenticadoOptional()
                .map(usuarioId -> ocorrenciaSalvaRepository.existsByOcorrenciaIdAndUsuarioId(o.getId(), usuarioId))
                .orElse(false);
        List<String> imagensUrl = imagemOcorrenciaRepository.findByOcorrenciaIdOrderByCriadoEmAsc(o.getId())
                .stream()
                .map(ImagemOcorrencia::getUrl)
                .toList();

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
                votadoPeloUsuario,
                salvoPeloUsuario,
                imagensUrl,
                o.getCriadoEm(),
                o.getAtualizadoEm(),
                o.getResolvidoEm()
        );
    }
}
