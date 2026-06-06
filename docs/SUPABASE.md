# Configuracao do Supabase

Este projeto usa PostgreSQL. Em producao, o banco pode ser um projeto Supabase sem alterar o codigo Java, porque o backend le as credenciais por variaveis de ambiente.

## Como configurar

1. Crie um projeto no Supabase.
2. No painel do Supabase, clique em `Connect`.
3. Copie a connection string `Session pooler`.
   - Evite a `Direct connection` em Docker/local se aparecer erro de IPv6 ou `Network unreachable`.
   - A URL direta `db.PROJECT_REF.supabase.co:5432` costuma exigir IPv6 no plano gratuito.
   - O `Session pooler` usa host parecido com `aws-0-REGIAO.pooler.supabase.com` e funciona em redes IPv4.
4. Crie o arquivo `.env.production` a partir do exemplo:

```powershell
cp .env.production.example .env.production
```

5. Preencha:

```env
DB_URL=jdbc:postgresql://aws-0-REGIAO.pooler.supabase.com:5432/postgres?sslmode=require
DB_USER=postgres.PROJECT_REF
DB_PASSWORD=SENHA_DO_BANCO_SUPABASE
JWT_SECRET=SEGREDO_HEX_COM_128_CARACTERES
VITE_API_BASE_URL=/api/v1
```

6. Suba o backend e frontend apontando para o Supabase:

```powershell
docker compose -f docker/docker-compose.prod.yml up --build
```

O Flyway executa automaticamente as migrations no banco Supabase durante o startup do backend.

## Regras importantes

- Nunca commite `.env.production`.
- Nunca coloque credenciais do Supabase em Dockerfile, Java ou TypeScript.
- Antes de conectar em um banco Supabase compartilhado, confirme que nao existem migrations antigas aplicadas manualmente.
- As migrations Flyway sao imutaveis: para qualquer mudanca futura, crie uma nova migration `V{numero}__{descricao}.sql`.
