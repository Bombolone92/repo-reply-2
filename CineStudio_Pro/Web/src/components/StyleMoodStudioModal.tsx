import React, { useState } from 'react';
import { VISUAL_STYLES, COLOR_MOODS, StyleOption, MoodOption } from '../data/styleCatalog';
import { VisualStyle, ColorMood, SceneClip } from '../types';
import { Palette, Sparkles, X, Check, Sun, Moon, Flame, Wind, Film, ArrowRight } from 'lucide-react';

interface StyleMoodStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: VisualStyle;
  currentMood?: ColorMood;
  onApplyStyleAndMood: (style: VisualStyle, mood: ColorMood, enrichedPrompt?: string) => void;
}

export const StyleMoodStudioModal: React.FC<StyleMoodStudioModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  currentMood = 'bright_saturated',
  onApplyStyleAndMood,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(currentStyle);
  const [selectedMood, setSelectedMood] = useState<ColorMood>(currentMood);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cartoon' | 'anime' | 'cinematic' | 'stylized'>('all');

  if (!isOpen) return null;

  const filteredStyles = VISUAL_STYLES.filter(s =>
    categoryFilter === 'all' || s.category === categoryFilter
  );

  const activeStyleObj = VISUAL_STYLES.find(s => s.id === selectedStyle) || VISUAL_STYLES[0];
  const activeMoodObj = COLOR_MOODS.find(m => m.id === selectedMood) || COLOR_MOODS[0];

  const handleApply = () => {
    // Construct enriched prompt signature combining style and color mood
    const enriched = `${activeStyleObj.promptSignature}, ${activeMoodObj.promptSignature}`;
    onApplyStyleAndMood(selectedStyle, selectedMood, enriched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Studio Stili Visivi &amp; Color Grading (Zero API)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  8 Stili &bull; 6 Atmosfere Colore
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ispirato a BigMotion e HulaApp: seleziona lo stile artistico e l&apos;atmosfera cromatica per le tue scene 3D
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Choose Animation & Art Style */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  1. Scegli lo Stile Visivo del Video
                </h4>
                <p className="text-xs text-slate-400">
                  Definisce il rendering volumetrico, le forme geometriche e l&apos;espressività dei personaggi
                </p>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['all', 'cartoon', 'anime', 'cinematic', 'stylized'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                      categoryFilter === cat
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Tutti gli Stili' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredStyles.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500 shadow-xl shadow-rose-950/30 ring-2 ring-rose-500/40 -translate-y-0.5'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Top gradient badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${style.gradient} shadow-sm`}>
                        {style.badge}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white mb-1 group-hover:text-rose-300 transition">
                        {style.label}
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        {style.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                      {style.lightingHint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Color & Mood Grading (from Photo 3) */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-cyan-400" />
                2. Scegli il Color &amp; Mood Grading (Atmosfera Cromatica)
              </h4>
              <p className="text-xs text-slate-400">
                Imposta la color correction, la temperatura colore e le ombre cinematografiche della scena
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {COLOR_MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <div
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between text-center relative ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-2 ring-cyan-400/40 -translate-y-0.5'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Circle Color Swatch Preview */}
                    <div className="flex justify-center mb-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${mood.gradient} shadow-md flex items-center justify-center`}>
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </div>

                    <h5 className="text-[11px] font-bold text-white mb-1">
                      {mood.label}
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {mood.tagline.split('(')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Signature Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Formula Artistica Risultante (Applicata al Prompt &amp; Shaders):
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
              <strong className="text-rose-400">{activeStyleObj.label}</strong> + <strong className="text-cyan-400">{activeMoodObj.label}</strong>:
              <br />
              <span className="text-slate-400 font-mono text-[11px]">
                &quot;{activeStyleObj.promptSignature}, {activeMoodObj.promptSignature}&quot;
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Nessuna API richiesta &bull; Funziona sia nel browser sia per esportazione video locale
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Annulla
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950/40 transition"
            >
              Applica Stile &amp; Mood alla Scena <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
