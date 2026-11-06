import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { getSavedApiKey, saveApiKey } from '../services/aiService';

interface ApiKeyBarProps {
  onKeyChange?: (key: string) => void;
}

export const ApiKeyBar: React.FC<ApiKeyBarProps> = ({ onKeyChange }) => {
  const [keyInput, setKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const existing = getSavedApiKey();
    if (existing) {
      setKeyInput(existing);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    saveApiKey(keyInput);
    setIsSaved(true);
    if (onKeyChange) onKeyChange(keyInput);
  };

  const handleClear = () => {
    setKeyInput('');
    saveApiKey('');
    setIsSaved(false);
    if (onKeyChange) onKeyChange('');
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-200">🚀 Modalità 100% Gratuita &bull; Zero API Richieste</span>
            <span className="text-emerald-400 ml-2 hidden sm:inline text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Generazione &amp; Regia Attiva
            </span>
            <span className="text-slate-400 ml-2 hidden md:inline text-[11px]">
              (Opzionale: inserisci una chiave gratuita Google AI Studio solo se desideri la regia potenziata)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-72">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Incolla qui la chiave AI Studio (AIzaSy...)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {keyInput ? (
            <button
              onClick={handleSave}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition ${
                isSaved
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isSaved ? 'Attiva' : 'Salva Chiave'}
            </button>
          ) : null}

          {isSaved && (
            <button
              onClick={handleClear}
              className="px-2 py-1.5 text-slate-400 hover:text-rose-400 transition"
              title="Rimuovi chiave"
            >
              Rimuovi
            </button>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-slate-400 hover:text-indigo-400 underline underline-offset-2 ml-1"
          >
            Ottieni gratis <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
