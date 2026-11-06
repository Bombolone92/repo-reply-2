import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, X, Film, Sparkles } from 'lucide-react';
import type { Shot, Project, Episode } from '../types/cine3d';

interface FilmPlayerProps {
  open: boolean;
  onClose: () => void;
  shots: Shot[];
  project: Project;
  episode: Episode;
  onOpenExportZip: () => void;
}

export default function FilmPlayer({ open, onClose, shots, project, episode, onOpenExportZip }: FilmPlayerProps) {
  const readyShots = shots.filter(s => s.status === 'ready' && (s.visual_image_url || s.video_url));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  const currentShot = readyShots[currentIndex] || readyShots[0];

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIsPlaying(true);
      setCurrentTime(0);
    } else {
      clearInterval(timerRef.current);
    }
  }, [open]);

  // Video or dynamic animated shot sequence management
  useEffect(() => {
    if (!open || !currentShot || !isPlaying) return;

    const duration = (currentShot.duration_seconds || 8) * 1000;
    const interval = 100;
    let localElapsed = 0;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      localElapsed += interval;
      setCurrentTime(prev => prev + 0.1);

      if (localElapsed >= duration) {
        clearInterval(timerRef.current);
        if (currentIndex + 1 < readyShots.length) {
          setCurrentIndex(idx => idx + 1);
        } else {
          setIsPlaying(false);
        }
      }
    }, interval);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [open, currentIndex, isPlaying, readyShots.length]);

  if (!open) return null;

  const totalSeconds = readyShots.reduce((acc, s) => acc + s.duration_seconds, 0);

  const handleNext = () => {
    if (currentIndex + 1 < readyShots.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl flex flex-col h-[94vh] max-h-[880px] bg-[#0c0c12] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80 bg-[#101018]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              {project.aspect_ratio === '9:16' ? '9:16 Verticale' : '16:9 YouTube Widescreen'}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-md">
              {project.title} — Ep. {episode.episode_number}: {episode.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExportZip}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Esporta .ZIP (16:9 / 9:16)</span>
              <span className="sm:hidden">ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cinematic Screen Area: Clean 16:9 YouTube style or 9:16 Vertical */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-2 sm:p-6">
          {!readyShots.length ? (
            <div className="text-center space-y-3 p-4">
              <Film className="h-10 w-10 text-neutral-600 mx-auto" />
              <p className="text-neutral-400 text-sm">Nessuna inquadratura pronta per l'anteprima.</p>
              <p className="text-neutral-500 text-xs">Genera le inquadrature o clicca "Gratis".</p>
            </div>
          ) : (
            <div className={`relative w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl border border-neutral-800/80 mx-auto ${
              project.aspect_ratio === '9:16'
                ? 'aspect-[9/16] max-h-[80vh] max-w-[360px]'
                : 'aspect-video max-h-[620px] max-w-full'
            }`}>
              {/* If shot has video, play dynamic cartoon video */}
              {currentShot?.video_url ? (
                <video
                  ref={videoRef}
                  key={currentShot.id + '_video'}
                  src={currentShot.video_url}
                  autoPlay={isPlaying}
                  loop
                  muted={!audioEnabled}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Dynamic cartoon animated visual with camera motion */
                <div className="w-full h-full relative overflow-hidden bg-neutral-950">
                  <img
                    key={currentShot?.id}
                    src={currentShot?.visual_image_url}
                    alt={currentShot?.title}
                    className={`w-full h-full object-cover transition-transform ${
                      isPlaying ? `scene-${currentShot?.motion || 'zoom-in'}` : ''
                    }`}
                    style={{
                      // @ts-ignore
                      '--scene-duration': `${currentShot?.duration_seconds || 8}s`
                    }}
                  />
                  <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
                </div>
              )}

              {/* Discreet on-screen shot marker in corner (no subtitles!) */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs text-amber-300 font-mono flex items-center gap-2">
                <span>SC{currentShot?.scene_number} · INQ {String(currentShot?.order).padStart(2, '0')}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-white">{currentShot?.title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Timeline & Controls */}
        <div className="p-4 bg-[#101018] border-t border-neutral-800 space-y-3">
          {/* Timeline shots track */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {readyShots.map((s, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`h-2.5 rounded-full transition-all flex-shrink-0 ${
                    active
                      ? 'w-12 bg-amber-400'
                      : idx < currentIndex
                      ? 'w-6 bg-amber-500/60 hover:bg-amber-400/80'
                      : 'w-4 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  title={`Inquadratura ${s.order}: ${s.title}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 text-neutral-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800 transition"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={togglePlay}
                className="h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold transition shadow-lg shadow-amber-500/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= readyShots.length - 1}
                className="p-2 text-neutral-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-neutral-800 transition"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-lg transition ${
                  audioEnabled ? 'text-amber-400 hover:bg-amber-400/10' : 'text-neutral-500 hover:bg-neutral-800'
                }`}
                title={audioEnabled ? 'Disattiva audio' : 'Attiva audio'}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-xs font-mono text-neutral-400 flex items-center gap-3">
              <span>Inquadratura {readyShots.length ? currentIndex + 1 : 0} di {readyShots.length}</span>
              <span className="text-neutral-700">|</span>
              <span className="text-amber-300 font-semibold">{totalSeconds}s totali</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
