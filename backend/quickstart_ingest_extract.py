import json, re
from pathlib import Path
from ingest import ingest_pdfs
from extractors import rule_based_extract
from tqdm import tqdm

PDFS = Path("data/pdfs")
DATA = Path("data")
DATA.mkdir(parents=True, exist_ok=True)

def group_by_doc(chunks_path: Path):
    docs = {}
    for line in chunks_path.open("r", encoding="utf-8"):
        ch = json.loads(line)
        docs.setdefault(ch["doc_id"], []).append(ch)
    return docs

def main():
    ingest_pdfs(PDFS, DATA / "parsed.jsonl", chunk_size=1200, chunk_overlap=150, min_chunk_len=300)
    docs = group_by_doc(DATA / "parsed.jsonl")
    out = (DATA / "extractions.jsonl").open("w", encoding="utf-8")
    for doc_id, chunks in tqdm(docs.items()):
        title = chunks[0].get("title")
        text = "\n".join(c["text"] for c in chunks)
        year = None
        doi = None
        ym = re.search(r"\b(19|20)\d{2}\b", text)
        if ym: year = int(ym.group(0))
        dm = re.search(r"doi:\s*([\w./-]+)", text, re.I)
        if dm: doi = dm.group(1)
        pub = rule_based_extract(doc_id, title, year, doi, chunks)
        out.write(pub.model_dump_json() + "\n")
    out.close()
    print("Wrote:", DATA / "parsed.jsonl", DATA / "extractions.jsonl")

if __name__ == "__main__":
    main()
