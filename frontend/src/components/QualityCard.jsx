import React from 'react';
import { Eye, Sun, Sparkles, Check, AlertCircle, Video } from 'lucide-react';

export default function QualityCard({ quality }) {
  if (!quality) return null;

  const levelBadges = {
    good: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    moderate: 'bg-blue-100 text-blue-800 border-blue-300',
    poor: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Video Quality & Feasibility</h3>
              <p className="text-[11px] text-slate-500 font-medium">Heuristic pre-screening for signal reliability</p>
            </div>
          </div>

          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${levelBadges[quality.level] || levelBadges.moderate}`}>
            {quality.level} Quality
          </span>
        </div>

        {/* Metric Tiles (2x2 Grid with generous space) */}
        <div className="grid grid-cols-2 gap-3.5 my-4">
          
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-2xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{quality.resolution}</span>
              <span className="text-xs text-slate-500 font-mono">{quality.fps} FPS</span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Real range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">≥ 720p</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-2xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sharpness / Blur</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{quality.blur_score}</span>
              <span className="text-xs text-slate-500 font-mono">Laplacian var</span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Real range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">≥ 25.0</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-2xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Illumination</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{quality.brightness_score}</span>
              <span className="text-xs text-slate-500 font-mono">Grayscale mean</span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Real range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">60 – 190</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-2xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Face ROI</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">
                {quality.face_detected ? 'Detected' : 'Undetected'}
              </span>
              <span className="text-xs text-slate-500 font-mono">{quality.face_count} primary subject</span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Real range:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">≥ 60%</span>
            </div>
          </div>

        </div>
      </div>

      {/* Quality Factors / Reasons */}
      {quality.reasons && quality.reasons.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Quality Observations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quality.reasons.map((r, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200/80 font-medium">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
