package br.com.olhodobairro.service;

import br.com.olhodobairro.dto.request.CadastroRequest;
import br.com.olhodobairro.dto.request.LoginRequest;
import br.com.olhodobairro.dto.response.TokenResponse;
import br.com.olhodobairro.model.ConsentLog;
import br.com.olhodobairro.model.RefreshToken;
import br.com.olhodobairro.model.Usuario;
import br.com.olhodobairro.model.enums.Role;
import br.com.olhodobairro.repository.ConsentLogRepository;
import br.com.olhodobairro.repository.RefreshTokenRepository;
import br.com.olhodobairro.repository.UsuarioRepository;
import br.com.olhodobairro.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ConsentLogRepository consentLogRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long refreshTokenExpirationDays;
    private final String versaoPoliticaPrivacidade;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RefreshTokenRepository refreshTokenRepository,
            ConsentLogRepository consentLogRepository,
            AuditService auditService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays,
            @Value("${app.privacy-policy.version}") String versaoPoliticaPrivacidade) {
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.consentLogRepository = consentLogRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
        this.versaoPoliticaPrivacidade = versaoPoliticaPrivacidade;
    }

    @Transactional
    public void cadastrar(CadastroRequest request, String ipCliente) {
        if (!request.aceitouPolitica()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Aceitação da política é obrigatória");
        }

        String emailHash = sha256Hex(request.email().toLowerCase());
        String cpfHash = sha256Hex(request.cpf());
        String ipHash = sha256Hex(ipCliente == null ? "" : ipCliente);

        if (usuarioRepository.existsByEmailHash(emailHash)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (usuarioRepository.existsByCpfHash(cpfHash)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmailHash(emailHash);
        usuario.setCpfHash(cpfHash);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setRole(Role.MORADOR);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        ConsentLog consentLog = new ConsentLog();
        consentLog.setUsuario(usuarioSalvo);
        consentLog.setVersaoPolitica(versaoPoliticaPrivacidade);
        consentLog.setIpHash(ipHash);
        consentLogRepository.save(consentLog);

        auditService.registrar(
                usuarioSalvo,
                "CADASTRO_USUARIO",
                "Usuario",
                usuarioSalvo.getId(),
                Map.of("role", usuarioSalvo.getRole().name()),
                ipHash
        );
    }

    @Transactional
    public LoginResult login(LoginRequest request) {
        String emailHash = sha256Hex(request.email().toLowerCase());

        Usuario usuario = usuarioRepository.findByEmailHash(emailHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta desativada");
        }

        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String accessToken = jwtService.gerarAccessToken(
                usuario.getId().toString(),
                Map.of("role", usuario.getRole().name())
        );

        String rawRefreshToken = UUID.randomUUID().toString();
        String refreshTokenHash = sha256Hex(rawRefreshToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setTokenHash(refreshTokenHash);
        refreshToken.setExpiraEm(OffsetDateTime.now().plusDays(refreshTokenExpirationDays));
        refreshTokenRepository.save(refreshToken);

        return new LoginResult(new TokenResponse(accessToken), rawRefreshToken);
    }

    @Transactional
    public RefreshResult renovarToken(String rawRefreshToken) {
        String tokenHash = sha256Hex(rawRefreshToken);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido"));

        if (!refreshToken.isValido()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expirado ou revogado");
        }

        Usuario usuario = refreshToken.getUsuario();

        // Rotacionar: revogar o token atual e emitir um novo
        refreshToken.setRevogadoEm(OffsetDateTime.now());
        refreshTokenRepository.save(refreshToken);

        String newRawRefreshToken = UUID.randomUUID().toString();
        String newTokenHash = sha256Hex(newRawRefreshToken);

        RefreshToken novoToken = new RefreshToken();
        novoToken.setUsuario(usuario);
        novoToken.setTokenHash(newTokenHash);
        novoToken.setExpiraEm(OffsetDateTime.now().plusDays(refreshTokenExpirationDays));
        refreshTokenRepository.save(novoToken);

        String accessToken = jwtService.gerarAccessToken(
                usuario.getId().toString(),
                Map.of("role", usuario.getRole().name())
        );

        return new RefreshResult(new TokenResponse(accessToken), newRawRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevogadoEm(OffsetDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }

    public record LoginResult(TokenResponse tokenResponse, String rawRefreshToken) {}

    public record RefreshResult(TokenResponse tokenResponse, String rawRefreshToken) {}
}
