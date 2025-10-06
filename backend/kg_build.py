# kg_build.py
import json
from pathlib import Path
from collections import Counter, defaultdict

ART = Path("artifacts")
TRIPLES = ART / "triples.jsonl"
KG_PATH = ART / "kg.json"

triples = [json.loads(l) for l in TRIPLES.open("r", encoding="utf-8")]

# support counts
cnt = Counter((t["s"], t["p"], t["o"]) for t in triples)

# type inference for object node
OTYPE = {
    "uses_model":"Organism","targets":"Tissue","has_exposure":"Exposure",
    "uses_modality":"Modality","finds_pathway":"Pathway",
    "finds_marker":"Marker","reports_outcome":"Outcome"
}

nodes = {}   # id -> {id,type}
edges = []   # {s,p,o,support,confidence}

def add_node(_id, _type):
    if _id not in nodes:
        nodes[_id] = {"id": _id, "type": _type}

for (s,p,o), support in cnt.items():
    add_node(s, "Experiment")
    add_node(o, OTYPE.get(p,"Entity"))
    conf = min(1.0, 0.3 + 0.1*support)  # simple confidence
    edges.append({"s": s, "p": p, "o": o, "support": support, "confidence": round(conf,2)})

kg = {"nodes": list(nodes.values()), "edges": edges}

with KG_PATH.open("w", encoding="utf-8") as f:
    json.dump(kg, f, ensure_ascii=False, indent=2)

print(f"Wrote {KG_PATH}  nodes={len(nodes)}  edges={len(edges)}")
