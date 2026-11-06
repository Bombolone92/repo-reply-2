import React, { useState } from 'react';
import agentsData from '../data/agentSkills.json';
import { Bot, Sparkles, X, Search, Check, Copy, ArrowRight, Wand2, Lightbulb, Film, Play } from 'lucide-react';
import { SceneClip } from '../types';

interface AgentSkill {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  color: string;
  promptInstructions: string;
}

interface AgentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClip: SceneClip;
  onApplyPrompt: (newPrompt: string) => void;
}

export const AgentStudioModal: React.FC<AgentStudioModalProps> = ({
  isOpen,
  onClose,
  currentClip,
  onApplyPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<AgentSkill>(
    (agentsData as AgentSkill[]).find(a => a.id === 'generatore-hook-video') ||
    (agentsData as AgentSkill[])[0]
  );
  const [inputText, setInputText] = useState(
    currentClip.actionDescription || currentClip.title || 'Avventura animata comica di cuccioli al parco giochi'
  );
  const [outputResult, setOutputResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const allAgents = agentsData as AgentSkill[];

  const categories = [
    { id: 'all', label: 'Tutti (100 Agenti)' },
    { id: '02-content-e-copywriting', label: 'Sceneggiatura & Copy' },
    { id: '03-social-media', label: 'Social & Clip Virali' },
    { id: '04-marketing-e-vendite', label: 'Marketing & Promozione' },
    { id: '01-ricerca-e-analisi', label: 'Ricerca & Analisi' },
    { id: '05-produttivita-e-second-brain', label: 'Workflow & Idee' },
    { id: '09-sviluppo-e-automazioni', label: 'Automazioni' },
  ];

  const filteredAgents = allAgents.filter(agent => {
    const matchesCat = selectedCategory === 'all' || agent.categoryId === selectedCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Client-side local execution without API keys!
  const handleRunAgent = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let result = '';
      const topic = inputText.trim() || 'Scena di animazione slapstick stile Pixar e Minions';

      if (selectedAgent.id.includes('hook')) {
        result = `🎯 8 HOOK AD ALTO IMPATTO PER QUESTA SCENA (Stile ${selectedAgent.name}):

1. [Domanda Spiazzante]: "Hai mai visto un cucciolo correre più veloce della luce per un biscotto?"
2. [Scena Comica Immediata]: "Sguardo a destra, sguardo a sinistra... e poi lo scatto più buffo della storia!"
3. [Dato Incredibile]: "Solo 3 secondi per innamorarsi di questa espressione cartoon!"
4. [Contrasto Esilarante]: "Sembrava il cagnolino più calmo del mondo, finché non ha visto il chiosco dei dolci..."
5. [Frase Secca]: "Non battere ciglio: questa gag slapstick è pura magia."
6. [Provocazione]: "Scommetto che non riesci a guardare la sua faccia senza ridere!"
7. [Storia in una riga]: "La grande fuga verso il bancone dei gelati comincia adesso."
8. [Ammissione]: "Tutti vorremmo avere la stessa felicità negli occhi di questo cucciolo."`;
      } else if (selectedAgent.id.includes('clip') || selectedAgent.id.includes('estrat')) {
        result = `🎬 SCOMPOSIZIONE IN CLIP CANDIDATE (Estrattore Regia):

• Clip 1 (0:00 - 0:05): L'Avvistamento Furtivo
  - Attacco: Sguardo con pupille dilatate e orecchie dritte
  - Perché funziona: Crea suspense comica immediata nei primi 2 secondi.

• Clip 2 (0:05 - 0:10): La Reazione Shock Minions
  - Attacco: Occhi spalancati, bocca spalancata e linguetta fuori
  - Perché funziona: Mimica facciale cartoon irresistibile per TikTok e Shorts.

• Clip 3 (0:10 - 0:15): Lo Scatto Comico
  - Attacco: Zampate veloci sul posto con fumo e partenza a razzo
  - Perché funziona: Dinamismo puro, ritmo accelerato e chiusura perfetta.`;
      } else if (selectedAgent.id.includes('format') || selectedAgent.id.includes('viral') || selectedAgent.id.includes('social')) {
        result = `🚀 FORMAT VIRALE SUGGERITO:
- Titolo YouTube: "Quando vedi il cibo e perdi la testa 🐶🤣 (Stile Minions 3D)"
- Durata ideale: 12-15 secondi in loop continuo
- Formato: 9:16 Verticale con soggetto sempre centrato
- Sound Design: Effetto slapstick boing + risata contagiosa accelerata
- Hashtag: #Cartoon3D #MinionsStyle #PixarAnimation #GagComica #Animazione3D #CutePuppy`;
      } else {
        result = `✨ DIRETTIVA DI REGIA ELABORATA DA "${selectedAgent.name}":

Descrizione Raffinata:
"Scena 3D ad alta carica espressiva: ${topic}. Illuminazione calda volumetrica con ombre morbide cartoon. Dettaglio sugli occhi grandi e luccicanti, mimica facciale slapstick esagerata stile Minions e Disney Pixar. Movimento di camera fluido con dolly zoom d'impatto e ritmo dinamico a 60fps."

Elementi Chiave da Valorizzare:
1. Recitazione mimica visiva (nessuna parola necessaria)
2. Colori vivaci e contrasto pulito
3. Ritmo comico serrato per catturare l'attenzione dello spettatore fin dal primo fotogramma.`;
      }

      setOutputResult(result);
      setIsProcessing(false);
    }, 350);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToPrompt = () => {
    if (outputResult) {
      onApplyPrompt(outputResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Studio 100 Agenti &amp; Prompt Specialist
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Gratuito &bull; Zero API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Assistenti specializzati dall'archivio pronti per regia video, hook virali, clip e montaggio
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

        {/* Modal Body: Split view (Agents List vs Workspace) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Agents Picker (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40 overflow-hidden">
            {/* Search Bar & Category filter */}
            <div className="p-3.5 space-y-2.5 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca agente (hook, clip, copione, virale)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list of agents */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgent.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setOutputResult('');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        {agent.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                        {agent.category.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {agent.description || 'Specialista per ottimizzazione e creazione di contenuti multimediali.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Execution Workspace (7 cols) */}
          <div className="md:col-span-7 p-5 flex flex-col gap-4 overflow-y-auto bg-slate-900">
            {/* Agent Info Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      {selectedAgent.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                      {selectedAgent.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedAgent.description}
                  </p>
                </div>
              </div>

              {/* Instructions preview */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 max-h-24 overflow-y-auto font-mono">
                {selectedAgent.promptInstructions.slice(0, 300)}...
              </div>
            </div>

            {/* Input Prompt Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Tema o Copione della Scena:</span>
                <span className="text-[10px] text-slate-400 font-normal">Modificabile a piacere</span>
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none leading-relaxed"
                placeholder="Inserisci l'azione o l'idea da elaborare..."
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunAgent}
              disabled={isProcessing}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>Elaborazione in corso...</>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Esegui Agente &quot;{selectedAgent.name}&quot; (100% Free)
                </>
              )}
            </button>

            {/* Output Box */}
            {outputResult && (
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Risultato Elaborato:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiato!' : 'Copia'}
                    </button>
                    <button
                      onClick={handleApplyToPrompt}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition shadow"
                    >
                      Applica al Box Video <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-sans pr-1">
                  {outputResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
