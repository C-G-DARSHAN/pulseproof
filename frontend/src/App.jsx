import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import { checkBackendHealth, analyzeVideo } from './services/api';
import { MOCK_LIKELY_MANIPULATED, MOCK_NO_EVIDENCE, MOCK_INCONCLUSIVE } from './services/mockData';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analyzing' | 'results'
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [activeMock, setActiveMock] = useState(null);

  // Check backend health periodically
  useEffect(() => {
    async function verifyHealth() {
      const res = await checkBackendHealth();
      setBackendOnline(res.online);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setActiveMock(null);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setView('analyzing');

    try {
      // Analyze with backend or fallback
      const result = await analyzeVideo(selectedFile);
      setAnalysisData(result);
      setView('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      // Clean fallback
      const fallback = {
        ...MOCK_LIKELY_MANIPULATED,
        filename: selectedFile.name,
        filesize_mb: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2)),
        isMock: true
      };
      setAnalysisData(fallback);
      setView('results');
    }
  };

  const handleSelectMock = (type) => {
    setActiveMock(type);
    let mock = MOCK_LIKELY_MANIPULATED;
    if (type === 'authentic') mock = MOCK_NO_EVIDENCE;
    if (type === 'inconclusive') mock = MOCK_INCONCLUSIVE;

    setAnalysisData({ ...mock, isMock: true });
    setVideoUrl(null); // No local file needed for quick mock preview
    setView('results');
  };

  const handleReset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setSelectedFile(null);
    setVideoUrl(null);
    setAnalysisData(null);
    setActiveMock(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1">
        {view === 'home' && (
          <Home
            onFileSelected={handleFileSelected}
            isAnalyzing={false}
            selectedFile={selectedFile}
            onStartAnalysis={handleStartAnalysis}
            backendOnline={backendOnline}
          />
        )}

        {view === 'analyzing' && (
          <Analysis fileName={selectedFile?.name} />
        )}

        {view === 'results' && (
          <Results
            data={analysisData}
            videoUrl={videoUrl}
            onReset={handleReset}
            backendOnline={backendOnline}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm py-6 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">PulseProof Forensics Platform</span>
            <span>•</span>
            <span className="text-slate-500">DBIT Hackathon 2026</span>
          </div>
          <div className="text-slate-400">
            Trust, Privacy & Digital Provenance — Designed for honest uncertainty and traceable forensic evidence.
          </div>
        </div>
      </footer>
    </div>
  );
}
