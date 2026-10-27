# E5 — Proveniência editorial x identidade da edição

> **Status:** análise registrada em 27/10/2026; **decisões tomadas em 27/10/2026 (Rev. 3)**; **decisões 1, 2 e 5 implementadas em 27/10/2026 (Rev. 4)** no PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25), com CI verde; **sem merge e sem deploy**; E5 **não homologada**.
> **Origem:** homologação em produção do PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21)
> (squash `a66add8`), ao importar o JSON da 1T2022.
> **Para:** próximo agente que retomar a E5/E6.

## 1. Relato do responsável

> "aqui há um erro de instrução do projeto. que já tratei antes.
> a revista pode ser do 3 trimestre de 2010, mas será usada no ciclo a partir de novembro.
> na verdade essas informações, trimestre, volume, numero da revista, são apenas informações
> editoriais, para o sistema pouco importam.
> apenas importam para identificação, eles não devem ser critérios de impedimento ou mesmo
> de conferencia.
>
> como já informado as aulas seguem o calendário da igreja, e não o calendário ao qual a
> revista originalmente foi publicada. ademais, haverá no futuro revistas que não estão
> atreladas a um trimeste, há outras que poderão ser organizadas em quadrimestres, ou até
> mesmo em semestres.
> o que nos importa é apenas ter um sistema para visualização do conteudo."

## 2. Sintoma em produção

- Ao clicar em **Importar lições** na edição criada, o admin recebe:
  `A edição do JSON não coincide com a edição cadastrada.`
- O JSON local é a 1T2022:
  - editora: **Convenção Batista Fluminense**
  - título: **Revista de Jovens e Adultos**
  - ano: **2022**
  - trimestre: **1**
  - turma: **Adultos**
  - edição: **72**
  - volume: **18**
  - 13 lições, schema **1.0.0**
- O PDF já foi registrado (o botão de importação só habilita com asset registrado), e o
  JSON foi lido no navegador (prévia “13 lições”). O import é recusado antes de gravar
  qualquer lição.
- A edição em produção foi criada com os padrões do formulário — ano atual, trimestre
  atual e turma “Adultos”. Em outubro de 2026 isso é **2026 / 4º trimestre / Adultos**.
  Confirmar no cabeçalho da edição; o erro indica que ao menos um dos três campos difere.
- O arquivo de referência é
  `materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf`, com
  SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204` e
  4.850.159 bytes.

## 3. O desenho aprovado já dizia que era proveniência

A Revisão 2 da EBD já separou **edição** (revista) de **ciclo de estudo** (uso) e definiu
que os dados editoriais não são identidade:

- `docs/planos/REVISAO_2_CICLOS.md`, §2: o JSON traz `edition.year` e `edition.quarter`
  como “proveniência correta — deve ser preservada, **não usada como identidade**”.
- §8: “JSON v1.0.0 **não muda**; `edition.*` e `source.*` deixam de criar identidade e
  passam a preencher a edição”.
- §6.6: “Proveniência não se apaga”: “Edição 1T2022 · Ano 18 · nº 72” continua visível —
  no admin sempre, no público em rodapé.
- §7: o aluno vê o **período de uso**, derivado do ciclo, não o trimestre da editora.
- `docs/planos/E5_HOMOLOGACAO.md`, passo 3: o resultado esperado é “`edition.*`/`source.*`
  viram proveniência”.

O código, porém, recusa o import quando ano, trimestre ou turma divergem. Isso contradiz
o desenho aprovado e o próprio roteiro de homologação.

## 4. O que o código fazia antes da Rev. 4

> **Atualizado na Rev. 4 (§17):** o bloqueio editorial do import foi removido e a
> edição passou a nascer do JSON. Esta seção permanece como registro do estado
> anterior à implementação.

Os campos editoriais não são “só rótulos” na implementação anterior. Eles ainda definem:

| Uso | Onde | Efeito |
|---|---|---|
| Bloqueio do import | `src/api/admin/ebd.ts:585-591` | Retorna 400 se `year`, `quarter` ou `class` do JSON não forem idênticos aos da edição |
| Chave única | `prisma/schema.prisma:930` | `publisher + year + quarter + className` é a identidade da edição |
| Slug da edição/lição | `src/lib/ebd/import.ts:358-359`; usado em `src/api/admin/ebd.ts:629` e `:648` | Gera `2026-4t-adultos` e `.../licao-1` |
| Caminho do PDF | `src/lib/ebd/storage.ts:83-89`; usado em `src/api/admin/ebd.ts:496` e `storage.ts:210` | Gera `ebd/2026/4/adultos/revista-v1.pdf` |
| Rótulo editorial | `src/lib/ebd/content.ts:95-96` | Gera “4º trimestre de 2026” |
| Padrões do formulário | `src/pages/admin/AdminEbdPage.tsx:23-30` | Ano atual, trimestre atual, “Adultos” |
| Edição imutável | `src/api/admin/ebd.ts:387-410` | O PATCH só altera editora, título, edição e volume; não altera ano, trimestre ou turma |
| Validação do JSON | `src/lib/ebd/import.ts:132-144` | Exige ano ≥ 1900, trimestre 1–4 e turma não vazia |

No público, o comportamento já está alinhado com o desenho:

- `src/pages/ebd/EbdHomePage.tsx:329` usa `cycle.periodLabel` como rótulo principal;
  `:346-347` mostra a proveniência editorial em texto secundário.
- `src/pages/ebd/EbdLessonPage.tsx:176` usa o período do ciclo; `:195-196` e `:295-296`
  mostram a proveniência; `:301` mostra a turma e o período do ciclo.

Ou seja: o aluno vê o período de uso correto. O dado editorial errado aparece no rodapé,
no slug e no caminho do PDF.

## 5. Diagnóstico

1. **A E5 separou edição de ciclo, mas manteve a edição carimbada pelo período editorial.**
   O schema, o slug, o caminho do PDF e o import ainda tratam `year`/`quarter`/`class`
   como identidade. A parte “proveniência, não identidade” da Revisão 2 não foi
   integralmente implementada.
2. **Há duas fontes de verdade.** O formulário pede ano/trimestre/turma antes de ler o
   JSON; o JSON traz os mesmos dados. Quando divergem, o sistema bloqueia. Pelo desenho,
   quem deve preencher a edição é o JSON.
3. **O erro é sintoma, não necessidade de validação.** A importação não precisa comparar
   dados editoriais para gravar conteúdo.
4. **Volume e número já são proveniência.** O import não os compara; apenas os sobrescreve
   com os valores do JSON. O bloqueio real é só `year`, `quarter` e `class`.
5. **Turma também é editorial.** A turma da revista identifica o público-alvo; a turma do
   ciclo é a dimensão de uso. Pelo mesmo princípio, `class` não deveria ser critério de
   impedimento.
6. **O rótulo principal do público já vem do ciclo.** O risco de “o aluno ver o trimestre
   errado” está mitigado; o risco restante é de identificação errada no rodapé, no slug e
   no armazenamento.

## 6. O que pode e o que não pode ser conferido

**Pode e deve continuar sendo conferido:**

- esquema do JSON (v1.0.0);
- existência do PDF registrado;
- `source.sha256` e `source.size_bytes` conferindo com o asset enviado.

Isso é integridade do arquivo, não calendário editorial. O hash liga o JSON ao PDF
correto e deve permanecer como bloqueio.

**Não deve ser critério de impedimento:**

- ano;
- trimestre;
- turma;
- volume;
- número da edição.

## 7. Risco de remover apenas o bloqueio

Apagar o `if` desbloqueia, mas não corrige a causa. Se a edição estiver cadastrada como
2026/4 e o JSON for 2022/1:

- a importação passa;
- as lições nascem com slug `2026-4t-adultos/...`;
- o rodapé e o admin mostram “4º trimestre de 2026” como proveniência de um conteúdo de
  2022;
- um futuro PDF `v2` vai para `ebd/2026/4/...`.

O rótulo principal do aluno continua correto, porque vem do ciclo. Ainda assim, a
identificação editorial e a URL ficam erradas. Além disso, o sistema perde o único sinal
de que o operador abriu a edição errada — embora esse sinal já fosse fraco, porque duas
edições podem ter os mesmos metadados.

## 8. Opções

### A. Desbloqueio mínimo

Remover a comparação de `year`/`quarter`/`class` no import. Manter todo o resto.

- **Prós:** rápido; destrava a homologação.
- **Contras:** se a edição tiver metadados diferentes do JSON, o slug, o caminho e a
  proveniência ficam errados. Pode-se exibir os dois valores lado a lado, sem bloquear,
  para o operador perceber a divergência.

### B. Edição nasce do JSON (recomendada)

Ler o JSON antes de criar a edição; criar a edição com `edition.*`; depois enviar o PDF e
importar.

- **Prós:** uma única fonte de verdade; slug, caminho e proveniência corretos desde o
  início; elimina a divergência por construção.
- **Contras:** muda o fluxo do admin; exige cuidado com a ordem (edição antes do upload)
  e com edições já existentes.

### C. Metadados editáveis antes do primeiro asset/lição

Manter a criação manual, mas permitir corrigir ano/trimestre/turma enquanto a edição não
tiver PDF, lições ou ciclos. Depois disso, imutável.

- **Prós:** corrige erros de digitação; menor mudança de fluxo.
- **Contras:** a edição atual já tem PDF; exigiria recriar ou mover o asset. Não resolve
  os formatos futuros.

### D. Generalizar o período editorial

Introduzir um campo livre (`editorialPeriod`, por exemplo “3º trimestre de 2010”,
“2º semestre de 2026”, “Edição especial”) ou uma estrutura `{ tipo, número, ano }`;
tornar `year`/`quarter` opcionais; desacoplar slug e caminho do período; evoluir o JSON
para v1.1.0, aceitando v1.0.0.

- **Prós:** cobre quadrimestre, semestre e edições sem período; corrige a limitação de
  modelo.
- **Contras:** mudança de schema/migração; quanto mais tarde, mais caro, porque o slug é
  permanente e links já podem ter sido compartilhados.

## 9. Recomendação

1. **Agora:** remover o bloqueio editorial do import; manter hash/tamanho; deixar claro
   no admin que o bloco `edition.*` do JSON é proveniência. Não publicar enquanto a
   proveniência estiver errada.
2. **Antes de publicar:** implementar a opção B (edição a partir do JSON) ou, no mínimo,
   pré-preencher a criação com os dados do JSON. O contorno atual — recriar a edição como
   2022/1/Adultos e reenviar o PDF — serve para concluir a homologação manual, não como
   fluxo definitivo.
3. **Próxima iteração:** planejar a opção D. Não forçar quadrimestre/semestre dentro de
   `quarter`.
4. **Testes de regressão:** JSON com período editorial diferente deve importar; hash ou
   tamanho divergente deve continuar falhando; o rótulo principal do público deve vir do
   ciclo.

## 10. Decisões pendentes

1. A edição nasce do JSON ou continua sendo digitada no formulário?
2. Os metadados editoriais podem ser editados antes do primeiro asset? E depois?
3. Generalizar o período agora, antes do primeiro link público, ou depois da E5?
4. O que fazer com a edição órfã criada com os padrões errados? Hoje não há rota de
   exclusão de edição.
5. O admin deve exibir uma nota **não bloqueante** quando o JSON e a edição divergirem?
   O responsável rejeitou “conferência” como critério; uma exibição informativa não é
   portão, mas precisa ser confirmada.

## 11. Critérios de aceite sugeridos

- [ ] Importar um JSON cujos `edition.year`/`quarter`/`class` diferem da edição
      selecionada conclui com as 13 lições em rascunho.
- [ ] `source.sha256` divergente continua retornando 409; tamanho divergente, 409;
      esquema inválido, 422.
- [ ] O rótulo principal do público continua sendo o período do ciclo; a proveniência
      editorial aparece em rodapé.
- [ ] O admin exibe a proveniência real, sem contradição entre o JSON e a edição.
- [ ] O contrato JSON v1.0.0 continua aceito.
- [ ] Testes, lint e build verdes.

## 12. Arquivos provavelmente impactados

- `src/api/admin/ebd.ts` — bloqueio, criação, import e PATCH.
- `src/api/ebd-schema.ts` — schema, se o modelo de período mudar.
- `prisma/schema.prisma` — chave única e campos opcionais, se a opção D avançar.
- `src/lib/ebd/import.ts` — validação, slug.
- `src/lib/ebd/content.ts` — rótulo.
- `src/lib/ebd/storage.ts` — caminho do PDF.
- `src/pages/admin/AdminEbdPage.tsx` e `AdminEbdEditionPage.tsx` — fluxo e prévia.
- `src/pages/ebd/EbdHomePage.tsx` e `EbdLessonPage.tsx` — rótulos; provavelmente sem
  mudança.
- Testes em `src/lib/ebd/__tests__/` e novos testes da API admin.
- `docs/planos/REVISAO_2_CICLOS.md`, `docs/planos/E5_HOMOLOGACAO.md`,
  `docs/planos/PLANO_EBD_DIGITAL.md`, `docs/PENDENCIAS.md`, `docs/CONTINUIDADE.md` e
  `docs/CHANGELOG.md` quando houver implementação.

## 13. O que não fazer

- Não remover as conferências de hash e tamanho.
- Não tratar volume/número como bloqueio (eles já não são).
- Não alterar ano/trimestre/turma de uma edição já publicada sem tratar slug, caminho do
  PDF e links compartilhados.
- Não declarar a E5 homologada enquanto o fluxo contradizer o desenho aprovado.
- Não quebrar o contrato JSON v1.0.0 sem uma nova versão.

## 14. Contorno atual (não é a correção)

Para concluir a homologação manual sob o código atual: criar uma nova edição com
**2022 / 1º trimestre / Adultos**, reenviar o mesmo PDF e importar o JSON nela. A edição
antiga fica órfã, porque não há rota de exclusão.

Esse contorno prova o fluxo, mas **não valida o comportamento desejado**: uma revista de
um período editorial usada em um ciclo de outro período. Depois da correção, a
homologação deve ser repetida com uma edição cujo período editorial difere do período do
ciclo, para provar a separação.

## 15. Referências

- `docs/planos/REVISAO_2_CICLOS.md` — desenho aprovado (edição × ciclo).
- `docs/planos/E5_HOMOLOGACAO.md` — roteiro e critério “edition.* vira proveniência”.
- `docs/planos/PLANO_EBD_DIGITAL.md` — plano mestre da EBD Digital.
- `docs/CONTINUIDADE.md` — estado da E5 em produção.
- `docs/PENDENCIAS.md` — pendências abertas.
- `src/api/admin/ebd.ts`, `src/lib/ebd/import.ts`, `src/lib/ebd/storage.ts`,
  `src/lib/ebd/content.ts`, `prisma/schema.prisma`.

## 16. Rev. 3 — decisões tomadas em 27/10/2026

As cinco decisões da §10 foram resolvidas pelo responsável, com o OIKOS.
Nenhuma implementação foi feita; esta revisão registra a direção para o
executor.

### 16.1 Decisões

1. **A edição nasce do JSON** (opção B). O admin parte do JSON; a edição é
   criada com `edition.*` e o PDF é anexado depois. Elimina a divergência por
   construção e corrige slug, caminho e proveniência desde o início.
2. **Metadados editáveis antes do primeiro asset; imutáveis depois** (opção C).
   Enquanto a edição não tiver PDF, lições ou ciclos, ano/trimestre/turma podem
   ser corrigidos; depois disso, a edição é imutável.
3. **Período editorial generalizado depois da homologação, antes de links
   públicos** (opção D). A E5 homologa com o modelo atual (1T2022 cabe);
   `editorialPeriod`, ano/trimestre opcionais, slug/caminho desacoplados e JSON
   v1.1 (aceitando v1.0.0) entram em seguida.
4. **Edição órfã: limpeza controlada.** Como não há lições nem ciclos, remover a
   edição errada e o PDF do bucket por script administrativo, com verificação
   antes/depois. Não criar rota de exclusão nesta entrega.
5. **Divergência exibida como nota informativa, sem bloqueio.** Quando os
   valores do JSON e da edição diferirem, o admin mostra os dois lado a lado com
   nota neutra; o import segue. Não é portão nem conferência.

### 16.2 Consequências para o executor

- O bloqueio de `year`/`quarter`/`class` no import deixa de existir no fluxo
  novo; esquema, hash e tamanho continuam como bloqueios.
- A criação da edição passa a ler o JSON antes do upload; o PDF é anexado à
  edição criada.
- A limpeza da órfã exige janela e autorização própria; não faz parte do deploy
  do código.
- A generalização do período não entra nesta entrega; deve ser planejada como
  próxima iteração, antes de remover o `noindex` ou compartilhar links.
- Os critérios de aceite da §11 continuam valendo; o item "admin exibe a
  proveniência real" passa a incluir a nota informativa.

### 16.3 Fora de escopo desta revisão

- Migração para a VPS — decidida em 27/10/2026: manter **Vercel + Supabase**;
  reavaliar o Vercel Pro se o teto de 12 funções virar bloqueio; VPS somente
  como projeto separado, após segurança, backups, LGPD e rollback.
- Alterar o contrato JSON v1.0.0 nesta entrega.

## 17. Rev. 4 — implementação das decisões 1, 2 e 5 (27/10/2026)

> **Situação:** implementado no PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25),
> com CI verde (`Testes, lint e build`, 50 s). **Sem merge e sem deploy nesta
> sessão.** A E5 continua **não homologada**.

### 17.1 Decisões

| # | Decisão | Estado | Evidência |
|---|---|---|---|
| 1 | A edição nasce do JSON | **Implementada** | `POST /api/ebd/admin/editions` valida o JSON v1.0.0 e cria a edição com `edition.*` e `source.*`; `/admin/ebd` deixou de pedir ano/trimestre/turma manualmente. Testes de rota em `src/api/admin/__tests__/ebd.test.ts`. |
| 2 | Metadados editáveis antes do primeiro asset | **Implementada** | `PATCH /editions/:id` aceita ano, trimestre e turma enquanto não houver PDF, lições ou ciclos; depois retorna 409. A regra é compartilhada por `canEditEditionMetadata` (`src/lib/ebd/provenance.ts`) e a UI mostra o formulário ou o aviso de bloqueio. |
| 5 | Divergência exibida como nota informativa | **Implementada** | O import não compara mais `year`/`quarter`/`class`; `editionDivergences` alimenta a nota lado a lado no admin e o campo `divergences` da resposta da API. O import segue. |
| 3 | Generalização do período editorial | **Não iniciada** | Fica para a próxima iteração, antes de remover o `noindex` ou compartilhar links públicos. |
| 4 | Limpeza da edição órfã | **Não executada** | Exige autorização explícita e janela própria; nenhum script de limpeza foi rodado. |

### 17.2 Bloqueios preservados

| Verificação | Resposta | Evidência |
|---|---|---|
| Esquema do JSON fora de v1.0.0 | 422 | Teste de rota no import e na criação. |
| `source.sha256` divergente do asset | 409 | Teste de rota no import. |
| `source.size_bytes` divergente do asset | 409 | Teste de rota no import. |

### 17.3 Arquivos alterados

- `src/lib/ebd/provenance.ts` — regras compartilhadas de divergência e de
  editabilidade dos metadados.
- `src/api/admin/ebd.ts` — criação a partir do JSON, PATCH condicionado e
  import sem bloqueio editorial.
- `src/pages/admin/AdminEbdPage.tsx` — criação a partir do JSON.
- `src/pages/admin/AdminEbdEditionPage.tsx` — correção de metadados e nota
  informativa.
- `src/types/ebd-admin.ts` — `divergences` na resposta do import.
- `src/lib/ebd/__tests__/provenance.test.ts` e
  `src/api/admin/__tests__/ebd.test.ts` — testes das novas regras.

### 17.4 Validação

- `npm test`: **211 testes em 30 arquivos** (antes: 202 em 29). Inclui 9 testes
  de rota da API admin e 5 das regras de proveniência.
- `npm run lint`: aprovado, sem avisos.
- `npm run build`: aprovado (TypeScript + Vite).
- CI do PR #25: `Testes, lint e build` **verde** (50 s), run
  [40575414251](https://github.com/vulmarjunior/siteibopvh/actions/runs/40575414251).
  O Vercel gerou apenas o **preview automático do PR**; produção não foi
  alterada.
- **Não houve validação manual em produção** nesta sessão: o ambiente local
  segue sem `DATABASE_URL` e sem bucket real. A homologação continua sendo o
  próximo passo depois do merge/deploy autorizados.

### 17.5 Critérios de aceite da §11

| Critério | Estado |
|---|---|
| Importar JSON com `edition.year`/`quarter`/`class` diferentes conclui | **Coberto por teste de rota** (200, lição gravada, `divergences` preenchido); falta a confirmação manual em produção. |
| Hash, tamanho e esquema continuam bloqueando | **Coberto por testes de rota** (409, 409 e 422). |
| Rótulo principal do público continua sendo o período do ciclo | Sem alteração nesta entrega. |
| Admin exibe a proveniência real, com nota de divergência | **Implementado**; validação visual fica para o roteiro da E5. |
| Contrato JSON v1.0.0 continua aceito | **Coberto pelos testes de validação existentes.** |
| Testes, lint e build verdes | **Aprovado localmente e no CI do PR #25.** |

### 17.6 Pendências

1. Revisar e mergear o PR #25 (o merge e o deploy não foram autorizados nesta
   sessão).
2. Limpar a edição órfã **2026 / 4º trimestre / Adultos** e o PDF do bucket,
   com autorização explícita e verificação antes/depois (decisão 4).
3. Executar `docs/planos/E5_HOMOLOGACAO.md` em produção, agora sem o cadastro
   manual e com a nota informativa.
4. Planejar a decisão 3 (período editorial generalizado) antes de remover o
   `noindex` ou compartilhar links públicos.
