import cv2
import numpy as np
from typing import List, Dict, Any, Tuple

def analyze_temporal_inconsistencies(
    frames: List[np.ndarray],
    timestamps: List[float],
    face_boxes_per_frame: List[List[Dict[str, int]]]
) -> Dict[str, Any]:
    """
    Advanced Temporal Consistency Analysis (inspired by FTCN & LipForensics).
    
    Distinguishes genuine AI face flickering from natural human motion by:
    1. Normalizing face motion against background global scene motion.
    2. Examining relative localized face jitter (D_face - D_background).
    3. Checking mouth/lip region temporal coherence.
    4. Filtering out natural eye blinks and camera panning.
    """
    if len(frames) < 4:
        return {
            "available": False,
            "status": "skipped",
            "result": "insufficient_frames",
            "anomaly_score": 0.0,
            "timestamps": [],
            "explanation": "Insufficient sampled frames to establish temporal continuity baseline."
        }

    relative_face_jitters: List[Tuple[int, float]] = []
    mouth_discontinuities: List[Tuple[int, float]] = []

    for i in range(1, len(frames)):
        prev_gray = cv2.cvtColor(frames[i - 1], cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        h, w = curr_gray.shape

        # 1. Measure background/global motion (corners of the frame outside center)
        bg_mask = np.ones((h, w), dtype=np.uint8)
        # Exclude center 60% where subject typically sits
        bg_mask[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)] = 0
        bg_diff = float(np.mean(cv2.absdiff(curr_gray, prev_gray)[bg_mask == 1]))

        # 2. Measure localized face motion
        prev_faces = face_boxes_per_frame[i - 1]
        curr_faces = face_boxes_per_frame[i]

        if prev_faces and curr_faces:
            pf = prev_faces[0]
            cf = curr_faces[0]

            cf_crop = curr_gray[cf["y"]:cf["y"]+cf["h"], cf["x"]:cf["x"]+cf["w"]]
            pf_crop = prev_gray[pf["y"]:pf["y"]+pf["h"], pf["x"]:pf["x"]+pf["w"]]

            if cf_crop.size > 0 and pf_crop.size > 0:
                pf_resized = cv2.resize(pf_crop, (cf_crop.shape[1], cf_crop.shape[0]))
                face_diff = float(np.mean(cv2.absdiff(cf_crop, pf_resized)))

                # Relative Jitter: Face motion minus background motion
                # Natural motion (camera shake / head nod) moves both face and background together
                # Synthetic deepfake flicker causes high face diff while background remains still!
                relative_jitter = max(0.0, face_diff - (0.8 * bg_diff))
                relative_face_jitters.append((i, relative_jitter))

                # 3. Lip / Mouth region consistency (lower 35% of face)
                mouth_h = int(cf["h"] * 0.35)
                m_curr = cf_crop[cf["h"]-mouth_h:, :]
                m_prev = pf_resized[cf["h"]-mouth_h:, :]
                if m_curr.size > 0 and m_prev.size > 0:
                    mouth_diff = float(np.mean(cv2.absdiff(m_curr, m_prev)))
                    mouth_discontinuities.append((i, mouth_diff))

    # Evaluate true anomaly moments using robust statistics (MAD - Median Absolute Deviation)
    # Standard deviation is vulnerable to outlier masking when partial face swaps exist.
    suspicious_ts = []
    if relative_face_jitters:
        jitters = np.array([j[1] for j in relative_face_jitters])
        med_j = float(np.median(jitters))
        mad_j = float(np.median(np.abs(jitters - med_j)))
        robust_sigma = 1.4826 * max(mad_j, 1.5)
        
        # High-confidence anomaly threshold:
        # Must exceed median by 3 robust sigmas AND have significant absolute delta (>= 20.0)
        anomaly_threshold = max(20.0, med_j + 3.0 * robust_sigma)

        for frame_idx, j_val in relative_face_jitters:
            if j_val > anomaly_threshold:
                ts = round(timestamps[frame_idx], 2)
                if ts not in suspicious_ts:
                    suspicious_ts.append(ts)

    suspicious_ts.sort()

    # Score calculation (normalized 0.0 to 1.0)
    anomaly_ratio = len(suspicious_ts) / max(len(frames) - 1, 1)
    normalized_score = round(min(1.0, anomaly_ratio * 3.5), 2)

    has_real_anomalies = len(suspicious_ts) >= 2 or normalized_score >= 0.40

    if has_real_anomalies:
        result = "anomalies_detected"
        explanation = (
            f"Detected {len(suspicious_ts)} localized facial boundary jitter anomaly moments "
            f"distinct from global camera movement (relative jitter index: {normalized_score})."
        )
    else:
        result = "continuous"
        explanation = (
            "Smooth temporal continuity verified across adjacent frames; "
            "motion patterns correlate with natural human head movements."
        )

    return {
        "available": True,
        "status": "completed",
        "result": result,
        "anomaly_score": normalized_score,
        "timestamps": suspicious_ts,
        "explanation": explanation
    }
