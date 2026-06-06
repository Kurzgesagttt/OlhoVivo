package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.Ocorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {}
