import React, { useState, useRef } from 'react';
import { UploadCloud, Film, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function VideoUploader({ onFileSelected, isAnalyzing, selectedFile, onStartAnalysis }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndPassFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    // Check type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const isVideo = validTypes.includes(file.type) || file.name.match(/\.(mp4|mov|avi|webm)$/i);
    
    if (!isVideo) {
      setErrorMsg('Please select a valid video file (.mp4, .mov, .webm, or .avi).');
      return;
    }

    // Check size limit: 100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Video file exceeds 100MB limit. Please upload a shorter clip for hackathon analysis.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 group shadow-xs ${
          dragActive
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
            : selectedFile
            ? 'border-slate-300 bg-white shadow-sm'
            : 'border-slate-300/80 hover:border-blue-400 bg-white cursor-pointer hover:bg-slate-50/60 hover:shadow-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/avi"
          onChange={handleChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <UploadCloud className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Upload video for forensic analysis
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <span className="font-mono">MP4, MOV, WebM, AVI</span>
              <span>•</span>
              <span>Up to 100 MB</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-2xs">
                <Film className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for pipeline execution
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isAnalyzing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartAnalysis();
                }}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                <span>{isAnalyzing ? 'Analyzing Video...' : 'Run Forensic Analysis'}</span>
                {!isAnalyzing && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
