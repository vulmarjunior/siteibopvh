# Migração Netlify → Vercel

## Status final — concluída em 2026-08-06

- Projeto Vercel: `ibopvh`.
- Repositório conectado: `vulmarjunior/siteibopvh`.
- Deploy automático ativo para a branch `main`.
- Produção: `https://ibopvh.com.br` e `https://www.ibopvh.com.br`.
- Alias permanente: `https://ibopvh.vercel.app`.
- Aplicação SPA, APIs Express e cron executam em Vercel Functions.
- Variáveis de produção e preview estão configuradas na Vercel.
- DNS autoritativo usa `ns1.vercel-dns.com` e `ns2.vercel-dns.com`.
- Registros MX, SPF, DKIM, DMARC e Google Workspace foram preservados.
- HTTPS e rotas públicas foram validados.
- Netlify não participa mais do deploy de produção nem do DNS.

## Configuração mantida no repositório

- `api/index.ts`: entrada da API na Vercel.
- `api/cron/weekly-reading.ts`: cron semanal protegido por `CRON_SECRET`.
- `vercel.json`: build, SPA rewrites, API e cron.
- `netlify.toml` e `netlify/functions/`: legado preservado apenas como referência/fallback histórico; não representam a hospedagem atual.

## Variáveis esperadas

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

Os valores secretos não são versionados. Eles permanecem na Vercel e nos respectivos provedores.

Consulte `docs/CONTINUIDADE.md` para retomar o trabalho em outro computador.
