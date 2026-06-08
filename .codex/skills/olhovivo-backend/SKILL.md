---
name: olhovivo-backend
description: Padroes do backend Spring Boot, Spring Security, JPA, Flyway e PostgreSQL do projeto OlhoVivo. Use quando Codex precisar criar, editar, revisar ou depurar controllers, DTOs, services, repositories, entidades, migrations ou seguranca no backend deste repositorio.
---

# OlhoVivo Backend

Siga estes padroes ao trabalhar em `backend/`.

## Estrutura

- `controller`: borda REST sob `/api/v1`.
- `dto/request` e `dto/response`: contratos de entrada e saida.
- `service`: regra de negocio.
- `repository`: acesso a dados com Spring Data.
- `model`: entidades e enums.
- `config` e `security`: configuracao transversal.

## Regras de implementacao

- Mantenha controllers finos; a logica deve ir para `service`.
- Nao exponha entidades JPA diretamente; responda com DTO.
- Ao criar persistencia nova, adicione migration Flyway correspondente.
- Preserve `ddl-auto: validate`.
- Reutilize a seguranca por roles com `@PreAuthorize` conforme o padrao ja existente.
- Prefira nomes de rota, DTO e service alinhados ao dominio em portugues.
- Se mudar contrato de API, alinhe o frontend em `src/services` e `src/types`.

## Fluxo recomendado

1. Mapear endpoint, service, repository e entidade envolvidos.
2. Implementar a regra de negocio no service.
3. Adicionar ou ajustar DTOs.
4. Criar migration se houver alteracao de schema.
5. Validar com testes Maven quando a mudanca justificar.

## Comandos uteis

```powershell
cd backend
mvn spring-boot:run
mvn test
```
