package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.response.UsuarioResponse;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public UsuarioService(UsuarioRepository usuarioRepository, SecurityContextHelper securityContextHelper) {
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
    }

    public UsuarioResponse perfilAutenticado() {
        Usuario usuario = getUsuarioAtual();
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getRole(), usuario.getCriadoEm());
    }

    public Object exportarDados() {
        Usuario usuario = getUsuarioAtual();
        return java.util.Map.of(
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "role", usuario.getRole(),
                "ativo", usuario.getAtivo(),
                "criadoEm", usuario.getCriadoEm()
        );
    }

    public void anonimizarConta() {
        Usuario usuario = getUsuarioAtual();
        usuario.setNome("Usuário Removido");
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    private Usuario getUsuarioAtual() {
        UUID id = securityContextHelper.getUsuarioIdAutenticado();
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }
}
