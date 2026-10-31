import React from 'react';
import { AlertTriangle, Clock, Play } from 'lucide-react';

export default function Timeline({ duration = 10, suspiciousTimestamps = [], onSeekTimestamp }) {
  const safeDuration = duration > 0 ? duration : 10;

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}s`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Temporal Anomaly Localization</h3>
            <p className="text-[11px] text-slate-500">Spatiotemporal frame flicker & splicing discontinuities</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold shadow-2xs">
            Real Baseline: 0 flagged moments
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {suspiciousTimestamps.length} flagged moment(s)
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Click any anomaly marker to jump video playback directly to that exact frame timecode.
      </p>

      {/* Visual Timeline Bar */}
      <div className="relative w-full h-9 bg-slate-100/90 rounded-2xl overflow-hidden border border-slate-200 flex items-center px-2 shadow-inner">
        
        {/* Subtle grid ticks */}
        <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-400" />
          ))}
        </div>

        {/* Anomaly markers */}
        {suspiciousTimestamps.map((ts, idx) => {
          const percent = Math.min(100, Math.max(0, (ts / safeDuration) * 100));
          return (
            <button
              key={idx}
              onClick={() => onSeekTimestamp(ts)}
              style={{ left: `${percent}%` }}
              title={`Jump to anomaly at ${formatSeconds(ts)}`}
              className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 p-1 group z-10 focus:outline-none"
            >
              <div className="w-4 h-7 bg-rose-500 hover:bg-rose-600 rounded-md shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-125 border border-white">
                <div className="w-0.5 h-3.5 bg-white rounded-full" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Clickable Quick Jump Chips */}
      {suspiciousTimestamps.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400">Quick Seek:</span>
          {suspiciousTimestamps.map((ts, idx) => (
            <button
              key={idx}
              onClick={() => onSeekTimestamp(ts)}
              className="flex items-center space-x-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl transition-all font-mono active:scale-95 shadow-2xs font-medium"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{formatSeconds(ts)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>No sudden temporal flicker spikes detected across video stream.</span>
        </div>
      )}
    </div>
  );
}
