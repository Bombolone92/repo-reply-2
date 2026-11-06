import React, { useState, useEffect } from 'react';
import { Plus, Film, Trash2, Sparkles, Layers, Clock, FileText } from 'lucide-react';
import type { Project } from '../types/cine3d';
import NewProjectModal from '../components/NewProjectModal';
import CreditsPanel from '../components/CreditsPanel';
import GoogleKeyBox from '../components/GoogleKeyBox';

interface HomeProps {
  onSelectProject: (projectId: string) => void;
}

export default function Home({ onSelectProject }: HomeProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Vuoi eliminare questa produzione e tutti i suoi episodi?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header matching screenshot 1 */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-neutral-800/80 pb-6 sm:pb-8">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-500">
            STUDIO DI ANIMAZIONE
          </p>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Cine3D
          </h1>
          <p className="text-xs sm:text-base text-neutral-300 max-w-xl font-normal leading-relaxed">
            Scrivi le istruzioni, al resto ci pensera' lo STUDIO DI ANIMAZIONE
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-end"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Nuova serie / Film</span>
        </button>
      </header>

      {/* Series Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-white">Le tue produzioni animate</h2>
          <span className="text-xs text-neutral-400 font-mono">{projects.length} serie attive</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-500 text-sm">
            Caricamento in corso…
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 border border-dashed border-neutral-800 rounded-3xl text-center space-y-4 bg-[#101018]/50">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-heading text-white">Nessuna serie o film precaricato</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              L'ambiente è pulito e pronto per la tua storia. Incolla il tuo copione o le tue istruzioni: l'AI identificherà automaticamente tutti i personaggi, la trama e la trasformerà in un cartone animato 3D cinematografico in formato 16:9 (stile YouTube).
            </p>
            <button
              onClick={() => setNewModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Incolla copione & Crea serie</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const minutes = Math.round((project.episode_target_seconds || 180) / 60);
              const formatLabel = project.aspect_ratio === '9:16' ? 'Verticale 9:16' : '16:9 Widescreen';
              const coverImg = '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg';

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="group cursor-pointer bg-[#121218] border border-neutral-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  {/* Card Cover (16:9 YouTube style aspect) */}
                  <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={project.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent opacity-85" />

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={e => handleDeleteProject(e, project.id)}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600/80 text-neutral-300 hover:text-white backdrop-blur-sm transition"
                        title="Elimina serie"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {project.cast_status === 'draft' && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
                          Cast da definire
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-heading font-semibold text-white tracking-tight group-hover:text-amber-300 transition">
                        {project.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {project.style || project.brief}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-amber-400" />
                        <span>{project.episode_count} {project.episode_count === 1 ? 'episodio' : 'episodi'}</span>
                      </div>
                      <span className="text-neutral-700">•</span>
                      <span>{formatLabel}</span>
                      <span className="text-neutral-700">•</span>
                      <span>{minutes} min</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credits dashboard & Google key box */}
      <CreditsPanel />
      <GoogleKeyBox />

      {/* New Project Modal */}
      <NewProjectModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreated={p => {
          setNewModalOpen(false);
          onSelectProject(p.id);
        }}
      />
    </div>
  );
}
