import React from 'react';
import { ShieldCheck, Activity, Cpu, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function Navbar({ backendOnline, onSelectMock, onReset, activeMock }) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div 
          onClick={onReset}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-600 group-hover:shadow-blue-500/20 group-hover:shadow-md transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                PulseProof
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/70">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Forensic Evidence & Provenance Engine
            </p>
          </div>
        </div>

        {/* Status & Demo Mode controls */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Mock dataset selector */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-medium px-2 py-0.5 flex items-center text-[11px]">
              <Cpu className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Demo:
            </span>
            <button
              onClick={() => onSelectMock('manipulated')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeMock === 'manipulated' 
                  ? 'bg-white text-rose-700 shadow-sm font-semibold border border-rose-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Manipulated
            </button>
            <button
              onClick={() => onSelectMock('authentic')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeMock === 'authentic' 
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold border border-emerald-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Authentic
            </button>
            <button
              onClick={() => onSelectMock('inconclusive')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeMock === 'inconclusive' 
                  ? 'bg-white text-amber-700 shadow-sm font-semibold border border-amber-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Inconclusive
            </button>
          </div>

          {/* Backend Status indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-slate-50/80 border-slate-200/80 shadow-2xs">
            <span className="relative flex h-2 w-2">
              {backendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-slate-700 text-xs">
              {backendOnline ? 'API Connected' : 'Offline / Mock Engine'}
            </span>
          </div>

          {/* Reset / New Scan */}
          <button
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 rounded-xl border border-transparent hover:border-slate-200 transition-all duration-200"
            title="Start New Analysis"
          >
            <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

      </div>
    </header>
  );
}
