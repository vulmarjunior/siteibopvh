# Master Plan — Portal IBOPVH

## Missão

Portal institucional da Igreja Batista Olaria (Porto Velho/RO), com conteúdo,
hotsites, inscrições e área administrativa.

## Estado atual

- Ciclo de vida: produção
- Publicação: Vercel, `https://www.ibopvh.com.br`
- Banco: PostgreSQL (Supabase)
- Homologação: EBD Digital — E2, E3 e E4 homologadas; E5 publicada em 27/10/2026, homologação pendente; decisões da proveniência editorial tomadas (Rev. 3)
- Verificado em: 2026-10-27

## Princípios e limites

- Conteúdo institucional e dados de inscrições são sensíveis; não expor em logs
  ou memória.
- Não duplicar arquitetura, stack ou histórico: `agente.md` e
  `docs/CHANGELOG.md` são as fontes.
- Alterações de produção exigem autorização específica.

## Próximo passo

Implementar a **Rev. 3 da proveniência editorial da E5**: a edição nasce do
JSON, os metadados são editáveis antes do primeiro asset e a divergência é
exibida como nota informativa, sem bloquear. Depois, limpar a edição órfã em
janela autorizada e rodar o roteiro operador de
`docs/planos/E5_HOMOLOGACAO.md` em produção. A generalização do período
editorial (opção D) fica para a iteração seguinte, antes de links públicos.
