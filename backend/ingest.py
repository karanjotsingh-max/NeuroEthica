from pathlib import Path
from typing import List, Dict, Any
import fitz
import re, json
from tqdm import tqdm
from utils import clean_text, guess_section
from schemas import Chunk

def parse_pdf(pdf_path: Path) -> Dict[str, Any]:
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        pages.append({"page": i+1, "text": text})
    full_text = "\n".join(p["text"] for p in pages)
    title = full_text.split("\n", 1)[0][:200].strip()
    doi = None
    m = re.search(r"doi:\s*([\w./-]+)", full_text, re.I)
    if m:
        doi = m.group(1)
    year = None
    ym = re.search(r"\b(19|20)\d{2}\b", full_text)
    if ym:
        year = int(ym.group(0))
    return {"title": title, "doi": doi, "year": year, "pages": pages}

def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 150, min_len: int = 300) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        if len(chunk) >= min_len:
            chunks.append(chunk)
        i += (chunk_size - overlap)
    return chunks

def ingest_pdfs(pdf_dir: Path, out_jsonl: Path, chunk_size=1200, chunk_overlap=150, min_chunk_len=300) -> None:
    out = out_jsonl.open("w", encoding="utf-8")
    for pdf in tqdm(sorted(pdf_dir.glob("*.pdf"))):
        parsed = parse_pdf(pdf)
        doc_id = pdf.stem
        for p in parsed["pages"]:
            section = guess_section(parsed.get("title") or "", p["text"])
            text = clean_text(p["text"])[:12000]
            if not text:
                continue
            for idx, chunk in enumerate(chunk_text(text, chunk_size, chunk_overlap, min_chunk_len)):
                ch = Chunk(doc_id=doc_id, title=parsed.get("title"), section=section, page=p["page"], text=chunk)
                out.write(ch.model_dump_json() + "\n")
    out.close()
