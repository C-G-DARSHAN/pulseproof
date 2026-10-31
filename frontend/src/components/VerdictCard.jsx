import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, FileText, Download } from 'lucide-react';

export default function VerdictCard({ verdict, verdictLabel, confidenceExplanation, onOpenReport }) {
  
  // Style mapping
  const styles = {
    likely_manipulated: {
      border: 'border-rose-200',
      bg: 'bg-gradient-to-br from-rose-50/60 to-white',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertCircle className="w-8 h-8 text-rose-600" />,
      titleColor: 'text-rose-950',
      descColor: 'text-rose-800',
    },
    no_strong_evidence: {
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-br from-emerald-50/60 to-white',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
      titleColor: 'text-emerald-950',
      descColor: 'text-emerald-800',
    },
    inconclusive: {
      border: 'border-amber-200',
      bg: 'bg-gradient-to-br from-amber-50/60 to-white',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <HelpCircle className="w-8 h-8 text-amber-600" />,
      titleColor: 'text-amber-950',
      descColor: 'text-amber-800',
    }
  };

  const currentStyle = styles[verdict] || styles.inconclusive;

  return (
    <div className={`rounded-3xl border ${currentStyle.border} ${currentStyle.bg} p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Icon & Verdict Title */}
        <div className="flex items-start space-x-4 sm:space-x-5">
          <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-slate-100 flex-shrink-0 animate-fade-in">
            {currentStyle.icon}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Overall Forensic Assessment
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentStyle.badgeBg}`}>
                Adaptive Fusion Verdict
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${currentStyle.titleColor}`}>
              {verdictLabel || 'Analysis Complete'}
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${currentStyle.descColor}`}>
              {confidenceExplanation}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Calibration Ranges:</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                Real: &lt; 0.35
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md font-semibold">
                Inconclusive: 0.35 – 0.55
              </span>
              <span className="bg-rose-50 text-rose-800 border border-rose-200/80 px-2 py-0.5 rounded-md font-semibold">
                Manipulated: ≥ 0.55
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 w-full lg:w-auto flex-shrink-0">
          <button
            onClick={onOpenReport}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-xs font-bold transition-all duration-200 shadow-sm"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Forensic Audit Dossier</span>
          </button>
        </div>

      </div>
    </div>
  );
}
