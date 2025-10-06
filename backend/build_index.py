import json
import numpy as np
from pathlib import Path
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

DATA = Path("data/parsed.jsonl")
ART = Path("artifacts")
ART.mkdir(parents=True, exist_ok=True)

def embed_chunks(chunks):
    model = SentenceTransformer("all-MiniLM-L6-v2")  # free, 384-dim
    texts = [c["text"][:8000] for c in chunks]
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=True, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings

def main():
    if not DATA.exists():
        raise SystemExit("data/parsed.jsonl not found. Run quickstart_ingest_extract.py first.")
    chunks = [json.loads(l) for l in DATA.open("r", encoding="utf-8")]
    X = embed_chunks(chunks)
    np.save(ART / "embeddings.npy", X)
    (ART / "chunks.jsonl").write_text("\n".join(json.dumps(c) for c in chunks), encoding="utf-8")
    print(f"Built embeddings with {len(chunks)} chunks → artifacts/embeddings.npy")

if __name__ == "__main__":
    main()
