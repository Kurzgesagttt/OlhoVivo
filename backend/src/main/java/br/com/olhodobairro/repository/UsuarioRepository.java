package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmailHash(String emailHash);
    boolean existsByEmailHash(String emailHash);
    boolean existsByCpfHash(String cpfHash);
}
