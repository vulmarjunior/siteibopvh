# E1 — Diagnóstico de extração da edição real

> **Plano:** [PLANO_EBD_DIGITAL.md](PLANO_EBD_DIGITAL.md)
> **Entrega:** E1
> **Data:** 2026-10-26
> **Edição:** `PalavraeVida-1T2022-Digital.pdf` — Revista de Jovens e Adultos da
> Convenção Batista Fluminense, Ano 18, nº 72, **1T2022**
> **Amostra:** Lição 1 (p. 16–22) e Lição 2 (p. 23–29)
> **Natureza:** diagnóstico local. O PDF e o texto integral não são versionados.

## 1. Arquivo e integridade

| Item | Valor |
|---|---|
| Páginas | 119 |
| Tamanho | 4.850.159 bytes (4,85 MB) |
| SHA-256 | `5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204` |
| Criador | Adobe InDesign 17.0 (Windows) |
| Camada de texto | presente nas páginas de conteúdo |
| OCR | não necessário nesta edição |

As páginas de abertura e de título de lição usam composição gráfica, mas o texto
é extraível. Não há figuras no corpo das lições 1 e 2.

## 2. Método

Foram extraídas as 14 páginas de conteúdo das duas lições — PDF 18–31, impressas
16–29 — com três ferramentas locais:

- `pdfplumber` 0.11.10;
- `pypdf` 6.16.0;
- `pdftotext` (Poppler 25.07.0), com `-layout`.

A extração foi feita fora do portal, em pasta temporária. O script de diagnóstico
versionado é [`E1/extrair_amostra.py`](E1/extrair_amostra.py); ele não contém o
PDF nem o texto da revista.

## 3. Comparação das ferramentas

| Ferramenta | Caracteres | Linhas | Hífens no fim da linha | Ordem do corpo | Página de título | Números de página | Situação |
|---|---:|---:|---:|---|---|---|---|
| `pdfplumber` | 14.809 | 346 | 82 | correta | kerning: “impor tante” | 12 linhas numéricas | **primária** |
| `pypdf` | 15.046 | 362 | 70 | correta | fora de ordem | intercalados | não primária |
| `pdftotext -layout` | 15.454 | 346 | 82 | correta | correta | 12 linhas numéricas | **conferência** |

Estrutura reconhecida nas duas lições:

- títulos e “Texto base” — 2 de 2;
- seções numeradas — 7 de 7 (4 na Lição 1, 3 na Lição 2);
- “Para pensar e agir” — 2 de 2, com 3 e 2 perguntas;
- “Leitura Diária” — 14 de 14 dias.

Não testados nesta fase: `pdfjs-dist` (não instalado), PyMuPDF (não instalado),
`marker`/`docling` (pesados e desnecessários para um PDF com texto) e OCR (não
necessário). A comparação com `pdfjs-dist` pode ser feita na E4 se o projeto
quiser uma única linguagem no pipeline.

## 4. Estrutura observada

- Corpo em coluna única, página 1080×1920.
- Cada lição ocupa 7 páginas impressas.
- A página de título traz “Lição N”, “Texto base: …” e o título em composição
  gráfica; o **Sumário** (p. 3) é a fonte mais confiável para título e página
  inicial.
- A lição começa com introdução, segue em seções numeradas (`1.`, `2.`, …) e
  termina em “Para pensar e agir” e “Leitura Diária”.
- A página impressa aparece como linha numérica no fim de cada página; precisa
  ser removida.
- Há 82 hífens de separação silábica no fim de linha nas 14 páginas — o principal
  trabalho de limpeza.
- Títulos de seção podem ocupar duas linhas e precisam ser unidos.
- O texto não traz figuras no corpo; as páginas de título são vetoriais.

## 5. Esquema de importação proposto — v1.0.0

Contrato em [E1/esquema-importacao.schema.json](E1/esquema-importacao.schema.json).

Estrutura mínima:

```json
{
  "schema_version": "1.0.0",
  "source": {
    "file_name": "PalavraeVida-1T2022-Digital.pdf",
    "sha256": "5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204",
    "page_count": 119,
    "size_bytes": 4850159
  },
  "edition": {
    "publisher": "Convenção Batista Fluminense",
    "title": "Revista de Jovens e Adultos",
    "year": 2022,
    "quarter": 1,
    "issue": 72,
    "volume": 18,
    "class": "Adultos"
  },
  "lessons": [
    {
      "number": 1,
      "title": "Por que é importante conhecer o Pentateuco?",
      "base_text": "Romanos 1:1-8",
      "start_page": 16,
      "end_page": 22,
      "introduction": ["…"],
      "sections": [
        {
          "number": 1,
          "title": "A importância do Pentateuco para a nossa fé",
          "paragraphs": ["…"]
        }
      ],
      "questions": [
        { "number": 1, "text": "…" }
      ],
      "daily_readings": [
        { "day": "SEG", "reference": "Josué 1:7; I Reis 2:3" }
      ],
      "figures": [],
      "review": {
        "status": "draft",
        "reviewer": null,
        "reviewed_at": null,
        "source_hash": "5b359ca876e682a25e29b14af0aa2f24b0cea3a7389be635d22f39da38fec204"
      }
    }
  ]
}
```

O texto integral fica fora do repositório; o JSON importado no admin é o
artefato revisado e publicado.

## 6. Esforço de revisão

- 2 lições, 14 páginas, 14.809 caracteres extraídos (14.611 após a limpeza).
- Limpeza automatizável: números de página, hífens de fim de linha, junção de
  títulos de seção e normalização de espaços.
- Revisão humana: conferir títulos, referências bíblicas, perguntas e fidelidade
  ao PDF.
- Estimativa inicial: **10–15 minutos por lição** após a automação; medir na
  primeira revisão real da E2/E4.

## 7. Decisão

- **E1 concluída:** o PDF tem texto extraível; não há necessidade de OCR.
- **Ferramenta primária:** `pdfplumber`, pela ordem correta do corpo e pelo
  controle por página; `pdftotext -layout` como conferência.
- **Não usar `pypdf` como primária:** a página de título sai fora de ordem.
- **Esquema v1.0.0** proposto e versionado.
- **Próxima entrega:** E2 — modelo de dados e leitura pública.
- **Risco remanescente:** o template de 1T2022 é anterior ao das amostras de
  2024; a E2 deve usar esta edição como referência e a E1 deve ser repetida se
  outra edição entrar no MVP.

## 8. Reprodução

```bash
python docs/planos/E1/extrair_amostra.py \
  --pdf <caminho-do-pdf> \
  --out <pasta-fora-do-repositorio> \
  --first-page 18 \
  --last-page 31
```

O script gera `licoes.txt` (texto para revisão local) e `estatisticas.json`
(contagens e hash), sem gravar o PDF no repositório.
