import React, { useState } from 'react';
import { Copy, Check, Sparkles, X, Share2, Loader2 } from 'lucide-react';
import type { Episode } from '../types/cine3d';

interface SocialPackModalProps {
  open: boolean;
  onClose: () => void;
  episode: Episode;
  onUpdated: (episode: Episode) => void;
}

export default function SocialPackModal({ open, onClose, episode, onUpdated }: SocialPackModalProps) {
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/episodes/${episode.id}/generate-social`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const allText = `${episode.publish_title || episode.title}\n\n${episode.publish_description || episode.synopsis}\n\n${(episode.publish_hashtags || []).map(h => `#${h}`).join(' ')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121218] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-neutral-100 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-white">Pacchetto social</h3>
            <p className="text-xs text-neutral-400">Pronto per TikTok, Instagram Reels e YouTube Shorts</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-400" />}
            <span>{episode.publish_title ? 'Rigenera testi social con AI' : 'Genera testi social con AI'}</span>
          </button>

          {episode.publish_title ? (
            <div className="space-y-3">
              <div className="bg-[#181822] p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-amber-400/90 font-semibold">Titolo Social</span>
                  <button
                    onClick={() => copyToClipboard(episode.publish_title || '', 'title')}
                    className="text-neutral-400 hover:text-white p-1 transition"
                  >
                    {copiedKey === 'title' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-sm font-medium text-white">{episode.publish_title}</p>
              </div>

              <div className="bg-[#181822] p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-amber-400/90 font-semibold">Descrizione & Gancio</span>
                  <button
                    onClick={() => copyToClipboard(episode.publish_description || '', 'desc')}
                    className="text-neutral-400 hover:text-white p-1 transition"
                  >
                    {copiedKey === 'desc' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{episode.publish_description}</p>
              </div>

              {episode.publish_hashtags && (
                <div className="bg-[#181822] p-3 rounded-xl border border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-mono uppercase text-amber-400/90 font-semibold">Hashtags</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {episode.publish_hashtags.map((h, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => copyToClipboard(allText, 'all')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                {copiedKey === 'all' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedKey === 'all' ? 'Copiato negli appunti!' : 'Copia pacchetto completo'}</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-center text-neutral-500 py-4">
              Clicca il pulsante in alto per scrivere titolo, descrizione e hashtag ottimizzati con l'AI.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
