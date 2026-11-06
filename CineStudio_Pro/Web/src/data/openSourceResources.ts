export interface OpenSourceResource {
  id: string;
  name: string;
  category: 'video_editor' | 'local_ai' | 'automation' | 'creative_assistant' | 'voice_studio' | 'tools_free';
  url: string;
  badge: string;
  description: string;
  cost: '100% Gratuito' | 'Open Source (GitHub)' | 'Nessuna Registrazione';
  howToUseInCinePixar: string;
}

export const OPEN_SOURCE_ECOSYSTEM: OpenSourceResource[] = [
  {
    id: 'opencut',
    name: 'OpenCut (CapCut Open Source)',
    category: 'video_editor',
    url: 'https://github.com/opencut-app/opencut',
    badge: 'CapCut Rust + MCP',
    description: 'Alternativa diretta open-source a CapCut per browser, desktop e mobile. Nucleo in Rust, supporto plugin e server MCP integrato per agenti AI che automatizzano tagli e sottotitoli.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Collega il server MCP integrato o esporta la timeline di CineStudio per il montaggio automatico multipista con zero watermark.',
  },
  {
    id: 'wolfcut',
    name: 'WolfCut',
    category: 'video_editor',
    url: 'https://github.com/jub0t/WolfCut',
    badge: 'CapCut Clone + Whisper',
    description: 'Alternativa open source a CapCut con trascrizione automatica Whisper e filtri vocali integrati senza abbonamenti a pagamento.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Trascrive i dialoghi dei personaggi e sincronizza i sottotitoli stile karaoke in modo rapido e gratuito.',
  },
  {
    id: 'concat',
    name: 'Concat Editor',
    category: 'video_editor',
    url: 'https://www.opensourcealternatives.to/alternative-to/capcut',
    badge: 'Multi-Track Video',
    description: 'Editor video multipista open-source per Windows, macOS e Linux con interfaccia intuitiva e rendering hardware accelerato.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Importa le scene e le musiche generate dal nostro Studio per assemblare la sequenza finale dell\'episodio.',
  },
  {
    id: 'voicestudio',
    name: 'VoiceStudio',
    category: 'voice_studio',
    url: 'https://github.com/debpalash/VoiceStudio',
    badge: 'AI Voice & Cloning Suite',
    description: 'Suite open source completa per sintesi vocale neurale, text-to-speech ad alta fedeltà e clonazione vocale gratuita per i dialoghi dei personaggi.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Assegna voci uniche a Ettore (tono buffo/vivace) e Rex (tono fiero/calmo) esportando tracce audio WAV pronte per il montaggio.',
  },
  {
    id: 'browser_use',
    name: 'Browser-Use / Video-Use',
    category: 'automation',
    url: 'https://github.com/browser-use/',
    badge: 'Agenti Web Autonomi',
    description: 'Agente autonomo basato su browser che naviga, interagisce ed estrae contenuti da piattaforme web AI per automatizzare la generazione video gratuita.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Automatizza il recupero e la generazione video su tier gratuiti cloud senza dover fare click manuali.',
  },
  {
    id: 'wan21',
    name: 'Wan 2.1 (Alibaba T2V)',
    category: 'local_ai',
    url: 'https://github.com/Wan-Video/Wan2.1',
    badge: 'State-of-The-Art Video AI',
    description: 'Modello Text-to-Video open-source di riferimento mondiale (versioni 1.3B e 14B) con qualità cinematografica e animazione fluida a 60fps.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Eseguibile in locale tramite ComfyUI o Diffusers per creare clip realistiche 3D Pixar a costo zero.',
  },
  {
    id: 'cherry_studio',
    name: 'Cherry Studio',
    category: 'creative_assistant',
    url: 'https://github.com/CherryHQ/cherry-studio',
    badge: 'Multi-Model Desktop',
    description: 'Client desktop universale per gestire modelli LLM multipli (Ollama, DeepSeek, Gemini, Claude) con organizzazione di copioni e agenti.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Gestisci e testa i prompt di sceneggiatura e dialoghi con modelli gratuiti o locali.',
  },
  {
    id: 'nanobot_cowagent',
    name: 'Nanobot & CowAgent',
    category: 'automation',
    url: 'https://github.com/HKUDS/nanobot',
    badge: 'Multi-Agent Framework',
    description: 'Framework ultra-leggeri per agenti autonomi collaborativi capaci di pianificare copioni, prompt video e revisioni visive.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Orchestra team di agenti (Sceneggiatore, Direttore della Fotografia, Sound Designer) per rifinire le clip.',
  },
  {
    id: 'ollama',
    name: 'Ollama (Offline AI)',
    category: 'local_ai',
    url: 'https://github.com/ollama/ollama',
    badge: 'Modelli 100% Offline',
    description: 'Esegui modelli come Llama 3, Mistral, Qwen e Gemma direttamente sulla scheda video del computer, senza internet e senza inviare dati al cloud.',
    cost: 'Open Source (GitHub)',
    howToUseInCinePixar: 'Connetti CineStudio all\'endpoint locale http://localhost:11434 per generare sceneggiature complete offline.',
  },
  {
    id: 'dola_ai',
    name: 'Dola AI & Raphael AI',
    category: 'creative_assistant',
    url: 'https://raphael.app/it',
    badge: 'Generazione Gratuita',
    description: 'Strumenti gratuiti per concept art 3D Pixar e storyboard cartoon istantanei in italiano senza abbonamenti.',
    cost: '100% Gratuito',
    howToUseInCinePixar: 'Crea i fogli modello (model sheets) dei personaggi per mantenere la coerenza visiva delle scene.',
  }
];
