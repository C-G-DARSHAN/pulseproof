# PulseProof API Contract

## AI/ML Module — Member 1

Function:

analyze_video(video_path: str) -> dict

Responsibilities:
- Video preprocessing
- Face detection
- Skin-region extraction
- rPPG analysis
- Physiological signal quality
- Optional visual deepfake detection

Expected response:

{
  "rppg": {
    "status": "analyzed",
    "signal_quality": 0.0,
    "estimated_bpm": null,
    "periodicity_score": null,
    "face_visibility": null,
    "message": ""
  },
  "visual_analysis": {
    "status": "pending",
    "manipulation_risk": null,
    "model": null
  }
}

## Backend Module — Member 2

Responsibilities:
- Receive video uploads
- Validate video files
- Invoke AI analysis
- Calculate SHA-256
- Extract metadata
- Verify provenance
- Return combined results

## API Endpoints

POST /api/analyze
GET /api/analysis/{analysis_id}
GET /api/health
