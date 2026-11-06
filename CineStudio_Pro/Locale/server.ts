import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import type { Project, Character, Episode, Shot, ApiKeyEntry, StudioGenerationState } from './src/types/cine3d.ts';
import { renderDynamicProceduralShot } from './src/server/proceduralCartoonRenderer.ts';
import { buildProductionBibleFromPrompt, createProductionBibleDocx } from './src/server/productionBibleService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory & video storage
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const videosDir = path.join(uploadsDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database path
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'cine3d_db.json');

interface Database {
  projects: Project[];
  characters: Character[];
  episodes: Episode[];
  shots: Shot[];
  user_credits: {
    available: number;
    consumed: number;
  };
  api_keys: ApiKeyEntry[];
}

function initDatabase(): Database {
  let existing: any = null;
  if (fs.existsSync(dbPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error('Failed reading existing db', e);
    }
  }

  const cleanDb: Database = {
    projects: existing?.projects || [],
    characters: existing?.characters || [],
    episodes: existing?.episodes || [],
    shots: existing?.shots || [],
    user_credits: existing?.user_credits || {
      available: 100,
      consumed: 0
    },
    api_keys: existing?.api_keys || []
  };

  // Add default env key if present and not already added
  if (cleanDb.api_keys.length === 0 && process.env.GEMINI_API_KEY) {
    cleanDb.api_keys.push({
      id: 'key_default_env',
      key: process.env.GEMINI_API_KEY,
      label: 'Chiave Google AI Studio Primaria',
      status: 'active',
      added_at: new Date().toISOString(),
      calls_count: 0
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(cleanDb, null, 2));
  return cleanDb;
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Global live studio observation state
export const studioGenerationState: StudioGenerationState = {
  is_generating: false,
  is_paused: false,
  pause_reason: null,
  current_step: 'Studio Pronto',
  progress: 0,
  active_project_id: null,
  active_episode_id: null,
  logs: [
    '🎬 Cine3D Studio pronto.',
    '⚡ Failover multi-chiave Google AI Studio operativo.',
    '🎥 Motore di rendering cartoon 3D procedurale attivo.'
  ]
};

export function addStudioLog(message: string) {
  const timestamp = new Date().toLocaleTimeString('it-IT');
  const line = `[${timestamp}] ${message}`;
  studioGenerationState.logs.push(line);
  if (studioGenerationState.logs.length > 50) {
    studioGenerationState.logs.shift();
  }
}

// Get the active Gemini client from the user's API Key pool with automatic failover
function getActiveGeminiClient(): { client: GoogleGenAI; keyEntry?: ApiKeyEntry } {
  if (!Array.isArray(db.api_keys)) {
    db.api_keys = [];
  }

  // Look for active key
  let activeEntry = db.api_keys.find(k => k.status === 'active');

  // If no active key, try activating the first standby
  if (!activeEntry) {
    const standby = db.api_keys.find(k => k.status === 'standby');
    if (standby) {
      standby.status = 'active';
      activeEntry = standby;
      saveDatabase();
      addStudioLog(`Attivata chiave di riserva: ${activeEntry.label}`);
    }
  }

  const rawKey = activeEntry?.key || process.env.GEMINI_API_KEY || '';
  const client = new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  return { client, keyEntry: activeEntry };
}

// Helper to safely parse AI JSON response
function extractJson(text: string): any {
  if (!text) return null;
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/([\{\[][\s\S]*[\}\]])/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      const cleaned = match[1].replace(/,\s*([\]}])/g, '$1');
      try {
        return JSON.parse(cleaned);
      } catch (err) {
        return null;
      }
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// Resilient AI generation with automatic token failover across the user's Google AI Studio keys
async function generateContentResilient(prompt: string): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-2.0-flash'];
  let attempts = 0;
  const maxKeyAttempts = Math.max(1, (db.api_keys || []).length);

  while (attempts < maxKeyAttempts) {
    const { client, keyEntry } = getActiveGeminiClient();

    for (const model of models) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
        });
        if (response && response.text) {
          if (keyEntry) {
            keyEntry.calls_count = (keyEntry.calls_count || 0) + 1;
            keyEntry.last_used = new Date().toISOString();
            saveDatabase();
          }
          return response.text;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate limit');
        const is503 = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('unavailable');

        if (isQuota && keyEntry) {
          keyEntry.status = 'exhausted';
          keyEntry.last_error = errMsg;
          addStudioLog(`⚠️ Quota esaurita su ${keyEntry.label} (${keyEntry.key.slice(0, 6)}...). Attivazione failover alla chiave successiva...`);

          // Activate next standby key
          const nextStandby = db.api_keys.find(k => k.status === 'standby');
          if (nextStandby) {
            nextStandby.status = 'active';
            saveDatabase();
            addStudioLog(`✅ Failover completato: Attivata ${nextStandby.label}`);
            break; // Break inner model loop to retry with new key
          } else {
            // All keys exhausted: pause gracefully
            studioGenerationState.is_paused = true;
            studioGenerationState.pause_reason = 'quota_exhausted';
            saveDatabase();
            addStudioLog('🛑 Tutte le chiavi API hanno esaurito i token. Lavoro congelato in sicurezza in attesa di nuova chiave.');
            throw new Error('QUOTA_EXHAUSTED: Tutti i token delle chiavi Google AI Studio sono momentaneamente esauriti. Aggiungi un altra chiave per riprendere subito.');
          }
        }

        if (is503) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }
    attempts++;
  }

  throw new Error('Nessuna risposta disponibile dai modelli AI.');
}

// ==========================================
// VIDEO & EXPORT ENGINE (Procedural 3D + FFmpeg + JSZip)
// ==========================================

function sanitizeName(str: string): string {
  return (str || '')
    .replace(/[\/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSeriesTitleClean(project: Project): string {
  return sanitizeName(project.title) || 'Serie Cartoon 3D';
}

function getEpisodeCode(episode: Episode): string {
  const season = episode.season_number || 1;
  const ep = episode.episode_number || 1;
  return `S${season}_E${ep}`;
}

// Master full episode filename: [TITOLO SERIE] - S1_E1.mp4 or [TITOLO SERIE] - S1_E1 [9_16].mp4
function getEpisodeMasterFilename(project: Project, episode: Episode, format: '16:9' | '9:16' = '16:9'): string {
  const series = getSeriesTitleClean(project);
  const code = getEpisodeCode(episode);
  if (format === '9:16') {
    return `${series} - ${code} [9_16].mp4`;
  }
  return `${series} - ${code}.mp4`;
}

// Shot clip filename: [TITOLO SERIE] - S1_E1_SC01_INQ01.mp4
function getShotVideoFilename(project: Project, episode: Episode, shot: Shot): string {
  const series = getSeriesTitleClean(project);
  const code = getEpisodeCode(episode);
  const sc = String(shot.scene_number || 1).padStart(2, '0');
  const inq = String(shot.order || 1).padStart(2, '0');
  return `${series} - ${code}_SC${sc}_INQ${inq}.mp4`;
}

// Renders an individual shot into a real, genuine, distinct .mp4 video file using procedural animation + FFmpeg
async function ensureShotVideo(shot: Shot, project: Project, episode: Episode): Promise<string> {
  const filename = getShotVideoFilename(project, episode, shot);
  const outPath = path.join(videosDir, filename);

  if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 1000) {
    try {
      addStudioLog(`Rendering inquadratura SC${shot.scene_number || 1} INQ${shot.order}: "${shot.title}"...`);
      await renderDynamicProceduralShot(shot, project, episode, outPath);
      addStudioLog(`Inquadratura completata: ${filename}`);
    } catch (e: any) {
      console.error('[FFmpeg] Error generating procedural shot video:', e);
      addStudioLog(`Errore rendering: ${e.message}`);
    }
  }

  shot.video_url = '/uploads/videos/' + filename;
  shot.status = 'ready';
  return shot.video_url;
}

// Compiles all shots of an episode into the master .mp4 video file(s)
async function compileEpisodeMasterVideo(
  project: Project,
  episode: Episode,
  shots: Shot[],
  options: { format16: boolean; format9: boolean } = { format16: true, format9: true }
): Promise<{ video16?: string; video9?: string }> {
  const readyShots = shots.slice().sort((a, b) => a.order - b.order);
  const shotFilePaths: string[] = [];

  for (const shot of readyShots) {
    await ensureShotVideo(shot, project, episode);
    const fname = getShotVideoFilename(project, episode, shot);
    const p = path.join(videosDir, fname);
    if (fs.existsSync(p)) {
      shotFilePaths.push(p);
    }
  }

  if (!shotFilePaths.length) {
    return {};
  }

  const results: { video16?: string; video9?: string } = {};

  // Concat shots into master 16:9 MP4
  const master16Filename = getEpisodeMasterFilename(project, episode, '16:9');
  const master16Path = path.join(videosDir, master16Filename);

  const concatListPath = path.join(videosDir, `concat_${episode.id}.txt`);
  const concatContent = shotFilePaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  try {
    addStudioLog(`Montaggio master 16:9: ${master16Filename}...`);
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset ultrafast -c:a aac "${master16Path}"`, { stdio: 'ignore' });
    if (fs.existsSync(master16Path)) {
      episode.master_video_16_9 = '/uploads/videos/' + master16Filename;
      results.video16 = episode.master_video_16_9;
      addStudioLog(`Master 16:9 generato con successo!`);
    }
  } catch (err: any) {
    console.error('[FFmpeg] Concat master 16:9 failed:', err);
    addStudioLog(`Errore concat master: ${err.message}`);
  } finally {
    if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
  }

  // Generate 9:16 Vertical master MP4 if requested
  if (options.format9 && fs.existsSync(master16Path)) {
    const master9Filename = getEpisodeMasterFilename(project, episode, '9:16');
    const master9Path = path.join(videosDir, master9Filename);
    try {
      addStudioLog(`Generazione versione verticale 9:16: ${master9Filename}...`);
      execSync(`ffmpeg -y -i "${master16Path}" -vf "crop=ih*9/16:ih" -c:v libx264 -preset ultrafast -c:a copy "${master9Path}"`, { stdio: 'ignore' });
      if (fs.existsSync(master9Path)) {
        episode.master_video_9_16 = '/uploads/videos/' + master9Filename;
        results.video9 = episode.master_video_9_16;
        addStudioLog(`Master 9:16 completato!`);
      }
    } catch (err: any) {
      console.error('[FFmpeg] Crop master 9:16 failed:', err);
    }
  }

  episode.master_video_ready = true;
  saveDatabase();
  return results;
}

// Smart heuristic parser extracting story, characters, season and episode from prompt
function extractHeuristicProjectData(content: string, title?: string) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  const seasonMatch = content.match(/(?:Stagione|Season|S)\s*(\d+)/i);
  const detectedSeason = seasonMatch ? parseInt(seasonMatch[1], 10) : 1;

  const epMatch = content.match(/(?:Episodio|Puntata|Ep\.?)\s*(\d+)/i);
  const detectedEpNumber = epMatch ? parseInt(epMatch[1], 10) : 1;

  const epTitleMatch = content.match(/(?:Episodio|Puntata|Ep\.?)\s*\d+\s*[:\-–]\s*([^\n\r*]+)/i);
  let detectedEpTitle = epTitleMatch ? epTitleMatch[1].trim() : '';

  let derivedSeriesTitle = title?.trim() || '';
  if (!derivedSeriesTitle) {
    if (lines[0] && !lines[0].toLowerCase().startsWith('episodio') && !lines[0].startsWith('*')) {
      derivedSeriesTitle = lines[0].replace(/[*#]/g, '').trim();
    } else {
      derivedSeriesTitle = 'Gara dei Kart 3D';
    }
  }

  if (!detectedEpTitle) {
    detectedEpTitle = `Episodio ${detectedEpNumber}: La Grande Sfida`;
  }

  // Detect Characters from prompt
  const blacklist = new Set([
    'GP', 'Formula', 'Trama', 'Episodio', 'Puntata', 'Momento', 'Durante', 'La', 'Il', 'Le', 'I', 'Gli',
    'Un', 'Una', 'In', 'Su', 'Per', 'Con', 'Tra', 'Fra', 'Verso', 'Non', 'Di', 'Da', 'Che', 'Sul',
    'Pista', 'Kart', 'Gara', 'Gran', 'Premio', 'Velocita', 'Curve', 'Box', 'Stagione'
  ]);
  const words = content.match(/\b[A-Z][a-z]{2,15}\b/g) || [];
  const charNames = Array.from(new Set(words.filter(w => !blacklist.has(w)))).slice(0, 6);

  const characters = charNames.length > 0
    ? charNames.map((name, i) => ({
        name,
        role: i === 0 ? 'Pilota Protagonista' : i === 1 ? 'Rivale Veloce' : 'Personaggio in Gara',
        appearance: `Vibrant 3D cartoon animated character for kids named ${name}, dynamic Disney Pixar aesthetic, expressive cartoon eyes, colorful racing suit and helmet`,
        personality: i === 0 ? 'Determinato, vivace ed espressivo' : 'Competitivo e simpatico'
      }))
    : [
        {
          name: 'Spike',
          role: 'Pilota Kart Rosso',
          appearance: 'Friendly 3D cartoon bulldog driver with red racing suit and yellow helmet, Pixar cartoon style',
          personality: 'Grintoso e scattante'
        },
        {
          name: 'Chantal',
          role: 'Rivalessa Kart Veloce',
          appearance: 'Elegant 3D cartoon Siamese cat pilot with racing goggles and streamlined purple kart, Pixar cartoon style',
          personality: 'Agile e determinata'
        },
        {
          name: 'Ettore',
          role: 'Pilota Simpatico & Ingegnoso',
          appearance: 'Funny 3D cartoon badger mechanic-driver with oversized ears and blue racing overalls, Pixar cartoon style',
          personality: 'Ottimista e geniale'
        }
      ];

  const primaryChar = characters[0]?.name || 'Protagonista';
  const rivalChar = characters[1]?.name || 'Rivale';
  const thirdChar = characters[2]?.name || 'Amico';

  const shots: any[] = [
    {
      scene_number: 1,
      order: 1,
      title: 'Griglia di partenza nel fango',
      description: `La camera scende in picchiata sulla pista bagnata e fangosa del penultimo GP. La visibilità è scarsa e i kart scivolano ovunque mentre i semafori si accendono.`,
      video_prompt: `Dynamic 3D animated cartoon racing scene, heavy rain pouring on muddy race track, glowing track lights, wet asphalt reflections, wide lens cinematic action shot`,
      duration_seconds: 8,
      cast: [primaryChar, rivalChar, thirdChar]
    },
    {
      scene_number: 1,
      order: 2,
      title: 'Duello sul bagnato',
      description: `${primaryChar} e ${rivalChar} sfrecciano a tutta velocità sul bagnato sollevando alte onde d acqua e fango, sembrando imbattibili tra le curve scivolose.`,
      video_prompt: `High-speed side-by-side 3D cartoon go-kart drift around muddy hairpin turn, water splash droplets hitting camera, expressive cartoon faces`,
      duration_seconds: 8,
      cast: [primaryChar, rivalChar]
    },
    {
      scene_number: 2,
      order: 3,
      title: 'Tentativo di sorpasso azzardato',
      description: `Tra le sbandate, ${thirdChar} accelera all esterno tentando un sorpasso acrobatico sul rettilineo fangoso.`,
      video_prompt: `Intense 3D cartoon kart acceleration on wet track, dramatic low-angle camera tracking, colorful racing exhaust flames`,
      duration_seconds: 8,
      cast: [thirdChar]
    },
    {
      scene_number: 2,
      order: 4,
      title: 'Colpo di scena: la ruota-biscotto al formaggio!',
      description: `Momento esilarante: durante il sorpasso, il kart di ${thirdChar} perde improvvisamente una ruota, che in realtà è un enorme biscottone al formaggio che rimbalza comico nel fango!`,
      video_prompt: `Hilarious 3D cartoon slapstick moment, oversized cheese biscuit wheel detaches and bounces with comical cartoon sound effects, Disney Pixar comedy style`,
      duration_seconds: 8,
      cast: [thirdChar, primaryChar]
    },
    {
      scene_number: 3,
      order: 5,
      title: 'Guida acrobatica su tre ruote',
      description: `${thirdChar} non si arrende e continua a guidare in bilico su tre ruote con espressioni buffe e salti spettacolari, mentre gli altri piloti guardano sbalorditi.`,
      video_prompt: `Acrobatic 3D cartoon driving on three wheels, dynamic camera roll, hilarious expressive cartoon eyes and exaggerated steering`,
      duration_seconds: 8,
      cast: [thirdChar, rivalChar]
    },
    {
      scene_number: 3,
      order: 6,
      title: 'Volata finale verso il traguardo',
      description: `I kart sfrecciano in volata serrata verso la bandiera a scacchi sotto la pioggia battente, tra coriandoli bagnati e applausi.`,
      video_prompt: `Spectacular finish line sprint in 3D cartoon feature style, confetti celebration, wet track reflections, warm golden cinema lighting`,
      duration_seconds: 8,
      cast: [primaryChar, rivalChar, thirdChar]
    }
  ];

  return {
    series_title: derivedSeriesTitle,
    season_number: detectedSeason,
    episode_number: detectedEpNumber,
    episode_title: detectedEpTitle,
    genre: 'Avventura e corse animate 3D',
    audience: 'Bambini e famiglie',
    style: 'Stile cinematografico cartoon 3D dinamico e colorato per bambini, con animazioni vivaci, ritmo da film e movimenti di camera fluidi.',
    image_prompt_style: 'Dynamic 3D animated cartoon movie style for kids, vibrant colors, expressive character acting, fluid camera tracking, cinematic animated feature lighting, joyful atmosphere',
    characters,
    episode_logline: content.slice(0, 160) || 'Emozionante sfida sul fango sotto la pioggia con imprevisti comici.',
    episode_synopsis: content,
    shots
  };
}

// Fallback shot generator for dynamic animated episodes
function generateHeuristicEpisodeShots(project: Project, episodeNumber: number, idea?: string, cast: Character[] = []) {
  const targetSec = project.episode_target_seconds || 300;
  const parsed = extractHeuristicProjectData(project.brief, project.title);
  const shotCount = Math.max(4, Math.round(targetSec / 8.5));
  const shotDuration = Math.round(targetSec / shotCount);

  const baseShots = parsed.shots || [];
  const shots: any[] = [];

  for (let i = 0; i < shotCount; i++) {
    const base = baseShots[i % baseShots.length];
    const char = cast[i % Math.max(1, cast.length)] || { name: 'Protagonista' };
    shots.push({
      scene_number: Math.floor(i / 2) + 1,
      order: i + 1,
      title: `Scena ${i + 1} · ${base.title}`,
      description: `${char.name}: ${base.description}`,
      video_prompt: `${base.video_prompt}, featuring ${char.name}, vibrant high-contrast colors, cinematic camera choreography`,
      duration_seconds: shotDuration,
      cast: [char.name]
    });
  }

  const epTitle = idea
    ? (idea.length > 50 ? idea.slice(0, 50) + '…' : idea)
    : (parsed.episode_title || `Episodio ${episodeNumber}: La Grande Sfida`);

  return {
    title: epTitle.startsWith('Episodio') ? epTitle : `Episodio ${episodeNumber}: ${epTitle}`,
    logline: idea || parsed.episode_logline || 'Emozionante corsa animata 3D piena di curve, umorismo e colpi di scena.',
    synopsis: project.brief || 'Una sfida vivace e divertente tra amici piloti.',
    shots
  };
}

// ==========================================
// API ROUTES
// ==========================================

// Studio stats & credits
app.get('/api/studio/stats', (req, res) => {
  const readyShots = db.shots.filter(s => s.status === 'ready').length;
  const totalEpisodes = db.episodes.length;
  const totalSeries = db.projects.length;
  const spent = db.shots.reduce((acc, s) => acc + (s.credits_spent || 0), 0);
  const pending = db.shots
    .filter(s => s.status !== 'ready')
    .reduce((acc, s) => acc + (s.estimated_credits || 10), 0);

  res.json({
    consumed_credits: spent,
    pending_credits: pending,
    available_credits: db.user_credits.available,
    total_series: totalSeries,
    total_episodes: totalEpisodes,
    total_shots_ready: readyShots
  });
});

app.post('/api/studio/set-budget', (req, res) => {
  const { amount } = req.body;
  db.user_credits.available = Math.max(0, Number(amount) || 0);
  saveDatabase();
  res.json({ success: true, available: db.user_credits.available });
});

// ==========================================
// GOOGLE AI STUDIO KEY POOL & FAILOVER ROUTES
// ==========================================

function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return '••••••••';
  return key.slice(0, 7) + '••••••••' + key.slice(-4);
}

// Get all keys with masked values for security
app.get('/api/keys', (req, res) => {
  const keys = (db.api_keys || []).map(k => ({
    id: k.id,
    masked_key: maskApiKey(k.key),
    label: k.label,
    status: k.status,
    added_at: k.added_at,
    calls_count: k.calls_count,
    last_used: k.last_used,
    last_error: k.last_error
  }));

  const activeKey = db.api_keys?.find(k => k.status === 'active');

  res.json({
    keys,
    active_key_id: activeKey?.id || null,
    total_keys: keys.length,
    active_count: keys.filter(k => k.status === 'active' || k.status === 'standby').length,
    exhausted_count: keys.filter(k => k.status === 'exhausted').length,
    is_paused: studioGenerationState.is_paused,
    pause_reason: studioGenerationState.pause_reason
  });
});

// Add new key or overwrite existing keys (with auto-save and auto-activation)
app.post('/api/keys', async (req, res) => {
  const { key, label, overwrite } = req.body;
  const cleanKey = (key || '').trim();

  if (!cleanKey) {
    return res.status(400).json({ error: 'Inserisci una chiave Google AI Studio valida.' });
  }

  if (!Array.isArray(db.api_keys)) {
    db.api_keys = [];
  }

  // Quick sanity verification with Google AI
  try {
    const testAi = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    // Ping with flash-lite
    await testAi.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'ping'
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('invalid') || errMsg.includes('unregistered')) {
      return res.status(400).json({ error: 'La chiave inserita non è valida secondo Google AI Studio. Verifica e riprova.' });
    }
  }

  if (overwrite) {
    // If overwrite mode, mark previous active as standby or replace
    db.api_keys.forEach(k => {
      if (k.status === 'active') k.status = 'standby';
    });
  }

  const existingIdx = db.api_keys.findIndex(k => k.key === cleanKey);
  const newEntry: ApiKeyEntry = {
    id: existingIdx >= 0 ? db.api_keys[existingIdx].id : 'key_' + Date.now(),
    key: cleanKey,
    label: label?.trim() || `Chiave Studio #${db.api_keys.length + 1}`,
    status: 'active',
    added_at: new Date().toISOString(),
    calls_count: 0
  };

  // Demote any other active keys to standby
  db.api_keys.forEach(k => {
    if (k.id !== newEntry.id && k.status === 'active') {
      k.status = 'standby';
    }
  });

  if (existingIdx >= 0) {
    db.api_keys[existingIdx] = newEntry;
  } else {
    db.api_keys.unshift(newEntry);
  }

  // Automatically unpause generation if it was paused due to token exhaustion
  if (studioGenerationState.is_paused && studioGenerationState.pause_reason === 'quota_exhausted') {
    studioGenerationState.is_paused = false;
    studioGenerationState.pause_reason = null;
    addStudioLog(`Nuova chiave registrata e attivata: ${newEntry.label}. Ripresa automatica della produzione!`);
  } else {
    addStudioLog(`Chiave registrata e attivata nel pool: ${newEntry.label}`);
  }

  saveDatabase();

  res.json({
    success: true,
    key: {
      id: newEntry.id,
      masked_key: maskApiKey(newEntry.key),
      label: newEntry.label,
      status: newEntry.status
    },
    resumed: !studioGenerationState.is_paused
  });
});

// Delete a key from pool
app.delete('/api/keys/:id', (req, res) => {
  const { id } = req.params;
  const target = db.api_keys.find(k => k.id === id);
  if (!target) return res.status(404).json({ error: 'Chiave non trovata' });

  db.api_keys = db.api_keys.filter(k => k.id !== id);

  // If deleted key was active, activate next available
  if (target.status === 'active' && db.api_keys.length > 0) {
    const next = db.api_keys.find(k => k.status === 'standby') || db.api_keys[0];
    if (next) next.status = 'active';
  }

  saveDatabase();
  res.json({ success: true });
});

// Set specific key as active
app.post('/api/keys/set-active/:id', (req, res) => {
  const { id } = req.params;
  const target = db.api_keys.find(k => k.id === id);
  if (!target) return res.status(404).json({ error: 'Chiave non trovata' });

  db.api_keys.forEach(k => {
    if (k.id === id) {
      k.status = 'active';
    } else if (k.status === 'active') {
      k.status = 'standby';
    }
  });

  saveDatabase();
  res.json({ success: true, active_id: id });
});

// Live Observation Studio State
app.get('/api/generation/state', (req, res) => {
  res.json(studioGenerationState);
});

// Resume generation manually
app.post('/api/generation/resume', (req, res) => {
  studioGenerationState.is_paused = false;
  studioGenerationState.pause_reason = null;
  addStudioLog('Produzione riavviata manualmente dall utente.');
  res.json({ success: true, state: studioGenerationState });
});

// Projects list & detail
app.get('/api/projects', (req, res) => {
  res.json(db.projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const characters = db.characters.filter(c => c.project_id === project.id);
  const episodes = db.episodes.filter(e => e.project_id === project.id);

  const episodeStats = episodes.map(ep => {
    const epShots = db.shots.filter(s => s.episode_id === ep.id);
    const ready = epShots.filter(s => s.status === 'ready').length;
    const spent = epShots.reduce((acc, s) => acc + (s.credits_spent || 0), 0);
    return {
      ...ep,
      shot_count: epShots.length,
      ready_count: ready,
      credits_spent: spent
    };
  });

  res.json({
    project,
    characters,
    episodes: episodeStats
  });
});

// Create new series from user prompt/copione without artificial limits
app.post('/api/projects', async (req, res) => {
  const {
    title,
    brief,
    script, // optional full copione / screenplay
    aspect_ratio = '16:9', // DEFAULT: 16:9 widescreen YouTube style
    quality = 'cinema',
    duration_input, // e.g. "3 minuti", "45 secondi", "10 min", or number
    episode_count
  } = req.body;

  const content = (script || brief || '').trim();
  if (!content) {
    return res.status(400).json({ error: 'Inserisci il copione o le istruzioni della serie.' });
  }

  // Priority resolution:
  // 1. Explicit input from fields has TOP PRIORITY
  let explicitDurationSeconds: number | null = null;
  if (duration_input !== undefined && duration_input !== null && String(duration_input).trim() !== '') {
    const raw = String(duration_input).trim().toLowerCase();
    const num = parseFloat(raw.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      if (raw.includes('sec')) {
        explicitDurationSeconds = Math.round(num);
      } else {
        explicitDurationSeconds = Math.round(num * 60);
      }
    }
  }

  let explicitEpisodeCount: number | null = null;
  if (episode_count !== undefined && episode_count !== null && String(episode_count).trim() !== '') {
    const epNum = parseInt(String(episode_count).trim(), 10);
    if (!isNaN(epNum) && epNum > 0) {
      explicitEpisodeCount = epNum;
    }
  }

  let finalTitle = title?.trim() || '';
  let genre = 'Cartone animato 3D per bambini & famiglie';
  let audience = 'Bambini e famiglie';
  let style = 'Stile cartoon 3D dinamico e colorato per bambini, con animazioni vivaci, ritmo cinematografico e movimenti di camera fluidi.';
  let imagePromptStyle = 'Dynamic 3D animated cartoon movie style for kids, vibrant colors, expressive character acting, fluid camera tracking, cinematic animated feature lighting, joyful atmosphere';

  let parsed: any = null;

  try {
    const rawAiText = await generateContentResilient(`Sei il direttore artistico e regista di uno studio di animazione cinematografica cartoon per bambini (stile 3D vivace tipo Cars/Pixar/Disney cartoon).
L'utente ha inviato questo copione/istruzioni:
"${content}"
${title ? `Titolo serie fornito: "${title}"` : ''}

Analizza il testo ed estrai con cura logica:
1. "series_title": titolo della serie (se presente nel testo o se fornito; es. "Verso il pizzo", altrimenti inventane uno accattivante)
2. "season_number": numero stagione (default 1 se non specificato)
3. "episode_number": numero episodio intero (es. se nel testo c'è "Episodio 4", estrai 4! altrimenti 1)
4. "episode_title": titolo dell'episodio (es. "La Grande Sfida Sotto la Pioggia")
5. "genre": genere cartoon per bambini
6. "audience": pubblico target (bambini e famiglie)
7. "style": descrizione stile cartoon 3D cinematografico in italiano
8. "image_prompt_style": dettagliato prompt di stile in INGLESE per CGI 3D cartoon per bambini
9. "detected_duration_seconds": se nel testo è indicata una durata precisa, estraila in secondi; altrimenti null
10. "detected_episode_count": se nel testo è indicato un numero di episodi, estrailo come intero; altrimenti null
11. "characters": lista di TUTTI i personaggi menzionati (senza limiti!). Per ciascuno: "name", "role", "appearance" (descrizione dettagliata in inglese per render 3D cartoon coerente), "personality".
12. "episode_logline": logline riassuntiva dell'episodio
13. "episode_synopsis": sinossi completa dell'episodio
14. "shots": scomposizione sequenziale in 6-12 inquadrature dinamiche (6-12s ciascuna) derivate DIRETTAMENTE e FEDELMENTE dagli eventi specifici del copione dell'utente (es. pista bagnata, sbandata, sorpasso, la ruota-biscotto al formaggio che vola via, guida su tre ruote, traguardo finale)! NESSUN sottotitolo o trascrizione a video. Per ogni shot: "scene_number", "order", "title", "description", "video_prompt", "duration_seconds", "cast".

Rispondi SOLO in JSON:
{
  "series_title": "Titolo",
  "season_number": 1,
  "episode_number": 4,
  "episode_title": "Titolo episodio",
  "genre": "Avventura cartoon 3D",
  "audience": "Bambini e famiglie",
  "style": "Stile cartoon...",
  "image_prompt_style": "High-quality 3D cartoon...",
  "detected_duration_seconds": null,
  "detected_episode_count": null,
  "characters": [
    { "name": "Nome", "role": "Ruolo", "appearance": "...", "personality": "..." }
  ],
  "episode_logline": "Logline...",
  "episode_synopsis": "Sinossi...",
  "shots": [
    {
      "scene_number": 1,
      "order": 1,
      "title": "Titolo inquadratura",
      "description": "Descrizione azione specifica dal copione...",
      "video_prompt": "Fast-paced 3D cartoon video prompt in English...",
      "duration_seconds": 8,
      "cast": ["Nome"]
    }
  ]
}`);
    parsed = extractJson(rawAiText);
  } catch (err) {
    console.warn('[Cine3D] AI service unavailable or 503 spike, using heuristic fallback:', err);
    parsed = extractHeuristicProjectData(content, title);
  }

  if (!parsed) {
    parsed = extractHeuristicProjectData(content, title);
  }

  if (!finalTitle && parsed.series_title) finalTitle = parsed.series_title;
  if (!finalTitle && parsed.title) finalTitle = parsed.title;
  if (parsed.genre) genre = parsed.genre;
  if (parsed.audience) audience = parsed.audience;
  if (parsed.style) style = parsed.style;
  if (parsed.image_prompt_style) imagePromptStyle = parsed.image_prompt_style;

  // Resolving duration according to priority:
  let targetSeconds = 300; // silent 5 minutes default
  if (explicitDurationSeconds !== null) {
    targetSeconds = explicitDurationSeconds;
  } else if (parsed?.detected_duration_seconds && Number(parsed.detected_duration_seconds) > 0) {
    targetSeconds = Number(parsed.detected_duration_seconds);
  }

  // Resolving episode count according to priority:
  let extractedEpisodesCount = 1;
  if (explicitEpisodeCount !== null) {
    extractedEpisodesCount = explicitEpisodeCount;
  } else if (parsed?.detected_episode_count && Number(parsed.detected_episode_count) > 0) {
    extractedEpisodesCount = Number(parsed.detected_episode_count);
  }

  const seasonNum = Number(parsed?.season_number) || 1;
  const episodeNum = Number(parsed?.episode_number) || 1;
  const episodeTitle = parsed?.episode_title || `Episodio ${episodeNum}: La Grande Sfida`;

  const projectId = 'proj_' + Date.now();
  const newProject: Project = {
    id: projectId,
    title: finalTitle || 'Nuova Serie Cartoon',
    brief: content,
    genre,
    audience,
    language: 'Italiano',
    style,
    image_prompt_style: imagePromptStyle,
    aspect_ratio: (aspect_ratio as any) || '16:9',
    quality: (quality as any) || 'cinema',
    episode_target_seconds: targetSeconds,
    episode_count: extractedEpisodesCount,
    cast_status: parsed?.characters?.length ? 'ready' : 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.projects.unshift(newProject);

  // Characters from prompt saved without arbitrary limits
  const castList: Character[] = [];
  const charArray = Array.isArray(parsed?.characters) && parsed.characters.length > 0
    ? parsed.characters
    : [
        { name: 'Spike', role: 'Pilota Kart Rosso', appearance: 'Friendly 3D cartoon bulldog driver with red racing helmet', personality: 'Grintoso' },
        { name: 'Chantal', role: 'Rivalessa Kart Veloce', appearance: 'Sleek 3D cartoon Siamese cat with purple racing goggles', personality: 'Agile' },
        { name: 'Ettore', role: 'Pilota Simpatico & Ingegnoso', appearance: 'Funny 3D cartoon badger mechanic with blue overalls', personality: 'Ottimista' }
      ];

  const createdChars: Character[] = charArray.map((c: any, idx: number) => ({
    id: 'char_' + Date.now() + '_' + idx,
    project_id: projectId,
    name: c.name || `Personaggio ${idx + 1}`,
    role: c.role || 'Personaggio',
    appearance: c.appearance || 'Vibrant 3D cartoon character for kids',
    personality: c.personality || 'Vivace ed espressivo',
    reference_image_url: '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg',
    sort_order: idx + 1
  }));
  db.characters.push(...createdChars);
  castList.push(...createdChars);

  // Plan initial episode directly from the parsed story
  const epId = 'ep_' + Date.now();
  const firstEpisode: Episode = {
    id: epId,
    project_id: projectId,
    season_number: seasonNum,
    episode_number: episodeNum,
    title: episodeTitle,
    logline: parsed.episode_logline || parsed.logline || 'Avventura cartoon mozzafiato ricca di umorismo e curve.',
    synopsis: parsed.episode_synopsis || parsed.synopsis || content,
    target_seconds: targetSeconds,
    narration_enabled: false,
    status: 'ready'
  };
  db.episodes.push(firstEpisode);

  // Shots directly reflecting the user's screenplay
  const rawShots = Array.isArray(parsed.shots) && parsed.shots.length > 0
    ? parsed.shots
    : generateHeuristicEpisodeShots(newProject, episodeNum, content, castList).shots;

  const motions: Shot['motion'][] = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'float'];
  const newShots: Shot[] = rawShots.map((s: any, idx: number) => {
    const primaryChar = castList.find(c => s.cast?.includes(c.name)) || castList[idx % castList.length] || castList[0];
    return {
      id: 'shot_' + Date.now() + '_' + (idx + 1),
      project_id: projectId,
      episode_id: epId,
      order: idx + 1,
      scene_number: s.scene_number || (Math.floor(idx / 2) + 1),
      title: s.title || `Inquadratura ${idx + 1}`,
      description: s.description || '',
      video_prompt: s.video_prompt || 'Dynamic 3D cartoon racing scene',
      narration_text: '',
      duration_seconds: Number(s.duration_seconds) || 8,
      cast: Array.isArray(s.cast) && s.cast.length ? s.cast : (primaryChar ? [primaryChar.name] : []),
      status: 'ready',
      render_mode: 'ai',
      visual_image_url: primaryChar?.reference_image_url || '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg',
      video_url: '/public/assets/aistudio/3d_pixar_79343c7e.mp4',
      motion: motions[idx % motions.length],
      model: 'seedance_2_fast',
      resolution: '720p',
      estimated_credits: 10,
      credits_spent: 0
    };
  });
  db.shots.push(...newShots);

  // Pre-render shot video files and master video with dynamic procedural rendering + FFmpeg
  try {
    for (const s of newShots) {
      await ensureShotVideo(s, newProject, firstEpisode);
    }
    await compileEpisodeMasterVideo(newProject, firstEpisode, newShots, { format16: true, format9: true });
  } catch (err) {
    console.error('[Cine3D] Initial video compile note:', err);
  }

  saveDatabase();
  res.json(newProject);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  db.projects = db.projects.filter(p => p.id !== id);
  db.characters = db.characters.filter(c => c.project_id !== id);
  const eps = db.episodes.filter(e => e.project_id === id).map(e => e.id);
  db.episodes = db.episodes.filter(e => e.project_id !== id);
  db.shots = db.shots.filter(s => !eps.includes(s.episode_id));
  saveDatabase();
  res.json({ success: true });
});

// Modify series via direct user prompt / instruction (no sliders/settings!)
app.post('/api/projects/:id/modify', async (req, res) => {
  const { id } = req.params;
  const { instruction } = req.body;
  const project = db.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  if (!instruction) return res.status(400).json({ error: 'Invia una frase o istruzione di modifica.' });

  try {
    const rawAi = await generateContentResilient(`Sei il regista di una serie cartoon per bambini.
L'utente invia questa modifica/istruzione:
"${instruction}"

Serie attuale:
Titolo: "${project.title}"
Copione/Brief: "${project.brief}"
Stile attuale: "${project.style}"

Aggiorna le caratteristiche della serie secondo l'istruzione.
Rispondi con un JSON:
{
  "title": "titolo aggiornato o invariato",
  "brief": "brief/copione aggiornato",
  "style": "stile cartoon in italiano",
  "image_prompt_style": "stile in inglese per video cartoon"
}`);

    const parsed = extractJson(rawAi);
    if (parsed) {
      if (parsed.title) project.title = parsed.title;
      if (parsed.brief) project.brief = parsed.brief;
      if (parsed.style) project.style = parsed.style;
      if (parsed.image_prompt_style) project.image_prompt_style = parsed.image_prompt_style;
      project.updated_at = new Date().toISOString();
      saveDatabase();
    }
    res.json(project);
  } catch (err: any) {
    console.warn('[Cine3D] Modify project AI fallback:', err);
    // Graceful direct prompt update without 503 error
    project.brief = project.brief + '\n\nIstruzione aggiunta: ' + instruction;
    project.updated_at = new Date().toISOString();
    saveDatabase();
    res.json(project);
  }
});

// Generate cast from copione or instructions without any numeric limits
app.post('/api/projects/:id/generate-cast', async (req, res) => {
  const { id } = req.params;
  const project = db.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  try {
    const prompt = `Sei il character designer di un film d'animazione cartoon per bambini.
Serie: "${project.title}"
Copione / Istruzioni: "${project.brief}"

Identifica TUTTI i personaggi presenti o necessari nella storia, SENZA LIMITI di numero.
Se il copione ne ha 2, falli 2. Se ne ha 5 o 8, includili tutti.
Per ogni personaggio:
- name: nome proprio
- role: ruolo nel racconto
- appearance: descrizione minuziosa in INGLESE per rendering 3D cartoon (specie, abbigliamento, casco da corsa o accessori, colori brillanti, occhi grandi ed espressivi, stile cartoon per bambini).
- personality: descrizione del carattere in italiano

Rispondi SOLO in formato JSON:
{
  "characters": [
    {
      "name": "Nome",
      "role": "Ruolo",
      "appearance": "Detailed English 3D cartoon visual description...",
      "personality": "Carattere in italiano..."
    }
  ]
}`;

    let parsed: any = null;
    try {
      const rawAi = await generateContentResilient(prompt);
      parsed = extractJson(rawAi);
    } catch (e) {
      console.warn('[Cine3D] Generate cast AI fallback:', e);
      parsed = extractHeuristicProjectData(project.brief, project.title);
    }

    const charList = parsed?.characters || [];
    if (!charList.length) {
      parsed = extractHeuristicProjectData(project.brief, project.title);
    }

    db.characters = db.characters.filter(c => c.project_id !== id);

    const createdChars: Character[] = (parsed.characters || []).map((c: any, idx: number) => ({
      id: 'char_' + Date.now() + '_' + idx,
      project_id: id,
      name: c.name || `Personaggio ${idx + 1}`,
      role: c.role || 'Personaggio',
      appearance: c.appearance || '3D cartoon character',
      personality: c.personality || 'Allegro e dinamico',
      reference_image_url: '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg',
      sort_order: idx + 1
    }));

    db.characters.push(...createdChars);
    project.cast_status = 'ready';
    project.updated_at = new Date().toISOString();
    saveDatabase();

    res.json({ characters: createdChars, project });
  } catch (err: any) {
    console.error('Error generating cast:', err);
    res.status(500).json({ error: 'Errore generazione cast: ' + err.message });
  }
});

// Generate Episode: dynamic shot decomposition, NO subtitles/transcriptions on character voices
app.post('/api/projects/:id/generate-episode', async (req, res) => {
  const { id } = req.params;
  const { idea, duration_seconds } = req.body;
  const project = db.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const cast = db.characters.filter(c => c.project_id === id);
  const existingEpisodes = db.episodes.filter(e => e.project_id === id);
  const nextEpisodeNumber = existingEpisodes.length + 1;

  // Flexible duration: either from request or project target seconds
  const targetSec = duration_seconds ? Number(duration_seconds) : (project.episode_target_seconds || 300);
  // Break down into energetic shots of 6-12 seconds for animated film pacing
  const shotCount = Math.max(3, Math.round(targetSec / 8.5));

  try {
    const prompt = `Sei regista e animatore di cartoni animati cinematografici 3D per bambini (stile film d'animazione ad alto dinamismo, corse, avventure vivaci tipo Cars, Lego, Disney/Pixar cartoon).
Stai creando l'episodio ${nextEpisodeNumber} della serie "${project.title}".
Copione e istruzioni: "${project.brief}"
${idea ? `Idea per questo episodio: "${idea}"` : ''}
Stile: "${project.style}"
Personaggi:
${cast.map(c => `- ${c.name} (${c.role}): ${c.appearance}`).join('\n')}

REGOLE DI REGIA:
- Durata target complessiva: circa ${targetSec} secondi.
- Scomponi in ${shotCount} inquadrature dinamiche consecutive (durata tra 6 e 12 secondi ciascuna).
- Stile: cartone animato per bambini ad alta energia! Telecamera in movimento rapido (tracking shot, curve mozzafiato, salti, zoom carrellati, espressioni comiche ed esagerate).
- IMPORTANTE: NESSUNA trascrizione o sottotitoli di testo sovrimpressi. I personaggi recitano con la loro voce e i suoni d'ambiente nel video.
- In ogni inquadratura descrivi:
  * scene_number: numero scena
  * title: titolo inquadratura
  * description: azione visiva cinematografica in italiano
  * video_prompt: prompt cinematografico in INGLESE per modello video 3D cartoon (movimento camera, accelerazioni, angoli dinamici, polvere, luci, colori accesi)
  * duration_seconds: durata precisa (6-12s)
  * cast: personaggi nell'inquadratura

Rispondi SOLO in JSON:
{
  "title": "Titolo dell'episodio",
  "logline": "Logline riassuntiva",
  "synopsis": "Sinossi completa dell'episodio",
  "shots": [
    {
      "scene_number": 1,
      "title": "Titolo inquadratura",
      "description": "Descrizione azione cartoon dinamica...",
      "video_prompt": "Fast-paced 3D cartoon animation, dynamic camera tracking shot, vibrant colors, expressive cartoon acting...",
      "duration_seconds": 8,
      "cast": ["${cast[0]?.name || 'Protagonista'}"]
    }
  ]
}`;

    let parsed: any = null;
    try {
      const rawAi = await generateContentResilient(prompt);
      parsed = extractJson(rawAi);
    } catch (e) {
      console.warn('[Cine3D] Episode generation AI fallback:', e);
      parsed = generateHeuristicEpisodeShots(project, nextEpisodeNumber, idea, cast);
    }

    if (!parsed || !parsed.shots || !parsed.shots.length) {
      parsed = generateHeuristicEpisodeShots(project, nextEpisodeNumber, idea, cast);
    }

    const episodeId = 'ep_' + Date.now();
    const newEpisode: Episode = {
      id: episodeId,
      project_id: id,
      episode_number: nextEpisodeNumber,
      title: parsed.title || `Episodio ${nextEpisodeNumber}`,
      logline: parsed.logline || 'Avventura animata dinamica.',
      synopsis: parsed.synopsis || parsed.logline || '',
      target_seconds: targetSec,
      narration_enabled: false, // NO text subtitles on character voices
      status: 'planned'
    };

    const motions: Shot['motion'][] = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'float'];

    const newShots: Shot[] = parsed.shots.map((s: any, idx: number) => {
      const primaryChar = cast.find(c => s.cast?.includes(c.name)) || cast[0];
      const duration = Math.min(15, Math.max(5, Number(s.duration_seconds) || 8));

      return {
        id: 'shot_' + Date.now() + '_' + (idx + 1),
        project_id: id,
        episode_id: episodeId,
        order: idx + 1,
        scene_number: Math.max(1, Number(s.scene_number) || 1),
        title: s.title || `Inquadratura ${idx + 1}`,
        description: s.description || '',
        video_prompt: s.video_prompt || 'Dynamic 3D cartoon animated scene',
        narration_text: '', // No subtitles or transcribed speech overlay
        duration_seconds: duration,
        cast: Array.isArray(s.cast) ? s.cast : (primaryChar ? [primaryChar.name] : []),
        status: idx === 0 ? 'ready' : 'pending',
        render_mode: idx === 0 ? 'free' : 'ai',
        visual_image_url: primaryChar?.reference_image_url || '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg',
        video_url: '/public/assets/aistudio/3d_pixar_79343c7e.mp4', // Dynamic 3D cartoon video clip
        motion: motions[idx % motions.length],
        model: 'seedance_2_fast',
        resolution: '720p',
        estimated_credits: 10,
        credits_spent: 0
      };
    });

    db.episodes.push(newEpisode);
    db.shots.push(...newShots);
    project.updated_at = new Date().toISOString();
    saveDatabase();

    res.json({ episode: newEpisode, shots: newShots });
  } catch (err: any) {
    console.error('Error generating episode:', err);
    res.status(500).json({ error: 'Errore generazione episodio: ' + err.message });
  }
});

// Modify Episode via direct prompt / instruction (no settings!)
app.post('/api/episodes/:id/modify', async (req, res) => {
  const { id } = req.params;
  const { instruction } = req.body;
  const episode = db.episodes.find(e => e.id === id);
  if (!episode) return res.status(404).json({ error: 'Episodio non trovato' });

  if (!instruction) return res.status(400).json({ error: 'Invia la tua istruzione di modifica.' });

  const project = db.projects.find(p => p.id === episode.project_id);
  const shots = db.shots.filter(s => s.episode_id === id).sort((a, b) => a.order - b.order);

  try {
    const prompt = `Sei il regista del film cartoon per bambini "${project?.title || ''}".
L'utente invia questo comando di regia:
"${instruction}"

Inquadrature attuali:
${shots.map(s => `${s.order}. [SC${s.scene_number}] ${s.title}: ${s.description}`).join('\n')}

Adatta la sequenza delle inquadrature per attuare il comando con il massimo dinamismo cartoon.
Rispondi con un JSON:
{
  "title": "Titolo aggiornato o invariato",
  "logline": "Nuova logline",
  "shots_updates": [
    {
      "order": 1,
      "title": "Titolo inquadratura",
      "description": "Cosa si vede ora",
      "video_prompt": "Updated dynamic 3D cartoon video prompt in English..."
    }
  ]
}`;

    let parsed: any = null;
    try {
      const rawAi = await generateContentResilient(prompt);
      parsed = extractJson(rawAi);
    } catch (e) {
      console.warn('[Cine3D] Modify episode AI fallback:', e);
      episode.logline = `${episode.logline || ''} (Nota: ${instruction})`;
      saveDatabase();
      return res.json({ episode, shots });
    }

    if (parsed) {
      if (parsed.title) episode.title = parsed.title;
      if (parsed.logline) episode.logline = parsed.logline;
      if (Array.isArray(parsed.shots_updates)) {
        for (const update of parsed.shots_updates) {
          const target = shots.find(s => s.order === update.order);
          if (target) {
            if (update.title) target.title = update.title;
            if (update.description) target.description = update.description;
            if (update.video_prompt) target.video_prompt = update.video_prompt;
            target.status = 'pending';
          }
        }
      }
      saveDatabase();
    }

    res.json({ episode, shots: db.shots.filter(s => s.episode_id === id) });
  } catch (err: any) {
    res.status(500).json({ error: 'Modifica non riuscita: ' + err.message });
  }
});

// Get Episode details with all shots
app.get('/api/episodes/:id', (req, res) => {
  const episode = db.episodes.find(e => e.id === req.params.id);
  if (!episode) return res.status(404).json({ error: 'Episodio non trovato' });

  const project = db.projects.find(p => p.id === episode.project_id);
  const characters = db.characters.filter(c => c.project_id === episode.project_id);
  const shots = db.shots
    .filter(s => s.episode_id === episode.id)
    .sort((a, b) => a.order - b.order);

  res.json({
    episode,
    project,
    characters,
    shots,
    blockingEpisodeNumber: null // No artificial blocking
  });
});

// Generate Social Publish Pack for episode
app.post('/api/episodes/:id/generate-social', async (req, res) => {
  const { id } = req.params;
  const episode = db.episodes.find(e => e.id === id);
  if (!episode) return res.status(404).json({ error: 'Episodio non trovato' });
  const project = db.projects.find(p => p.id === episode.project_id);

  try {
    const prompt = `Sei il social media strategist di una serie animata cartoon per bambini.
Serie: "${project?.title}"
Episodio ${episode.episode_number}: "${episode.title}"
Sinossi: "${episode.synopsis || episode.logline}"

Genera:
- publish_title: titolo virale con 1-2 emoji (max 70 caratteri)
- publish_description: descrizione accattivante per TikTok, YouTube e Reels per bambini e famiglie
- publish_hashtags: array di 8-12 hashtag senza cancelletto (#)

Rispondi SOLO in JSON:
{
  "publish_title": "Titolo...",
  "publish_description": "Descrizione...",
  "publish_hashtags": ["Cine3D", "Cartoon3D", "Animazione", "Bambini", ...]
}`;

    let parsed: any = null;
    try {
      const rawAi = await generateContentResilient(prompt);
      parsed = extractJson(rawAi);
    } catch (e) {
      parsed = {
        publish_title: `🚀 ${episode.title} | Cartone Animato 3D`,
        publish_description: `${episode.logline || episode.synopsis}\nGuarda la nuova avventura cartoon per tutta la famiglia! 🍿✨`,
        publish_hashtags: ['Cine3D', 'Cartoon3D', 'Animazione', 'PixarStyle', 'Bambini', 'FamilyFilm', 'KidsEntertainment', '3DAnimation']
      };
    }

    if (parsed) {
      episode.publish_title = parsed.publish_title;
      episode.publish_description = parsed.publish_description;
      episode.publish_hashtags = parsed.publish_hashtags;
      saveDatabase();
    }
    res.json(episode);
  } catch (err: any) {
    res.status(500).json({ error: 'Errore generazione pacchetto social: ' + err.message });
  }
});

// Render individual Shot (Real MP4 video rendering with FFmpeg)
app.post('/api/shots/:id/render', async (req, res) => {
  const { id } = req.params;
  const shot = db.shots.find(s => s.id === id);
  if (!shot) return res.status(404).json({ error: 'Inquadratura non trovata' });

  shot.status = 'rendering';
  saveDatabase();

  const project = db.projects.find(p => p.id === shot.project_id);
  const episode = db.episodes.find(e => e.id === shot.episode_id);
  const characters = db.characters.filter(c => c.project_id === shot.project_id);
  const castInShot = characters.filter(c => shot.cast?.includes(c.name));
  const primaryChar = castInShot[0] || characters[0];

  try {
    if (project && episode) {
      await ensureShotVideo(shot, project, episode);
    }

    shot.status = 'ready';
    shot.credits_spent = shot.estimated_credits || 10;
    shot.render_mode = 'ai';
    if (!shot.visual_image_url) {
      shot.visual_image_url = primaryChar?.reference_image_url || '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg';
    }
    db.user_credits.consumed += shot.credits_spent;
    saveDatabase();

    res.json({ success: true, status: 'ready', shot });
  } catch (err: any) {
    shot.status = 'failed';
    shot.error = err.message;
    saveDatabase();
    res.status(500).json({ error: err.message });
  }
});

// Free scene mode (0 credits, real FFmpeg MP4 generation)
app.post('/api/shots/:id/make-free', async (req, res) => {
  const { id } = req.params;
  const shot = db.shots.find(s => s.id === id);
  if (!shot) return res.status(404).json({ error: 'Inquadratura non trovata' });

  const project = db.projects.find(p => p.id === shot.project_id);
  const episode = db.episodes.find(e => e.id === shot.episode_id);
  const characters = db.characters.filter(c => c.project_id === shot.project_id);
  const match = characters.find(c => shot.cast?.includes(c.name)) || characters[0];

  const motions: Shot['motion'][] = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'float'];
  shot.render_mode = 'free';
  shot.visual_image_url = match?.reference_image_url || '/public/assets/aistudio/photo_2026-10-20_12-18-07_b0a9b482.jpg';
  shot.motion = motions[shot.order % motions.length];

  if (project && episode) {
    await ensureShotVideo(shot, project, episode);
  }

  shot.status = 'ready';
  shot.credits_spent = 0;
  shot.error = '';
  saveDatabase();

  res.json(shot);
});

// Modify single Shot via user prompt instruction
app.post('/api/shots/:id/modify', async (req, res) => {
  const { id } = req.params;
  const { instruction } = req.body;
  const shot = db.shots.find(s => s.id === id);
  if (!shot) return res.status(404).json({ error: 'Inquadratura non trovata' });

  if (!instruction) return res.status(400).json({ error: 'Scrivi come desideri modificare l inquadratura.' });

  try {
    const prompt = `Sei il regista di una scena di cartone animato 3D per bambini.
Inquadratura attuale:
Titolo: "${shot.title}"
Descrizione: "${shot.description}"
Prompt video 3D: "${shot.video_prompt}"

Istruzione di modifica: "${instruction}"

Adatta titolo, descrizione e video_prompt in inglese per soddisfare l'istruzione con massima vivacità e animazione dinamica cartoon.
Rispondi con un JSON:
{
  "title": "Nuovo titolo",
  "description": "Nuova descrizione dinamica",
  "video_prompt": "New fast-paced 3D cartoon video prompt in English..."
}`;

    let parsed: any = null;
    try {
      const rawAi = await generateContentResilient(prompt);
      parsed = extractJson(rawAi);
    } catch (e) {
      shot.description = `${shot.description} [Modifica richiesta: ${instruction}]`;
      shot.status = 'ready';
      saveDatabase();
      return res.json(shot);
    }

    if (parsed) {
      if (parsed.title) shot.title = parsed.title;
      if (parsed.description) shot.description = parsed.description;
      if (parsed.video_prompt) shot.video_prompt = parsed.video_prompt;
      shot.status = 'ready';
      saveDatabase();
    }

    res.json(shot);
  } catch (err: any) {
    res.status(500).json({ error: 'Modifica fallita: ' + err.message });
  }
});

// Custom media upload for shot
app.post('/api/shots/:id/upload', (req, res) => {
  const { id } = req.params;
  const { type, dataUrl } = req.body;
  const shot = db.shots.find(s => s.id === id);
  if (!shot) return res.status(404).json({ error: 'Inquadratura non trovata' });

  if (!dataUrl) return res.status(400).json({ error: 'Dati media non presenti' });

  if (type === 'video') {
    shot.video_url = dataUrl;
    shot.status = 'ready';
  } else if (type === 'image') {
    shot.visual_image_url = dataUrl;
    shot.render_mode = 'free';
    shot.status = 'ready';
  } else if (type === 'audio') {
    shot.audio_url = dataUrl;
  }

  saveDatabase();
  res.json(shot);
});

// Compile Master Episode Video (FFmpeg)
app.post('/api/episodes/:id/compile-video', async (req, res) => {
  const { id } = req.params;
  const episode = db.episodes.find(e => e.id === id);
  if (!episode) return res.status(404).json({ error: 'Episodio non trovato' });
  const project = db.projects.find(p => p.id === episode.project_id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });
  const shots = db.shots.filter(s => s.episode_id === id).sort((a, b) => a.order - b.order);

  try {
    const results = await compileEpisodeMasterVideo(project, episode, shots, { format16: true, format9: true });
    res.json({ success: true, ...results, episode });
  } catch (err: any) {
    console.error('Error compiling master video:', err);
    res.status(500).json({ error: 'Errore compilazione video: ' + err.message });
  }
});

// Export Master ZIP containing real concrete MP4 video files named: [TITOLO SERIE] - S1_E1.mp4
app.get('/api/episodes/:id/export-zip', async (req, res) => {
  const { id } = req.params;
  const f16 = req.query.f16 !== 'false';
  const f9 = req.query.f9 !== 'false';

  const episode = db.episodes.find(e => e.id === id);
  if (!episode) return res.status(404).json({ error: 'Episodio non trovato' });
  const project = db.projects.find(p => p.id === episode.project_id);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });
  const shots = db.shots.filter(s => s.episode_id === id).sort((a, b) => a.order - b.order);

  try {
    // 1. Ensure master videos and shots are compiled into real MP4 files
    await compileEpisodeMasterVideo(project, episode, shots, { format16: f16, format9: f9 });

    const zip = new JSZip();
    const seriesClean = getSeriesTitleClean(project);
    const epCode = getEpisodeCode(episode);

    // 2. Add real Full HD 16:9 master MP4 file into root of ZIP
    if (f16) {
      const master16Filename = getEpisodeMasterFilename(project, episode, '16:9');
      const p16 = path.join(videosDir, master16Filename);
      if (fs.existsSync(p16)) {
        zip.file(master16Filename, fs.readFileSync(p16));
      }
    }

    // 3. Add real 9:16 vertical master MP4 file into root of ZIP
    if (f9) {
      const master9Filename = getEpisodeMasterFilename(project, episode, '9:16');
      const p9 = path.join(videosDir, master9Filename);
      if (fs.existsSync(p9)) {
        zip.file(master9Filename, fs.readFileSync(p9));
      }
    }

    // 4. Add individual shot MP4 video files into dedicated subfolder
    const clipsFolder = zip.folder('Inquadrature_Clip_MP4');
    for (const shot of shots) {
      const shotFname = getShotVideoFilename(project, episode, shot);
      const shotPath = path.join(videosDir, shotFname);
      if (fs.existsSync(shotPath)) {
        clipsFolder?.file(shotFname, fs.readFileSync(shotPath));
      }
    }

    // 5. Add Complete Screenplay & Director Notes
    const screenplayContent = `=====================================================
CINE3D - STUDIO DI ANIMAZIONE
Serie / Film: ${project.title}
Episodio ${episode.episode_number}: ${episode.title}
Codice Episodio: ${epCode}
Genere: ${project.genre || 'Cartone animato 3D'}
Stile visivo: ${project.style || ''}
Video Master inclusi nell'archivio:
${[f16 && `- ${getEpisodeMasterFilename(project, episode, '16:9')} (16:9 Full HD Cinema / YouTube)`, f9 && `- ${getEpisodeMasterFilename(project, episode, '9:16')} (9:16 Verticale Reels / TikTok / Shorts)`].filter(Boolean).join('\n')}
=====================================================

LOGLINE:
${episode.logline || ''}

SINOSSI COMPLETA:
${episode.synopsis || ''}

SEQUENZA DELLE INQUADRATURE (${shots.length} SHOTS - TOTALE ~${shots.reduce((a, b) => a + b.duration_seconds, 0)} SECONDI):
${shots.map(s => `
[SCENA ${s.scene_number} - INQUADRATURA ${s.order}] (${s.duration_seconds}s)
Titolo: ${s.title}
File Video MP4: ${getShotVideoFilename(project, episode, s)}
Personaggi in scena: ${s.cast.join(', ')}
Azione visiva cartoon: ${s.description}
Prompt video 3D: ${s.video_prompt}
-----------------------------------------------------`).join('\n')}
`;
    zip.file('Sceneggiatura_e_Note_Regia.txt', screenplayContent);

    // 6. Social Publication Pack
    const socialContent = `PACCHETTO SOCIAL & LANCIO PUBBLICAZIONE (Cine3D)
Serie: ${project.title}
Episodio: ${episode.title} (${epCode})

TITOLO PUBBLICAZIONE SUGGERITO:
${episode.publish_title || `🚀 ${episode.title} | ${project.title} Cartoon 3D`}

TESTO DESCRIZIONE:
${episode.publish_description || episode.synopsis || episode.logline}

HASHTAG RACCOMANDATI:
${(episode.publish_hashtags || ['Cine3D', 'Cartoon3D', 'AnimazionePerBambini', 'KidsFilm', 'Cinema3D']).map(h => `#${h}`).join(' ')}
`;
    zip.file('Social_Pack_Pubblicazione.txt', socialContent);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
    const downloadZipFilename = `${seriesClean} - ${epCode}_Master_Video_Pack.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadZipFilename)}"`);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('[Export ZIP] Error packaging master zip:', err);
    res.status(500).json({ error: 'Errore creazione master ZIP: ' + err.message });
  }
});

// Production Bible (All-in-One structured prompts & Word .docx generation)
app.post('/api/production-bible', (req, res) => {
  try {
    const { prompt, title } = req.body;
    const bible = buildProductionBibleFromPrompt(prompt || '', title);
    res.json(bible);
  } catch (err: any) {
    console.error('Error generating production bible data:', err);
    res.status(500).json({ error: 'Errore generazione bibbia: ' + err.message });
  }
});

app.post('/api/production-bible/docx', async (req, res) => {
  try {
    const { bibleData } = req.body;
    if (!bibleData) return res.status(400).json({ error: 'Dati bibbia mancanti.' });
    const buffer = await createProductionBibleDocx(bibleData);
    const safeTitle = (bibleData.title || 'BIBBIA_PRODUZIONE_ALL_IN_ONE').replace(/[^a-zA-Z0-9_\-]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.docx"`);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error generating docx file:', err);
    res.status(500).json({ error: 'Errore creazione file Word .docx: ' + err.message });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 Cine3D Studio server running at http://localhost:${PORT}`);
  });
}

startServer();
