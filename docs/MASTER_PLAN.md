# Master Plan — Portal IBOPVH

## Missão

Portal institucional da Igreja Batista Olaria (Porto Velho/RO), com conteúdo,
hotsites, inscrições e área administrativa.

## Estado atual

- Ciclo de vida: produção
- Publicação: Vercel, `https://www.ibopvh.com.br`
- Banco: PostgreSQL (Supabase)
- Homologação: EBD Digital — E2, E3 e E4 homologadas; **E5 homologada em 27/10/2026**, com Rev. 4 da proveniência publicada (PR #25, squash `7695173`) e edição órfã removida; **E6 (publicação do ciclo oficial) pendente**
- Verificado em: 2026-10-27

## Princípios e limites

- Conteúdo institucional e dados de inscrições são sensíveis; não expor em logs
  ou memória.
- Não duplicar arquitetura, stack ou histórico: `agente.md` e
  `docs/CHANGELOG.md` são as fontes.
- Alterações de produção exigem autorização específica.

## Próximo passo

A **E5 foi homologada em 27/10/2026**, com a Rev. 4 da proveniência publicada
(PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), squash `7695173`)
e a edição órfã removida. Agora começa a **E6**: definir o calendário real da
turma Adultos (início, dia da semana e exceções), revisar o conteúdo e publicar
o ciclo oficial. A generalização do período editorial (decisão 3) fica para a
iteração seguinte, antes de links públicos.
