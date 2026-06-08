---
name: olhovivo-frontend
description: Padroes do frontend React, TypeScript, Vite, Tailwind CSS e TanStack Query do projeto OlhoVivo. Use quando Codex precisar criar, editar, revisar ou depurar paginas, componentes, hooks, services HTTP, rotas, tipos ou build do frontend deste repositorio.
---

# OlhoVivo Frontend

Siga estes padroes ao trabalhar em `frontend/`.

## Estrutura

- Use `src/pages` para telas ligadas a rota.
- Use `src/pages/admin` para fluxo administrativo.
- Use `src/components` para componentes reutilizaveis.
- Use `src/hooks` para logica de integracao e estado assinado por dominio.
- Use `src/services` para chamadas HTTP baseadas no cliente Axios de `src/services/api.ts`.
- Use `src/types` para contratos compartilhados da UI.

## Regras de implementacao

- Nao chame `axios` direto de pagina ou componente se houver um `service` apropriado.
- Encapsule fetch e mutations em hooks de dominio quando houver estado remoto.
- Preserve o contrato atual da API com prefixo `/api/v1`.
- Ao alterar resposta da API, revise o tipo correspondente em `src/types`.
- Reaproveite as cores/tokens definidos em `tailwind.config.js` e `src/tokens.css`.
- Mantenha nomes de arquivos em PascalCase para paginas/componentes e kebab/camel conforme padrao atual para services e hooks.
- Preserve compatibilidade com `npm run build`; nao introduza dependencia de ambiente apenas de dev.

## Fluxo recomendado

1. Localizar `page`, `hook`, `service` e `type` relacionados ao recurso.
2. Aplicar a mudanca no menor numero de pontos possivel.
3. Verificar impacto em rotas definidas em `src/router.tsx`.
4. Validar build com `npm run build` quando houver alteracao funcional.

## Comandos uteis

```powershell
cd frontend
npm install
npm run dev
npm run build
```
