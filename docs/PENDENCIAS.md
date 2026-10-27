# Pendências

Fonte oficial das pendências deste projeto.

## Em aberto

- **2026-10-27 — EBD Digital: E5 publicada em produção, homologação em andamento.**
  E1 concluída na edição real 1T2022; E2, E3 e E4 homologadas em 26/10/2026 e em
  produção. A Revisão 2 (aprovada em 27/10/2026) separou a **edição** (revista)
  do **ciclo de estudo** (uso), com data por lição, regra mais exceções e rótulo
  público por período — ver [planos/REVISAO_2_CICLOS.md](planos/REVISAO_2_CICLOS.md).
  A **E5 (ciclos de estudo e calendário)** foi mergeada (squash `a66add8`) e
  publicada em produção em 27/10/2026, com CI verde. O reset do schema foi
  aplicado no primeiro acesso e a produção estava sem conteúdo EBD
  (`/api/ebd/cycles` responde lista vazia; `/api/ebd/quarters` responde 404).
  Falta a **homologação manual em produção**: criar a edição **a partir do JSON**,
  enviar o PDF ao bucket `ebd` real, importar as 13 lições, montar a agenda,
  publicar o ciclo e rodar o Lighthouse. O bucket `ebd` e as credenciais
  Supabase precisam estar configurados na Vercel. Roteiro em
  [planos/E5_HOMOLOGACAO.md](planos/E5_HOMOLOGACAO.md). A **E6** (homologação e
  publicação do ciclo) segue pendente e depende do ciclo completo da turma
  Adultos, do aceite do responsável, da autorização da editora referenciada e do
  teste de acessibilidade (NVDA/TalkBack). A extração das 13 lições é
  reproduzível por `scripts/ebd/extract-quarter.py`; o PDF e o JSON não são
  versionados. `/ebd` nasce com `noindex` em meta/header e fora do sitemap. A
  Rev. 3 da proveniência editorial foi implementada e publicada em 27/10/2026
  (PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash
  `7695173`), com CI verde e smoke de produção aprovado. A edição órfã
  **2026/4/Adultos** (`cmvqucvhr00008o0q1h8ikx7v`) e o PDF do bucket foram
  removidos pelo responsável em 27/10/2026; a questão e as evidências estão em
  [planos/E5_PROVENIENCIA_EDITORIAL.md](planos/E5_PROVENIENCIA_EDITORIAL.md) §17.
  Plano em [planos/PLANO_EBD_DIGITAL.md](planos/PLANO_EBD_DIGITAL.md),
  diagnóstico em [planos/E1_DIAGNOSTICO_EXTRACAO.md](planos/E1_DIAGNOSTICO_EXTRACAO.md),
  checklist da E2 em [planos/E2_CHECKLIST_WCAG.md](planos/E2_CHECKLIST_WCAG.md) e
  configuração de Storage em
  [planos/E4_STORAGE_SETUP.md](planos/E4_STORAGE_SETUP.md).
  **Decisões da proveniência tomadas em 27/10/2026 (Rev. 3):** a edição nasce
  do JSON; metadados editáveis antes do primeiro asset; período editorial
  generalizado depois da homologação, antes de links públicos; edição órfã
  removida por limpeza controlada; divergência exibida como nota informativa,
  sem bloquear. **As decisões 1, 2 e 5 estão implementadas e publicadas em
  27/10/2026 (PR #25, squash `7695173`; 211 testes, lint e build verdes; CI da
  `main` verde; smoke de produção aprovado). A decisão 4 (limpeza da órfã) foi
  concluída em 27/10/2026.** Próximo passo: concluir a homologação em produção;
  a generalização (3) fica para a próxima iteração. Detalhes em
  [planos/E5_PROVENIENCIA_EDITORIAL.md](planos/E5_PROVENIENCIA_EDITORIAL.md) §17.

## Concluídas

- **2026-10-25 → decidida em 2026-10-27 — Migração do portal para a VPS
  (Coolify).** Decidido manter **Vercel + Supabase** (opção A do comparativo
  [AVALIACAO_MIGRACAO_VPS.md](AVALIACAO_MIGRACAO_VPS.md)). Reavaliar o Vercel
  Pro se o teto de 12 funções virar bloqueio real; migração para a VPS somente
  como projeto separado, após segurança, backups com restauração testada, LGPD
  e rollback. Não é pré-requisito do EBD Digital.
