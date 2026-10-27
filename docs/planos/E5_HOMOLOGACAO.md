# Homologação manual da E5 — ciclos e calendário

> **Projeto:** siteibopvh (módulo `ebd`)
> **Entrega:** E5 — ciclos de estudo e calendário (Rev. 2)
> **Ambiente:** **produção** (`https://ibopvh.com.br`), autorizado pelo responsável em 27/10/2026
> **Deploy:** PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21), squash `a66add8`
> **Status:** em andamento — o schema já foi aplicado; falta o fluxo manual
> **Data:** 2026-10-27

## 1. Objetivo

Provar, em produção, que a E5 cumpre RF13–RF16 e RNF11 sem regredir o que já foi
homologado (leitura reflow, busca, progresso, upload assinado, versionamento,
auditoria e `noindex`). O CI e os 196 testes já cobrem tipos, contratos e o
calendário puro; este roteiro cobre o que só o banco real, o login real e o
bucket real revelam.

**Estado de partida (27/10/2026):** o deploy aplicou o reset do modelo anterior
no primeiro acesso. `/api/ebd/cycles` responde `{"cycles":[]}`,
`/api/ebd/quarters` responde 404 e não havia conteúdo EBD a preservar. A
produção começa vazia.

**Fora de escopo:** novo deploy durante a homologação, rotação de credenciais,
alteração de DNS e uso de bucket de outro ambiente.

## 2. Pré-requisitos em produção

| Item | Como conferir | Observação |
|---|---|---|
| Bucket `ebd` no Supabase | Supabase → Storage → bucket `ebd` | Recomendado **privado**; o código usa URL assinada para upload e download |
| `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` na Vercel | Vercel → projeto `ibopvh` → Settings → Environment Variables | Sem elas, o upload falha com “Supabase Storage não configurado para upload do PDF.” |
| `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` | mesmas configurações, ambiente Production | Necessárias para o navegador enviar o PDF à URL assinada |
| Login de admin | `https://ibopvh.com.br/admin/ebd` | Conta com `ADMIN_GERAL` ou `EDITOR` (permissão `ebd:manage`) |
| PDF de origem | `materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf` | SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204` |
| JSON das 13 lições | `python scripts/ebd/extract-quarter.py ...` (ver `scripts/ebd/README.md`) | Gerado localmente em 27/10/2026; não versionado |

> O adaptador local (`EBD_LOCAL_STORAGE_DIR`) **não** existe em produção
> (`NODE_ENV=production`). Em produção, o upload sempre passa pelo Supabase
> Storage.

## 3. Conferência inicial

1. Abra `/api/ebd/cycles`: deve responder `200 {"cycles":[]}`.
2. Abra `/api/ebd/quarters`: deve responder `404` (rota antiga removida).
3. Abra `/ebd`: deve carregar com “Nenhum ciclo publicado ainda”.
4. Confirme `X-Robots-Tag: noindex, nofollow` na página e na API.
5. Entre em `/admin/ebd` com a conta de admin: a lista de edições deve carregar
   vazia, sem erro de console.

## 4. Roteiro

| # | Ação | Resultado esperado | Evidência |
|---|---|---|---|
| 1 | Criar a edição **1T2022 / Adultos** (editora, título, nº, volume) | Edição criada; slug `2022-1t-adultos`; link abre `/admin/ebd/:editionId` | Print com id e slug |
| 2 | Enviar o PDF da revista | Versão `v1` registrada; SHA e tamanho conferem; PDF abre | Print |
| 3 | Importar o JSON com a versão `v1` selecionada | **13 lições** em rascunho; `edition.*`/`source.*` viram proveniência; sem warnings inesperados | Print + contagem |
| 4 | Importar um JSON de teste com `source.sha256` alterado | Recusa com mensagem clara; nenhuma lição é gravada | Print do erro |
| 5 | Gerar a prévia com início em `2027-09-01` (quarta) e dia **Domingo** | Lição 1 em **05/09/2027** (primeiro domingo ≥ início); 13 datas semanais; período “Setembro a dezembro de 2027” | Print da prévia |
| 6 | Criar o ciclo | Rascunho; slug `adultos-2027-09-05`; revisão da âncora `1`; aparece na edição | Print |
| 7 | Ajustar **somente a lição 3** para um sábado | Lição 3 muda; lições 2 e 4 **não** mudam; linha marcada como ajustada manualmente | Print da agenda |
| 8 | Marcar a **lição 5** como **sem encontro** | Lição 5 e todas as seguintes deslocam **+7 dias**; a semana prevista da lição 5 aparece como regra; nenhuma data duplicada | Print antes/depois |
| 9 | Reancorar o ciclo para a semana seguinte (ou outro `weekday`) | Datas recalculadas; o ajuste da lição 3 **sobrevive** e aparece como **divergente**; revisão da âncora vira `2` | Print + revisão |
| 10 | Ajustar a lição 7 para a mesma data da lição 8 | As duas linhas exibem aviso de **mesma data** | Print |
| 11 | Publicar o ciclo | Status `PUBLISHED`; `/ebd` mostra o período, a data de cada encontro e a proveniência no rodapé; busca encontra termo do ciclo; PDF baixa por `/api/ebd/editions/:id/pdf`; progresso local continua funcionando | Prints |
| 12 | Verificar indexação | `/ebd` e `/ebd/licao/:slug` com `noindex, nofollow`; APIs com `X-Robots-Tag`; `/ebd` ausente de `public/sitemap.xml` | Print do `<head>` e do sitemap |
| 13 | Despublicar e depois arquivar | Conteúdo sai de `/ebd`; ciclo permanece no admin; auditoria registra autor, ação e data em cada passo | Prints |
| 14 | Acessibilidade e leitura | Navegação por teclado e foco visível; fonte/tema; reflow a 320–360 px sem rolagem horizontal; leitor de tela anuncia datas e índice (NVDA e/ou TalkBack) | Notas + prints |
| 15 | Lighthouse mobile em `/ebd` e em uma lição publicada | Manter o padrão das entregas anteriores (1,00 nas públicas) ou justificar qualquer queda; LCP < 2,5 s em 4G (RNF3) | Relatório |

## 5. Critérios de aceite

- [ ] RF13 — ciclo criado com edição, turma e data de início; datas exibidas antes de salvar.
- [ ] RF14 — reancoragem recalcula a regra **sem apagar** exceções; divergência visível.
- [ ] RF15 — ajuste isolado não move as seguintes; **sem encontro** desloca as seguintes.
- [ ] RF16 — data em cada lição na leitura e no índice; rótulo público = período de uso.
- [ ] RNF11 — datas em `DATE`, sem deslocamento de fuso (conferir virada de ano e horário de verão).
- [ ] RNF8 — `noindex` em meta/header/API e fora do sitemap.
- [ ] RNF10 — upload assinado; PDF não passa pela função serverless.
- [ ] RNF7 — auditoria de criação, upload, importação, ajuste, reancoragem, publicação e arquivamento.
- [ ] Sem regressão em reflow, busca com trechos, progresso local, download do PDF e versionamento.
- [ ] JSON v1.0.0 continua compatível, sem mudança de contrato.

## 6. Pendências por ambiente

| Pendência | Efeito | Como resolver |
|---|---|---|
| Bucket `ebd` real | Upload/download do PDF não funcionam | Criar o bucket no Supabase (privado) |
| Credenciais Supabase na Vercel | Upload assinado falha | Configurar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Production |
| Login de admin em produção | Nenhuma ação do admin pode ser validada | Usar a conta real com `ebd:manage` |
| Lighthouse | Sem número atual da E5 | Rodar após publicar um ciclo |
| Acessibilidade real | NVDA/TalkBack ainda não testados na E5 | Executar os passos 14–15 |

## 7. Registro e governança

1. Anexar prints, contagem de lições, versão da âncora e relatório do Lighthouse
   ao PR #21.
2. Se todos os critérios passarem, atualizar a linha da E5 no plano para
   `homologado` e registrar o aceite do responsável.
3. Atualizar `docs/CONTINUIDADE.md`, `docs/PENDENCIAS.md` e `docs/CHANGELOG.md`
   com o resultado.
4. Se algo falhar, registrar o passo e a mensagem exata antes de qualquer novo
   deploy.
