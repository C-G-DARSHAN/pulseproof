# PulseProof — Adaptive Video Forensics

> **Not just a verdict — the evidence.**  
> An adaptive AI-powered video forensics platform that evaluates video quality to combine visual neural models, temporal frame continuity, and biological signals without asserting unwarranted certainty.

---

## 🏛️ Project Architecture

```text
pulseproof/
├── frontend/                # React + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/      # UI Cards, Player, Timeline, Report Modal
│   │   ├── pages/           # Home, Analysis (Progress), Results
│   │   ├── services/        # api.js & mockData.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/                 # Python + FastAPI + OpenCV
│   ├── main.py              # FastAPI endpoints (/health, /api/analyze)
│   ├── schemas.py           # Pydantic contract models
│   ├── analyzer.py          # Pipeline coordinator
│   ├── quality.py           # Resolution, blur variance & illumination
│   ├── temporal.py          # Frame differences & boundary jitter
│   ├── deepfake_detector.py # Pretrained / frequency-domain detector
│   ├── rppg.py              # Physiological micro-vascular pulse
│   ├── fusion.py            # Adaptive evidence fusion engine
│   └── requirements.txt
├── docs/                    # API contract & architecture
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Frontend Setup (Developer A)

```bash
cd frontend
npm install
npm run dev
```
The React dashboard will be running at `http://localhost:5173`.

### 2. Backend Setup (Developer B)

```bash
cd backend

# Create & activate virtual environment
# On Windows:
python -m venv venv
venv\Scripts\activate

# On macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will run at `http://localhost:8000`.  
Interactive API docs are available at `http://localhost:8000/docs`.

---

## 📡 API Contract

### `POST /api/analyze`
* **Input**: `multipart/form-data` with `file: UploadFile` (MP4, MOV, WebM, AVI).
* **Response**:
```json
{
  "status": "completed",
  "filename": "video.mp4",
  "filesize_mb": 8.4,
  "quality": {
    "level": "moderate",
    "resolution": "1280x720",
    "blur_score": 114.5,
    "brightness_score": 112.4,
    "face_detected": true
  },
  "verdict": "likely_manipulated",
  "verdict_label": "Likely Manipulated",
  "signals": {
    "visual_model": { "status": "completed", "score": 0.81 },
    "temporal_analysis": { "status": "completed", "anomaly_score": 0.68, "timestamps": [1.2, 2.8] },
    "rppg": { "status": "skipped", "reason": "insufficient_signal_quality" },
    "provenance": { "sha256": "9e107d9d...", "findings": [...] }
  },
  "suspicious_timestamps": [1.2, 2.8],
  "evidence_summary": [...],
  "limitations": [...]
}
```

---

## 👥 Two-Laptop Hackathon Workflow (Windows + Mac)

1. Connect both laptops to the same Wi-Fi or mobile hotspot.
2. Mac developer finds their local IP: `ipconfig getifaddr en0` (e.g. `192.168.1.15`).
3. Start FastAPI on Mac with `--host 0.0.0.0`.
4. On Windows, set in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://192.168.1.15:8000
   ```
5. Run `npm run dev` and upload videos directly to the remote AI pipeline!
