# backend/main.py
import asyncio, json, contextlib
from typing import Set, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from muse_reader import eeg_batches
from bandpower import BandEngine, CHANNELS, FS  # <-- NEW

# --- simple in-memory stats for verification ---
msg_count = 0
last_sample = None
last_channels: List[str] = []

# --- band-power engine (rolling 2s window) ---
engine = BandEngine(fs=FS)

# --- websocket subscribers ---
subscribers: Set[WebSocket] = set()

async def broadcaster():
    """
    Reads Muse EEG batches from LSL (via BlueMuse) and pushes to all connected WS clients.
    Also updates /stats and /bands so you can verify data without a frontend.
    """
    global msg_count, last_sample, last_channels

    while True:
        try:
            for batch in eeg_batches(batch_size=16):
                msg_count += 1

                # Enforce first 4 channels & samples (ignore AUX, etc.)
                ch = (batch.get("channels") or CHANNELS)[:4]
                samples = [s[:4] for s in batch["samples"]]

                last_channels = ch
                last_sample = samples[-1] if samples else None

                # Update band engine
                engine.update_batch(samples)
                bands = engine.latest_bands() or None

                # Build payload (raw + optional bands)
                payload = json.dumps({
                    "fs": FS,
                    "channels": ch,
                    "samples": samples,    # shape: [batch x 4]
                    "bands": bands         # {"TP9":{"alpha":..}, ...} or null
                })

                dead = []
                for ws in list(subscribers):
                    try:
                        await ws.send_text(payload)
                    except Exception:
                        dead.append(ws)
                for d in dead:
                    subscribers.discard(d)

                await asyncio.sleep(0)  # be cooperative
        except Exception as e:
            print(f"[broadcaster] ERROR: {e}. Retrying in 2s…")
            await asyncio.sleep(2)  # retry if LSL not found / disconnects

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcaster())
    try:
        yield
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task

app = FastAPI(title="Muse2 → WS bridge", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Muse backend up. Connect a WS client to /ws/eeg"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/stats")
def stats():
    """
    Quick verification endpoint.
    If 'messages_sent' increases and 'last_sample' is a list of 4 numbers,
    streaming is working.
    """
    return {
        "messages_sent": msg_count,
        "channels": last_channels,
        "last_sample": last_sample,
    }

@app.get("/bands")
def get_bands():
    """Latest band powers (μV^2) from the ~2 s rolling window per channel."""
    return {"fs": FS, "window": engine.win, "bands": engine.latest_bands()}

@app.websocket("/ws/eeg")
async def ws_eeg(ws: WebSocket):
    await ws.accept()
    subscribers.add(ws)
    try:
        while True:
            await asyncio.sleep(60)  # broadcaster pushes data
    except WebSocketDisconnect:
        subscribers.discard(ws)
