# Planos — regras

Fonte: `templates/PLANO_EXECUCAO.md` do OIKOS. O plano é a fonte da intenção; o
fato é verificado no GitHub (commits, PRs, CI, deploy).

- Nome do arquivo: `PLANO_<tema>.md`.
- Vocabulário de status: `proposto`, `aprovado`, `em execução`, `implementado`,
  `homologado`, `publicado`, `sucedido`, `abandonado`.
- Cada transição exige evidência; entrega sem evidência não sobe de status.
- Plano encerrado vai para `docs/archive/planos_concluidos/` e sai do
  `INDEX.md` ativo.
- Nunca arquivar plano com homologação pendente.
- Ao mover, atualizar o índice de ativos, o índice do arquivo e as referências
  ao caminho antigo.

Os planos anteriores a este protocolo permanecem como documentos históricos
neste diretório e não são migrados em massa.
