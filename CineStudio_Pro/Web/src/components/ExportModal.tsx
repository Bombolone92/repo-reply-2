import React, { useState } from 'react';
import { SeriesProject, Episode, SceneClip } from '../types';
import { audioEngine } from '../services/audioEngine';
import { createEpisodeZipBundle } from '../services/zipExporter';
import { Download, Package, CheckCircle, FileText, Music, Video, Loader2, Sparkles, Terminal } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SeriesProject;
  currentEpisode: Episode;
  renderedClips: Map<string, Blob>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  currentEpisode,
  renderedClips,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    setExportProgress(10);
    setStatusMessage('Generazione effetti sonori procedurali (SFX) e sintesi audio...');

    try {
      // 1. Generate audio files for each clip
      const audioBlobs = new Map<string, Blob>();
      const audioMixList: { blob: Blob; startSecond: number }[] = [];
      let accumulatedTime = 0;

      for (let i = 0; i < currentEpisode.clips.length; i++) {
        const clip = currentEpisode.clips[i];
        const clipProgress = 10 + Math.round((i / currentEpisode.clips.length) * 40);
        setExportProgress(clipProgress);
        setStatusMessage(`Elaborazione audio Clip ${i + 1}/${currentEpisode.clips.length}...`);

        // Generate SFX blob
        let sfxBlob: Blob | null = null;
        if (clip.sfx && clip.sfx !== 'none') {
          sfxBlob = await audioEngine.generateSfxBlob(clip.sfx, Math.min(clip.durationSeconds, 2.0));
          audioBlobs.set(clip.id, sfxBlob);
          audioMixList.push({ blob: sfxBlob, startSecond: accumulatedTime });
        } else {
          // Empty silent buffer
          sfxBlob = await audioEngine.generateSfxBlob('none', 1.0);
          audioBlobs.set(clip.id, sfxBlob);
        }

        accumulatedTime += clip.durationSeconds;
      }

      setExportProgress(60);
      setStatusMessage('Mixdown traccia audio master dell\'intero episodio...');

      // 2. Mix complete episode audio
      const fullAudioBlob = await audioEngine.mixAudioBlobs(audioMixList, accumulatedTime);

      setExportProgress(75);
      setStatusMessage('Creazione pacchetto ZIP, sottotitoli SRT e script di unione...');

      // 3. Create ZIP archive
      const zipBlob = await createEpisodeZipBundle(
        project,
        currentEpisode,
        renderedClips,
        audioBlobs,
        fullAudioBlob
      );

      setExportProgress(95);
      setStatusMessage('Avvio download del file ZIP sul PC locale...');

      // 4. Trigger browser download
      const safeTitle = project.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `EPISODIO_${currentEpisode.episodeNumber}_${safeTitle}_PACCHETTO_PC.zip`;

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setExportProgress(100);
      setStatusMessage('Download completato con successo!');
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Export error:', err);
      setStatusMessage('Errore durante la creazione del pacchetto ZIP.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalClips = currentEpisode.clips.length;
  const renderedCount = currentEpisode.clips.filter(c => renderedClips.has(c.id)).length;
  const totalSeconds = currentEpisode.clips.reduce((acc, c) => acc + c.durationSeconds, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Esporta Episodio #{currentEpisode.episodeNumber} in Pacchetto ZIP
              </h2>
              <p className="text-xs text-slate-400">
                Esporta tutte le scene, tracce audio, sottotitoli e script per unire tutto sul PC.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            Chiudi
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xl font-bold text-white">{totalClips}</div>
              <div className="text-[11px] text-slate-400">Clip Totali</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xl font-bold text-emerald-400">
                {(totalSeconds / 60).toFixed(1)} min
              </div>
              <div className="text-[11px] text-slate-400">Durata Totale</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xl font-bold text-indigo-400">
                {renderedCount} / {totalClips}
              </div>
              <div className="text-[11px] text-slate-400">Clip Renderizzate</div>
            </div>
          </div>

          {/* Folder structure representation */}
          <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-slate-400 font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Struttura del file .ZIP che verrà scaricato:
            </div>
            <div className="pl-2 text-indigo-300">📁 EPISODIO_{currentEpisode.episodeNumber}_PACCHETTO/</div>
            <div className="pl-6 text-slate-400">📁 video_clips/ <span className="text-slate-500">(scene clip_001.webm, clip_002.webm ...)</span></div>
            <div className="pl-6 text-slate-400">📁 audio_tracce/ <span className="text-slate-500">(audio_completo_episodio.wav, clip_sfx.wav ...)</span></div>
            <div className="pl-6 text-slate-400">📁 sottotitoli/ <span className="text-slate-500">(sottotitoli_episodio.srt sincronizzato)</span></div>
            <div className="pl-6 text-emerald-300">📁 timeline_montaggio/</div>
            <div className="pl-10 text-amber-300">⚡ UNISCI_AUTOMATICO_WINDOWS.bat <span className="text-slate-500">(1-click FFmpeg merge)</span></div>
            <div className="pl-10 text-amber-300">⚡ UNISCI_AUTOMATICO_MAC_LINUX.sh</div>
            <div className="pl-10 text-slate-400">📄 timeline_edl.json + lista_file_ffmpeg.txt</div>
            <div className="pl-6 text-sky-300">📁 pipeline_python_cpp_opensource/ <span className="text-emerald-400 font-bold">(Opzionale per PC)</span></div>
            <div className="pl-10 text-emerald-400">⚡ AVVIA_AUTOMATICO_WINDOWS.bat <span className="text-slate-400">(Crea .venv, aggiorna ed installa librerie da solo!)</span></div>
            <div className="pl-10 text-slate-400">📄 pipeline_render_serie.py + blender_render_3d.py + workflow_comfyui.json</div>
            <div className="pl-6 text-slate-300">📄 GUIDA_MONTAGGIO_PC.txt <span className="text-slate-500">(istruzioni complete)</span></div>
          </div>

          {/* Progress bar if active */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  {statusMessage}
                </span>
                <span className="font-mono font-bold text-emerald-400">{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Archivio ZIP generato e scaricato!</strong> Estrai la cartella sul tuo PC e apri <code>GUIDA_MONTAGGIO_PC.txt</code> o esegui lo script di unione con 1 click.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Nessun limite di esportazione • 100% Free
          </div>
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Generazione ZIP...' : 'Scarica Pacchetto Completo .ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
};
