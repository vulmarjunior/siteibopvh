# Master Plan — Portal IBOPVH

## Missão

Portal institucional da Igreja Batista Olaria (Porto Velho/RO), com conteúdo,
hotsites, inscrições e área administrativa.

## Estado atual

- Ciclo de vida: produção
- Publicação: Vercel, `https://www.ibopvh.com.br`
- Banco: PostgreSQL (Supabase)
- Homologação: EBD Digital — E2, E3 e E4 homologadas; **E5 homologada em 27/10/2026**; **E6 publicada em 27/10/2026** com o ciclo oficial `adultos-2026-11-29` (29/11/2026, domingo, sem exceções, 13 lições até 21/02/2027); decisão 3 pendente
- Verificado em: 2026-10-27

## Princípios e limites

- Conteúdo institucional e dados de inscrições são sensíveis; não expor em logs
  ou memória.
- Não duplicar arquitetura, stack ou histórico: `agente.md` e
  `docs/CHANGELOG.md` são as fontes.
- Alterações de produção exigem autorização específica.

## Próximo passo

A **E6 foi publicada em 27/10/2026**: ciclo `adultos-2026-11-29`, início
29/11/2026, domingo, sem exceções, 13 lições até 21/02/2027, período Novembro de
2026 a fevereiro de 2027. A **E5** também está homologada. A próxima decisão é a
**decisão 3** — generalização do período editorial (opção D) — antes de remover
o `noindex` ou compartilhar links públicos.
