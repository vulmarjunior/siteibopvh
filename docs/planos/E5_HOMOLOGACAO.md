# Homologação da E5 — guia do responsável

> **Projeto:** siteibopvh (módulo `ebd`)
> **Entrega:** E5 — ciclos de estudo e calendário (Rev. 2) + decisões da Rev. 3
> **Ambiente:** **produção** (`https://ibopvh.com.br`), autorizado em 27/10/2026
> **Deploy de referência:** PR [#21](https://github.com/vulmarjunior/siteibopvh/pull/21),
> squash `a66add8`, com as correções #22–24
> **Quando usar:** **depois** do merge/deploy da Rev. 4 (PR #25) e da limpeza da
> edição órfã. Se a tela de criação ainda pedir ano/trimestre/turma manualmente,
> pare: a Rev. 3 não está publicada.
> **Status:** Rev. 4 implementada no PR [#25](https://github.com/vulmarjunior/siteibopvh/pull/25)
> (CI verde, sem merge/deploy); aguardando autorização para publicar e limpar a órfã

## Como este guia funciona

- **O agente faz:** prepara o JSON e o JSON de teste, confere o deploy, abre as
  páginas, coleta prints e registra o resultado.
- **O responsável faz:** os cliques e conferências visuais descritos nos blocos.
- O guia é executado **em ordem**. Cada bloco tem no máximo ~7 passos e termina
  com uma conferência.

## Regras desta execução

1. **Uma ação por passo.** Não pule etapas nem antecipe a seguinte.
2. Se algo diferente do **“deve aparecer”**, **pare**, tire print e reporte a
   mensagem exata. Não improvise.
3. Blocos de até ~7 passos, com conferência ao final.
4. Ações marcadas com **⚠️** exigem confirmação explícita antes de executar.
5. **Nunca** digite senha, token ou chave no chat.
6. Ao final, use a seção **“O que dizer depois”**.

## Antes de começar — o agente confirma

- [ ] Rev. 4 (PR #25) mergeada e publicada (edição nasce do JSON; nota
      informativa) e órfã removida com autorização.
- [ ] Edição antiga **2026 / 4º trimestre / Adultos** não existe mais.
- [ ] Bucket `ebd` criado no Supabase, **privado**.
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` e
      `VITE_SUPABASE_ANON_KEY` configuradas em Production na Vercel.
- [ ] JSON da 1T2022 gerado localmente (13 lições).
- [ ] JSON de teste com `source.sha256` alterado, para o passo de recusa.
- [ ] PDF de origem em `materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf`
      (SHA-256 `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204`,
      4.850.159 bytes).
- [ ] Conta de admin com permissão `ebd:manage` (`ADMIN_GERAL` ou `EDITOR`).

## Bloco 1 — Conferir o ambiente (5 passos)

1. Abra `https://ibopvh.com.br/api/ebd/cycles`.
   **Deve aparecer:** `{"cycles":[]}`.
2. Abra `https://ibopvh.com.br/api/ebd/quarters`.
   **Deve aparecer:** erro 404 (rota antiga removida).
3. Abra `https://ibopvh.com.br/ebd`.
   **Deve aparecer:** “Nenhum ciclo publicado ainda”.
4. Abra `https://ibopvh.com.br/admin/ebd` e entre com a conta de admin.
   **Deve aparecer:** a lista de edições.
5. Confira a lista.
   **Deve aparecer:** **vazia**. A edição 2026/4 não pode estar lá.

**Conferência do bloco 1:** se algo divergir, pare e reporte com print. Não
siga para o bloco 2.

## Bloco 2 — Criar a edição a partir do JSON (6 passos)

1. Na tela de edições, clique no botão de **criar edição a partir do JSON**
   (o executor confirma o rótulo exato antes de começar).
2. Selecione o JSON da 1T2022.
3. Confira os campos que o sistema preencheu:
   - editora: **Convenção Batista Fluminense**;
   - título: **Revista de Jovens e Adultos**;
   - ano: **2022**; trimestre: **1**; turma: **Adultos**;
   - edição: **72**; volume: **18**.
4. Clique em **criar/salvar**.
5. **Deve aparecer:** a edição criada, com slug `2022-1t-adultos`.
6. **Pare se** a tela pedir ano/trimestre/turma manualmente, sem ler o JSON —
   isso indica que a Rev. 3 não está publicada.

**Conferência do bloco 2:** print do id e do slug da edição.

## Bloco 3 — Enviar o PDF (5 passos)

1. Na edição, clique em **enviar PDF**.
2. Selecione `PalavraeVida-1T2022-Digital.pdf`.
3. Aguarde o fim do envio.
   **Deve aparecer:** versão **v1** registrada.
4. Confira o SHA-256 e o tamanho exibidos:
   `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204` e
   **4.850.159 bytes**.
5. Abra o PDF pelo admin.
   **Deve aparecer:** o PDF abre no navegador.

**Conferência do bloco 3:** print da versão v1 e do PDF aberto. Se o SHA ou o
tamanho divergirem, pare e reporte.

## Bloco 4 — Importar as lições (5 passos)

1. Clique em **importar lições**.
2. Selecione o mesmo JSON da 1T2022.
3. Confira a prévia.
   **Deve aparecer:** **13 lições** e os dados editoriais como proveniência.
4. Se aparecer a **nota informativa** de divergência entre o JSON e a edição,
   leia os dois valores. Ela **não bloqueia**; o import segue.
5. Confirme a importação.
   **Deve aparecer:** as **13 lições em rascunho**, sem aviso inesperado.

**Conferência do bloco 4:** print com a contagem 13.

## Bloco 5 — Teste de integridade (3 passos)

1. Use o **JSON de teste** com `source.sha256` alterado (o agente fornece).
2. Tente importar na mesma edição.
3. **Deve aparecer:** recusa com mensagem clara; **nenhuma lição nova** é
   gravada.

**Conferência do bloco 5:** print da mensagem de recusa e da contagem de lições
inalterada.

## Bloco 6 — Montar a agenda (7 passos)

1. Abra a tela de **criação de ciclo**.
2. Selecione a edição **1T2022** e a turma **Adultos**.
3. Preencha: início **01/09/2027** e dia **Domingo**.
4. Confira a prévia:
   - lição 1 em **05/09/2027** (primeiro domingo ≥ início);
   - **13 datas semanais**;
   - período **“Setembro a dezembro de 2027”**.
5. Crie o ciclo.
   **Deve aparecer:** rascunho, slug `adultos-2027-09-05`, âncora revisão **1**.
6. Ajuste **somente a lição 3** para um **sábado**.
   **Deve aparecer:** a lição 3 muda; as lições **2 e 4 não** mudam; a linha fica
   marcada como ajustada manualmente.
7. Marque a **lição 5** como **sem encontro**.
   **Deve aparecer:** a lição 5 e as seguintes deslocam **+7 dias**; a semana
   prevista aparece como regra; nenhuma data duplicada.

**Conferência do bloco 6:** prints antes/depois da lição 3 e da lição 5.

## Bloco 7 — Reancorar e provocar conflito (4 passos)

1. Reancore o ciclo para a **semana seguinte** (ou outro dia da semana).
2. Confira:
   - as datas foram recalculadas;
   - o ajuste da lição 3 **sobrevive** e aparece como **divergente**;
   - a revisão da âncora passou para **2**.
3. Ajuste a **lição 7** para a mesma data da **lição 8**.
4. **Deve aparecer:** as duas linhas com aviso de **mesma data**.

**Conferência do bloco 7:** print da revisão 2 e do aviso de mesma data.

## Bloco 8 — Publicar e conferir o público (6 passos)

1. **⚠️ Publique o ciclo.** É reversível (dá para despublicar), mas o conteúdo
   passa a existir em `/ebd`. Confirme antes de clicar.
2. Abra `https://ibopvh.com.br/ebd`.
   **Deve aparecer:** o período do ciclo, a data de cada encontro e a
   proveniência editorial no rodapé.
3. Use a busca por um termo do ciclo.
   **Deve aparecer:** o termo encontrado no conteúdo.
4. Baixe o PDF por uma lição.
   **Deve aparecer:** o PDF abre.
5. Marque uma lição como lida.
   **Deve aparecer:** o progresso local continua funcionando.
6. Confira a indexação:
   - abra o código-fonte de `/ebd` e de uma lição: deve conter
     `noindex, nofollow`;
   - `/ebd` **não** deve aparecer em `public/sitemap.xml`.

**Conferência do bloco 8:** prints da página pública, da busca, do download e do
`noindex`.

## Bloco 9 — Despublicar e arquivar (3 passos)

1. Despublique o ciclo.
   **Deve aparecer:** o conteúdo sai de `/ebd`; o ciclo permanece no admin.
2. Arquive o ciclo.
   **Deve aparecer:** a auditoria registra **autor, ação e data** em cada passo.
3. Se algo falhar, pare e reporte o passo e a mensagem.

**Conferência do bloco 9:** print da auditoria.

## Bloco 10 — Acessibilidade e Lighthouse (4 passos)

1. Navegue por **teclado** (Tab): o foco deve ficar visível em todos os
   controles.
2. Reduza a janela para **320–360 px**: a leitura não pode ter rolagem
   horizontal.
3. Abra a lição com **NVDA** ou **TalkBack**: as datas e o índice devem ser
   anunciados.
4. Rode **Lighthouse mobile** em `/ebd` e em uma lição publicada: anote a nota e
   o LCP; mantenha o padrão de **1,00** nas páginas públicas ou justifique
   qualquer queda (LCP < 2,5 s em 4G — RNF3).

**Conferência do bloco 10:** notas de acessibilidade e o relatório do
Lighthouse.

## Como confirmar o resultado

- [ ] RF13 — ciclo criado com edição, turma e data de início; datas exibidas
      antes de salvar.
- [ ] RF14 — reancoragem recalcula a regra **sem apagar** exceções; divergência
      visível.
- [ ] RF15 — ajuste isolado não move as seguintes; **sem encontro** desloca as
      seguintes.
- [ ] RF16 — data em cada lição na leitura e no índice; rótulo público = período
      de uso.
- [ ] RNF11 — datas em `DATE`, sem deslocamento de fuso (conferir virada de ano
      e horário de verão).
- [ ] RNF8 — `noindex` em meta/header/API e fora do sitemap.
- [ ] RNF10 — upload assinado; PDF não passa pela função serverless.
- [ ] RNF7 — auditoria de criação, upload, importação, ajuste, reancoragem,
      publicação e arquivamento.
- [ ] Sem regressão em reflow, busca com trechos, progresso local, download do
      PDF e versionamento.
- [ ] JSON v1.0.0 continua compatível, sem mudança de contrato.
- [ ] A edição 1T2022 (período editorial) convive com o ciclo de 2027 (período
      de uso) **sem contradição** — essa é a prova central da Rev. 3.

## O que dizer depois

**Se tudo passou:**

> “E5 homologada em [data]. Evidências: [prints/contagem/relatório]. A edição
> 1T2022 foi usada no ciclo de 2027 sem bloqueio e sem contradição. Próximo
> passo: generalização do período editorial (opção D), antes de links públicos.”

**Se algo falhou:**

> “A homologação parou no bloco [X], passo [Y]. A tela mostrou: [mensagem
> exata]. Print anexo. Nada foi alterado além de [descrever].”

Nunca declarar “homologado” sem os prints e a conferência dos critérios acima.

## Registro e governança

1. Anexar prints, contagem de lições, versão da âncora e relatório do Lighthouse
   ao PR #21.
2. Se todos os critérios passarem, atualizar a linha da E5 no plano para
   `homologado` e registrar o aceite do responsável.
3. Atualizar `docs/CONTINUIDADE.md`, `docs/PENDENCIAS.md` e `docs/CHANGELOG.md`
   com o resultado.
4. Se algo falhar, registrar o passo e a mensagem exata antes de qualquer novo
   deploy.
