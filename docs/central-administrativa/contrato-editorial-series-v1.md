# Contrato editorial de séries — versão 1

## Finalidade

Este contrato separa o frontend público das tabelas Prisma. A API normalizada é a única fronteira pública da plataforma editorial. A Parousia foi a primeira integração validada; novos hotsites devem consumir o kit oficial de séries.

## Entidades

- `EditorialSeries`: identidade, período, estado, capacidades e configurações controladas.
- `EditorialSection`: agrupamento ordenado de mensagens.
- `EditorialMessage`: ordem, título, data, texto bíblico e estado obrigatórios; demais campos opcionais.
- `EditorialMedia`: vídeo, áudio ou imagem por URL.
- `EditorialMaterial`: material complementar por URL.
- `EditorialReadingPlan` e `EditorialReadingDay`: roteiro de leitura ordenado.

## Estados e publicação

- Série pública: `PUBLISHED` ou `ENDED`, com `publishedAt` no passado.
- Mensagem disponível: `PUBLISHED` e `scheduledFor` no passado.
- Próxima mensagem: primeira mensagem `SCHEDULED` ou `PUBLISHED` com data futura.
- `DRAFT` e `ARCHIVED` nunca aparecem como conteúdo disponível na API pública.

## Capacidades e extensões

`capabilities` declara recursos permitidos (`video`, `audio`, `materials`, `readingPlan`, `sections`). `customFields` aceita apenas extensões previamente reconhecidas pelo serviço/editor; não é um criador arbitrário de esquema.

## API pública

- `GET /api/series`: lista séries públicas.
- `GET /api/series/:slug`: entrega série, seções, mensagem atual, próxima mensagem e mensagens disponíveis.

Campos opcionais são retornados como `null`, string vazia ou lista vazia de maneira estável. Vídeos do YouTube recebem `youtubeId`, URL de incorporação e thumbnail automática quando possível; na ausência de imagem, usa-se a thumbnail padrão da série.

## Kit oficial do frontend

- importação: `src/lib/series-kit`;
- `seriesClient.get(slug)` para uso fora de componentes React;
- `useSeries(slug)` para componentes React;
- tipos `PublicSeries`, `PublicSeriesMessage` e relacionados;
- `getSeriesLifecycle` para os estados `prelaunch`, `active` e `ended`;
- exemplo em `src/examples/series/MinimalSeriesPage.tsx`.

O frontend nunca deve importar Prisma, o repositório editorial do servidor ou arquivos JSON de mensagens.

## Extensões específicas

Campos particulares de uma série devem ser declarados em interfaces TypeScript e fornecidos pelos genéricos de `PublicSeries<TSeriesFields, TMessageFields>`. Uma extensão não pode alterar o significado dos campos comuns nem criar outra fonte editorial. Se o contrato não comportar uma necessidade real, registrar uma decisão arquitetural antes de criar tabelas, JSON ou endpoints paralelos.
