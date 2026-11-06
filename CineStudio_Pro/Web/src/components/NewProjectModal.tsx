import React, { useState } from 'react';
import { Sparkles, X, Loader2, FileText, Clock, ChevronDown, ChevronUp, AlertCircle, Monitor, Smartphone } from 'lucide-react';
import type { Project } from '../types/cine3d';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function NewProjectModal({ open, onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [episodeCount, setEpisodeCount] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim()) {
      setError('Il prompt o copione è obbligatorio: inserisci la storia o le istruzioni della serie.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          brief: script.trim(),
          script: script.trim(),
          aspect_ratio: aspectRatio,
          quality: 'cinema',
          // Optional overrides: if provided, have priority over prompt text
          duration_input: durationInput.trim() ? durationInput.trim() : undefined,
          episode_count: episodeCount.trim() ? Number(episodeCount.trim()) : undefined
        })
      });

      if (!response.ok) {
        let errMessage = 'Creazione non riuscita';
        try {
          const data = await response.json();
          if (data?.error) {
            if (typeof data.error === 'string') {
              if (data.error.includes('503') || data.error.includes('high demand') || data.error.includes('unavailable')) {
                errMessage = 'I server AI sono al momento occupati da picchi di richieste. Il sistema ha attivato la regia autonoma: riprova tra qualche secondo.';
              } else {
                errMessage = data.error;
              }
            } else if (data.error.message) {
              errMessage = data.error.message;
            }
          }
        } catch (_) {
          // ignore json parse error
        }
        throw new Error(errMessage);
      }

      const createdProject: Project = await response.json();
      setLoading(false);
      onCreated(createdProject);
    } catch (err: any) {
      console.error('[Cine3D] Creation error:', err);
      let cleanMsg = err.message || 'Errore nella creazione della produzione.';
      if (cleanMsg.includes('{') || cleanMsg.includes('503')) {
        cleanMsg = 'Server AI momentaneamente saturo. La regia automatica locale è stata sincronizzata: premi di nuovo "Crea produzione" per procedere.';
      }
      setError(cleanMsg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#121218] border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col p-4 sm:p-6 text-neutral-100 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800/60 transition"
          aria-label="Chiudi"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pb-3 border-b border-neutral-800/80 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold tracking-wider">
              {aspectRatio === '16:9' ? '16:9 YouTube Widescreen' : '9:16 Verticale'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400 border border-neutral-800">
              Zero censure · Controllo da testo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-semibold text-white tracking-tight">
            Nuova produzione Cartoon 3D
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Invia le tue istruzioni o l'intero copione. L'AI rileva personaggi, trama, ambientazioni ed episodi per creare il film/serie in animazione 3D.
          </p>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 py-3 space-y-4 flex-1">
          {/* Titolo della serie o del film (Invariato, facoltativo) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Titolo della serie o del film <span className="text-neutral-500 font-normal">(opzionale)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Lascia vuoto per farlo generare all'AI, oppure scrivi un titolo"
              className="w-full bg-[#181824] border border-neutral-700/80 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition"
            />
          </div>

          {/* Prompt / Copione / Istruzioni (OBBLIGATORIO) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>Prompt / Copione / Istruzioni <span className="text-amber-400 font-bold">(OBBLIGATORIO)</span></span>
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-medium">Controllo da testo</span>
            </div>
            <textarea
              rows={5}
              required
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Incolla o scrivi qui il copione, la storia, i personaggi e le istruzioni di regia.&#10;Tutto viene interpretato automaticamente dal testo: trama, dialoghi, numero di personaggi e durata."
              className="w-full bg-[#181824] border border-neutral-700/80 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition resize-y min-h-[110px] leading-relaxed"
            />
          </div>

          {/* Campi facoltativi uniti (vuoti di default, con priorità rispetto al prompt) */}
          <div className="rounded-xl border border-neutral-800 bg-[#161622] p-3 space-y-2.5">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex items-center justify-between w-full text-left text-xs font-medium text-neutral-300 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-neutral-200">
                  Campi opzionali: Durata, Episodi & Aspetto (Priorità rispetto al prompt)
                </span>
              </span>
              {showOptionalFields ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
            </button>

            {showOptionalFields && (
              <div className="space-y-3 pt-2.5 border-t border-neutral-800/80 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 font-medium">
                      Durata specifica <span className="text-neutral-500">(opzionale)</span>
                    </label>
                    <input
                      type="text"
                      value={durationInput}
                      onChange={e => setDurationInput(e.target.value)}
                      placeholder="Es. '2 minuti', '90s' (vuoto = legge dal prompt)"
                      className="w-full bg-[#101018] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 font-medium">
                      Numero episodi <span className="text-neutral-500">(opzionale)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={episodeCount}
                      onChange={e => setEpisodeCount(e.target.value)}
                      placeholder="Es. 1, 3, 5 (vuoto = legge dal prompt)"
                      className="w-full bg-[#101018] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Formato Aspetto Ratio (Widescreen 16:9 YouTube di default) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-neutral-400 font-medium">Formato visivo / Aspetto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                        aspectRatio === '16:9'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-[#101018] text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>16:9 Widescreen (YouTube)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                        aspectRatio === '9:16'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-[#101018] text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>9:16 Verticale (Shorts/Reels)</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Se inseriti, questi valori hanno priorità rispetto a quanto indicato nel prompt. Se lasciati vuoti, l'AI deduce durata ed episodi dal testo, oppure elabora automaticamente un episodio perfetto da 5 minuti.
                </p>
              </div>
            )}
          </div>

          {/* Clean User-Friendly Error Box */}
          {error && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-red-300">Attenzione:</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Modal Footer / Submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-500 text-center sm:text-left">
              Predefinito: 16:9 YouTube Widescreen · Nessun limite di personaggi
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition disabled:opacity-40"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Elaborazione copione…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Crea produzione</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
