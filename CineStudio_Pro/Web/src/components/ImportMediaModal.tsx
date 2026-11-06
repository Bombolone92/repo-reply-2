import React, { useState } from 'react';
import { Film, Image as ImageIcon, Music, Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { Shot } from '../types/cine3d';

interface ImportMediaModalProps {
  open: boolean;
  onClose: () => void;
  shot: Shot;
  onUpdated: (shot: Shot) => void;
}

export default function ImportMediaModal({ open, onClose, shot, onUpdated }: ImportMediaModalProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!open) return null;

  const handleFileUpload = (type: 'video' | 'image' | 'audio', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      try {
        const res = await fetch(`/api/shots/${shot.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, dataUrl })
        });

        if (res.ok) {
          const updatedShot: Shot = await res.json();
          onUpdated(updatedShot);
          setSuccessMsg(`File ${type === 'video' ? 'video' : type === 'image' ? 'immagine' : 'audio'} caricato con successo!`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121218] border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-neutral-100 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-heading font-semibold text-white">Importa i tuoi file</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sostituisci o arricchisci questa inquadratura con le tue clip, immagini o tracce audio: zero crediti.
          </p>
        </div>

        <div className="space-y-3">
          {/* Video Clip */}
          <div className="p-3.5 bg-[#181822] rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Film className="h-4 w-4 text-amber-400" />
                <span>Clip video (MP4/WebM)</span>
              </div>
              {shot.video_url && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  presente
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">Usata al posto della clip AI durante la riproduzione.</p>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="video/*"
                disabled={uploading === 'video'}
                onChange={e => handleFileUpload('video', e)}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition">
                {uploading === 'video' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>{uploading === 'video' ? 'Caricamento…' : 'Carica video'}</span>
              </span>
            </label>
          </div>

          {/* Scene Image */}
          <div className="p-3.5 bg-[#181822] rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <ImageIcon className="h-4 w-4 text-amber-400" />
                <span>Immagine di scena</span>
              </div>
              {shot.visual_image_url && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  presente
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">Viene animata con movimento di camera nel player (zoom/pan).</p>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                disabled={uploading === 'image'}
                onChange={e => handleFileUpload('image', e)}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition">
                {uploading === 'image' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>{uploading === 'image' ? 'Caricamento…' : 'Carica immagine'}</span>
              </span>
            </label>
          </div>

          {/* Audio */}
          <div className="p-3.5 bg-[#181822] rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Music className="h-4 w-4 text-amber-400" />
                <span>Traccia audio / voce registrata</span>
              </div>
              {shot.audio_url && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  presente
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">Sostituisce la voce sintetica durante la riproduzione.</p>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                disabled={uploading === 'audio'}
                onChange={e => handleFileUpload('audio', e)}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition">
                {uploading === 'audio' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>{uploading === 'audio' ? 'Caricamento…' : 'Carica audio'}</span>
              </span>
            </label>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
