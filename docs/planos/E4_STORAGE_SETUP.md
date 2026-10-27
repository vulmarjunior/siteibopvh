# E4 — Configuração do Storage e operação do admin

> **Plano:** [PLANO_EBD_DIGITAL.md](PLANO_EBD_DIGITAL.md)
> **Entrega:** E4 — importação e publicação no admin
> **Data:** 2026-10-26
> **Escopo:** bucket `ebd`, upload assinado do PDF, importação do JSON, revisão e publicação.
>
> **Atualizado na E5 (27/10/2026):** as rotas passaram a ser por **edição**
> (`/editions/:id/...`) e a publicação passou a ser por **ciclo**. O modelo
> `EbdQuarter` foi substituído por `EbdEdition`/`EbdCycle`/`EbdCycleLesson`
> (ver [REVISAO_2_CICLOS.md](REVISAO_2_CICLOS.md)). O histórico da E4
> permanece como registro do que foi validado no modelo anterior.

## 1. Fluxo implementado

1. O admin cria a **edição** em `/admin/ebd` (ano, trimestre editorial, turma, editora, título, nº e volume).
2. Seleciona o PDF e o navegador calcula o **SHA-256** e o tamanho.
3. `POST /api/ebd/admin/editions/:id/pdf-upload` reserva a próxima versão e devolve:
   - **Supabase:** URL assinada de upload + token;
   - **Local (desenvolvimento):** URL local assinada por HMAC.
4. O navegador envia o PDF **direto** ao destino (sem passar pela função serverless).
5. `POST /api/ebd/admin/editions/:id/pdf-assets` confirma a versão, verifica o objeto no Storage (ou o arquivo local) e cria `EbdPdfAsset`.
6. O admin importa o JSON extraído localmente; o servidor valida o esquema v1.0.0 e compara:
   - `source.sha256` com o hash do PDF selecionado;
   - `source.size_bytes` com o tamanho do PDF.
   - Divergência retorna **409** e nada é importado.
7. A importação cria/atualiza as lições como **rascunho**, marca a edição como **em revisão** e arquiva lições que não fazem parte do novo JSON.
8. O admin revisa cada lição em `/admin/ebd/licoes/:id`, com prévia do texto e o PDF original lado a lado, corrige e publica a lição; a **publicação do ciclo** (`/admin/ebd/ciclo/:cycleId`) publica as lições válidas em conjunto.
9. Toda ação relevante é registrada em `CuradoriaAuditoria` (upload, importação, edição, ajuste de agenda, reancoragem, publicação, despublicação, arquivamento).

## 2. Supabase Storage em produção

- Bucket: **`ebd`**.
- Caminho: `ebd/<ano>/<trimestre>/<turma>/revista-v<N>.pdf`.
- Recomendado: bucket **privado** + `SUPABASE_SERVICE_ROLE_KEY` no servidor para gerar URLs assinadas de upload e download.
- Se o bucket for público, o download pode usar a URL pública; o upload assinado ainda depende do service role ou de uma policy de Storage que permita o usuário autenticado.
- Variáveis do servidor:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (recomendado; nunca no cliente)
  - `SUPABASE_ANON_KEY` (fallback)
  - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (cliente, para `uploadToSignedUrl`)
- O bucket não é criado automaticamente pelo código. Criar antes da homologação da E4/E5.

## 3. Desenvolvimento local

Sem credenciais válidas de Storage, a E4 usa um adaptador local:

```env
EBD_LOCAL_STORAGE_DIR=materiais/ebd/storage
EBD_LOCAL_PDF_DIR=materiais/ebd/2022/1T/adultos
SUPABASE_URL=http://127.0.0.1:5555
SUPABASE_ANON_KEY=dev-anon-key
VITE_SUPABASE_URL=http://127.0.0.1:5555
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

- `EBD_LOCAL_STORAGE_DIR` habilita o upload local assinado por HMAC; os arquivos ficam ignorados pelo Git em `materiais/`.
- O servidor de autenticação simulado (`scratch/mock-supabase-auth.ts`) e o usuário local de teste não são versionados; existem apenas para a validação local.
- Em produção (`NODE_ENV=production`), o modo local não é ativado.

## 4. Permissão e rotas

- Permissão: **`ebd:manage`**.
- Concedida por padrão a **ADMIN_GERAL** e **EDITOR**; não é concedida a CURADOR_VEREDAS nem a OPERADOR.
- UI: `/admin/ebd`, `/admin/ebd/:editionId`, `/admin/ebd/ciclo/:cycleId` e `/admin/ebd/licoes/:lessonId`.
- API: `/api/ebd/admin/...`, atendida pelo entry `/api/index` — **nenhuma função serverless nova**.

## 5. Validação local realizada (E4 — modelo anterior)

> Registro histórico do modelo por trimestre; a E5 substituiu `EbdQuarter` por
> `EbdEdition`/`EbdCycle` e a publicação passou a ser por ciclo.

- PDF real de **4.850.159 bytes** (acima de 4,5 MB) enviado pelo fluxo assinado local; versão 2 criada e versão 1 preservada.
- Importação do JSON real 1T2022: 2 lições em rascunho, trimestre em revisão.
- Hash divergente recusado com **409**, incluindo `expectedHash` e `receivedHash`.
- Rascunho inacessível no público: `/api/ebd/quarters` vazio e lição 404 antes da publicação.
- Revisão salva como rascunho; prévia e PDF carregados na tela de revisão.
- Publicação do trimestre e da lição; despublicação da lição e do trimestre; republicação.
- Auditoria registrada com `UPLOAD_PDF_EBD`, `IMPORTAR_TRIMESTRE_EBD`, `ATUALIZAR_LICAO_EBD`, `PUBLICAR_LICAO_EBD`, `DESPUBLICAR_LICAO_EBD`, `PUBLICAR_TRIMESTRE_EBD` e `DESPUBLICAR_TRIMESTRE_EBD`.

## 6. Pendência de ambiente

O caminho Supabase Storage está implementado, mas **ainda não foi exercitado contra um bucket real**. A E5 foi publicada em produção em 27/10/2026 com o schema novo; a homologação do upload depende de o bucket `ebd` e as credenciais Supabase estarem configurados na Vercel. Enquanto isso, o upload em produção falha com “Supabase Storage não configurado para upload do PDF.” — é configuração de ambiente, não código.

## 7. Extração completa do trimestre (E1 e E6)

O extrator versionado gera o JSON draft das 13 lições:

```bash
python scripts/ebd/extract-quarter.py \
  --pdf materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf \
  --out materiais/ebd/2022/1T/adultos/importacao-1t2022-completo.json
```

- O JSON sai com `review.status: "draft"`; a revisão humana é obrigatória antes de publicar.
- O PDF e o JSON completo não são versionados.
- O script foi validado na 1T2022: 13 lições, p. 16–113, todas com 3–4 seções, perguntas e 7 leituras diárias.
- Para outra edição, conferir `--summary-page`, `--page-offset` e o template.
- Instruções adicionais em `scripts/ebd/README.md`.
