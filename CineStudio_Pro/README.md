# 🎬 CineStudio Pro — Suite di Produzione Video 3D & Serie Cartoon

Benvenuto in **CineStudio Pro**, la piattaforma avanzata per la creazione di serie animate in stile **3D Pixar Cartoon**, Minions slapstick, Cars 3D, Scooby Doo e produzioni cinematografiche.

Il progetto è suddiviso in due versioni dedicate e indipendenti:
1. **`Web/`**: Studio basato su browser (Vite + React 19 + TypeScript + Three.js + Web Audio API). Ideale per l'editing interattivo, anteprime 3D, VoiceStudio web, In-App Video Generator con stili cartoon certificati, esportazione ZIP dei progetti e compatibile con hosting cloud (Vercel, Netlify).
2. **`Locale/`**: Server desktop e orchestratore (Node.js + Express + FFmpeg + Python AI). Ideale per il rendering video locale ad alta risoluzione, montaggio multipista con FFmpeg, gestione database JSON locale e connessione ai modelli open-source offline (Wan 2.1, ComfyUI, Piper TTS, Ollama).

---

## 🚀 Avvio Rapido

- **Versione Web**: doppio click su `AVVIA_WEB.bat` (o `cd Web && npm run dev`)
- **Versione Locale**: doppio click su `AVVIA_LOCALE.bat` (o `cd Locale && npm run dev`)

---

## 🛠️ Risorse Open Source & Alternative Gratuite Integrate

### 1. Alternative Open Source a CapCut
- **OpenCut** (`https://github.com/opencut-app/opencut`): Editor video gratuito e open source scritto in Rust, con server MCP per agenti AI che automatizzano tagli e sottotitoli.
- **WolfCut** (`https://github.com/jub0t/WolfCut`): Alternativa open source con trascrizione automatica Whisper e filtri vocali gratuiti.
- **Concat** (`https://www.opensourcealternatives.to/alternative-to/capcut`): Editor multipista cross-platform (Windows, Mac, Linux, Android) per montaggio senza watermark.

### 2. Sintesi Vocale & Doppiaggio Personaggi
- **VoiceStudio** (`https://github.com/debpalash/VoiceStudio`): Suite open source per text-to-speech neurale, clonazione vocale e filtri audio per i personaggi (Ettore, Rex, Signor Baffi, Bruno, Luna).
- **Piper TTS & eSpeak-ng**: Generazione vocale C++ velocissima e 100% offline, inclusa in `Locale/scripts/piper_tts_voice_studio.py`.
- **Web Audio Engine**: Generatore integrato in `Web/src/services/audioEngine.ts` con controllo di pitch, rate e timbro vocale per ciascun cane.

### 3. Generazione Video AI Gratuita & Open Source
- **Wan 2.1 (Alibaba)**: Modello SOTA open-source (1.3B e 14B) per generare video 3D realistici ed espressivi a costo zero tramite ComfyUI o Diffusers (`Locale/scripts/wan21_local_video_generator.py`).
- **Browser-Use / Video-Use** (`https://github.com/browser-use/`): Agente autonomo per navigare e sfruttare i tier gratuiti cloud senza click manuali (`Locale/scripts/browser_use_video_agent.py`).
- **In-App Canvas Procedurale**: Generatore 60fps basato su HTML5 Canvas e WebGL integrato in `Web/`, gratuito al 100%, senza bisogno di GPU esterna.

### 4. Risoluzione Stile Pixar vs Realistico
I preset in `Web/src/data/styleCatalog.ts` e `Web/src/components/InAppVideoGenerator.tsx` contengono le firme di prompt ottimali per cartoni animati:
- **3D Cartoon (Pixar & Minions)**: `Pixar Disney and Illumination Minions 3D CGI animation, adorable expressive cartoon characters with exaggerated funny facial expressions, slapstick comedy timing, rich subsurface scattering, vibrant lively colors, raytraced ambient occlusion, 60fps`
- **Cars Speedway 3D**: `Pixar Cars style 3D animation, bright sports car with expressive animated windshield eyes and smiling grille, high-speed drifting on sunny tarmac, billowing tire smoke, 60fps`
- **Color Mood Bright & Saturated**: Colori saturi e vivaci, luce solare calda, ombre morbide senza distorsioni iperrealistiche sgradevoli.

---

## 📂 Struttura del Repository

```
CineStudio_Pro/
├── AVVIA_WEB.bat          # Avvia lo Studio Web con un click
├── AVVIA_LOCALE.bat       # Avvia il Server Locale con un click
├── Web/                   # Versione Web / Cloud Studio
│   ├── src/               # Componenti React, Scene 3D, VoiceStudio, Timeline
│   ├── public/            # Risorse multimediali ed esempi audio/video
│   ├── index.html         # Entry point web
│   └── package.json
└── Locale/                # Versione Locale Desktop / Backend
    ├── server.ts          # Server Express + FFmpeg + API endpoints
    ├── data/              # Database JSON di progetti ed episodi
    ├── uploads/           # File caricati e renderizzati
    ├── scripts/           # Script Python (Wan 2.1, Piper TTS, Browser-Use)
    └── package.json
```

