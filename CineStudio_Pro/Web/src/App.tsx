/**
 * CinePixar 3D Studio & Series Pipeline
 * Standalone browser-based 3D Animation & Multi-Episode Studio
 * Supports Cars Speedway, Marvel Action, and Pixar Toon 3D styles
 * 100% Free with Google AI Studio API key box & local PC ZIP bundling
 */

import React, { useState } from 'react';
import { SeriesProject, Episode, SceneClip, CharacterVoice, VisualStyle } from './types';
import { ApiKeyBar } from './components/ApiKeyBar';
import { ThreeCanvasViewer } from './components/ThreeCanvasViewer';
import { TimelineEditor } from './components/TimelineEditor';
import { VoiceStudioTab } from './components/VoiceStudioTab';
import { ScriptParserModal } from './components/ScriptParserModal';
import { ExportModal } from './components/ExportModal';
import { OpenSourceHubTab } from './components/OpenSourceHubTab';
import { InAppVideoGenerator } from './components/InAppVideoGenerator';
import {
  Film,
  Clapperboard,
  Mic,
  Download,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
  FileCode,
  CheckCircle,
  ChevronRight,
  MonitorPlay,
  Share2,
  Terminal,
  Globe,
  Upload,
  FileJson,
  PlusCircle,
  RotateCcw
} from 'lucide-react';

// Progetto Studio 3D Pulito e Generico out-of-the-box (Nessuna storia preimpostata)
const initialCharacters: CharacterVoice[] = [
  {
    id: 'char_protagonista',
    name: 'Personaggio 1 (Protagonista)',
    role: 'Eroe Principale',
    pitch: 1.0,
    rate: 1.0,
    gender: 'heroic',
    color: '#06b6d4',
  },
  {
    id: 'char_coprotagonista',
    name: 'Personaggio 2 (Co-Protagonista)',
    role: 'Spalla / Amico',
    pitch: 1.15,
    rate: 1.05,
    gender: 'male',
    color: '#f59e0b',
  },
];

const initialClips: SceneClip[] = [
  {
    id: 'clip_ep1_1',
    clipNumber: 1,
    title: 'Scena 1: Introduzione e Ambientazione',
    durationSeconds: 10,
    style: 'disney_pixar_dola',
    cameraMovement: 'slow_pan',
    environment: 'Set 3D Principale con illuminazione soffusa',
    actionDescription: 'Inquadratura panoramica iniziale del set con luce dorata e presentazione dinamica dei personaggi.',
    dialogues: [],
    sfx: 'cinematic_intro',
    status: 'ready',
  },
  {
    id: 'clip_ep1_2',
    clipNumber: 2,
    title: 'Scena 2: Azione e Dialogo',
    durationSeconds: 15,
    style: 'disney_pixar_dola',
    cameraMovement: 'dolly_zoom',
    environment: 'Set 3D Principale',
    actionDescription: 'I personaggi interagiscono con mimica espressiva e movimenti comici/dinamici.',
    dialogues: [],
    sfx: 'cartoon_boing',
    status: 'ready',
  },
];

const initialEpisodes: Episode[] = [
  {
    id: 'ep_1',
    episodeNumber: 1,
    title: 'Episodio 1: La Prima Avventura',
    synopsis: 'Episodio pilota con presentazione dei protagonisti, sviluppo dell\'azione e colpo di scena.',
    targetDurationMinutes: 1.0,
    clips: initialClips,
  },
];

const initialProject: SeriesProject = {
  id: 'proj_studio_clean',
  title: 'Nuovo Progetto Studio 3D',
  targetEpisodesCount: 1,
  defaultClipDuration: 15,
  episodes: initialEpisodes,
  characters: initialCharacters,
  globalStyle: 'disney_pixar_dola',
  rawScript: 'SCENA 1: Introduzione dei personaggi in un mondo colorato e accogliente.\nSCENA 2: Scambio di battute e colpo di scena comico/avventuroso!\nSCENA 3: Conclusione della prima sequenza e colpo di scena.',
};

export default function App() {
  const [project, setProject] = useState<SeriesProject>(initialProject);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string>(initialClips[1].id);
  const [activeTab, setActiveTab] = useState<'director' | 'timeline' | 'voices' | 'opensource' | 'guide'>('director');
  const [renderedClips, setRenderedClips] = useState<Map<string, Blob>>(new Map());

  // Modals
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const jsonFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportProjectJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_project.json`);
    dlAnchorElem.click();
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.title) {
          const loadedProject: SeriesProject = {
            id: data.id || `proj_${Date.now()}`,
            title: data.title,
            targetEpisodesCount: data.episodes?.length || data.episodes_summary?.length || 1,
            defaultClipDuration: data.defaultClipDuration || 15,
            globalStyle: data.visualStyle || data.globalStyle || 'disney_pixar_dola',
            characters: data.characters ? data.characters.map((c: any) => ({
              id: c.id,
              name: c.name,
              role: c.role || 'Personaggio',
              pitch: c.pitch || 1.0,
              rate: c.rate || 1.0,
              gender: c.gender || 'heroic',
              color: c.color || '#3b82f6'
            })) : initialCharacters,
            episodes: data.episodes ? data.episodes : (data.episodes_summary ? data.episodes_summary.map((ep: any) => ({
              id: `ep_${ep.number}`,
              episodeNumber: ep.number,
              title: `Episodio ${ep.number}: ${ep.title}`,
              synopsis: ep.synopsis || `Episodio ${ep.number}`,
              targetDurationMinutes: 1.0,
              clips: [
                {
                  id: `clip_ep${ep.number}_1`,
                  clipNumber: 1,
                  title: `Scena 1: ${ep.title}`,
                  durationSeconds: 15,
                  style: data.visualStyle || 'disney_pixar_dola',
                  cameraMovement: 'slow_pan',
                  environment: 'Set 3D',
                  actionDescription: `Scena iniziale per ${ep.title}`,
                  dialogues: [],
                  sfx: 'cinematic_intro',
                  status: 'ready'
                }
              ]
            })) : initialEpisodes),
            rawScript: data.synopsis || data.rawScript || ''
          };
          setProject(loadedProject);
          setCurrentEpisodeIndex(0);
          setSelectedClipId(loadedProject.episodes[0].clips[0].id);
          alert(`Progetto "${data.title}" importato con successo nello Studio!`);
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON di progetto.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleResetCleanProject = () => {
    if (confirm('Vuoi azzerare lo studio e creare un Nuovo Progetto Pulito?')) {
      setProject(initialProject);
      setCurrentEpisodeIndex(0);
      setSelectedClipId(initialClips[0].id);
    }
  };

  const currentEpisode = project.episodes[currentEpisodeIndex] || project.episodes[0];
  const selectedClip = currentEpisode.clips.find(c => c.id === selectedClipId) || currentEpisode.clips[0];

  // Update clip in current episode
  const handleUpdateClip = (updatedClip: SceneClip) => {
    const updatedEpisodes = [...project.episodes];
    const clips = [...updatedEpisodes[currentEpisodeIndex].clips];
    const idx = clips.findIndex(c => c.id === updatedClip.id);
    if (idx !== -1) {
      clips[idx] = updatedClip;
      updatedEpisodes[currentEpisodeIndex] = {
        ...updatedEpisodes[currentEpisodeIndex],
        clips,
      };
      setProject({ ...project, episodes: updatedEpisodes });
    }
  };

  // Add new clip to current episode
  const handleAddClip = () => {
    const newClipNumber = currentEpisode.clips.length + 1;
    const newClip: SceneClip = {
      id: `clip_ep${currentEpisode.episodeNumber}_${Date.now()}`,
      clipNumber: newClipNumber,
      title: `Clip ${newClipNumber}: Nuova Scena`,
      durationSeconds: project.defaultClipDuration || 5,
      style: project.globalStyle,
      cameraMovement: 'hero_orbit_360',
      environment: 'Nuova Scena 3D',
      actionDescription: 'Azione dinamica dei personaggi con inquadratura cinematica.',
      dialogues: [],
      sfx: 'cinematic_boom',
      status: 'ready',
    };
    const updatedEpisodes = [...project.episodes];
    updatedEpisodes[currentEpisodeIndex] = {
      ...currentEpisode,
      clips: [...currentEpisode.clips, newClip],
    };
    setProject({ ...project, episodes: updatedEpisodes });
    setSelectedClipId(newClip.id);
  };

  // Delete clip
  const handleDeleteClip = (clipId: string) => {
    if (currentEpisode.clips.length <= 1) return;
    const filtered = currentEpisode.clips.filter(c => c.id !== clipId);
    const updatedEpisodes = [...project.episodes];
    updatedEpisodes[currentEpisodeIndex] = {
      ...currentEpisode,
      clips: filtered,
    };
    setProject({ ...project, episodes: updatedEpisodes });
    if (selectedClipId === clipId) {
      setSelectedClipId(filtered[0].id);
    }
  };

  // Callback when a clip video recording completes
  const handleRecordingComplete = (clipId: string, videoBlob: Blob) => {
    setRenderedClips(prev => {
      const next = new Map(prev);
      next.set(clipId, videoBlob);
      return next;
    });

    // Also update clip object
    const updated = { ...selectedClip, recordedVideoBlob: videoBlob };
    handleUpdateClip(updated);
  };

  // Callback when direct in-app video generation completes from prompt
  const handleVideoGenerated = (clipId: string, videoUrl: string, blob?: Blob) => {
    const updated = {
      ...selectedClip,
      videoUrl,
      recordedVideoBlob: blob || selectedClip.recordedVideoBlob,
      status: 'ready' as const,
    };
    handleUpdateClip(updated);
    if (blob) {
      handleRecordingComplete(clipId, blob);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Google AI Studio Key Bar */}
      <ApiKeyBar />

      {/* Main App Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  CinePixar 3D Studio &amp; Pipeline
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {selectedClip.style === 'ghibli_watercolor'
                    ? '🍃 Studio Ghibli'
                    : selectedClip.style === 'epic_anime'
                    ? '🎌 Epic Anime'
                    : selectedClip.style === 'cars_speedway'
                    ? '🏎️ Cars 3D'
                    : selectedClip.style === 'marvel_action'
                    ? '⚡ Marvel Comic 3D'
                    : selectedClip.style === 'pixel_voxel'
                    ? '👾 Voxel 3D'
                    : selectedClip.style === 'dark_fantasy'
                    ? '🏰 Dark Fantasy'
                    : selectedClip.style === 'cinematic_realism'
                    ? '🎥 Cinematic 3D'
                    : '🍌 Stile Minions & Pixar 3D'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {project.title} • {project.episodes.length} Episodi • Clip {project.defaultClipDuration}s
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={jsonFileInputRef}
              onChange={handleImportProjectJson}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
              title="Importa file di progetto o storia JSON"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              Importa JSON
            </button>

            <button
              onClick={handleExportProjectJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
              title="Salva progetto corrente in JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              Salva JSON
            </button>

            <button
              onClick={handleResetCleanProject}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition border border-slate-700"
              title="Azzera e inizia nuovo progetto vuoto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Nuovo
            </button>

            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
            >
              <Film className="w-3.5 h-3.5 text-rose-400" />
              Copione
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
              title="Esporta pacchetto completo per PC con .venv automatica"
            >
              <Download className="w-3.5 h-3.5" />
              Esporta ZIP
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab('director')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'director'
                ? 'border-rose-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            Regia &amp; 3D Studio Live
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Timeline Scene ({currentEpisode.clips.length} clip)
          </button>

          <button
            onClick={() => setActiveTab('voices')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'voices'
                ? 'border-cyan-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            Doppiaggio &amp; Voci ({project.characters.length} attori)
          </button>

          <button
            onClick={() => setActiveTab('opensource')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'opensource'
                ? 'border-emerald-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            Hub Open-Source &amp; Python (Wan 2.1, ComfyUI, C++)
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'guide'
                ? 'border-amber-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Guida Montaggio Locale PC (FFmpeg &amp; CapCut)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Episode selector ribbon if multi-episode */}
        {project.episodes.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Episodi Serie (Z = {project.episodes.length}):
            </span>
            {project.episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => {
                  setCurrentEpisodeIndex(idx);
                  setSelectedClipId(ep.clips[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentEpisodeIndex === idx
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Episodio {ep.episodeNumber} ({ep.clips.length} clip)
              </button>
            ))}
          </div>
        )}

        {/* Tab 1: Regia & 3D Studio Live */}
        {activeTab === 'director' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 3D Canvas Viewport (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <ThreeCanvasViewer
                clip={selectedClip}
                characters={project.characters}
                onRecordingComplete={handleRecordingComplete}
              />

              {/* Generatore Video In-App CinePixar 3D dal Prompt Incollato */}
              <InAppVideoGenerator
                currentClip={selectedClip}
                onVideoGenerated={handleVideoGenerated}
                onUpdateClipStyle={(newStyle, newMood) => {
                  const updated = { ...selectedClip, style: newStyle, colorMood: newMood };
                  handleUpdateClip(updated);
                  setProject(prev => ({ ...prev, globalStyle: newStyle, globalColorMood: newMood }));
                }}
              />

              {/* Clip Action Description Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Regia Scena: {selectedClip.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedClip.actionDescription || 'Inquadratura 3D dinamica con animazioni procedurali del soggetto e movimento di camera controllato.'}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      Ambientazione: <strong className="text-slate-200">{selectedClip.environment}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      Durata programmata: <strong className="text-slate-200">{selectedClip.durationSeconds} secondi</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      SFX: <strong className="text-slate-200">{selectedClip.sfx}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Scene Selector & Inspector (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Scene Episodio {currentEpisode.episodeNumber}
                  </h3>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    Apri Timeline <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {currentEpisode.clips.map((clip, idx) => {
                    const isSelected = clip.id === selectedClipId;
                    const hasRender = renderedClips.has(clip.id) || clip.recordedVideoBlob;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => setSelectedClipId(clip.id)}
                        className={`p-3 rounded-xl cursor-pointer border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500 text-white'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="text-xs font-bold text-slate-200 truncate">
                            #{idx + 1} {clip.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {clip.durationSeconds}s • {clip.cameraMovement.replace(/_/g, ' ')}
                          </div>
                        </div>

                        {hasRender ? (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                            Render ✓
                          </span>
                        ) : (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-medium rounded-full">
                            Pronto
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Timeline Scene */}
        {activeTab === 'timeline' && (
          <TimelineEditor
            currentEpisode={currentEpisode}
            selectedClipId={selectedClipId}
            onSelectClip={setSelectedClipId}
            onUpdateClip={handleUpdateClip}
            onAddClip={handleAddClip}
            onDeleteClip={handleDeleteClip}
            characters={project.characters}
          />
        )}

        {/* Tab 3: Doppiaggio & Voci */}
        {activeTab === 'voices' && (
          <VoiceStudioTab
            characters={project.characters}
            onUpdateCharacters={(chars) => setProject({ ...project, characters: chars })}
          />
        )}

        {/* Tab: Hub Open-Source, Python, C++, ComfyUI & Wan 2.1 */}
        {activeTab === 'opensource' && (
          <OpenSourceHubTab
            project={project}
            currentEpisode={currentEpisode}
          />
        )}

        {/* Tab 4: Guida Montaggio Locale PC */}
        {activeTab === 'guide' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                Come Unire Video e Audio sul Tuo PC in 1 Click (100% Gratuito)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tutto è progettato per darti la massima flessibilità: puoi usare lo script automatico batch oppure il tuo programma di montaggio preferito.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Metodo 1: Script Automatico Batch */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Metodo 1: Script Automatico FFmpeg (Consigliato)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dentro il pacchetto ZIP troverai due file pronti all'uso:
                </p>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-amber-300 space-y-1">
                  <div>• UNISCI_AUTOMATICO_WINDOWS.bat (per Windows)</div>
                  <div>• UNISCI_AUTOMATICO_MAC_LINUX.sh (per Mac/Linux)</div>
                </div>
                <p className="text-xs text-slate-400">
                  Basta fare doppio click sul file: FFmpeg unirà in 2 secondi tutte le scene video numerate con la traccia audio completa dell'episodio, creando il file <strong>EPISODIO_FINALE.mp4</strong> pronto per YouTube o TikTok!
                </p>
              </div>

              {/* Metodo 2: CapCut, Premiere, DaVinci Resolve */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Metodo 2: CapCut, DaVinci Resolve o Premiere Pro
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Se preferisci aggiungere transizioni, effetti grafici o adesivi:
                </p>
                <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Apri CapCut (gratuito) o Premiere sul tuo PC.</li>
                  <li>Trascina tutti i file dalla cartella <code>/video_clips/</code> sulla timeline video.</li>
                  <li>Trascina <code>audio_completo_episodio.wav</code> sulla traccia audio.</li>
                  <li>Tutte le clip si incastreranno al secondo esatto!</li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Pronto per esportare il tuo primo episodio?</div>
                <div className="text-[11px] text-slate-400">Genera l'archivio ZIP con tutti i file ed istruzioni.</div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
              >
                Esporta Pacchetto ZIP
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Script Parser Modal */}
      <ScriptParserModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        currentProject={project}
        onProjectGenerated={(newProj) => {
          setProject(newProj);
          setCurrentEpisodeIndex(0);
          setSelectedClipId(newProj.episodes[0]?.clips[0]?.id || '');
          setRenderedClips(new Map());
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        currentEpisode={currentEpisode}
        renderedClips={renderedClips}
      />
    </div>
  );
}
