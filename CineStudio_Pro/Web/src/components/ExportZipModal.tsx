import React, { useState } from 'react';
import { Download, CheckCircle2, Loader2, FolderArchive, Film, Video } from 'lucide-react';
import type { Episode, Project, Shot } from '../types/cine3d';

interface ExportZipModalProps {
  open: boolean;
  onClose: () => void;
  episode: Episode;
  project: Project;
  shots: Shot[];
}

export default function ExportZipModal({ open, onClose, episode, project, shots }: ExportZipModalProps) {
  const [export16x9, setExport16x9] = useState(true);
  const [export9x16, setExport9x16] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [completed, setCompleted] = useState(false);

  if (!open) return null;

  const cleanTitle = (project.title || 'Serie').replace(/[\/\\?%*:|"<>]/g, '').trim();
  const season = episode.season_number || 1;
  const epNum = episode.episode_number || 1;
  const epCode = `S${season}_E${epNum}`;

  const handleExportZip = async () => {
    if (!export16x9 && !export9x16) {
      alert('Seleziona almeno un formato da esportare (16:9 o 9:16).');
      return;
    }

    setExporting(true);
    setProgress('Rendering video master MP4 con FFmpeg in corso...');
    setCompleted(false);

    try {
      const res = await fetch(`/api/episodes/${episode.id}/export-zip?f16=${export16x9}&f9=${export9x16}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Impossibile esportare archivio ZIP');
      }

      setProgress('Compressione master ZIP con i video MP4 reali...');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Master zip filename: TITOLO SERIE - S1_E1_Master_Pack.zip
      const filename = `${cleanTitle} - ${epCode}_Master_Video_Pack.zip`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress('Archivio ZIP scaricato con successo!');
      setCompleted(true);
    } catch (err: any) {
      console.error('[Cine3D Export] Error:', err);
      alert('Errore durante l esportazione master ZIP: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#121218] border border-amber-500/30 rounded-2xl max-w-lg w-full p-5 sm:p-6 text-neutral-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-white">Esporta Master Video (.ZIP)</h3>
              <p className="text-xs text-neutral-400">Contiene concretamente i file video .MP4 pronti e completi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Informazioni Episodio & File */}
        <div className="bg-[#161622] p-3.5 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-mono uppercase tracking-wider">Codice Produzione:</span>
            <span className="text-amber-400 font-mono font-bold">{epCode}</span>
          </div>
          <div className="text-xs text-white font-medium">
            {cleanTitle} — Ep. {epNum}: {episode.title}
          </div>
        </div>

        {/* Checkflags for Formats */}
        <div className="space-y-3 bg-[#181824] p-4 rounded-xl border border-neutral-800">
          <p className="text-xs font-semibold text-amber-400 uppercase font-mono tracking-wider">
            Formati video da includere nel .ZIP:
          </p>
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 text-xs text-neutral-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={export16x9}
                onChange={e => setExport16x9(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 cursor-pointer mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-amber-400" />
                  16:9 Orizzontale Widescreen (YouTube, Cinema, TV)
                </span>
                <p className="text-[11px] text-neutral-400 font-mono">
                  File: <code className="text-neutral-300">{cleanTitle} - {epCode}.mp4</code> (Full HD)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 text-xs text-neutral-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={export9x16}
                onChange={e => setExport9x16(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 cursor-pointer mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-amber-400" />
                  9:16 Verticale (TikTok, Instagram Reels, Shorts)
                </span>
                <p className="text-[11px] text-neutral-400 font-mono">
                  File: <code className="text-neutral-300">{cleanTitle} - {epCode} [9_16].mp4</code>
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Elenco contenuti concreti dello ZIP */}
        <div className="p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] space-y-1.5 text-neutral-300">
          <p className="font-semibold text-amber-400 font-mono uppercase tracking-wider text-[10px]">
            Contenuto concreto dell'archivio .ZIP:
          </p>
          <ul className="space-y-1 list-disc list-inside text-neutral-400">
            {export16x9 && (
              <li><strong className="text-white">{cleanTitle} - {epCode}.mp4</strong>: video master intero 16:9 Full HD</li>
            )}
            {export9x16 && (
              <li><strong className="text-white">{cleanTitle} - {epCode} [9_16].mp4</strong>: video master intero 9:16 Verticale</li>
            )}
            <li>Cartella <strong className="text-white">Inquadrature_Clip_MP4/</strong>: tutti i {shots.length} video .mp4 dei singoli shot</li>
            <li><strong className="text-white">Sceneggiatura_e_Note_Regia.txt</strong>: copione integrale e minutaggi</li>
            <li><strong className="text-white">Social_Pack_Pubblicazione.txt</strong>: copy, hashtag e titoli di lancio</li>
          </ul>
        </div>

        {exporting && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-3 text-xs text-amber-300 animate-in fade-in duration-150">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
            <span className="leading-relaxed">{progress}</span>
          </div>
        )}

        {completed && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Master ZIP con i video MP4 reali esportato con successo!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            Chiudi
          </button>
          <button
            onClick={handleExportZip}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generazione video in corso...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Scarica archivio .ZIP con video MP4</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
