# Dev Log — Portal IBO (ibopvh / siteibopvh)

> Documentação viva de descobertas técnicas. Atualizada automaticamente durante o desenvolvimento.
> **Stack**: React 18 + TypeScript + Vite 5 + Tailwind v4 + Express 5 + Prisma 5 + PostgreSQL (Supabase) + Resend + Vercel/Netlify
> **Última atualização**: 2026-10-04

---

## ✅ O que Funciona

### Deploy & Serverless (Vercel)

#### Consolidação de rotas admin em uma única Serverless Function (plano Hobby)
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Contexto**: ao adicionar `api/admin-criancas-entry.ts`, o deploy falhou com "No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan".
- **Solução**: servir múltiplos domínios admin pela mesma função usando prefixo no `?path=` e roteador composto:
  ```ts
  // api/admin-ebf-entry.ts
  const router = express.Router();
  router.use('/criancas', createAdminChildrensRouter(prisma));
  router.use('/', createAdminEbfRouter(prisma));
  export default createVercelRouterHandler(router);
  ```
  ```json
  // vercel.json
  { "source": "/api/admin/criancas/:path*", "destination": "/api/admin-ebf-entry?path=criancas/:path*" }
  ```
- **Observações**: `createVercelRouterHandler` reconstrói `req.url` a partir de `req.query.path`, por isso o prefixo precisa viajar dentro do próprio path (`criancas/editions`), não como subdomínio/rewrite separado. Confirmado em produção (`/api/admin/criancas/editions` → 401 sem sessão).

#### Verificação de deploy/bundle em produção
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Contexto**:confirmar que a versão nova estava no ar sem acesso ao dashboard.
- **Solução**: seguir a cadeia real de chunks: `GET /criancas` (HTML) → localizar `assets/index-*.js` → buscar referência `assets/CriancasPage-*.js` dentro do entry → `GET` no chunk e verificar strings novas. Ex.: presença de `04.771.507/0001-08` confirmou o card PIX.
- **Observações**: o status do deploy também fica no GitHub: `gh api repos/vulmarjunior/siteibopvh/commits/<sha>/status` (context `Vercel`, state `success`).

### Banco de Dados (Prisma + Supabase)

#### Auto-healing de schema em runtime (produção sem migration manual)
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Contexto**: `prisma migrate deploy` não roda no deploy (porta 5432 bloqueada no Netlify/Supabase); o projeto adotou auto-healing em routers (padrão dos commits de setembro/2026).
- **Solução**: `src/api/childrens-schema.ts` com flag de módulo e DDL idempotente (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... EXCEPTION WHEN duplicate_object`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ENABLE ROW LEVEL SECURITY`) + seed idempotente (`ON CONFLICT ("id") DO NOTHING`) de `SiteModule`, `SiteEdition` e `HomeBannerSlide`.
- **Observações**: chamado por middleware nos routers público/admin de Crianças e, ainda, em `/api/modules` e `/api/home-banners` (para módulo/banner existirem antes da primeira inscrição). Em produção, o módulo `criancas` apareceu com `updatedAt` da primeira requisição. `REVOKE ... FROM anon, authenticated` fica em try/catch próprio (roles podem não existir em bancos locais).

#### Migrations: dois trilhos
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Solução**: `prisma/migrations/` para dev/DDL canônico e `supabase/migrations/` para aplicação manual no projeto de produção via plugin oficial. Ambas foram criadas para o Dia das Crianças.
- **Observações**: mesmo com as migrations, o runtime `ensure*` é o que garante o schema em produção no deploy.

### E-mail (Resend)

#### Disparo condicional e templates inline
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Solução**: `getResend()` lazy retorna `null` sem `RESEND_API_KEY`; inscrição nunca falha por e-mail. Dois envios: notificação interna (`contato@ibopvh.com.br`) e confirmação à família somente se e-mail informado, com HTML escapado (`escapeHtml`).
- **Observações**: rate limit `criancas-registration` = 6/hora por IP antes da validação (requisições inválidas também consomem cota).

### Frontend

#### Formulário com listas dinâmicas e validação espelhada
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Solução**: `CriancasInscricao.tsx` mantém listas controladas (crianças/familiares), checkboxes de logística com campos de detalhe, e o servidor expõe `validateChildrensRegistration` (puro) testado com Vitest sem banco.
- **Observações**: responsável é contabilizado automaticamente como participante (+1 por família) em métricas, CSV/PDF e e-mails; texto do formulário orienta a não repeti-lo entre os familiares.

#### Compartilhamento da localização via WhatsApp
- **Status**: ✅ Confirmado
- **Data**: 2026-10-04
- **Contexto**: facilitar a divulgação do evento pelas próprias famílias.
- **Solução**: botão "Compartilhar no WhatsApp" no card de localização (`CriancasLocal.tsx`) usando `https://wa.me/?text=${encodeURIComponent(...)}` com nome do evento, data/hora, local, link do Google Maps e link de inscrições (`https://www.ibopvh.com.br/criancas`).
- **Observações**: não exige número de destino (abre o seletor de contatos do WhatsApp).

---

## ❌ O que Não Funciona

### Deploy (Vercel)

#### 13ª Serverless Function no plano Hobby
- **Status**: ❌ Confirmado que falha
- **Data**: 2026-10-04
- **Contexto**: `api/admin-criancas-entry.ts` levou o projeto de 12 para 13 funções.
- **Problema**: `Build Failed — No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan. Create a team (Pro plan) to deploy more.`
- **Alternativa conhecida**: consolidar routers em um entry existente via prefixo em `?path=` (ver ✅). Cada arquivo em `api/` conta função, inclusive `api/cron/*`.

#### `prisma migrate deploy` no deploy
- **Status**: ❌ Confirmado que falha
- **Data**: já documentado em `docs/CHANGELOG.md` (2026-08)
- **Problema**: porta 5432 bloqueada no ambiente de build (Supabase).
- **Alternativa conhecida**: auto-healing em runtime (`ensure*Schema`) e/ou SQL Editor/plugin oficial do Supabase para migrations manuais.

---

## 🔄 Correções de Registro

#### Domínio de produção do portal
- **Antes**: validações iniciais usavam `ibopvh.vercel.app` como referência de produção.
- **Depois**: a produção real é `www.ibopvh.com.br` (e `ibopvh.com.br`); o alias `ibopvh.vercel.app` pode responder um deployment antigo (saúde com mensagem antiga e 404 em rotas novas).
- **Data da correção**: 2026-10-04
- **Motivo**: validação de banner, imagens e API só coincidiu no domínio www.

#### Método de verificação de bundle
- **Antes**: comparar o hash do chunk gerado pelo build local (`dist/assets/CriancasPage-*.js`) com a produção.
- **Depois**: seguir a cadeia HTML → entry → chunk na produção.
- **Data da correção**: 2026-10-04
- **Motivo**: a Vercel roda `node scripts/process-ebf-gallery.mjs` antes do `tsc && vite build`, alterando o manifest da galeria e, por consequência, os hashes dos chunks compartilhados.

---

## 💡 Padrões Descobertos

#### Auto-heal idempotente com falhas parciais toleradas
- **Regra**: DDL com flag de módulo (`let ensured = false`); statements que dependem de roles/objetos externos (ex.: `REVOKE ... FROM anon`) em try/catch separado para não invalidar o ensure inteiro.
- **Aplica-se a**: `src/api/childrens-schema.ts`, routers públicos/admin e padrões `ensure*` existentes (prayer, history).
- **Fonte**: implementação do módulo Crianças + padrão prévio do projeto.

#### Seed de domínio junto ao ensure de schema
- **Regra**: ao criar um módulo novo, semear `SiteModule`/`SiteEdition` (e banner) com `ON CONFLICT DO NOTHING` no próprio ensure, para o deploy funcionar sem SQL manual.
- **Aplica-se a**: módulos de hotsite com operações públicas (`publicOperationsOpen`).
- **Exemplo**: módulo `criancas` + edição `criancas-2026` + `home-banner-dia-das-criancas-2026`.

#### Validators puros exportados
- **Regra**: extrair a validação do payload em função pura exportada (sem Prisma/Express) e testá-la com Vitest.
- **Aplica-se a**: `src/api/public/childrens.ts` (`validateChildrensRegistration`), testado em `src/api/public/__tests__/childrens.test.ts`.
- **Fonte**: suíte de testes do projeto (21 arquivos, 133 testes em 2026-10-04).

#### Contagem de pessoas por família
- **Regra**: o responsável da inscrição conta como participante automático; métricas de "pessoas" = famílias + todos os membros listados.
- **Aplica-se a**: `/admin/criancas`, CSV (`Papel = Responsável`, idade vazia) e PDF (`Idade = —`).
- **Fonte**: decisão pastoral em 2026-10-04.

---

## 📋 Decisões de Arquitetura

#### Inscrição do Dia das Crianças com modelo normalizado (edições)
- **Escolha**: espelhar o EBF — `ChildrensDayRegistration` + `ChildrensDayMember` vinculados a `SiteEdition` (`criancas-2026`), com `kind = CRIANCA | FAMILIAR`.
- **Alternativas rejeitadas**: JSON em coluna (como `prayerThemes`); tabela única sem edição.
- **Data**: 2026-10-04

#### Encerramento manual das inscrições
- **Escolha**: sem bloqueio por data no código; fecha-se em `/admin/modulos` (`publicOperationsOpen = false`). Prazo de 08/10 é comunicado no site/e-mails.
- **Alternativas rejeitadas**: validação automática de deadline no endpoint e no middleware.
- **Data**: 2026-10-04

#### PIX direto no card de ofertas
- **Escolha**: QR Code + chave CNPJ `04.771.507/0001-08` copiável + favorecido no próprio hotsite, com instrução para identificar a natureza ("Dia das Crianças — Carne").
- **Alternativas rejeitadas**: link para a seção de contribuição da home (`/#contribua`).
- **Data**: 2026-10-04

#### Entry admin compartilhada (EBF + Crianças)
- **Escolha**: uma Serverless Function para as duas APIs admin.
- **Alternativas rejeitadas**: nova função (estoura o Hobby) e mover para `/api/index` (rewrites com catch-all não preservam o path da API admin).
- **Data**: 2026-10-04

---

## ⚠️ Armadilhas Conhecidas (Gotchas)

- **Vercel Hobby**: limite de 12 Serverless Functions por deployment. Contar arquivos em `api/` (incluindo `api/cron/*`) antes de adicionar/remover.
- **Prisma `generate` no Windows**: falha com `EPERM ... query_engine-windows.dll.node` se o `npm run dev` (tsx) estiver rodando; parar os processos Node antes.
- **`.env.local`**: pode apontar para tenant Supabase inexistente (`FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found`); atualizar a connection string do projeto de produção para testes locais.
- **`ibopvh.vercel.app`**: alias que pode servir deployment antigo; validar sempre em `www.ibopvh.com.br`.
- **`createVercelRouterHandler`**: reconstrói `req.url` a partir de `?path`; rewrites para domínios compartilhados devem embutir o prefixo no path.
- **Build da Vercel**: roda `node scripts/process-ebf-gallery.mjs` antes do `tsc && vite build`; hashes de chunks podem divergir do build local.
- **Duas rotas de health**: `api/health.ts` responde `{ status: 'ok', message: 'IBO API is running' }` (rewrite próprio) enquanto o `apiRouter` interno também possui `/health` (`{ status: 'ok' }`).
- **Rate limit público**: `consumeRateLimit` roda antes da validação; testes de POST inválido consomem cota do IP (6/h em Crianças).
