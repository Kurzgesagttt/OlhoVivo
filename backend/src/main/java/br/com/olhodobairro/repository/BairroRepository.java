package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Bairro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BairroRepository extends JpaRepository<Bairro, UUID> {
    List<Bairro> findByCidadeAndEstado(String cidade, String estado);
}
