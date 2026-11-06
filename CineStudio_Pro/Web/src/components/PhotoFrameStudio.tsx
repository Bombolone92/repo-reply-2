import React, { useState, useEffect } from 'react';
import {
  Camera,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Layers,
  Clock,
  Volume2,
  Users,
  Film,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Play
} from 'lucide-react';
import type { ProductionBibleData } from '../server/productionBibleService';

interface PhotoFrameStudioProps {
  initialPrompt?: string;
}

export default function PhotoFrameStudio({ initialPrompt = '' }: PhotoFrameStudioProps) {
  const [prompt, setPrompt] = useState(initialPrompt || 'Ettore & Rex - La Grande Sfida del Gran Premio: bulldog e pastore tedesco su kart giocattolo');
  const [bibleData, setBibleData] = useState<ProductionBibleData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'bible' | 'gallery' | 'workflow'>('bible');
  const [selectedFps, setSelectedFps] = useState<2 | 8>(2);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  // Generate initial Bible data on mount
  useEffect(() => {
    fetchBible(prompt);
  }, []);

  const fetchBible = async (scriptPrompt: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/production-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scriptPrompt, title: 'BIBBIA_ETTORE_REX_ALL_IN_ONE' })
      });
      if (res.ok) {
        const data = await res.json();
        setBibleData(data);
      }
    } catch (e) {
      console.error('Failed fetching production bible', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!bibleData) return;
    setIsDownloadingDocx(true);
    try {
      const res = await fetch('/api/production-bible/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bibleData })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${bibleData.title || 'BIBBIA_PRODUZIONE_ALL_IN_ONE'}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Errore generazione DOCX');
      }
    } catch (e: any) {
      alert('Errore download DOCX: ' + e.message);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleDownloadTxt = () => {
    if (!bibleData) return;
    const textContent = `=====================================================
${bibleData.title}
DOCUMENTO ALL-IN-ONE PER GENERAZIONE IMMAGINI E ASSEMBLAGGIO
=====================================================

LOGLINE:
${bibleData.seriesLogline}
SEED CONSIGLIATO: ${bibleData.seed}

1. PERSONAGGI / CAST:
${bibleData.cast.map(c => `
[${c.name.toUpperCase()}] - ${c.role}
Descrizione Visiva: ${c.visualDescription}
Prompt Base: ${c.basePrompt}
Voce TTS: ${c.ttsSettings.voiceName} (Pitch: ${c.ttsSettings.pitch}, Speed: ${c.ttsSettings.speed})
`).join('\n')}

2. FORMULA FRAME (5 MINUTI):
- Durata totale: ${bibleData.formulaFrame.totalMinutes} min = ${bibleData.formulaFrame.totalSeconds} secondi
- Clip: 4 da ${bibleData.formulaFrame.clipDurationSeconds}s + 1 da ${bibleData.formulaFrame.finalClipDurationSeconds}s
- A 8 FPS: ${bibleData.formulaFrame.fps8.imagesPerClip} immagini a clip / ${bibleData.formulaFrame.fps8.totalImages} totali
- A 2 FPS: ${bibleData.formulaFrame.fps2.imagesPerClip} immagini a clip / ${bibleData.formulaFrame.fps2.totalImages} totali
- Trucco Anti-Salto: ${bibleData.formulaFrame.antiJumpTechnique}

3. EPISODIO 1 CLIP BY CLIP:
${bibleData.episodes[0]?.clips.map(clip => `
CLIP ${clip.clipNumber} (${clip.timestamp}) - ${clip.durationSeconds}s
Descrizione: ${clip.visualDescription}
Prompt Copia-Incolla: ${clip.copyPastePrompt}
Dialoghi: ${clip.dialogues.map(d => `[${d.timestamp}] ${d.speaker}: "${d.text}"`).join(' ')}
Musica & SFX: ${clip.musicAndSFX}
`).join('\n')}

4. SCRIPT COMPLETO EPISODIO 1 TIMBRATO (00:00 - 05:00):
${bibleData.audioVoci.scriptEpisodio1}

5. WORKFLOW ESTERNO:
${bibleData.workflowEsterno.characterReferenceGuide}
Consiglio Assemblaggio: ${bibleData.workflowEsterno.assemblyTips}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bibleData.title}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Studio Banner & DOCX Export Card */}
      <div className="bg-gradient-to-r from-[#12152b] via-[#101322] to-[#0c0d16] border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                Photo & Frame Studio • Sezione Foto
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                📎 Documento All-In-One (.docx)
              </span>
            </div>

            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2.5">
              <Camera className="h-6 w-6 text-blue-400" />
              <span>Bibbia di Produzione & Frame Generator</span>
            </h2>

            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Riceve il tuo prompt e calcola la formula precisa frame-by-frame da assemblare (5 min = 4 clip da 70s + 1 da 20s, a 2 fps o 8 fps) con descrizioni visive, prompt copia-incolla per Leonardo/Midjourney, dialoghi timbrati per TTS e workflow con Character Reference Seed 12345.
            </p>
          </div>

          {/* Big Download DOCX Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadDocx}
              disabled={!bibleData || isDownloadingDocx}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/20 flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloadingDocx ? 'Generazione Word...' : 'Scarica BIBBIA_ALL_IN_ONE.docx'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!bibleData}
              className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition"
              title="Scarica documento in formato testo .txt"
            >
              <FileText className="h-4 w-4" />
              <span>Scarica TXT</span>
            </button>
          </div>
        </div>

        {/* Quick Prompt Presets */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Preset Pronti da Rigenerare:
          </span>
          <button
            onClick={() => {
              const p = 'Ettore & Rex - Sulla Pista dei Sogni: Bulldog francese pilota kart rosso e pastore tedesco navigatore blu nel Campionato di Karting';
              setPrompt(p);
              fetchBible(p);
            }}
            className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs transition"
          >
            🏎️ Ettore & Rex Karting
          </button>
          <button
            onClick={() => {
              const p = 'Peter Pan & l Isola che non c è: il vascello volante Jolly Roger di Capitan Uncino solca i cieli notturni di Londra con polvere di fata';
              setPrompt(p);
              fetchBible(p);
            }}
            className="px-3 py-1 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs transition"
          >
            ✨ Peter Pan & Neverland
          </button>
          <button
            onClick={() => {
              const p = 'Detective Vincent e la Notte del Sospetto: noir 35mm per adulti con investigatore solitario sotto la pioggia al Molo 9';
              setPrompt(p);
              fetchBible(p);
            }}
            className="px-3 py-1 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs transition"
          >
            🎬 Noir 35mm per Adulti
          </button>
        </div>
      </div>

      {/* Prompt Form & Real-Time Calculation Bar */}
      <div className="bg-[#0b0c14] border border-neutral-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
            Prompt / Istruzioni della Serie o Film da Analizzare
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Formula Frame:</span>
            <button
              onClick={() => setSelectedFps(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFps === 2
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              2 FPS (140 img/clip)
            </button>
            <button
              onClick={() => setSelectedFps(8)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFps === 8
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              8 FPS (560 img/clip)
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Inserisci il prompt della serie o film..."
            className="flex-1 bg-[#10121d] border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchBible(prompt)}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isGenerating ? 'Generazione...' : 'Aggiorna Bibbia'}</span>
          </button>
        </div>
      </div>

      {/* Tabs: Bible View, Frame Gallery & Assembler, Workflow */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('bible')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'bible'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>1. Bibbia All-In-One Document</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'gallery'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>2. Frame & Prompt Gallery ({bibleData?.episodes[0]?.clips.length || 5} Clip)</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'workflow'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>3. Workflow Esterno & Seed 12345</span>
          </button>
        </div>

        {/* TAB 1: BIBLE VIEW */}
        {activeTab === 'bible' && bibleData && (
          <div className="space-y-6">
            {/* Section 1: Cast */}
            <div className="bg-[#0b0c14] border border-neutral-800 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-400" />
                  <span>Sezione 1: Personaggi / Cast & Base Prompts</span>
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {bibleData.cast.length} Personaggi Caratterizzati
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bibleData.cast.map((char, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#10121d] border border-neutral-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white">{char.name}</div>
                        <div className="text-[11px] text-amber-400/90 font-mono">{char.role}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        Seed {bibleData.seed}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {char.visualDescription}
                    </p>

                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-start justify-between gap-2">
                      <span className="line-clamp-2">{char.basePrompt}</span>
                      <button
                        onClick={() => copyToClipboard(char.basePrompt, `cast_${idx}`)}
                        className="p-1 text-neutral-400 hover:text-white shrink-0"
                        title="Copia prompt base per Leonardo/Midjourney"
                      >
                        {copiedPromptId === `cast_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1">
                      <span>Voce TTS: <strong className="text-neutral-400">{char.ttsSettings.voiceName}</strong></span>
                      <span>Pitch: {char.ttsSettings.pitch} • Speed: {char.ttsSettings.speed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Formula Frame */}
            <div className="bg-[#0b0c14] border border-neutral-800 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="pb-3 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>Sezione 2: Formula Frame (Tabella Precisa per 5 Minuti = 300 Sec)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#10121d] border border-neutral-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Durata & Suddivisione</div>
                  <div className="text-xl font-bold text-white">5 Minuti (300s)</div>
                  <div className="text-xs text-amber-400 font-mono">4 clip da 70s + 1 da 20s</div>
                </div>

                <div className={`p-4 rounded-2xl border text-center space-y-1 transition ${selectedFps === 2 ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-[#10121d] border-neutral-800 text-neutral-400'}`}>
                  <div className="text-[10px] font-mono uppercase">A 2 FPS (Consigliato Leggero)</div>
                  <div className="text-xl font-bold text-white">{bibleData.formulaFrame.fps2.imagesPerClip} immagini / clip</div>
                  <div className="text-xs font-mono text-neutral-300">{bibleData.formulaFrame.fps2.totalImages} immagini totali</div>
                </div>

                <div className={`p-4 rounded-2xl border text-center space-y-1 transition ${selectedFps === 8 ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-[#10121d] border-neutral-800 text-neutral-400'}`}>
                  <div className="text-[10px] font-mono uppercase">A 8 FPS (Massima Fluidità)</div>
                  <div className="text-xl font-bold text-white">{bibleData.formulaFrame.fps8.imagesPerClip} immagini / clip</div>
                  <div className="text-xs font-mono text-neutral-300">{bibleData.formulaFrame.fps8.totalImages} immagini totali</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Trucco Anti-Salto:</strong> {bibleData.formulaFrame.antiJumpTechnique}.
                </span>
              </div>
            </div>

            {/* Section 3: Audio / Voci */}
            <div className="bg-[#0b0c14] border border-neutral-800 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="pb-3 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-emerald-400" />
                  <span>Sezione 3: Audio / Voci (Casting TTS & Script Timbrato 00:00 - 05:00)</span>
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#10121d] border border-neutral-800">
                <pre className="text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {bibleData.audioVoci.scriptEpisodio1}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FRAME & PROMPT GALLERY (CLIP BY CLIP DA 1M10S) */}
        {activeTab === 'gallery' && bibleData && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0b0c14] border border-neutral-800 flex items-center justify-between">
              <div className="text-xs text-neutral-300">
                Ogni clip da <strong>70 secondi</strong> corrisponde a <strong>{selectedFps === 2 ? '140' : '560'} immagini</strong>. Copia il prompt esatto per generare su Leonardo o Midjourney:
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                Seed Fisso: {bibleData.seed}
              </span>
            </div>

            <div className="space-y-4">
              {bibleData.episodes[0]?.clips.map((clip) => {
                const promptKey = `clip_prompt_${clip.clipNumber}`;
                return (
                  <div
                    key={clip.clipNumber}
                    className="p-5 rounded-3xl bg-[#0b0c14] border border-neutral-800 space-y-3.5 hover:border-blue-500/40 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          CLIP {clip.clipNumber}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          Timestamp: {clip.timestamp} ({clip.durationSeconds}s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                        <span>{selectedFps === 2 ? '140 Immagini (2 fps)' : '560 Immagini (8 fps)'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      {clip.visualDescription}
                    </p>

                    {/* Copy-Paste Prompt Box */}
                    <div className="p-3.5 rounded-2xl bg-[#10121d] border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>PROMPT COPIA-INCOLLA PER MIDJOURNEY / LEONARDO / GEMINI:</span>
                        <button
                          onClick={() => copyToClipboard(clip.copyPastePrompt, promptKey)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition flex items-center gap-1.5 text-xs font-sans font-semibold"
                        >
                          {copiedPromptId === promptKey ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>Copiato!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copia Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs font-mono text-emerald-300 bg-black/40 p-2.5 rounded-xl break-words">
                        {clip.copyPastePrompt}
                      </div>
                    </div>

                    {/* Dialogues in clip */}
                    {clip.dialogues && clip.dialogues.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-mono text-neutral-400">Dialoghi con Timestamp:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {clip.dialogues.map((d, i) => (
                            <div key={i} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 italic flex items-center gap-2">
                              <span className="font-mono text-[10px] text-amber-400 font-bold not-italic">[{d.timestamp}]</span>
                              <span><strong>{d.speaker}:</strong> "{d.text}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-neutral-500 font-mono pt-1">
                      {clip.musicAndSFX}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WORKFLOW ESTERNO */}
        {activeTab === 'workflow' && bibleData && (
          <div className="bg-[#0b0c14] border border-neutral-800 rounded-3xl p-6 shadow-lg space-y-5 text-xs text-neutral-300 leading-relaxed">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              <span>Workflow Esterno: Character Reference con Seed {bibleData.seed}</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#10121d] border border-neutral-800 whitespace-pre-wrap font-sans text-xs space-y-2">
              {bibleData.workflowEsterno.characterReferenceGuide}
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white">Modelli Consigliati per Massima Consistenza:</div>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                {bibleData.workflowEsterno.recommendedModels.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <strong>Consiglio di Assemblaggio Finale:</strong> {bibleData.workflowEsterno.assemblyTips}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
