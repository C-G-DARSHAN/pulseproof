import React from 'react';
import { X, Printer, Shield, Check, AlertTriangle, FileText } from 'lucide-react';

export default function ReportView({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/90 transform transition-all duration-300">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 sm:px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Forensic Evidence Audit Dossier</h2>
              <span className="text-[10px] text-slate-400 font-mono">STANDARDIZED INTEGRITY AUDIT</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold active:scale-95 transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          
          {/* Metadata Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">PulseProof Forensic Audit</h1>
                <p className="text-xs text-slate-500 mt-0.5">Adaptive Multi-Modal Video Integrity Verification</p>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                DATE: {new Date().toLocaleDateString()}<br />
                ID: PP-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
              <div>
                <span className="text-slate-400 block">FILENAME</span>
                <span className="font-semibold text-slate-800 truncate block">{data.filename}</span>
              </div>
              <div>
                <span className="text-slate-400 block">FILESIZE</span>
                <span className="font-semibold text-slate-800">{data.filesize_mb} MB</span>
              </div>
              <div>
                <span className="text-slate-400 block">RESOLUTION</span>
                <span className="font-semibold text-slate-800">{data.quality?.resolution || 'N/A'}</span>
                <span className="text-[10px] text-emerald-700 block font-sans">Real: ≥720p</span>
              </div>
              <div>
                <span className="text-slate-400 block">DURATION / FPS</span>
                <span className="font-semibold text-slate-800">{data.quality?.duration_seconds}s ({data.quality?.fps || 30} fps)</span>
                <span className="text-[10px] text-emerald-700 block font-sans">Real: Sharp ≥25.0</span>
              </div>
            </div>

            {data.signals?.provenance?.sha256 && (
              <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                <span className="font-bold text-slate-600 mr-2">SHA-256 CHECKSUM:</span>
                {data.signals.provenance.sha256}
              </div>
            )}
          </div>

          {/* Verdict Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Final Forensic Finding
            </span>
            <div className="text-lg font-bold text-slate-900">
              {data.verdict_label}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {data.confidence_explanation}
            </p>
          </div>

          {/* Authentic Baseline Reference Standards */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Authentic Baseline Reference Criteria (Expected Values for Genuine Videos)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900">
              <div>• <strong>Calibrated Suspicion:</strong> ≤ 0.48 (Authentic &lt; 0.35; Fake ≥ 0.55)</div>
              <div>• <strong>Face X-Ray Boundary:</strong> ≤ 0.35 (Seamless outer blending)</div>
              <div>• <strong>Temporal Jitter Index:</strong> ≤ 0.25 (0 sudden MAD anomaly spikes)</div>
              <div>• <strong>Physiological rPPG:</strong> 58 – 100 BPM (Cross-ROI r ≥ 0.50)</div>
              <div>• <strong>Laplacian Sharpness:</strong> ≥ 25.0 (Crisp &gt; 45.0, unblurred facial edges)</div>
              <div>• <strong>Illumination Exposure:</strong> 60.0 – 190.0 (Standard grayscale mean)</div>
            </div>
          </div>

          {/* Forensic Evidence Observations */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Primary Evidence Findings
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {data.evidence_summary?.map((ev, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signal Assessment Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Signal Breakdown & Feasibility (with Authentic Baseline Ranges)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-2.5">Forensic Module</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Measured Index</th>
                    <th className="p-2.5">Real Baseline Range</th>
                    <th className="p-2.5">Summary Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Visual Ensemble (ViT + CLIP)</td>
                    <td className="p-2.5">{data.signals?.visual_model?.status}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{data.signals?.visual_model?.score ?? 'N/A'}</td>
                    <td className="p-2.5 font-semibold text-emerald-700 bg-emerald-50/50">≤ 0.48 (Real &lt; 0.35)</td>
                    <td className="p-2.5 text-slate-500">{data.signals?.visual_model?.explanation?.slice(0, 50)}...</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Face X-Ray Boundary</td>
                    <td className="p-2.5">{data.signals?.boundary_analysis?.status || 'completed'}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{data.signals?.boundary_analysis?.score ?? 'N/A'}</td>
                    <td className="p-2.5 font-semibold text-emerald-700 bg-emerald-50/50">≤ 0.35 (No seam)</td>
                    <td className="p-2.5 text-slate-500">{data.signals?.boundary_analysis?.explanation?.slice(0, 50) || 'Gradient continuity along facial boundary'}...</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Temporal Anomaly / Jitter</td>
                    <td className="p-2.5">{data.signals?.temporal_analysis?.status}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{data.signals?.temporal_analysis?.anomaly_score ?? 'N/A'}</td>
                    <td className="p-2.5 font-semibold text-emerald-700 bg-emerald-50/50">≤ 0.25 (0 spikes)</td>
                    <td className="p-2.5 text-slate-500">{data.signals?.temporal_analysis?.explanation?.slice(0, 50)}...</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Physiological rPPG</td>
                    <td className="p-2.5">{data.signals?.rppg?.status}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{data.signals?.rppg?.estimated_bpm ? `${data.signals.rppg.estimated_bpm} BPM` : 'N/A'}</td>
                    <td className="p-2.5 font-semibold text-emerald-700 bg-emerald-50/50">58 – 100 BPM (r ≥ 0.50)</td>
                    <td className="p-2.5 text-slate-500">{data.signals?.rppg?.message?.slice(0, 50) || 'Skipped'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Limitations & Legal Disclaimer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Forensic Disclaimer & Integrity Statement:</p>
            <p>
              PulseProof adaptive forensics provides probabilistic engineering analysis of video artifacts,
              pixel continuity, and biological plausibility. An inconclusive finding reflects video degradation
              or conflicting signals. Authentic determinations indicate that no anomalous synthetic markers
              were identified within sampled bounds.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
