import React from 'react';
import { ShieldCheck, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';

export default function EvidencePanel({ evidenceSummary = [], limitations = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Evidence Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300">
        <div className="flex items-center space-x-2.5 pb-3 mb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Key Forensic Evidence</h3>
            <p className="text-[11px] text-slate-500">Traceable observations contributing to verdict</p>
          </div>
        </div>

        {evidenceSummary.length > 0 ? (
          <ul className="space-y-2.5">
            {evidenceSummary.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">No primary evidence markers generated.</p>
        )}
      </div>

      {/* Forensic Limitations & Disclosure */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300">
        <div className="flex items-center space-x-2.5 pb-3 mb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Investigative Boundaries & Limitations</h3>
            <p className="text-[11px] text-slate-500">Scientific constraints & potential confounding factors</p>
          </div>
        </div>

        {limitations.length > 0 ? (
          <ul className="space-y-2.5">
            {limitations.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">No specific sensor degradation noted.</p>
        )}
      </div>

    </div>
  );
}
