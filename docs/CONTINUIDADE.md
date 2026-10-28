# Continuidade do projeto

Atualizado em 2026-10-27.

## Estado atual

- Repositório: `https://github.com/vulmarjunior/siteibopvh`
- Branch de continuidade: `main` (produção)
- Branch em andamento: `main` — E2, E3 e E4 homologadas e em produção; **E5 (ciclos e calendário) mergeada e publicada em 27/10/2026; decisões da proveniência editorial tomadas em 27/10/2026 (Rev. 3), decisões 1, 2 e 5 implementadas e publicadas na Rev. 4 (PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash `7695173`); edição órfã removida e E5 homologada em 27/10/2026**; E6 pendente
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
git checkout main
npm install
npx prisma generate
```

Crie `.env.local` a partir de `.env.example`. Os valores secretos não ficam no GitHub; obtenha-os nos projetos Vercel/Supabase/Resend. Para a EBD, o bucket `ebd` do Supabase Storage e as variáveis `SUPABASE_SERVICE_ROLE_KEY`/`VITE_SUPABASE_*` precisam estar configurados — ver `docs/planos/E4_STORAGE_SETUP.md`.

O banco local desta máquina usa Postgres na porta `55432`; o `.env.local` atual está **sem `DATABASE_URL`**, então migração, importação e validação manual do admin não rodam aqui. Não invente credenciais nem aponte para produção: peça ao responsável o valor local ou use o projeto Supabase de desenvolvimento.

O PDF de origem **não é versionado**. Para retomar, copie `PalavraeVida-1T2022-Digital.pdf` para `materiais/ebd/2022/1T/adultos/` e confira o SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204`. O JSON completo das 13 lições é local e ignorado pelo Git.

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

- **Status:** E2, E3 e E4 homologadas em 26/10/2026 e em produção; **E5 (ciclos de estudo e calendário) mergeada e publicada em 27/10/2026; decisões da proveniência editorial tomadas em 27/10/2026 (Rev. 3), decisões 1, 2 e 5 implementadas e publicadas na Rev. 4 (PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash `7695173`); edição órfã removida e E5 homologada em 27/10/2026**; **E6 (publicação do ciclo) pendente**.
- **Produção:** a E5 está no ar em `https://ibopvh.com.br` (PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21), squash `a66add8`). A **Rev. 4** (PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash `7695173`) foi publicada em 27/10/2026; smoke: `/api/ebd/cycles` 200, `/api/ebd/quarters` 404, `/api/ebd/admin/editions` 401 sem sessão e `/ebd` com `noindex`. O reset do schema foi aplicado no primeiro acesso e não havia conteúdo antigo a preservar. A edição órfã **2026/4/Adultos** (`cmvqucvhr00008o0q1h8ikx7v`) e o PDF do bucket foram removidos pelo responsável em 27/10/2026. A **homologação funcional** foi executada em 27/10/2026: edição `cmvr6pdrl0000ke0hu6kvcba4`, 13 lições importadas, ciclo `cmvr6v1iw000wke0hvc4p2qgq` (slug `adultos-2027-09-05`) publicado, validado no público e arquivado ao final; `/ebd` voltou a ficar sem ciclo. A **E5 foi homologada em 27/10/2026** com aceite do responsável. A **E6** (ciclo oficial da turma Adultos) está pendente.
- **Modelo (Rev. 2 do plano):** a **edição** (`EbdEdition`, a revista) é separada do **ciclo de estudo** (`EbdCycle`, o uso). O ciclo tem turma, data de início, dia da semana, revisão da âncora e status; cada lição tem uma posição e uma exceção (`RULE`, `RESCHEDULED`, `NO_MEETING`) em `EbdCycleLesson`. Ver [planos/REVISAO_2_CICLOS.md](planos/REVISAO_2_CICLOS.md).
- **Calendário:** `computeEbdSchedule` (`src/lib/ebd/schedule.ts`) é a única fonte das datas, em dias civis (`DATE`, sem fuso). Ajustar uma lição não move as seguintes; `NO_MEETING` desloca a lição e as seguintes em uma semana; reancorar preserva os ajustes manuais e os sinaliza como divergência; duas lições na mesma data são sinalizadas. `scheduledOn` grava só a data manual de `RESCHEDULED` — `RULE`/`NO_MEETING` ficam nulos para não guardar dado derivado.
- **Slugs permanentes:** edição `{ano}-{trimestre}t-{turma}`, lição `{edição}-licao-NN`, ciclo `{turma}-{data-da-lição-1}` (sufixo em colisão; nunca regerado).
- **Migração:** `prisma/migrations/20261027120000_ebd_editions_cycles` aplica **reset** do modelo anterior (`EbdQuarter`, `EbdLesson`, `EbdPdfAsset`), autorizado porque produção não tinha conteúdo EBD. Não há migração de dados. O auto-schema de runtime (`src/api/ebd-schema.ts`) detecta `EbdLesson.quarterId` e faz o mesmo reset uma vez; **o reset já foi aplicado em produção em 27/10/2026**.
- **Rotas públicas:** `/ebd` (ciclos, período de uso, busca e progresso) e `/ebd/licao/:slug` (leitor com data do encontro, índice do ciclo e proveniência no rodapé). APIs: `/api/ebd/cycles`, `/api/ebd/cycles/:slug`, `/api/ebd/lessons/:slug`, `/api/ebd/search?cycle=<slug>` e PDF em `/api/ebd/editions/:id/pdf`.
- **Admin:** `/admin/ebd` (edições), `/admin/ebd/:editionId` (PDF, importação, ciclos e lições), `/admin/ebd/ciclo/:cycleId` (agenda, `Reancorar o ciclo a partir desta data`, `Ajustar somente esta lição`, publicação do ciclo) e `/admin/ebd/licoes/:lessonId`, com permissão `ebd:manage`.
- **Preservado:** leitura reflow, fonte/tema, busca com trechos, progresso local por slug de lição, upload assinado, versionamento do PDF, validação de hash/tamanho e auditoria em `CuradoriaAuditoria`. `/ebd` continua `noindex` e fora do sitemap.
- **Amostra:** o banco local tinha 2 lições (L1/L2); o PDF tem **13**. A E6 precisa revisar e publicar o ciclo completo.
- **Extração:** `scripts/ebd/extract-quarter.py` (versionado) gera o JSON draft das 13 lições; instruções em `scripts/ebd/README.md`. O JSON completo gerado nesta máquina é local e ignorado.
- **Pendências por ambiente (E6):** a E5 foi homologada em 27/10/2026. Para a E6 falta definir o calendário real da turma Adultos (data de início, dia da semana e exceções), revisar o conteúdo e publicar o ciclo oficial. O bucket `ebd`, o `noindex` e as 13 lições já foram exercitados na E5.
- **Correção implementada e publicada em 27/10/2026 (Rev. 4, decisões 1, 2 e 5):** a edição nasce do JSON; ano, trimestre e turma são editáveis antes do primeiro PDF/lição/ciclo e ficam imutáveis depois; o import não bloqueia mais por proveniência e exibe a divergência como nota informativa. Esquema v1.0.0, hash e tamanho continuam como bloqueios. Evidência: PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash `7695173`, 211 testes, lint e build verdes, deploy Production, smoke verde e homologação funcional em 27/10/2026. A edição órfã (decisão 4) foi removida no mesmo dia e a E5 foi homologada com aceite do responsável. Detalhes em [planos/E5_PROVENIENCIA_EDITORIAL.md](planos/E5_PROVENIENCIA_EDITORIAL.md) §17.

## Última validação

- **211 testes** aprovados em 30 arquivos (`npm test` / Vitest) em 27/10/2026, incluindo 9 de rota da API admin, 5 das regras de proveniência e 16 do calendário.
- `npx tsc --noEmit`, lint e build TypeScript/Vite aprovados em 27/10/2026.
- **Publicação da Rev. 4 em 27/10/2026:** PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25) mergeado (squash `7695173`); CI da `main` verde (44 s); deploy **Vercel Production**; smoke: `/api/ebd/cycles` 200, `/api/ebd/quarters` 404, `/api/ebd/admin/editions` 401 sem sessão e `/ebd` com `noindex`.
- **Deploy da E5 em 27/10/2026 (histórico):** CI da `main` verde; `/api/ebd/cycles` 200 com lista vazia, `/api/ebd/quarters` 404, `/api/ebd/admin/editions` 401 sem sessão, `/ebd` e APIs com `noindex`.
- **Limpeza da órfã em 27/10/2026:** edição `cmvqucvhr00008o0q1h8ikx7v` (2026/4/Adultos) e PDF do bucket `ebd` removidos pelo responsável via painel Supabase (Opção A); smoke pós-limpeza com `/api/ebd/cycles` 200 e `/ebd` 200.
- **Homologação da E5 em 27/10/2026:** edição `cmvr6pdrl0000ke0hu6kvcba4` e 13 lições importadas; ciclo `cmvr6v1iw000wke0hvc4p2qgq` (`adultos-2027-09-05`, revisão 2) com lição 3 no sábado, lição 5 sem encontro e lições 7/8 na mesma data; publicado, validado no público e arquivado. Busca “Pentateuco” com 3 resultados, PDF por URL assinada, progresso local e `noindex` em meta/header confirmados. Lighthouse: acessibilidade, boas práticas e SEO **1,00** em `/ebd` e na lição. **Aceite do responsável em 27/10/2026.**
- EBD: 2 lições de amostra e extrator completo da 1T2022 (13 lições) validados em 26/10/2026; Lighthouse 1,00 nas páginas públicas e fluxo de upload/importação/publicação validados localmente na E4.
- **Próximo passo na EBD:** E6 — definir o calendário real da turma Adultos, revisar o conteúdo e publicar o ciclo oficial.
- Central Administrativa com layout 2.0 ativo em produção na `main` (Sidebar em 4 pilares, Header com Breadcrumbs, Command Palette `Ctrl+K` e Dashboard Executivo de KPIs).


## Regras de continuidade

- Não alterar funções já homologadas ao simplificar formulários.
- Não versionar `.env.local`, tokens, senhas ou chaves.
- Toda alteração deve passar por testes, lint e build antes de entrar na `main`.
- Registrar mudanças relevantes em `docs/CHANGELOG.md` e atualizar este arquivo quando o estado operacional mudar.
