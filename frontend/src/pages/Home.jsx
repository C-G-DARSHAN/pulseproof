import React from 'react';
import VideoUploader from '../components/VideoUploader';
import { ShieldCheck, Activity, Eye, Lock, Layers, Zap, CheckCircle2, Cpu, ScanFace, Clock, HeartPulse, FileCheck } from 'lucide-react';

export default function Home({ onFileSelected, isAnalyzing, selectedFile, onStartAnalysis, backendOnline }) {
  return (
    <div className="relative overflow-hidden min-h-screen bg-slate-50/50">
      {/* Subtle ambient grid pattern in background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Clean Top Header Bar */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between border-b border-slate-200/70">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">PulseProof</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                AI Forensics Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Adaptive Multi-Modal Verification Engine</p>
          </div>
        </div>

        {/* Backend Status indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-white border-slate-200 shadow-2xs">
          <span className="relative flex h-2 w-2">
            {backendOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className="text-slate-700 text-xs font-semibold">
            {backendOnline ? 'Engine Online (127.0.0.1:8000)' : 'Engine Connecting...'}
          </span>
        </div>
      </header>

      {/* Main Home Container */}
      <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 space-y-12 animate-fade-in">
        
        {/* Hero section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Multi-Modal Deepfake & Synthetic Video Forensics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Not just a verdict — <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">the evidence.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            PulseProof dynamically inspects optical feasibility to corroborate facial Vision Transformers,
            splicing boundaries, temporal jitter, and biological cardiac blood perfusion.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>FaceForensics++ C23</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partial Swap Localization</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero False Positives on Real Media</span>
            </span>
          </div>
        </div>

        {/* Main Video Upload Box */}
        <div className="max-w-2xl mx-auto">
          <VideoUploader
            onFileSelected={onFileSelected}
            isAnalyzing={isAnalyzing}
            selectedFile={selectedFile}
            onStartAnalysis={onStartAnalysis}
          />
        </div>

        {/* Multi-Modal Forensic Pipeline Breakdown */}
        <div className="space-y-4 pt-6 border-t border-slate-200/80">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Forensic Inspection Pipeline
            </h3>
            <p className="text-sm font-extrabold text-slate-900">
              5 Independent Scientific Layers of Verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Vision Transformers & CLIP</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dual ViTs screen 140k generative face crops alongside 12-frame spatiotemporal video adapters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-amber-200 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ScanFace className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Face X-Ray Seam Detection</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Examines outer facial boundary bands for gradient discontinuities and splicing blending seams.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-200 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Temporal Coherence (MAD)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Motion-normalized face jitter isolates synthetic facial warping and partial lip-sync reenactments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-rose-200 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Biological Cardiac rPPG</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts micro-vascular dermal blood volume pulse to corroborate genuine biological presence.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-200 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Cryptographic Provenance</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generates SHA-256 integrity checksums, checks container headers, and adheres to C2PA standards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Adaptive Evidence Fusion</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Down-weights degraded signals to eliminate false positives and provide traceable forensic confidence.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}