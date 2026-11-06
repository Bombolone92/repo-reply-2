import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Zap, Upload, RefreshCw, Send, Loader2, Play } from 'lucide-react';
import type { Shot, Character } from '../types/cine3d';
import ImportMediaModal from './ImportMediaModal';

interface ShotRowProps {
  shot: Shot;
  characters: Character[];
  blocked: boolean;
  onRefresh: () => void;
}

export default function ShotRow({ shot, characters, blocked, onRefresh }: ShotRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [modifying, setModifying] = useState(false);

  // Status badge styling
  const getStatusBadge = () => {
    switch (shot.status) {
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {shot.render_mode === 'free' ? 'Pronta (Gratis)' : 'Pronta'}
          </span>
        );
      case 'rendering':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 animate-pulse">
            In lavorazione…
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Fallita
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Da generare
          </span>
        );
    }
  };

  const handleMakeFree = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}/make-free`, { method: 'POST' });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}/render`, { method: 'POST' });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleModifyPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setModifying(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: customPrompt.trim() })
      });
      if (res.ok) {
        setCustomPrompt('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModifying(false);
    }
  };

  return (
    <div className="bg-[#121218] border border-neutral-800/90 rounded-2xl p-4 sm:p-5 transition hover:border-neutral-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-neutral-400 font-semibold">
              SC{shot.scene_number} · {String(shot.order).padStart(2, '0')}
            </span>
            {getStatusBadge()}
            <span className="text-xs text-neutral-400 font-mono">{shot.duration_seconds} s</span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400">
              {shot.status === 'ready'
                ? `${shot.credits_spent} crediti spesi`
                : `serve ~${shot.estimated_credits || 10} crediti`}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-wide">{shot.title}</h4>
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{shot.description}</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => setImportOpen(true)}
            disabled={busy || blocked}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a24] hover:bg-[#222230] text-neutral-200 border border-neutral-700/80 transition flex items-center gap-1.5 disabled:opacity-40"
            title="Importa clip video o immagine personalizzata"
          >
            <Upload className="h-3.5 w-3.5 text-amber-400" />
            <span>Importa</span>
          </button>

          {shot.status !== 'ready' && (
            <button
              onClick={handleMakeFree}
              disabled={busy || blocked}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a24] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 disabled:opacity-40"
              title="Crea scena animata nel browser a zero crediti"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Gratis</span>
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={busy || blocked}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm ${
              shot.status === 'ready'
                ? 'bg-[#1e1e2c] hover:bg-[#28283a] text-neutral-200 border border-neutral-700'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/10'
            }`}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : shot.status === 'ready' ? (
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{shot.status === 'ready' ? 'Rigenera' : 'Genera'}</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label={expanded ? 'Chiudi dettagli' : 'Apri dettagli'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details & Prompt Instruction Box */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                Anteprima Video 3D Cartoon (16:9)
              </span>
              <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                {shot.video_url ? (
                  <video
                    src={shot.video_url}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : shot.visual_image_url ? (
                  <img
                    src={shot.visual_image_url}
                    alt={shot.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-neutral-500">
                    Nessun media ancora generato
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Cast in shot */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                  Azione scenica cartoon
                </span>
                <p className="text-xs text-neutral-200 bg-[#181824] p-3 rounded-xl border border-neutral-800/80 leading-relaxed">
                  {shot.description}
                </p>
              </div>

              {/* Characters in shot */}
              {shot.cast?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                    Personaggi in scena
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {shot.cast.map(name => (
                      <span key={name} className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1f1f2e] text-neutral-300 border border-neutral-700/60 font-medium">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prompt 3D */}
          <div className="space-y-1">
            <details className="text-xs text-neutral-400 cursor-pointer">
              <summary className="hover:text-amber-300 transition font-mono uppercase text-[10px]">
                Visualizza prompt cinematografico 3D
              </summary>
              <p className="mt-2 text-neutral-300 bg-[#161622] p-3 rounded-xl border border-neutral-800 font-mono text-[11px] leading-relaxed">
                {shot.video_prompt}
              </p>
            </details>
          </div>

          {/* User Prompt Command (No dials or settings!) */}
          <div className="p-3.5 bg-[#171722] border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Modifica con istruzioni (L'AI esegue il comando)
              </span>
              <span className="text-[10px] text-neutral-400">Nessun settaggio tecnico: basta scrivere</span>
            </div>
            <form onSubmit={handleModifyPrompt} className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Es. Fai compiere un'acrobazia in curva a tutta velocità, con fumo colorato dagli pneumatici..."
                className="flex-1 bg-[#101018] border border-neutral-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={modifying || !customPrompt.trim()}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
              >
                {modifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Invia</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <ImportMediaModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        shot={shot}
        onUpdated={() => {
          onRefresh();
        }}
      />
    </div>
  );
}
