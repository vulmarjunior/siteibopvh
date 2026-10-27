# Master Plan — Portal IBOPVH

## Missão

Portal institucional da Igreja Batista Olaria (Porto Velho/RO), com conteúdo,
hotsites, inscrições e área administrativa.

## Estado atual

- Ciclo de vida: produção
- Publicação: Vercel, `https://www.ibopvh.com.br`
- Banco: PostgreSQL (Supabase)
- Homologação: EBD Digital — E2, E3 e E4 homologadas; E5 pendente
- Verificado em: 2026-10-26

## Princípios e limites

- Conteúdo institucional e dados de inscrições são sensíveis; não expor em logs
  ou memória.
- Não duplicar arquitetura, stack ou histórico: `agente.md` e
  `docs/CHANGELOG.md` são as fontes.
- Alterações de produção exigem autorização específica.

## Próximo passo

Retomar a **E5 — publicação do trimestre da EBD** em outra máquina, com o bucket
`ebd` real configurado no Supabase Storage. A branch
`feat/ebd-e4-admin-importacao` reúne E2, E3 e E4; não houve merge em `main` nem
deploy de produção.
