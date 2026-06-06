package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.AtualizarPerfilRequest;
import br.com.olhodobairro.dto.response.UsuarioResponse;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;
    private final Path uploadPath;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            SecurityContextHelper securityContextHelper,
            @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
        this.uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public UsuarioResponse perfilAutenticado() {
        return toResponse(getUsuarioAtual());
    }

    public UsuarioResponse atualizarPerfil(AtualizarPerfilRequest request) {
        Usuario usuario = getUsuarioAtual();
        usuario.setBio(request.bio() == null || request.bio().isBlank() ? null : request.bio().trim());
        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizarFotoPerfil(MultipartFile foto) {
        Usuario usuario = getUsuarioAtual();

        if (foto == null || foto.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem vazia");
        }

        String mimeType = foto.getContentType();
        if (mimeType == null || !mimeType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas arquivos de imagem sao aceitos");
        }

        if (foto.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A foto deve ter no maximo 5MB");
        }

        String fileName = UUID.randomUUID() + extensionFromMimeType(mimeType);
        Path profileDir = uploadPath.resolve("perfis").resolve(usuario.getId().toString()).normalize();
        Path destination = profileDir.resolve(fileName).normalize();

        if (!destination.startsWith(uploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de arquivo invalido");
        }

        try {
            Files.createDirectories(profileDir);
            foto.transferTo(destination);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar a foto");
        }

        usuario.setFotoPerfilUrl("/uploads/perfis/" + usuario.getId() + "/" + fileName);
        return toResponse(usuarioRepository.save(usuario));
    }

    public Object exportarDados() {
        Usuario usuario = getUsuarioAtual();
        return java.util.Map.of(
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "bio", usuario.getBio() == null ? "" : usuario.getBio(),
                "fotoPerfilUrl", usuario.getFotoPerfilUrl() == null ? "" : usuario.getFotoPerfilUrl(),
                "role", usuario.getRole(),
                "ativo", usuario.getAtivo(),
                "criadoEm", usuario.getCriadoEm()
        );
    }

    public void anonimizarConta() {
        Usuario usuario = getUsuarioAtual();
        usuario.setNome("Usuario Removido");
        usuario.setBio(null);
        usuario.setFotoPerfilUrl(null);
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    private Usuario getUsuarioAtual() {
        UUID id = securityContextHelper.getUsuarioIdAutenticado();
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getRole(),
                usuario.getBio(),
                usuario.getFotoPerfilUrl(),
                usuario.getCriadoEm()
        );
    }

    private String extensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
