# Ferramentas locais da EBD

Estas ferramentas preparam o conteúdo da EBD fora do portal. O PDF e o texto
integral **não são versionados**; o JSON gerado fica em `materiais/`, ignorado
pelo Git.

## Extrair o trimestre completo

Requisitos: Python 3.10+ e `pdfplumber`.

```bash
pip install pdfplumber
python scripts/ebd/extract-quarter.py \
  --pdf materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf \
  --out materiais/ebd/2022/1T/adultos/importacao-1t2022-completo.json
```

O script:

- lê títulos e páginas do Sumário, inclusive lições com título em duas linhas;
- lê o texto base na página de título de cada lição;
- remove números de página, desfaz hifenação e separa introdução, seções,
  perguntas e leitura diária;
- grava o JSON no esquema de importação **v1.0.0**, com `review.status: "draft"`,
  porque a revisão humana é obrigatória;
- imprime um relatório com seções, perguntas, leituras e avisos por lição.

Opções úteis:

```text
--first-lesson / --last-lesson   intervalo de lições (padrão 1–13)
--page-offset                    diferença entre página impressa e PDF (padrão 2)
--summary-page                   página do Sumário (padrão 3)
--year --quarter --issue --volume --class --publisher --edition-title
```

Para outra edição, confira o Sumário, o deslocamento de páginas e o template
antes de usar. O script foi validado na edição 1T2022 (13 lições, p. 16–113).

## Semear a amostra local (2 lições)

```bash
npx tsx --env-file=.env.ebd-local scripts/ebd/seed-sample.ts --publish
```

O seed recusa `DATABASE_URL` remota e usa apenas o banco local. Ele espera o
JSON de amostra `materiais/ebd/2022/1T/adultos/importacao-1t2022.json`.

## Importar no admin

O JSON completo pode ser importado em `/admin/ebd/:quarterId`. O hash e o
tamanho do PDF precisam coincidir com a versão registrada. A importação cria as
lições como rascunho; a publicação é manual.
