import json
from pathlib import Path
from collections import defaultdict
import itertools

# Paths
ART = Path("artifacts")
CHUNKS_PATH = ART / "chunks.jsonl"
GRAPH_PATH = ART / "graph_data.json"

# Load parsed chunks
if not CHUNKS_PATH.exists():
    raise FileNotFoundError("❌ chunks.jsonl not found. Run quickstart_ingest_extract.py first.")

print("📥 Loading chunks...")
with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]

# Simple keyword extraction helper
def extract_keywords(text: str):
    keywords = []
    for w in text.lower().split():
        w = w.strip(",.()[]{}:;\"' ")
        if len(w) > 4 and w.isalpha():
            keywords.append(w)
    return keywords[:12]  # limit per chunk

# Build co-occurrence map
print("🔗 Building relationships...")
edges_count = defaultdict(int)
nodes_set = set()

for c in chunks:
    kws = extract_keywords(c.get("text", ""))
    for a, b in itertools.combinations(set(kws), 2):
        edges_count[(a, b)] += 1
    nodes_set.update(kws)

# Build graph structure
nodes = [{"id": n, "label": n} for n in nodes_set]
edges = [{"source": a, "target": b, "weight": w} for (a, b), w in edges_count.items() if w > 1]

graph_data = {"nodes": nodes, "edges": edges}

# Save
GRAPH_PATH.parent.mkdir(exist_ok=True)
with open(GRAPH_PATH, "w", encoding="utf-8") as f:
    json.dump(graph_data, f, indent=2)

print(f"✅ Saved {len(nodes)} nodes and {len(edges)} edges → {GRAPH_PATH}")
