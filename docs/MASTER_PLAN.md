# Master Plan — Portal IBOPVH

## Missão

Portal institucional da Igreja Batista Olaria (Porto Velho/RO), com conteúdo,
hotsites, inscrições e área administrativa.

## Estado atual

- Ciclo de vida: produção
- Publicação: Vercel, `https://www.ibopvh.com.br`
- Banco: PostgreSQL (Supabase)
- Homologação: EBD Digital — E2, E3 e E4 homologadas; E5 publicada em 27/10/2026, **homologação funcional concluída em 27/10/2026** e pendentes as verificações manuais de acessibilidade/LCP; Rev. 4 da proveniência editorial publicada (PR #25, squash `7695173`) e edição órfã removida em 27/10/2026
- Verificado em: 2026-10-27

## Princípios e limites

- Conteúdo institucional e dados de inscrições são sensíveis; não expor em logs
  ou memória.
- Não duplicar arquitetura, stack ou histórico: `agente.md` e
  `docs/CHANGELOG.md` são as fontes.
- Alterações de produção exigem autorização específica.

## Próximo passo

A **Rev. 4 da proveniência editorial da E5** (decisões 1, 2 e 5) foi publicada
em 27/10/2026 pelo PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25)
(squash `7695173`), com CI verde e smoke aprovado; a edição órfã foi removida e
a **homologação funcional em produção** foi concluída em 27/10/2026. Falta
concluir as verificações manuais de teclado, reflow 320–360 px,
NVDA/TalkBack e LCP mobile do bloco 10 de `docs/planos/E5_HOMOLOGACAO.md`,
declarar a E5 homologada e seguir para a E6. A generalização do período
editorial (decisão 3) fica para a iteração seguinte, antes de links públicos.
