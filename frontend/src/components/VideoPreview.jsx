import React, { forwardRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Crosshair } from 'lucide-react';

const VideoPreview = forwardRef(function VideoPreview({ videoUrl, fileName, suspiciousTimestamps = [] }, ref) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!ref.current) return;
    if (ref.current.paused) {
      ref.current.play();
      setIsPlaying(true);
    } else {
      ref.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (ref.current) {
      setDuration(ref.current.duration);
    }
  };

  const restartVideo = () => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Check if current time is near any suspicious timestamp (+- 0.4s)
  const isNearSuspicious = suspiciousTimestamps.some(
    (ts) => Math.abs(currentTime - ts) < 0.4
  );

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-800">
      
      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={ref}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            playsInline
          />
        ) : (
          <div className="text-center p-8 text-slate-500">
            <p className="text-xs">No video stream loaded</p>
          </div>
        )}

        {/* Suspicious Artifact Overlay indicator */}
        {isNearSuspicious && (
          <div className="absolute top-4 right-4 bg-rose-600/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-pulse border border-rose-400">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Temporal Anomaly Active ({formatSeconds(currentTime)})</span>
          </div>
        )}

        {/* Forensics Watermark */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded border border-white/10 pointer-events-none">
          TIMECODE: {formatSeconds(currentTime)} / {formatSeconds(duration)}
        </div>
      </div>

      {/* Mini Video Controls */}
      <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            disabled={!videoUrl}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={restartVideo}
            disabled={!videoUrl}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 ml-2">
            {fileName || 'Video Player'}
          </span>
        </div>

        {/* Timestamp indicators */}
        <div className="flex items-center space-x-1">
          {suspiciousTimestamps.length > 0 && (
            <span className="text-[11px] text-rose-400 font-medium bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
              {suspiciousTimestamps.length} Anomaly Markers
            </span>
          )}
        </div>
      </div>

    </div>
  );
});

export default VideoPreview;
