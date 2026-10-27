# Homologação manual da E5 — ciclos e calendário

> **Projeto:** siteibopvh (módulo `ebd`)
> **Entrega:** E5 — ciclos de estudo e calendário (Rev. 2)
> **Branch:** `feat/ebd-e5-ciclos` • **PR:** [#21](https://github.com/vulmarjunior/siteibopvh/pull/21)
> **Status:** roteiro pronto; execução **bloqueada por ambiente**
> **Data:** 2026-10-27

## 1. Objetivo

Provar, em ambiente local ou de desenvolvimento, que a E5 cumpre RF13–RF16 e
RNF11 sem regredir o que já foi homologado (leitura reflow, busca, progresso,
upload assinado, versionamento, auditoria e `noindex`). O CI já cobre tipos,
testes, lint e build; este roteiro cobre o que só um banco real e um admin
autenticado revelam.

**Fora de escopo:** merge, deploy, produção, rotação de credenciais e alteração
de DNS.

## 2. Pré-requisitos

| Item | Como obter | Observação |
|---|---|---|
| `DATABASE_URL` | Pedir ao responsável o valor do Postgres **local** (porta 55432) e gravar em `.env.local` | Não usar a URL de produção; não colar segredo no chat |
| Dependências | `npm install` e `npx prisma generate` | `prisma generate` já foi rodado no desenvolvimento, mas repita após o checkout |
| Migração | `npx prisma migrate deploy` | Aplica `20261027120000_ebd_editions_cycles` (reset do modelo `EbdQuarter`) |
| Alternativa à migração | `npm run dev` | O auto-schema aplica o mesmo reset uma única vez e registra `[EBD] Modelo anterior (EbdQuarter) detectado; aplicando reset da Rev. 2.` |
| Admin local | Login com `ADMIN_GERAL` ou `EDITOR` (permissão `ebd:manage`) | Se a autenticação local não estiver configurada, este é o bloqueio a resolver primeiro |
| PDF de origem | `materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf` (local, fora do Git) | SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204` |
| JSON das 13 lições | `python scripts/ebd/extract-quarter.py ...` (ver `scripts/ebd/README.md`) | Gerado localmente em 27/10/2026; não versionado |
| Upload | Adaptador local (dev) **ou** bucket `ebd` do Supabase **de desenvolvimento** | Bucket de produção não deve ser usado nesta homologação |

## 3. Preparação e conferência do reset

1. Confirme que o banco local tem o schema antigo (ou está vazio).
2. Rode a migração (ou suba o app) e confira que existem apenas
   `EbdEdition`, `EbdCycle`, `EbdCycleLesson`, `EbdScheduleException` e as
   tabelas de lição/PDF ligadas a `editionId`.
3. Confirme que `EbdQuarter` não existe mais.
4. Se o app foi iniciado sobre o schema antigo, confira no log o aviso de reset
   **uma única vez**; reinicie e confirme que o aviso não se repete.

**Evidência:** saída de `npx prisma migrate status`, lista de tabelas e trecho do
log.

## 4. Roteiro

| # | Ação | Resultado esperado | Evidência |
|---|---|---|---|
| 1 | Entrar em `/admin/ebd` | Lista de edições carrega sem erro de console; criação disponível | Print |
| 2 | Criar a edição **1T2022 / Adultos** (editora, título, nº, volume) | Edição criada; slug `2022-1t-adultos`; link abre `/admin/ebd/:editionId` | Print com id e slug |
| 3 | Enviar o PDF da revista | Versão `v1` registrada; SHA e tamanho conferem; PDF abre | Print |
| 4 | Importar o JSON com a versão `v1` selecionada | **13 lições** em rascunho; `edition.*`/`source.*` viram proveniência; sem warnings inesperados | Print + contagem |
| 5 | Importar um JSON de teste com `source.sha256` alterado | Recusa com mensagem clara; nenhuma lição é gravada | Print do erro |
| 6 | Gerar a prévia com início em `2027-09-01` (quarta) e dia **Domingo** | Lição 1 em **05/09/2027** (primeiro domingo ≥ início); 13 datas semanais; período “Setembro a dezembro de 2027” | Print da prévia |
| 7 | Criar o ciclo | Rascunho; slug `adultos-2027-09-05`; revisão da âncora `1`; aparece na edição | Print |
| 8 | Ajustar **somente a lição 3** para um sábado | Lição 3 muda; lições 2 e 4 **não** mudam; linha marcada como ajustada manualmente | Print da agenda |
| 9 | Marcar a **lição 5** como **sem encontro** | Lição 5 e todas as seguintes deslocam **+7 dias**; a semana prevista da lição 5 aparece como regra; nenhuma data duplicada | Print antes/depois |
| 10 | Reancorar o ciclo para a semana seguinte (ou outro `weekday`) | Datas recalculadas; o ajuste da lição 3 **sobrevive** e aparece como **divergente**; revisão da âncora vira `2` | Print + revisão |
| 11 | Ajustar a lição 7 para a mesma data da lição 8 | As duas linhas exibem aviso de **mesma data** | Print |
| 12 | Publicar o ciclo | Status `PUBLISHED`; `/ebd` mostra o período, a data de cada encontro e a proveniência no rodapé; busca encontra termo do ciclo; PDF baixa por `/api/ebd/editions/:id/pdf`; progresso local continua funcionando | Prints |
| 13 | Verificar indexação | `/ebd` e `/ebd/licao/:slug` com `noindex, nofollow`; APIs com `X-Robots-Tag`; `/ebd` ausente de `public/sitemap.xml` | Print do `<head>` e do sitemap |
| 14 | Despublicar e depois arquivar | Conteúdo sai de `/ebd`; ciclo permanece no admin; auditoria registra autor, ação e data em cada passo | Prints |
| 15 | Acessibilidade e leitura | Navegação por teclado e foco visível; fonte/tema; reflow a 320–360 px sem rolagem horizontal; leitor de tela anuncia datas e índice (NVDA e/ou TalkBack) | Notas + prints |
| 16 | Lighthouse mobile no build de produção local (`/ebd` e uma lição) | Manter o padrão das entregas anteriores (1,00 nas públicas) ou justificar qualquer queda; LCP < 2,5 s em 4G (RNF3) | Relatório |

## 5. Critérios de aceite

- [ ] RF13 — ciclo criado com edição, turma e data de início; datas exibidas antes de salvar.
- [ ] RF14 — reancoragem recalcula a regra **sem apagar** exceções; divergência visível.
- [ ] RF15 — ajuste isolado não move as seguintes; **sem encontro** desloca as seguintes.
- [ ] RF16 — data em cada lição na leitura e no índice; rótulo público = período de uso.
- [ ] RNF11 — datas em `DATE`, sem deslocamento de fuso (conferir virada de ano e horário de verão).
- [ ] RNF8 — `noindex` em meta/header/API e fora do sitemap.
- [ ] RNF10 — upload assinado; PDF não passa pela função serverless.
- [ ] RNF7 — auditoria de criação, ajuste, reancoragem, publicação e arquivamento.
- [ ] Sem regressão em reflow, busca com trechos, progresso local, download do PDF e versionamento.
- [ ] Exportação/importação continuam compatíveis com o JSON v1.0.0 (sem mudança de contrato).

## 6. Pendências por ambiente

| Pendência | Efeito | Como resolver | Dono |
|---|---|---|---|
| `DATABASE_URL` ausente | Migração, importação e prévia não rodam | Responsável fornece a URL do Postgres local (`55432`) para `.env.local` | Responsável |
| Autenticação local do admin | Nenhuma ação do admin pode ser validada por clique | Configurar o login local (sem usar produção) | Responsável |
| Bucket `ebd` real | Caminho Supabase do upload assinado não exercitado | Usar bucket de **desenvolvimento** com `SUPABASE_SERVICE_ROLE_KEY` válida | Responsável |
| Lighthouse | Sem número atual da E5 | Rodar após o build local com o ambiente acima | Executor |
| Acessibilidade real | NVDA/TalkBack ainda não testados na E5 | Executar os passos 15–16 com o ambiente pronto | Executor |

## 7. Registro e governança

1. Anexar prints, contagem de lições, versão da âncora e relatório do Lighthouse
   ao PR #21.
2. Se todos os critérios passarem, atualizar a linha da E5 no plano para
   `testado` e registrar o aceite do responsável; só então avaliar o merge.
3. Atualizar `docs/CONTINUIDADE.md` e `docs/PENDENCIAS.md` com o resultado.
4. **Não** fazer merge nem deploy sem autorização explícita e específica.
