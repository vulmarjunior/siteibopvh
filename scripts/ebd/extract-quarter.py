#!/usr/bin/env python3
"""Extrai o trimestre completo da revista da EBD para o esquema de importação v1.0.0.

O PDF e o texto extraído NÃO são versionados. O script é reproduzível e não
contém o conteúdo da revista: ele lê o PDF local, monta o JSON estruturado e
grava o resultado onde for indicado (normalmente em `materiais/`, ignorado pelo
Git).

Uso:
    python scripts/ebd/extract-quarter.py \
        --pdf materiais/ebd/2022/1T/adultos/PalavraeVida-1T2022-Digital.pdf \
        --out materiais/ebd/2022/1T/adultos/importacao-1t2022-completo.json

Requisitos: Python 3.10+ e pdfplumber.

O script usa o Sumário para títulos e páginas iniciais e a página de título de
cada lição para o texto base. O deslocamento entre página impressa e página do
PDF é configurável (`--page-offset`, padrão 2 nesta edição).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

try:
    import pdfplumber
except ImportError as error:  # pragma: no cover - mensagem de ambiente
    raise SystemExit("Instale pdfplumber: pip install pdfplumber") from error


DAY_PATTERN = re.compile(r"^(SEG|TER|QUA|QUI|SEX|SÁB|DOM)\s+(.+)$")
LESSON_PATTERN = re.compile(r"Lição\s+(\d{1,2})")
NUMBER_PATTERN = re.compile(r"^\d{1,3}$")
SECTION_PATTERN = re.compile(r"^(\d+)\.\s+(.+)$")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text.replace("impor tante", "importante")


def line_records(page) -> list[dict]:
    records: list[dict] = []
    for line in page.extract_text_lines():
        text = line["text"].strip()
        if not text:
            continue
        if line["x0"] > 450 and NUMBER_PATTERN.match(text):
            continue  # número impresso no rodapé
        sizes = [round(character["size"], 1) for character in line["chars"]]
        records.append(
            {
                "text": text,
                "x0": round(line["x0"], 1),
                "top": round(line["top"], 1),
                "size": max(set(sizes), key=sizes.count),
            }
        )
    return records


def parse_summary(pdf, summary_page: int = 3) -> tuple[dict[int, dict], int | None]:
    """Lê o Sumário por coordenadas, inclusive lições com título em duas linhas."""
    records = line_records(pdf.pages[summary_page - 1])
    entries: dict[int, dict] = {}
    ficha_page: int | None = None

    for record in records:
        if "Ficha Técnica" in record["text"]:
            for candidate in records:
                if abs(candidate["top"] - record["top"]) <= 15 and NUMBER_PATTERN.match(candidate["text"]):
                    ficha_page = int(candidate["text"])
                    break

    for record in records:
        match = LESSON_PATTERN.search(record["text"])
        if not match:
            continue
        number = int(match.group(1))

        page_number: int | None = None
        leading = re.match(r"^(\d{1,3})\b", record["text"])
        if leading:
            page_number = int(leading.group(1))
        else:
            for candidate in records:
                if (
                    NUMBER_PATTERN.match(candidate["text"])
                    and abs(candidate["top"] - record["top"]) <= 15
                ):
                    page_number = int(candidate["text"])
                    break

        after = record["text"][match.end() :].strip()
        fragments: list[tuple[float, str]] = []
        if after:
            fragments.append((record["top"], after))

        # Títulos quebrados em duas linhas (ex.: Lições 10 e 13). A coluna de
        # títulos começa depois dos números e do rótulo "Lição".
        for candidate in records:
            if candidate is record or candidate["x0"] < 200:
                continue
            if "Lição" in candidate["text"] or "Ficha Técnica" in candidate["text"]:
                continue
            if candidate["size"] > 40:
                continue
            if not (record["top"] - 25 <= candidate["top"] <= record["top"] + 60):
                continue
            if after and candidate["text"].strip() == after:
                continue
            fragments.append((candidate["top"], candidate["text"]))

        fragments.sort(key=lambda item: item[0])
        title = normalize_text(" ".join(part for _, part in fragments))
        if page_number is None:
            raise SystemExit(f"Sumário: página inicial não encontrada para a lição {number}.")
        if not title:
            raise SystemExit(f"Sumário: título não encontrado para a lição {number}.")

        entries[number] = {"start_page": page_number, "title": title}

    return entries, ficha_page


def title_from_title_page(pdf, pdf_page: int) -> str:
    records = line_records(pdf.pages[pdf_page - 1])
    title_lines = [record["text"] for record in records if record["size"] >= 100]
    return normalize_text(" ".join(title_lines))


def base_text_from_title_page(pdf, pdf_page: int) -> str:
    for record in line_records(pdf.pages[pdf_page - 1]):
        if record["text"].lower().startswith("texto base:"):
            return normalize_text(record["text"].split(":", 1)[1])
    return ""


def join_hyphenated(records: list[dict]) -> list[dict]:
    merged: list[dict] = []
    for record in records:
        text = record["text"]
        if merged and merged[-1]["text"].endswith("-") and re.match(r"^[a-záéíóúâêôãõç]", text):
            merged[-1]["text"] = merged[-1]["text"][:-1] + text
            continue
        merged.append(dict(record))
    return merged


def blocks_from(records: list[dict], pages: set[int]) -> list[dict]:
    blocks: list[dict] = []
    paragraph: str | None = None
    heading: str | None = None

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            blocks.append({"type": "paragraph", "text": paragraph.strip()})
            paragraph = None

    def flush_heading() -> None:
        nonlocal heading
        if heading:
            blocks.append({"type": "heading", "text": heading.strip()})
            heading = None

    for record in records:
        if record["page"] not in pages:
            continue
        text = record["text"]
        if record["size"] >= 100:
            continue
        if text.lower().startswith("leitura diária"):
            flush_paragraph()
            flush_heading()
            blocks.append({"type": "heading", "text": text})
            continue
        if DAY_PATTERN.match(text):
            flush_paragraph()
            flush_heading()
            blocks.append({"type": "paragraph", "text": text})
            continue
        if record["size"] >= 48:
            flush_paragraph()
            heading = f"{heading} {text}" if heading else text
            continue
        flush_heading()
        if record["x0"] >= 110:
            if paragraph:
                pending = paragraph.rstrip()
                # Continuação de item de lista/intervalo: "(Êx 7:14-" + "17);"
                if pending.endswith("-") and re.match(r"^\d", text):
                    paragraph = pending + text
                    continue
                # Continuação de referência com parêntese aberto: "Êx" + "11,12)."
                if pending.count("(") > pending.count(")") and re.match(r"^[\d(]", text):
                    paragraph = f"{pending} {text}"
                    continue
            flush_paragraph()
            paragraph = text
        else:
            paragraph = f"{paragraph} {text}" if paragraph else text

    flush_paragraph()
    flush_heading()
    return blocks


def parse_lesson(
    pdf,
    number: int,
    summary: dict[int, dict],
    all_summary: dict[int, dict],
    quarter_end: int,
    page_offset: int,
    source_hash: str,
) -> dict:
    meta = summary[number]
    start_page = meta["start_page"]
    following = sorted(
        item["start_page"] for item in all_summary.values() if item["start_page"] > start_page
    )
    end_page = (min(following) - 1) if following else quarter_end
    if end_page < start_page:
        raise SystemExit(f"Lição {number}: intervalo de páginas inválido.")

    content_pages = list(range(start_page + page_offset + 1, end_page + page_offset + 1))
    records = join_hyphenated(
        [
            {**record, "page": page_number}
            for page_number in content_pages
            for record in line_records(pdf.pages[page_number - 1])
        ]
    )
    blocks = blocks_from(records, set(content_pages))

    introduction: list[str] = []
    sections: list[dict] = []
    questions: list[dict] = []
    readings: list[dict] = []
    mode = "intro"
    current_section: dict | None = None
    current_question: dict | None = None

    for block in blocks:
        text = normalize_text(block["text"])
        if not text:
            continue
        if block["type"] == "heading":
            if text.lower().startswith("para pensar e agir"):
                mode = "questions"
                continue
            if text.lower().startswith("leitura diária"):
                mode = "readings"
                continue
            numbered = SECTION_PATTERN.match(text)
            if numbered and mode in ("intro", "sections"):
                mode = "sections"
                current_section = {
                    "number": int(numbered.group(1)),
                    "title": numbered.group(2),
                    "paragraphs": [],
                }
                sections.append(current_section)
                continue
            if mode == "intro":
                introduction.append(text)
            elif mode == "sections" and current_section is not None:
                current_section["paragraphs"].append(text)
            continue

        if mode == "intro":
            introduction.append(text)
        elif mode == "sections" and current_section is not None:
            current_section["paragraphs"].append(text)
        elif mode == "questions":
            question = re.match(r"^(\d+)\.\s*(.+)$", text)
            if question:
                current_question = {"number": int(question.group(1)), "text": question.group(2).strip()}
                questions.append(current_question)
            elif current_question is not None:
                current_question["text"] = f"{current_question['text']} {text}".strip()
        elif mode == "readings":
            reading = DAY_PATTERN.match(text)
            if reading:
                readings.append({"day": reading.group(1), "reference": reading.group(2).strip()})
            elif readings:
                readings[-1]["reference"] = f"{readings[-1]['reference']} {text}".strip()

    base_text = base_text_from_title_page(pdf, start_page + page_offset)
    title = meta["title"] or title_from_title_page(pdf, start_page + page_offset)
    if not base_text:
        raise SystemExit(f"Lição {number}: texto base não encontrado.")
    if not sections:
        raise SystemExit(f"Lição {number}: nenhuma seção reconhecida.")
    if not any(section["paragraphs"] for section in sections):
        raise SystemExit(f"Lição {number}: seções sem parágrafos.")

    warnings: list[str] = []
    if not introduction:
        warnings.append("introdução vazia")
    if not questions:
        warnings.append("sem perguntas")
    if not readings:
        warnings.append("sem leitura diária")

    return {
        "number": number,
        "title": normalize_text(title),
        "base_text": base_text,
        "start_page": start_page,
        "end_page": end_page,
        "introduction": introduction,
        "sections": sections,
        "questions": questions,
        "daily_readings": readings,
        "figures": [],
        "review": {
            "status": "draft",
            "reviewer": None,
            "reviewed_at": None,
            "source_hash": source_hash,
        },
        "_warnings": warnings,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--first-lesson", type=int, default=1)
    parser.add_argument("--last-lesson", type=int, default=13)
    parser.add_argument("--summary-page", type=int, default=3)
    parser.add_argument("--page-offset", type=int, default=2)
    parser.add_argument("--publisher", default="Convenção Batista Fluminense")
    parser.add_argument("--edition-title", default="Revista de Jovens e Adultos")
    parser.add_argument("--year", type=int, default=2022)
    parser.add_argument("--quarter", type=int, default=1)
    parser.add_argument("--issue", type=int, default=72)
    parser.add_argument("--volume", type=int, default=18)
    parser.add_argument("--class", dest="class_name", default="Adultos")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    pdf_path = args.pdf.resolve()
    if not pdf_path.is_file():
        raise SystemExit(f"PDF não encontrado: {pdf_path}")
    if not (1 <= args.first_lesson <= args.last_lesson):
        raise SystemExit("Intervalo de lições inválido.")
    if args.page_offset < 0:
        raise SystemExit("page-offset inválido.")

    with pdfplumber.open(pdf_path) as pdf:
        summary, ficha_page = parse_summary(pdf, args.summary_page)
        missing = [
            number
            for number in range(args.first_lesson, args.last_lesson + 1)
            if number not in summary
        ]
        if missing:
            raise SystemExit(f"Lições ausentes no Sumário: {missing}")
        quarter_end = (ficha_page - 1) if ficha_page else max(
            entry["start_page"] for entry in summary.values()
        ) + 8

        lessons = []
        source_hash = sha256(pdf_path)
        for number in range(args.first_lesson, args.last_lesson + 1):
            lesson = parse_lesson(
                pdf,
                number,
                summary,
                summary,
                quarter_end,
                args.page_offset,
                source_hash,
            )
            lessons.append(lesson)
            warnings = lesson.pop("_warnings", [])
            warning_text = f" — avisos: {', '.join(warnings)}" if warnings else ""
            print(
                f"Lição {number}: {lesson['title']} | "
                f"p. {lesson['start_page']}–{lesson['end_page']} | "
                f"{len(lesson['sections'])} seção(ões), "
                f"{len(lesson['questions'])} pergunta(s), "
                f"{len(lesson['daily_readings'])} leitura(s){warning_text}"
            )

        data = {
            "schema_version": "1.0.0",
            "source": {
                "file_name": pdf_path.name,
                "sha256": source_hash,
                "page_count": len(pdf.pages),
                "size_bytes": pdf_path.stat().st_size,
            },
            "edition": {
                "publisher": args.publisher,
                "title": args.edition_title,
                "year": args.year,
                "quarter": args.quarter,
                "issue": args.issue,
                "volume": args.volume,
                "class": args.class_name,
            },
            "lessons": lessons,
        }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nJSON gerado: {args.out}")
    print(
        f"{len(lessons)} lição(ões) • "
        f"{len(data['lessons'])} registros • "
        f"SHA-256 do PDF: {data['source']['sha256']}"
    )


if __name__ == "__main__":
    main()
