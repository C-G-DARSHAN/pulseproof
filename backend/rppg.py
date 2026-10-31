import cv2
import numpy as np
from scipy import signal
from typing import List, Dict, Any, Optional

def analyze_rppg_signals(
    frames: List[np.ndarray],
    timestamps: List[float],
    face_boxes: List[List[Dict[str, int]]],
    quality_level: str,
    fps: float
) -> Dict[str, Any]:
    """
    Physiological Heartbeat Analysis via Remote Photoplethysmography (rPPG).
    Follows Netherlands Forensic Institute (NFI) forensic standards:
    - Extracts subtle micro-vascular blood volume pulse (BVP) from facial dermis.
    - Explicitly returns status and reason if rPPG is unavailable.
    - FORENSIC INTEGRITY RULE: Never interprets an absent heartbeat as evidence of deepfake.
      An absent or noisy signal can arise from compression, motion, or lighting.
    - Never invents physiological measurements.
    """
    # 1. Quality Routing
    if quality_level == "poor":
        return {
            "available": False,
            "status": "unavailable",
            "reason": "severe_degradation",
            "signal_quality": None,
            "estimated_bpm": None,
            "periodicity_score": None,
            "is_cardiac_valid": False,
            "message": "rPPG unavailable: Video quality is severely degraded, underexposed, or blurred."
        }

    # 2. Duration requirement (at least 3.5s for minimum 4 full cardiac cycles)
    if len(frames) < 16 or (timestamps[-1] - timestamps[0]) < 3.5:
        return {
            "available": False,
            "status": "unavailable",
            "reason": "insufficient_duration",
            "signal_quality": None,
            "estimated_bpm": None,
            "periodicity_score": None,
            "is_cardiac_valid": False,
            "message": "rPPG unavailable: Video duration too brief (< 3.5s) for multi-cycle cardiac frequency verification."
        }

    # 3. Multi-ROI Chrominance Extraction (Forehead + Left Cheek + Background Control)
    # Biological blood perfusion creates synchronized, in-phase pulses across distinct facial arterial beds,
    # distinct from ambient background lighting fluctuations.
    forehead_signals = []
    cheek_signals = []
    bg_signals = []
    valid_frames = 0

    for i, frame in enumerate(frames):
        fh, fw = frame.shape[:2]
        # Non-skin background control ROI (top-left 15%)
        bg_crop = frame[0:max(10, int(fh * 0.15)), 0:max(10, int(fw * 0.15))]
        if bg_crop.size > 0:
            bg_signals.append(float(np.mean(bg_crop[:, :, 1])))
        else:
            bg_signals.append(0.0)

        if i < len(face_boxes) and face_boxes[i]:
            fb = face_boxes[i][0]
            
            # Forehead dermis ROI
            fy1 = max(0, fb["y"] + int(fb["h"] * 0.12))
            fy2 = min(fh, fb["y"] + int(fb["h"] * 0.28))
            fx1 = max(0, fb["x"] + int(fb["w"] * 0.30))
            fx2 = min(fw, fb["x"] + int(fb["w"] * 0.70))
            
            # Left cheek ROI
            cy1 = max(0, fb["y"] + int(fb["h"] * 0.45))
            cy2 = min(fh, fb["y"] + int(fb["h"] * 0.65))
            cx1 = max(0, fb["x"] + int(fb["w"] * 0.18))
            cx2 = min(fw, fb["x"] + int(fb["w"] * 0.38))
            
            f_crop = frame[fy1:fy2, fx1:fx2]
            c_crop = frame[cy1:cy2, cx1:cx2]
            
            if f_crop.size > 0 and c_crop.size > 0:
                # Green channel absorbs hemoglobin peak at 520-560 nm
                fg = float(np.mean(f_crop[:, :, 1]))
                cg = float(np.mean(c_crop[:, :, 1]))
                forehead_signals.append(fg)
                cheek_signals.append(cg)
                valid_frames += 1
                continue
                
        forehead_signals.append(0.0)
        cheek_signals.append(0.0)

    face_ratio = valid_frames / max(len(frames), 1)
    if face_ratio < 0.60:
        return {
            "available": False,
            "status": "unavailable",
            "reason": "unstable_face_tracking",
            "signal_quality": None,
            "estimated_bpm": None,
            "periodicity_score": None,
            "is_cardiac_valid": False,
            "message": "rPPG unavailable: Subject face moved excessively or facial vascular ROIs were lost."
        }

    # 4. Detrend and cross-region physiological coherence
    raw_f = np.array([g for g in forehead_signals if g > 0])
    raw_c = np.array([g for g in cheek_signals if g > 0])
    raw_bg = np.array([g for g in bg_signals if g > 0])

    if len(raw_f) < 20 or len(raw_c) < 20:
        return {
            "available": False,
            "status": "unavailable",
            "reason": "signal_dropout",
            "signal_quality": None,
            "estimated_bpm": None,
            "periodicity_score": None,
            "is_cardiac_valid": False,
            "message": "rPPG unavailable: Insufficient optical signal samples across face dermis."
        }

    dt = (timestamps[-1] - timestamps[0]) / max(len(timestamps) - 1, 1)
    fs = 1.0 / max(dt, 0.001)

    # Sampling rate check to avoid aliasing and false pulse hallucinations
    if fs < 10.0:
        return {
            "available": False,
            "status": "unavailable",
            "reason": "insufficient_sampling_rate",
            "signal_quality": None,
            "estimated_bpm": None,
            "periodicity_score": None,
            "is_cardiac_valid": False,
            "message": f"rPPG unavailable: Sampled frame rate ({round(fs, 1)} Hz) is below physiological Nyquist minimum (10 Hz) to prevent motion/lighting aliasing."
        }

    detrended_f = signal.detrend(raw_f)
    detrended_c = signal.detrend(raw_c)
    detrended_bg = signal.detrend(raw_bg[:len(raw_f)])

    # 5. Bandpass filter in human physiological cardiac range: 0.85 Hz - 2.5 Hz (51 - 150 BPM)
    try:
        nyquist = 0.5 * fs
        if nyquist > 2.8:
            low = min(0.85 / nyquist, 0.75)
            high = min(2.5 / nyquist, 0.95)
            
            if low < high:
                b, a = signal.butter(2, [low, high], btype='band')
                filt_f = signal.filtfilt(b, a, detrended_f)
                filt_c = signal.filtfilt(b, a, detrended_c)
                filt_bg = signal.filtfilt(b, a, detrended_bg)
                
                # Multi-ROI Cross-Correlation: Real human blood flow is correlated across facial regions
                if np.std(filt_f) > 1e-4 and np.std(filt_c) > 1e-4:
                    corr = float(np.corrcoef(filt_f, filt_c)[0, 1])
                else:
                    corr = 0.0

                # Ambient illumination rejection: If facial signal correlates with non-skin background,
                # the variation is ambient studio lighting / flicker, NOT blood perfusion!
                if np.std(filt_f) > 1e-4 and np.std(filt_bg) > 1e-4:
                    corr_bg = float(np.corrcoef(filt_f, filt_bg)[0, 1])
                else:
                    corr_bg = 0.0
                
                # FFT Spectral Density Analysis
                fft_vals = np.abs(np.fft.rfft(filt_f))
                fft_freqs = np.fft.rfftfreq(len(filt_f), d=dt)
                
                cardiac_mask = (fft_freqs >= 0.85) & (fft_freqs <= 2.5)
                if np.any(cardiac_mask):
                    m_freqs = fft_freqs[cardiac_mask]
                    m_vals = fft_vals[cardiac_mask]
                    peak_idx = np.argmax(m_vals)
                    best_freq = m_freqs[peak_idx]
                    est_bpm = round(float(best_freq * 60.0), 1)
                    
                    peak_power = m_vals[peak_idx]
                    other_power = float(np.sum(m_vals) - peak_power)
                    spectral_ratio = float(peak_power / max(other_power, 1e-5))
                    snr_metric = min(1.0, max(0.0, float(spectral_ratio / 2.0)))
                    
                    # Physiological verification standards:
                    # 1. Heart rate in normal physiological range (58 - 100 BPM)
                    # 2. Spectral peak concentration ratio >= 0.90
                    # 3. Synchronized cross-ROI dermal blood flow correlation >= 0.50
                    # 4. Background lighting decorrelation (corr_bg < 0.45)
                    is_valid_cardiac = (
                        (58.0 <= est_bpm <= 100.0) and
                        (spectral_ratio >= 0.90) and
                        (corr >= 0.50) and
                        (corr_bg < 0.45)
                    )
                    
                    if is_valid_cardiac:
                        return {
                            "available": True,
                            "status": "completed",
                            "reason": None,
                            "signal_quality": round(snr_metric, 2),
                            "estimated_bpm": est_bpm,
                            "periodicity_score": round(corr, 2),
                            "is_cardiac_valid": True,
                            "message": f"Verified authentic biological human cardiac blood perfusion at ~{est_bpm} BPM (Cross-ROI Corr: {round(corr, 2)})."
                        }
                    else:
                        # NFI Rule: Absent or low SNR pulse is reported transparently as unavailable, NEVER fake
                        return {
                            "available": False,
                            "status": "unavailable",
                            "reason": "low_snr" if corr_bg < 0.45 else "ambient_lighting_interference",
                            "signal_quality": round(snr_metric, 2),
                            "estimated_bpm": None,
                            "periodicity_score": round(max(0.0, corr), 2),
                            "is_cardiac_valid": False,
                            "message": "rPPG unavailable: Micro-vascular pulsatile rhythm did not meet physiological multi-region coherence standards." if corr_bg < 0.45 else "rPPG unavailable: Optical signal matches ambient background illumination fluctuations."
                        }
    except Exception:
        pass

    return {
        "available": False,
        "status": "unavailable",
        "reason": "frequency_analysis_failure",
        "signal_quality": None,
        "estimated_bpm": None,
        "periodicity_score": None,
        "is_cardiac_valid": False,
        "message": "rPPG unavailable: Could not establish reliable frequency spectrum from optical stream."
    }
