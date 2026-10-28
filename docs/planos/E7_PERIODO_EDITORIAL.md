# Período editorial generalizado — PRD e plano de execução (E7)

> **Projeto:** siteibopvh (módulo `ebd`)
> **Status:** aprovado
> **Homologação:** pendente
> **Aprovado por:** Vulmar Junior em 2026-10-28
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
públicos compartilhados e existe **uma única edição** cadastrada (1T2022). Depois
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
  estável e como base do slug permanente das lições.
- **RF6** — O slug é regenerado enquanto a edição for editável (sem PDF, lições
  ou ciclos) e **congelado** depois do primeiro asset.
- **RF7** — Edições existentes mantêm exatamente o slug atual das lições e o
  `storagePath` atual dos PDFs; o backfill usa o formato legado
  `AAAA-Nt-turma`.
- **RF8** — Novos uploads usam `ebd/<slug-da-edicao>/revista-vN.pdf`. Assets
  antigos não são movidos; o validador aceita os dois formatos.
- **RF9** — O import aceita `schema_version` **1.0.0** e **1.1.0**. No 1.1.0,
  `edition.year` e `edition.quarter` são opcionais e `edition.period` pode
  substituí-los; o 1.0.0 continua exigindo ano e trimestre.
- **RF10** — O extrator pode emitir 1.1.0 com `--schema-version 1.1.0` e
  `--period`; sem essas flags, continua emitindo 1.0.0.
- **RF11** — Período, ano, trimestre e turma continuam editáveis apenas antes do
  primeiro PDF/lição/ciclo; depois, a API responde 409.
- **RF12** — Divergência entre JSON e edição continua como nota informativa, sem
  bloquear o import.
- **RF13** — A lista de edições ordena por ano/trimestre quando presentes e
  coloca as edições só de período ao final, por data de criação.

### Não funcionais

- **RNF1** — Compatibilidade: nenhuma URL pública, slug de lição ou caminho de
  PDF existente muda.
- **RNF2** — Migração com backfill idempotente; o slug só vira `NOT NULL` e
  `UNIQUE` depois de todas as linhas preenchidas.
- **RNF3** — Colisão de slug é resolvida com sufixo numérico na criação
  (`-2`, `-3`), como já ocorre com o slug do ciclo.
- **RNF4** — `/ebd`, lições e APIs continuam com `noindex, nofollow` e fora do
  sitemap durante toda a entrega.
- **RNF5** — Cobertura de testes para v1.0.0, v1.1.0, edição só de período,
  backfill, geração de slug/caminho e admin.
- **RNF6** — Nenhum segredo, PDF ou JSON de conteúdo é versionado.

## 6. Decisões estruturantes propostas

| # | Decisão | Escolha proposta | Por que não a alternativa |
|---|---|---|---|
| 1 | Identidade da edição | `EbdEdition.slug` persistido, `UNIQUE`, com backfill do formato atual | Um unique composto com colunas nulas não impede duplicatas no PostgreSQL |
| 2 | Formato do período | `editorialPeriod` texto livre para exibição; sem enum de trimestre | Enum não cobre edição especial, semestre ou material sem data |
| 3 | Contrato JSON | 1.1.0 com `edition.period` opcional e ano/trimestre opcionais; 1.0.0 aceito | Subir para 2.0.0 quebraria o extrator e o seed existentes |
| 4 | Caminho do PDF | Novos uploads em `ebd/<slug>/revista-vN.pdf`; antigos intactos | Reprocessar o bucket quebraria o PDF público da 1T2022 |
| 5 | Congelamento do slug | Regenera enquanto editável; congela no primeiro asset | Congelar na criação impediria corrigir metadados antes do upload |
| 6 | Ordenação | Ano/trimestre desc; sem ano ao final por `createdAt` | `NULLS FIRST` do PostgreSQL jogaria edições sem ano para o topo |

## 7. Entregas

| ID | Entrega | Critério de aceite (verificável) | Status | Evidência |
|---|---|---|---|---|
| E7.1 | Modelo, migração e backfill | `EbdEdition` com `slug` único e `editorialPeriod`; `year`/`quarter` anuláveis; unique antigo removido; tipos TypeScript ajustados para os campos opcionais; backfill da 1T2022 para `2022-1t-adultos`; migração aplicada em banco descartável e repetível | planejado | |
| E7.2 | Contrato JSON v1.1 e extrator | `validateEbdImport` aceita 1.0.0 e 1.1.0; 1.1.0 aceita `(year + quarter)` ou `period`; combinações inválidas retornam 422; extrator emite 1.1.0 sob flag; testes cobrem os dois contratos | planejado | |
| E7.3 | Slug, caminho de PDF e admin | Edição nasce do JSON com período; slug gerado/regenerado enquanto editável e congelado no primeiro asset; lições usam o slug persistido; novos PDFs em `ebd/<slug>/`; `editionLabel` passa a receber a edição (ano/trimestre ou período); admin exibe e edita o período; lista ordena como RF13 | planejado | |
| E7.4 | Compatibilidade, testes e homologação | 1T2022 mantém slug, URLs e caminho do PDF; edição sintética só de período é criada, importada e publicada em preview; v1.0.0 continua importando; testes, lint, build e CI verdes; roteiro de homologação executado e aceite registrado | planejado | |

**Vocabulário de status:** `planejado` → `em execução` → `implementado` → `testado` → `homologado` → `publicado`. Também `bloqueado` e `abandonado`.

**Regra:** cada transição exige evidência (commit, PR, run de CI, deploy,
homologação). Entrega sem evidência não sobe de status.

### Matriz de compatibilidade (critério da E7.4)

| Caso | Resultado esperado |
|---|---|
| Edição 1T2022 existente | Slug `2022-1t-adultos`; lições `2022-1t-adultos-licao-01..13`; PDF v1 em `ebd/2022/1/adultos/revista-v1.pdf`; rodapé “1º trimestre de 2022” |
| Nova edição só de período | Slug `3o-trimestre-de-2010-adultos`; lições com esse prefixo; PDF em `ebd/3o-trimestre-de-2010-adultos/revista-v1.pdf`; rodapé com o período livre |
| JSON v1.0.0 | Importa como hoje, exigindo ano e trimestre |
| JSON v1.1.0 com ano/trimestre | Importa como o 1.0.0, com período opcional |
| JSON v1.1.0 só com período | Importa; edição criada sem ano/trimestre |
| Metadados corrigidos antes do 1º asset | Slug é regenerado; nada público muda |
| Metadados alterados depois do 1º asset | API responde 409; slug e caminho permanecem |

## 8. Dependências e riscos

| Item | Tipo | Impacto | Mitigação |
|---|---|---|---|
| Backfill do slug | Risco | Unique falha se houver slug repetido ou caractere não tratado | Script versionado com dry-run; conferência antes de aplicar `NOT NULL`/`UNIQUE` |
| Regeneração do slug antes do asset | Risco | Link administrativo antigo deixa de existir | Admin usa `id`, não slug; nenhuma URL pública existe antes da publicação |
| Ordenação com nulos | Risco | Edições sem ano aparecem no topo | Ordenar explicitamente com `nulls: last` ou em memória |
| Validador de caminho do PDF | Risco | Upload novo recusado pela regex antiga | Aceitar os dois formatos e testar ambos |
| `scripts/ebd/seed-sample.ts` e extrator | Dependência | Continuam presos ao 1.0.0 | Atualizar para aceitar/emitir 1.1.0 sem quebrar o padrão |
| Ambiente local sem credenciais | Dependência | Homologação do admin não roda nesta máquina | Implementar e testar por CI; homologar na máquina com sessão e bucket |
| Escopo do período “livre” | Risco | Virar taxonomia sem critério | Texto livre com validação de tamanho; sem enum, sem catálogo |
| Edição antiga com acentos na turma | Risco | Backfill SQL divergir do `slugify` do código | Backfill via script TS, usando a mesma função do runtime |

## 9. Gates

1. **Plano aprovado** — sem aprovação datada, nada é implementado.
2. **Implementação** — uma entrega por branch, começando pela E7.1.
3. **Teste** — CI verde, testes de compatibilidade e migração em banco descartável.
4. **Homologação** — execução da matriz de compatibilidade e aceite do responsável.
5. **Publicação** — autorização separada; deploy não é homologação.
6. **`noindex`** — só é removido depois da E7 homologada e de decisão explícita
   sobre links públicos; esta entrega não o remove.

## 10. Diário de execução (append-only)

| Data | Entrega | O que foi feito | Evidência | Desvio |
|---|---|---|---|---|
| 2026-10-28 | E7 (planejamento) | PRD e plano propostos pelo OIKOS a partir da decisão 3 da proveniência editorial; nenhum código alterado | Este documento; `E5_PROVENIENCIA_EDITORIAL.md` §16–17 | Aguardando aprovação do responsável |
| 2026-10-28 | E7 (aprovação) | Plano aprovado pelo responsável; E7.1 passa a ser a próxima entrega, ainda sem código | Este documento; aprovação registrada no cabeçalho | Implementação não iniciada |

## 11. Verificações do OIKOS (append-only)

| Data | Aderência | Observação |
|---|---|---|
| 2026-10-28 | não avaliada | Plano proposto; a aderência será verificada após a implementação, comparando as entregas com PRs, CI e produção |
