import React from 'react';
import {
  Film,
  Camera,
  Play,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
  Clapperboard,
  Download,
  Mic,
  Monitor,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface StudioHomepageHubProps {
  onOpenVideoStudio: () => void;
  onOpenPhotoStudio: () => void;
  projectsCount: number;
}

export default function StudioHomepageHub({
  onOpenVideoStudio,
  onOpenPhotoStudio,
  projectsCount
}: StudioHomepageHubProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* Studio Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#121426] via-[#10121f] to-[#0a0b12] border border-neutral-800 p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5" />
              Cine3D Studio Hub
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              Pixar 3D & Gemini AI Audio
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight leading-tight">
            Studio di Animazione 3D & Produzione Cinematografica
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            Scegli il tuo ambiente di lavoro: genera direttamente i tuoi <strong>film video (.mp4)</strong> con regia e doppiaggio vocale, oppure crea la <strong>Bibbia di Produzione All-In-One</strong> con prompt frame-by-frame da assemblare ed esportazione in formato Word (.docx).
          </p>
        </div>
      </div>

      {/* The Two Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: VIDEO STUDIO */}
        <div
          onClick={onOpenVideoStudio}
          className="group relative rounded-3xl bg-gradient-to-b from-[#111322] to-[#0c0d16] border border-neutral-800 hover:border-amber-500/60 p-7 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Film className="h-7 w-7 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                SEZIONE VIDEO • MP4
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-white group-hover:text-amber-300 transition flex items-center gap-2">
                <span>Cine3D Video Studio</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition text-amber-400" />
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Genera inquadrature animate dinamiche in computer grafica 3D Pixar, con movimenti di camera cinematografici (dolly, pan anamorfico), doppiaggio vocale reale tramite Gemini AI TTS e montaggio in Master Video 16:9 Cinema e 9:16 Verticale.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="space-y-2 pt-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Regia in Chat</strong>: scrivi il copione o chiedi all'AI di svilupparlo</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Rendering 3D Pixar Dinamico</strong>: Ken Burns, carrellate, DoF e grading</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Voci & Dialoghi Recitati</strong>: Gemini TTS integrato in traccia audio</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Export Master ZIP</strong>: file video .mp4 pronti per editing locale</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              {projectsCount > 0 ? `${projectsCount} Progett${projectsCount === 1 ? 'o' : 'i'} in archivio` : 'Inizia una nuova produzione'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenVideoStudio();
              }}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Entra in Video Studio</span>
            </button>
          </div>
        </div>

        {/* CARD 2: PHOTO & FRAME STUDIO */}
        <div
          onClick={onOpenPhotoStudio}
          className="group relative rounded-3xl bg-gradient-to-b from-[#111322] to-[#0c0d16] border border-neutral-800 hover:border-blue-500/60 p-7 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <Camera className="h-7 w-7 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                SEZIONE FOTO & FRAME • DOCX
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-white group-hover:text-blue-300 transition flex items-center gap-2">
                <span>Photo & Frame Studio</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition text-blue-400" />
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Software e logica per generare immagini e sequenze frame da assemblare. Produce <strong>1 Solo Documento All-In-One (.docx)</strong> con Cast, Formula Frame (5 min = 300s, 8fps e 2fps), 5 episodi clip-by-clip e workflow per Leonardo/Midjourney con seed 12345.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="space-y-2 pt-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                <span><strong>Bibbia di Produzione All-In-One</strong>: documento completo esportabile in Word</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                <span><strong>Formula Frame Matematica</strong>: 4 clip da 70s + 1 da 20s (140 o 560 immagini)</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                <span><strong>Prompt Copia-Incolla Clip by Clip</strong>: con dialoghi, musica e SFX timbrati</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                <span><strong>Character Reference Seed 12345</strong>: consistenza perfetta su Leonardo & Midjourney</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              Download DOCX • Prompt Frame pronti
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPhotoStudio();
              }}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Entra in Photo Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
