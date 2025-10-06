# 🚀 SpaceBio AI Dashboard

A NASA hackathon project for summarizing and exploring **NASA bioscience publications** related to microgravity and spaceflight biology.  
This pipeline ingests PDFs, chunks and embeds them with open-source models, builds a local vector index, and serves a **FastAPI backend** for querying and getting AI-powered summaries.

---

## ✨ Features
- 📄 **PDF ingestion** → Parse and clean scientific papers.
- 🔍 **Semantic search** → Vector embeddings via [sentence-transformers](https://www.sbert.net).
- 🧠 **Summarization** → Free offline Hugging Face model (`flan-t5-base` by default).
- ⚡ **FastAPI backend** → REST endpoints to query the knowledge base.
- 🖥️ **Dashboard-ready** → Backend can easily connect to a React/Vue/Streamlit UI.

---

## 📂 Project Structure
```
hackathon_spacebio_pipeline/
├── app.py                # FastAPI backend
├── ingest.py             # PDF ingestion + chunking
├── extractors.py         # Metadata/rule-based extractors
├── build_index.py        # Embedding + FAISS/Index builder
├── quickstart_ingest_extract.py # Quick ingestion script
├── data/
│   ├── pdfs/             # Place your PDFs here
│   ├── parsed.jsonl      # Parsed chunks (auto-generated)
│   └── extractions.jsonl # Extracted metadata (auto-generated)
├── artifacts/
│   ├── index.faiss       # Vector index (auto-generated)
│   └── embeddings.npy    # Embeddings (auto-generated)
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup

### 1. Clone repo
```bash
git clone https://github.com/<your-username>/spacebio-dashboard.git
cd spacebio-dashboard
```

### 2. Create virtual environment
```bash
python -m venv .venv
source .venv/bin/activate     # Mac/Linux
.venv\Scripts\activate        # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

---

## 📥 Ingest Data

1. Place your **PDFs** into `data/pdfs/`.
2. Run the quick ingestion pipeline:
```bash
python quickstart_ingest_extract.py
```
This generates:
- `data/parsed.jsonl`
- `data/extractions.jsonl`

3. Build embeddings + FAISS index:
```bash
python build_index.py
```
This creates files under `artifacts/`.

---

## 🚀 Run API
```bash
uvicorn app:app --reload --port 8000
```

Open API docs at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📡 Example Query

POST → `/query`

```json
{
  "query": "What happens to stem cells in microgravity?"
}
```

Response:
```json
{
  "query": "What happens to stem cells in microgravity?",
  "answer": "Stem cells under microgravity show enhanced proliferation, differentiation, and 3D structure formation...",
  "context": [
    {
      "doc_id": "cells-10-00560",
      "title": "Selective Proliferation of Highly Functional Adipose-Derived Stem Cells",
      "page": 1
    }
  ]
}
```

---

## 🛠️ Notes
- Embedding model: `sentence-transformers/all-MiniLM-L6-v2`
- Summarization model: `google/flan-t5-base`
- All runs **offline & free** (no paid API keys needed).
- Add/remove models in `app.py` to adjust performance vs accuracy.

---

## 🙌 Credits
- [NASA Bioscience Publications](https://ntrs.nasa.gov)
- [SentenceTransformers](https://www.sbert.net)
- [HuggingFace Transformers](https://huggingface.co/transformers)
