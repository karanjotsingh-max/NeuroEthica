import os
import json
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Body, Query
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables (from .env if present)
load_dotenv()

# ----------------------------
# 🛰️ App metadata
# ----------------------------
app = FastAPI(
    title="SpaceBio AI Dashboard API",
    version="0.7.0 (Gemini 1.5 Pro)",
    description="Retrieval-Augmented Gemini 1.5 Pro model summarizing NASA bioscience publications."
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------
# 📂 Load artifacts
# ----------------------------
ART = Path("artifacts")
CHUNKS = (
    [json.loads(line) for line in (ART / "chunks.jsonl").open("r", encoding="utf-8")]
    if (ART / "chunks.jsonl").exists()
    else []
)
EMB = np.load(ART / "embeddings.npy") if (ART / "embeddings.npy").exists() else None

# ----------------------------
# 🧠 Sentence-Transformer for embeddings
# ----------------------------
MODEL = SentenceTransformer("all-MiniLM-L6-v2")

# ----------------------------
# 🔑 Configure Gemini (v1 API)
# ----------------------------
try:
    import google.generativeai as genai
except ImportError:
    raise ImportError("Install Gemini SDK first: pip install google-generativeai")

GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    try:
        # ✅ Use Gemini 1.5 Pro Latest (model ID must include 'models/')
        GEMINI = genai.GenerativeModel("models/gemini-2.5-pro")
        print("✅ Gemini model 'models/gemini-1.5-pro-latest' loaded successfully.")
    except Exception as e:
        print(f"⚠️ Gemini model initialization failed: {e}")
        GEMINI = None
else:
    GEMINI = None
    print("⚠️ GEMINI_API_KEY not found — using offline fallback summarization.")

# ----------------------------
# 🔍 Helpers
# ----------------------------
def embed_texts(texts: List[str]) -> np.ndarray:
    """Return normalized MiniLM embeddings."""
    return MODEL.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

def topk_cosine(query_vec: np.ndarray, k: int = 8):
    """Return top-k chunks by cosine similarity."""
    assert EMB is not None and len(CHUNKS) == EMB.shape[0], \
        "❌ Embeddings not found — run build_index.py first."
    sims = EMB @ query_vec.T
    idx = np.argsort(-sims.reshape(-1))[:k]
    return idx.tolist()

# ----------------------------
# 🧬 Gemini summarizer
# ----------------------------
def gemini_summary(context_text: str, query: str) -> str:
    """Structured scientific summary via Gemini 1.5 Pro."""
    prompt = f"""
You are an expert NASA biosciences assistant. Use the context below to answer the question.

Respond with **four sections**:

1. **Intro / Summary** – 2–3 lines overview.  
2. **Methods / Experiments** – organisms or models used.  
3. **Results / Key Findings** – biological outcomes or pathways.  
4. **References** – paper titles or DOIs if present.

Question: {query}

Context:
{context_text[:7000]}
"""
    try:
        response = GEMINI.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Gemini summarization failed: {e}"

# ----------------------------
# 🧩 Offline fallback summarizer
# ----------------------------
def fallback_summary(context_text: str, query: str) -> str:
    """Simple extractive backup if Gemini unavailable."""
    snippet = " ".join(context_text.split(". ")[:4])[:800]
    return f"⚠️ Gemini unavailable. Fallback summary:\n\n{snippet}…"

# ----------------------------
# 🔎 Endpoints
# ----------------------------
@app.get("/search")
def search(q: str = Query(..., description="Your search query"), k: int = 8):
    """Semantic search over paper chunks."""
    qv = embed_texts([q])
    idx = topk_cosine(qv, k=k)
    hits = [CHUNKS[i] for i in idx]
    return {"query": q, "hits": hits}

@app.post("/qa")
def qa(payload: Dict[str, Any] = Body(...)):
    """RAG QA endpoint using Gemini 1.5 Pro."""
    q = payload.get("query")
    k = int(payload.get("k", 8))

    qv = embed_texts([q])
    idx = topk_cosine(qv, k=k)
    ctx = [CHUNKS[i] for i in idx]

    context_text = " ".join(c["text"] for c in ctx)
    ans = gemini_summary(context_text, q) if GEMINI else fallback_summary(context_text, q)
    return {"query": q, "answer": ans, "context": ctx}

# === KG endpoints ===
from functools import lru_cache

@lru_cache(maxsize=1)
def load_kg():
    from pathlib import Path
    import json
    ART = Path("artifacts")
    return json.loads((ART / "kg.json").read_text(encoding="utf-8"))

@app.get("/kg")
def get_kg():
    """Return full KG (nodes + edges)."""
    return load_kg()

@app.get("/kg/neighbors")
def kg_neighbors(node_id: str):
    """Return immediate neighbors (edges touching node_id) and their nodes."""
    kg = load_kg()
    nodes_by_id = {n["id"]: n for n in kg["nodes"]}
    touched = [e for e in kg["edges"] if e["s"]==node_id or e["o"]==node_id]
    neighbor_ids = set([node_id] + [e["s"] for e in touched] + [e["o"] for e in touched])
    sub_nodes = [nodes_by_id[i] for i in neighbor_ids if i in nodes_by_id]
    return {"nodes": sub_nodes, "edges": touched}

@app.get("/evidence")
def evidence(paper_id: str, predicate: str = None, object_id: str = None, limit: int = 20):
    """Return supporting snippets from triples.jsonl for a given (paper, p, o)."""
    from pathlib import Path
    import json
    triples_path = Path("artifacts/triples.jsonl")
    out = []
    with triples_path.open("r", encoding="utf-8") as f:
        for line in f:
            t = json.loads(line)
            if t["paper"] != paper_id: 
                continue
            if predicate and t["p"] != predicate: 
                continue
            if object_id and t["o"] != object_id: 
                continue
            out.append(t)
            if len(out) >= limit: 
                break
    return {"paper": paper_id, "predicate": predicate, "object": object_id, "evidence": out}
