# Diagnóstico — lentidão da EBD Digital

**Data:** 2026-11-08
**Autor:** OIKOS (análise somente leitura)
**Estado:** diagnóstico concluído; correção não iniciada
**Escopo:** rotas públicas da EBD Digital em produção (`/ebd`, `/ebd/licao/:slug` e `/api/ebd/*`)
**Fontes:** medições em produção, código do repositório e configuração de deploy. Nenhuma alteração de código, schema, deploy ou dado foi feita.

## 1. Queixa e conclusão

A queixa é que a página demora muito para renderizar as lições. O conteúdo não é o problema: a resposta de uma lição tem **11,5 KB**. A demora está no tempo de resposta da API — a página fica no esqueleto de carregamento esperando o servidor.

O primeiro acesso após ociosidade pode levar **de 10 a 24 segundos**. Mesmo com a API já aquecida, a lição leva **3,3 a 3,9 segundos** para responder.

## 2. Medições em produção — 2026-11-08

| Requisição | Primeiro acesso (frio) | Acessos seguintes (quente) |
|---|---|---|
| `/api/ebd/cycles` | **24,18 s** | 1,49–1,60 s |
| `/api/ebd/lessons/2022-1t-adultos-licao-01` | — | **3,31–3,94 s** |
| `/api/ebd/search?q=Deus` | — | 1,69–2,30 s |
| `/api/modules` (outro módulo, mesma API) | **11,20 s** | 0,25 s |
| `/api/health` (sem banco) | — | 0,35 s |

Outras evidências:

- Região do Vercel: `X-Vercel-Id: gru1::iad1::...` — a borda atende em São Paulo, mas a função executa em `iad1` (Washington).
- Banco: `aws-0-sa-east-1.pooler.supabase.com` — Supabase em São Paulo.
- Cache: `Cache-Control: no-store` e `X-Vercel-Cache: MISS` nas rotas públicas da EBD.
- Bundle da página: `EbdLessonPage` com 13,4 KB; `react-vendor` com 163 KB. Não é o gargalo.
- Conteúdo da lição: 11.558 bytes. Não é o gargalo.

## 3. Causas

### 3.1. O primeiro acesso executa uma “arrumação” pesada do banco

`ensureEbdSchema()` roda como middleware antes de cada resposta e, em cada instância nova da função, executa **41 comandos sequenciais** ao banco (`src/api/ebd-schema.ts`). O módulo `criancas`, com 17 comandos, teve 11,2 s de primeiro acesso; a EBD, com 41, chega aos 24 s. O padrão está documentado em `dev-log.md` §“Auto-healing de schema em runtime”.

Como o portal tem pouco tráfego, a instância esfria com frequência e o primeiro visitante paga essa conta.

### 3.2. A função roda nos Estados Unidos e o banco está em São Paulo

Cada consulta atravessa o continente. A rota da lição faz **três consultas explícitas e sequenciais** (`src/api/public/ebd.ts:348,385,402`) e, com os relacionamentos que o Prisma carrega por padrão, o total chega a várias idas ao banco. Daí os 3,4 s mesmo com a API aquecida.

### 3.3. Nada fica em cache

As rotas públicas da EBD respondem com `Cache-Control: no-store` (`src/api/public/ebd.ts:171-173`). O mesmo conteúdo é buscado no banco a cada visita, inclusive ao voltar para uma lição já aberta. Esse conteúdo só muda quando alguém publica uma edição.

### 3.4. A página busca depois que o JavaScript carrega e não faz prefetch

`EbdLessonPage` faz o `fetch` no `useEffect` (`src/pages/ebd/EbdLessonPage.tsx:63-101`). Ao navegar de uma lição para outra, toda a espera se repete. O índice e as lições anterior/seguinte não são pré-carregados.

## 4. Risco adicional — schema destrutivo no caminho da requisição

`ensureEbdSchema()` contém um trecho que **apaga as tabelas da EBD** se detectar o modelo antigo (`quarterId`) — `src/api/ebd-schema.ts:39-47`. Hoje ele não dispara, mas o mesmo `DROP TABLE` está na migration canônica `prisma/migrations/20261027120000_ebd_editions_cycles/migration.sql`.

Com **13 lições publicadas em produção**, essa migration não pode ser executada como está: ela apagaria o conteúdo. Qualquer correção precisa criar uma migração nova, não destrutiva, ou registrar a migration existente como já aplicada após conferir o schema.

## 5. O que não é a causa

- O bundle da página ou o volume de JavaScript.
- O tamanho do conteúdo da lição (11,5 KB).
- O PDF: a página da lição só mostra o link; não carrega o arquivo.

## 6. Correções recomendadas, em ordem de impacto

| # | Correção | Efeito esperado | Esforço |
|---|---|---|---|
| 1 | Fixar a função em `gru1` no `vercel.json` (`"regions": ["gru1"]`) e redeployar | Lição quente de ~3,4 s para ~0,6–1,2 s | Baixo |
| 2 | Tirar o `ensureEbdSchema` do caminho da requisição: aplicar uma migração **nova e não destrutiva** no Supabase e remover o middleware | Primeiro acesso de 10–24 s para ~1–3 s | Médio |
| 3 | Cache no CDN para as rotas públicas da EBD (`s-maxage=300` + `stale-while-revalidate`) | Visitas repetidas quase instantâneas | Baixo |
| 4 | Reduzir a rota da lição a uma ou duas consultas em vez de várias | Corta mais ~1–2 s mesmo antes do item 1 | Médio |
| 5 | Prefetch do índice e das lições vizinhas no navegador | Navegação entre lições instantânea após a primeira | Baixo |

Sugestão de critérios de aceite para o plano de correção:

- primeiro acesso após ociosidade à lição abaixo de 3 s;
- lição com a função aquecida abaixo de 1 s;
- visita repetida atendida pelo CDN (`X-Vercel-Cache: HIT`);
- nenhum DDL no caminho da requisição;
- função e banco na mesma região (`gru1` / `sa-east-1`);
- busca da EBD abaixo de 1 s.

## 7. Limitações

- As medições foram feitas de uma máquina no Brasil, em 2026-11-08; a primeira medição de 24 s pode incluir o primeiro acesso do dia, mas o padrão de cold start foi confirmado em outro módulo (11,2 s) e no código.
- Não foram abertos o painel do Vercel, o Supabase nem o Coolify; a região e o cache foram lidos nos cabeçalhos das respostas de produção.
- Não foi executado nenhum comando de escrita, migração ou deploy.
