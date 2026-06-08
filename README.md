# Olho do Bairro

Sistema web para registro, acompanhamento e discussao de ocorrencias urbanas em bairros. A aplicacao segue uma experiencia inspirada em feeds comunitarios: moradores publicam ocorrencias, votam, comentam, salvam posts e supervisores acompanham o status pelo painel administrativo.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS e TanStack Query.
- Backend: Java 21, Spring Boot, Spring Security, JWT, JPA/Hibernate e Flyway.
- Banco de dados: PostgreSQL, usado localmente via Docker ou em producao pelo Supabase.
- Deploy local: Docker Compose com frontend em Nginx e backend em Spring Boot.

## Funcionalidades

- Cadastro e login de moradores.
- Login como morador ou supervisor pela tela de autenticacao.
- Criacao de ocorrencias com categoria, bairro, endereco e imagens.
- Feed principal com filtros por bairro, categoria, ordenacao e ocorrencias encerradas.
- Sistema de votos no modelo Reddit: upvote, downvote, troca de voto e remocao ao clicar novamente.
- Contador de comentarios no card da ocorrencia.
- Comentarios, respostas e curtidas em comentarios.
- Salvamento de ocorrencias e listagem no perfil.
- Perfil do usuario com foto e descricao editaveis.
- Painel de supervisao para alterar status de ocorrencias.

## Estrutura

```text
OlhoVivo/
  backend/   API Spring Boot, entidades, controllers, services e migrations
  frontend/  Aplicacao React, paginas, hooks, componentes e services HTTP
  docker/    Dockerfiles, Nginx e docker-compose de producao local
  docs/      Documentacao auxiliar do projeto
```

## Variaveis de ambiente

Crie o arquivo de producao a partir do exemplo:

```powershell
cp .env.production.example .env.production
```

Principais variaveis:

- `DB_URL`: URL JDBC/PostgreSQL do banco.
- `DB_USERNAME`: usuario do banco.
- `DB_PASSWORD`: senha do banco.
- `JWT_SECRET`: chave secreta usada pelo backend para assinar tokens JWT.
- `CORS_ALLOWED_ORIGINS`: origem permitida do frontend.

Para Supabase em rede IPv4, use a connection string do Session Pooler e substitua a senha real no `.env.production`.

## Rodando com Docker

Na raiz do projeto:

```powershell
docker compose -f docker/docker-compose.prod.yml up -d --build
```

URLs principais:

- Frontend: http://127.0.0.1
- Backend: http://127.0.0.1:8080
- API de ocorrencias: http://127.0.0.1:8080/api/v1/ocorrencias

Para recriar os containers apos alteracoes:

```powershell
docker compose -f docker/docker-compose.prod.yml up -d --force-recreate --build
```

## Desenvolvimento local

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Rotas importantes

- `/home`: feed principal.
- `/login`: autenticacao de morador ou supervisor.
- `/cadastro`: cadastro de usuario.
- `/ocorrencias/nova`: criacao de ocorrencia, exige login.
- `/ocorrencias/:id`: detalhes, comentarios e votos.
- `/perfil`: perfil do usuario logado.
- `/admin`: painel de supervisao.

## Build e validacao

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd backend
mvn test
```

Docker:

```powershell
docker compose -f docker/docker-compose.prod.yml build backend frontend
```

## Observacoes

- As migrations do Flyway criam as tabelas automaticamente no banco configurado.
- Usuarios precisam estar logados para criar ocorrencias, votar, salvar, comentar e curtir comentarios.
- Supervisores podem acessar o painel administrativo pelo login normal escolhendo o modo de supervisor.
