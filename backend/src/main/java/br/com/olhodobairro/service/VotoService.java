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
    public void votar(UUID ocorrenciaId, int valor) {
        validarValor(valor);

        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia nao encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));

        Voto votoExistente = votoRepository.findByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId).orElse(null);
        if (votoExistente != null) {
            if (votoExistente.getValor() != valor) {
                votoExistente.setValor(valor);
                votoRepository.save(votoExistente);
            }
            atualizarScoreDeVotos(ocorrencia);
            return;
        }

        Voto voto = new Voto();
        voto.setOcorrencia(ocorrencia);
        voto.setUsuario(usuario);
        voto.setValor(valor);
        votoRepository.save(voto);

        atualizarScoreDeVotos(ocorrencia);
    }

    @Transactional
    public void removerVoto(UUID ocorrenciaId) {
        UUID usuarioId = securityContextHelper.getUsuarioIdAutenticado();
        Voto voto = votoRepository.findByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voto nao encontrado"));
        votoRepository.delete(voto);

        Ocorrencia ocorrencia = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrencia nao encontrada"));
        atualizarScoreDeVotos(ocorrencia);
    }

    private void validarValor(int valor) {
        if (valor != 1 && valor != -1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voto deve ser 1 ou -1");
        }
    }

    private void atualizarScoreDeVotos(Ocorrencia ocorrencia) {
        ocorrencia.setVotosCount(votoRepository.sumValorByOcorrenciaId(ocorrencia.getId()));
        ocorrenciaRepository.save(ocorrencia);
    }
}
