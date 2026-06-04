package br.com.olhodobairro.service;

import br.com.olhodobairro.model.Ocorrencia;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.model.Voto;
import br.com.olhodobairro.repository.OcorrenciaRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.repository.VotoRepository;
import br.com.olhodobairro.security.SecurityContextHelper;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class VotoService {

    private final VotoRepository votoRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextHelper securityContextHelper;

    public VotoService(VotoRepository votoRepository,
                       OcorrenciaRepository ocorrenciaRepository,
                       UsuarioRepository usuarioRepository,
                       SecurityContextHelper securityContextHelper) {
        this.votoRepository = votoRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.securityContextHelper = securityContextHelper;
    }

    @Transactional
    public void votar(UUID ocorrenciaId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        if (votoRepository.existsByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já votou nesta ocorrência");
        }
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        Voto voto = new Voto();
        voto.setOcorrencia(ocorrencia);
        voto.setUsuario(usuario);
        votoRepository.save(voto);

        ocorrencia.setVotosCount(ocorrencia.getVotosCount() + 1);
        ocorrenciaRepository.save(ocorrencia);
    }

    @Transactional
    public void removerVoto(UUID ocorrenciaId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        Voto voto = votoRepository.findByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voto não encontrado"));
        votoRepository.delete(voto);

        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada"));
        ocorrencia.setVotosCount(Math.max(0, ocorrencia.getVotosCount() - 1));
        ocorrenciaRepository.save(ocorrencia);
    }

}
