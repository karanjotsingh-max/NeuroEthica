# Reads Muse 2 EEG from BlueMuse (LSL) and yields small batches.
# Compatible with latest pylsl (>=1.16)
# Channels: TP9, AF7, AF8, TP10 @ 256 Hz

from pylsl import resolve_byprop, StreamInlet
from typing import Generator, List, Dict, Any
import time


def eeg_batches(batch_size: int = 16) -> Generator[Dict[str, Any], None, None]:
    print("[Muse Reader] Waiting for EEG LSL stream...")
    # Wait up to 10 seconds for BlueMuse stream to appear
    streams = resolve_byprop('type', 'EEG', timeout=10)
    if not streams:
        raise RuntimeError(
            "No EEG LSL stream found. Make sure BlueMuse is open and 'Streaming: Yes'"
        )

    inlet = StreamInlet(streams[0])
    print(f"[Muse Reader] Connected to stream: {streams[0].name()}")

    # Try to fetch channel names; default to Muse 2 labels
    ch_names = ["TP9", "AF7", "AF8", "TP10"]
    try:
        info = inlet.info()
        desc = info.desc()
        ch = desc.child("channels").child("channel")
        names = []
        while not ch.empty():
            lab = ch.child_value("label")
            if lab:
                names.append(lab)
            ch = ch.next_sibling()
        if names:
            ch_names = names[:4]
    except Exception:
        pass

    buf: List[List[float]] = []
    last_push = time.time()

    while True:
        sample, ts = inlet.pull_sample()  # one EEG sample (4 floats)
        if sample:
            buf.append(sample)
        if len(buf) >= batch_size:
            yield {
                "fs": 256,
                "channels": ch_names,
                "samples": buf,  # shape: [batch_size x 4]
                "timestamp": last_push,
            }
            buf = []
            last_push = time.time()
