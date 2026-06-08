# OlhoVivo Stack

## Visao Geral

Stack identificada a partir dos manifests e imagens Docker do repositorio.

## Frontend

| Item | Versao | Origem |
| --- | --- | --- |
| Node.js | `20` | `frontend/Dockerfile` usa `node:20-alpine` |
| React | `18.3.1` | `frontend/package.json` |
| React DOM | `18.3.1` | `frontend/package.json` |
| React Router DOM | `6.23.1` | `frontend/package.json` |
| TanStack React Query | `5.40.0` | `frontend/package.json` |
| Axios | `1.7.2` | `frontend/package.json` |
| TypeScript | `5.4.5` | `frontend/package.json` |
| Vite | `5.3.1` | `frontend/package.json` |
| `@vitejs/plugin-react` | `4.3.0` | `frontend/package.json` |
| Tailwind CSS | `3.4.4` | `frontend/package.json` |
| PostCSS | `8.4.38` | `frontend/package.json` |
| Autoprefixer | `10.4.19` | `frontend/package.json` |
| Nginx | `stable-alpine` | `frontend/Dockerfile` |

## Backend

| Item | Versao | Origem |
| --- | --- | --- |
| Java | `21` | `backend/pom.xml` |
| Spring Boot | `3.3.0` | `backend/pom.xml` |
| Maven | `3.9` | `backend/Dockerfile` usa `maven:3.9-eclipse-temurin-21-alpine` |
| Spring Web | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| Spring Data JPA | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| Spring Security | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| Spring Validation | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| Flyway Core | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| Flyway PostgreSQL | herdada do BOM Spring Boot `3.3.0` | `backend/pom.xml` |
| JJWT API | `0.12.6` | `backend/pom.xml` |
| JJWT Impl | `0.12.6` | `backend/pom.xml` |
| JJWT Jackson | `0.12.6` | `backend/pom.xml` |
| Eclipse Temurin JRE | `21` | `backend/Dockerfile` usa `eclipse-temurin:21-jre-alpine` |

## Banco e Infra

| Item | Versao | Origem |
| --- | --- | --- |
| PostgreSQL local | `15` | `docker/docker-compose.yml` usa `postgres:15-alpine` |
| Supabase | nao fixado no repo | `.env.production.example` e `README.md` |
| Docker Compose | sem campo `version`; requer plugin/CLI moderno | `docker/docker-compose.yml` e `docker/docker-compose.prod.yml` |

## Configuracoes Relevantes

- Frontend dev server: porta `5173` com proxy `/api -> http://localhost:8080` em `frontend/vite.config.ts`.
- Frontend build script: `tsc && vite build`.
- TypeScript frontend: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- Backend HTTP: porta `8080` em `backend/src/main/resources/application.yml`.
- JPA: `ddl-auto: validate`.
- Flyway: migrations em `classpath:db/migration`.

## Versoes Nao Pinned no Repositorio

- `npm`: nao fixado por `.nvmrc`, `engines` ou lockfile encontrado.
- Docker Engine / Docker Compose plugin: documentados no README, mas sem versao minima fixada.
- Versao exata do PostgreSQL em producao no Supabase: nao declarada no repositorio.
