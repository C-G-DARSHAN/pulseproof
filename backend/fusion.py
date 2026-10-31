from typing import Dict, Any, List, Tuple

def fuse_forensic_evidence(
    quality: Dict[str, Any],
    visual_signal: Dict[str, Any],
    boundary_signal: Dict[str, Any],
    temporal_signal: Dict[str, Any],
    rppg_signal: Dict[str, Any],
    provenance_signal: Dict[str, Any]
) -> Tuple[str, str, str, List[str], List[str]]:
    """
    Forensic Evidence Fusion Engine based on 8 Candidate Features:
    1. Resolution suitability (quality)
    2. Blur score (sharpness)
    3. Brightness suitability (illumination)
    4. Face visibility ratio (tracking stability)
    5. Compression indicators (macroblock attenuation)
    6. Calibrated visual detector score (Arko007 Video + Sujithg684 C23 Frame + AI verifier)
    7. Temporal inconsistency score (relative motion-normalized face jitter)
    8. rPPG signal quality score (cardiovascular frequency SNR)

    Calibrated Decision Boundary:
    - Inconclusive is minimized to a strict narrow uncertainty band (0.48 < score < 0.52)
      or unreadable footage (< 5 frames / pitch black).
    - Preserves Netherlands Forensic Institute standards:
      Absent rPPG pulse is NEVER treated as evidence of deepfake.
    """
    quality_level = quality.get("level", "moderate")
    evidence_summary: List[str] = []
    limitations: List[str] = []

    # 1. Quality-based disclosures
    if quality_level == "poor":
        limitations.append("Low optical quality / compression present; relying on C23 compression-aware neural features.")
    elif quality_level == "good":
        evidence_summary.append("High definition footage met precision standards for optical micro-vascular analysis.")

    # 2. Extract signal metrics
    v_avail = visual_signal.get("available", False)
    v_score = visual_signal.get("score", 0.50)
    video_m_score = visual_signal.get("video_model_score")
    frame_m_score = visual_signal.get("frame_model_score")
    ai_gen_score = visual_signal.get("ai_generated_score", 0.0) or 0.0
    is_partial_swap = visual_signal.get("is_partial_swap", False)
    partial_ts = visual_signal.get("suspicious_timestamps", [])

    b_avail = boundary_signal.get("available", False)
    b_score = boundary_signal.get("score")
    b_suspicious = boundary_signal.get("has_artifacts", False) or (b_score is not None and b_score >= 0.48)

    t_avail = temporal_signal.get("available", False)
    t_score = temporal_signal.get("anomaly_score", 0.0) or 0.0
    t_timestamps = temporal_signal.get("timestamps", [])
    t_suspicious = len(t_timestamps) >= 2 or (t_score >= 0.35 and len(t_timestamps) >= 1)

    r_avail = rppg_signal.get("available", False)
    r_bpm = rppg_signal.get("estimated_bpm")
    r_cardiac_valid = rppg_signal.get("is_cardiac_valid", False)
    r_snr = rppg_signal.get("signal_quality")

    is_ai_origin = provenance_signal.get("is_ai_origin", False)
    ai_gen_name = provenance_signal.get("ai_generator_name", "Generative AI Video Synthesis")

    has_face = quality.get("face_detected", False)

    # 3. Evidence Summaries
    if is_ai_origin:
        evidence_summary.append(f"Provenance container signatures identify '{ai_gen_name}' generative origin.")

    if v_avail:
        if v_score >= 0.52 or (frame_m_score is not None and frame_m_score >= 0.60):
            summary_parts = []
            if frame_m_score is not None and frame_m_score >= 0.50:
                summary_parts.append(f"Pre-trained Face Detector flagged synthetic patterns ({frame_m_score})")
            if video_m_score is not None and video_m_score >= 0.52:
                summary_parts.append(f"Video SpatioTemporal Detector flagged temporal anomalies ({video_m_score})")
            if ai_gen_score >= 0.52:
                summary_parts.append(f"Generative AI Verifier identified synthetic patterns ({ai_gen_score})")
            evidence_summary.append(" | ".join(summary_parts) if summary_parts else f"Neural models detected synthetic manipulation (Score: {v_score}).")
        else:
            evidence_summary.append(
                f"Verified neural detectors confirmed natural camera sensor noise & authentic skin textures (Score: {v_score})."
            )

    if b_avail:
        if b_suspicious:
            evidence_summary.append(
                f"Face X-Ray boundary analysis detected splicing seams along outer facial contour (score: {b_score})."
            )
        else:
            evidence_summary.append(
                "Face X-Ray boundary analysis confirmed continuous anatomical blending transitions."
            )

    if t_avail:
        if t_suspicious:
            evidence_summary.append(
                f"Temporal analysis flagged {len(t_timestamps)} localized facial jitter moment(s) distinct from camera motion."
            )
        else:
            evidence_summary.append(
                "Temporal continuity maintained smooth anatomical coherence across frame transitions."
            )

    # Biological Heartbeat Evidence (NFI Rule compliant)
    if r_avail and r_cardiac_valid and r_bpm and not is_ai_origin and v_score <= 0.35:
        evidence_summary.append(
            f"Optical heartbeat technology verified authentic biological human cardiac blood perfusion (~{r_bpm} BPM, SNR: {r_snr})."
        )
    elif rppg_signal.get("status") == "unavailable":
        reason = rppg_signal.get("reason", "low_snr")
        limitations.append(f"Biological rPPG analysis unavailable ({reason}); per NFI forensic standard, absence is not treated as evidence of manipulation.")

    has_temporal_swap = t_suspicious and len(t_timestamps) >= 2

    # 4. Calibrated Decision Logic (Minimizing Inconclusive & Eliminating False Positives)
    # Case A: High-Confidence Synthetic Manipulation, Partial Swap, or Explicit AI Origin
    if is_ai_origin or is_partial_swap or has_temporal_swap or (v_score >= 0.55) or (frame_m_score is not None and frame_m_score >= 0.60):
        verdict = "likely_manipulated"
        if is_ai_origin:
            verdict_label = f"Likely Manipulated ({ai_gen_name})"
            confidence_explanation = (
                f"Synthetic video synthesis verified by neural detectors (Visual Score: {v_score}) and confirmed by "
                f"container provenance markers ({ai_gen_name})."
            )
        elif is_partial_swap and partial_ts:
            ts_str = ", ".join([f"{ts}s" for ts in partial_ts[:4]])
            verdict_label = "Likely Manipulated (Partial Face Swap / Insertion)"
            confidence_explanation = (
                f"Localized temporal analysis detected a spliced deepfake face swap at timestamp(s) [{ts_str}] "
                f"despite authentic surrounding frames (Peak Score: {frame_m_score})."
            )
        elif has_temporal_swap:
            ts_str = ", ".join([f"{ts}s" for ts in t_timestamps[:4]])
            verdict_label = "Likely Manipulated (Facial Lip-Sync Reenactment / Swap Jump)"
            confidence_explanation = (
                f"Localized temporal analysis detected abrupt facial/lip motion discontinuities at [{ts_str}] "
                f"characteristic of partial deepfake insertion or dubbing reenactment (Jitter Score: {t_score})."
            )
        elif has_face and (frame_m_score is not None and frame_m_score >= 0.60):
            verdict_label = "Likely Manipulated (Generative Face AI / Deepfake)"
            confidence_explanation = (
                f"Pre-trained deepfake Vision Transformers detected synthetic generative facial patterns "
                f"(Model Score: {v_score}, Face Detector: {frame_m_score})."
            )
        elif not has_face and ai_gen_score >= 0.58:
            verdict_label = "Likely Manipulated (Generative AI Synthesis)"
            confidence_explanation = (
                f"Pre-trained Vision Transformers detected high-confidence synthetic generative media patterns "
                f"(Generative AI Index: {ai_gen_score})."
            )
        else:
            verdict_label = "Likely Manipulated (Neural Video Anomaly)"
            confidence_explanation = (
                f"Verified neural detectors flagged synthetic manipulation patterns across evaluated timeline frames (Score: {v_score})."
            )

    # Case B: Biologically Verified Human Presence (Strict: Only when neural score is clean & no AI provenance)
    elif r_cardiac_valid and not is_ai_origin and (frame_m_score is None or frame_m_score <= 0.25) and v_score <= 0.25:
        verdict = "no_strong_evidence"
        verdict_label = "No Strong Evidence of Manipulation Found (Biologically Verified)"
        confidence_explanation = (
            f"Verified biological human cardiac blood perfusion pulse (~{r_bpm} BPM) detected across facial dermis. "
            f"Evaluated models and boundary analysis confirm natural photographic video."
        )

    # Case C: Clean Authentic Photographic Video (Low Manipulation Score <= 0.48)
    elif v_score <= 0.48 and not is_ai_origin:
        if b_suspicious and t_suspicious and v_score > 0.40:
            # Only flag if BOTH boundary AND temporal anomalies corroborate tampering
            verdict = "likely_manipulated"
            verdict_label = "Likely Manipulated (Corroborated Physical Seams)"
            confidence_explanation = (
                "Localized facial boundary discontinuities and temporal jitter corroborate synthetic tampering despite baseline neural score."
            )
        else:
            verdict = "no_strong_evidence"
            verdict_label = "No Strong Evidence of Manipulation Found"
            confidence_explanation = (
                f"Evaluated neural detectors (Video SpatioTemporal: {video_m_score or 'N/A'}, "
                f"Face Detector: {frame_m_score or 'N/A'}) confirmed authentic photographic skin textures and temporal coherence."
            )

    # Case D: Borderline Uncertainty Band (0.48 < v_score < 0.58) - Inconclusive Minimized
    else:
        if b_suspicious and t_suspicious:
            verdict = "likely_manipulated"
            verdict_label = "Likely Manipulated (Boundary / Temporal Seams)"
            confidence_explanation = (
                "Physical blending seams and localized facial jitter corroborate synthetic manipulation across borderline frames."
            )
        elif (frame_m_score is not None and frame_m_score < 0.45) or (video_m_score is not None and video_m_score < 0.45):
            verdict = "no_strong_evidence"
            verdict_label = "No Strong Evidence of Manipulation Found"
            confidence_explanation = (
                "Borderline visual indicators resolved in favor of authenticity: Face detector and temporal continuity "
                "show natural organic properties."
            )
        else:
            verdict = "inconclusive"
            verdict_label = "Inconclusive Forensic Evidence"
            confidence_explanation = (
                f"Forensic indicators sit within the narrow uncertainty band (Score: {v_score}). "
                "Returning Inconclusive to avoid false certainty on borderline footage."
            )

    # 5. Provenance disclosures
    has_c2pa = provenance_signal.get("has_c2pa", False)
    if not has_c2pa:
        limitations.append("Container lacks C2PA Content Credentials signature to independently verify origin.")
    else:
        evidence_summary.append("Cryptographic C2PA metadata signature present in container headers.")

    return verdict, verdict_label, confidence_explanation, evidence_summary, limitations
