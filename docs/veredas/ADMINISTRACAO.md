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

## Cadastro atual

- Livro: ISBN, link manual da capa sempre visível, texto pastoral único, temas e links simplificados.
- Vídeo: link do YouTube com preenchimento de metadados; campos técnicos permanecem internos.
- O player incorporado é uma função homologada: vídeos com `incorporavel=true` e `youtubeId` devem tocar dentro da página.
- Compartilhamento de livros e vídeos usa a URL oficial da página no domínio `ibopvh.com.br`.
