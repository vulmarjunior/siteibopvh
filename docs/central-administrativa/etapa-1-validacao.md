# Central Administrativa IBO — Etapa 1: validação

Data: 8 de agosto de 2026.

## Escopo implementado

- registro central tipado dos módulos em `src/config/siteModules.ts`;
- Parousia, Veredas e Relógio marcados como ativos;
- Páscoa/Tenebras e Molda-nos marcados como arquivados;
- EBF 2026 marcada como encerrada;
- páginas públicas de encerramento para Páscoa e Molda-nos;
- remoção do slide da EBF na home;
- bloqueio de novas inscrições da EBF no backend com HTTP `410 Gone`;
- preservação das páginas, componentes, assets, galeria e dados históricos;
- preservação temporária do painel administrativo histórico da EBF.

## Comportamentos verificados

| Comportamento | Resultado |
|---|---|
| Apenas Parousia, Veredas e Relógio estão `ACTIVE` | Aprovado por teste |
| Módulos encerrados não podem ser divulgados no registro | Aprovado por teste |
| Operações públicas da EBF estão fechadas | Aprovado por teste e guarda no servidor |
| Páscoa e Molda-nos preservam acesso direto | Página de encerramento |
| EBF preserva página histórica e galeria | Preservado |
| Build de produção | Aprovado |
| ESLint | Aprovado sem avisos |
| Testes | 9 arquivos e 75 testes aprovados |

## Observações

- Nenhuma tabela ou registro de banco foi alterado.
- Nenhum hotsite ou asset histórico foi excluído.
- A administração histórica da EBF ainda usa a autenticação legada. Sua migração para o login global pertence às etapas posteriores.
- O registro de módulos permanece em código nesta etapa; a persistência administrável pertence à Etapa 3.

## Validação manual solicitada

Antes de encerrar a etapa, conferir em preview ou ambiente local:

1. home sem divulgação da EBF, Páscoa ou Molda-nos;
2. `/pascoa` com página de encerramento;
3. `/moldanos` com página de encerramento;
4. `/ebf` com histórico e galeria preservados;
5. Parousia, Veredas e Relógio funcionando normalmente;
6. tentativa de `POST /api/ebf/registrations` recebendo HTTP 410.

