---
name: olhovivo-deploy
description: Fluxo de build e deploy do projeto OlhoVivo com Docker Compose, Nginx, frontend Vite e backend Spring Boot. Use quando Codex precisar preparar, revisar, validar ou ajustar deploy do frontend, backend ou stack completa, inclusive ambiente local e EC2.
---

# OlhoVivo Deploy

Use esta skill para operacoes de build e deploy do repositorio.

## Arquivos de referencia

- `docker/docker-compose.yml`: stack local com PostgreSQL, backend e frontend.
- `docker/docker-compose.prod.yml`: stack empacotada para deploy.
- `frontend/Dockerfile`: build Vite com `node:20-alpine` e runtime em `nginx:stable-alpine`.
- `backend/Dockerfile`: build Maven/Java 21 e runtime `eclipse-temurin:21-jre-alpine`.
- `.env.localexample` e `.env.production.example`: variaveis esperadas.

## Regras

- Nao presumir variaveis de ambiente fora dos exemplos do repo.
- Se mudar compose, revise tambem os exemplos de `.env`.
- Frontend publicado em container responde na porta `80`.
- Backend responde na porta `8080`.
- Banco local usa `postgres:15-alpine`; producao espera banco externo via `DB_URL`, `DB_USER`, `DB_PASSWORD`.

## Fluxo local

```powershell
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml logs -f
```

## Fluxo de deploy empacotado

```powershell
docker compose -f docker/docker-compose.prod.yml up -d --build
docker compose -f docker/docker-compose.prod.yml logs -f
```

## Checklist

1. Confirmar env file correto.
2. Validar build do frontend e backend se houve mudanca de codigo.
3. Revisar portas, proxy e base URL da API.
4. Revisar impacto em Nginx e compose quando houver alteracao de roteamento.
