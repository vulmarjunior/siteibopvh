# Continuidade do projeto

Atualizado em 2026-10-26.

## Estado atual

- Repositório: `https://github.com/vulmarjunior/siteibopvh`
- Branch de continuidade: `main` (produção)
- Branch em andamento: `feat/ebd-e4-admin-importacao` — E2, E3 e E4 homologadas; **E5 pendente**
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
git checkout feat/ebd-e4-admin-importacao
npm install
npx prisma generate
```

Crie `.env.local` a partir de `.env.example`. Os valores secretos não ficam no GitHub; obtenha-os nos projetos Vercel/Supabase/Resend. Para a EBD, o bucket `ebd` do Supabase Storage e as variáveis `SUPABASE_SERVICE_ROLE_KEY`/`VITE_SUPABASE_*` precisam estar configurados — ver `docs/planos/E4_STORAGE_SETUP.md`.

O PDF de origem **não é versionado**. Para retomar a E5, copie `PalavraeVida-1T2022-Digital.pdf` para `materiais/ebd/2022/1T/adultos/` e confira o SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204`. O JSON de amostra das Lições 1 e 2 também é local e ignorado pelo Git.

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

## EBD Digital

- **Status:** E2, E3 e E4 homologadas em 26/10/2026; **E5 (publicação do trimestre) não iniciada**.
- **Branch:** `feat/ebd-e4-admin-importacao` (empilhada sobre E2/E3; não mergeada em `main`).
- **Rotas públicas:** `/ebd` (índice e busca) e `/ebd/licao/:slug` (leitor).
- **Admin:** `/admin/ebd`, `/admin/ebd/:quarterId` e `/admin/ebd/licoes/:lessonId`, com permissão `ebd:manage`.
- **Leitura:** texto reflow, fonte ajustável, tema claro/escuro/sistema, download do PDF, navegação, índice, busca com trechos e progresso local.
- **Admin:** upload assinado do PDF, versionamento, importação do JSON com hash/tamanho, revisão com prévia e PDF, publicação/despublicação e auditoria.
- **Amostra:** o ambiente local tem 2 lições importadas (L1/L2), mas o PDF tem **13 lições**. A E5 precisa extrair, revisar e importar as 13 antes de publicar.
- **Pré-requisito da E5:** bucket `ebd` real no Supabase Storage e credenciais válidas; o `.env.local` de produção desta máquina está com a conexão Supabase inválida.
- **Sem deploy:** a branch não foi mergeada; produção continua sem o módulo EBD.

## Última validação

- **179 testes** aprovados em 27 arquivos (`npm test` / Vitest).
- Lint e build TypeScript/Vite aprovados.
- EBD: Lighthouse 1,00 nas páginas públicas; upload de PDF de 4.850.159 bytes, importação, rascunho oculto, publicação/despublicação, versionamento e auditoria validados localmente.
- Central Administrativa com layout 2.0 ativo em produção na `main` (Sidebar em 4 pilares, Header com Breadcrumbs, Command Palette `Ctrl+K` e Dashboard Executivo de KPIs).


## Regras de continuidade

- Não alterar funções já homologadas ao simplificar formulários.
- Não versionar `.env.local`, tokens, senhas ou chaves.
- Toda alteração deve passar por testes, lint e build antes de entrar na `main`.
- Registrar mudanças relevantes em `docs/CHANGELOG.md` e atualizar este arquivo quando o estado operacional mudar.
