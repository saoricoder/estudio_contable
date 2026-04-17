#!/usr/bin/env python3
"""Convierte archivos .md a .pdf usando Markdown + xhtml2pdf (sin Chromium)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import markdown
from xhtml2pdf import pisa


CSS = """
@page { size: A4; margin: 1.8cm; }
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.35;
  color: #0f172a;
}
h1 { font-size: 16pt; margin: 0.6em 0 0.3em; color: #0b1220; }
h2 { font-size: 13pt; margin: 0.8em 0 0.35em; color: #1e293b; }
h3 { font-size: 11pt; margin: 0.6em 0 0.25em; }
p { margin: 0.35em 0; }
table { width: 100%; border-collapse: collapse; margin: 0.6em 0; font-size: 9pt; }
th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
th { background: #f1f5f9; font-weight: bold; }
code, pre { font-family: DejaVu Sans Mono, Courier, monospace; font-size: 8.5pt; }
blockquote { margin: 0.5em 0; padding-left: 0.8em; border-left: 3px solid #94a3b8; color: #475569; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 1em 0; }
ul, ol { margin: 0.35em 0 0.5em 1.2em; }
"""


def md_to_pdf(md_path: Path, pdf_path: Path) -> None:
    raw = md_path.read_text(encoding="utf-8")
    html_body = markdown.markdown(
        raw,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"],
    )
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>{md_path.stem}</title>
<style>{CSS}</style>
</head>
<body>
{html_body}
</body>
</html>"""

    with pdf_path.open("wb") as out:
        status = pisa.CreatePDF(html, dest=out, encoding="utf-8")
    if status.err:
        raise RuntimeError(f"pisa errors for {md_path}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Markdown → PDF")
    ap.add_argument("inputs", nargs="+", type=Path, help="Archivos .md")
    args = ap.parse_args()
    for md in args.inputs:
        if not md.is_file():
            print(f"No existe: {md}", file=sys.stderr)
            return 1
        out = md.with_suffix(".pdf")
        md_to_pdf(md, out)
        print(f"OK: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
