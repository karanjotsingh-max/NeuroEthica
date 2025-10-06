# backend/unified_server.py
from fastapi.middleware.cors import CORSMiddleware

# Import the full apps
from main import app as eeg_app      
from app import app as chat_app      

# Use EEG app as the parent so its lifespan() continues to run
app = eeg_app

# Global CORS (adjust for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set your frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pull Chat routes into the same base URL and show them in docs
app.include_router(chat_app.router, tags=["Chat API"])

# Optional: a friendly root listing (EEG routes won’t appear in docs)
@app.get("/_index", include_in_schema=False)
def index():
    return {
        "message": "NeuroEthica Unified API",
        "chat_endpoints": ["/search", "/qa", "/kg", "/kg/neighbors", "/evidence"],
        "eeg_endpoints": ["/health", "/stats", "/bands", "/ws/eeg (WebSocket)"]
    }
