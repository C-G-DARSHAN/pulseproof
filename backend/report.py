from typing import Dict, Any

def generate_forensic_report_text(analysis: Dict[str, Any]) -> str:
    """
    Generates an investigator text dossier from the analysis results dictionary.
    """
    filename = analysis.get("filename", "unknown.mp4")
    verdict = analysis.get("verdict_label", "Inconclusive")
    quality = analysis.get("quality", {})
    signals = analysis.get("signals", {})
    
    report = []
    report.append("=" * 60)
    report.append("PULSEPROOF FORENSIC INTEGRITY AUDIT DOSSIER")
    report.append("=" * 60)
    report.append(f"Subject File: {filename} ({analysis.get('filesize_mb')} MB)")
    report.append(f"Resolution:   {quality.get('resolution')} @ {quality.get('fps')} FPS")
    report.append(f"Duration:     {quality.get('duration_seconds')}s")
    report.append(f"Quality Tier: {quality.get('level', '').upper()}")
    report.append("-" * 60)
    report.append(f"FINAL FINDING: {verdict}")
    report.append(f"Rationale:     {analysis.get('confidence_explanation')}")
    report.append("-" * 60)
    report.append("PRIMARY EVIDENCE OBSERVATIONS:")
    for ev in analysis.get("evidence_summary", []):
        report.append(f"  • {ev}")
    report.append("-" * 60)
    report.append("FORENSIC LIMITATIONS:")
    for lim in analysis.get("limitations", []):
        report.append(f"  • {lim}")
    report.append("=" * 60)
    
    return "\n".join(report)
