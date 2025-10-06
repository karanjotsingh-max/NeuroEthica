# ie_triples.py
import json, re
from pathlib import Path

ART = Path("artifacts")
CHUNKS_PATH = ART / "chunks.jsonl"
TRIPLES_PATH = ART / "triples.jsonl"

# load chunks
chunks = [json.loads(l) for l in CHUNKS_PATH.open("r", encoding="utf-8")]

# small controlled vocabularies (expand as needed)
ORGANISMS = {"mouse","mice","rat","human","hASC","adipose-derived stem cells","iPSC","neural stem cells"}
TISSUES   = {"retina","brain","bone","endothelium","kidney","liver","muscle","hematopoietic"}
EXPOSURES = {"microgravity","simulated microgravity","radiation","ionizing radiation","ISS"}
MODALITY  = {"RNA-seq","scRNA-seq","proteomics","metabolomics","histology","qPCR"}
PATHWAYS  = {"PI3K-Akt","mTOR","Wnt/β-catenin","Notch","Hippo","YAP","TAZ","oxidative stress"}
MARKERS   = {"OCT4","SOX2","NANOG","VEGF","RUNX1","GATA1","SOX17","E-cadherin","vimentin"}
OUTCOMES  = {"spheroid formation","endothelial dysfunction","immune suppression","bone loss","neuroinflammation"}

def find_any(text, vocab):
    return [t for t in vocab if re.search(rf"\b{re.escape(t)}\b", text, re.I)]

def emit_edges(rec):
    paper = rec["doc_id"]
    page  = rec.get("page")
    text  = rec["text"]
    section = rec.get("section","")
    e = {
        "paper": paper, "page": page, "section": section,
        "snippet": text[:320]
    }
    ents = {
        "uses_model":     find_any(text, ORGANISMS),
        "targets":        find_any(text, TISSUES),
        "has_exposure":   find_any(text, EXPOSURES),
        "uses_modality":  find_any(text, MODALITY),
        "finds_pathway":  find_any(text, PATHWAYS),
        "finds_marker":   find_any(text, MARKERS),
        "reports_outcome":find_any(text, OUTCOMES),
    }
    triples = []
    for p, vals in ents.items():
        for o in vals:
            triples.append({"s": paper, "p": p, "o": o, **e})
    return triples

all_triples = []
for ch in chunks:
    all_triples.extend(emit_edges(ch))

with TRIPLES_PATH.open("w", encoding="utf-8") as f:
    for t in all_triples:
        f.write(json.dumps(t, ensure_ascii=False) + "\n")

print(f"Wrote {TRIPLES_PATH} with {len(all_triples)} triples")
