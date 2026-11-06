import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, AlertTriangle, Play, CheckCircle2, Film, Loader2, Sparkles, Key, Clipboard, ExternalLink } from 'lucide-react';
import type { StudioGenerationState, Shot } from '../types/cine3d';

interface LiveObservationConsoleProps {
  generationState: StudioGenerationState;
  shots?: Shot[];
  onRefresh?: () => void;
  onOpenKeys?: () => void;
}

export default function LiveObservationConsole({
  generationState,
  shots = [],
  onRefresh,
  onOpenKeys
}: LiveObservationConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [fastKeyInput, setFastKeyInput] = useState('');
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [generationState.logs]);

  // Quick Resume handler with new key
  const handleQuickResumeWithKey = async () => {
    if (!fastKeyInput.trim()) return;
    setResuming(true);
    setResumeError('');

    try {
      // 1. Add key to server pool
      const addRes = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: fastKeyInput.trim(),
          label: 'Nuova Chiave Ripresa Rapida',
          overwrite: true
        })
      });
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.error || 'Chiave non valida.');

      // 2. Trigger resume
      await fetch('/api/generation/resume', { method: 'POST' });
      setFastKeyInput('');
      onRefresh?.();
    } catch (err: any) {
      setResumeError(err.message || 'Errore durante la ripresa.');
    } finally {
      setResuming(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith('AIza')) {
        setFastKeyInput(text.trim());
      } else if (text) {
        setFastKeyInput(text.trim());
      }
    } catch (e) {
      console.warn('Clipboard read failed', e);
    }
  };

  const readyShotsCount = shots.filter(s => s.status === 'ready').length;
  const totalShots = Math.max(1, shots.length);
  const renderPercent = Math.round((readyShotsCount / totalShots) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-neutral-100">
      {/* Top Status Header */}
      <div className="bg-[#101018] border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
            generationState.is_paused
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
              : generationState.is_generating
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {generationState.is_paused ? (
              <AlertTriangle className="h-6 w-6" />
            ) : generationState.is_generating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-heading font-bold text-white">
                Osservatorio in Tempo Reale
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                generationState.is_paused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : generationState.is_generating
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {generationState.is_paused ? 'Pausa Limite Quota' : generationState.is_generating ? 'In Elaborazione' : 'Pronto'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {generationState.current_step || 'In attesa di istruzioni...'}
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Inquadrature pronte:</span>
            <span className="font-mono font-bold text-amber-400">{readyShotsCount} / {totalShots} ({renderPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
              style={{ width: `${renderPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quota Exhaustion Alert Banner & Quick Resume Box */}
      {generationState.is_paused && (
        <div className="bg-[#181308] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300">
                Tutti i Token delle Chiavi Google AI Studio Sono Esauriti
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed mt-1">
                La produzione è stata congelata in sicurezza senza perdere nulla di quanto già sviluppato. Attendi il ripristino automatico delle quote oppure inserisci una nuova chiave API per sbloccare e continuare subito la lavorazione dal punto esatto in cui è stata sospesa.
              </p>
            </div>
          </div>

          <div className="bg-[#0e0c05] border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
            <label className="text-xs text-amber-300 font-medium block">
              Inserisci o incolla una nuova chiave Google AI Studio:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={fastKeyInput}
                onChange={(e) => setFastKeyInput(e.target.value)}
                placeholder="Incolla qui la nuova API Key..."
                className="flex-1 bg-[#1a1608] border border-amber-500/40 rounded-xl px-4 py-2 text-xs text-amber-100 font-mono outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Incolla
              </button>
              <button
                type="button"
                disabled={resuming || !fastKeyInput.trim()}
                onClick={handleQuickResumeWithKey}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-amber-500/20"
              >
                {resuming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Salva e Riprendi
              </button>
            </div>

            {resumeError && (
              <div className="text-xs text-red-400 mt-1">{resumeError}</div>
            )}

            <div className="flex items-center justify-between pt-1 text-[11px] text-amber-300/80">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 font-medium text-amber-300"
              >
                <span>🔗 Recupera la tua API Key su Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                type="button"
                onClick={onOpenKeys}
                className="hover:underline text-neutral-400 hover:text-white"
              >
                Apri Gestore Chiavi Completo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Log Console */}
      <div className="bg-[#0b0c13] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="bg-[#11121d] px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <div className="text-xs font-mono text-neutral-400 ml-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>Cine3D Studio Engine Console • Real-Time Log</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Live Output</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 font-mono text-xs text-neutral-300 h-64 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-amber-500/30">
          {generationState.logs.length === 0 ? (
            <div className="text-neutral-500 italic">In attesa dell avvio della pipeline...</div>
          ) : (
            generationState.logs.map((log, index) => {
              const isWarning = log.includes('⚠️') || log.includes('Quota');
              const isSuccess = log.includes('✅') || log.includes('completat') || log.includes('successo');
              const isError = log.includes('🛑') || log.includes('Errore');

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    isError
                      ? 'text-red-400 font-bold'
                      : isWarning
                      ? 'text-amber-300 font-semibold'
                      : isSuccess
                      ? 'text-emerald-300'
                      : 'text-neutral-300'
                  }`}
                >
                  <span className="text-neutral-600 select-none">❯</span>
                  <span>{log}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Live Shot Gallery Preview */}
      {shots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-heading">
              Inquadrature in Produzione ({shots.length})
            </h3>
            <span className="text-xs text-neutral-500">
              Animazioni procedurali e audio sintetizzati dinamicamente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {shots.map((shot) => {
              const isReady = shot.status === 'ready';
              const isRendering = shot.status === 'rendering';

              return (
                <div
                  key={shot.id}
                  className={`rounded-xl border p-3 transition space-y-2 ${
                    isReady
                      ? 'bg-[#12121c] border-neutral-800'
                      : isRendering
                      ? 'bg-blue-950/20 border-blue-500/40 animate-pulse'
                      : 'bg-[#0e0e14] border-neutral-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                      SC {shot.scene_number || 1} • INQ {shot.order}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {shot.duration_seconds}s
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-white line-clamp-1">
                    {shot.title}
                  </div>

                  {/* Video preview if ready */}
                  {isReady && shot.video_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-neutral-800 group">
                      <video
                        src={shot.video_url}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
                      {isRendering ? (
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Rendering...</span>
                        </div>
                      ) : (
                        <span>In attesa</span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {shot.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
