import React from 'react';
import { Cpu, Clock, HeartPulse, Fingerprint, CheckCircle2, AlertTriangle, ScanFace, Info, ShieldCheck } from 'lucide-react';

export default function SignalCard({ signals, onSeekTimestamp }) {
  if (!signals) return null;

  const { visual_model, boundary_analysis, temporal_analysis, rppg, provenance } = signals;

  const getStatusBadge = (status, available) => {
    if (status === 'completed' && available) {
      return (
        <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3 py-1 rounded-full shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Usable Signal</span>
        </span>
      );
    }
    if (status === 'skipped') {
      return (
        <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Skipped (Low Quality)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Unavailable / Degraded</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Deepfake & Generative Neural Ensemble (FULL WIDTH ACROSS ENTIRE DASHBOARD) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Deepfake & Generative Neural Ensemble</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Multi-Model Consensus: Arko007 CLIP-ViT-L + Sujithg684 C23 + dima806 ViT + PrithivML ViT
              </p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            {getStatusBadge(visual_model.status, visual_model.available)}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed my-4">
          {visual_model.explanation || 'Cross-analyzes 12-frame spatiotemporal video adapters, modern generative facial synthesis ViTs, C23 compression forensics, and full-frame generative textures.'}
        </p>

        {/* 4 Spacious Model Metric Tiles (Full Breathing Room) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Tile 1: Video Temporal */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-violet-200 hover:shadow-2xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Video Temporal
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  CLIP Adapter
                </span>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`font-mono text-2xl font-black ${visual_model.video_model_score >= 0.52 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.video_model_score !== undefined && visual_model.video_model_score !== null ? visual_model.video_model_score : 'N/A'}
                </span>
                <span className={`text-[11px] font-semibold ${visual_model.video_model_score >= 0.52 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.video_model_score !== undefined && visual_model.video_model_score !== null 
                    ? (visual_model.video_model_score >= 0.52 ? 'Temporal Glitch' : 'Natural Motion')
                    : 'Uncalculated'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Real Range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono shadow-2xs">
                ≤ 0.50
              </span>
            </div>
          </div>

          {/* Tile 2: Face Forensic */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-violet-200 hover:shadow-2xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Face Forensic
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  FF++ C23
                </span>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`font-mono text-2xl font-black ${visual_model.frame_model_score >= 0.50 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.frame_model_score !== undefined && visual_model.frame_model_score !== null ? visual_model.frame_model_score : 'N/A'}
                </span>
                <span className={`text-[11px] font-semibold ${visual_model.frame_model_score >= 0.50 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.frame_model_score !== undefined && visual_model.frame_model_score !== null
                    ? (visual_model.frame_model_score >= 0.50 ? 'Synthetic Dermis' : 'Natural Dermis')
                    : 'Uncalculated'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Real Range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono shadow-2xs">
                ≤ 0.35
              </span>
            </div>
          </div>

          {/* Tile 3: Generative Face AI */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-violet-200 hover:shadow-2xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {visual_model.dima_score !== undefined && visual_model.dima_score !== null ? 'dima806 ViT' : 'Generative AI'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  140k ViT
                </span>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`font-mono text-2xl font-black ${(visual_model.dima_score ?? visual_model.ai_generated_score) >= 0.50 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.dima_score !== undefined && visual_model.dima_score !== null ? visual_model.dima_score : (visual_model.ai_generated_score ?? 'N/A')}
                </span>
                <span className={`text-[11px] font-semibold ${(visual_model.dima_score ?? visual_model.ai_generated_score) >= 0.50 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {(visual_model.dima_score ?? visual_model.ai_generated_score) !== undefined && (visual_model.dima_score ?? visual_model.ai_generated_score) !== null
                    ? ((visual_model.dima_score ?? visual_model.ai_generated_score) >= 0.50 ? 'AI Generated' : 'Organic Skin')
                    : 'Uncalculated'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Real Range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono shadow-2xs">
                ≤ 0.35
              </span>
            </div>
          </div>

          {/* Tile 4: Calibrated Suspicion */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-violet-200 hover:shadow-2xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Calibrated Suspicion
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  Consensus
                </span>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`font-mono text-2xl font-black ${visual_model.score >= 0.52 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.score !== null ? visual_model.score : 'N/A'}
                </span>
                <span className={`text-[11px] font-semibold ${visual_model.score >= 0.52 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {visual_model.score !== null
                    ? (visual_model.score >= 0.52 ? 'Suspicious' : 'Authentic')
                    : 'Uncalculated'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Real Range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono shadow-2xs">
                ≤ 0.48
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Specialized Forensic Modules (SPACIOUS 2-COLUMN GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card A: Face X-Ray Boundary Blending */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Face X-Ray Boundary Analysis</h4>
                  <span className="text-xs text-slate-400 font-mono">Blending Seam & Splicing Detector</span>
                </div>
              </div>
              {getStatusBadge(boundary_analysis?.status || 'completed', boundary_analysis?.available ?? true)}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {boundary_analysis?.explanation || 'Inspects outer perimeter boundary band around the face contour for gradient discontinuities and blending seams from face-swapping.'}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Seam Status</span>
              <span className={`font-bold text-sm block ${boundary_analysis?.has_artifacts ? 'text-rose-600' : 'text-emerald-700'}`}>
                {boundary_analysis?.has_artifacts ? 'Discontinuity Observed' : 'Continuous Blending'}
              </span>
            </div>

            {boundary_analysis?.score !== null && boundary_analysis?.score !== undefined && (
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Boundary Ratio</span>
                <span className="font-mono font-bold text-sm text-slate-800 block">{boundary_analysis.score}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Real Baseline Range</span>
              <div>
                <span className="inline-block font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-xs shadow-2xs">
                  ≤ 0.35 (Clean: &lt; 0.25)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Relative Temporal Coherence */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Relative Temporal Coherence</h4>
                  <span className="text-xs text-slate-400 font-mono">Motion-Normalized Facial Jitter</span>
                </div>
              </div>
              {getStatusBadge(temporal_analysis.status, temporal_analysis.available)}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {temporal_analysis.explanation || 'Measures relative differential face jitter normalized by camera motion to isolate synthetic deepfake flicker from natural human motion.'}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Relative Jitter Index</span>
              <span className="font-mono font-bold text-sm text-slate-800 block">
                {temporal_analysis.anomaly_score !== null ? temporal_analysis.anomaly_score : 'N/A'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Flagged Moments</span>
              <span className="font-bold text-sm text-slate-800 block">
                {temporal_analysis.timestamps ? `${temporal_analysis.timestamps.length} moment(s)` : '0 moments'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Real Baseline Range</span>
              <div>
                <span className="inline-block font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-xs shadow-2xs">
                  ≤ 0.25 (0 spikes)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card C: Physiological rPPG */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Physiological rPPG (Vascular Pulse)</h4>
                  <span className="text-xs text-slate-400 font-mono">Micro-Vascular Dermal Perfusion</span>
                </div>
              </div>
              {getStatusBadge(rppg.status, rppg.available)}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {rppg.message || (rppg.available ? 'Extracted micro-vascular chrominance signals.' : 'rPPG skipped: per NFI standards, absent pulse is not treated as evidence of manipulation.')}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Signal Correlation</span>
              <span className="font-mono font-bold text-sm text-slate-800 block">
                {rppg.signal_quality !== null ? rppg.signal_quality : 'Unavailable'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Cardiac Rhythm</span>
              <span className="font-mono font-bold text-sm text-rose-600 block">
                {rppg.estimated_bpm ? `${rppg.estimated_bpm} BPM` : 'No Pulse'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Real Baseline Range</span>
              <div>
                <span className="inline-block font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-xs shadow-2xs">
                  58 – 100 BPM (r ≥ 0.50)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card D: Digital Provenance & Metadata */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Provenance, Hash & Container Integrity</h4>
                  <span className="text-xs text-slate-400 font-mono">Cryptographic File Verification</span>
                </div>
              </div>
              {getStatusBadge(provenance.status, provenance.available)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {provenance.findings && provenance.findings.map((f, i) => (
                <p key={i} className="text-xs text-slate-600 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{f}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Real Baseline Codec:</span>
              <span className="font-bold text-emerald-800 font-mono text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Standard Camera Codec (H.264 / HEVC / ProRes)
              </span>
            </div>
            {provenance.sha256 && (
              <div className="text-[11px] text-slate-500 font-mono bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 overflow-hidden">
                <span className="font-bold text-slate-600 flex-shrink-0">SHA-256 HASH:</span>
                <span className="truncate text-slate-700">{provenance.sha256}</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}