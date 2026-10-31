# PulseProof

An adaptive, multi-modal video forensics platform engineered to detect deepfakes, localized face swaps, and synthetic media with verifiable, auditable evidence.

---

## Overview

Most deepfake detection tools operate as opaque "black boxes" that output a single confidence percentage. In real-world forensic and journalistic workflows, this approach fails in two major ways:

1. **The Dilution Problem (Partial Deepfakes):** Attackers rarely manipulate an entire video. Splicing a 2-second face swap into a 30-second genuine recording leaves ~93% of the footage untouched. Standard models that compute a global average score will output an overall suspicion score under 15%, letting the manipulation slip through undetected.
2. **False Positives on Genuine Media:** Low-light footage, aggressive platform recompression (e.g., WhatsApp, X, Telegram), and motion blur frequently fool off-the-shelf neural networks, causing them to falsely flag authentic camera video as synthetic.

**PulseProof** addresses these challenges through quality-aware pre-screening, peak-window anomaly pooling, and a multi-layered forensic ensemble that evaluates visual, temporal, biological, and cryptographic signals.

---

## Key Capabilities

- **Quality-Aware Gating (Optical Feasibility):** Before running deep neural models, PulseProof analyzes video resolution, Laplacian edge sharpness, ambient illumination, and facial landmark tracking stability. Degraded or compressed signals are down-weighted or marked as unavailable rather than allowed to produce false positives.
- **Peak-Window Anomaly Localization:** Uses Median Absolute Deviation (MAD) spike detection and contiguous frame windowing to catch brief temporal splices. Even when the overall video average is low, a localized anomaly spike (e.g., 90%+) triggers a manipulation verdict and flags the exact timecode.
- **Multi-Model Neural Ensemble:**
  - **Arko007 CLIP-ViT-L:** 12-frame spatiotemporal adapter for video-level feature consistency.
  - **Sujithg684 EfficientNet-B0:** Specialized in detecting FaceForensics++ C23 compression artifacts.
  - **dima806 & PrithivML ViTs:** Vision Transformers trained on over 140,000 real and synthetic facial crops (covering GANs, Midjourney, StyleGAN, and modern diffusion models).
  - **Calibrated Consensus:** Weights predictions against empirical baseline distributions to eliminate single-model bias.
- **Physical & Biological Forensics:**
  - **Face X-Ray Boundary Analysis:** Scans the facial perimeter for gradient discontinuities and blending seams left by face-swap masks.
  - **Relative Temporal Coherence:** Normalizes facial motion against background camera velocity to detect unnatural micro-jitter without mistaking natural handheld camera shake for tampering.
  - **Physiological rPPG:** Attempts sub-dermal blood volume pulse extraction across facial color channels to verify cardiovascular pulse rhythm. Follows Netherlands Forensic Institute (NFI) guidelines: signal absence under poor lighting is never treated as proof of forgery.
- **Cryptographic Provenance:** Computes a SHA-256 integrity hash and inspects MP4 container atoms (`moov`, `mdat`) for signs of re-muxing or metadata stripping.
- **Forensic Audit Dossier:** Generates a printable, timestamped PDF report complete with baseline reference ranges, timeline markers, and auditable findings.

---

## System Architecture

```text
pulseproof/
├── backend/
│   ├── main.py                  # FastAPI server and REST endpoints
│   ├── analyzer.py              # Central pipeline coordinator
│   ├── quality.py               # Optical feasibility & sharpness pre-screen
│   ├── deepfake_detector.py     # Multi-model neural ensemble (CLIP, EfficientNet, ViTs)
│   ├── boundary_detector.py     # Face X-Ray blending seam analysis
│   ├── temporal.py              # Relative temporal coherence & MAD peak pooling
│   ├── rppg.py                  # Remote photoplethysmography (vascular pulse)
│   ├── provenance.py            # SHA-256 checksum & container atom inspection
│   ├── fusion.py                # Quality-weighted consensus engine
│   ├── report.py                # Forensic summary & audit generation
│   ├── schemas.py               # Pydantic data models
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI cards, timeline, and video player
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page and direct video uploader
│   │   │   ├── Analysis.jsx     # Live pipeline progress state
│   │   │   └── Results.jsx      # Forensic verdict, timeline, and signal breakdown
│   │   ├── services/            # API integration client
│   │   ├── App.jsx              # Application router
│   │   └── index.css            # Tailwind styling
│   └── package.json             # Frontend dependencies
└── README.md
```

---

## Baseline Reference Ranges

To ensure transparency, PulseProof surfaces the empirical baseline range for authentic video alongside every measured metric:

| Metric | Authentic Baseline Range | Description |
| :--- | :--- | :--- |
| **CLIP-ViT Spatiotemporal** | $\le 0.50$ | Video-level feature consistency |
| **EfficientNet-B0 (C23)** | $\le 0.35$ | Compression artifact discrimination |
| **Dual ViT Ensemble** | $\le 0.35$ | Facial generative synthesis detection |
| **Calibrated Suspicion** | $\le 0.48$ | Weighted consensus ($< 0.35$ Authentic, $\ge 0.55$ Manipulated) |
| **Face X-Ray Boundary** | $\le 0.35$ | Mask edge gradient discontinuity |
| **Relative Jitter Index** | $\le 0.25$ | Motion-normalized facial jitter ($0$ flagged spikes) |
| **rPPG Pulse Quality** | $r \ge 0.50$ | Valid cardiovascular rhythm ($58 - 100\text{ BPM}$) |

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & npm
- FFmpeg (optional, recommended for hardware video decoding)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be live at `http://127.0.0.1:8000`. Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The web interface will be available at `http://localhost:5173`.

---

## API Reference

### Analyze Video

`POST /api/analyze`

Accepts a video file upload via `multipart/form-data` and returns a comprehensive forensic report.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file: <binary video file>` (supported formats: MP4, MOV, WebM, AVI)

**Response Structure (excerpt):**
```json
{
  "status": "completed",
  "filename": "sample_clip.mp4",
  "quality": {
    "level": "optimal",
    "resolution": "1920x1080",
    "blur_score": 142.8,
    "brightness_score": 118.2,
    "face_detected": true
  },
  "verdict": "manipulated",
  "verdict_label": "Manipulated / Synthetic Media Detected",
  "integrity_score": 38.5,
  "peak_anomaly_score": 0.92,
  "average_anomaly_score": 0.28,
  "suspicious_timestamps": [1.4, 2.6],
  "signals": {
    "deepfake_ensemble": {
      "status": "usable",
      "calibrated_score": 0.61,
      "models": {
        "clip_spatiotemporal": 0.54,
        "efficientnet_c23": 0.72,
        "vit_ensemble": 0.68
      }
    },
    "boundary": {
      "status": "usable",
      "score": 0.44,
      "seam_detected": true
    },
    "temporal": {
      "status": "usable",
      "jitter_index": 0.38,
      "flagged_spikes": 2
    },
    "rppg": {
      "status": "skipped",
      "reason": "lighting_variation_exceeds_threshold"
    },
    "provenance": {
      "status": "usable",
      "sha256": "7f4c93a02bb411d87e0291f0c2948bb6571fa088d2345bc56885dfa0712ce33a"
    }
  },
  "evidence_summary": [
    "Localized anomaly peak (0.92) detected at 1.4s - 2.6s",
    "Boundary gradient discontinuities identified along jawline perimeter",
    "Temporal velocity mismatch between facial landmarks and scene background"
  ]
}
```

---

## Forensic Principles & Ethics

- **Non-Binary Output:** Real-world footage is noisy. Rather than forcing a binary yes/no, PulseProof supplies layered confidence levels, localized timecodes, and clear signal usability statuses.
- **Fail-Safe Gating:** When video quality degrades past reliable mathematical limits, the platform explicitly notes the limitation rather than presenting speculative findings.
- **Traceable Attribution:** Every finding links to an observable visual, biological, or mathematical anomaly that can be independently audited by a forensic analyst.
