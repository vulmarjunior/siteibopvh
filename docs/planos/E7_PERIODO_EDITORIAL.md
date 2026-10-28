# Período editorial generalizado — PRD e plano de execução (E7)

> **Projeto:** siteibopvh (módulo `ebd`)
> **Status:** aprovado
> **Homologação:** pendente
> **Aprovado por:** Vulmar Junior em 2026-10-28
> **Revisão do plano:** 2 — refinamento técnico em 2026-10-28, após leitura de
> `ebd-schema.ts`, `provenance.ts`, tipos e chamadas do admin; escopo e objetivo
> inalterados
> **Planejado por:** OIKOS
> **Executor:** agente do projeto `siteibopvh`
> **Documento:** fonte da intenção; o fato é verificado no GitHub (commits, PRs, CI, deploy)
> **Origem:** decisão 3 de `E5_PROVENIENCIA_EDITORIAL.md` §16–17, ainda não iniciada

## 1. Problema

A edição da revista é hoje identificada obrigatoriamente por **ano + trimestre**
(`EbdEdition.year`, `EbdEdition.quarter`, ambos `Int` não nulos, com unique
`publisher + year + quarter + className`). Essa identificação vaza para o slug da
edição, para o slug permanente das lições e para o caminho do PDF no Storage.

Nem toda revista se apresenta em trimestre civil. Edições especiais, semestrais,
quadrimestrais, antigas ou sem data editorial clara não cabem em `1..4` e em um
ano. Para publicá-las hoje seria preciso **inventar** um trimestre — exatamente o
que a Revisão 2 proibiu ao separar a edição (proveniência) do ciclo de estudo
(uso).

O custo de corrigir agora é baixo: a área `/ebd` está com `noindex`, não há links
públicos compartilhados e os documentos indicam **uma única edição** cadastrada
(1T2022) — a contagem real deve ser conferida no banco antes do backfill. Depois
que links circularem, mudar slug e caminho passa a quebrar URLs.

## 2. Objetivo

Permitir que uma edição seja identificada por um **período editorial livre**
quando ano e trimestre não se aplicarem, sem alterar slugs, URLs ou caminhos de
PDF das edições já publicadas e sem deixar de aceitar o JSON v1.0.0.

## 3. Não-objetivos (fora de escopo)

- Alterar o modelo de ciclo de estudo, agenda ou exceções da E5.
- Renomear slugs, lições ou caminhos de PDF da edição 1T2022 já publicada.
- Mover ou reprocessar PDFs existentes no Storage.
- Remover o `noindex` ou compartilhar links públicos nesta entrega.
- Criar rota de exclusão de edição.
- Criar cadastro de editoras, turmas ou uma taxonomia fechada de períodos.
- Alterar os gates de esquema, hash e tamanho do import.
- Reescrever o extrator para templates antigos; apenas permitir que ele emita o
  contrato novo quando o período não for trimestral.
- Migrar edições históricas que não estejam no banco.
- Atualizar `agente.md` (guia técnico geral, desatualizado e sem o módulo EBD) ou
  o `scripts/ebd/seed-sample.ts` (obsoleto desde a E5; ver §8).

## 4. Usuários e casos de uso

| Quem | O que precisa fazer | Hoje |
|---|---|---|
| Responsável/admin | Cadastrar revista cuja capa não traz ano/trimestre civil, sem inventar dado | Precisa escolher ano e trimestre obrigatórios |
| Responsável/admin | Corrigir o período antes do primeiro PDF/lição/ciclo | Só corrige ano/trimestre/turma |
| Editor | Ver a proveniência editorial correta no admin e no rodapé público | Vê “Nº trimestre de AAAA” mesmo quando não é trimestre |
| Aluno | Continuar vendo o período do **ciclo** como rótulo principal | Já funciona; não muda |
| Agente executor | Gerar slug e caminho de PDF estáveis sem depender de ano/trimestre | Funções exigem `year` e `quarter` numéricos |

## 5. Requisitos

### Funcionais

- **RF1** — Criar edição com `editorialPeriod` (texto) e **sem** ano/trimestre.
  Pelo menos um dos dois deve existir: `(year + quarter)` ou `editorialPeriod`.
- **RF2** — Quando ano/trimestre existirem, continuam gravados e exibidos como
  proveniência estruturada; `editorialPeriod` é complementar e opcional.
- **RF3** — O admin e o rodapé público exibem `editorialPeriod` quando presente;
  na ausência dele, mantêm o rótulo atual “Nº trimestre de AAAA”.
- **RF4** — O rótulo principal do público continua sendo `cycle.periodLabel`; a
  mudança atinge apenas a linha de proveniência.
- **RF5** — A edição passa a ter `slug` persistido e único, usado como identidade
  estável e como base do slug permanente das lições. O unique composto antigo é
  **mantido como legado**, não removido nesta entrega.
- **RF6** — O slug é regenerado enquanto a edição for editável (sem PDF, lições
  ou ciclos) e **congelado** depois do primeiro asset.
- **RF7** — Edições existentes mantêm exatamente o slug atual das lições e o
  `storagePath` atual dos PDFs; o backfill usa o formato legado
  `AAAA-Nt-turma`.
- **RF8** — Novos uploads usam `ebd/<slug-da-edicao>/revista-vN.pdf`. Assets
  antigos não são movidos; o validador aceita os dois formatos.
- **RF9** — O import aceita `schema_version` **1.0.0** e **1.1.0**. No 1.1.0,
  `edition.year` e `edition.quarter` são opcionais e `edition.period` pode
  substituí-los; o 1.0.0 continua exigindo ano e trimestre. A validação normaliza
  os campos para `number | null` e `string | null`.
- **RF10** — O extrator pode emitir 1.1.0 com `--schema-version 1.1.0` e
  `--period`; sem essas flags, continua emitindo 1.0.0.
- **RF11** — Período, ano, trimestre e turma continuam editáveis apenas antes do
  primeiro PDF/lição/ciclo; depois, a API responde 409.
- **RF12** — Divergência entre JSON e edição continua como nota informativa, sem
  bloquear o import; o período entra na comparação.
- **RF13** — A lista de edições ordena por ano/trimestre quando presentes e
  coloca as edições só de período ao final, por data de criação.
- **RF14** — O schema de produção é atualizado pelo `ensureEbdSchema` em runtime,
  de forma idempotente, sem drop de tabela e sem perder a edição, as lições, o
  ciclo ou os assets existentes.
- **RF15** — Os tipos públicos e administrativos expõem `slug`,
  `editorialPeriod` e `year`/`quarter` anuláveis; todos os pontos que exibem
  proveniência usam o mesmo rótulo.
- **RF16** — A checagem de duplicidade na criação passa a usar o slug; o unique
  composto antigo permanece como proteção legada para edições com ano/trimestre.

### Não funcionais

- **RNF1** — Compatibilidade: nenhuma URL pública, slug de lição ou caminho de
  PDF existente muda.
- **RNF2** — Upgrade idempotente em banco existente: adicionar colunas, fazer
  backfill, só então exigir `slug NOT NULL` e `UNIQUE`; o unique composto antigo
  é preservado. Banco novo nasce já no formato final.
- **RNF3** — Colisão de slug é resolvida com sufixo numérico na criação
  (`-2`, `-3`), como já ocorre com o slug do ciclo.
- **RNF4** — `/ebd`, lições e APIs continuam com `noindex, nofollow` e fora do
  sitemap durante toda a entrega.
- **RNF5** — Cobertura de testes para v1.0.0, v1.1.0, edição só de período,
  backfill, geração de slug/caminho, upgrade de schema e admin.
- **RNF6** — Nenhum segredo, PDF ou JSON de conteúdo é versionado.
- **RNF7** — Falha no upgrade de schema não pode ser silenciosa: o erro deve
  aparecer no log e impedir a requisição de seguir com schema parcial.
- **RNF8** — O código anterior continua compatível com o schema novo durante a
  janela de rollback: ano/trimestre permanecem preenchidos e o índice composto
  antigo continua existindo.

## 6. Decisões estruturantes

| # | Decisão | Escolha proposta | Por que não a alternativa |
|---|---|---|---|
| 1 | Identidade da edição | `EbdEdition.slug` persistido e `UNIQUE`; unique composto antigo mantido como legado | Remover o índice antigo quebraria o código anterior num rollback |
| 2 | Formato do período | `editorialPeriod` texto livre para exibição; sem enum de trimestre | Enum não cobre edição especial, semestre ou material sem data |
| 3 | Contrato JSON | 1.1.0 com `edition.period` opcional e ano/trimestre opcionais; 1.0.0 aceito | Subir para 2.0.0 quebraria o extrator e os consumidores atuais |
| 4 | Caminho do PDF | Novos uploads em `ebd/<slug>/revista-vN.pdf`; antigos intactos | Reprocessar o bucket quebraria o PDF público da 1T2022 |
| 5 | Congelamento do slug | Regenera enquanto editável; congela no primeiro asset | Congelar na criação impediria corrigir metadados antes do upload |
| 6 | Ordenação | Ano/trimestre desc; sem ano ao final por `createdAt` | `NULLS FIRST` do PostgreSQL jogaria edições sem ano para o topo |
| 7 | Caminho de schema em produção | `ensureEbdSchema` em runtime, com migration Prisma equivalente para paridade | A Vercel não executa migrations; `CREATE TABLE IF NOT EXISTS` não altera tabela existente |
| 8 | Rollback | Manter colunas antigas preenchidas e o índice composto; reverter só o código | Um schema irreversível impediria voltar atrás com segurança |

## 7. Entregas

| ID | Entrega | Critério de aceite (verificável) | Status | Evidência |
|---|---|---|---|---|
| E7.1 | Modelo, upgrade de schema e backfill | `EbdEdition` com `slug` único, `editorialPeriod` e `year`/`quarter` anuláveis; unique composto antigo preservado; `ensureEbdSchema` atualiza banco existente sem drop, com backfill via `editionSlugFor` e `slug NOT NULL/UNIQUE` só depois; migration Prisma equivalente; testado em banco com o schema atual (não só vazio); contagem de edições conferida antes do backfill; autorização específica para alterar schema/banco registrada | planejado | |
| E7.2 | Contrato JSON v1.1 e proveniência | `validateEbdImport` aceita 1.0.0 e 1.1.0; 1.1.0 aceita `(year + quarter)` ou `period`; campos normalizados para `number | null`; `editionDivergences` compara período e lida com nulos; extrator emite 1.1.0 sob flag; testes cobrem os dois contratos | planejado | |
| E7.3 | Slug, caminho de PDF, tipos e admin | Edição nasce do JSON com período; slug gerado/regenerado enquanto editável e congelado no primeiro asset; lições usam o slug persistido; novos PDFs em `ebd/<slug>/`; `editionLabel` aceita ano/trimestre nulos e período; tipos públicos/admin, selects e mappers atualizados; admin exibe e edita o período; PATCH aceita nulos; lista ordena como RF13 | planejado | |
| E7.4 | Compatibilidade, testes e homologação | 1T2022 mantém slug, URLs, lições e caminho do PDF; edição sintética só de período é criada, importada e publicada em preview; v1.0.0 continua importando; `noindex` reconferido por header e DOM; testes, lint, build e CI verdes; roteiro de homologação executado e aceite registrado | planejado | |

**Vocabulário de status:** `planejado` → `em execução` → `implementado` → `testado` → `homologado` → `publicado`. Também `bloqueado` e `abandonado`.

**Regra:** cada transição exige evidência (commit, PR, run de CI, deploy,
homologação). Entrega sem evidência não sobe de status.

### 7.1 Arquivos impactados (mapa de mudança)

| Arquivo | Mudança |
|---|---|
| `prisma/schema.prisma` | `EbdEdition.slug @unique`, `editorialPeriod`, `year`/`quarter` opcionais; manter `@@unique` composto como legado |
| `prisma/migrations/20261028120000_ebd_editorial_period/migration.sql` | ALTERs, backfill e índices equivalentes ao runtime; **sem drop** de tabela |
| `src/api/ebd-schema.ts` | **Crítico:** upgrade idempotente do schema em produção; colunas, backfill, índices e `NOT NULL`; erro visível |
| `src/lib/ebd/import.ts` | União de `schema_version`, campos opcionais, normalização, slug com período |
| `src/lib/ebd/provenance.ts` | Metadados anuláveis, `editorialPeriod`, divergência de período, `quarterLabel` com nulo |
| `src/lib/ebd/storage.ts` | `buildPdfStoragePath(slug, version)`, regex aceitando caminho legado e novo, `createUploadTarget` por slug |
| `src/lib/ebd/content.ts` | `editionLabel(year, quarter, period?)` com fallback |
| `src/types/ebd.ts` | `EbdEditionRef` com `slug`, `editorialPeriod` e ano/trimestre anuláveis |
| `src/types/ebd-admin.ts` | `EbdAdminEditionRef` idem; respostas do admin refletem os novos campos |
| `src/api/public/ebd.ts` | `editionSelect`, `toEditionRef` e payload público com período |
| `src/api/admin/ebd.ts` | `editionRefSelect`, POST/PATCH por slug, caminho do PDF, import por slug, ordenação, checagem de duplicidade |
| `src/pages/admin/AdminEbdPage.tsx` | Textos v1.0.0/v1.1.0, prévia com período, lista com rótulo |
| `src/pages/admin/AdminEbdEditionPage.tsx` | Campo de período, validação condicional, formulário de metadados, textos de import |
| `src/pages/admin/AdminEbdCyclePage.tsx` | Rótulo de proveniência |
| `src/pages/admin/AdminEbdLessonPage.tsx` | Rótulo de proveniência |
| `src/pages/ebd/EbdHomePage.tsx` | Rodapé de proveniência |
| `src/pages/ebd/EbdLessonPage.tsx` | Rodapé e cabeçalho de proveniência |
| `src/lib/ebd/__tests__/import.test.ts`, `storage.test.ts`, `content.test.ts` | Novos contratos, caminhos e rótulos |
| `src/api/admin/__tests__/ebd.test.ts` | Criação/edição com período, nulos, slug e 409 |
| `src/api/public/__tests__/` (se existir) | Payload público com período |
| `scripts/ebd/extract-quarter.py` | Flags `--schema-version` e `--period` |
| `scripts/ebd/README.md` | Documentar v1.1.0 e período |
| `scripts/ebd/seed-sample.ts` | **Obsoleto** desde a E5 (usa `ebdQuarter`); não usar nem tomar como referência |

### 7.2 Matriz de compatibilidade (critério da E7.4)

| Caso | Resultado esperado |
|---|---|
| Edição 1T2022 existente | Slug `2022-1t-adultos`; lições `2022-1t-adultos-licao-01..13`; PDF v1 em `ebd/2022/1/adultos/revista-v1.pdf`; rodapé “1º trimestre de 2022” |
| Nova edição só de período | Slug `3o-trimestre-de-2010-adultos`; lições com esse prefixo; PDF em `ebd/3o-trimestre-de-2010-adultos/revista-v1.pdf`; rodapé com o período livre |
| JSON v1.0.0 | Importa como hoje, exigindo ano e trimestre |
| JSON v1.1.0 com ano/trimestre | Importa como o 1.0.0, com período opcional |
| JSON v1.1.0 só com período | Importa; edição criada sem ano/trimestre |
| Metadados corrigidos antes do 1º asset | Slug é regenerado; nada público muda |
| Metadados alterados depois do 1º asset | API responde 409; slug e caminho permanecem |
| Rollback do código após o upgrade | Código anterior continua lendo a 1T2022; o índice composto e os campos antigos continuam no banco |
| Upgrade em banco com o schema atual | Nenhuma tabela é dropada; edição, 13 lições, ciclo e PDF preservados |

## 8. Dependências e riscos

| Item | Tipo | Impacto | Mitigação |
|---|---|---|---|
| `ensureEbdSchema` é o caminho real de produção | Risco crítico | `CREATE TABLE IF NOT EXISTS` não adiciona colunas em banco existente; a API quebraria com o schema antigo | Bloco de upgrade explícito, testado contra o schema atual; migration Prisma equivalente |
| Backfill do slug | Risco | Unique falha se houver slug repetido ou caractere não tratado | Backfill via `editionSlugFor` (mesma função do runtime), conferência de contagem e dry-run antes do `NOT NULL` |
| Rollback | Risco | Remover o índice composto impediria o código anterior de rodar; edições só de período não são compreendidas pelo código antigo | Manter o índice composto e os campos antigos; reverter apenas o código enquanto não houver edição só de período |
| `noindex` em SPA | Risco | O HTML estático de `/ebd` não traz `<meta name="robots">`; a proteção do shell depende do header | Conferir `X-Robots-Tag` e o DOM após JS na E7.4; não remover o header |
| PATCH com ano/trimestre nulos | Risco | Validação atual exige `year`/`quarter` sempre e rejeitaria edição só de período | Tratar `null`/vazio explicitamente e exigir `(year + quarter)` ou período |
| `editionLabel` em 9 pontos | Risco | Assinatura nova quebrar telas públicas e admin | Atualizar todos os call sites e o teste de conteúdo |
| Tipos públicos e administrativos | Risco | `year`/`quarter` deixam de ser `number`; selects e mappers quebram | Atualizar `EbdEditionRef`, `EbdAdminEditionRef`, `editionSelect`, `editionRefSelect` e `toEditionRef` |
| Ordenação com nulos | Risco | Edições sem ano aparecem no topo | `nulls: 'last'` ou ordenação em memória |
| Validador de caminho do PDF | Risco | Upload novo recusado pela regex antiga | Aceitar os dois formatos e testar ambos |
| Erro silencioso no `ensure` | Risco | API segue com schema parcial | RNF7: log e falha visível, sem engolir o erro |
| `scripts/ebd/seed-sample.ts` | Dependência obsoleta | Referencia `prisma.ebdQuarter`, removido na E5; não deve ser usado | Atualização/remoção fora de escopo |
| `agente.md` desatualizado | Dependência documental | Guia técnico é de 04/10, não menciona EBD e ainda cita Netlify | Usar planos e código como fonte; atualização fora de escopo |
| Ambiente local sem credenciais | Dependência | Homologação do admin não roda nesta máquina | Implementar e testar por CI; homologar na máquina com sessão e bucket |
| Escopo do período “livre” | Risco | Virar taxonomia sem critério | Texto livre com validação de tamanho; sem enum, sem catálogo |
| Contagem de edições não verificada no banco | Risco | O plano assume uma edição; pode haver resíduo | Conferir `SELECT count(*)` antes do backfill; registrar o número |

## 9. Gates

1. **Plano aprovado** — aprovação datada registrada em 28/10/2026.
2. **Autorização de schema/banco** — `AGENTS.md` exige autorização explícita e
   específica para migration e alteração de banco; registrar antes da E7.1.
3. **Implementação** — uma entrega por branch, começando pela E7.1.
4. **Teste** — CI verde, testes de compatibilidade e upgrade em banco com o
   schema atual, não apenas banco vazio.
5. **Homologação** — execução da matriz de compatibilidade e aceite do responsável.
6. **Publicação** — autorização separada; deploy não é homologação.
7. **`noindex`** — só é removido depois da E7 homologada e de decisão explícita
   sobre links públicos; esta entrega não o remove.

## 10. Diário de execução (append-only)

| Data | Entrega | O que foi feito | Evidência | Desvio |
|---|---|---|---|---|
| 2026-10-28 | E7 (planejamento) | PRD e plano propostos pelo OIKOS a partir da decisão 3 da proveniência editorial; nenhum código alterado | Este documento; `E5_PROVENIENCIA_EDITORIAL.md` §16–17 | Aguardando aprovação do responsável |
| 2026-10-28 | E7 (aprovação) | Plano aprovado pelo responsável; E7.1 passa a ser a próxima entrega, ainda sem código | Este documento; aprovação registrada no cabeçalho | Implementação não iniciada |
| 2026-10-28 | E7 (revisão de lacunas) | Leitura de `AGENTS.md`, `agente.md`, `ebd-schema.ts`, `provenance.ts`, tipos e chamadas do admin; corrigido o caminho real de schema (runtime), preservado o índice composto para rollback e ampliado o mapa de arquivos; escopo inalterado | Este documento; commit de revisão | Nenhum código alterado |

## 11. Verificações do OIKOS (append-only)

| Data | Aderência | Observação |
|---|---|---|
| 2026-10-28 | não avaliada | Plano proposto; a aderência será verificada após a implementação, comparando as entregas com PRs, CI e produção |
| 2026-10-28 | não avaliada | Revisão de lacunas: o plano agora reflete o schema runtime, os tipos e os call sites reais; a execução ainda não começou |
