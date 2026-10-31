import os
import cv2
import tempfile
import numpy as np
from typing import Tuple, List, Dict, Any

def process_uploaded_video(
    file_bytes: bytes,
    filename: str,
    max_frames_to_sample: int = 40
) -> Tuple[Dict[str, Any], List[np.ndarray], List[float], str]:
    """
    Saves uploaded video to a secure temporary file, decodes frames with OpenCV,
    extracts metadata (fps, duration, resolution), and samples frames uniformly
    with their associated video timestamps in seconds.
    
    Returns:
        metadata: Dict containing duration, fps, resolution, width, height, total_frames
        sampled_frames: List of BGR numpy frame arrays
        timestamps: List of timestamp floats (in seconds) for each sampled frame
        temp_file_path: Path to temporary file (must be removed after analysis)
    """
    ext = os.path.splitext(filename)[1] or ".mp4"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_file.write(file_bytes)
    temp_file.close()
    temp_path = temp_file.name

    cap = cv2.VideoCapture(temp_path)
    if not cap.isOpened():
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise ValueError(f"Unable to decode video format for {filename}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or np.isnan(fps):
        fps = 25.0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = float(total_frames / fps) if total_frames > 0 else 0.0

    # Determine sampling step
    sample_count = min(max_frames_to_sample, max(5, total_frames)) if total_frames > 0 else max_frames_to_sample
    step = max(1, total_frames // sample_count) if total_frames > 0 else 5

    sampled_frames = []
    timestamps = []

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % step == 0:
            sampled_frames.append(frame)
            current_time = float(frame_idx / fps)
            timestamps.append(round(current_time, 2))
            if len(sampled_frames) >= max_frames_to_sample:
                break
        frame_idx += 1

    cap.release()

    metadata = {
        "width": width,
        "height": height,
        "fps": round(fps, 2),
        "total_frames": total_frames,
        "duration": round(duration, 2),
        "sampled_count": len(sampled_frames)
    }

    return metadata, sampled_frames, timestamps, temp_path
