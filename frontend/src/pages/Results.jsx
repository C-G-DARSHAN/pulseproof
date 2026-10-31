import React, { useRef, useState } from 'react';
import VideoPreview from '../components/VideoPreview';
import VerdictCard from '../components/VerdictCard';
import QualityCard from '../components/QualityCard';
import SignalCard from '../components/SignalCard';
import Timeline from '../components/Timeline';
import EvidencePanel from '../components/EvidencePanel';
import BenchmarkCard from '../components/BenchmarkCard';
import ReportView from '../components/ReportView';
import { RefreshCw, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Results({ data, videoUrl, onReset, backendOnline }) {
  const videoRef = useRef(null);
  const [showReport, setShowReport] = useState(false);

  if (!data) return null;

  const handleSeekTimestamp = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const qualityObj = data.video_quality || data.quality;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Return to Home Screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Forensic Dossier</span>
              <span className="text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg font-mono font-bold border border-slate-200">
                {data.filename}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
              <span>{data.filesize_mb} MB</span>
              <span>•</span>
              <span>{qualityObj?.duration_seconds || '0'}s</span>
              <span>•</span>
              <span>{qualityObj?.resolution || 'HD'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-sans font-semibold">Verified Multi-Modal Pipeline</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-blue-300" />
            <span>Forensic Audit Dossier</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload New Video</span>
          </button>
        </div>
      </div>

      {/* 1. Overall Verdict Card (Full Width) */}
      <VerdictCard
        verdict={data.verdict}
        verdictLabel={data.verdict_label}
        confidenceExplanation={data.confidence_explanation}
        onOpenReport={() => setShowReport(true)}
      />

      {/* 2. Video Inspection & Feasibility Row (Tightly Matched Heights - Zero Void) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Video Player & Temporal Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Evidence Playback & Temporal Localization
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Interactive Player</span>
          </div>

          <VideoPreview
            ref={videoRef}
            videoUrl={videoUrl}
            fileName={data.filename}
            suspiciousTimestamps={data.suspicious_timestamps || []}
          />

          <Timeline
            duration={qualityObj?.duration_seconds || 10}
            suspiciousTimestamps={data.suspicious_timestamps || []}
            onSeekTimestamp={handleSeekTimestamp}
          />
        </div>

        {/* Right: Quality Feasibility Card (5 cols - Exactly Matching Height) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Optical Feasibility Assessment
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Sensor Feasibility Checked
            </span>
          </div>

          <div className="flex-1 flex flex-col">
            <QualityCard quality={qualityObj} />
          </div>
        </div>

      </div>

      {/* 3. Deepfake & Generative Neural Ensemble + Specialized Signals (FULL 12-COLUMN DASHBOARD WIDTH) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Forensic Neural Ensemble & Signal Decomposition
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Spatiotemporal video adapters, facial synthesis ViTs, boundary seam detection & biological plausibility
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold shadow-2xs">
            Authentic Baseline Ranges Active
          </span>
        </div>

        <SignalCard
          signals={data.signals}
          onSeekTimestamp={handleSeekTimestamp}
        />
      </div>

      {/* 4. Forensic Evidence Observations & Scientific Boundaries (Full Width 2-Column Row) */}
      <div className="space-y-3 pt-2">
        <div className="px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Traceable Evidence Observations & Scientific Constraints
          </span>
        </div>
        <EvidencePanel
          evidenceSummary={data.evidence_summary}
          limitations={data.limitations}
        />
      </div>

      {/* 5. Published Benchmarks vs Local Evaluation Card (Full Width) */}
      <div className="space-y-3 pt-2">
        <div className="px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Empirical Validation & Reference Science
          </span>
        </div>
        <BenchmarkCard
          publishedBenchmarks={data.published_benchmarks}
          localEvaluation={data.local_evaluation}
        />
      </div>

      {/* Printable Report Modal */}
      {showReport && (
        <ReportView
          data={data}
          onClose={() => setShowReport(false)}
        />
      )}

    </div>
  );
}