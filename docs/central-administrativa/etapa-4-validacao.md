# Central Administrativa IBO — Etapa 4: validação

Data: 8 de agosto de 2026.

## Implementado

- contrato editorial versão 1 documentado e tipado;
- modelos de série, seção, mensagem, mídia, material e plano de leitura;
- estados e regras de publicação por data;
- capacidades configuráveis e campos personalizados controlados;
- serviço de domínio independente do Prisma;
- repositório Prisma isolado da API pública;
- normalização de URLs do YouTube, embed e thumbnail automática;
- fallbacks previsíveis para campos e coleções ausentes;
- API pública em `/api/series` e `/api/series/:slug`;
- série fictícia `Caminhos da Graça` criada somente na homologação.

## Verificações

| Verificação | Resultado |
|---|---|
| Prisma validate | Aprovado |
| Testes | 11 arquivos e 85 testes aprovados |
| TypeScript e build | Aprovados |
| Migração no Supabase | Aplicada somente em homologação |
| Série fictícia | 2 mensagens: 1 atual e 1 próxima |
| Thumbnail do YouTube | Normalizada automaticamente |
| RLS | Habilitado nas sete novas tabelas |

## Alertas dos advisors

Os advisors não apontaram erro crítico novo. Os avisos das tabelas editoriais são informativos: RLS habilitado sem políticas públicas é intencional porque o acesso ocorre exclusivamente pelo servidor Prisma. Índices recém-criados aparecem como não utilizados por ainda não haver tráfego significativo.

Permanece um alerta geral do projeto de homologação sobre proteção contra senhas vazadas desabilitada; não foi alterado nesta etapa.

## Validação do responsável

Revisar o objeto fictício em `/api/series/caminhos-da-graca` e confirmar se os campos editoriais atendem ao formato esperado antes da criação do painel da Etapa 5.

## Limite preservado

A Parousia continua lendo `sermoes.json`. Nenhum dado real foi migrado e nenhuma tabela de produção foi alterada.
