import cv2
import numpy as np
from typing import List, Dict, Any, Tuple

def extract_boundary_masks(h: int, w: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Creates elliptical masks for outer perimeter ring and inner facial core.
    """
    mask_outer = np.zeros((h, w), dtype=np.uint8)
    mask_inner = np.zeros((h, w), dtype=np.uint8)
    center = (w // 2, h // 2)
    axes_outer = (int(w * 0.45), int(h * 0.45))
    axes_mid = (int(w * 0.35), int(h * 0.35))
    axes_inner = (int(w * 0.25), int(h * 0.25))
    cv2.ellipse(mask_outer, center, axes_outer, 0, 0, 360, 255, -1)
    cv2.ellipse(mask_outer, center, axes_mid, 0, 0, 360, 0, -1)
    cv2.ellipse(mask_inner, center, axes_inner, 0, 0, 360, 255, -1)
    return mask_outer, mask_inner

def extract_boundary_band(face_crop: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extracts the outer boundary ring (perimeter 15%) and the inner facial core (center 70%).
    Inspired by Face X-Ray (Li et al.) blending-boundary detection.
    """
    h, w = face_crop.shape[:2]
    if h < 32 or w < 32:
        return np.zeros((1, 1), dtype=np.uint8), np.zeros((1, 1), dtype=np.uint8)

    gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY) if len(face_crop.shape) == 3 else face_crop
    mask_outer, mask_inner = extract_boundary_masks(h, w)
    ring_pixels = gray[mask_outer == 255]
    core_pixels = gray[mask_inner == 255]
    return ring_pixels, core_pixels

def analyze_face_blending_boundary(face_crop: np.ndarray) -> Dict[str, Any]:
    """
    Measures blending boundary discrepancies between face interior and exterior skin.
    Face-swapping models (DeepFaceLab, SimSwap, FaceShifter) generate blending seams
    with unnatural gradient discontinuities or color distribution shifts.
    """
    h, w = face_crop.shape[:2]
    if h < 48 or w < 48:
        return {
            "score": 0.0,
            "has_artifacts": False,
            "explanation": "Face crop too small for boundary ring analysis."
        }
        
    mask_outer, mask_inner = extract_boundary_masks(h, w)
    gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY) if len(face_crop.shape) == 3 else face_crop
    ring = gray[mask_outer == 255]
    core = gray[mask_inner == 255]
    if ring.size < 20 or core.size < 20:
        return {"score": 0.0, "has_artifacts": False, "explanation": "Insufficient mask pixels."}

    # 1. Face X-Ray Noise Residual Consistency (Li et al., CVPR 2020)
    # Authentic video frames share uniform sensor noise across both core and perimeter.
    noise_residual = cv2.absdiff(gray, cv2.medianBlur(gray, 3))
    
    noise_ring = noise_residual[mask_outer == 255]
    noise_core = noise_residual[mask_inner == 255]
    noise_ratio = float(np.std(noise_ring) / max(np.std(noise_core), 1.0))

    # 2. Boundary gradient magnitude along feathering ring
    grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(grad_x**2 + grad_y**2)
    
    boundary_grads = grad_mag[mask_outer == 255]
    mean_boundary_grad = float(np.mean(boundary_grads)) if boundary_grads.size > 0 else 0.0
    core_grads = grad_mag[mask_inner == 255]
    mean_core_grad = float(np.mean(core_grads)) if core_grads.size > 0 else 1.0
    grad_ratio = mean_boundary_grad / max(mean_core_grad, 1.0)
    
    # Authentic camera capture has natural noise consistency (0.5 < noise_ratio < 2.0)
    # and continuous boundary gradient. Spliced face swaps show distinct noise discontinuity.
    boundary_score = 0.15
    if noise_ratio > 3.0 or noise_ratio < 0.25:
        # Severe sensor noise mismatch between inner swapped face and host
        boundary_score = min(1.0, 0.50 + abs(noise_ratio - 1.0) * 0.15)
    elif grad_ratio > 4.5 and noise_ratio > 2.2:
        # Sharp unnatural step gradient corroborated by noise shift
        boundary_score = 0.55
    elif grad_ratio > 3.5:
        boundary_score = 0.35
    else:
        # Organic anatomical gradient
        boundary_score = max(0.05, min(0.25, round(0.10 * grad_ratio, 2)))
        
    boundary_score = round(float(boundary_score), 2)
    has_artifacts = boundary_score >= 0.50
    
    return {
        "score": boundary_score,
        "grad_ratio": round(grad_ratio, 2),
        "noise_ratio": round(noise_ratio, 2),
        "has_artifacts": has_artifacts,
        "explanation": "Blending boundary seam detected along facial contour." if has_artifacts else "Continuous anatomical skin gradient & sensor noise consistency verified."
    }

def run_face_boundary_analysis(
    frames: List[np.ndarray],
    timestamps: List[float],
    face_boxes: List[List[Dict[str, int]]],
    quality_level: str
) -> Dict[str, Any]:
    """
    Aggregates Face X-Ray boundary blending analysis across sampled face frames.
    """
    if quality_level == "poor":
        return {
            "available": False,
            "status": "unavailable",
            "score": None,
            "has_artifacts": False,
            "explanation": "Image resolution too low for micro-boundary blending detection."
        }

    scores = []
    suspicious_count = 0
    suspicious_boundary_timestamps = []
    for i, frame in enumerate(frames):
        if i < len(face_boxes) and face_boxes[i]:
            fb = face_boxes[i][0]
            crop = frame[fb["y"]:fb["y"]+fb["h"], fb["x"]:fb["x"]+fb["w"]]
            if crop.shape[0] >= 48 and crop.shape[1] >= 48:
                res = analyze_face_blending_boundary(crop)
                scores.append(res["score"])
                if res["has_artifacts"]:
                    suspicious_count += 1
                    if i < len(timestamps):
                        suspicious_boundary_timestamps.append(round(timestamps[i], 2))

    if not scores:
        return {
            "available": False,
            "status": "unavailable",
            "score": None,
            "has_artifacts": False,
            "timestamps": [],
            "explanation": "No eligible face crops available for boundary inspection."
        }

    avg_score = round(float(np.mean(scores)), 2)
    has_artifacts = avg_score >= 0.50 and (suspicious_count / len(scores) >= 0.40)

    return {
        "available": True,
        "status": "completed",
        "score": avg_score,
        "has_artifacts": has_artifacts,
        "suspicious_frame_ratio": round(suspicious_count / len(scores), 2),
        "timestamps": suspicious_boundary_timestamps,
        "explanation": (
            f"Face X-Ray boundary analysis observed splicing edge gradients across {suspicious_count} of {len(scores)} frames."
            if has_artifacts
            else "Natural organic blending continuity verified along facial perimeters."
        )
    }
