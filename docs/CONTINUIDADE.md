# Continuidade do projeto

Atualizado em 2026-08-25.

## Estado atual

- Repositório: `https://github.com/vulmarjunior/siteibopvh`
- Branch de continuidade: `main`
- Hospedagem: Vercel, projeto `ibopvh`
- Produção: `https://ibopvh.com.br`
- Alias Vercel: `https://ibopvh.vercel.app`
- Deploy: automático após merge/push na branch `main`
- Banco e autenticação: Supabase
- E-mail: Resend; registros do Google Workspace permanecem preservados no DNS
- DNS autoritativo: Vercel (`ns1.vercel-dns.com` e `ns2.vercel-dns.com`)

## Retomar em outro computador

```bash
git clone https://github.com/vulmarjunior/siteibopvh.git
cd siteibopvh
npm install
npx prisma generate
```

Crie `.env.local` a partir de `.env.example`. Os valores secretos não ficam no GitHub; obtenha-os nos projetos Vercel/Supabase/Resend. Para trabalhar apenas no deploy remoto, as variáveis já estão configuradas na Vercel.

Validação local:

```bash
npm test
npm run build
```

## Veredas IBO

- Rotas públicas: `/veredas`, `/veredas/livros`, `/veredas/videos` e páginas individuais.
- Administração: Integrado à Central Administrativa em `/admin/veredas`.
- Cadastro de livros: ISBN com busca automática; quando não houver capa, o campo `Link da capa` permanece visível para preenchimento manual.
- Um único texto, `Por que indicamos?`, alimenta também o resumo usado nos cards.
- Temas podem ser selecionados ou criados durante o cadastro.
- Links de aquisição pedem URL e finalidade; fornecedor e texto público são derivados automaticamente.
- Cadastro de vídeos: link do YouTube preenche título, canal e miniatura.
- Comportamento homologado do vídeo deve ser preservado: quando `incorporavel` e `youtubeId` estiverem disponíveis, o player abre dentro do site; somente vídeos bloqueados direcionam ao YouTube.
- O botão de compartilhamento em livros e vídeos envia sempre a página oficial em `ibopvh.com.br`, nunca a loja ou o YouTube.

## Última validação

- 117 testes aprovados em 19 arquivos (`npm test` / Vitest).
- Build TypeScript/Vite aprovado com 100% de sucesso.
- Central Administrativa com novo layout 2.0 ativo em produção na `main` (Sidebar em 4 pilares, Header com Breadcrumbs, Command Palette `Ctrl+K` e Dashboard Executivo de KPIs).


## Regras de continuidade

- Não alterar funções já homologadas ao simplificar formulários.
- Não versionar `.env.local`, tokens, senhas ou chaves.
- Toda alteração deve passar por testes, lint e build antes de entrar na `main`.
- Registrar mudanças relevantes em `docs/CHANGELOG.md` e atualizar este arquivo quando o estado operacional mudar.
