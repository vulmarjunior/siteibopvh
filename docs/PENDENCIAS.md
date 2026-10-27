# Pendências

Fonte oficial das pendências deste projeto.

## Em aberto

- **2026-10-25 — Avaliar migração do portal para a VPS (Coolify), incluindo banco
  no PostgreSQL da VPS.** Comparativo em
  [AVALIACAO_MIGRACAO_VPS.md](AVALIACAO_MIGRACAO_VPS.md). Decisão pendente; não é
  pré-requisito do módulo EBD Digital. Envolve segurança da VPS, Auth/Storage do
  Supabase, backups e capacidade.
- **2026-10-25 — EBD Digital: plano aprovado em 26/10/2026, E1 concluída na
  edição real 1T2022 e E2/E3/E4 homologadas em 26/10/2026.** E4 — importação e
  publicação no admin — homologada em 26/10/2026 (branch
  `feat/ebd-e4-admin-importacao`, commits `1264dee`, `425048c` e `d4812ee`).
  **Revisão 2 do plano aprovada em 27/10/2026:** a edição da revista deixa de ser
  a identidade do bloco de lições e nasce o **ciclo de estudo** (uso), com data
  por lição, regra mais exceções e rótulo público por período — ver
  [planos/REVISAO_2_CICLOS.md](planos/REVISAO_2_CICLOS.md). Com isso, E5 —
  **ciclos de estudo e calendário** — está aprovada e **não implementada**, e a
  publicação passou a ser a **E6**. Próximo passo: implementar a E5 no executor;
  a E6 depende do bucket `ebd` real no Supabase Storage. A extração completa é
  reproduzível por `scripts/ebd/extract-quarter.py`; o JSON draft com 13 lições
  foi gerado localmente em 27/10/2026 e o texto/PDF não são versionados. A
  autorização da editora foi confirmada em 26/10/2026 para uso não comercial e
  interno; a área `/ebd` deve nascer com `noindex` em meta/header e fora do
  sitemap. O PDF de origem está em `materiais/ebd/2022/1T/adultos/` (local,
  ignorado pelo Git; SHA-256 conferido). A edição é 1T2022, com template anterior
  ao das amostras de 2024. Não é pré-requisito da decisão sobre a VPS. Plano em
  [planos/PLANO_EBD_DIGITAL.md](planos/PLANO_EBD_DIGITAL.md), diagnóstico em
  [planos/E1_DIAGNOSTICO_EXTRACAO.md](planos/E1_DIAGNOSTICO_EXTRACAO.md),
  checklist da E2 em [planos/E2_CHECKLIST_WCAG.md](planos/E2_CHECKLIST_WCAG.md)
  e configuração de Storage em
  [planos/E4_STORAGE_SETUP.md](planos/E4_STORAGE_SETUP.md).

## Concluídas

Nenhuma pendência concluída registrada.
