package br.com.olhodobairro.dto.response;

public record TokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
    public TokenResponse(String accessToken) {
        this(accessToken, "Bearer", 900);
    }
}
