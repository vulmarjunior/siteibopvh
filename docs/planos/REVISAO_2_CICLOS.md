# Revisão 2 — Ciclos de estudo e calendário das lições

> **Projeto:** siteibopvh (módulo `ebd`)
> **Status:** **aprovada** pelo responsável em 2026-10-27 — vinculante para a E5
> **Data:** 2026-10-27
> **Planejado por:** OIKOS
> **Executor:** agente do projeto `siteibopvh`
> **Relação com o plano:** emenda ao [PLANO_EBD_DIGITAL.md](PLANO_EBD_DIGITAL.md) (Rev. 1, aprovada em 26/10/2026). Não substitui as entregas E1–E4 já homologadas; altera a modelagem antes da E5.

## 1. Problema

A revista traz a própria identificação editorial — `1T2022`, Ano 18, nº 72. O sistema
extraiu esse dado corretamente, mas o transformou em **identidade do bloco de
lições**: virou chave única, slug de URL e rótulo na tela do aluno
("1º trimestre de 2022").

A igreja, porém, **não estuda o trimestre da editora**. As lições são usadas em
outro período, começam em data escolhida e seguem um domingo por lição, sem
calendário fixo de jan–mar/abr–jun. A revista de 1T2022 pode ser estudada em
2027, e a mesma edição pode servir a mais de uma turma em datas diferentes.

Consequência atual: o aluno vê na tela uma data que não corresponde ao período em
que está estudando, e o modelo **não tem onde guardar** a informação central
(qual domingo é cada lição).

## 2. Diagnóstico do código atual (verificado em 27/10/2026)

| Camada | Evidência | Efeito |
|---|---|---|
| Schema | `EbdQuarter { year, quarter, className }` com `@@unique([year, quarter, className])` | A edição é a identidade; não cabe um segundo ciclo sobre a mesma revista |
| Slug | `src/lib/ebd/import.ts:345` → `quarterSlugFor()` gera `2022-1t-adultos` | URL pública carimbada com o trimestre editorial |
| Rótulo | `src/lib/ebd/content.ts` → `quarterLabel()` gera `"<n>º trimestre de <ano>"` | Texto exibido no card, no cabeçalho da lição, no breadcrumb e na busca |
| Admin | `src/pages/admin/AdminEbdPage.tsx` pede ano + trimestre | O operador declara a edição, não quando será estudada |
| Lição | `EbdLesson` não possui campo de data | Não existe a data de encontro |
| Leitura diária | `dailyReadings[].day` (`SEG`…`DOM`) | É o plano de leitura da revista, **não** a data de ensino |
| Importação | JSON v1.0.0 traz `edition.year`, `edition.quarter` e `source.*` | Proveniência correta — deve ser preservada, não usada como identidade |

## 3. Conceitos

- **Edição** — a revista como objeto bibliográfico: editora, ano, trimestre,
  número, volume, turma, PDF, hash. Imutável, vem do JSON e do upload.
- **Ciclo de estudo** — o uso da edição: turma, data de início, dia da semana,
  exceções, status de publicação. É o que ganha slug, rótulo público e link
  compartilhável.
- **Conteúdo** (lição, seções, perguntas) pertence à **edição** — revisado uma vez,
  reaproveitado em qualquer ciclo.
- **Agenda** pertence ao **ciclo** — data de cada lição.

## 4. Modelo proposto

```prisma
model EbdEdition {
  id              String   @id @default(cuid())
  publisher       String
  year            Int
  quarter         Int
  className       String
  issue           Int?
  volume          Int?
  title           String
  sourceFileName  String?
  sourceSha256    String?
  sourcePageCount Int?
  sourceSizeBytes Int?
  pdfAssets       EbdPdfAsset[]
  lessons         EbdLesson[]
  cycles          EbdCycle[]
  createdAt       DateTime @default(now())

  @@unique([publisher, year, quarter, className])
}

model EbdCycle {
  id          String           @id @default(cuid())
  editionId   String
  edition     EbdEdition       @relation(fields: [editionId], references: [id])
  slug        String           @unique
  className   String
  startsOn    DateTime         @db.Date   // data da lição 1
  weekday     Int              @default(0) // 0 = domingo
  status      EbdContentStatus @default(DRAFT)
  publishedAt DateTime?
  publishedBy String?
  schedule    EbdCycleLesson[]
  createdAt   DateTime         @default(now())

  @@index([status, startsOn])
}

model EbdCycleLesson {
  id            String   @id @default(cuid())
  cycleId       String
  cycle         EbdCycle @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  lessonId      String
  lessonNumber  Int
  scheduledOn   DateTime? @db.Date        // null apenas quando a exceção for "sem encontro"
  exceptionKind EbdScheduleException @default(RULE)

  @@unique([cycleId, lessonNumber])
}

enum EbdScheduleException {
  RULE          // data calculada pela regra
  RESCHEDULED   // data definida manualmente para esta lição
  NO_MEETING    // não há encontro nesta data; a fila desliza
}
```

**Alternativa mais simples (não recomendada):** manter a lição dentro do ciclo e
duplicar o conteúdo a cada reuso. Menos tabelas, porém perde a revisão já feita e
multiplica o trabalho editorial.

## 5. Calendário: regra + exceções (decisão tomada em 27/10/2026)

A data é sempre **calculada**, nunca recalculada em massa sobre dados gravados:

```
datas = []
d = startsOn
para n = 1..N:
    enquanto existe NO_MEETING em d: d += 7
    data(n) = RESCHEDULED(n) ?? d
    d += 7
```

- Mudar `startsOn` (ou o dia da semana) **reancora** o ciclo inteiro — a cascata é
  consequência da regra, não uma operação de escrita em cada lição.
- Ajustar uma lição cria `RESCHEDULED` e **não** move as seguintes.
- Marcar um domingo como `NO_MEETING` desloca as lições seguintes em uma semana.
- Nada é sobrescrito silenciosamente: reancorar não apaga exceções, apenas as
  sinaliza como divergentes para o operador decidir.

A interface deve nomear as duas operações de forma distinta: **"Reancorar o ciclo
a partir desta data"** e **"Ajustar somente esta lição"**.

## 6. Armadilhas obrigatórias

1. **Data civil**: `DATE` (`@db.Date`), nunca timestamp. Um `DateTime` UTC faz o
   domingo virar sábado na conversão de fuso.
2. **13 lições ≠ 13 semanas**: feriado, recesso, congresso e Santa Ceia exigem
   `NO_MEETING` desde a primeira versão.
3. **Duas lições no mesmo domingo** (reposição) precisam ser representáveis.
4. **Ciclo que cruza o ano** é normal para ciclo iniciado no fim do ano.
5. **Turma é dimensão do ciclo**; a mesma edição pode servir Adultos e Jovens em
   datas distintas.
6. **Proveniência não se apaga**: "Edição 1T2022 · Ano 18 · nº 72" continua
   visível — no admin sempre, no público em rodapé.
7. **Slug é permanente**: trocar depois do primeiro link compartilhado quebra
   referências. Nada foi publicado ainda, então a troca é gratuita agora.

## 7. Rótulo público (decisão tomada em 27/10/2026)

O aluno vê o **período de uso**, derivado da primeira e da última data do ciclo:

- mesmo ano: `Setembro a dezembro de 2027`
- anos distintos: `Novembro de 2027 a fevereiro de 2028`

A proveniência editorial aparece em rodapé, em texto secundário. Afeta o card de
`/ebd`, o cabeçalho da lição, o breadcrumb, o resultado de busca e o subtítulo do
admin.

## 8. Impacto por camada

| Camada | Mudança |
|---|---|
| `prisma/schema.prisma` | Novos `EbdEdition`/`EbdCycle`/`EbdCycleLesson`; `EbdQuarter` deixa de existir como entidade pública (ou vira `EbdEdition`) |
| Migração | **Sem migração de dados**: produção não tem EBD e o banco local tem apenas 2 lições de amostra. Reset do ambiente de desenvolvimento |
| API pública | `/api/ebd/quarters` → ciclos publicados; lição resolve o ciclo e devolve `scheduledOn` |
| API admin | criação passa a pedir edição + início; novas rotas de agenda (reancorar, ajustar, sem encontro) |
| Importação | JSON v1.0.0 **não muda**; `edition.*` e `source.*` deixam de criar identidade e passam a preencher a edição |
| Admin UI | prévia das 13 datas antes de salvar; edição da agenda por lição |
| Público | `quarterLabel()` substituído por rótulo de período; data da lição exibida |
| Extrator | inalterado (já produz proveniência correta) |
| Testes | 179 atuais continuam; novos para cálculo de datas, exceções, reancoragem e reaproveitamento de edição |
| Documentação | `CONTINUIDADE.md`, `CHANGELOG.md` e este plano |

## 9. Critérios de aceite

- **AC1** — criar ciclo informando edição e data de início; o sistema mostra as 13
  datas calculadas antes de salvar.
- **AC2** — a mesma edição (1T2022) pode ser usada em dois ciclos com datas
  diferentes, sem duplicar conteúdo revisado.
- **AC3** — duas turmas com a mesma edição e datas distintas coexistem.
- **AC4** — marcar um domingo sem encontro desloca as lições seguintes.
- **AC5** — ajustar uma lição individualmente não move as demais e sobrevive a uma
  reancoragem, sinalizada como divergência.
- **AC6** — a tela pública mostra o período de uso e a edição em rodapé.
- **AC7** — datas gravadas como `DATE`; nenhuma lição desloca de domingo por fuso.
- **AC8** — `/ebd` e as lições continuam `noindex` e fora do sitemap.
- **AC9** — testes, lint e build verdes; Lighthouse 1,00 preservado.

## 10. Sequência sugerida

1. Aprovação desta revisão pelo responsável. — **concluída em 27/10/2026**
2. Emenda no `PLANO_EBD_DIGITAL.md` (Rev. 2) com as entregas renumeradas. — **concluída em 27/10/2026**
3. Implementação no executor: schema + cálculo de agenda + admin.
4. Só então a E5 — publicar o ciclo da edição 1T2022.

## 11. Decisões ainda abertas

- Nome do bloco na interface: "ciclo de estudo", "trimestre de estudo" ou outro.
- A lição 1 é sempre a data de início do ciclo, ou pode haver defasagem?
- Quem pode criar e reancorar ciclos — apenas `ebd:manage` (ADMIN_GERAL/EDITOR) ou
  um perfil novo de professor?
- O ciclo admite mais de um encontro por semana em caso de reposição? (o modelo
  acima permite, via `RESCHEDULED`, mas a UI pode restringir)
