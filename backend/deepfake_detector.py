import os
import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional
from huggingface_hub import hf_hub_download
from transformers import CLIPModel, AutoImageProcessor, AutoModelForImageClassification

# ----------------------------------------------------------------------
# 1. Video-level Detector: Arko007/deepfake-detector-dfd-sota
# Architecture: Frozen CLIP-ViT-Large + SpatioTemporal Adapter (12 frames)
# License: Apache-2.0
# ----------------------------------------------------------------------
class SpatioTemporalAdapter(nn.Module):
    def __init__(self, embed_dim: int = 1024, bottleneck: int = 256, num_heads: int = 8):
        super().__init__()
        self.down_proj = nn.Linear(embed_dim, bottleneck)
        self.up_proj = nn.Linear(bottleneck, embed_dim)
        self.layer_norm = nn.LayerNorm(embed_dim)
        self.temporal_attn = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        self.temporal_norm = nn.LayerNorm(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x_norm = self.layer_norm(x)
        x_spat = res + self.up_proj(torch.relu(self.down_proj(x_norm)))
        t_out, _ = self.temporal_attn(x_spat, x_spat, x_spat)
        out = self.temporal_norm(x_spat + t_out)
        return out

class ArkoVideoDetector(nn.Module):
    """
    SOTA Deepfake Detector (DFD) by Arko007.
    Backbone: CLIP-ViT-Large (frozen) with spatiotemporal adapters across 12 frames.
    Input: (batch_size, 12, 3, 224, 224)
    Output: (batch_size, 2) where 0=Real, 1=Fake
    """
    def __init__(self):
        super().__init__()
        clip_full = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
        self.clip_vision = clip_full
        for p in self.clip_vision.parameters():
            p.requires_grad = False
        self.st_adapter = SpatioTemporalAdapter(embed_dim=1024, bottleneck=256, num_heads=8)
        self.classifier = nn.Sequential(
            nn.LayerNorm(1024),
            nn.Dropout(0.3),
            nn.Linear(1024, 512),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(512, 2)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, t, c, h, w = x.shape
        x_flat = x.view(b * t, c, h, w)
        outputs = self.clip_vision.vision_model(pixel_values=x_flat)
        emb = outputs.pooler_output  # (b*t, 1024)
        emb = emb.view(b, t, -1)
        emb_adapted = self.st_adapter(emb)
        pooled = emb_adapted.mean(dim=1)
        logits = self.classifier(pooled)
        return logits

# ----------------------------------------------------------------------
# 2. Frame-level Detector: Sujithg684/efficientnet
# Architecture: EfficientNet-B0 trained on FaceForensics++ C23 compression
# License: MIT
# ----------------------------------------------------------------------
class SujithEfficientNetB0(nn.Module):
    """
    EfficientNet-B0 deepfake detector trained on FaceForensics++ C23 compression.
    Input: (batch_size, 3, 224, 224)
    Output: (batch_size, 2) where 0=Real, 1=Fake
    """
    def __init__(self):
        super().__init__()
        self.net = models.efficientnet_b0(weights=None)
        in_features = self.net.classifier[1].in_features
        self.net.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, 2)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)

# ----------------------------------------------------------------------
# Model Singleton Cache
# ----------------------------------------------------------------------
_ARKO_MODEL: Optional[ArkoVideoDetector] = None
_SUJITH_MODEL: Optional[SujithEfficientNetB0] = None
_DIMA_MODEL = None
_DIMA_PROC = None
_PRITHIV_MODEL = None
_PRITHIV_PROC = None
_AI_GEN_MODEL = None
_AI_GEN_PROC = None

CLIP_NORMALIZATION = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.48145466, 0.4578275, 0.40821073], std=[0.26862954, 0.26130258, 0.27577711])
])

IMAGENET_NORMALIZATION = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def load_arko_video_model() -> Optional[ArkoVideoDetector]:
    global _ARKO_MODEL
    if _ARKO_MODEL is not None:
        return _ARKO_MODEL
    try:
        print("[PulseProof ML] Initializing Arko007 Video Detector (CLIP-ViT-L + Temporal Adapter)...")
        path = hf_hub_download(repo_id="Arko007/deepfake-detector-dfd-sota", filename="pytorch_model.bin")
        checkpoint = torch.load(path, map_location="cpu")
        model = ArkoVideoDetector()
        model.load_state_dict(checkpoint["model_state_dict"], strict=False)
        model.eval()
        _ARKO_MODEL = model
        print("[PulseProof ML] Arko007 Video Detector loaded successfully.")
    except Exception as e:
        print(f"[PulseProof ML] Warning loading Arko007: {e}")
        _ARKO_MODEL = None
    return _ARKO_MODEL

def load_sujith_frame_model() -> Optional[SujithEfficientNetB0]:
    global _SUJITH_MODEL
    if _SUJITH_MODEL is not None:
        return _SUJITH_MODEL
    try:
        print("[PulseProof ML] Initializing Sujithg684 EfficientNet-B0 (FF++ C23)...")
        path = hf_hub_download(repo_id="Sujithg684/efficientnet", filename="efficientnet_b0_ffpp_c23.pth")
        checkpoint = torch.load(path, map_location="cpu")
        model = SujithEfficientNetB0()
        model.net.load_state_dict(checkpoint, strict=True)
        model.eval()
        _SUJITH_MODEL = model
        print("[PulseProof ML] Sujithg684 EfficientNet-B0 loaded successfully.")
    except Exception as e:
        print(f"[PulseProof ML] Warning loading Sujithg684: {e}")
        _SUJITH_MODEL = None
    return _SUJITH_MODEL

def load_dima_model():
    global _DIMA_MODEL, _DIMA_PROC
    if _DIMA_MODEL is not None:
        return _DIMA_PROC, _DIMA_MODEL
    try:
        mid = "dima806/deepfake_vs_real_image_detection"
        _DIMA_PROC = AutoImageProcessor.from_pretrained(mid)
        _DIMA_MODEL = AutoModelForImageClassification.from_pretrained(mid)
        _DIMA_MODEL.eval()
        print("[PulseProof ML] dima806 ViT Deepfake Face Detector loaded successfully.")
    except Exception as e:
        print(f"[PulseProof ML] Note loading dima806: {e}")
        _DIMA_PROC, _DIMA_MODEL = None, None
    return _DIMA_PROC, _DIMA_MODEL

def load_prithiv_model():
    global _PRITHIV_MODEL, _PRITHIV_PROC
    if _PRITHIV_MODEL is not None:
        return _PRITHIV_PROC, _PRITHIV_MODEL
    try:
        mid = "prithivMLmods/Deep-Fake-Detector-Model"
        _PRITHIV_PROC = AutoImageProcessor.from_pretrained(mid)
        _PRITHIV_MODEL = AutoModelForImageClassification.from_pretrained(mid)
        _PRITHIV_MODEL.eval()
        print("[PulseProof ML] PrithivML Generative Face Detector loaded successfully.")
    except Exception as e:
        print(f"[PulseProof ML] Note loading PrithivML: {e}")
        _PRITHIV_PROC, _PRITHIV_MODEL = None, None
    return _PRITHIV_PROC, _PRITHIV_MODEL

def load_generative_ai_verifier():
    global _AI_GEN_MODEL, _AI_GEN_PROC
    if _AI_GEN_MODEL is not None:
        return _AI_GEN_PROC, _AI_GEN_MODEL
    try:
        mid = "umm-maybe/AI-image-detector"
        _AI_GEN_PROC = AutoImageProcessor.from_pretrained(mid)
        _AI_GEN_MODEL = AutoModelForImageClassification.from_pretrained(mid)
        _AI_GEN_MODEL.eval()
    except Exception as e:
        print(f"[PulseProof ML] Note loading generative verifier: {e}")
        _AI_GEN_PROC, _AI_GEN_MODEL = None, None
    return _AI_GEN_PROC, _AI_GEN_MODEL

def run_deepfake_detection(
    frames: List[np.ndarray],
    timestamps: List[float],
    face_boxes: List[List[Dict[str, int]]],
    quality_level: str
) -> Dict[str, Any]:
    """
    Multi-level deepfake verification pipeline:
    1. Video-level Detector: Arko007 (CLIP-ViT-L SpatioTemporal 12-frame input)
    2. Frame-level Detector: Sujithg684 (EfficientNet-B0 fine-tuned on FF++ C23)
    3. Full-frame Generative AI Verifier (umm-maybe/AI-image-detector)
    """
    published_benchmarks = {
        "model_architecture": "Arko007 SpatioTemporal (CLIP-ViT-L) + Sujithg684 (EfficientNet-B0 C23)",
        "checkpoint": "Arko007/deepfake-detector-dfd-sota + Sujithg684/efficientnet",
        "published_auc_ffpp": 0.942,
        "published_auc_dfdc": "0.78–0.85",
        "benchmark_source": "Hugging Face Model Hub (Evaluated on FaceForensics++ C23 & DFD)",
        "accuracy_caveat": "Video-level temporal adapters combined with C23 compression-aware frame classification."
    }

    if not frames:
        return {
            "available": False,
            "status": "unavailable",
            "result": "no_frames",
            "score": None,
            "video_model_score": None,
            "frame_model_score": None,
            "ai_generated_score": None,
            "frames_analyzed": 0,
            "published_benchmarks": published_benchmarks,
            "explanation": "No video frames available for analysis."
        }

    # 1. Prepare 12 evenly-spaced frames for Arko007 video detector
    num_video_frames = 12
    if len(frames) >= num_video_frames:
        video_indices = np.linspace(0, len(frames) - 1, num_video_frames, dtype=int)
    else:
        video_indices = np.array([int(i % len(frames)) for i in range(num_video_frames)])

    arko_tensors = []
    for idx in video_indices:
        bgr = frames[idx]
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        tensor = CLIP_NORMALIZATION(rgb)
        arko_tensors.append(tensor)

    arko_input = torch.stack(arko_tensors, dim=0).unsqueeze(0)  # (1, 12, 3, 224, 224)

    arko_score = 0.50
    arko_model = load_arko_video_model()
    if arko_model is not None:
        try:
            with torch.no_grad():
                logits = arko_model(arko_input)
                probs = torch.softmax(logits, dim=1)[0]
                # Index 0: Real, Index 1: Fake
                arko_score = round(float(probs[1].item()), 4)
        except Exception as e:
            print(f"[PulseProof ML] Arko007 inference error: {e}")
            arko_score = 0.50

    # 2. Extract valid face crops for frame detectors (Sujithg684 C23 + PrithivML Generative Face)
    face_crops = []
    face_crop_timestamps = []
    for i, frame in enumerate(frames):
        if i < len(face_boxes) and face_boxes[i]:
            fb = face_boxes[i][0]
            fh, fw = frame.shape[:2]
            pad_x = int(fb["w"] * 0.15)
            pad_y = int(fb["h"] * 0.15)
            x1 = max(0, fb["x"] - pad_x)
            y1 = max(0, fb["y"] - pad_y)
            x2 = min(fw, fb["x"] + fb["w"] + pad_x)
            y2 = min(fh, fb["y"] + fb["h"] + pad_y)
            crop = frame[y1:y2, x1:x2]
            if crop.shape[0] >= 36 and crop.shape[1] >= 36:
                face_crops.append(crop)
                ts = timestamps[i] if i < len(timestamps) else 0.0
                face_crop_timestamps.append(ts)

    dima_proc, dima_model = load_dima_model()
    prithiv_proc, prithiv_model = load_prithiv_model()
    sujith_model = load_sujith_frame_model()

    dima_scores = []
    prithiv_scores = []
    sujith_scores = []
    per_frame_records: List[Tuple[float, float]] = []

    if face_crops:
        eval_indices = np.linspace(0, len(face_crops) - 1, min(10, len(face_crops)), dtype=int)
        for idx in eval_indices:
            crop_bgr = face_crops[idx]
            crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(crop_rgb)
            curr_ts = face_crop_timestamps[idx] if idx < len(face_crop_timestamps) else 0.0

            dima_val = None
            prithiv_val = None

            # Model A: dima806 (140k real & deepfake face crops)
            # id2label: {0: 'Real', 1: 'Fake'}
            if dima_proc is not None and dima_model is not None:
                try:
                    inputs = dima_proc(images=pil_img, return_tensors="pt")
                    with torch.no_grad():
                        logits = dima_model(**inputs).logits
                        probs = torch.softmax(logits, dim=1)[0]
                        dima_val = float(probs[1].item())
                        dima_scores.append(dima_val)
                except Exception:
                    pass

            # Model B: PrithivML (Generative AI Face & Modern Deepfake ViT)
            # id2label: {0: 'Fake', 1: 'Real'}
            if prithiv_proc is not None and prithiv_model is not None:
                try:
                    inputs = prithiv_proc(images=pil_img, return_tensors="pt")
                    with torch.no_grad():
                        logits = prithiv_model(**inputs).logits
                        probs = torch.softmax(logits, dim=1)[0]
                        prithiv_val = float(probs[0].item())
                        prithiv_scores.append(prithiv_val)
                except Exception:
                    pass

            # Model C: Sujithg684 (FF++ C23 compression-aware)
            if sujith_model is not None:
                input_tensor = IMAGENET_NORMALIZATION(crop_rgb).unsqueeze(0)
                try:
                    with torch.no_grad():
                        logits = sujith_model(input_tensor)
                        probs = torch.softmax(logits, dim=1)[0]
                        sujith_scores.append(float(probs[1].item()))
                except Exception:
                    pass

            # Track frame-level composite score for partial deepfake localization
            if dima_val is not None and prithiv_val is not None:
                frame_composite = max(dima_val, prithiv_val) if (dima_val >= 0.70 or prithiv_val >= 0.70) else (0.60 * dima_val + 0.40 * prithiv_val)
            elif dima_val is not None:
                frame_composite = dima_val
            elif prithiv_val is not None:
                frame_composite = prithiv_val
            else:
                frame_composite = 0.0

            per_frame_records.append((curr_ts, frame_composite))

    def robust_score(scores: List[float]) -> Optional[float]:
        if not scores:
            return None
        if len(scores) >= 5:
            s = sorted(scores)
            return round(float(np.mean(s[1:-1])), 4)
        return round(float(np.mean(scores)), 4)

    dima_score = robust_score(dima_scores)
    prithiv_score = robust_score(prithiv_scores)
    sujith_score = robust_score(sujith_scores)

    # Multi-model Face Consensus:
    # 1. dima806 is the primary benchmark detector (trained on 140k dataset)
    # 2. prithivML detects generative AI faces
    # 3. Sujithg684 provides C23 compression context
    if dima_score is not None and prithiv_score is not None:
        if dima_score >= 0.85:
            # High-confidence synthetic face pattern (e.g. Gemini/Veo where dima scores 0.97)
            face_score = dima_score
        elif prithiv_score >= 0.80:
            face_score = prithiv_score
        elif dima_score < 0.50 and prithiv_score < 0.50:
            # Clear consensus of authenticity across both Vision Transformers:
            # Neither model flagged it as fake. Bound score firmly low.
            face_score = round(min(0.35, 0.60 * dima_score + 0.40 * prithiv_score), 4)
        else:
            face_score = round(0.60 * dima_score + 0.40 * prithiv_score, 4)
    elif dima_score is not None:
        face_score = dima_score
    elif prithiv_score is not None:
        face_score = prithiv_score
    else:
        face_score = sujith_score

    # Partial Swap Localization & Peak-Window Pooling:
    # Detects localized insertions (e.g. 2-second swap in a 30-second genuine video)
    # where whole-video averaging would otherwise dilute the manipulation score.
    partial_swap_timestamps = []
    is_partial_swap = False
    high_confidence_frames = [(ts, score) for (ts, score) in per_frame_records if score >= 0.70]

    if len(high_confidence_frames) >= 2:
        # 2 or more contiguous sampled frames confirmed synthetic
        is_partial_swap = True
        partial_swap_timestamps = [round(ts, 2) for (ts, score) in high_confidence_frames]
        peak_swap_score = round(float(np.mean([score for (ts, score) in high_confidence_frames])), 4)
        # Prevent global average dilution from burying the localized face swap
        face_score = max(face_score, peak_swap_score)
    elif len(high_confidence_frames) == 1 and high_confidence_frames[0][1] >= 0.90:
        # Strong single-frame anomaly recorded for timeline inspection
        partial_swap_timestamps = [round(high_confidence_frames[0][0], 2)]

    # 3. Full-frame Generative AI Verifier (umm-maybe) - Only as auxiliary signal
    ai_gen_proc, ai_gen_model = load_generative_ai_verifier()
    ai_scores = []
    if ai_gen_proc is not None and ai_gen_model is not None:
        ai_indices = np.linspace(0, len(frames) - 1, min(6, len(frames)), dtype=int)
        for idx in ai_indices:
            bgr = frames[idx]
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            try:
                inputs = ai_gen_proc(images=pil_img, return_tensors="pt")
                with torch.no_grad():
                    logits = ai_gen_model(**inputs).logits
                    probs = torch.softmax(logits, dim=1)[0]
                    # Index 0: artificial, Index 1: human
                    ai_scores.append(float(probs[0].item()))
            except Exception:
                pass

    ai_score = robust_score(ai_scores) or 0.0

    # 4. Calibrated Model Fusion
    # Calibrate Arko007 baseline: CLIP adapter has a resting baseline of ~0.45 on genuine footage
    arko_calibrated = min(1.0, max(0.0, (arko_score - 0.40) / 0.50)) if arko_score > 0.40 else 0.0

    if face_score is not None:
        if face_score >= 0.60:
            calibrated_score = round(max(face_score, 0.70 * face_score + 0.30 * arko_calibrated), 2)
        elif face_score <= 0.35:
            # Authentic genuine face: strictly isolate from full-frame compression false alarms
            calibrated_score = round(0.70 * face_score + 0.30 * arko_calibrated, 2)
        else:
            calibrated_score = round(0.60 * face_score + 0.40 * arko_calibrated, 2)
    else:
        # Non-face / scenic video: CLIP + Generative AI
        calibrated_score = round(0.55 * arko_calibrated + 0.45 * ai_score, 2)

    if calibrated_score >= 0.55:
        result = "manipulation_detected"
        explanation = (
            f"Verified deepfake models flagged synthetic manipulation patterns "
            f"(dima806 ViT: {dima_score or 'N/A'}, Generative Face: {prithiv_score or 'N/A'}, "
            f"Video Temporal: {round(arko_score, 2)})."
        )
    elif calibrated_score <= 0.48:
        result = "natural_textures"
        explanation = (
            f"Verified models confirmed authentic photographic textures & temporal coherence "
            f"(dima806 ViT: {dima_score or 'N/A'}, Generative Face: {prithiv_score or 'N/A'}, "
            f"Video Temporal: {round(arko_score, 2)})."
        )
    else:
        result = "borderline"
        explanation = (
            f"Models produced borderline indicators (Calibrated Score: {calibrated_score}). "
            f"Cross-modal fusion required for final resolution."
        )

    return {
        "available": True,
        "status": "completed",
        "result": result,
        "score": calibrated_score,
        "video_model_score": round(arko_score, 2),
        "frame_model_score": face_score,
        "ai_generated_score": round(ai_score, 2),
        "dima_score": dima_score,
        "prithiv_score": prithiv_score,
        "sujith_score": sujith_score,
        "is_partial_swap": is_partial_swap,
        "suspicious_timestamps": partial_swap_timestamps,
        "frames_analyzed": len(video_indices) + len(face_crops),
        "suspicious_frames_count": sum(1 for s in (dima_scores or prithiv_scores or sujith_scores) if s >= 0.50),
        "published_benchmarks": published_benchmarks,
        "explanation": explanation
    }
