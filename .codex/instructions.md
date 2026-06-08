# OlhoVivo Project Instructions

## Objetivo

Este projeto e dividido em dois apps principais:

- `frontend/`: aplicacao React + TypeScript + Vite para usuarios e painel admin.
- `backend/`: API Spring Boot + PostgreSQL para autenticacao, ocorrencias, comentarios, votos e moderacao.

Ao alterar o projeto, preserve a separacao frontend/backend e priorize mudancas pequenas, localizadas e coerentes com a estrutura existente.

## Convencoes Gerais

- Preserve nomes e termos de dominio em portugues quando o codigo atual ja usa esse vocabulario: `Ocorrencia`, `Bairro`, `Comentario`, `Usuario`.
- Prefira mudancas incrementais; nao reestruture pastas ou renomeie modulos sem necessidade real.
- Evite logica duplicada entre controllers, services, hooks e paginas.
- Toda integracao nova deve entrar primeiro pela camada certa:
  - frontend: `services` para HTTP, `hooks` para orquestracao de estado/queries, `pages` para composicao de tela.
  - backend: `controller` para borda HTTP, `service` para regra de negocio, `repository` para acesso a dados.
- Nao acople frontend a detalhes internos do banco ou da implementacao JPA; o contrato deve ser DTO/API.
- Qualquer mudanca de schema deve ser feita com migration Flyway em `backend/src/main/resources/db/migration`.
- Nao commitar segredos. Arquivos `.env.local` e `.env.production` sao locais.

## Modularidade

- Mantenha cada arquivo com responsabilidade clara.
- Se uma tela crescer demais, extraia componentes ou hooks focados em uma unica responsabilidade.
- Se um service backend concentrar regras demais, extraia metodos privados antes de considerar novos services.
- Evite helpers genericos sem contexto. Prefira modulos ligados ao dominio real do projeto.
- Reutilize tipos compartilhados do frontend em `src/types` em vez de repetir interfaces em paginas.

## Padroes do Frontend

### Estrutura

- `src/pages`: entradas de rota e composicao de tela.
- `src/pages/admin`: telas exclusivas do fluxo administrativo.
- `src/components`: componentes reutilizaveis e wrappers de rota.
- `src/hooks`: hooks de dominio e integracao com React Query.
- `src/services`: cliente Axios e chamadas HTTP por recurso.
- `src/types`: contratos TS da API e modelos consumidos pela UI.

### Regras

- Toda chamada HTTP deve sair de `src/services`.
- Hooks devem encapsular fetch, mutation, loading/error state e invalidacao de cache.
- Paginas devem orquestrar layout e interacoes, nao concentrar regras de transporte HTTP.
- Use `react-router-dom` para rotas e preserve a convencao atual de paginas em PascalCase.
- Preserve o prefixo de API via `VITE_API_BASE_URL` com fallback para `/api/v1`.
- Continue usando TypeScript estrito; nao introduza `any` sem justificativa forte.
- Reaproveite os tokens visuais ja existentes em `tailwind.config.js` e `src/tokens.css`.
- Ao adicionar UI, siga a linguagem visual atual em vez de criar um segundo sistema de design paralelo.

## Padroes do Backend

### Estrutura

- `controller`: endpoints REST sob `/api/v1/...`.
- `dto/request` e `dto/response`: contratos de entrada e saida.
- `service`: regra de negocio e coordenacao transacional.
- `repository`: interfaces Spring Data.
- `model`: entidades JPA e enums.
- `config` e `security`: configuracao transversal.
- `exception`: tratamento global de erros.

### Regras

- Controllers devem ser finos: validar entrada, delegar ao service e devolver `ResponseEntity`.
- Regras de negocio, autorizacao de dominio e validacoes compostas devem ficar em `service`.
- Nao exponha entidades JPA diretamente pela API; use DTOs.
- Ao criar endpoint novo, mantenha o prefixo REST atual e niveis de acesso coerentes com `@PreAuthorize`.
- Persistencia nova exige:
  - entidade/modelo se necessario;
  - repository dedicado;
  - migration Flyway;
  - DTOs de request/response quando houver superficie HTTP.
- Nao troque `ddl-auto: validate` por geracao automatica de schema.

## Banco e Migrations

- Nomeie migrations com o padrao `V{numero}__descricao.sql`.
- Migrations devem ser idempotentes na medida do possivel e focadas em uma mudanca de schema por arquivo.
- Seeds obrigatorios devem ficar explicitos em migration, como ja ocorre com categorias e bairros.
- Se mudar contrato de dados, revise impactos no frontend e nos DTOs.

## API e Contratos

- Mantenha consistencia de nomenclatura entre rotas, DTOs e services.
- Sempre que alterar resposta da API, valide impacto em `frontend/src/types` e nos services correspondentes.
- Preserve mensagens e codigos HTTP coerentes com o comportamento atual:
  - `200` para leitura/atualizacao bem-sucedida,
  - `201` para criacao,
  - `204` para exclusao sem corpo.

## Deploy e Ambiente

- Desenvolvimento local usa `docker/docker-compose.yml`.
- Build/deploy empacotado usa `docker/docker-compose.prod.yml`.
- Frontend containerizado serve build estatico via Nginx na porta `80`.
- Backend sobe como jar Spring Boot na porta `8080`.
- Em producao, o banco esperado e PostgreSQL externo/Supabase via variaveis de ambiente.

## Checklist de Mudancas

- Mudou backend:
  - revisar DTOs, seguranca, migrations e impacto no frontend.
- Mudou frontend:
  - revisar service, hook, tipos e build `npm run build`.
- Mudou deploy:
  - revisar `.env.*example`, Dockerfiles e compose correspondente.
