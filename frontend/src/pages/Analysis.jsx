import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Film, Cpu, Clock, Layers } from 'lucide-react';

export default function Analysis({ fileName }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Decoding Video Stream', desc: 'Reading container headers, framerate (Real: ≥15 FPS), and sampling keyframes' },
    { title: 'Assessing Image Quality', desc: 'Measuring Laplacian blur sharpness (Real: ≥25.0), illumination (Real: 60–190) & face ROI' },
    { title: 'Executing Deepfake Detector', desc: 'Screening facial regions for generative synthesis (Real: ≤0.35) & blending boundaries (Real: ≤0.35)' },
    { title: 'Temporal Continuity Analysis', desc: 'Detecting frame-to-frame pixel jitter (Real: ≤0.25) & mapping anomaly timestamps' },
    { title: 'Adaptive Evidence Fusion', desc: 'Calibrating multi-modal signals against authentic baseline thresholds (<0.35) and drafting audit summary' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
      
      {/* Central Spinner with subtle glow */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <ShieldCheck className="w-8 h-8 animate-pulse-subtle" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Running Forensic Analysis
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Target: <span className="text-slate-700 font-semibold">{fileName || 'video_stream.mp4'}</span>
        </p>

        {/* Linear Progress Indicator */}
        <div className="max-w-xs mx-auto pt-3">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>PIPELINE PROGRESS</span>
            <span className="font-bold text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 text-left shadow-sm space-y-3.5">
        {steps.map((s, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div 
              key={idx} 
              className={`flex items-start space-x-3.5 p-2.5 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-blue-50/70 border border-blue-100 shadow-2xs' : 'border border-transparent'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${isActive ? 'text-blue-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400">
        Frames are sampled at regular intervals to prevent UI freezes while ensuring forensic fidelity.
      </p>

    </div>
  );
}
