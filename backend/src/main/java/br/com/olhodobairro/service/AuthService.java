package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CadastroRequest;
import br.com.olhodobairro.dto.request.LoginRequest;
import br.com.olhodobairro.dto.response.TokenResponse;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public void cadastrar(CadastroRequest request) {
        // TODO: implementar
    }

    public TokenResponse login(LoginRequest request) {
        // TODO: implementar
        throw new UnsupportedOperationException("Não implementado");
    }

    public TokenResponse renovarToken(String refreshToken) {
        // TODO: implementar
        throw new UnsupportedOperationException("Não implementado");
    }

    public void logout(String refreshToken) {
        // TODO: implementar
    }
}
