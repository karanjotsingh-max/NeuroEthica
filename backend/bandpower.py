# backend/bandpower.py
# Compute EEG band powers (delta/theta/alpha/beta/gamma) from rolling windows,
# with high-pass filtering and artifact rejection to prevent inflated delta.

from collections import deque
from typing import Dict, List, Iterable
import numpy as np

# ---- Config (tweak safely) ---------------------------------------------------
FS = 256                  # Muse 2 sampling rate (Hz)
WIN_SAMPLES = 512         # ~2 s window for stable spectra
CHANNELS = ["TP9", "AF7", "AF8", "TP10"]

HP_CUTOFF_HZ = 1.0        # high-pass cutoff to reduce drift (1.0–1.5 is typical)
ARTIFACT_PTP_UV = 1500.0  # reject window if peak-to-peak exceeds this (µV)
ARTIFACT_Z_MAX = 6.0      # reject if robust |z| max exceeds this
EPS = 1e-12

# Try SciPy for a nice IIR high-pass; fall back to FIR (NumPy-only) if missing
try:
    from scipy.signal import butter, filtfilt  # type: ignore

    def _highpass(x: np.ndarray, fs: int, cutoff: float = HP_CUTOFF_HZ) -> np.ndarray:
        # 2nd-order Butterworth HPF; filtfilt = zero-phase
        b, a = butter(2, cutoff / (fs / 2.0), btype="highpass")
        return filtfilt(b, a, x, padlen=min(3 * (max(len(a), len(b)) - 1), x.size - 1))
except Exception:
    # NumPy-only FIR HPF via windowed-sinc design (+ FFT-convolution)
    def _highpass(x: np.ndarray, fs: int, cutoff: float = HP_CUTOFF_HZ) -> np.ndarray:
        # Design a short FIR HP (Hamming). Length ~ 0.25 s for decent rolloff.
        taps = max(33, int(0.25 * fs) | 1)  # odd length
        fc = cutoff / (fs / 2.0)            # normalized (0..1)
        n = np.arange(taps) - (taps - 1) / 2.0
        # Ideal low-pass kernel (sinc), then delta - lowpass = highpass
        h_lp = np.sinc(fc * n) * np.hamming(taps)
        h_lp /= (h_lp.sum() + EPS)
        h_hp = -h_lp
        h_hp[(taps - 1)//2] += 1.0
        # FFT conv; 'same' length
        y = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(np.pad(h_hp, (0, x.size - 1 - (taps - 1)), 'constant')))
        return y[:x.size]

# ---- Helpers -----------------------------------------------------------------
def _robust_z(x: np.ndarray) -> np.ndarray:
    # z-score using median and MAD (less sensitive to outliers)
    med = np.median(x)
    mad = np.median(np.abs(x - med)) + EPS
    sigma = 1.4826 * mad
    return (x - med) / (sigma + EPS)

def _bad_window(x: np.ndarray) -> bool:
    # Artifact heuristics: extreme amplitude or extreme robust z
    if np.ptp(x) > ARTIFACT_PTP_UV:
        return True
    if np.max(np.abs(_robust_z(x))) > ARTIFACT_Z_MAX:
        return True
    return False

def _band_edges():
    # (lo, hi) in Hz; gamma capped at 45 Hz for Muse
    return {
        "delta": (0.5, 4.0),
        "theta": (4.0, 8.0),
        "alpha": (8.0, 13.0),
        "beta":  (13.0, 30.0),
        "gamma": (30.0, 45.0),
    }

# ---- Engine ------------------------------------------------------------------
class BandEngine:
    """
    Maintains per-channel rolling buffers and computes band powers when full.
      eng = BandEngine()
      eng.update_batch(samples)   # samples: Iterable[List[float]] shape [N x 4]
      bands = eng.latest_bands()  # dict {ch: {band: power}}
    """
    def __init__(self, fs: int = FS, win_samples: int = WIN_SAMPLES, channels: List[str] = None):
        self.fs = fs
        self.win = win_samples
        self.channels = channels or CHANNELS
        self.buf: Dict[str, deque] = {ch: deque(maxlen=self.win) for ch in self.channels}
        # keep last *good* bands per channel so we don’t regress to zeros on a noisy window
        self._bands: Dict[str, Dict[str, float]] = {ch: {b: 0.0 for b in _band_edges()} for ch in self.channels}

    # ---------------------- public API ----------------------
    def update_batch(self, samples: Iterable[List[float]]) -> None:
        """
        samples: iterable of lists/tuples of 4 floats (TP9, AF7, AF8, TP10)
        """
        for s in samples:
            s4 = list(s)[:4]
            for i, ch in enumerate(self.channels):
                self.buf[ch].append(float(s4[i]))
        if self._buffers_full():
            # compute per-channel; only update a channel if the window is "clean"
            for ch in self.channels:
                x = np.asarray(self.buf[ch], dtype=float)
                bands = self._band_power_clean(x)
                if bands is not None:           # clean window → accept
                    self._bands[ch] = bands
                # else: keep previous bands for this channel

    def latest_bands(self) -> Dict[str, Dict[str, float]]:
        """Returns most-recent band powers (μV^2) once window fills (persists through artifacts)."""
        return {ch: dict(self._bands[ch]) for ch in self.channels}

    # ---------------------- internals -----------------------
    def _buffers_full(self) -> bool:
        return all(len(self.buf[ch]) == self.win for ch in self.channels)

    def _band_power_clean(self, x: np.ndarray) -> Dict[str, float] | None:
        # Detrend (mean remove), high-pass to kill <~1 Hz drift, Hamming window
        x = x - np.mean(x)
        x = _highpass(x, self.fs, HP_CUTOFF_HZ)

        # Reject if the *filtered* window still looks artifacty
        if _bad_window(x):
            return None

        # Window & PSD
        w = np.hamming(x.size)
        xw = x * w
        X = np.fft.rfft(xw)
        freqs = np.fft.rfftfreq(xw.size, d=1.0 / self.fs)
        psd = (np.abs(X) ** 2) / (np.sum(w ** 2) * self.fs + EPS)  # µV^2/Hz
        df = freqs[1] - freqs[0] if len(freqs) > 1 else 0.0

        def integ(lo: float, hi: float) -> float:
            if df == 0.0:
                return 0.0
            m = (freqs >= lo) & (freqs < hi)
            return float(np.sum(psd[m]) * df)

        edges = _band_edges()
        return {band: integ(*edges[band]) for band in edges}
