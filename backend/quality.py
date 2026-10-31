import cv2
import numpy as np
from typing import Dict, Any, List

# Pre-load cascades once
_CASCADE_FRONTAL = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
_CASCADE_FRONTAL_ALT = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')
_CASCADE_PROFILE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

def assess_frame_quality(frame: np.ndarray) -> Dict[str, float]:
    """
    Computes frame sharpness (Laplacian variance), brightness, and RMS contrast.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness_score = float(np.mean(gray))
    contrast_score = float(np.std(gray))
    
    return {
        "blur_score": round(blur_score, 2),
        "brightness_score": round(brightness_score, 2),
        "contrast_score": round(contrast_score, 2)
    }

def detect_faces_in_frame(frame: np.ndarray) -> List[Dict[str, int]]:
    """
    Robust multi-angle face & profile detector.
    Combines frontal default, frontal alt2, and left/right profile cascades.
    Returns list of deduplicated bounding boxes [{"x": x, "y": y, "w": w, "h": h}].
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    h_frame, w_frame = gray.shape[:2]
    
    candidates = []
    
    # 1. Frontal face cascades
    f1 = _CASCADE_FRONTAL.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(42, 42))
    for (x, y, w, h) in f1:
        candidates.append((int(x), int(y), int(w), int(h)))
        
    if len(candidates) == 0:
        f2 = _CASCADE_FRONTAL_ALT.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(36, 36))
        for (x, y, w, h) in f2:
            candidates.append((int(x), int(y), int(w), int(h)))

    # 2. Profile face cascades (Left profile and Right profile via horizontal flip)
    if len(candidates) == 0:
        p_left = _CASCADE_PROFILE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(42, 42))
        for (x, y, w, h) in p_left:
            candidates.append((int(x), int(y), int(w), int(h)))
            
        flipped_gray = cv2.flip(gray, 1)
        p_right = _CASCADE_PROFILE.detectMultiScale(flipped_gray, scaleFactor=1.1, minNeighbors=3, minSize=(42, 42))
        for (fx, fy, fw, fh) in p_right:
            # Map mirrored coordinate back to original frame space
            orig_x = w_frame - (fx + fw)
            candidates.append((int(orig_x), int(fy), int(fw), int(fh)))

    # Deduplicate overlapping bounding boxes (NMS-style)
    face_boxes = []
    for c in candidates:
        cx, cy, cw, ch = c
        is_duplicate = False
        for existing in face_boxes:
            ex, ey, ew, eh = existing["x"], existing["y"], existing["w"], existing["h"]
            # Intersection over Union approximation
            dx = max(0, min(cx + cw, ex + ew) - max(cx, ex))
            dy = max(0, min(cy + ch, ey + eh) - max(cy, ey))
            intersection = dx * dy
            union = (cw * ch) + (ew * eh) - intersection
            if union > 0 and (intersection / union) > 0.35:
                is_duplicate = True
                break
        if not is_duplicate:
            face_boxes.append({"x": cx, "y": cy, "w": cw, "h": ch})

    # Sort largest face first
    face_boxes.sort(key=lambda b: b["w"] * b["h"], reverse=True)
    return face_boxes

def evaluate_video_quality(
    width: int,
    height: int,
    fps: float,
    duration: float,
    sample_metrics: List[Dict[str, float]],
    face_detections: List[List[Dict[str, int]]]
) -> Dict[str, Any]:
    """
    Calibrated Quality-Aware Routing.
    
    Categorizes video quality realistically based on empirical camera benchmarks:
    - 'good': Crisp 720p/1080p+, blur >= 45, balanced exposure.
    - 'moderate': Standard web/mobile video (480p - 720p, blur 20 - 45). Fully valid for AI forensics.
    - 'poor': Severely degraded, dark (<20), or unusable footage.
    """
    avg_blur = np.mean([m["blur_score"] for m in sample_metrics]) if sample_metrics else 0.0
    avg_brightness = np.mean([m["brightness_score"] for m in sample_metrics]) if sample_metrics else 0.0
    avg_contrast = np.mean([m.get("contrast_score", 0.0) for m in sample_metrics]) if sample_metrics else 0.0
    
    total_samples = len(face_detections)
    frames_with_faces = sum(1 for faces in face_detections if len(faces) > 0)
    face_visibility_ratio = round(frames_with_faces / max(total_samples, 1), 2)
    
    # Calculate average face crop size
    face_crop_sizes = []
    for frame_faces in face_detections:
        for f in frame_faces:
            face_crop_sizes.append(min(f["w"], f["h"]))
    avg_face_res = int(np.mean(face_crop_sizes)) if face_crop_sizes else 0

    reasons: List[str] = []
    
    # 1. Resolution checks
    is_hd = (width >= 1280 and height >= 720) or (height >= 1280 and width >= 720) or (min(width, height) >= 720)
    is_severely_low_res = (width < 360 or height < 280)
    if is_hd:
        reasons.append(f"High definition resolution ({width}x{height})")
    elif is_severely_low_res:
        reasons.append(f"Sub-standard resolution ({width}x{height}); macroblock distortion expected")
    else:
        reasons.append(f"Standard digital video resolution ({width}x{height})")

    # 2. Sharpness & Blur
    if avg_blur < 18.0:
        reasons.append(f"Severe motion blur / unsharp focus (sharpness index: {round(avg_blur, 1)})")
    elif avg_blur < 45.0:
        reasons.append(f"Moderate camera sharpness (sharpness index: {round(avg_blur, 1)})")
    else:
        reasons.append(f"Crisp frame sharpness (sharpness index: {round(avg_blur, 1)})")

    # 3. Illumination & Contrast
    if avg_brightness < 20.0:
        reasons.append(f"Severely underexposed / dark lighting (brightness: {round(avg_brightness, 1)})")
    elif avg_brightness > 240.0:
        reasons.append(f"Overexposed highlight clipping (brightness: {round(avg_brightness, 1)})")
    else:
        reasons.append(f"Balanced illumination & contrast (brightness: {round(avg_brightness, 1)})")

    # 4. Face presence and ROI size
    face_detected = face_visibility_ratio >= 0.25
    if face_visibility_ratio >= 0.60:
        reasons.append(f"Consistent face tracking across {int(face_visibility_ratio * 100)}% of frames (avg ROI: {avg_face_res}px)")
    elif face_detected:
        reasons.append(f"Intermittent face presence ({int(face_visibility_ratio * 100)}% of frames)")
    else:
        reasons.append("No human face detected; routing to full-frame generative AI synthesis model")

    # 5. Quality Tier Routing
    # Both horizontal landscape HD (>=720p) and vertical smartphone portrait (>=720px length) with sharp face are high quality
    is_mobile_portrait_hd = (max(width, height) >= 720) and (min(width, height) >= 420)
    
    if is_severely_low_res or avg_blur < 18.0 or avg_brightness < 20.0:
        level = "poor"
    elif (is_hd or is_mobile_portrait_hd) and avg_blur >= 35.0 and avg_brightness >= 25.0:
        level = "good"
    else:
        level = "moderate"

    facial_analysis_feasible = face_detected and (avg_face_res >= 38) and (avg_blur >= 18.0)
    rppg_feasible = face_detected and (face_visibility_ratio >= 0.40) and (duration >= 2.0) and (avg_face_res >= 50) and (avg_blur >= 22.0)

    # Calculate explicit candidate features
    res_score = 0.95 if is_hd else (0.85 if is_mobile_portrait_hd else (0.40 if is_severely_low_res else 0.70))
    bright_score = max(0.0, 1.0 - abs(avg_brightness - 128.0) / 128.0)
    
    return {
        "level": level,
        "resolution": f"{width}x{height}",
        "width": width,
        "height": height,
        "fps": round(fps, 2),
        "duration_seconds": round(duration, 2),
        "blur_score": round(float(avg_blur), 2),
        "brightness_score": round(float(avg_brightness), 2),
        "contrast_score": round(float(avg_contrast), 2),
        "resolution_suitability": round(res_score, 2),
        "brightness_suitability": round(bright_score, 2),
        "face_detected": face_detected,
        "face_count": 1 if face_detected else 0,
        "face_visibility_ratio": face_visibility_ratio,
        "avg_face_resolution_px": avg_face_res,
        "reasons": reasons,
        "facial_analysis_feasible": facial_analysis_feasible,
        "rppg_feasible": rppg_feasible
    }
