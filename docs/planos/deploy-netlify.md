# Deploy Netlify - Guia Completo

## Variáveis de Ambiente

Configurar em: **Netlify Dashboard** → **ibopvh** → **Site Settings** → **Environment Variables**

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.tyqdxqfuppmwtkxbpvho:e8Ye6p75vwfBMdIy@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0` |
| `DIRECT_URL` | `postgresql://postgres.tyqdxqfuppmwtkxbpvho:e8Ye6p75vwfBMdIy@db.tyqdxqfuppmwtkxbpvho.supabase.co:5432/postgres` |
| `RESEND_API_KEY` | `re_LPbn2FiJ_QEbnJFHvAt65xYy1q9H3UbFv` |
| `ADMIN_PASSWORD` | `3McT89abMpizCwp8` |
| `APP_URL` | `https://ibopvh.netlify.app` |

## Trigger Deploy

1. Faça um push no repositório, OU
2. Vá em **Deploys** → **Trigger deploy** → **Deploy site**

## Verificar Funcionamento

- Saúde: `https://ibopvh.netlify.app/api/health`
- Debug DB: `https://ibopvh.netlify.app/api/debug`

## Área Admin

- URL: `https://ibopvh.netlify.app/relogio/admin?password=3McT89abMpizCwp8`