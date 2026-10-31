export const MOCK_LIKELY_MANIPULATED = {
  status: "completed",
  filename: "interview_clip_suspicious.mp4",
  filesize_mb: 8.4,
  quality: {
    level: "moderate",
    resolution: "1280x720",
    width: 1280,
    height: 720,
    fps: 30.0,
    duration_seconds: 6.2,
    blur_score: 114.5,
    brightness_score: 112.4,
    face_detected: true,
    face_count: 1,
    reasons: [
      "Standard HD resolution (1280x720)",
      "Moderate frame sharpness (score: 114.5)",
      "Balanced illumination",
      "Stable primary face visible in 92% of sampled frames"
    ]
  },
  verdict: "likely_manipulated",
  verdict_label: "Likely Manipulated",
  confidence: null,
  confidence_explanation: "Heuristic evidence indicates strong localized facial synthesis without unwarranted calibrated probability claims.",
  signals: {
    visual_model: {
      available: true,
      status: "completed",
      result: "manipulation_detected",
      score: 0.81,
      frames_analyzed: 24,
      suspicious_frames_count: 9,
      explanation: "Neural facial detector flagged 9 frames with unnatural texture smoothing and warping along the jawline and eye contours."
    },
    temporal_analysis: {
      available: true,
      status: "completed",
      result: "anomalies_detected",
      anomaly_score: 0.68,
      timestamps: [1.2, 2.8, 4.4],
      explanation: "Detected 3 temporal jitter moments exceeding motion baseline (face boundary flickering observed at timestamps 00:01, 00:02, and 00:04)."
    },
    rppg: {
      available: false,
      status: "skipped",
      reason: "insufficient_signal_quality",
      signal_quality: 0.28,
      estimated_bpm: null,
      periodicity_score: 0.19,
      message: "Micro-colour physiological variation was skipped due to facial motion jitter and compression artifacts."
    },
    provenance: {
      available: true,
      status: "completed",
      sha256: "9e107d9d372bb6826bd81d3542a419d6dae42e47b1ff40a46b5a3ab95fa53245",
      container: "MP4 / QuickTime",
      codec: "H.264 (avc1)",
      findings: [
        "Container: MP4 / ISO Base Media",
        "Encoding: avc1 (Baseline Profile)",
        "No C2PA / Content Authenticity metadata detected",
        "Video has been re-encoded through modern transcoding pipeline"
      ]
    }
  },
  suspicious_timestamps: [1.2, 2.8, 4.4],
  evidence_summary: [
    "Visual detector confirmed abnormal frequency artifacts on facial ROIs across 9 sampled frames.",
    "Temporal flickering exceeds natural baseline at 00:01, 00:02, and 00:04.",
    "Container metadata indicates re-encoding without C2PA cryptographic signature."
  ],
  limitations: [
    "H.264 compression artifacts could slightly inflate boundary variance.",
    "Absence of physiological rPPG signal prevents secondary biological verification."
  ]
};

export const MOCK_NO_EVIDENCE = {
  status: "completed",
  filename: "authentic_spokesperson_cam.mp4",
  filesize_mb: 14.2,
  quality: {
    level: "good",
    resolution: "1920x1080",
    width: 1920,
    height: 1080,
    fps: 30.0,
    duration_seconds: 8.5,
    blur_score: 182.0,
    brightness_score: 135.0,
    face_detected: true,
    face_count: 1,
    reasons: [
      "High resolution footage (1920x1080)",
      "Crisp frame sharpness (sharpness score: 182.0)",
      "Balanced illumination",
      "Stable primary face visible in 98% of sampled frames"
    ]
  },
  verdict: "no_strong_evidence",
  verdict_label: "No Strong Evidence of Manipulation Found",
  confidence: null,
  confidence_explanation: "All forensic signals remained within standard biological and temporal baselines. Note: Does not guarantee absolute authenticity.",
  signals: {
    visual_model: {
      available: true,
      status: "completed",
      result: "natural_textures",
      score: 0.12,
      frames_analyzed: 32,
      suspicious_frames_count: 0,
      explanation: "No blending boundary artifacts or neural synthesis signatures detected across sampled face frames."
    },
    temporal_analysis: {
      available: true,
      status: "completed",
      result: "continuous",
      anomaly_score: 0.08,
      timestamps: [],
      explanation: "Smooth temporal coherence observed across adjacent frame transitions without abnormal boundary jitter."
    },
    rppg: {
      available: true,
      status: "completed",
      reason: null,
      signal_quality: 0.82,
      estimated_bpm: 72.4,
      periodicity_score: 0.79,
      message: "Coherent periodic micro-vascular colour variation detected consistent with human cardiovascular pulse."
    },
    provenance: {
      available: true,
      status: "completed",
      sha256: "3b29c9bb4f9f257a312015de11cf34a34b3f81e330a4be3596c09f3e536bb337",
      container: "MP4",
      codec: "H.264 (High Profile)",
      findings: [
        "Container: MP4",
        "Original camera sensor timing preserved",
        "Consistent GOP (Group of Pictures) cadence observed"
      ]
    }
  },
  suspicious_timestamps: [],
  evidence_summary: [
    "Visual deepfake model observed natural skin pore textures and organic micro-reflections.",
    "Continuous frame-to-frame temporal coherence with zero flagged spikes.",
    "rPPG module identified coherent pulse signal (estimated ~72 BPM)."
  ],
  limitations: [
    "High-end hyper-realistic generative models can sometimes bypass visual detectors.",
    "Pulse presence supports biological plausibility but is not a standalone cryptographic proof."
  ]
};

export const MOCK_INCONCLUSIVE = {
  status: "completed",
  filename: "cctv_compressed_night.mp4",
  filesize_mb: 3.1,
  quality: {
    level: "poor",
    resolution: "480x360",
    width: 480,
    height: 360,
    fps: 15.0,
    duration_seconds: 4.0,
    blur_score: 28.4,
    brightness_score: 31.2,
    face_detected: true,
    face_count: 1,
    reasons: [
      "Low resolution video (480x360); heavy compression artifacts likely",
      "High motion blur or soft focus (sharpness score: 28.4)",
      "Severe underexposure / dark lighting (brightness: 31.2)",
      "Intermittent face presence (52% of frames)"
    ]
  },
  verdict: "inconclusive",
  verdict_label: "Inconclusive Forensic Evidence",
  confidence: null,
  confidence_explanation: "Severe visual degradation and compression prevent reliable evidence extraction. Returning Inconclusive to avoid false certainty.",
  signals: {
    visual_model: {
      available: false,
      status: "unavailable",
      result: "degraded_input",
      score: null,
      frames_analyzed: 8,
      suspicious_frames_count: 0,
      explanation: "Facial resolution is below the minimum threshold required for reliable neural deepfake discrimination."
    },
    temporal_analysis: {
      available: true,
      status: "completed",
      result: "high_compression_noise",
      anomaly_score: 0.45,
      timestamps: [2.1],
      explanation: "Temporal variations cannot be distinguished from heavy macroblock compression and low framerate dropouts."
    },
    rppg: {
      available: false,
      status: "skipped",
      reason: "low_lighting_and_resolution",
      signal_quality: 0.11,
      estimated_bpm: null,
      periodicity_score: null,
      message: "Insufficient lighting and low resolution prevent optical extraction of micro-vascular color variation."
    },
    provenance: {
      available: true,
      status: "completed",
      sha256: "7f4c93a02bb411d87e0291f0c2948bb6571fa088d2345bc56885dfae1a5a04e1",
      container: "MP4",
      codec: "H.264",
      findings: [
        "Heavy recompression observed",
        "Metadata stripped or absent"
      ]
    }
  },
  suspicious_timestamps: [2.1],
  evidence_summary: [
    "Quality assessment scored video as Poor due to dark lighting and low resolution.",
    "Adaptive fusion engine down-weighted visual detector and skipped rPPG.",
    "System defaulted to Inconclusive rather than asserting false certainty."
  ],
  limitations: [
    "Severe underexposure obliterates facial micro-textures.",
    "Low framerate (15 fps) degrades temporal continuity analysis.",
    "Heavy compression noise triggers false positive boundary artifacts."
  ]
};
