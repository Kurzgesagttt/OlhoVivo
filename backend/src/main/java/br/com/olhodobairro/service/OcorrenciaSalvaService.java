package br.com.olhodobairro.service;

import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.OcorrenciaSalva;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.repository.OcorrenciaRepository;
import br.com.olhodobairro.repository.OcorrenciaSalvaRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class OcorrenciaSalvaService {

    private final OcorrenciaSalvaRepository ocorrenciaSalvaRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public OcorrenciaSalvaService(OcorrenciaSalvaRepository ocorrenciaSalvaRepository,
                                  OcorrenciaRepository ocorrenciaRepository,
                                  UsuarioRepository usuarioRepository,
                                  SecurityContextHelper securityContextHelper) {
        this.ocorrenciaSalvaRepository = ocorrenciaSalvaRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
    }

    @Transactional
    public void salvar(UUID ocorrenciaId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        if (ocorrenciaSalvaRepository.existsByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId)) {
            return;
        }

        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia nao encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));

        OcorrenciaSalva ocorrenciaSalva = new OcorrenciaSalva();
        ocorrenciaSalva.setOcorrencia(ocorrencia);
        ocorrenciaSalva.setUsuario(usuario);
        ocorrenciaSalvaRepository.save(ocorrenciaSalva);
    }

    @Transactional
    public void remover(UUID ocorrenciaId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        OcorrenciaSalva ocorrenciaSalva = ocorrenciaSalvaRepository.findByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia salva nao encontrada"));
        ocorrenciaSalvaRepository.delete(ocorrenciaSalva);
    }
}
