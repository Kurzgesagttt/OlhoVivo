package br.com.olhodobairro.controller;

import br.com.olhodobairro.dto.request.CadastroRequest;
import br.com.olhodobairro.dto.request.LoginRequest;
import br.com.olhodobairro.dto.response.TokenResponse;
import br.com.olhodobairro.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final long refreshTokenExpirationDays;

    public AuthController(
            AuthService authService,
            @Value("${jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays) {
        this.authService = authService;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Void> cadastro(
            @Valid @RequestBody CadastroRequest request,
            HttpServletRequest httpRequest) {
        authService.cadastrar(request, extrairIpCliente(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request);
        adicionarCookieRefreshToken(response, result.rawRefreshToken());
        return ResponseEntity.ok(result.tokenResponse());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @CookieValue("refresh_token") String refreshToken,
            HttpServletResponse response) {
        AuthService.RefreshResult result = authService.renovarToken(refreshToken);
        adicionarCookieRefreshToken(response, result.rawRefreshToken());
        return ResponseEntity.ok(result.tokenResponse());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue("refresh_token") String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);
        removerCookieRefreshToken(response);
        return ResponseEntity.noContent().build();
    }

    private void adicionarCookieRefreshToken(HttpServletResponse response, String rawRefreshToken) {
        Cookie cookie = new Cookie("refresh_token", rawRefreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // mudar para true em produção (HTTPS)
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge((int) (refreshTokenExpirationDays * 24 * 3600));
        response.addCookie(cookie);
    }

    private void removerCookieRefreshToken(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extrairIpCliente(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
