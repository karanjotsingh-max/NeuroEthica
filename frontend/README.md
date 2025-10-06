🧠 NeuroEthica – Unified Backend & Frontend
# 🧠 NeuroEthica – Unified Backend & Frontend

**NeuroEthica** is a full-stack research project integrating **brain-signal visualization** (EEG via Muse 2) and an **AI-powered bioscience chatbot (SpaceBio)** into one unified dashboard.  
It combines real-time neural data streaming with machine learning and a retrieval-augmented knowledge graph for NASA bioscience publications.

---

## 🚀 Key Features
- ⚡ **Real-time EEG data capture** and band-power visualization (FastAPI + Muse 2)  
- 🤖 **Gemini 1.5 Pro chatbot** with scientific literature retrieval (SpaceBio)  
- 🧩 **Unified FastAPI backend** (`unified_server.py`) combining EEG + Chatbot modules  
- 💻 **Next.js + TypeScript frontend** for live dashboards and user interaction  

---

## ⚙️ Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # (Windows)
# source .venv/bin/activate  # (Linux/Mac)

# Install dependencies
pip install -r requirements.txt

# Run unified FastAPI server
uvicorn unified_server:app --reload --port 8000
```

### Endpoints
- **Chatbot Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
- **EEG:**
  - `GET /health`
  - `GET /stats`
  - `GET /bands`
  - `WS /ws/eeg`

---

## 💻 Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Next.js app
npm run dev
```

Access the dashboard at → [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
NeuroEthica/
├── backend/
│   ├── app.py                 # Chatbot backend (SpaceBio)
│   ├── main.py                # EEG backend (Muse 2)
│   ├── unified_server.py      # Unified FastAPI launcher
│   ├── requirements.txt
│   └── artifacts/             # Embeddings & chunk data
└── frontend/
    ├── app/                   # Next.js 13+ routes (chatbot, classifier, etc.)
    ├── components/
    ├── public/
    └── package.json
```

---

## 🧩 Requirements Summary

See `backend/requirements.txt` for detailed dependencies.  
Main stack versions:
```
fastapi==0.110.0
uvicorn[standard]==0.27.1
pydantic==2.6.1
numpy==1.26.4
scikit-learn==1.4.1.post1
PyMuPDF==1.24.9
python-dotenv==1.0.1
tqdm==4.66.4
neo4j==5.24.0
sentence-transformers==2.7.0
torch==2.2.2
pylsl==1.16.2
```

---

## 👨‍💻 Credits
Developed by **Karanjot Singh** and collaborators as part of the **NASA Hackathon (NeuroEthica)** initiative.

---

