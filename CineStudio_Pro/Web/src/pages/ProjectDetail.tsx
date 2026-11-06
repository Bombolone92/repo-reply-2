import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Film, Sparkles, Layers, Clock, Coins, Send, Loader2 } from 'lucide-react';
import type { Project, Character, Episode } from '../types/cine3d';
import CastPanel from '../components/CastPanel';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onSelectEpisode: (episodeId: string) => void;
}

export default function ProjectDetail({ projectId, onBack, onSelectEpisode }: ProjectDetailProps) {
  const [data, setData] = useState<{
    project: Project;
    characters: Character[];
    episodes: (Episode & { shot_count: number; ready_count: number; credits_spent: number })[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState(false);
  const [creatingEpisode, setCreatingEpisode] = useState(false);
  const [seriesInstruction, setSeriesInstruction] = useState('');
  const [modifyingSeries, setModifyingSeries] = useState(false);
  const [newEpIdea, setNewEpIdea] = useState('');
  const [epModalOpen, setEpModalOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
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
    fetchProject();
  }, [projectId]);

  const handleGenerateCast = async () => {
    setCasting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate-cast`, { method: 'POST' });
      if (res.ok) {
        await fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCasting(false);
    }
  };

  const handleCreateEpisode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreatingEpisode(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate-episode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: newEpIdea.trim() })
      });
      if (res.ok) {
        const result = await res.json();
        setNewEpIdea('');
        setEpModalOpen(false);
        if (result.episode?.id) {
          onSelectEpisode(result.episode.id);
        } else {
          await fetchProject();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingEpisode(false);
    }
  };

  const handleModifySeriesPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesInstruction.trim()) return;

    setModifyingSeries(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: seriesInstruction.trim() })
      });
      if (res.ok) {
        setSeriesInstruction('');
        await fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModifyingSeries(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-400 text-sm">
        Caricamento serie...
      </div>
    );
  }

  const { project, characters, episodes } = data;
  const minutes = Math.round((project.episode_target_seconds || 300) / 60);

  // Find incomplete episode to work on, or plan next episode
  const activeEpisode = episodes.find(e => e.ready_count < e.shot_count || e.shot_count === 0);
  const nextEpNumber = episodes.length + 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Tutte le serie</span>
      </button>

      {/* Series Title and Badges matching screenshots 5 and 6 */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
              {project.style || project.brief}
            </p>
          </div>

          <button
            onClick={() => setEpModalOpen(true)}
            disabled={project.cast_status !== 'ready'}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-40"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nuovo episodio</span>
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {project.genre && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-neutral-300 border border-neutral-800">
              {project.genre}
            </span>
          )}
          {project.audience && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-neutral-300 border border-neutral-800">
              {project.audience}
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-neutral-300 border border-neutral-800">
            {project.aspect_ratio === '16:9' ? 'Cinema 16:9' : 'Verticale 9:16'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-neutral-300 border border-neutral-800">
            {project.quality === 'cinema' ? 'Alta qualità' : 'Veloce'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-neutral-300 border border-neutral-800">
            {project.episode_count} episodi da {minutes} min
          </span>
        </div>
      </header>

      {/* Direct Prompt Revision Box for the Series (No sliders or dials!) */}
      <section className="bg-[#14141e] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Istruzioni al Regista (Modifica serie tramite prompt)</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Zero settaggi manuali</span>
        </div>
        <p className="text-xs text-neutral-400">
          Vuoi cambiare il tono, aggiungere un elemento magico o virare lo stile? Invia semplicemente le tue istruzioni all'AI.
        </p>
        <form onSubmit={handleModifySeriesPrompt} className="flex gap-2.5">
          <input
            type="text"
            value={seriesInstruction}
            onChange={e => setSeriesInstruction(e.target.value)}
            placeholder="Es. Rendi la serie più comica e movimentata, ambientata in un mondo 3D con lanterne dorate e cielo stellato..."
            className="flex-1 bg-[#0f0f16] border border-neutral-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={modifyingSeries || !seriesInstruction.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
          >
            {modifyingSeries ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Applica</span>
          </button>
        </form>
      </section>

      {/* Section 1: Cast della serie */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-xl font-heading font-semibold text-white">
            <Users className="h-5 w-5 text-amber-400" />
            <span>Cast della serie</span>
          </h2>
          {characters.length > 0 && (
            <button
              onClick={handleGenerateCast}
              disabled={casting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#181824] hover:bg-[#202030] text-neutral-300 border border-neutral-700 transition disabled:opacity-50"
            >
              {casting ? 'Ricreo il cast…' : 'Ricrea il cast'}
            </button>
          )}
        </div>

        {characters.length > 0 ? (
          <CastPanel characters={characters} aspectRatio={project.aspect_ratio} />
        ) : (
          /* Step 1 matching screenshot 5 */
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-[#121218]/60 p-10 text-center space-y-4">
            <Sparkles className="mx-auto h-8 w-8 text-amber-400" />
            <h3 className="text-2xl font-heading font-semibold text-white">Primo passo: creare il cast</h3>
            <p className="mx-auto max-w-lg text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Lo studio estrae tutti i personaggi della storia con immagini di riferimento e specifiche 3D, così i personaggi restano identici e coerenti in ogni inquadratura.
            </p>
            <button
              onClick={handleGenerateCast}
              disabled={casting}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition inline-flex items-center gap-2 disabled:opacity-50"
            >
              {casting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creo cast e stile…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Genera cast e stile</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Section 2: Episodes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-white">Episodi</h2>
          <span className="text-xs text-neutral-400 font-mono">
            {episodes.length} di {project.episode_count} scritti
          </span>
        </div>

        {episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map(ep => {
              const isComplete = ep.shot_count > 0 && ep.ready_count === ep.shot_count;
              return (
                <div
                  key={ep.id}
                  onClick={() => onSelectEpisode(ep.id)}
                  className="cursor-pointer bg-[#121218] border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition duration-200 flex items-start gap-4"
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-heading text-xl sm:text-2xl font-bold flex items-center justify-center shrink-0">
                    {ep.episode_number}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-semibold text-white tracking-wide">{ep.title}</h3>
                      {isComplete && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Completo
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {ep.logline || ep.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1 font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-amber-400" />
                        {ep.ready_count}/{ep.shot_count} inquadrature pronte
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        obiettivo {Math.round((ep.target_seconds || 300) / 60)} min
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        {ep.credits_spent} spesi
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 py-3">
            Ancora nessun episodio: usa il pulsante qui sotto per generare il primo video.
          </p>
        )}
      </section>

      {/* Section 3: "Pronto per il video" Banner matching screenshot 6 */}
      {characters.length > 0 && (
        <section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 text-center space-y-4">
          <Film className="mx-auto h-8 w-8 text-amber-400" />
          <h2 className="text-2xl font-heading font-semibold text-white">Pronto per il video</h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {activeEpisode
              ? `Episodio ${activeEpisode.episode_number} di ${project.episode_count} già programmato: ${activeEpisode.shot_count} inquadrature da generare, ognuna una clip da 6 a 15 secondi che il player unisce in un episodio unico.`
              : `La serie è prevista in ${project.episode_count} episodi da ${minutes} minuti. Lo studio scrive l'episodio ${nextEpNumber} con scene, inquadrature e voce fuori campo, poi lo apre per la generazione delle clip: 6-15 secondi ciascuna, unite dal player in un episodio unico.`}
          </p>

          <button
            onClick={() => {
              if (activeEpisode) {
                onSelectEpisode(activeEpisode.id);
              } else {
                handleCreateEpisode();
              }
            }}
            disabled={creatingEpisode}
            className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition inline-flex items-center gap-2 disabled:opacity-50"
          >
            {creatingEpisode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scrivo l'episodio…</span>
              </>
            ) : (
              <>
                <Film className="h-4 w-4" />
                <span>
                  {activeEpisode
                    ? `Genera il video — episodio ${activeEpisode.episode_number} di ${project.episode_count}`
                    : `Genera video — episodio ${nextEpNumber} di ${project.episode_count}`}
                </span>
              </>
            )}
          </button>
        </section>
      )}

      {/* Modal for new episode with custom prompt */}
      {epModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121218] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-neutral-100 shadow-2xl space-y-5">
            <h3 className="text-xl font-heading font-semibold text-white">Nuovo episodio</h3>
            <p className="text-xs text-neutral-400">
              Lo studio organizza le scene e le inquadrature ad alto dinamismo cartoon.
            </p>
            <textarea
              rows={4}
              value={newEpIdea}
              onChange={e => setNewEpIdea(e.target.value)}
              placeholder="Istruzioni o copione per questo episodio. Es. La gara ha inizio con un rombo di motori e una rimonta spettacolare..."
              className="w-full bg-[#181824] border border-neutral-700/80 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEpModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={() => handleCreateEpisode()}
                disabled={creatingEpisode}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {creatingEpisode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Scrivi l'episodio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
