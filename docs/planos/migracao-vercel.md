# Plano de migração Netlify → Vercel

Referência local do plano de continuidade da migração.

Objetivo: migrar o portal para Vercel preservando Supabase/Postgres, Resend e Google Workspace, sem mudanças de DNS antes da homologação completa em `*.vercel.app`.

## Pontos principais

- Criar branch de implementação específica (`codex/migracao-vercel`) e manter produção Netlify intacta durante a fase inicial.
- Adaptar API Express para funcionar em Vercel Functions.
- Configurar `vercel.json` com rewrites de SPA + API + cron.
- Migrar job semanal para `/api/cron/weekly-reading` com proteção por `CRON_SECRET`.
- Manter `netlify.toml` e funções Netlify atuais como fallback por enquanto.

## Variáveis de ambiente esperadas

- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD`
- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CRON_SECRET`

## Lote inicial (já em execução)

1. Configurar entrypoint API para Vercel (`api/index.ts`) reutilizando `apiRouter`.
2. Adicionar handler cron em `api/cron/weekly-reading.ts`.
3. Criar `vercel.json` com:
   - `buildCommand` com `prisma generate`
   - `outputDirectory: dist`
   - `rewrites` para API e SPA
   - `crons` para segunda-feira às 11:00 UTC
4. Preparar ajuste de variáveis sem tocar DNS, deploy externo e banco.

### Checklist de ambiente para começar no Vercel

Antes do primeiro deploy em `*.vercel.app`, só faltam essas configurações:

- No projeto Vercel:
  - Importar o repositório no Vercel via GitHub.
  - Framework: Vite.
  - Build Command: `npx prisma generate && node scripts/process-ebf-gallery.mjs && npm run build` (já refletido em `vercel.json`).
  - Output Directory: `dist`.
  - Region compatível para o banco (ideal Sul dos EUA / São Paulo conforme disponibilidade).
  - Domínio customizado **sem alterar** DNS ainda (fique no `*.vercel.app` até validação).

- Variáveis de ambiente de produção/preview (mesmas do Netlify):
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `RESEND_API_KEY`
  - `ADMIN_PASSWORD`
  - `APP_URL` (agora `https://<seu-projeto>.vercel.app` ou domínio temporário de homologação)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `CRON_SECRET` (string aleatória longa)

- Validar se estas rotas funcionam em staging:
  - `/<qualquer-rota-do-app>` retorna front-end (SPA).
  - `/api/health` retorna OK.
  - `/api/parousia/unsubscribe?...` responde conforme app atual.
  - `/api/cron/weekly-reading` só responde com header `Authorization: Bearer <CRON_SECRET>` (ou 401 sem token).

- Cron:
  - `vercel.json` já configura `0 11 * * 1`.
  - Em produção, ajuste fuso/horário no Vercel se necessário.

- Supabase:
  - Validar `SUPABASE_SERVICE_ROLE_KEY` e IP allowlist (se aplicável) para permitir chamadas da Vercel sem bloqueio.

- Netlify:
  - Deixar a configuração existente ativa como fallback durante a homologação da Vercel.
