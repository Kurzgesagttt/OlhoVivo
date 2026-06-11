<div align="center">

# 👁️ Olho do Bairro

**Plataforma comunitária para registro, acompanhamento e discussão de ocorrências urbanas.**  
Moradores publicam, votam, comentam e acompanham — supervisores gerenciam. Tudo em um feed vivo do seu bairro.

<br/>

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-1D9E75?style=flat-square)
![Java](https://img.shields.io/badge/Java%2021-Spring%20Boot-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-React-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack](#-stack)
- [Estrutura](#-estrutura)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rodando com Docker](#-rodando-com-docker)
- [Deploy na AWS (EC2)](#-deploy-na-aws-ec2)
- [Desenvolvimento Local](#-desenvolvimento-local)
- [Rotas Importantes](#-rotas-importantes)
- [Build e Validação](#-build-e-validação)
- [Observações](#-observações)
- [Equipe](#-equipe)

---

## 📌 Sobre o Projeto

O **Olho do Bairro** é um projeto extensionista desenvolvido na disciplina de **Sistemas Distribuídos** da **Faculdade Unilins**.

A aplicação conecta moradores e supervisores em torno de um feed comunitário: moradores registram ocorrências urbanas (buracos, iluminação, situações de risco, etc.), interagem por meio de votos e comentários, e supervisores acompanham e atualizam o status das ocorrências pelo painel administrativo — tudo inspirado na experiência de feeds sociais como o Reddit.

> 💡 O objetivo é fortalecer a participação cidadã e tornar os problemas do bairro mais visíveis para quem pode resolvê-los.

---

## ✨ Funcionalidades

**Para moradores**
- Cadastro e login de moradores
- Criação de ocorrências com categoria, bairro, endereço e imagens
- Feed principal com filtros por bairro, categoria, ordenação e ocorrências encerradas
- Sistema de votos estilo Reddit: upvote, downvote, troca de voto e remoção ao clicar novamente
- Comentários, respostas e curtidas em comentários
- Contador de comentários no card da ocorrência
- Salvamento de ocorrências e listagem no perfil
- Perfil com foto e descrição editáveis

**Para supervisores**
- Login no modo supervisor pela tela de autenticação
- Painel de supervisão para consultar e alterar o status de ocorrências

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS · TanStack Query |
| **Backend** | Java 21 · Spring Boot · Spring Security · JWT · JPA/Hibernate · Flyway |
| **Banco de Dados** | PostgreSQL — local via Docker ou em produção pelo Supabase |
| **Infra / Deploy** | Docker Compose · Nginx (frontend) · Spring Boot (backend) |

---

## 📁 Estrutura

```
OlhoVivo/
├── backend/    # API Spring Boot — entidades, controllers, services e migrations
├── frontend/   # Aplicação React — páginas, hooks, componentes e services HTTP
├── docker/     # Dockerfiles, Nginx e docker-compose de produção local
└── docs/       # Documentação auxiliar do projeto
```

---

## 🔑 Variáveis de Ambiente

Crie o arquivo de produção a partir do exemplo:

```powershell
cp .env.production.example .env.production
```

| Variável | Descrição |
|---|---|
| `DB_URL` | URL JDBC/PostgreSQL do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `CORS_ALLOWED_ORIGINS` | Origem permitida do frontend |

> ⚠️ Para Supabase em rede IPv4, use a connection string do **Session Pooler** e substitua a senha real no `.env.production`.

---

## 🐳 Rodando com Docker

Na raiz do projeto:

```powershell
docker compose -f docker/docker-compose.prod.yml up -d --build
```

| Serviço | URL |
|---|---|
| Frontend | http://127.0.0.1 |
| Backend | http://127.0.0.1:8080 |
| API de ocorrências | http://127.0.0.1:8080/api/v1/ocorrencias |

Para recriar os containers após alterações:

```powershell
docker compose -f docker/docker-compose.prod.yml up -d --force-recreate --build
```

---

## ☁️ Deploy na AWS (EC2)

### Pré-requisitos na AWS

Antes de começar, garanta que a instância EC2 esteja configurada corretamente:

- **Tipo de instância recomendado:** `t3.small` ou superior (mínimo 2 GB de RAM para o build Java)
- **Sistema operacional:** Ubuntu Server 22.04 LTS
- **Security Group — portas liberadas:**

| Porta | Protocolo | Origem | Finalidade |
|---|---|---|---|
| 22 | TCP | Seu IP | SSH |
| 80 | TCP | 0.0.0.0/0 | Frontend (HTTP) |
| 8080 | TCP | 0.0.0.0/0 | Backend (API) |

> ⚠️ Se for usar HTTPS futuramente, libere também a porta **443**.

---

### 1. Conectar na instância via SSH

```bash
chmod 400 sua-chave.pem
ssh -i sua-chave.pem ubuntu@<IP-PUBLICO-DA-EC2>
```

---

### 2. Instalar dependências na VM

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io

# Instalar Docker Compose
sudo apt install -y docker-compose-plugin

# Adicionar o usuário ubuntu ao grupo docker (evita usar sudo sempre)
sudo usermod -aG docker ubuntu

# Aplicar o grupo sem precisar fazer logout
newgrp docker
```

---

### 3. Clonar o repositório

```bash
git clone https://github.com/Kurzgesagttt/OlhoVivo.git
cd OlhoVivo
```

---

### 4. Obter a connection string do Supabase

O banco de dados de produção está hospedado no **Supabase**. Para conectar corretamente a partir da EC2 (rede IPv4), use o **Session Pooler** — não a conexão direta.

**Passo a passo no painel do Supabase:**

1. Acesse [supabase.com](https://supabase.com) e entre no seu projeto
2. Vá em **Project Settings → Database**
3. Em **Connection string**, selecione a aba **Session pooler**
4. Copie a URI — ela terá o formato:
   ```
   postgresql://postgres.[ref]:[senha]@aws-0-[regiao].pooler.supabase.com:5432/postgres
   ```
5. Substitua `[senha]` pela senha real do banco (a mesma definida ao criar o projeto)

> ⚠️ Use sempre o **Session Pooler** (porta `5432`) para conexões vindas de servidores externos como a EC2. A conexão direta pode falhar em redes IPv4 dependendo do plano do Supabase.

---

### 5. Configurar as variáveis de ambiente

```bash
cp .env.production.example .env.production
nano .env.production
```

Preencha com os valores de produção:

```env
# Cole aqui a connection string do Session Pooler do Supabase (formato JDBC)
DB_URL=jdbc:postgresql://aws-0-[regiao].pooler.supabase.com:5432/postgres?user=postgres.[ref]&password=[senha]

DB_USER=postgres.[ref]
DB_PASSWORD=[senha]

# Gere uma chave forte e aleatória (mínimo 32 caracteres)
JWT_SECRET=COLE_AQUI_UM_SEGREDO_HEX_COM_64_CARACTERES_OU_MAIS

# IP público da EC2 ou domínio, sem barra no final
CORS_ALLOWED_ORIGINS=http://<IP-PUBLICO-DA-EC2>
```

> 💡 Para gerar um `JWT_SECRET` seguro direto na VM: `openssl rand -hex 32`

---

### 6. Subir os containers

```bash
docker compose -f docker/docker-compose.prod.yml up -d --build
```

Verifique se os containers estão rodando:

```bash
docker ps
```

A aplicação estará acessível em:

| Serviço | URL |
|---|---|
| Frontend | `http://<IP-PUBLICO-DA-EC2>` |
| Backend | `http://<IP-PUBLICO-DA-EC2>:8080` |
| API de ocorrências | `http://<IP-PUBLICO-DA-EC2>:8080/api/v1/ocorrencias` |

---

### Atualizando o deploy

Para puxar novas alterações e recriar os containers:

```bash
git pull origin main
docker compose -f docker/docker-compose.prod.yml up -d --force-recreate --build
```

---

### Consultando logs

```bash
# Todos os serviços
docker compose -f docker/docker-compose.prod.yml logs -f

# Apenas o backend
docker compose -f docker/docker-compose.prod.yml logs -f backend

# Apenas o frontend
docker compose -f docker/docker-compose.prod.yml logs -f frontend
```

---

## 💻 Desenvolvimento Local

**Backend**

```powershell
cd backend
mvn spring-boot:run
```

**Frontend**

```powershell
cd frontend
npm install
npm run dev
```

---

## 🗺️ Rotas Importantes

| Rota | Descrição |
|---|---|
| `/home` | Feed principal |
| `/login` | Autenticação de morador ou supervisor |
| `/cadastro` | Cadastro de usuário |
| `/ocorrencias/nova` | Criação de ocorrência *(requer login)* |
| `/ocorrencias/:id` | Detalhes, comentários e votos |
| `/perfil` | Perfil do usuário logado |
| `/admin` | Painel de supervisão |

---

## 🔨 Build e Validação

**Frontend**

```powershell
cd frontend
npm run build
```

**Backend**

```powershell
cd backend
mvn test
```

**Docker**

```powershell
docker compose -f docker/docker-compose.prod.yml build backend frontend
```

---

## 📝 Observações

- As migrations do **Flyway** criam as tabelas automaticamente no banco configurado.
- Usuários precisam estar logados para criar ocorrências, votar, salvar, comentar e curtir comentários.
- Supervisores acessam o painel administrativo pelo login normal selecionando o modo supervisor.

---

## 👥 Equipe

Projeto extensionista desenvolvido na disciplina de **Sistemas Distribuídos** — **Faculdade Unilins**

| Aluno | GitHub |
|---|---|
| Alexandre Samuel Trevisan | [@samis7th](https://github.com/samis7th) |
| Lucas Moreno Rodrigues | [@Kurzgesagttt](https://github.com/Kurzgesagttt) |

---

<div align="center">

Feito com 💚 para fortalecer comunidades

**Faculdade Unilins · Sistemas Distribuídos**

</div>
