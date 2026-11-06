import React from 'react';
import { Episode, SceneClip, CharacterVoice, CameraMovement } from '../types';
import { audioEngine } from '../services/audioEngine';
import { Play, Volume2, Video, Plus, Trash2, Camera, Music, Sparkles } from 'lucide-react';

interface TimelineEditorProps {
  currentEpisode: Episode;
  selectedClipId: string;
  onSelectClip: (clipId: string) => void;
  onUpdateClip: (clip: SceneClip) => void;
  onAddClip: () => void;
  onDeleteClip: (clipId: string) => void;
  characters: CharacterVoice[];
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  currentEpisode,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  onAddClip,
  onDeleteClip,
  characters,
}) => {
  const selectedClip = currentEpisode.clips.find(c => c.id === selectedClipId) || currentEpisode.clips[0];

  const cameraOptions: { value: CameraMovement; label: string }[] = [
    { value: 'hero_orbit_360', label: '360° Hero Orbit (Rotazione Epica)' },
    { value: 'cinematic_pan', label: 'Cinematic Pan (Carrellata Orizzontale)' },
    { value: 'dolly_zoom', label: 'Dolly Zoom (Effetto Vertigo / Tensione)' },
    { value: 'low_angle_hero', label: 'Low Angle Hero (Inquadratura dal Basso)' },
    { value: 'action_tracking', label: 'Action Tracking (Inseguimento Dinamico)' },
    { value: 'drone_flyover', label: 'Drone Flyover (Sorvolo Aereo)' },
    { value: 'shake_impact', label: 'Shake / Impact (Tremolio da Urto/Esplosione)' },
  ];

  const sfxOptions: { value: SceneClip['sfx']; label: string }[] = [
    { value: 'engine_rev', label: '🏎️ Rombo Motore V8 (Stile Cars)' },
    { value: 'tire_screech', label: '💨 Gomme in Derapata (Stile Cars)' },
    { value: 'laser_blast', label: '⚡ Raggio Laser / Energia (Stile Marvel)' },
    { value: 'cinematic_boom', label: '💥 Trailer Sub-Boom Epico (Marvel/Cinema)' },
    { value: 'cartoon_boing', label: '🧸 Cartoon Boing Rimbalzo (Stile Pixar)' },
    { value: 'none', label: 'Nessun Effetto (Silenzioso)' },
  ];

  const handleAuditionDialogue = (text: string, charId: string) => {
    const char = characters.find(c => c.id === charId);
    audioEngine.speakLine(text, char?.pitch || 1.0, char?.rate || 1.0, char?.systemVoiceName);
  };

  const handleAuditionSfx = (sfx: string) => {
    if (sfx !== 'none') {
      audioEngine.playSfxLive(sfx);
    }
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Clips Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Timeline Scene ({currentEpisode.clips.length} clip • Totale: {(currentEpisode.clips.reduce((acc, c) => acc + c.durationSeconds, 0)).toFixed(0)}s)
            </h3>
          </div>
          <button
            onClick={onAddClip}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> Aggiungi Clip
          </button>
        </div>

        {/* Scrollable Clips List */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {currentEpisode.clips.map((clip, idx) => {
            const isSelected = clip.id === selectedClipId;
            return (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className={`flex-shrink-0 w-44 p-3 rounded-xl cursor-pointer border transition ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg ring-2 ring-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>Clip #{idx + 1}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                    {clip.durationSeconds}s
                  </span>
                </div>
                <div className="font-semibold text-xs truncate text-slate-100">
                  {clip.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  📷 {clip.cameraMovement.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-400">
                    {clip.dialogues.length} battut{clip.dialogues.length === 1 ? 'a' : 'e'}
                  </span>
                  {clip.recordedVideoBlob ? (
                    <span className="text-emerald-400 font-bold">✓ Render</span>
                  ) : (
                    <span className="text-amber-400">Pronto</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Clip Detail Inspector */}
      {selectedClip && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                Dettagli &amp; Regia: Clip #{selectedClip.clipNumber}
              </h4>
            </div>
            {currentEpisode.clips.length > 1 && (
              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Elimina Clip
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Titolo / Scena</label>
              <input
                type="text"
                value={selectedClip.title}
                onChange={(e) => onUpdateClip({ ...selectedClip, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Durata Singola Clip (X Secondi)
              </label>
              <select
                value={selectedClip.durationSeconds}
                onChange={(e) => onUpdateClip({ ...selectedClip, durationSeconds: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {[2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map(sec => (
                  <option key={sec} value={sec}>{sec} secondi</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Movimento Camera 3D</label>
              <select
                value={selectedClip.cameraMovement}
                onChange={(e) => onUpdateClip({ ...selectedClip, cameraMovement: e.target.value as CameraMovement })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {cameraOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sound FX selector with live audition */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" /> Effetto Sonoro (SFX Procedurale 100% Gratuito)
              </label>
              {selectedClip.sfx !== 'none' && (
                <button
                  type="button"
                  onClick={() => handleAuditionSfx(selectedClip.sfx)}
                  className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium rounded-lg flex items-center gap-1 transition"
                >
                  <Volume2 className="w-3 h-3" /> Ascolta Effetto
                </button>
              )}
            </div>
            <select
              value={selectedClip.sfx}
              onChange={(e) => onUpdateClip({ ...selectedClip, sfx: e.target.value as SceneClip['sfx'] })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {sfxOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Dialogues List for this clip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Battute Parlate &amp; Doppiaggio Clip
              </label>
              <button
                type="button"
                onClick={() => {
                  const newDialogues = [
                    ...selectedClip.dialogues,
                    {
                      id: `dlg_${Date.now()}`,
                      characterId: characters[0]?.id || 'char_1',
                      text: 'Nuova battuta parlata',
                      emotion: 'heroic' as const,
                    }
                  ];
                  onUpdateClip({ ...selectedClip, dialogues: newDialogues });
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Aggiungi Battuta
              </button>
            </div>

            {selectedClip.dialogues.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Nessun dialogo in questa clip (Scena d'azione solo visiva e sonora).
              </div>
            ) : (
              selectedClip.dialogues.map((dlg, dIdx) => (
                <div key={dlg.id} className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <select
                    value={dlg.characterId}
                    onChange={(e) => {
                      const updated = [...selectedClip.dialogues];
                      updated[dIdx] = { ...updated[dIdx], characterId: e.target.value };
                      onUpdateClip({ ...selectedClip, dialogues: updated });
                    }}
                    className="w-44 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {characters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={dlg.text}
                    onChange={(e) => {
                      const updated = [...selectedClip.dialogues];
                      updated[dIdx] = { ...updated[dIdx], text: e.target.value };
                      onUpdateClip({ ...selectedClip, dialogues: updated });
                    }}
                    placeholder="Testo pronunciato dal personaggio..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleAuditionDialogue(dlg.text, dlg.characterId)}
                    className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900 rounded-lg border border-slate-700/60 transition"
                    title="Ascolta Voce Sintetizzata Gratis"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = selectedClip.dialogues.filter((_, i) => i !== dIdx);
                      onUpdateClip({ ...selectedClip, dialogues: updated });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg border border-slate-700/60 transition"
                    title="Elimina battuta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
