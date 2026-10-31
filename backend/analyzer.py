import os
import time
from typing import Dict, Any

from video_processor import process_uploaded_video
from quality import assess_frame_quality, detect_faces_in_frame, evaluate_video_quality
from deepfake_detector import run_deepfake_detection
from boundary_detector import run_face_boundary_analysis
from temporal import analyze_temporal_inconsistencies
from rppg import analyze_rppg_signals
from provenance import analyze_provenance_and_metadata
from fusion import fuse_forensic_evidence
from evaluation import get_model_evaluation_report

def analyze_video_pipeline(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Executes the adaptive forensic analysis pipeline with strict privacy cleanup.
    """
    start_time = time.time()
    filesize_mb = round(len(file_bytes) / (1024 * 1024), 2)

    # 1. Decode video and extract sampled frames with timestamps
    metadata, frames, timestamps, temp_path = process_uploaded_video(
        file_bytes=file_bytes,
        filename=filename,
        max_frames_to_sample=35
    )

    try:
        # 2. Extract container and provenance metadata
        provenance_signal = analyze_provenance_and_metadata(temp_path, filename)

        # 3. Assess quality and face detection per sampled frame
        sample_metrics = []
        face_boxes_per_frame = []

        for frame in frames:
            metric = assess_frame_quality(frame)
            faces = detect_faces_in_frame(frame)
            sample_metrics.append(metric)
            face_boxes_per_frame.append(faces)

        quality_eval = evaluate_video_quality(
            width=metadata["width"],
            height=metadata["height"],
            fps=metadata["fps"],
            duration=metadata["duration"],
            sample_metrics=sample_metrics,
            face_detections=face_boxes_per_frame
        )

        quality_level = quality_eval["level"]

        # 4. Deepfake Detection (EfficientNet-B4 / xdfdet)
        visual_signal = run_deepfake_detection(
            frames=frames,
            timestamps=timestamps,
            face_boxes=face_boxes_per_frame,
            quality_level=quality_level
        )

        # 5. Face X-Ray Boundary Blending Analysis
        boundary_signal = run_face_boundary_analysis(
            frames=frames,
            timestamps=timestamps,
            face_boxes=face_boxes_per_frame,
            quality_level=quality_level
        )

        # 6. Relative Temporal Continuity & Lip-Sync Analysis
        temporal_signal = analyze_temporal_inconsistencies(
            frames=frames,
            timestamps=timestamps,
            face_boxes_per_frame=face_boxes_per_frame
        )

        # 7. Physiological rPPG Analysis
        rppg_signal = analyze_rppg_signals(
            frames=frames,
            timestamps=timestamps,
            face_boxes=face_boxes_per_frame,
            quality_level=quality_level,
            fps=metadata["fps"]
        )

        # 8. Adaptive Evidence Fusion
        verdict, verdict_label, conf_exp, evidence_summary, limitations = fuse_forensic_evidence(
            quality=quality_eval,
            visual_signal=visual_signal,
            boundary_signal=boundary_signal,
            temporal_signal=temporal_signal,
            rppg_signal=rppg_signal,
            provenance_signal=provenance_signal
        )

        # 9. Evaluation benchmarks reference
        eval_report = get_model_evaluation_report(local_test_results=None)

        elapsed_time = round(time.time() - start_time, 2)
        
        # Unified multi-modal anomaly timeline: merges temporal lip-sync jitter,
        # neural face-swap peaks, and boundary blending seams
        temporal_ts = temporal_signal.get("timestamps", []) or []
        neural_ts = visual_signal.get("suspicious_timestamps", []) or []
        boundary_ts = boundary_signal.get("timestamps", []) or []
        all_suspicious_ts = sorted(list(set(temporal_ts + neural_ts + boundary_ts)))

        quality_data = {
            "level": quality_eval["level"],
            "resolution": quality_eval["resolution"],
            "width": quality_eval["width"],
            "height": quality_eval["height"],
            "fps": quality_eval["fps"],
            "duration_seconds": quality_eval["duration_seconds"],
            "blur_score": quality_eval["blur_score"],
            "brightness_score": quality_eval["brightness_score"],
            "contrast_score": quality_eval.get("contrast_score", 0.0),
            "resolution_suitability": quality_eval.get("resolution_suitability", 0.85),
            "brightness_suitability": quality_eval.get("brightness_suitability", 0.85),
            "face_detected": quality_eval["face_detected"],
            "face_count": quality_eval["face_count"],
            "face_visibility_ratio": quality_eval["face_visibility_ratio"],
            "avg_face_resolution_px": quality_eval["avg_face_resolution_px"]
        }

        return {
            "status": "completed",
            "filename": filename,
            "filesize_mb": filesize_mb,
            "video_quality": quality_data,
            "quality": quality_data,
            "quality_reasons": quality_eval["reasons"],
            "verdict": verdict,
            "verdict_label": verdict_label,
            "confidence": None,
            "confidence_explanation": conf_exp,
            "signals": {
                "visual_model": visual_signal,
                "boundary_analysis": boundary_signal,
                "temporal_analysis": temporal_signal,
                "rppg": rppg_signal,
                "provenance": provenance_signal
            },
            "suspicious_timestamps": all_suspicious_ts,
            "published_benchmarks": visual_signal.get("published_benchmarks"),
            "local_evaluation": eval_report.get("local_evaluation"),
            "evidence_summary": evidence_summary,
            "limitations": limitations,
            "processing_time": elapsed_time
        }

    finally:
        # Guarantee privacy: purge temporary file immediately after processing
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
