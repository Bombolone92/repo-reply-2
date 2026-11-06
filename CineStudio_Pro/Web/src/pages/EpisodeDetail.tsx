import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Film, Sparkles, Calculator, Share2, Download, Pause, Square, Send, Loader2, AlertCircle } from 'lucide-react';
import type { Episode, Project, Character, Shot } from '../types/cine3d';
import ShotRow from '../components/ShotRow';
import FilmPlayer from '../components/FilmPlayer';
import SocialPackModal from '../components/SocialPackModal';
import ExportZipModal from '../components/ExportZipModal';

interface EpisodeDetailProps {
  episodeId: string;
  onBack: () => void;
}

export default function EpisodeDetail({ episodeId, onBack }: EpisodeDetailProps) {
  const [data, setData] = useState<{
    episode: Episode;
    project: Project;
    characters: Character[];
    shots: Shot[];
    blockingEpisodeNumber: number | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [exportZipOpen, setExportZipOpen] = useState(false);
  
  // Direct prompt revision
  const [episodePrompt, setEpisodePrompt] = useState('');
  const [modifying, setModifying] = useState(false);

  // Batch generator state
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');
  const stopRef = useRef(false);

  const [estimateMsg, setEstimateMsg] = useState('');
  const [estimating, setEstimating] = useState(false);

  const fetchEpisode = async () => {
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode();
  }, [episodeId]);

  // Batch generation logic: sequential execution of all pending shots
  const handleStartBatch = async () => {
    if (!data) return;
    const pendingShots = data.shots.filter(s => s.status !== 'ready');
    if (!pendingShots.length) return;

    stopRef.current = false;
    setBatchRunning(true);
    setBatchProgress(`0 di ${pendingShots.length} completate`);

    for (let i = 0; i < pendingShots.length; i++) {
      if (stopRef.current) break;
      const shot = pendingShots[i];
      setBatchProgress(`Generazione inquadratura ${shot.order} (${i + 1} di ${pendingShots.length})...`);

      try {
        await fetch(`/api/shots/${shot.id}/render`, { method: 'POST' });
        // Wait simulated rendering time
        await new Promise(r => setTimeout(r, 1400));
        await fetchEpisode();
      } catch (err) {
        console.error(err);
      }
    }

    setBatchRunning(false);
    setBatchProgress('');
    fetchEpisode();
  };

  const handleStopBatch = () => {
    stopRef.current = true;
    setBatchRunning(false);
    setBatchProgress('');
  };

  const handleEstimateCredits = () => {
    if (!data) return;
    setEstimating(true);
    const pending = data.shots.filter(s => s.status !== 'ready');
    const totalCredits = pending.reduce((acc, s) => acc + (s.estimated_credits || 10), 0);
    setTimeout(() => {
      setEstimateMsg(
        pending.length > 0
          ? `Stima per le ${pending.length} inquadrature mancanti: circa ${totalCredits} crediti. Durata prevista: ${pending.reduce((a, b) => a + b.duration_seconds, 0)} secondi.`
          : 'Tutte le inquadrature sono già state generate (0 crediti rimanenti).'
      );
      setEstimating(false);
    }, 400);
  };

  const handleModifyEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodePrompt.trim()) return;

    setModifying(true);
    try {
      const res = await fetch(`/api/episodes/${episodeId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: episodePrompt.trim() })
      });
      if (res.ok) {
        setEpisodePrompt('');
        await fetchEpisode();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModifying(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-400 text-sm">
        Caricamento episodio...
      </div>
    );
  }

  const { episode, project, characters, shots, blockingEpisodeNumber } = data;

  const readyShots = shots.filter(s => s.status === 'ready');
  const pendingShots = shots.filter(s => s.status !== 'ready');
  const totalPlannedSeconds = shots.reduce((acc, s) => acc + s.duration_seconds, 0);
  const totalReadySeconds = readyShots.reduce((acc, s) => acc + s.duration_seconds, 0);
  const totalSpentCredits = shots.reduce((acc, s) => acc + (s.credits_spent || 0), 0);

  // Sequential lock: shot N is locked unless shot N-1 is ready
  let prevIsReady = true;
  const unlockedMap: Record<string, boolean> = {};
  shots.forEach(s => {
    unlockedMap[s.id] = prevIsReady;
    if (s.status !== 'ready') {
      prevIsReady = false;
    }
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Back to Project */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{project.title}</span>
      </button>

      {/* Header matching screenshot 7 */}
      <header className="space-y-3 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold tracking-wider">
            STAGIONE {episode.season_number || 1} · EPISODIO {episode.episode_number} (S{episode.season_number || 1}_E{episode.episode_number})
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            File Master: {project.title.replace(/[\/\\?%*:|"<>]/g, '').trim()} - S{episode.season_number || 1}_E{episode.episode_number}.mp4
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
          {episode.title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
          {episode.logline || episode.synopsis}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#181822] text-neutral-300 border border-neutral-800">
            {readyShots.length}/{shots.length} inquadrature pronte
          </span>
          <span className="px-3 py-1 rounded-full bg-[#181822] text-neutral-300 border border-neutral-800">
            {totalReadySeconds} s generati · obiettivo {Math.round((episode.target_seconds || 300) / 60)} min
          </span>
          <span className="px-3 py-1 rounded-full bg-[#181822] text-neutral-300 border border-neutral-800">
            16:9 Widescreen (YouTube)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#181822] text-neutral-300 border border-neutral-800">
            {project.quality === 'cinema' ? 'Alta qualità' : 'Veloce'}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#181822] text-neutral-300 border border-neutral-800">
            {totalSpentCredits} crediti spesi
          </span>
        </div>
      </header>

      {/* Action Buttons Toolbar matching screenshot 7 + Export ZIP */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPlayerOpen(true)}
          disabled={!readyShots.length}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-40"
        >
          <Film className="h-4 w-4" />
          <span>Guarda l'episodio</span>
        </button>

        {batchRunning ? (
          <button
            onClick={handleStopBatch}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Interrompi generazione</span>
          </button>
        ) : (
          <button
            onClick={handleStartBatch}
            disabled={!pendingShots.length || !!blockingEpisodeNumber}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#242432] text-white border border-neutral-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>
              {pendingShots.length
                ? `Genera le ${pendingShots.length} mancanti`
                : 'Tutto generato'}
            </span>
          </button>
        )}

        <button
          onClick={handleEstimateCredits}
          disabled={estimating}
          className="px-4 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#242432] text-neutral-300 border border-neutral-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2"
        >
          <Calculator className="h-4 w-4 text-amber-400" />
          <span>{estimating ? 'Calcolo…' : 'Stima crediti'}</span>
        </button>

        <button
          onClick={() => setSocialOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#242432] text-neutral-300 border border-neutral-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2"
        >
          <Share2 className="h-4 w-4 text-amber-400" />
          <span>Pacchetto social</span>
        </button>

        {/* Export ZIP Button */}
        <button
          onClick={() => setExportZipOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-semibold text-xs sm:text-sm transition flex items-center gap-2 ml-auto"
        >
          <Download className="h-4 w-4 text-amber-400" />
          <span>Esporta video (.ZIP)</span>
        </button>
      </div>

      {/* Batch running banner */}
      {batchRunning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span>Generazione sequenziale in corso: {batchProgress}. Puoi lasciare la pagina aperta: una inquadratura alla volta.</span>
        </div>
      )}

      {/* Estimate notification */}
      {estimateMsg && (
        <div className="p-3.5 bg-neutral-900 border border-amber-500/30 rounded-xl text-xs text-neutral-300 space-y-1">
          <p className="font-semibold text-amber-400">Riepilogo stima produzione:</p>
          <p>{estimateMsg}</p>
        </div>
      )}

      {/* Blocker alert if earlier episode is pending */}
      {blockingEpisodeNumber && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-xs text-amber-300 leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Regola d'oro di produzione sequenziale:</strong> Completa prima l'episodio {blockingEpisodeNumber} per sbloccare la generazione video di questo episodio. Così puoi pubblicare l'episodio precedente mentre gli altri sono in produzione.
          </div>
        </div>
      )}

      {/* Direct Prompt Revision Box for Episode (No sliders/technical dials!) */}
      <section className="bg-[#14141e] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Istruzioni al Regista per questo episodio</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Controllo totale via prompt</span>
        </div>
        <p className="text-xs text-neutral-400">
          Vuoi cambiare il ritmo, aggiungere un colpo di scena o variare le azioni dei personaggi? Invia le tue istruzioni e l'AI adatterà le inquadrature.
        </p>
        <form onSubmit={handleModifyEpisode} className="flex gap-2.5">
          <input
            type="text"
            value={episodePrompt}
            onChange={e => setEpisodePrompt(e.target.value)}
            placeholder="Es. Rendi la scena dell'incontro più emozionante con musica e stupore, e fai scoprire un secondo indizio a Zilla..."
            className="flex-1 bg-[#0f0f16] border border-neutral-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={modifying || !episodePrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
          >
            {modifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Invia</span>
          </button>
        </form>
      </section>

      {/* Inquadrature List Section matching screenshot 7 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h2 className="text-xl font-heading font-semibold text-white">Inquadrature</h2>
          <span className="text-xs text-neutral-400 font-mono">
            {shots.length} inquadrature · {Math.floor(totalPlannedSeconds / 60)} min {totalPlannedSeconds % 60} s di film previsti
          </span>
        </div>

        <div className="space-y-1 text-xs text-neutral-400 leading-relaxed">
          <p>
            Ogni inquadratura è una clip da 6 a 15 secondi: il player le unisce in un unico episodio da {Math.round((episode.target_seconds || 300) / 60)} minuti.
          </p>
          <p>
            Produzione in ordine: ogni inquadratura si sblocca quando la precedente è pronta. Con il pulsante "Gratis" crei la scena animando le immagini del cast nel browser: zero crediti.
          </p>
        </div>

        {/* Shot Rows */}
        <div className="space-y-3 pt-2">
          {shots.map(shot => (
            <ShotRow
              key={shot.id}
              shot={shot}
              characters={characters}
              blocked={!!blockingEpisodeNumber || !unlockedMap[shot.id]}
              onRefresh={fetchEpisode}
            />
          ))}
        </div>
      </section>

      {/* Film Player Modal */}
      <FilmPlayer
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        shots={shots}
        project={project}
        episode={episode}
        onOpenExportZip={() => {
          setPlayerOpen(false);
          setExportZipOpen(true);
        }}
      />

      {/* Social Pack Modal */}
      <SocialPackModal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        episode={episode}
        onUpdated={fetchEpisode}
      />

      {/* Export ZIP Modal */}
      <ExportZipModal
        open={exportZipOpen}
        onClose={() => setExportZipOpen(false)}
        episode={episode}
        project={project}
        shots={shots}
      />
    </div>
  );
}
