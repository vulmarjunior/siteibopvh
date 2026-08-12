# Central Administrativa IBO — Etapa 11: kit oficial de séries

Data: 10 de agosto de 2026.

## Implementado

- tipos públicos estáveis e independentes do Prisma;
- cliente HTTP `createSeriesClient` e instância `seriesClient`;
- hook React `useSeries` com cancelamento de requisição e recarregamento;
- estados de carregamento, erro, ausência, pré-estreia, atividade e encerramento;
- extensões tipadas por genéricos para campos particulares;
- exemplo mínimo em `src/examples/series/MinimalSeriesPage.tsx`;
- checklist obrigatório em `kit-series-checklist.md`;
- contrato editorial atualizado para proibir fontes paralelas sem decisão arquitetural.

## Uso mínimo

```tsx
import { useSeries } from '../../lib/series-kit';

const result = useSeries('slug-da-serie');
if (result.status === 'loading') return <p>Carregando…</p>;
if (result.status !== 'ready') return <p>Série indisponível.</p>;
return <h1>{result.series.title}</h1>;
```

O desenvolvedor do hotsite precisa conhecer apenas o slug e o contrato público. Não precisa conhecer Prisma, nomes de tabelas ou autenticação administrativa.

## Validação técnica

- testes unitários do cliente e do ciclo de vida;
- compilação do exemplo mínimo;
- build integral do portal;
- nenhuma alteração de banco ou de dados publicada.

## Validação manual

Usar temporariamente o componente `MinimalSeriesPage` com uma série de teste publicada e conferir os estados descritos no checklist. O exemplo não possui rota pública deliberadamente; ele é uma referência de desenvolvimento, não uma nova página do portal.

