package br.com.olhodobairro.repository;

import br.com.olhodobairro.model.ConsentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConsentLogRepository extends JpaRepository<ConsentLog, UUID> {
}
