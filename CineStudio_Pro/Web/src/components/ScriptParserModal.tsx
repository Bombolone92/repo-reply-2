import React, { useState } from 'react';
import { VisualStyle, SeriesProject } from '../types';
import { parseScriptWithGemini, parseScriptLocally, getSavedApiKey } from '../services/aiService';
import { Film, Sparkles, Sliders, X, Check, BookOpen, Clock, Layers } from 'lucide-react';

interface ScriptParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectGenerated: (project: SeriesProject) => void;
  currentProject: SeriesProject;
}

export const ScriptParserModal: React.FC<ScriptParserModalProps> = ({
  isOpen,
  onClose,
  onProjectGenerated,
  currentProject,
}) => {
  const [scriptText, setScriptText] = useState(currentProject.rawScript || '');
  const [style, setStyle] = useState<VisualStyle>(currentProject.globalStyle || 'cars_speedway');
  const [episodesCount, setEpisodesCount] = useState<number>(currentProject.targetEpisodesCount || 1);
  const [clipDurationSec, setClipDurationSec] = useState<number>(currentProject.defaultClipDuration || 5);
  const [episodeMinutes, setEpisodeMinutes] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState(currentProject.title || 'La Mia Serie 3D');

  if (!isOpen) return null;

  // Example templates for instant one-click testing
  const loadExample = (type: VisualStyle) => {
    setStyle(type);
    if (type === 'cars_speedway') {
      setSeriesTitle('Piston Cup Chronicles: Il Ritorno del Campione');
      setScriptText(
`SCENA 1 - PISTA DI RADIATOR SPRINGS - GIORNO
FLASH_CAR: Ehi Turbo! Pensi davvero di potermi superare su questo asfalto bollente?
TURBO_RIVAL: Tieniti pronto, novellino! Il mio motore V8 sta già ruggendo a 8000 giri!
FLASH_CAR: Allora vediamo chi taglierà per primo il traguardo della curva parabolica!

SCENA 2 - LA GRANDE CURVA
TURBO_RIVAL: Troppo tardi, sto accelerando con la mescola morbida!
FLASH_CAR: Non hai fatto i conti con il mio alettone aerodinamico! Ka-Chow!`
      );
    } else if (type === 'marvel_action') {
      setSeriesTitle('Avenger Vanguard: Guerra Quantica');
      setScriptText(
`SCENA 1 - TETTO DELLO STARK BUILDING - NOTTE
HERO_AVENGER: Il reattore arc è pronto al massimo livello energetico.
SHADOW_VILLAIN: La tua tecnologia terrestre non fermerà l'invasione dimensionale!
HERO_AVENGER: Allora è il momento di mostrarti il potere di un vero Vendicatore!

SCENA 2 - SCONTRO NEI CIELI
SHADOW_VILLAIN: Non puoi volare per sempre contro il vuoto cosmico!
HERO_AVENGER: Per la Terra e per la galassia, noi non ci arrenderemo mai!`
      );
    } else {
      setSeriesTitle('Toy Story Adventures: Operazione Salvataggio');
      setScriptText(
`SCENA 1 - LA STANZA DEI GIOCHI - MATTINA
WOODY_TOON: Forza truppa! Dobbiamo ritrovare il telecomando prima che torni il padroncino!
BUZZ_BUDDY: Verso l'infinito e oltre! Ho scansionato il settore sotto il letto!
WOODY_TOON: Ottimo lavoro, partner! Pronti al salto dal comodino!`
      );
    }
  };

  const handleGenerate = async (useAi: boolean) => {
    if (!scriptText.trim()) return;
    setIsLoading(true);

    try {
      const apiKey = getSavedApiKey();
      let result;

      if (useAi && apiKey) {
        result = await parseScriptWithGemini(
          scriptText,
          episodesCount,
          clipDurationSec,
          episodeMinutes,
          style,
          apiKey
        );
      } else {
        result = parseScriptLocally(
          scriptText,
          episodesCount,
          clipDurationSec,
          episodeMinutes,
          style
        );
      }

      const newProject: SeriesProject = {
        id: `project_${Date.now()}`,
        title: seriesTitle || 'Serie Animata 3D',
        targetEpisodesCount: episodesCount,
        defaultClipDuration: clipDurationSec,
        episodes: result.episodes,
        characters: result.characters,
        globalStyle: style,
        rawScript: scriptText,
      };

      onProjectGenerated(newProject);
      onClose();
    } catch (err) {
      console.error('Failed to parse script:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalculatedClips = Math.round((episodeMinutes * 60) / clipDurationSec) * episodesCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Importa Copione &amp; Configura Struttura Serie
              </h2>
              <p className="text-xs text-slate-400">
                Inserisci la tua sceneggiatura: il sistema calcolerà clip di durata X secondi, Y minuti per episodio, per Z episodi totali.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Seleziona Stile Grafico 3D &amp; Cinema
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => loadExample('cars_speedway')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  style === 'cars_speedway'
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/30'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="text-xl mb-1">🏎️ Cars Speedway 3D</div>
                  <div className="text-xs text-slate-400">
                    Auto da corsa parlanti, fari animati, asfalto e rombo motori.
                  </div>
                </div>
                <span className="text-[10px] text-rose-400 font-semibold mt-2">Carica Esempio Copione →</span>
              </button>

              <button
                type="button"
                onClick={() => loadExample('marvel_action')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  style === 'marvel_action'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="text-xl mb-1">⚡ Marvel Action Cinema</div>
                  <div className="text-xs text-slate-400">
                    Supereroi in armatura, luci cinetiche, laser e camera eroica.
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold mt-2">Carica Esempio Copione →</span>
              </button>

              <button
                type="button"
                onClick={() => loadExample('pixar_3d')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  style === 'pixar_3d'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="text-xl mb-1">🧸 Pixar / Toy Story 3D</div>
                  <div className="text-xs text-slate-400">
                    Stile cartoon morbido, occhi espressivi, stanza giocattoli e colori caldi.
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold mt-2">Carica Esempio Copione →</span>
              </button>
            </div>
          </div>

          {/* Serie & Timing Parameters (X secondi, Y minuti, Z episodi) */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              Parametri Matematici di Segmentazione Serie
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Titolo Serie / Progetto</label>
                <input
                  type="text"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Durata Clip (X Secondi)
                </label>
                <select
                  value={clipDurationSec}
                  onChange={(e) => setClipDurationSec(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value={3}>3 secondi (Ultra dinamico TikTok)</option>
                  <option value={4}>4 secondi (Standard Shorts)</option>
                  <option value={5}>5 secondi (Consigliato Cinema/Pixar)</option>
                  <option value={8}>8 secondi (Scene dialogate)</option>
                  <option value={10}>10 secondi (Panoramiche)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Durata Episodio (Y Minuti)
                </label>
                <select
                  value={episodeMinutes}
                  onChange={(e) => setEpisodeMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value={0.5}>30 secondi (Shorts 9:16)</option>
                  <option value={1.0}>1 minuto (TikTok / Reels)</option>
                  <option value={2.0}>2 minuti (Mini-Episodio)</option>
                  <option value={3.0}>3 minuti (Standard Web Serie)</option>
                  <option value={5.0}>5 minuti (Episodio Lungo YouTube)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Totale Episodi (Z Episodi)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={episodesCount}
                  onChange={(e) => setEpisodesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Calculations info banner */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Totale serie stimata: <strong className="text-white">{(episodeMinutes * episodesCount).toFixed(1)} minuti</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Clip totali da renderizzare: <strong className="text-white">{totalCalculatedClips} clip</strong> (~{Math.round((episodeMinutes * 60) / clipDurationSec)} per episodio)
              </span>
            </div>
          </div>

          {/* User Script Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Il Tuo Copione / Sceneggiatura
              </label>
              <span className="text-xs text-slate-400">
                Formato: <code>NOME_PERSONAGGIO: battuta parlata</code>
              </span>
            </div>
            <textarea
              rows={9}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Incolla qui la tua sceneggiatura completa...
Esempio:
SCENA 1 - PISTA DI GARA
SAETTA: Forza, dobbiamo vincere questo trofeo!
CRICCHETTO: Non preoccuparti compare, io ti guardo le ruote!
SCENA 2 - IL RETTILINEO FINALE
SAETTA: Accelero al massimo!"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            100% Gratuito • Nessun costo di generazione o API a pagamento
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isLoading || !scriptText.trim()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition border border-slate-700 disabled:opacity-50"
            >
              Scomposizione Rapida Locale (Zero Attesa)
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isLoading || !scriptText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Analisi & Segmentazione in corso...' : 'Regia & Scomposizione con AI Studio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
