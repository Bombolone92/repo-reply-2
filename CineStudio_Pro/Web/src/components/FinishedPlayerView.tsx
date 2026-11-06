import React, { useState } from 'react';
import { Play, Download, Monitor, Smartphone, Film, Users, BookOpen, Share2, Sparkles, FolderArchive } from 'lucide-react';
import type { Episode, Project, Shot, Character } from '../types/cine3d';

interface FinishedPlayerViewProps {
  project: Project;
  episode: Episode;
  shots: Shot[];
  characters: Character[];
  onOpenExportModal: () => void;
}

export default function FinishedPlayerView({
  project,
  episode,
  shots,
  characters,
  onOpenExportModal
}: FinishedPlayerViewProps) {
  const [selectedFormat, setSelectedFormat] = useState<'16:9' | '9:16'>('16:9');
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'cast' | 'script' | 'social'>('timeline');

  const master16Url = episode.master_video_16_9 || '/uploads/videos/' + `${project.title} - S${episode.season_number || 1}_E${episode.episode_number || 1}.mp4`;
  const master9Url = episode.master_video_9_16 || '/uploads/videos/' + `${project.title} - S${episode.season_number || 1}_E${episode.episode_number || 1} [9_16].mp4`;

  const currentVideoSrc = selectedShot ? selectedShot.video_url : (selectedFormat === '9:16' ? master9Url : master16Url);
  const totalDuration = shots.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const epCode = `S${episode.season_number || 1}_E${episode.episode_number || 1}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 text-neutral-100">
      {/* Top Bar with Title and ZIP Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {epCode}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {project.title}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
            {episode.title}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl line-clamp-2">
            {episode.synopsis || episode.logline}
          </p>
        </div>

        {/* Big Export ZIP Action */}
        <button
          onClick={onOpenExportModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition shrink-0"
        >
          <FolderArchive className="h-4 w-4" />
          <span>Esporta Master ZIP (.mp4)</span>
        </button>
      </div>

      {/* Main Cinematic Video Player Area */}
      <div className="bg-[#0b0b12] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Format Switcher & Shot Notice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedShot ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-semibold font-mono">
                  Anteprima Inquadratura SC {selectedShot.scene_number || 1} • INQ {selectedShot.order}:
                </span>
                <span className="text-xs text-white truncate max-w-xs">{selectedShot.title}</span>
                <button
                  onClick={() => setSelectedShot(null)}
                  className="text-[10px] text-neutral-400 hover:text-white underline ml-2"
                >
                  Torna al Film Completo
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Master Film Completo Episodio</span>
              </div>
            )}
          </div>

          {!selectedShot && (
            <div className="flex items-center gap-1.5 bg-[#12121a] p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setSelectedFormat('16:9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedFormat === '16:9'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>16:9 Cinema</span>
              </button>
              <button
                onClick={() => setSelectedFormat('9:16')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedFormat === '9:16'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>9:16 Verticale</span>
              </button>
            </div>
          )}
        </div>

        {/* Video Screen Container */}
        <div className="relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-neutral-800/80 shadow-inner">
          <div className={selectedFormat === '9:16' && !selectedShot ? 'max-w-sm w-full aspect-[9/16]' : 'w-full aspect-video'}>
            <video
              key={currentVideoSrc}
              src={currentVideoSrc}
              controls
              autoPlay={Boolean(selectedShot)}
              className="w-full h-full object-contain"
              preload="auto"
            />
          </div>
        </div>

        {/* Video Player Meta Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-1">
          <div className="flex items-center gap-3">
            <span>Durata totale: <strong className="text-white font-mono">{totalDuration} secondi</strong></span>
            <span>Inquadrature: <strong className="text-white font-mono">{shots.length}</strong></span>
          </div>

          <div className="text-[11px] text-neutral-500">
            Formato video H.264 Full HD con audio stereo cartoon sincronizzato
          </div>
        </div>
      </div>

      {/* Tabs Selector: Timeline, Cast, Script, Social Pack */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'timeline'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>Timeline Inquadrature ({shots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cast')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'cast'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Personaggi ({characters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'script'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Sceneggiatura & Regia</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'social'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Pacchetto Social</span>
          </button>
        </div>

        {/* Tab 1: Timeline & Shot Breakdown */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {shots.map((shot) => {
              const isSelected = selectedShot?.id === shot.id;
              return (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShot(shot)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-[#12121a] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      SC {shot.scene_number || 1} • INQ {shot.order}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {shot.duration_seconds}s
                    </span>
                  </div>

                  <div className="font-bold text-xs text-white group-hover:text-amber-300 transition line-clamp-1">
                    {shot.title}
                  </div>

                  {shot.video_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-neutral-800">
                      <video
                        src={shot.video_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg">
                          <Play className="h-4 w-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {shot.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                    <span>Cast: {(shot.cast || []).join(', ') || 'Cast'}</span>
                    <span className="text-emerald-400 font-mono">MP4 Pronto</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Cast */}
        {activeTab === 'cast' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {characters.map((c) => (
              <div key={c.id} className="bg-[#12121a] border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-heading font-bold text-lg border border-amber-500/30">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <span className="text-[11px] text-amber-400 font-medium">{c.role}</span>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 space-y-1 leading-relaxed">
                  <p><strong className="text-neutral-300">Carattere:</strong> {c.personality}</p>
                  <p><strong className="text-neutral-300">Design 3D:</strong> {c.appearance}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Screenplay & Notes */}
        {activeTab === 'script' && (
          <div className="bg-[#101018] border border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-heading">
              Sceneggiatura & Note di Regia
            </h3>
            <div className="font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed bg-[#0a0a0f] p-4 rounded-lg border border-neutral-800">
{`=====================================================
SERIE / FILM: ${project.title}
EPISODIO: ${episode.title} (${epCode})
TARGET: ${totalDuration} secondi • ${shots.length} inquadrature
STILE: ${project.style || 'Cartone animato 3D Pixar'}
=====================================================

LOGLINE:
${episode.logline}

SINOSSI:
${episode.synopsis}

SEQUENZA SHOTS:
${shots.map(s => `[SCENA ${s.scene_number || 1} - INQ ${s.order}] (${s.duration_seconds}s)
Titolo: ${s.title}
Descrizione visiva: ${s.description}
Prompt video 3D: ${s.video_prompt}
Personaggi: ${(s.cast || []).join(', ')}
-----------------------------------------------------`).join('\n\n')}`}
            </div>
          </div>
        )}

        {/* Tab 4: Social Pack */}
        {activeTab === 'social' && (
          <div className="bg-[#101018] border border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-heading">
              Pacchetto Social per Pubblicazione
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-semibold block mb-1">Titolo Pubblicazione Suggerito</label>
                <div className="bg-[#0a0a0f] border border-neutral-800 rounded-lg p-3 text-sm text-white font-medium">
                  {episode.publish_title || `🚀 ${episode.title} | ${project.title} Cartoon 3D`}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-semibold block mb-1">Descrizione Copywriting</label>
                <div className="bg-[#0a0a0f] border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 leading-relaxed">
                  {episode.publish_description || episode.synopsis || episode.logline}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-semibold block mb-1">Hashtag Ottimizzati</label>
                <div className="flex flex-wrap gap-1.5">
                  {(episode.publish_hashtags || ['Cine3D', 'PixarStyle', 'Cartoon3D', 'Animazione3D', 'Bambini', 'KidsFilm']).map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
