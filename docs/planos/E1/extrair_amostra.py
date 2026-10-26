#!/usr/bin/env python3
"""Extrai uma amostra de lições da revista da EBD para revisão local.

Uso:
    python extrair_amostra.py --pdf <caminho> --out <pasta> \
        --first-page 18 --last-page 31

O script NÃO versiona o PDF nem o texto integral. A saída deve ficar fora do
repositório. Ele remove números de página isolados no fim de cada página,
desfaz a hifenização de fim de linha e grava:

- licoes.txt       — texto limpo, com marcadores de página;
- estatisticas.json — hash, contagens e achados estruturais.

Requisito: pdfplumber.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def clean_page(text: str) -> tuple[str, int, int]:
    lines = text.splitlines()
    while lines and not lines[-1].strip():
        lines.pop()

    removed_page_number = 0
    if lines and re.fullmatch(r"\d{1,3}", lines[-1].strip()):
        removed_page_number = 1
        lines.pop()

    joined = "\n".join(lines)
    hyphenated = len(re.findall(r"\w+-\s*$", joined, re.MULTILINE))
    joined = re.sub(r"(?<=\w)-\n(?=\w)", "", joined)
    return joined.strip(), hyphenated, removed_page_number


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--first-page", type=int, default=18)
    parser.add_argument("--last-page", type=int, default=31)
    args = parser.parse_args()

    if not args.pdf.is_file():
        raise SystemExit(f"PDF não encontrado: {args.pdf}")
    if args.first_page < 1 or args.last_page < args.first_page:
        raise SystemExit("Intervalo de páginas inválido.")

    args.out.mkdir(parents=True, exist_ok=True)
    text_parts: list[str] = []
    pages: list[dict] = []
    total_chars_raw = 0
    total_chars_clean = 0
    total_hyphenated = 0
    total_page_numbers = 0

    with pdfplumber.open(args.pdf) as pdf:
        total_pages = len(pdf.pages)
        if args.last_page > total_pages:
            raise SystemExit(
                f"O PDF tem {total_pages} páginas; "
                f"o intervalo pede até {args.last_page}."
            )
        for number in range(args.first_page, args.last_page + 1):
            raw = pdf.pages[number - 1].extract_text() or ""
            clean, hyphenated, removed = clean_page(raw)
            total_chars_raw += len(raw)
            total_chars_clean += len(clean)
            total_hyphenated += hyphenated
            total_page_numbers += removed
            pages.append(
                {
                    "page": number,
                    "chars_raw": len(raw),
                    "chars_clean": len(clean),
                    "hyphenated_line_ends": hyphenated,
                    "page_number_removed": bool(removed),
                }
            )
            text_parts.append(f"\n\n===== Página {number} =====\n{clean}")

    text = "".join(text_parts).lstrip()
    (args.out / "licoes.txt").write_text(text, encoding="utf-8")

    chunks = re.split(r"(?m)^Lição\s+(\d+)\s*$", text)
    lessons = []
    section_headings = 0
    questions = 0
    for index in range(1, len(chunks) - 1, 2):
        number = int(chunks[index])
        body = chunks[index + 1]
        before_questions, _, after_questions = body.partition("Para pensar e agir")
        question_block, _, _ = after_questions.partition("Leitura Diária")
        lesson_headings = len(
            re.findall(r"(?m)^\d+\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]", before_questions)
        )
        lesson_questions = len(
            re.findall(r"(?m)^\d+\.\s+", question_block)
        )
        section_headings += lesson_headings
        questions += lesson_questions
        lessons.append(
            {
                "number": number,
                "section_headings": lesson_headings,
                "questions": lesson_questions,
                "has_para_pensar": "Para pensar e agir" in body,
                "has_leitura_diaria": "Leitura Diária" in body,
            }
        )

    stats = {
        "file_name": args.pdf.name,
        "sha256": sha256(args.pdf),
        "size_bytes": args.pdf.stat().st_size,
        "page_count": total_pages,
        "range": {"first": args.first_page, "last": args.last_page},
        "chars_raw": total_chars_raw,
        "chars_clean": total_chars_clean,
        "hyphenated_line_ends": total_hyphenated,
        "page_numbers_removed": total_page_numbers,
        "lessons_detected": len(lessons),
        "section_headings_detected": section_headings,
        "questions_detected": questions,
        "has_para_pensar": "Para pensar e agir" in text,
        "has_leitura_diaria": "Leitura Diária" in text,
        "lessons": lessons,
        "pages": pages,
    }
    (args.out / "estatisticas.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(json.dumps({k: v for k, v in stats.items() if k != "pages"}, ensure_ascii=False, indent=2))
    print(f"\nSaída: {args.out / 'licoes.txt'}")
    print(f"Saída: {args.out / 'estatisticas.json'}")


if __name__ == "__main__":
    main()
