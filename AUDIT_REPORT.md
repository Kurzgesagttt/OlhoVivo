# AUDIT_REPORT - Olho de Bairro

## Fase 1 - Mapeamento do projeto

Data: 2026-06-05

### Escopo executado

- Mapeamento das rotas e paginas do frontend.
- Mapeamento dos controllers e endpoints do backend.
- Cruzamento inicial entre hooks/services do frontend e endpoints do backend.
- Nenhuma refatoracao estrutural foi executada nesta fase.

### Frontend - rotas, paginas e componentes

| Rota | Pagina | Componentes locais relevantes | Consumo de API |
| --- | --- | --- | --- |
| `/` | `Navigate` para `/login` | N/A | Nenhum |
| `/home` | `HomePage` | `OccurrencePostCard`, `Panel`, `StatBox` | `useOccurrences`, `useAuth`, `useCategories`, `useNeighborhoods` |
| `/login` | `LoginPage` | Formulario local | `authService.login` |
| `/cadastro` | `RegisterPage` | Formulario local | `authService.cadastrar` |
| `/ocorrencias/:id` | `OccurrenceDetailPage` | `PostCard`, `PhotoStrip`, `PhotoPlaceholder`, `TimelineCard`, `TimelineItem`, `CommentsCard`, `CommentItem`, `NearbyWidget`, `AuthorWidget`, `InfoRow` | `useOccurrence`, `useComments`, `useCreateComment`, `useOccurrences`, `useVote`, `useDeleteOccurrence`, `useAuth` |
| `/ocorrencias/nova` | `CreateOccurrencePage` | Formulario local | `useCreateOccurrence`, `useCategories`, `useNeighborhoods` |
| `/perfil` | `ProfilePage` | Card de perfil local | `useAuth` |
| `/admin/dashboard` | `DashboardPage` | Cards locais de estatisticas | `useOccurrences` |
| `/admin/moderacao` | `ModerationPage` | Lista local de moderacao | `useOccurrences`, `occurrenceService.atualizarStatus` |
| `/admin/usuarios` | `UsersPage` | Lista local de usuarios | `api.get('/admin/usuarios')` |
| `*` | `NotFoundPage` | Estado 404 local | Nenhum |

Observacoes:

- Nao existe pasta `frontend/src/components` com componentes compartilhados.
- Varios componentes reutilizaveis estao declarados localmente dentro das paginas, principalmente em `HomePage.tsx` e `OccurrenceDetailPage.tsx`.
- As paginas ainda usam layouts independentes. `HomePage` e `OccurrenceDetailPage` seguem o visual mais recente; login, cadastro, perfil, criacao de ocorrencia e admin ainda usam layout proprio antigo.

### Frontend - services e endpoints consumidos

| Service/Hook | Metodo frontend | Endpoint chamado | Backend correspondente | Status |
| --- | --- | --- | --- | --- |
| `authService.cadastrar` | `POST` | `/auth/cadastro` | `POST /api/v1/auth/cadastro` | OK |
| `authService.login` | `POST` | `/auth/login` | `POST /api/v1/auth/login` | OK |
| `authService.logout` | `POST` | `/auth/logout` | `POST /api/v1/auth/logout` | OK |
| `authService.perfil` | `GET` | `/me` | `GET /api/v1/me` | OK |
| `api` interceptor | `POST` | `/auth/refresh` | `POST /api/v1/auth/refresh` | OK |
| `categoryService.listar` | `GET` | `/categorias` | `GET /api/v1/categorias` | OK |
| `neighborhoodService.listar` | `GET` | `/bairros?cidade=Lins&estado=SP` | `GET /api/v1/bairros` | OK |
| `occurrenceService.listar` | `GET` | `/ocorrencias` | `GET /api/v1/ocorrencias` | OK |
| `occurrenceService.buscarPorId` | `GET` | `/ocorrencias/{id}` | `GET /api/v1/ocorrencias/{id}` | OK |
| `occurrenceService.criar` | `POST` | `/ocorrencias` | `POST /api/v1/ocorrencias` | OK |
| `occurrenceService.atualizarStatus` | `PATCH` | `/ocorrencias/{id}/status` | `PATCH /api/v1/ocorrencias/{id}/status` | OK |
| `occurrenceService.deletar` | `DELETE` | `/ocorrencias/{id}` | `DELETE /api/v1/ocorrencias/{id}` | OK |
| `commentService.listar` | `GET` | `/ocorrencias/{ocorrenciaId}/comentarios` | `GET /api/v1/ocorrencias/{ocorrenciaId}/comentarios` | OK |
| `commentService.criar` | `POST` | `/ocorrencias/{ocorrenciaId}/comentarios` | `POST /api/v1/ocorrencias/{ocorrenciaId}/comentarios` | OK |
| `commentService.deletar` | `DELETE` | `/ocorrencias/{ocorrenciaId}/comentarios/{comentarioId}` | `DELETE /api/v1/ocorrencias/{ocorrenciaId}/comentarios/{id}` | OK |
| `voteService.votar` | `POST` | `/ocorrencias/{ocorrenciaId}/votos` | `POST /api/v1/ocorrencias/{ocorrenciaId}/votos` | OK |
| `voteService.removerVoto` | `DELETE` | `/ocorrencias/{ocorrenciaId}/votos` | `DELETE /api/v1/ocorrencias/{ocorrenciaId}/votos` | OK |
| `notificationService.listar` | `GET` | `/notificacoes` | `GET /api/v1/notificacoes` | OK |
| `notificationService.marcarComoLida` | `PATCH` | `/notificacoes/{id}/lida` | `PATCH /api/v1/notificacoes/{id}/lida` | OK |
| `UsersPage` | `GET` | `/admin/usuarios` | Nao encontrado | BROKEN |

### Backend - controllers e endpoints

#### `AuthController` - `/api/v1/auth`

- `POST /api/v1/auth/cadastro` - cadastro de usuario.
- `POST /api/v1/auth/login` - login e emissao de access token.
- `POST /api/v1/auth/refresh` - renovacao por cookie `refresh_token`.
- `POST /api/v1/auth/logout` - logout e limpeza do cookie.

#### `BairroController` - `/api/v1/bairros`

- `GET /api/v1/bairros` - lista bairros por `cidade` e `estado`, com defaults `Lins` e `SP`.

#### `CategoriaController` - `/api/v1/categorias`

- `GET /api/v1/categorias` - lista categorias ativas.
- `POST /api/v1/categorias` - cria categoria. Restrito a `ADMIN`.

#### `ComentarioController` - `/api/v1/ocorrencias/{ocorrenciaId}/comentarios`

- `GET /api/v1/ocorrencias/{ocorrenciaId}/comentarios` - lista comentarios paginados.
- `POST /api/v1/ocorrencias/{ocorrenciaId}/comentarios` - cria comentario. Requer autenticacao.
- `DELETE /api/v1/ocorrencias/{ocorrenciaId}/comentarios/{id}` - deleta comentario. Requer autenticacao.

#### `NotificacaoController` - `/api/v1/notificacoes`

- `GET /api/v1/notificacoes` - lista notificacoes do usuario autenticado.
- `PATCH /api/v1/notificacoes/{id}/lida` - marca notificacao como lida.

#### `OcorrenciaController` - `/api/v1/ocorrencias`

- `GET /api/v1/ocorrencias` - lista ocorrencias paginadas.
- `GET /api/v1/ocorrencias/{id}` - busca ocorrencia por id.
- `POST /api/v1/ocorrencias` - cria ocorrencia. Restrito a `MORADOR` e `ADMIN`.
- `PATCH /api/v1/ocorrencias/{id}/status` - atualiza status. Restrito a `MODERADOR`, `ADMIN` e `PREFEITURA`.
- `DELETE /api/v1/ocorrencias/{id}` - deleta ocorrencia. Restrito a `ADMIN` e `PREFEITURA`.

#### `UsuarioController` - `/api/v1/me`

- `GET /api/v1/me` - retorna perfil autenticado.
- `GET /api/v1/me/data` - exporta dados do usuario autenticado.
- `DELETE /api/v1/me` - anonimiza conta autenticada.

#### `VotoController` - `/api/v1/ocorrencias/{ocorrenciaId}/votos`

- `POST /api/v1/ocorrencias/{ocorrenciaId}/votos` - registra voto.
- `DELETE /api/v1/ocorrencias/{ocorrenciaId}/votos` - remove voto.

### Mapa pagina -> endpoint

| Pagina | Endpoints diretos/indiretos |
| --- | --- |
| `HomePage` | `GET /api/v1/ocorrencias`, `GET /api/v1/me`, `POST /api/v1/auth/logout`, `GET /api/v1/categorias`, `GET /api/v1/bairros` |
| `LoginPage` | `POST /api/v1/auth/login` |
| `RegisterPage` | `POST /api/v1/auth/cadastro` |
| `OccurrenceDetailPage` | `GET /api/v1/ocorrencias/{id}`, `GET /api/v1/ocorrencias`, `GET /api/v1/me`, `GET /api/v1/ocorrencias/{id}/comentarios`, `POST /api/v1/ocorrencias/{id}/comentarios`, `POST /api/v1/ocorrencias/{id}/votos`, `DELETE /api/v1/ocorrencias/{id}/votos`, `DELETE /api/v1/ocorrencias/{id}` |
| `CreateOccurrencePage` | `POST /api/v1/ocorrencias`, `GET /api/v1/categorias`, `GET /api/v1/bairros` |
| `ProfilePage` | `GET /api/v1/me`, `POST /api/v1/auth/logout` |
| `DashboardPage` | `GET /api/v1/ocorrencias` |
| `ModerationPage` | `GET /api/v1/ocorrencias`, `PATCH /api/v1/ocorrencias/{id}/status` |
| `UsersPage` | `GET /api/v1/admin/usuarios` esperado pelo frontend como `/admin/usuarios`, mas nao existe controller backend correspondente |
| `NotFoundPage` | Nenhum |

### Itens BROKEN identificados na Fase 1

- `UsersPage` chama `GET /api/v1/admin/usuarios` via `api.get('/admin/usuarios')`, mas nao ha controller/backend endpoint correspondente no projeto atual.

### Pontos para investigar nas fases seguintes

- Links de cadastro: `HomePage` usa `to="/register"`, mas a rota definida no router e `/cadastro`.
- Botao de dark mode em `HomePage` exibe caracteres com encoding quebrado (`â˜¼`/`â˜¾`).
- Botoes/links visuais em `OccurrenceDetailPage` como `Compartilhar`, `Salvar`, `Apoiar` e `Responder` aparentam nao executar feature real.
- `notificationService` e hooks de notificacao existem, mas nenhuma pagina mapeada consome esses hooks diretamente.
- Layout e tokens visuais ainda estao duplicados entre paginas.

### Resumo final da Fase 1

- Paginas mapeadas: 10.
- Controllers mapeados: 8.
- Endpoints backend mapeados: 22.
- Endpoints frontend mapeados: 19.
- Itens BROKEN encontrados: 1.
- Arquivos alterados nesta fase: `AUDIT_REPORT.md`.

