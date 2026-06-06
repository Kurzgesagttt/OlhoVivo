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

## Fase 2 - Padronizacao de UI

Data: 2026-06-05

### Escopo executado

- Criacao de tokens globais de UI em `frontend/src/tokens.css`.
- Aplicacao de fonte, background e cor de texto base em `frontend/src/index.css`.
- Criacao de componentes compartilhados em `frontend/src/components/ui.tsx`.
- Padronizacao das paginas do frontend para usar uma raiz compartilhada (`PageShell`) e componentes comuns de superficie, botoes e formulario.
- Validacao do build Docker do frontend.

### Tokens criados

Arquivo: `frontend/src/tokens.css`

- `--font-sans`
- `--color-page`
- `--color-surface`
- `--color-surface-muted`
- `--color-border`
- `--color-text`
- `--color-text-muted`
- `--color-text-soft`
- `--color-primary`
- `--color-primary-strong`
- `--radius-card`
- `--container-page`

Os tokens possuem valores para modo claro e modo escuro via classe `.dark`.

### Componentes compartilhados criados

Arquivo: `frontend/src/components/ui.tsx`

| Componente | Objetivo | Variantes/observacoes |
| --- | --- | --- |
| `Button` | Acao clicavel compartilhada | Variantes `primary`, `secondary`, `ghost`, `danger`; props documentadas por comentario |
| `Card` | Superficie padronizada | Prop `padded` documentada por comentario |
| `PageShell` | Raiz visual comum | Background e texto base do app |
| `PageContainer` | Container de pagina | `max-w-6xl`, padding horizontal e vertical padronizados |
| `AppHeader` | Header compartilhado | Logo, titulo/subtitulo, voltar e actions |
| `AuthShell` | Layout comum para login/cadastro | Centralizacao e card de autenticacao |
| `Field` | Bloco padronizado de formulario | Label, hint e erro |
| `TextInput` | Input padronizado | Usa `inputClassName` |
| `TextArea` | Textarea padronizado | Usa `inputClassName` |
| `SelectInput` | Select padronizado | Usa `inputClassName` |
| `Notice` | Mensagens informativas/de erro | Tons `neutral` e `danger` |

### Paginas padronizadas

| Pagina | Padronizacao aplicada |
| --- | --- |
| `LoginPage` | Migrada para `AuthShell`, `Field`, `TextInput`, `Button`, `Notice` |
| `RegisterPage` | Migrada para `AuthShell`, `Field`, `TextInput`, `Button`, `Notice` |
| `CreateOccurrencePage` | Migrada para `PageShell`, `AppHeader`, `PageContainer`, `Card`, `Field`, inputs compartilhados e `Button` |
| `ProfilePage` | Migrada para `PageShell`, `AppHeader`, `PageContainer`, `Card`, `Button` |
| `NotFoundPage` | Migrada para `PageShell` e `Card` |
| `DashboardPage` | Migrada para `PageShell`, `AppHeader`, `PageContainer`, `Card` |
| `ModerationPage` | Migrada para `PageShell`, `AppHeader`, `PageContainer`, `Card`, `Button` |
| `UsersPage` | Migrada para `PageShell`, `AppHeader`, `PageContainer`, `Card`, `Button`, `Notice` |
| `HomePage` | Passou a usar `PageShell`; link de cadastro ajustado para rota existente `/cadastro` |
| `OccurrenceDetailPage` | Passou a usar `PageShell` |

### Duplicacoes reduzidas

- Cards locais de paginas antigas foram substituidos por `Card`.
- Botoes principais/secundarios/de perigo foram substituidos por `Button` nas paginas migradas.
- Inputs/selects/textareas de formularios foram substituidos por `TextInput`, `SelectInput` e `TextArea`.
- Headers antigos foram substituidos por `AppHeader` nas paginas de criacao, perfil e admin.
- Layouts de autenticacao foram unificados em `AuthShell`.

### Auditoria de cores

- Busca por cores hardcoded em `frontend/src`: nenhum `#hex`, `rgb()` ou `rgba()` hardcoded em paginas/componentes.
- `rgb(var(...))` permanece apenas em `index.css` para aplicar tokens CSS globais.
- Ainda existem classes Tailwind semanticas/paleta (`zinc`, `emerald`, `red`, etc.) para variantes visuais.

### Validacao da Fase 2

- Comando executado: `docker compose -f docker/docker-compose.prod.yml build frontend`
- Resultado: build do frontend concluido com sucesso.

### Itens que permanecem para fases seguintes

- `UsersPage` continua consumindo endpoint `GET /api/v1/admin/usuarios` inexistente, ja marcado como BROKEN na Fase 1.
- Alguns elementos clicaveis da tela de detalhe (`Compartilhar`, `Salvar`, `Apoiar`, `Responder`) ainda precisam da auditoria de interacoes da Fase 3.
- `notificationService` e hooks de notificacao continuam sem consumidor de pagina identificado; avaliar na Fase 4.

### Resumo final da Fase 2

- Componentes compartilhados criados/unificados: 11.
- Paginas migradas para raiz/layout compartilhado: 10.
- Tokens CSS criados: 12.
- Botoes corrigidos/removidos nesta fase: 0; auditoria detalhada fica para Fase 3.
- Arquivos/funcoes removidos como codigo morto nesta fase: 0; remocao fica para Fase 4.
- Itens BROKEN novos encontrados nesta fase: 0.

## Fase 3 - Auditoria de botoes e interacoes

Data: 2026-06-05

### Escopo executado

- Varredura de botoes, links, formularios, handlers e chamadas de API no frontend.
- Comparacao das chamadas de services com endpoints existentes no backend.
- Correcao de links obvios que redirecionavam para fluxo incorreto.
- Marcacao de endpoint inexistente com `// BROKEN`.
- Desabilitacao visual de features ainda nao implementadas.
- Validacao do build Docker do frontend.

### Correcoes aplicadas

| Arquivo | Elemento | Problema | Acao |
| --- | --- | --- | --- |
| `frontend/src/pages/HomePage.tsx` | Logo do header | Link apontava para `/`, que redireciona para `/login` mesmo com usuario logado | Alterado para `/home` |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Logo do header | Link apontava para `/`, causando retorno para login | Alterado para `/home` |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Breadcrumb `Feed` | Link apontava para `/`, causando retorno para login | Alterado para `/home` |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Redirect apos deletar ocorrencia | `navigate('/')` podia cair no login | Alterado para `navigate('/home')` |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Botao `Compartilhar` | Feature ainda nao implementada | Desabilitado com tooltip explicativo |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Botao `Salvar` | Feature ainda nao implementada | Desabilitado com tooltip explicativo |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Botao `Apoiar` em comentario | Feature ainda nao implementada | Desabilitado com tooltip explicativo |
| `frontend/src/pages/OccurrenceDetailPage.tsx` | Botao `Responder` em comentario | Feature ainda nao implementada | Desabilitado com tooltip explicativo |
| `frontend/src/pages/admin/UsersPage.tsx` | Chamada `api.get('/admin/usuarios')` | Endpoint backend inexistente | Marcado com `// BROKEN` |
| `frontend/src/pages/admin/DashboardPage.tsx` | Atalho `Usuarios` | Levava para tela com endpoint inexistente | Desabilitado visualmente com tooltip |

### Endpoints verificados

Todos os endpoints chamados por services existentes continuam correspondendo ao backend, exceto o item ja identificado:

- `GET /api/v1/admin/usuarios` continua inexistente no backend e permanece listado como BROKEN.

### Features desabilitadas por ainda nao existirem

- Compartilhar ocorrencia.
- Salvar ocorrencia.
- Apoiar comentario.
- Responder comentario.
- Atalho para administracao de usuarios.

### Validacao da Fase 3

- Comando executado: `docker compose -f docker/docker-compose.prod.yml build frontend`
- Resultado: build do frontend concluido com sucesso.

### Resumo final da Fase 3

- Links corrigidos: 4.
- Botoes/features desabilitados: 5.
- Chamadas BROKEN marcadas em codigo: 1.
- Endpoints inexistentes novos encontrados: 0.
- Itens BROKEN pendentes: `GET /api/v1/admin/usuarios`.

## Fase 4 - Remocao de codigo morto

Data: 2026-06-05

### Escopo executado

- Busca global por hooks, services, tipos e metodos declarados sem consumidores.
- Remocao apenas de codigo com ausencia de uso confirmada por busca global.
- Preservacao de endpoints backend que nao sao chamados pelo frontend, mas fazem parte de superficie publica/PRD ou podem ser usados por clientes externos.
- Inclusao da regra solicitada: usuario precisa estar logado para registrar ocorrencia.

### Codigo morto removido

| Item | Tipo | Confirmacao de ausencia de uso | Acao |
| --- | --- | --- | --- |
| `frontend/src/hooks/useNotifications.ts` | Arquivo/hook frontend | `rg useNotifications/useMarkAsRead` retornou apenas o proprio arquivo | Removido |
| `frontend/src/services/notification.service.ts` | Arquivo/service frontend | `rg notificationService` retornou apenas hook nao utilizado | Removido |
| `frontend/src/types/notification.ts` | Arquivo/tipo frontend | `rg Notificacao/types/notification` retornou apenas service removido | Removido |
| `commentService.deletar` | Metodo frontend | `rg commentService.deletar` e busca por delecao de comentario nao encontrou chamada em paginas/hooks | Removido do service |

### Codigo analisado e mantido

| Item | Motivo para manter |
| --- | --- |
| `NotificacaoController` e `NotificacaoService` no backend | Endpoint backend ativo e protegido; apesar de o frontend nao consumir mais nesta fase, pode ser usado por integracoes futuras. Remocao alteraria superficie da API. |
| `GET /api/v1/me/data` e `DELETE /api/v1/me` | Fazem parte das regras/PRD de privacidade/LGPD. Mantidos mesmo sem consumo direto no frontend atual. |
| `POST /api/v1/categorias` | Endpoint administrativo ativo. Mantido por ser superficie backend e nao codigo morto comprovado. |
| `PATCH /api/v1/ocorrencias/{id}/status` | Consumido por `ModerationPage`; mantido. |

### Login obrigatorio para registrar ocorrencia

Arquivos alterados:

- `frontend/src/pages/CreateOccurrencePage.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/OccurrenceDetailPage.tsx`

Comportamento aplicado:

- `CreateOccurrencePage` agora consulta `useAuth`.
- Enquanto a sessao e verificada, a tela mostra estado de carregamento.
- Se nao houver usuario autenticado, o formulario de criacao nao e exibido e a pagina mostra um aviso com botao para `/login`.
- Links de criar/nova ocorrencia em `HomePage` e `OccurrenceDetailPage` agora apontam para `/login` quando nao ha usuario autenticado.
- O backend ja exigia autenticacao/perfil autorizado em `POST /api/v1/ocorrencias`; esta fase alinhou o frontend com essa regra.

### Validacao da Fase 4

- Comando executado: `docker compose -f docker/docker-compose.prod.yml build frontend`
- Resultado: build do frontend concluido com sucesso.

### Resumo final da Fase 4

- Arquivos de codigo morto removidos: 3.
- Funcoes/metodos removidos: 1.
- Endpoints backend removidos: 0.
- Itens mantidos por cautela/PRD: 4.
- Regra de login para criar ocorrencia: implementada no frontend e ja existente no backend.

## Fase 5 - Validacao final

Data: 2026-06-05

### Escopo executado

- Build completo dos containers de producao.
- Inicializacao dos containers locais de frontend e backend.
- Validacao de rotas principais do frontend.
- Validacao de endpoints publicos do backend.
- Confirmacao de que nao ficaram imports quebrados detectaveis no build.

### Comandos executados

- `docker compose -f docker/docker-compose.prod.yml build`
- `docker compose -f docker/docker-compose.prod.yml up -d`
- `docker compose -f docker/docker-compose.prod.yml ps`

### Status dos containers

| Servico | Porta | Resultado |
| --- | --- | --- |
| `backend` | `8080` | Container iniciado com sucesso |
| `frontend` | `80` | Container iniciado com sucesso |

### Rotas frontend validadas

| Rota | Status HTTP | Resultado |
| --- | --- | --- |
| `/` | 200 | OK |
| `/login` | 200 | OK |
| `/home` | 200 | OK |
| `/cadastro` | 200 | OK |
| `/ocorrencias/nova` | 200 | OK |
| `/admin/dashboard` | 200 | OK |

### Endpoints backend validados

| Endpoint | Status HTTP | Resultado |
| --- | --- | --- |
| `GET /api/v1/categorias` | 200 | OK |
| `GET /api/v1/bairros?cidade=Lins&estado=SP` | 200 | OK |
| `GET /api/v1/ocorrencias?page=0&size=1` | 200 | OK |
| `GET /api/v1/me` | 403 | OK para requisicao sem token |

### Resumo final consolidado

- Componentes compartilhados criados/unificados: 11.
- Paginas migradas para layout compartilhado: 10.
- Links corrigidos: 4.
- Botoes/features corrigidos ou desabilitados: 5.
- Links de criacao de ocorrencia protegidos por estado de autenticacao: 4.
- Arquivos de codigo morto deletados: 3.
- Funcoes/metodos de codigo morto deletados: 1.
- Imports quebrados detectados no build: 0.
- Rotas principais com erro de carregamento: 0.

### Itens BROKEN pendentes

- `GET /api/v1/admin/usuarios`: chamado por `frontend/src/pages/admin/UsersPage.tsx`, mas ainda sem endpoint correspondente no backend.
