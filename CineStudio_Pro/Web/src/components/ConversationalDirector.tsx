import React, { useState } from 'react';
import { Send, Sparkles, Film, Clock, Monitor, Smartphone, Layers, Wand2, Compass } from 'lucide-react';

interface ConversationalDirectorProps {
  onStartProduction: (data: {
    prompt: string;
    durationSeconds: number;
    aspectRatio: '16:9' | '9:16';
    style: string;
  }) => Promise<void>;
  isGenerating?: boolean;
}

export default function ConversationalDirector({
  onStartProduction,
  isGenerating = false
}: ConversationalDirectorProps) {
  const [prompt, setPrompt] = useState('');
  const [durationPreset, setDurationPreset] = useState<number>(300); // default 5 min (300s)
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [stylePreset, setStylePreset] = useState('pixar_cars');

  const durationOptions = [
    { label: '30 sec • Clip Rapida (4 inquadrature)', seconds: 30 },
    { label: '1 Minuto • Corto (6 inquadrature)', seconds: 60 },
    { label: '2 Minuti • Scena Estesa (12 inquadrature)', seconds: 120 },
    { label: '3 Minuti • Puntata Standard (18 inquadrature)', seconds: 180 },
    { label: '5 Minuti • Gran Premio Epico (30 inquadrature)', seconds: 300 }
  ];

  const styleOptions = [
    // Cinema & Serie TV
    {
      id: 'cinema_hollywood',
      category: 'Cinema / Serie TV',
      name: '🎬 Cinema Hollywood & Blockbuster',
      desc: 'Fotorealismo cinematico 35mm anamorfico, illuminazione volumetrica drammatica, profondità di campo cinematografica e color grading caldo.'
    },
    {
      id: 'tv_thriller_noir',
      category: 'Cinema / Serie TV',
      name: '🕵️ Serie TV Thriller & Noir',
      desc: 'Ombre marcate ad alto contrasto, pioggia sui vetri, neon notturni, tensione psicologica e regia da serie crime di qualità.'
    },
    {
      id: 'cinema_scifi',
      category: 'Cinema / Serie TV',
      name: '🌌 Serie TV Sci-Fi & Spazio Profondo',
      desc: 'Atmosfere cosmiche realistiche, plance di comando iper-dettagliate, nebulose stellari, flare anamorfici e tensione astronomica.'
    },
    {
      id: 'tv_drama_action',
      category: 'Cinema / Serie TV',
      name: '💥 Azione & Inseguimenti Cinematografici',
      desc: 'Camera a mano dinamica, tagli ritmici rapidi, primi piani intensi dei personaggi, derapate ed esplosioni controllate.'
    },
    // 3D Cartoon Pixar / Disney / Cars / Scooby-Doo
    {
      id: 'cuccioli_pixar',
      category: 'Cartoon 3D',
      name: '🐾 Cuccioli Pixar 3D (Ettore & Rex / Pets)',
      desc: 'Autentico film animato 3D Pixar/Disney per famiglie: cuccioli morbidissimi con pelo curato e tattile, occhi grandi lucidi ed espressivi, caschetti colorati brillanti, proporzioni tonde e amichevoli, illuminazione cinematografica calda. RIGOROSAMENTE NO grafica 2D piatta, NO vettoriale, NO forme primitive.'
    },
    {
      id: 'pixar_cars',
      category: 'Cartoon 3D',
      name: '🏎️ Disney Pixar Cars & Racing 3D',
      desc: 'Stile originale Disney Pixar Cars 3D: kart e auto stilizzate con carrozzeria lucida e riflessi smaltati, occhi vivaci sul parabrezza, fango e acqua volumetrici con fisica dinamica, derapate spettacolari e animazione squash-and-stretch. NO 2D piatto, NO grafica vettoriale.'
    },
    {
      id: 'scooby_doo',
      category: 'Cartoon 3D',
      name: '🔍 Scooby-Doo & Mistero Cartoon 3D',
      desc: 'Stile cinema cartoon 3D moderno (tipo film Scooby-Doo! 3D): atmosfere misteriose e suggestive, nebbia viola volumetrica, luna piena dorata, gag slapstick, mimica facciale esagerata ed espressiva. NO grafica 2D piatta.'
    },
    {
      id: 'pixar_scifi',
      category: 'Cartoon 3D',
      name: '🚀 Sci-Fi Futuristico Pixar 3D',
      desc: 'Astronavi e kart spaziali 3D con luci al plasma, neon ciano e magenta, riflessi metallici fotorealistici, scie turbo ed espressioni animate Pixar.'
    },
    {
      id: 'fantasy_pixar',
      category: 'Cartoon 3D',
      name: '🏰 Fiaba & Avventura Cartoon 3D',
      desc: 'Atmosfere magiche Disney/Pixar: villaggi incantati, foreste luminose, illuminazione solare dorata, magia scintillante e personaggi 3D curati nei dettagli.'
    }
  ];

  const quickPrompts = [
    {
      title: '🐾 Zampette F1: Ettore & Rex (3D Pixar Cartoon)',
      text: `Zampette a Tutto Gas: Il Sogno F1\nEpisodio 1: Il Casco Blu e il Casco Rosso\n* Trama: Ettore (piccolo bulldog francese vivace con caschetto blu) e Rex (pastore tedesco curioso con caschetto rosso) si incontrano al Caffè della Zampa gestito da Zia Lella. Scoprono di condividere lo stesso sogno folle di correre e fondano la loro scuderia di Formula 1!\n* Momento clou: I due cuccioli progettano con entusiasmo il loro primo kart giocattolo, provando posizioni di guida acrobatiche e facendosi risate contagiose.\n* Conclusione: Con una pacca di zampa e gli applausi degli amici del parco, scendono in pista per la prima prova.`,
      style: 'cuccioli_pixar',
      seconds: 300
    },
    {
      title: '🏎️ Gara dei Kart nel Fango & Ruota Biscotto (Pixar Cars)',
      text: `Verso il pizzo\nEpisodio 4: La Grande Sfida Sotto la Pioggia\n* Trama: È il penultimo GP, ambientato su una pista bagnata e fangosa. La visibilità è scarsa e i kart scivolano ovunque. Spike e Chantal sembrano imbattibili sul bagnato.\n* Momento di tensione e umorismo: Durante un sorpasso azzardato, il kart di Ettore perde una ruota anteriore, che in realtà è un enorme biscottone al formaggio che rimbalza comico nel fango con rumori divertenti!\n* Conclusione: Ettore non si arrende, bilancia acrobaticamente il kart su tre ruote tra sbandate e applausi, tagliando il traguardo sotto la pioggia battente!`,
      style: 'pixar_cars',
      seconds: 300
    },
    {
      title: '🔍 Il Mistero del Circuito Notturno (Stile Scooby-Doo)',
      text: `Mistero alla Pista della Nebbia\nEpisodio 1: Gli Occhi nel Buio\n* Trama: Una gara clandestina notturna si svolge attorno a un vecchio castello abbandonato avvolto dalla nebbia viola. Strani rumori spaventano i piloti.\n* Momento clou: Due occhi giganti e luminosi spuntano da un cespuglio... ma è solo un simpatico cane detective che mangia uno snack gigante!\n* Conclusione: Una sbandata spettacolare porta tutti a tagliare il traguardo ridendo.`,
      style: 'scooby_doo',
      seconds: 180
    },
    {
      title: '🎬 Thriller Notturno Cinematico (Film / Serie TV)',
      text: `Ombre sulla Metropoli\nEpisodio 1: La Pioggia di Mezzanotte\n* Trama: Un investigatore solitario cammina sotto una pioggia torrenziale tra i vicoli illuminati dai neon blu e ambra. Segue una pista che porta a un magazzino sul porto.\n* Momento clou: Il riflesso di un'auto scura appare in una pozzanghera, i fari tagliano la nebbia e parte un inseguimento al cardiopalma.\n* Conclusione: L'investigatore schiva un colpo nascondendosi dietro a una colonna d'acciaio mentre la sirena della polizia echeggia in lontananza.`,
      style: 'tv_thriller_noir',
      seconds: 60
    },
    {
      title: '🚀 Gran Premio Galattico tra gli Asteroidi',
      text: `Odissea dei Turbo-Kart Spaziali\nEpisodio 1: Verso la Nebulosa di Fuoco\n* Trama: Piloti robotici ed alieni simpatici gareggiano su una pista a gravità zero illuminata da neon ciano e fiamme al plasma.\n* Momento clou: Il kart protagonista attiva il super turbo al plasma e supera tutti volando letteralmente sopra una pioggia di comete scintillanti!`,
      style: 'pixar_scifi',
      seconds: 120
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const chosenStyle = styleOptions.find(s => s.id === stylePreset)?.desc || stylePreset;
    await onStartProduction({
      prompt: prompt.trim(),
      durationSeconds: durationPreset,
      aspectRatio,
      style: chosenStyle
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100">
      {/* Introduction Card */}
      <div className="bg-gradient-to-br from-[#121422] to-[#0e1017] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">
              Regia & Istruzioni della Serie
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Scrivi le tue istruzioni, un copione parziale o una semplice idea. L'assistente regista completerà la sceneggiatura, modellerà i personaggi cartoon 3D e genererà tutte le inquadrature video dinamiche.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Idee pronte con un click:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(qp.text);
                  setStylePreset(qp.style);
                  setDurationPreset(qp.seconds);
                }}
                className="text-left p-3 rounded-xl bg-[#171926] hover:bg-[#1e2235] border border-neutral-800 hover:border-amber-500/40 transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                  {qp.title}
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                  {qp.text.slice(0, 90)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Director Input Form */}
      <form onSubmit={handleSubmit} className="bg-[#101018] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Prompt Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span>Istruzioni, Trama o Copione</span>
              <span className="text-amber-400 font-normal">(puoi dare istruzioni parziali o complete)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (!prompt.trim()) {
                  setPrompt("Crea una serie 3D in stile Disney Pixar Cars ambientata in un campionato mondiale di go-kart, dove un piccolo pilota outsider sfida i campioni tra curve fangose e colpi di scena comici.");
                } else {
                  setPrompt(prev => prev + "\n\nSviluppami tu il restante copione con dialoghi comici, effetti sonori d'azione e genera i video!");
                }
              }}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <Wand2 className="h-3 w-3" />
              <span>Sviluppami tu il copione</span>
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={7}
            placeholder="Descrivi qui la tua serie o episodio: personaggi, cosa succede (es. gara di kart nel fango dove si stacca una ruota biscotto al formaggio), stile cartoon 3D..."
            className="w-full bg-[#0a0a0f] border border-neutral-700 focus:border-amber-500 rounded-xl p-4 text-sm text-white placeholder-neutral-500 outline-none transition leading-relaxed"
          />
        </div>

        {/* Direction Parameters: Style, Duration Slider & Formats */}
        <div className="space-y-4 pt-2">
          {/* Style Selector (Cartoon 3D + Film Serie Cinema TV) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-amber-400" />
                <span>Stile Visivo (Cartoon 3D oppure Film & Serie Cinema/TV)</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {styleOptions.find(s => s.id === stylePreset)?.category || 'Cartoon & Cinema'}
              </span>
            </div>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
            >
              <optgroup label="🎬 Film, Cinema & Serie TV">
                {styleOptions.filter(s => s.category === 'Cinema / Serie TV').map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎨 3D Cartoon & Animazione">
                {styleOptions.filter(s => s.category === 'Cartoon 3D').map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-[11px] text-neutral-400 leading-tight">
              {styleOptions.find(s => s.id === stylePreset)?.desc}
            </p>
          </div>

          {/* Duration Slider + Numeric Input + Presets */}
          <div className="bg-[#0c0d14] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Durata Totale del Video / Episodio</span>
                </label>
                <p className="text-[10px] text-neutral-400">
                  L'app concatenerà automaticamente inquadrature da 5-10s in un filmato continuativo senza interruzioni.
                </p>
              </div>

              {/* Synchronized Numerical Input */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-neutral-400">Personalizzata:</span>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={5}
                    max={600}
                    step={5}
                    value={durationPreset}
                    onChange={(e) => {
                      const val = Math.max(5, Math.min(600, Number(e.target.value) || 5));
                      setDurationPreset(val);
                    }}
                    className="w-20 bg-[#161824] border border-neutral-700 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300 text-center outline-none"
                  />
                  <span className="ml-1 text-xs text-neutral-400 font-mono">sec</span>
                </div>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={5}
                max={300}
                step={5}
                value={durationPreset > 300 ? 300 : durationPreset}
                onChange={(e) => setDurationPreset(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>5s (Clip)</span>
                <span>30s (Azione)</span>
                <span>60s (1 min)</span>
                <span>120s (2 min)</span>
                <span>180s (3 min)</span>
                <span>300s (5 min)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '5s • Fast', sec: 5 },
                { label: '10s • Ciak Standard', sec: 10 },
                { label: '30s • Clip Azione', sec: 30 },
                { label: '60s • 1 Minuto Corto', sec: 60 },
                { label: '120s • 2 Minuti Scena', sec: 120 },
                { label: '180s • 3 Minuti Serie', sec: 180 },
                { label: '300s • 5 Minuti Puntata', sec: 300 }
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => setDurationPreset(preset.sec)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    durationPreset === preset.sec
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-[#151722] hover:bg-[#1c2030] text-neutral-300 border border-neutral-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calculation feedback */}
            <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center justify-between">
              <span>
                🎬 Struttura di montaggio: <strong>{durationPreset} secondi totali</strong> (~{Math.ceil(durationPreset / 10)} inquadrature da 10s montate in sequenza continua).
              </span>
              <span className="font-mono text-xs font-bold text-amber-300">
                {Math.floor(durationPreset / 60)}m {durationPreset % 60}s
              </span>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Formato Video Principale</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  aspectRatio === '16:9'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#0a0a0f] border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>16:9 Cinema / TV / YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  aspectRatio === '9:16'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#0a0a0f] border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>9:16 TikTok / Reels / Shorts</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 leading-tight">
              Durante l export ZIP finale riceverai sia il master orizzontale 16:9 che quello verticale 9:16.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Video dinamici, audio ed animazioni procedurali 3D reali</span>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
          >
            <Send className="h-4 w-4" />
            <span>Avvia Elaborazione & Produzione Video</span>
          </button>
        </div>
      </form>
    </div>
  );
}
