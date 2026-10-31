from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class VideoQualitySchema(BaseModel):
    level: str = Field(..., description="'good', 'moderate', or 'poor'")
    resolution: str
    width: int
    height: int
    fps: float
    duration_seconds: float
    blur_score: Optional[float] = None
    brightness_score: Optional[float] = None
    contrast_score: Optional[float] = None
    resolution_suitability: Optional[float] = None
    brightness_suitability: Optional[float] = None
    face_detected: bool = False
    face_count: int = 0
    face_visibility_ratio: float = 0.0
    avg_face_resolution_px: int = 0

class PublishedBenchmarkSchema(BaseModel):
    model_architecture: str
    checkpoint: str
    published_auc_ffpp: float
    published_auc_dfdc: str
    benchmark_source: str
    accuracy_caveat: str

class LocalEvaluationSchema(BaseModel):
    status: str
    message: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class VisualSignalResponse(BaseModel):
    available: bool = False
    status: str = Field(..., description="'completed', 'limited', 'unavailable', or 'failed'")
    result: Optional[str] = None
    score: Optional[float] = None
    video_model_score: Optional[float] = None
    frame_model_score: Optional[float] = None
    ai_generated_score: Optional[float] = None
    dima_score: Optional[float] = None
    prithiv_score: Optional[float] = None
    sujith_score: Optional[float] = None
    facial_deepfake_score: Optional[float] = None
    noise_anomaly_score: Optional[float] = None
    spectral_anomaly_score: Optional[float] = None
    models_evaluated_count: Optional[int] = 6
    frames_analyzed: int = 0
    suspicious_frames_count: int = 0
    is_partial_swap: Optional[bool] = False
    suspicious_timestamps: List[float] = Field(default_factory=list)
    published_benchmarks: Optional[PublishedBenchmarkSchema] = None
    explanation: str = ""

class BoundarySignalResponse(BaseModel):
    available: bool = True
    status: str = "completed"
    score: Optional[float] = None
    has_artifacts: bool = False
    suspicious_frame_ratio: Optional[float] = None
    timestamps: List[float] = Field(default_factory=list)
    explanation: str = ""

class TemporalSignalResponse(BaseModel):
    available: bool = True
    status: str = "completed"
    result: Optional[str] = None
    anomaly_score: Optional[float] = None
    timestamps: List[float] = Field(default_factory=list)
    explanation: str = ""

class RppgSignalResponse(BaseModel):
    available: bool = False
    status: str = "skipped"
    reason: Optional[str] = None
    signal_quality: Optional[float] = None
    estimated_bpm: Optional[float] = None
    periodicity_score: Optional[float] = None
    is_cardiac_valid: Optional[bool] = None
    message: str = ""

class ProvenanceSignalResponse(BaseModel):
    available: bool = True
    status: str = "completed"
    sha256: Optional[str] = None
    container: Optional[str] = None
    codec: Optional[str] = None
    has_c2pa: bool = False
    is_ai_origin: Optional[bool] = False
    ai_generator_name: Optional[str] = None
    findings: List[str] = Field(default_factory=list)

class SignalsResponse(BaseModel):
    visual_model: VisualSignalResponse
    boundary_analysis: Optional[BoundarySignalResponse] = None
    temporal_analysis: TemporalSignalResponse
    rppg: RppgSignalResponse
    provenance: ProvenanceSignalResponse

class AnalyzeResponse(BaseModel):
    status: str = "completed"
    filename: str
    filesize_mb: float
    video_quality: VideoQualitySchema
    quality_reasons: List[str] = Field(default_factory=list)
    quality: Optional[VideoQualitySchema] = None
    verdict: str = Field(..., description="'likely_manipulated', 'no_strong_evidence', or 'inconclusive'")
    verdict_label: str
    confidence: Optional[float] = None
    confidence_explanation: Optional[str] = None
    signals: SignalsResponse
    suspicious_timestamps: List[float] = Field(default_factory=list)
    published_benchmarks: Optional[PublishedBenchmarkSchema] = None
    local_evaluation: Optional[LocalEvaluationSchema] = None
    evidence_summary: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
