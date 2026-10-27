# Pendências

Fonte oficial das pendências deste projeto.

## Em aberto

- **2026-10-25 — Avaliar migração do portal para a VPS (Coolify), incluindo banco
  no PostgreSQL da VPS.** Comparativo em
  [AVALIACAO_MIGRACAO_VPS.md](AVALIACAO_MIGRACAO_VPS.md). Decisão pendente; não é
  pré-requisito do módulo EBD Digital. Envolve segurança da VPS, Auth/Storage do
  Supabase, backups e capacidade.
- **2026-10-27 — EBD Digital: E5 implementada, aguardando homologação manual.**
  E1 concluída na edição real 1T2022; E2, E3 e E4 homologadas em 26/10/2026 e em
  produção. A Revisão 2 (aprovada em 27/10/2026) separou a **edição** (revista)
  do **ciclo de estudo** (uso), com data por lição, regra mais exceções e rótulo
  público por período — ver [planos/REVISAO_2_CICLOS.md](planos/REVISAO_2_CICLOS.md).
  A **E5 (ciclos de estudo e calendário)** foi implementada na branch
  `feat/ebd-e5-ciclos`, com PR
  [#21](https://github.com/vulmarjunior/siteibopvh/pull/21) e CI verde; **sem
  merge e sem deploy**. A homologação manual está bloqueada por ambiente: falta
  `DATABASE_URL` no `.env.local` (Postgres local na porta 55432), autenticação
  local do admin e bucket `ebd` real. Por isso a migração, o fluxo do admin e o
  Lighthouse não foram executados. Roteiro clicável em
  [planos/E5_HOMOLOGACAO.md](planos/E5_HOMOLOGACAO.md). A **E6** (homologação e
  publicação do ciclo) segue pendente e depende do bucket real, do ciclo completo
  da turma Adultos, do aceite do responsável, da autorização da editora
  referenciada e do teste de acessibilidade (NVDA/TalkBack). A extração das 13
  lições é reproduzível por `scripts/ebd/extract-quarter.py`; o PDF e o JSON não
  são versionados. `/ebd` nasce com `noindex` em meta/header e fora do sitemap.
  Plano em [planos/PLANO_EBD_DIGITAL.md](planos/PLANO_EBD_DIGITAL.md),
  diagnóstico em [planos/E1_DIAGNOSTICO_EXTRACAO.md](planos/E1_DIAGNOSTICO_EXTRACAO.md),
  checklist da E2 em [planos/E2_CHECKLIST_WCAG.md](planos/E2_CHECKLIST_WCAG.md) e
  configuração de Storage em
  [planos/E4_STORAGE_SETUP.md](planos/E4_STORAGE_SETUP.md).

## Concluídas

Nenhuma pendência concluída registrada.
