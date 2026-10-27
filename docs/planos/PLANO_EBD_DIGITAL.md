# EBD Digital — PRD e plano de execução

> **Projeto:** siteibopvh (módulo `ebd`)
> **Status:** em execução
> **Revisão:** 2 — aprovada em 27/10/2026 (ver [histórico de revisões](#histórico-de-revisões))
> **Estado:** E2, E3 e E4 homologadas em 26/10/2026; E5 (ciclos e calendário) mergeada e publicada em 27/10/2026 (squash `a66add8`), com homologação em produção em andamento; E6 (publicação) pendente
> **Homologação:** E2, E3 e E4 aprovadas pelo responsável em 26/10/2026; E5 em homologação manual em produção; E6 pendente
> **Aprovado por:** Vulmar Junior em 2026-10-26 (Rev. 1) e em 2026-10-27 (Rev. 2)
> **Planejado por:** OIKOS
> **Executor:** agente do projeto `siteibopvh`
> **Documento:** fonte da intenção; o fato é verificado no GitHub (commits, PRs, CI, deploy)

### Histórico de revisões

| Rev. | Data | Mudança | Aprovação |
|---|---|---|---|
| 1 | 2026-10-26 | Plano original: edição, extração local, leitura pública, admin, publicação | Vulmar Junior |
| 2 | 2026-10-27 | Separa **edição** (revista) de **ciclo de estudo** (uso); o calendário passa a ter data por lição, com regra e exceções explícitas; a publicação deixa de ser E5 e passa a E6 | Vulmar Junior |

A Rev. 2 nasce da [REVISAO_2_CICLOS.md](REVISAO_2_CICLOS.md): a revista traz o
próprio trimestre editorial (`1T2022`), mas a igreja estuda suas lições em outro
período, uma por domingo, sem calendário fixo.

## 1. Problema

A revista da EBD chega à igreja como PDF de página fixa. A própria editora informa
que a edição digital foi formatada para celulares e tablets e não recomenda
impressão — mas, mesmo em tela, o texto não se adapta: o aluno precisa dar zoom e
rolar horizontalmente, perde a linha, não consegue buscar uma passagem nem
ajustar o tamanho da fonte; leitores de tela encontram dificuldade na diagramação
em colunas. O resultado é leitura desconfortável e pouco uso do material durante
a semana.

A autorização da editora foi confirmada pelo usuário em 26/10/2026 para uso
**não comercial e interno à igreja**, com publicação digital no portal. O portal
institucional é o lugar natural para essa leitura — hoje ele não tem nada
relacionado à EBD — e a área `/ebd` não deve ser indexada em buscadores.

### O bloco de lições não é o trimestre da editora

A revista informa a própria edição — no caso, `1T2022`, Ano 18, nº 72 — e esse
dado é proveniência legítima. Ele **não** define quando as lições serão estudadas.
A igreja usa o material em período escolhido, com uma lição por domingo a partir
de uma data de início, sem vínculo com os trimestres do calendário civil, e pode
reaproveitar a mesma edição em mais de uma turma ou em mais de um período.

Por isso o bloco de lições é um **ciclo de estudo**: ele tem data de início,
agenda própria e identificação pública por período. A edição (a revista) é outra
entidade, imutável, que o ciclo referencia. Sem essa separação, o aluno vê uma
data que não corresponde ao período em que está estudando e o sistema não tem
onde guardar a data de cada encontro.

## 2. Objetivo

Publicar as lições da revista da EBD (turma Adultos, um **ciclo de estudo** por
vez, com data própria para cada lição) como leitura digital responsiva em texto
reflow, com busca, ajuste de fonte, modo noturno e compatibilidade com leitor de
tela, a partir do PDF fornecido pela editora, com revisão humana obrigatória
antes da publicação, em área não indexada e para uso interno não comercial.

## 3. Não-objetivos (fora de escopo)

- Não substituir o PDF original: ele continua disponível para download.
- Não gerir matrícula, frequência, classes ou professores da EBD.
- Não reescrever, resumir ou comentar o conteúdo doutrinário.
- Não traduzir o material.
- Não ter aplicativo nativo nem leitura offline no MVP.
- Não ter áudio ou narração (TTS) no MVP.
- Não digitalizar acervo histórico nem trimestres passados no MVP.
- Não reproduzir capa, expediente, editorial, propaganda ou ficha técnica da edição.
- Não executar extração de PDF dentro do portal no MVP; a extração é local e o
  portal apenas importa o resultado.
- Não criar conta de aluno no MVP: o acesso é por URL, sem login, e a área não é
  indexada.
- Não alterar a identidade visual do portal fora do leitor da revista.
- Não usar o conteúdo para fins comerciais, promoção ou redistribuição; o uso
  autorizado é interno à igreja.
- Não indexar a área `/ebd` em buscadores nem incluir suas páginas no sitemap.
- Não versionar o documento de autorização da editora nem o PDF de origem.

## 4. Usuários e casos de uso

| Quem | O que precisa fazer | Hoje |
|---|---|---|
| Aluno | Ler a lição no celular, marcar como lida e retomar de onde parou | PDF com zoom e rolagem horizontal |
| Professor | Consultar tópicos, textos bíblicos e perguntas para preparar a aula | PDF |
| Admin/editor (responsável pelo projeto) | Publicar o trimestre a partir do PDF, revisando a extração | Não existe |
| Visitante | Acessar o material por link direto, sem login | PDF público avulso |

## 5. Requisitos

### Premissas de trabalho

- Módulo dentro do portal (`siteibopvh`), rota `/ebd`, mesma stack, banco e deploy.
- Leitura pública, sem login de aluno, em área não indexada.
- Uso interno e não comercial, com autorização da editora confirmada em
  26/10/2026.
- Texto reflow (não flipbook), preservando imagens como figuras.
- Pipeline: extração local + importação no admin + revisão humana + publicação.
- Extração feita na máquina local, fora do portal, com ferramenta dedicada e
  versionada no repositório; o portal não processa PDF.
- PDF enviado direto do navegador ao Supabase Storage por URL assinada; a função
  serverless recebe apenas metadados e o JSON estruturado.
- MVP: turma **Adultos**, **1 ciclo de estudo** com 13 lições, uma por domingo, a
  partir de data de início escolhida no admin.
- Escopo de conteúdo: apenas as lições; capa, expediente, editorial,
  apresentação, sumário, ficha técnica, contracapa e propaganda ficam fora.
- A editora entrega a revista em PDF trimestral; há várias edições disponíveis, mas a publicação é um trimestre por vez.
- Revisão editorial feita pelo próprio responsável pelo projeto antes de publicar.
- Conteúdo de editora **com autorização** registrada (referência documental fora do repositório).
- Nova permissão administrativa: `ebd:manage`.
- O PDF de origem fica em `materiais/ebd/<ano>/<trimestre>/<turma>/`, pasta local
  ignorada pelo Git; o portal recebe o PDF no Storage.

### Restrições de uso e indexação

- Uso autorizado: não comercial e interno à igreja. Não usar o conteúdo em
  produtos, campanhas, promoções ou redistribuição.
- A área `/ebd` deve responder com `X-Robots-Tag: noindex, nofollow` e meta
  robots equivalente. `robots.txt` não substitui o `noindex`; se for usado,
  documentar o conflito com o rastreamento.
- Excluir `/ebd` do `sitemap.xml` e não gerar dados estruturados de artigo.
- O `noindex` não é controle de acesso: se for necessário restringir a leitura a
  membros da igreja, isso exige autenticação e decisão separada, fora do MVP.
- O documento da autorização não é versionado; registrar apenas a referência e a
  data.

### Funcionais

- RF1 — Listar trimestres e lições publicadas em `/ebd` (turma Adultos).
- RF2 — Ler a lição em página própria com estrutura: título, texto bíblico, tópicos, perguntas e referências.
- RF3 — Buscar por texto no trimestre publicado, retornando lição e trecho.
- RF4 — Ajustar tamanho da fonte e alternar tema claro/escuro, respeitando `prefers-color-scheme`.
- RF5 — Marcar lição como lida e retomar a última posição, em armazenamento local, com opção de limpar.
- RF6 — Baixar o PDF original da lição ou do trimestre.
- RF7 — Admin com `ebd:manage` cadastra o trimestre, envia o PDF por URL assinada direto ao Storage, importa o JSON extraído localmente e revisa o conteúdo estruturado.
- RF8 — Admin publica ou despublica trimestre e lição; rascunhos não aparecem no público.
- RF9 — Cada lição tem URL permanente e metadados de compartilhamento.
- RF10 — Navegação anterior/próxima e índice do trimestre.
- RF11 — Versionar o PDF original: novo envio cria nova versão e preserva a anterior para auditoria, sem sobrescrever silenciosamente.
- RF12 — Validar o hash SHA-256 entre o PDF enviado e o JSON importado, recusando importações divergentes.
- RF13 — Criar o ciclo de estudo informando a edição, a turma e a **data de início**; o sistema calcula e exibe as datas de todas as lições antes de salvar.
- RF14 — Reancorar o ciclo (nova data de início ou novo dia da semana), recalculando a agenda a partir da regra, sem apagar as exceções já registradas.
- RF15 — Ajustar a data de uma lição isolada, ou marcar o encontro como **sem encontro** (feriado, recesso, congresso), deslocando as lições seguintes.
- RF16 — Exibir a data de cada lição na página de leitura e no índice do ciclo, e o **período de uso** derivado da primeira e da última data como identificação pública.

### Não funcionais

- RNF1 — Acessibilidade WCAG 2.1 AA: HTML semântico, contraste, foco visível, navegação por teclado e leitor de tela.
- RNF2 — Mobile-first: leitura confortável a partir de 360px, sem rolagem horizontal.
- RNF3 — Desempenho: LCP < 2,5s em 4G na página da lição; imagens otimizadas e lazy.
- RNF4 — Respeitar o limite de 12 funções serverless do Vercel Hobby: novas rotas entram por entries existentes com prefixo de path.
- RNF5 — O portal não processa PDF: a extração ocorre fora dele; revisão humana é obrigatória antes de publicar.
- RNF6 — Sem dados pessoais de alunos no MVP; sem credenciais ou tokens no cliente.
- RNF7 — Rastreabilidade: quem publicou, quando e qual versão do conteúdo.
- RNF8 — Não indexação: a área `/ebd` responde com `noindex, nofollow` (meta e
  `X-Robots-Tag`), fica fora do sitemap e não usa dados estruturados de artigo; o
  restante do portal permanece indexável.
- RNF9 — Autorização da editora confirmada em 26/10/2026 para uso não comercial e
  interno; o documento não é versionado e a referência fica fora do repositório.
- RNF10 — PDFs não trafegam pela função serverless: upload direto ao Storage por URL assinada, respeitando o limite de 4,5 MB por request do Vercel.
- RNF11 — Datas de lição são **datas civis** (tipo `DATE`), nunca timestamp: a conversão de fuso não pode deslocar um domingo de encontro.

### Fluxo de extração local, envio do PDF e publicação

1. O editor roda a ferramenta local de extração (versionada no repositório) sobre
   o PDF do trimestre. Candidatas a avaliar na E1: pdfjs-dist no Node,
   PyMuPDF/pdfplumber, marker/docling; OCR apenas se o PDF for digitalizado.
2. A ferramenta gera um JSON conforme esquema versionado (lições, seções,
   perguntas, referências, figuras), com o hash SHA-256 do PDF e um relatório de
   qualidade (blocos reconhecidos, páginas pendentes).
3. No admin, o editor com `ebd:manage` cadastra a **edição** (ano, trimestre
   editorial 1–4, turma, editora/edição) e envia o PDF por URL assinada, direto
   ao bucket `ebd` do Supabase Storage, em caminho versionado
   (`ebd/<ano>/<trimestre>/<turma>/revista-v<N>.pdf`), sem passar pela função
   serverless. Validações: magic bytes `%PDF`, máximo de 50 MB, hash SHA-256;
   novo envio nunca sobrescreve a versão anterior.
4. O editor cria o **ciclo de estudo** vinculado à edição, informando turma e data
   de início; o sistema calcula as datas das 13 lições e as exibe antes de salvar.
   A mesma edição pode sustentar mais de um ciclo ou turma.
5. O editor importa o JSON no admin; o servidor valida o esquema e o hash contra
   o PDF enviado, recusando importações divergentes, e cria as 13 lições em
   status `draft`, vinculadas ao ciclo.
6. Revisão humana por lição, com prévia lado a lado do PDF original; correções de
   extração são salvas.
7. Publicação por lição ou do ciclo inteiro, com autor, data e versão;
   despublicação também disponível. Rascunho nunca é servido ao público.
8. O link "baixar PDF original" aponta para o objeto no Storage; a leitura
   pública consulta apenas lições publicadas.

Estados do ciclo: `rascunho` → `em revisão` → `publicado` → `arquivado` (quando um
novo ciclo substitui).

## 6. Entregas

| ID | Entrega | Critério de aceite (verificável) | Status | Evidência |
|---|---|---|---|---|
| E1 | Diagnóstico dos PDFs e extração local | 2 lições extraídas localmente com título, seções e perguntas reconhecidos; relatório comparando ferramentas candidatas (pdfjs-dist no Node, PyMuPDF/pdfplumber, marker/docling) com taxa de acerto e esforço de revisão; esquema de importação definido; PDFs de origem com texto extraível ou plano B definido | implementado | [E1_DIAGNOSTICO_EXTRACAO.md](E1_DIAGNOSTICO_EXTRACAO.md) |
| E2 | Modelo de dados e leitura pública | RF1, RF2, RF4, RF6 e RF10 funcionando com amostra real do trimestre; checklist WCAG 2.1 AA aplicado; sem rolagem horizontal em 360px; página com `noindex` desde a primeira versão | homologado | Branch `feat/ebd-e2-modelo-leitura`, commits `fd74136` e `7a6074c`; [E2_CHECKLIST_WCAG.md](E2_CHECKLIST_WCAG.md); aceite do responsável em 26/10/2026 |
| E3 | Busca e progresso local | RF3 e RF5 funcionando; busca retorna lição e trecho; progresso persiste entre sessões e pode ser limpo | homologado | Branch `feat/ebd-e3-busca-progresso`, commits `3b1fafd` e `f3eefbd`; busca com trechos e progresso local validados; aceite do responsável em 26/10/2026 |
| E4 | Importação e publicação no admin | RF7, RF8, RF11 e RF12 com permissão `ebd:manage`; importação de PDF + JSON de uma lição real em ambiente de teste; hash divergente recusado; upload direto ao Storage por URL assinada (PDF acima de 4,5 MB funciona); versão anterior preservada; rascunho inacessível no público; auditoria registrada | homologado | Branch `feat/ebd-e4-admin-importacao`, commits `1264dee`, `425048c` e `d4812ee`; [E4_STORAGE_SETUP.md](E4_STORAGE_SETUP.md); admin, upload assinado, importação, revisão, publicação/despublicação, versionamento e auditoria validados localmente; 179 testes, lint e build verdes; Lighthouse 1,00 nas páginas públicas; aceite do responsável em 26/10/2026. O bucket `ebd` real deve ser exercitado na E6 |
| E5 | Ciclos de estudo e calendário | RF13 a RF16: edição separada do ciclo; data de início define as datas; ajuste isolado não é sobrescrito por reancoragem; domingo sem encontro desloca as seguintes; mesma edição reutilizável em ciclos e turmas distintos; rótulo público por período de uso; datas gravadas como `DATE` (RNF11) | publicado (homologação em andamento) | Branch `feat/ebd-e5-ciclos`, PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21) com CI verde, squash `a66add8` e deploy em produção em 27/10/2026; [REVISAO_2_CICLOS.md](REVISAO_2_CICLOS.md); schema `EbdEdition`/`EbdCycle`/`EbdCycleLesson` + reset de migração; `src/lib/ebd/schedule.ts` com 16 testes; 196 testes, lint e build verdes; smoke em produção: `/api/ebd/cycles` 200 vazio, `/api/ebd/quarters` 404, admin 401 sem sessão, `noindex` presente; homologação manual no roteiro [E5_HOMOLOGACAO.md](E5_HOMOLOGACAO.md), em andamento (bucket real, fluxo do admin e Lighthouse pendentes) |
| E6 | Homologação e publicação do ciclo | Ciclo da turma Adultos completo no ar com as datas de encontro; aceite do responsável registrado; autorização da editora referenciada; RF9 e RNF8 verificados (`noindex` em meta/header, fora do sitemap); bucket `ebd` real exercitado | planejado | Preparação: [`scripts/ebd/extract-quarter.py`](../../scripts/ebd/extract-quarter.py) validado na 1T2022; JSON draft local com 13 lições gerado; publicação ainda pendente |

**Vocabulário de status:** `planejado` → `em execução` → `implementado` → `testado` → `homologado` → `publicado`. Também `bloqueado` e `abandonado`.

**Regra:** cada transição exige evidência (commit, PR, run de CI, deploy, homologação). Entrega sem evidência não sobe de status.

**Diagnóstico dos exemplares (2026-10-25):** Revista Palavra & Vida — Jovens e Adultos. Edição 82 (Gálatas): 140 páginas, 13 lições (p. 22–137), com "Conclusão" em todas. Edição de Hebreus: 136 páginas, 13 lições (p. 17–133), sem "Conclusão". Ambas: formato 1080×1920, texto extraível com `pdfplumber`, abertura em duas colunas, "Leitura Diária", "Objetivo" e "Para pensar e agir" em todas as lições; sem figuras de conteúdo no corpo. Edição 2011.4 (Cânticos do Servo): 84 páginas, 13 lições (p. 30–82), template antigo de impresso — duas colunas no corpo, "Texto Bíblico", "Data do Estudo", títulos com caracteres duplicados e barras laterais rotacionadas; serve como teste de estresse, e o tratamento exigido será dimensionado se essa geração entrar no escopo. Não há propaganda entre as lições; o material descartado está na abertura e no fechamento. A E1 confirma ferramenta e esquema na edição real; as duas edições de 2024 servem de referência de template.

**Estado em 2026-10-25:** planejamento pausado até o envio da edição que será efetivamente usada. As amostras analisadas (Gálatas, Hebreus e Cânticos do Servo) serviram apenas para diagnóstico de extração e comparação de templates; nenhuma delas define o MVP. Quando a edição real chegar, o diagnóstico será repetido nela e o escopo será fechado.

**Edição real recebida (2026-10-26):** `PalavraeVida-1T2022-Digital.pdf` — Revista de Jovens e Adultos da Convenção Batista Fluminense, Ano 18, nº 72, **1T2022**; 119 páginas; 4,85 MB; 13 lições (p. 16–113); texto extraível com `pdfplumber`; SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204`. O arquivo de origem está em `materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf`, pasta local ignorada pelo Git; o caminho absoluto varia por máquina. Em outra máquina, recriar a estrutura e copiar o PDF, conferindo o hash. O template é anterior ao das amostras de 2024; a E1 deve ser repetida nesta edição e o escopo fechado nela. A autorização da editora foi confirmada em 26/10/2026 para uso não comercial e interno; a referência documental fica fora do repositório.

## 7. Dependências e riscos

| Item | Tipo | Impacto | Mitigação |
|---|---|---|---|
| PDF da editora com texto extraível | Dependência | Extração falha se for digitalizado | E1 verifica amostra; plano B: OCR ou digitação assistida |
| Dependência da máquina local para extrair | Risco | Pipeline não reproduzível por terceiros | Ferramenta versionada no repositório e esquema documentado; no MVP o revisor é o próprio responsável |
| Autorização da editora | Dependência | Publicação irregular sem ela | Confirmada em 26/10/2026 para uso não comercial e interno; referência fora do repositório; gate na E5 |
| Indexação indevida da área `/ebd` | Risco | Exposição em buscadores fora do escopo autorizado | `noindex, nofollow` em meta/header, fora do sitemap e sem dados estruturados; verificar na E2 e na E5 |
| Uso comercial ou redistribuição | Risco | Viola a autorização da editora | Restringir ao uso interno; não usar em campanhas, produtos ou redistribuição; registrar a referência |
| Limite de 12 funções serverless | Restrição | API nova não sobe | Reusar entries existentes com `?path=`, como no módulo Crianças |
| Decisão de infraestrutura do portal (Vercel/Supabase vs VPS) | Dependência externa | Pode mudar deploy, banco e storage | EBD não depende da decisão; o desenho atual contorna os limites do Vercel; comparativo em `docs/AVALIACAO_MIGRACAO_VPS.md` |
| Layout variável entre lições e trimestres | Risco | Revisão manual alta | Parser tolerante + editor de revisão; medir esforço na E1 |
| Variação de template entre edições | Risco | Parser quebra em edição nova | E1 valida na edição real; seções opcionais no esquema; perfis de template; edições antigas (ex.: 2011) exigem colunas, rotação e dedup, com escopo definido pela edição escolhida |
| Tamanho dos PDFs e imagens | Risco | Lentidão, custo e falha de envio | Supabase Storage (limite de 50 MB por arquivo no plano Free), compressão e cache |
| Responsável pela revisão editorial | Dependência operacional | Fila de publicação trava | Definido: o responsável pelo projeto revisa antes de publicar |
| Acessibilidade real | Risco | Requisito central falha | Teste manual com NVDA e TalkBack na E6 |
| Calendário real da igreja (feriado, recesso, congresso, Santa Ceia) | Risco | A fila de lições desalinha e o aluno vê data errada | Exceção `NO_MEETING` desde a E5; deslocamento automático das seguintes |
| Fidelidade doutrinária | Risco | Revisão altera o texto | Diff contra o PDF original na revisão |

## 8. Gates

1. **Plano aprovado** — sem aprovação, nada é implementado.
2. **Implementação** — por entrega, em branch própria.
3. **Teste** — CI verde e teste manual quando aplicável.
4. **Homologação** — aceite do usuário.
5. **Publicação** — autorização separada; confirmar autorização da editora e
   `noindex` antes de publicar; deploy não é homologação.

## 9. Diário de execução (append-only)

| Data | Entrega | O que foi feito | Evidência | Desvio |
|---|---|---|---|---|
| 2026-10-26 | E1 | Diagnóstico de extração na edição real 1T2022: 2 lições extraídas, 3 ferramentas comparadas e esquema v1.0.0 proposto | [E1_DIAGNOSTICO_EXTRACAO.md](E1_DIAGNOSTICO_EXTRACAO.md); script `E1/extrair_amostra.py`; SHA-256 do PDF | `pdfjs-dist`, PyMuPDF, marker/docling e OCR não testados nesta fase |
| 2026-10-26 | E2 | Modelo `EbdQuarter`/`EbdLesson`/`EbdPdfAsset` com auto-healing em runtime; API pública (`/api/ebd/quarters`, `/api/ebd/lessons/:slug`, PDF); páginas `/ebd` e `/ebd/licao/:slug` com RF1, RF2, RF4, RF6 e RF10; `noindex` em meta e header; amostra real 1T2022 (lições 1 e 2) | Branch `feat/ebd-e2-modelo-leitura`, commit `fd74136`; [E2_CHECKLIST_WCAG.md](E2_CHECKLIST_WCAG.md); 147 testes, lint e build verdes; Lighthouse 1,00 nas duas páginas; 320/360 px sem rolagem horizontal; PDF local servido com 4,85 MB | Sem deploy/push; amostra, PDF e seed restritos ao ambiente local; importação administrativa fica na E4 e a publicação real na E5 |
| 2026-10-26 | E2 | Homologação do responsável e validação da navegação local | Aceite em 26/10/2026; duas lições listadas e aberta a Lição 1 no ambiente local com banco de teste | — |
| 2026-10-26 | E3 | Busca por texto no trimestre publicado (RF3) com trechos e destaque; progresso local (RF5) com marcação de lida, salvamento da posição, retomada e limpeza por lição ou global | Branch `feat/ebd-e3-busca-progresso`, commit `3b1fafd`; 164 testes, lint e build verdes; Lighthouse 1,00 em `/ebd?q=criacao` e na lição; 320/360 px sem rolagem horizontal; busca sem acentos retorna “criação”; progresso persiste após recarregar e limpa corretamente | Busca em memória sobre as lições publicadas do trimestre (sem migração de schema), adequada ao MVP de 13 lições; avaliação de índice FTS fica para quando o acervo crescer |
| 2026-10-26 | E3 | Homologação do responsável | Aceite em 26/10/2026; busca e progresso validados na interface local | — |
| 2026-10-26 | E4 | Admin `/admin/ebd` com criação de trimestre, upload assinado do PDF, importação do JSON com validação de hash e tamanho, revisão com prévia e PDF, publicação/despublicação de lição e trimestre, versionamento do PDF e auditoria; permissão `ebd:manage` | Branch `feat/ebd-e4-admin-importacao`, commit `1264dee`; [E4_STORAGE_SETUP.md](E4_STORAGE_SETUP.md); 179 testes, lint e build verdes; PDF real de 4.850.159 bytes enviado como v2 (v1 preservada); hash divergente recusado com 409; rascunho fora do público; publicação/despublicação e auditoria validados; Lighthouse 1,00 nas páginas públicas | Caminho Supabase Storage implementado, mas não exercitado em bucket real por falta de credenciais válidas no `.env.local`; validação real fica para a homologação/E5 |
| 2026-10-26 | E4 | Homologação do responsável | Aceite em 26/10/2026; E5 não iniciada por decisão do responsável | — |
| 2026-10-26 | E5 (preparação) | Extrator completo versionado e validado na 1T2022; JSON draft local com as 13 lições gerado | `scripts/ebd/extract-quarter.py`; 13 lições válidas no esquema v1.0.0, com 3–4 seções, perguntas e 7 leituras diárias; instruções em `scripts/ebd/README.md` | Texto/PDF não versionados; nenhuma importação ou publicação nesta etapa; revisão humana pendente |
| 2026-10-27 | E5 (planejamento) | Revisão 2 aprovada: edição separada de ciclo de estudo; calendário com regra mais exceções; E5 redefinida para ciclos e calendário e publicação renumerada para E6 | [REVISAO_2_CICLOS.md](REVISAO_2_CICLOS.md); emenda neste plano | Nenhum código alterado nesta etapa; implementação segue no executor |
| 2026-10-27 | E5 (implementação) | Schema `EbdEdition`/`EbdCycle`/`EbdCycleLesson`/`EbdScheduleException` com reset de migração; `computeEbdSchedule` pura, com datas civis e testes de âncora, ajuste manual, sem encontro, divergência pós-reancoragem e colisão; importação v1.0.0 inalterada com slugs permanentes de edição/lição/ciclo; API admin de edições, ciclos, prévia, reancoragem, agenda e publicação por ciclo; API pública por ciclo com `scheduledOn`; UI admin com prévia das datas, agenda editável e as duas operações nomeadas; UI pública com período de uso, data da lição e proveniência em rodapé | Branch `feat/ebd-e5-ciclos`; 196 testes em 28 arquivos, lint e build verdes; PR aberto contra `main` | **Decisão de modelagem:** `EbdCycleLesson.scheduledOn` grava **somente** a data manual de `RESCHEDULED`; `RULE` e `NO_MEETING` ficam com `scheduledOn` nulo e a data efetiva é sempre calculada pela regra — evita dado derivado obsoleto após reancoragem. `NO_MEETING` consome a semana prevista e desloca a própria lição e as seguintes em +7 dias. A lição 1 cai no primeiro dia da semana escolhido a partir de `startsOn` (decisão para a questão aberta da Rev. 2). Validação manual do admin e Lighthouse pendentes por ambiente (sem `DATABASE_URL`, sem autenticação local do admin e sem bucket real) |
| 2026-10-27 | E5 (documentação de homologação) | Roteiro manual da E5 com pré-requisitos, 16 passos, critérios de aceite e pendências por ambiente; `PENDENCIAS.md`, `INDEX.md` e continuidade alinhados ao estado real (implementada, PR aberto, sem merge) | [E5_HOMOLOGACAO.md](E5_HOMOLOGACAO.md); PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21) | Nenhuma alteração de código nesta etapa; homologação continua bloqueada por `DATABASE_URL`, autenticação local do admin e bucket real |
| 2026-10-27 | E5 (publicação) | Merge squash do PR #21 (`a66add8`) e deploy automático da Vercel, autorizados pelo responsável para homologação em produção; reset do schema aplicado no primeiro acesso, sem conteúdo antigo a preservar | CI da `main` verde (36s); smoke: `/api/ebd/cycles` 200 `{"cycles":[]}`, `/api/ebd/quarters` 404, `/api/ebd/admin/editions` 401 sem sessão, `/ebd` e APIs com `noindex` | Próximo passo: homologação manual em produção pelo responsável (criar edição, upload no bucket `ebd` real, importar 13 lições, agenda, publicação e Lighthouse); `CONTINUIDADE.md`, `PENDENCIAS.md` e este plano atualizados sem declarar homologação |
| 2026-10-27 | E5 (Rev. 4 — proveniência) | Decisões 1, 2 e 5 implementadas: a edição nasce do JSON (`POST /editions` valida v1.0.0 e grava `edition.*`/`source.*`); ano/trimestre/turma editáveis antes do primeiro PDF/lição/ciclo; import sem bloqueio editorial, com nota informativa e `divergences` na API; esquema, hash e tamanho preservados como bloqueios | Branch `feat/ebd-rev3-proveniencia`; PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25) com CI verde (50 s); 211 testes em 30 arquivos (9 de rota da API admin e 5 de proveniência), lint e build verdes; `src/lib/ebd/provenance.ts` e `src/api/admin/__tests__/ebd.test.ts` | Sem merge e sem deploy nesta sessão; limpeza da órfã (decisão 4) e generalização do período (decisão 3) pendentes; homologação manual em produção não executada |
| 2026-10-27 | E5 (Rev. 4 — publicação) | Merge squash do PR #25 (`7695173`) e deploy **Vercel Production** após autorização do responsável; smoke de produção aprovado | CI da `main` verde (44 s, run [40578594656](https://github.com/vulmarjunior/siteibopvh/actions/runs/40578594656)); deploy Production concluído; `/api/ebd/cycles` 200, `/api/ebd/quarters` 404, `/api/ebd/admin/editions` 401 sem sessão, `/ebd` com `noindex`; chunk `AdminEbdPage-48hCdHsF.js` contém o fluxo “a partir do JSON” | Limpeza da edição órfã (decisão 4) **não executada**: sem credenciais de produção válidas no ambiente local; homologação manual e decisão 3 pendentes |
| 2026-10-27 | E5 (limpeza da órfã) | Responsável executou a Opção A do roteiro no painel Supabase e removeu a edição `cmvqucvhr00008o0q1h8ikx7v` (2026/4/Adultos, sem lições e sem ciclos) e o PDF do bucket `ebd` | Confirmação do responsável em 27/10/2026; smoke pós-limpeza: `/api/ebd/cycles` 200 e `/ebd` 200; decisão 4 concluída | Nenhuma alteração de código; o script `scripts/ebd/cleanup-orphan-edition.ts` permanece para casos futuros. Homologação manual e decisão 3 pendentes |

## 10. Verificações do OIKOS (append-only)

| Data | Aderência | Observação |
|---|---|---|
| 2026-10-27 | não avaliada | Revisão 2 aprovada: o modelo separa **edição** de **ciclo de estudo**; o calendário passa a ter data por lição (regra + exceções); a entrega de publicação deixa de ser E5 e passa a E6, com a E5 reservada ao calendário |
