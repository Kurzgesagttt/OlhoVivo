# Olho do Bairro — Regras Gerais do Projeto
> Este arquivo define as regras, convenções e restrições que toda IA assistente deve seguir ao trabalhar neste projeto. Leia este arquivo antes de gerar qualquer código, arquitetura ou decisão técnica.

---

## 1. Contexto Geral

- Este é um projeto extensionista acadêmico de uma faculdade de Engenharia de Software, disciplina de Arquitetura e Sistemas Distribuídos
- O produto final é uma plataforma web real, destinada a moradores de uma cidade
- O projeto **precisa funcionar de verdade** — não é apenas um exercício teórico
- A comunidade-alvo inclui usuários de todas as idades e diferentes níveis de familiaridade digital, portanto **simplicidade e acessibilidade são prioridades absolutas**

---

## 2. Stack — Nunca Substitua Sem Autorização Explícita

| Camada | Tecnologia obrigatória |
|---|---|
| Backend | Java 21 + Spring Boot 3.x |
| Frontend | React 18+ com TypeScript |
| Banco de dados | PostgreSQL 15+ |
| Migrations | Flyway (nunca Liquibase, nunca scripts manuais) |
| ORM | Hibernate via Spring Data JPA |
| Autenticação | JWT (HS512) — sem sessions, sem OAuth externo por padrão |
| CSS | Tailwind CSS |
| Build frontend | Vite |
| Containers | Docker + Docker Compose |
| Rate limiting | Bucket4j |
| Circuit breaker | Resilience4j |

**Nunca sugira:** Kotlin, Node.js no backend, MySQL, MongoDB, Prisma, NextJS, ou qualquer outra tecnologia que não esteja na stack definida — a menos que o usuário pergunte explicitamente sobre alternativas.

---

## 3. Estrutura de Pastas — Respeite Sempre

```
olho-do-bairro/
├── backend/
│   └── src/main/java/br/com/olhodobairro/
│       ├── config/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── model/
│       ├── dto/
│       └── security/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       └── types/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
├── .env.local
└── .env.production
```

- Nunca crie pastas fora desta estrutura sem justificativa explícita
- Toda nova entidade segue o padrão: `model/` → `repository/` → `service/` → `controller/` → `dto/`
- Nomes de pacotes sempre em português quando fizerem sentido de domínio (ex: `Ocorrencia`, `Voto`)

---

## 4. Banco de Dados — Regras Invioláveis

- **Toda tabela usa UUID como chave primária** — nunca `SERIAL` ou `BIGINT AUTO_INCREMENT`
- **CPF nunca é armazenado em claro** — apenas como `SHA-256` hash
- **E-mail nunca é armazenado em claro** — apenas como `SHA-256` hash (o e-mail real fica apenas no serviço de envio)
- **Senhas sempre em BCrypt** com custo mínimo 12 — nunca MD5, SHA-1 ou em claro
- **Toda migration tem nome no formato** `V{numero}__{descricao_snake_case}.sql` — ex: `V3__create_votes_table.sql`
- **Migrations são imutáveis** — nunca edite uma migration já criada; sempre crie uma nova
- **Soft delete obrigatório** para comentários (`deleted_at`); ocorrências podem ter hard delete apenas por admin
- **Índices obrigatórios** em: `category`, `status`, `created_at`, `votes_count`, todo campo usado em `WHERE` ou `ORDER BY`
- **Nunca use `SELECT *`** — sempre liste as colunas explicitamente
- Toda coluna de texto longo deve ter limite explícito (ex: `VARCHAR(500)` para descrição, `VARCHAR(100)` para título)

---

## 5. Backend Java — Convenções de Código

### Geral
- Pacote raiz: `br.com.olhodobairro`
- Toda classe usa anotações do Spring adequadas (`@RestController`, `@Service`, `@Repository`)
- Nunca lógica de negócio no `Controller` — apenas receber request, chamar service, retornar response
- Nunca acesso ao banco no `Controller` — sempre via `Service` → `Repository`
- Use `record` do Java para DTOs sempre que possível (imutáveis por padrão)

### Segurança
- Todo endpoint que modifica dados **exige** JWT válido
- Toda operação que altera um recurso verifica `owner` antes: o `user_id` do JWT deve corresponder ao dono do recurso
- Nunca exponha stack traces em respostas de API — use `@ControllerAdvice` com `GlobalExceptionHandler`
- Nunca logue dados pessoais (nome, CPF, e-mail, senha, IP em claro) — use hashes nos logs
- Toda resposta de erro segue o padrão:
```json
{
  "timestamp": "2026-05-24T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Descrição amigável do erro",
  "path": "/api/v1/occurrences"
}
```

### DTOs
- Sempre use DTOs para request e response — nunca exponha entidades JPA diretamente
- Validação com Bean Validation (`@NotBlank`, `@Size`, `@Email`) nos DTOs de request
- Nomes claros: `CreateOccurrenceRequest`, `OccurrenceResponse`, `UpdateStatusRequest`

### JWT
- Access token: 15 minutos
- Refresh token: 7 dias, em `HttpOnly` cookie, com rotação a cada uso
- Claims: apenas `sub` (UUID do usuário), `role`, `iat`, `exp`
- Nunca coloque dados pessoais no JWT

---

## 6. Frontend React — Convenções

### Geral
- TypeScript obrigatório em todos os arquivos — nunca `.jsx`, sempre `.tsx`
- Nunca use `any` no TypeScript — defina as interfaces em `src/types/`
- Componentes funcionais com hooks — nunca class components
- Um arquivo por componente; nomes em PascalCase (`OccurrenceCard.tsx`)

### Estado e API
- **React Query** para todo estado vindo do servidor (fetch, cache, mutations)
- **Axios** para chamadas HTTP, configurado em `src/services/api.ts` com interceptors
- Interceptor de Axios renova o access token automaticamente se receber 401
- Nunca use `useState` + `useEffect` para buscar dados da API — use `useQuery`

### Formulários e UX
- Feedback visual imediato em toda ação (loading spinner, toast de sucesso/erro)
- Nunca desabilite o botão de submit sem mostrar um indicador de carregamento
- Mensagens de erro em português, claras e acionáveis (ex: "CPF inválido. Verifique os números e tente novamente.")
- Todo input tem `aria-label` ou `<label>` associado
- Foco gerenciado corretamente em modais e formulários

### Acessibilidade (obrigatório)
- Contraste mínimo 4.5:1 para texto normal (WCAG 2.1 AA)
- Áreas de toque mínimas de 44×44px em mobile
- Navegação por teclado funcional em todos os fluxos principais
- Fonte mínima de 16px no corpo do texto

---

## 7. Segurança — Regras Invioláveis

- **Rate limiting em todo endpoint** — use os limites definidos no PRD; nunca deixe endpoint sem limite
- **CORS restrito** — nunca use `allowedOrigins("*")` em produção
- **Sem SQL manual** — 100% via JPA/Hibernate ou JPQL parametrizado; nunca concatene strings em queries
- **Sanitização de HTML** — todo campo de texto do usuário passa pelo OWASP Java HTML Sanitizer antes de ser salvo
- **Validação de upload** — valide o MIME type real via magic bytes, não apenas a extensão do arquivo
- **Headers de segurança obrigatórios**: HSTS, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy
- **Audit log** — toda ação sensível (login, cadastro, mudança de status, moderação, exclusão de conta) gera registro na tabela `audit_log`
- **Nunca exponha IDs sequenciais** — use UUID em todos os recursos públicos

---

## 8. LGPD — Obrigações Não Negociáveis

- **CPF e e-mail nunca armazenados em claro** em nenhuma tabela do banco
- **Consentimento registrado** — toda criação de conta gera registro na tabela `consent_log` com versão da política e timestamp
- **Endpoints de LGPD implementados no MVP**:
  - `GET /api/v1/me/data` — exportação de todos os dados do usuário em JSON
  - `DELETE /api/v1/me` — anonimização dos dados pessoais (nome → "Usuário Removido", e-mail e CPF → nullificados; ocorrências permanecem sem vínculo)
- **Dados pessoais nunca aparecem em logs** — use hashes ou omita
- **Política de privacidade** deve ser exibida e aceita com checkbox explícito no cadastro

---

## 9. Docker e Ambiente — Regras

- **Dois modos de operação obrigatórios:**
  - `docker compose up` com `.env.local` → banco PostgreSQL sobe no próprio Docker
  - `docker compose -f docker-compose.prod.yml up` com `.env.production` → backend e frontend sobem, banco aponta para Supabase ou AWS RDS
- **Nunca hardcode de credenciais** no código-fonte ou nos Dockerfiles — tudo via variáveis de ambiente
- **Migrations executam automaticamente** no startup do backend via Flyway — nunca requerem passo manual
- O arquivo `.env.local` e `.env.production` têm templates com chaves e valores de exemplo comentados no `.env.example`
- **`.env.local` e `.env.production` nunca são commitados no git** — apenas `.env.example`

---

## 10. Git e Versionamento

- Branch principal: `main`
- Branches de feature: `feature/nome-da-feature` (ex: `feature/sistema-de-upvote`)
- Branches de fix: `fix/nome-do-bug`
- Commits em português, imperativos e descritivos:
  - ✅ `Adiciona endpoint de upvote com rate limiting`
  - ✅ `Corrige validação de CPF no cadastro`
  - ❌ `fix bug` ❌ `changes` ❌ `wip`
- Nunca commite na `main` diretamente — sempre via Pull Request
- Nunca commite arquivos `.env` com valores reais

---

## 11. O Que a IA Nunca Deve Fazer

- **Nunca use tecnologias fora da stack definida** sem o usuário pedir explicitamente
- **Nunca armazene CPF, senha ou e-mail em claro** em qualquer tabela ou log
- **Nunca crie endpoints sem autenticação** que deveriam ser protegidos
- **Nunca exponha entidades JPA diretamente** nas respostas da API
- **Nunca ignore rate limiting** ao criar um novo endpoint
- **Nunca crie migrations editando uma já existente** — sempre crie uma nova
- **Nunca use `SELECT *`** em queries
- **Nunca sugira desabilitar CORS, CSRF protection ou validação de entrada** como "solução" para um problema
- **Nunca logue dados pessoais** (nome completo, CPF, e-mail, senha, IP em claro)
- **Nunca coloque dados pessoais dentro do JWT**
- **Nunca use `@Transactional` no Controller** — apenas no Service
- **Nunca deixe um TODO no código de segurança** — implemente ou documente como bloqueante

---

## 12. Checklist Antes de Entregar Qualquer Código

Antes de apresentar qualquer solução de código, verifique:

- [ ] Usa a stack correta (Java 21, Spring Boot 3, React + TS, PostgreSQL, Flyway)?
- [ ] Novos endpoints têm autenticação e rate limiting?
- [ ] Dados sensíveis não aparecem em claro em nenhum lugar?
- [ ] DTOs separados das entidades JPA?
- [ ] Validação de entrada nos DTOs de request?
- [ ] GlobalExceptionHandler trata o novo tipo de erro?
- [ ] Migration nova criada com nome correto (V{n}__...)?
- [ ] Tabela nova usa UUID como PK?
- [ ] Ação sensível gera registro no audit_log?
- [ ] Frontend usa React Query para dados da API?
- [ ] Componentes TypeScript sem `any`?
- [ ] Variáveis sensíveis lidas do ambiente, não hardcoded?

---

*Este arquivo é a lei do projeto. Em caso de dúvida, consulte-o antes de qualquer decisão técnica.*
