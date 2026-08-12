# Central Administrativa IBO — Etapa 6: validação

Data: 8 de agosto de 2026.

## Produção

Em 12 de agosto de 2026, a série real foi importada no projeto `ibopvh-producao` pelo plugin oficial do Supabase. A verificação posterior confirmou 23 mensagens, 12 mídias, 23 planos, 138 dias de leitura e nenhuma divergência em relação à fonte histórica. Relógio, Veredas e Parousia continuaram respondendo HTTP 200.

## Implementado

- importador idempotente `npm run import:parousia`;
- mapeamento das 23 mensagens, vídeos, artes e 138 leituras;
- relatório automático de itens ausentes, extras e divergentes;
- segunda execução do importador sem duplicações;
- API editorial com programação completa, mensagem atual, próxima e disponíveis;
- adaptador tipado da API para os componentes atuais da Parousia;
- troca do frontend para a API editorial;
- fallback automático para `sermoes.json` quando a API falhar;
- marcador técnico `data-editorial-source` para identificar `api` ou `json`;
- URLs públicas, SEO e links existentes preservados.

## Resultado da comparação

| Item | Resultado |
|---|---|
| Mensagens no JSON | 23 |
| Mensagens no banco | 23 |
| Slugs únicos | 23 |
| Mensagens ausentes | 0 |
| Mensagens extras | 0 |
| Divergências | 0 |
| Mídias importadas | 12 |
| Leituras importadas | 138 |

## Verificações técnicas

- 12 arquivos e 88 testes aprovados;
- build de produção aprovado;
- mensagem atual: `o-preco-da-jornada`;
- próxima mensagem: `espalhados-mas-nao-perdidos`;
- seis mensagens disponíveis na data da validação;
- fallback mantém as 23 mensagens versionadas;
- produção não alterada.

## Validação manual pendente

1. abrir `/da-ascensao-a-parousia` e comparar a programação com a versão anterior;
2. abrir uma mensagem com vídeo e uma leitura semanal;
3. confirmar a mensagem atual e a próxima;
4. editar um campo não crítico da Parousia pelo painel e confirmar a atualização sem deploy;
5. informar qualquer diferença visual ou editorial encontrada.

## Limite preservado

Os e-mails continuam usando `sermoes.json`. Sua migração pertence à Etapa 7 e não foi antecipada.
