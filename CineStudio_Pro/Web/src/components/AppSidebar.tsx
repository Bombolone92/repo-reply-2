import React from 'react';
import { Film, Plus, Trash2, Folder, Key, ShieldCheck, Sparkles, Video, MessageSquare } from 'lucide-react';
import type { Project } from '../types/cine3d';

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onOpenKeyManager: () => void;
  activeKeyCount: number;
  isQuotaPaused: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onOpenKeyManager,
  activeKeyCount,
  isQuotaPaused,
  isOpenMobile,
  onCloseMobile
}: AppSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#0e0f17] border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-4 border-b border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
                <Film className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-heading font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  Cine3D Studio
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono block">
                  Pixar & Cartoon 3D Engine
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden text-neutral-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* New Project / New Conversation Button */}
          <button
            onClick={() => {
              onNewProject();
              onCloseMobile();
            }}
            className="w-full mt-4 py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nuovo Progetto / Chat</span>
          </button>
        </div>

        {/* Projects / Conversations Folder List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
            Progetti & Conversazioni
          </div>

          {projects.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-xs italic">
              Nessun progetto salvato. Clicca sopra per crearne uno.
            </div>
          ) : (
            projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj.id);
                    onCloseMobile();
                  }}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-amber-500/15 text-white border border-amber-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161722]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      <Folder className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate text-white">
                        {proj.title}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                        <span>{proj.episode_count || 1} Ep</span>
                        <span>•</span>
                        <span>{proj.aspect_ratio || '16:9'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete project button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Sei sicuro di voler eliminare "${proj.title}"?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded transition shrink-0"
                    title="Elimina progetto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Panel: Google AI Studio Keys Status */}
        <div className="p-3 border-t border-neutral-800/80 space-y-2 bg-[#0a0b10]">
          <button
            onClick={() => {
              onOpenKeyManager();
              onCloseMobile();
            }}
            className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 ${
              isQuotaPaused
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-[#12131d] border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isQuotaPaused
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                <Key className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate text-white">
                  Chiavi Google AI Studio
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {isQuotaPaused
                    ? '⚠️ Quota Esaurita'
                    : activeKeyCount > 0
                    ? `🟢 ${activeKeyCount} Chiav${activeKeyCount === 1 ? 'e' : 'i'} Attiv${activeKeyCount === 1 ? 'a' : 'e'}`
                    : 'Inserisci chiavi'}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-amber-400 underline font-medium shrink-0">
              Gestisci
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
