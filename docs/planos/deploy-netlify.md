# Deploy Netlify - Guia Completo

## Variáveis de Ambiente

Configurar em: **Netlify Dashboard** → **ibopvh** → **Site Settings** → **Environment Variables**

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | *(obter no Supabase → Settings → Database → Connection String)* |
| `DIRECT_URL` | *(obter no Supabase → Settings → Database → Connection String)* |
| `RESEND_API_KEY` | *(obter no Resend → API Keys)* |
| `ADMIN_PASSWORD` | *(sua senha segura)* |
| `APP_URL` | `https://ibopvh.netlify.app` |

## Trigger Deploy

1. Faça um push no repositório, OU
2. Vá em **Deploys** → **Trigger deploy** → **Deploy site**

## Verificar Funcionamento

- Saúde: `https://ibopvh.netlify.app/api/health`
- Debug DB: `https://ibopvh.netlify.app/api/debug`

## Área Admin

- URL: `https://ibopvh.netlify.app/relogio/admin?password=[SUA_SENHA_ADMIN]`
