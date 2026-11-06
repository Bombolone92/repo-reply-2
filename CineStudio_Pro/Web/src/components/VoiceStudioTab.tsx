import React, { useState, useEffect } from 'react';
import { CharacterVoice } from '../types';
import { audioEngine } from '../services/audioEngine';
import { Mic, Volume2, Plus, Trash2, Play, Sparkles, Sliders } from 'lucide-react';

interface VoiceStudioTabProps {
  characters: CharacterVoice[];
  onUpdateCharacters: (chars: CharacterVoice[]) => void;
}

export const VoiceStudioTab: React.FC<VoiceStudioTabProps> = ({
  characters,
  onUpdateCharacters,
}) => {
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState('Benvenuti a questo nuovo episodio! Sono pronto per l\'azione!');

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        setSystemVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestVoice = (char: CharacterVoice) => {
    audioEngine.speakLine(testText, char.pitch, char.rate, char.systemVoiceName);
  };

  const handleAddCharacter = () => {
    const newChar: CharacterVoice = {
      id: `char_${Date.now()}`,
      name: `Nuovo Personaggio ${characters.length + 1}`,
      role: 'Co-Protagonista',
      pitch: 1.0,
      rate: 1.0,
      gender: 'heroic',
      color: '#06b6d4',
    };
    onUpdateCharacters([...characters, newChar]);
  };

  const handleDeleteCharacter = (id: string) => {
    if (characters.length <= 1) return;
    onUpdateCharacters(characters.filter(c => c.id !== id));
  };

  const handleUpdateChar = (idx: number, field: keyof CharacterVoice, val: unknown) => {
    const updated = [...characters];
    updated[idx] = { ...updated[idx], [field]: val };
    onUpdateCharacters(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-400" />
              Doppiaggio &amp; Sintesi Vocale Personaggi (100% Gratuito)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Personalizza il timbro, intonazione e velocità delle voci per ogni personaggio della serie, senza costi o abbonamenti.
            </p>
          </div>
          <button
            onClick={handleAddCharacter}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-lg"
          >
            <Plus className="w-4 h-4" /> Aggiungi Nuovo Personaggio
          </button>
        </div>

        {/* Global Test Line */}
        <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Frase di prova audition:
          </label>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="flex-1 min-w-[280px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>

        {/* Character cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {characters.map((char, idx) => (
            <div
              key={char.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: char.color }}
                    />
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => handleUpdateChar(idx, 'name', e.target.value)}
                      className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  {characters.length > 1 && (
                    <button
                      onClick={() => handleDeleteCharacter(char.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Elimina personaggio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Ruolo / Archetipo</label>
                    <input
                      type="text"
                      value={char.role}
                      onChange={(e) => handleUpdateChar(idx, 'role', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Pitch / Tono ({char.pitch.toFixed(2)}x)</span>
                      <span className="text-[10px] text-slate-500">Basso ↔ Acuto</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={1.8}
                      step={0.05}
                      value={char.pitch}
                      onChange={(e) => handleUpdateChar(idx, 'pitch', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Velocità / Rate ({char.rate.toFixed(2)}x)</span>
                      <span className="text-[10px] text-slate-500">Lento ↔ Veloce</span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={1.5}
                      step={0.05}
                      value={char.rate}
                      onChange={(e) => handleUpdateChar(idx, 'rate', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {systemVoices.length > 0 && (
                    <div>
                      <label className="text-slate-400 block mb-1">Voce di Sistema</label>
                      <select
                        value={char.systemVoiceName || ''}
                        onChange={(e) => handleUpdateChar(idx, 'systemVoiceName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white truncate"
                      >
                        <option value="">Voce di default (Italiana/Automatica)</option>
                        {systemVoices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestVoice(char)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-800 hover:border-indigo-500/50 transition"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Ascolta Doppiaggio ({char.name})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
