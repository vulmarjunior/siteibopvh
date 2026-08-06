# Administração — Veredas IBO

## Provisionamento do Primeiro Admin
Para cadastrar o primeiro administrador sem expor endpoints públicos de bootstrap, utilize o script CLI seguro:

```bash
npx tsx scripts/create-first-veredas-admin.ts <SUPABASE_USER_UUID> <EMAIL> [NOME]
```

## Acesso ao Painel
- URL: `/admin/veredas/login`
- Autenticação efetuada com e-mail e senha via Supabase Auth SDK.
- Validação de sessão no servidor Express via token Bearer.
