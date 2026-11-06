import React, { useState } from 'react';
import { SeriesProject, Episode } from '../types';
import { generatePythonPipelineScript, generateBlenderPythonScript, generateComfyUiWorkflowJson, defaultEngineConfig, OpenSourceEngineConfig } from '../services/openSourcePipelines';
import { OPEN_SOURCE_ECOSYSTEM } from '../data/openSourceResources';
import { Terminal, Cpu, Globe, Server, CheckCircle, AlertCircle, Copy, Download, Code2, Play, Sparkles, ExternalLink } from 'lucide-react';

interface OpenSourceHubTabProps {
  project: SeriesProject;
  currentEpisode: Episode;
}

export const OpenSourceHubTab: React.FC<OpenSourceHubTabProps> = ({ project, currentEpisode }) => {
  const [config, setConfig] = useState<OpenSourceEngineConfig>(defaultEngineConfig);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'connected' | 'offline'>('idle');
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'blender' | 'comfyui'>('python');
  const [copied, setCopied] = useState(false);

  const pythonScript = generatePythonPipelineScript(project, currentEpisode);
  const blenderScript = generateBlenderPythonScript(project, currentEpisode);
  const comfyUiJson = generateComfyUiWorkflowJson(currentEpisode.clips[0] || { durationSeconds: 5, actionDescription: 'Azione', environment: 'Studio' } as any);

  const currentCode = activeCodeTab === 'python' ? pythonScript : activeCodeTab === 'blender' ? blenderScript : comfyUiJson;

  const testEndpointConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(config.endpointUrl, { method: 'GET', mode: 'no-cors' });
      // In browser no-cors, if it doesn't throw, host is responding
      setTestStatus('connected');
    } catch (e) {
      // If localhost is not running yet
      setTestStatus('offline');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Hub Open-Source: Python, C++, Wan 2.1, ComfyUI &amp; Blender
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Gratuito &amp; Libero
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Collega connettori locali, endpoint API, oppure esegui la pipeline Python &amp; C++ direttamente sul tuo computer con accelerazione GPU.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFile('pipeline_render_serie.py', pythonScript)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Scarica Script Python (.py)
            </button>
          </div>
        </div>

        {/* Big Chinese & Global Open-Source Models Grid */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Modelli Open-Source di Generazione Video &amp; Voce Integrati
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Wan 2.1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>Wan 2.1 (Alibaba)</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">T2V / I2V</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Modello diffusion open-weight di punta da Alibaba Cloud (1.3B e 14B). Resa 3D fotorealistica e cinematica.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Pronto in ComfyUI / PyTorch</span>
            </div>

            {/* HunyuanVideo */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>HunyuanVideo (Tencent)</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">13B DiT</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Modello open-source di Tencent con eccezionale coerenza fisica nei movimenti e rendering ad alta definizione.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Diffusers / Hugging Face</span>
            </div>

            {/* CogVideoX */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>CogVideoX (Zhipu AI)</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">5B / 2B</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Progetto open-source dell'università di Tsinghua. Supporto nativo in Diffusers e rendering stile Pixar.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Python pip ready</span>
            </div>

            {/* Piper TTS C++ */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>Piper TTS (C++ / ONNX)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">C++ Engine</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Sintesi vocale neurale velocissima scritta in C++, gira in tempo reale anche su CPU senza connessione internet.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Offline / Zero Latency</span>
            </div>
          </div>
        </div>

        {/* Ecosistema Open-Source & Tool Gratuiti (Dall'Archivio 007) */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ecosistema Open-Source &amp; Tool Gratuiti Senza Registrazione
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Nessuna API richiesta &bull; 100% Free</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {OPEN_SOURCE_ECOSYSTEM.map((res) => (
              <div key={res.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-white truncate">{res.name}</span>
                    <span className="text-[9px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-medium">{res.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {res.description}
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 mb-3">
                    <strong className="text-indigo-400">Uso in CinePixar:</strong> {res.howToUseInCinePixar}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-emerald-400 font-semibold">{res.cost}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    Apri <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Endpoint Connector URL Box */}
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Connettore URL / Endpoint Locale (ComfyUI / Python Server / Webhook)
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px]">
              <input
                type="text"
                value={config.endpointUrl}
                onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
                placeholder="http://localhost:8188 (ComfyUI) o http://localhost:8000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <button
              onClick={testEndpointConnection}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Test Connessione Endpoint
            </button>

            {testStatus === 'connected' && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" /> Server Rilevato!
              </span>
            )}
            {testStatus === 'offline' && (
              <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                <AlertCircle className="w-4 h-4" /> Server locale non in ascolto su questa porta (avvialo sul PC)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Code Inspector & Automation Scripts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'python'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🐍 Script Orchestratore Python (pipeline_render_serie.py)
            </button>
            <button
              onClick={() => setActiveCodeTab('blender')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'blender'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎨 Blender Python Headless 3D (blender_render_3d.py)
            </button>
            <button
              onClick={() => setActiveCodeTab('comfyui')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'comfyui'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚙️ Workflow ComfyUI Wan 2.1 (.json)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiato!' : 'Copia Codice'}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px]">
          <pre>{currentCode}</pre>
        </div>
      </div>
    </div>
  );
};
