package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    List<Categoria> findAllByAtivoTrue();
    boolean existsByNomeIgnoreCase(String nome);
}
