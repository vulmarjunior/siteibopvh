# Central Administrativa IBO — Etapa 5: validação

Data: 8 de agosto de 2026.

## Implementado

- lista de séries e estados na Central Administrativa;
- criação e edição de séries sem alteração de código;
- configuração de período, thumbnail e capacidades;
- programação antecipada de mensagens;
- edição semanal na mesma tela;
- mídias, áudio e materiais cadastrados por URL;
- plano de leitura com dias ordenados;
- estados de rascunho, agendamento, publicação e arquivamento;
- validação obrigatória de número, título, data e texto bíblico;
- publicação protegida pela permissão `series:publish`;
- preview pela API normalizada;
- auditoria de criação e atualização de séries e mensagens.

## Verificações técnicas

| Verificação | Resultado |
|---|---|
| Testes | 11 arquivos e 85 testes aprovados |
| TypeScript e build | Aprovados |
| API administrativa sem login | Bloqueada com HTTP 401 |
| API pública da série fictícia | Aprovada |
| Storage adicional | Não utilizado |
| Produção | Não alterada |

## Validação manual concluída

O responsável criou pelo painel a série `E disse Deus.` e cadastrou duas mensagens sem erros. A persistência foi confirmada diretamente no Supabase de homologação, assim como os registros de criação e atualização na auditoria.

### Roteiro utilizado

Em `/admin/series`:

1. criar uma série de teste;
2. cadastrar duas mensagens em datas diferentes;
3. manter uma como rascunho e agendar a outra;
4. adicionar um vídeo por URL, um material e duas leituras;
5. salvar, reabrir e confirmar os campos;
6. publicar somente depois de preencher os campos obrigatórios;
7. conferir o preview após publicar a série.

## Limite preservado

Não há upload de arquivos nem migração da Parousia. A etapa utiliza URLs para manter custo zero de Storage.
