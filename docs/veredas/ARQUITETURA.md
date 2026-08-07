# Arquitetura — Veredas IBO

## Visão Geral
O módulo **Veredas IBO** é uma plataforma de curadoria teológica e pastoral integrada ao portal da Igreja Batista Olaria (`ibopvh-portal`).

## Componentes Arquiteturais

1. **Frontend (SPA React + Vite)**
   - Rota base pública: `/veredas/*`
   - Rota base administrativa: `/admin/veredas/*`
   - Estilização: Tailwind CSS v4 com paleta editorial e fontes `Cinzel` (serif) e `Lato` (sans).

2. **Backend Serverless (Express + Vercel Functions)**
   - Ponto de entrada Vercel: `api/index.ts`; o router `src/api.ts` acopla `src/api/veredas/router.ts` sob o prefixo `/api/veredas`.
   - Autenticação Serverless: `src/api/veredas/authMiddleware.ts` utiliza o SDK oficial `@supabase/supabase-js` no backend (`supabase.auth.getUser(token)`), extrai o UUID e valida contra a tabela `CuradoriaUsuario` do Prisma.

3. **Camada de Dados & Persistência (Prisma + PostgreSQL)**
   - Banco PostgreSQL hospedado via Supabase.
   - Modelos conceituais isolados com prefixo `Curadoria*`.

4. **Rate Limit Persistido**
   - Rate limit de relatos de link quebrado (`CuradoriaLinkRelato`) consultando registros no banco de dados por hash de IP e janela de tempo recente.
