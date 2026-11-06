import { GoogleGenAI } from '@google/genai';
import { Episode, SceneClip, CharacterVoice, VisualStyle, CameraMovement } from '../types';

export const GEMINI_API_KEY_STORAGE_KEY = 'cinepixar_gemini_api_key';

export function getSavedApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (local && local.trim()) return local.trim();
  }
  // Fallback to environment variable if injected
  const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
  return envKey;
}

export function saveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
  }
}

/**
 * Intelligent Local Rule-based Parser (100% Free, instant, zero-cost fallback)
 */
export function parseScriptLocally(
  rawScript: string,
  targetEpisodes: number,
  defaultClipDuration: number,
  totalTargetMinutes: number,
  style: VisualStyle
): { episodes: Episode[]; characters: CharacterVoice[] } {
  const charactersMap = new Map<string, CharacterVoice>();
  const defaultColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let colorIdx = 0;

  // Split lines
  const lines = rawScript.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract potential characters from dialogue patterns (e.g., "NOME: battuta" or "NOME (emozione): battuta")
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_ -]{2,20})\s*(?:\([^)]*\))?\s*:\s*(.+)$/i);
    if (match) {
      const charName = match[1].trim().toUpperCase();
      if (!charactersMap.has(charName)) {
        let gender: CharacterVoice['gender'] = 'heroic';
        let pitch = 1.0;
        let rate = 1.0;

        if (charName.includes('CAR') || charName.includes('SAETTA') || charName.includes('ROBOT') || charName.includes('SPEED')) {
          gender = 'robot_car';
          pitch = 1.2;
          rate = 1.1;
        } else if (charName.includes('DONNA') || charName.includes('LADY') || charName.includes('RAGAZZA')) {
          gender = 'female';
          pitch = 1.3;
        } else if (charName.includes('CATTIVO') || charName.includes('BOSS') || charName.includes('TITANO')) {
          gender = 'male';
          pitch = 0.7;
          rate = 0.9;
        }

        charactersMap.set(charName, {
          id: `char_${charName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: charName,
          role: 'Personaggio',
          pitch,
          rate,
          gender,
          color: defaultColors[colorIdx % defaultColors.length]
        });
        colorIdx++;
      }
    }
  }

  // If no characters found, create two default characters fitting the style
  if (charactersMap.size === 0) {
    if (style === 'cars_speedway') {
      charactersMap.set('FLASH_CAR', {
        id: 'char_flash',
        name: 'Flash Car #99',
        role: 'Auto da Corsa Protagonista',
        pitch: 1.15,
        rate: 1.1,
        gender: 'robot_car',
        color: '#ef4444'
      });
      charactersMap.set('TURBO_RIVAL', {
        id: 'char_turbo',
        name: 'Turbo Rival',
        role: 'Campione Rivale',
        pitch: 0.85,
        rate: 1.0,
        gender: 'male',
        color: '#3b82f6'
      });
    } else if (style === 'marvel_action') {
      charactersMap.set('HERO_AVENGER', {
        id: 'char_hero',
        name: 'Avenger Prime',
        role: 'Supereroe',
        pitch: 0.9,
        rate: 1.0,
        gender: 'heroic',
        color: '#e11d48'
      });
      charactersMap.set('SHADOW_VILLAIN', {
        id: 'char_villain',
        name: 'Dark Nemesis',
        role: 'Cattivo Galattico',
        pitch: 0.7,
        rate: 0.85,
        gender: 'male',
        color: '#6b21a8'
      });
    } else {
      charactersMap.set('WOODY_TOON', {
        id: 'char_toon',
        name: 'Leo Toon',
        role: 'Protagonista Toy',
        pitch: 1.1,
        rate: 1.05,
        gender: 'heroic',
        color: '#f59e0b'
      });
      charactersMap.set('BUZZ_BUDDY', {
        id: 'char_buddy',
        name: 'Cosmo Buddy',
        role: 'Migliore Amico',
        pitch: 0.95,
        rate: 1.0,
        gender: 'male',
        color: '#10b981'
      });
    }
  }

  const characters = Array.from(charactersMap.values());

  // Determine clips per episode based on target length & clip duration
  const targetSecondsPerEpisode = Math.max(30, totalTargetMinutes * 60);
  const calculatedClipsPerEpisode = Math.max(3, Math.round(targetSecondsPerEpisode / defaultClipDuration));

  const cameraMovements: CameraMovement[] = [
    'hero_orbit_360',
    'cinematic_pan',
    'dolly_zoom',
    'low_angle_hero',
    'action_tracking',
    'drone_flyover',
    'shake_impact'
  ];

  const sfxList: SceneClip['sfx'][] = [
    style === 'cars_speedway' ? 'engine_rev' : style === 'marvel_action' ? 'laser_blast' : 'cartoon_boing',
    style === 'cars_speedway' ? 'tire_screech' : 'cinematic_boom',
    'none',
    'cinematic_boom'
  ];

  const episodes: Episode[] = [];

  // Split lines into chunks for episodes
  const linesPerEp = Math.max(1, Math.ceil(lines.length / targetEpisodes));

  for (let epIndex = 1; epIndex <= targetEpisodes; epIndex++) {
    const epLines = lines.slice((epIndex - 1) * linesPerEp, epIndex * linesPerEp);
    const clips: SceneClip[] = [];

    for (let c = 0; c < calculatedClipsPerEpisode; c++) {
      const clipNumber = c + 1;
      const associatedLine = epLines[c % Math.max(1, epLines.length)] || `Scena ${clipNumber} dell'episodio ${epIndex}`;
      
      // Parse dialogue if present
      const match = associatedLine.match(/^([A-Z0-9_ -]+)\s*(?:\(([^)]*)\))?\s*:\s*(.+)$/i);
      const dialogues = [];
      let action = associatedLine;

      if (match) {
        const charName = match[1].trim().toUpperCase();
        const foundChar = characters.find(ch => ch.name.toUpperCase() === charName) || characters[0];
        dialogues.push({
          id: `dlg_${epIndex}_${clipNumber}_1`,
          characterId: foundChar.id,
          text: match[3].trim(),
          emotion: (match[2]?.toLowerCase() as unknown as 'excited') || 'heroic'
        });
        action = `Inquadratura cinematica su ${foundChar.name} mentre pronuncia la battuta.`;
      }

      clips.push({
        id: `clip_ep${epIndex}_${clipNumber}`,
        clipNumber,
        title: `Clip ${clipNumber}: ${associatedLine.slice(0, 32)}...`,
        durationSeconds: defaultClipDuration,
        style,
        cameraMovement: cameraMovements[c % cameraMovements.length],
        environment: 
          style === 'cars_speedway' ? 'Radiator Grand Prix Track' :
          style === 'marvel_action' ? 'Stark Tower Rooftop' :
          style === 'ghibli_watercolor' ? 'Giardino Incantato Ghibli' :
          style === 'epic_anime' ? 'Arena Shonen dei Titani' :
          style === 'pixel_voxel' ? 'Isola Volumetrica Voxel 3D' :
          style === 'dark_fantasy' ? 'Sala Gotica del Trono' :
          style === 'cinematic_realism' ? 'Metropoli Notturna Anamorfica' :
          'Parco delle Favole & Chiosco Incantato',
        actionDescription: action,
        dialogues,
        sfx: sfxList[c % sfxList.length],
        videoUrl: (c % 2 === 0) ? '/assets/aistudio/1792678067090_93f5aaad.mp4' : '/assets/aistudio/1792678071668_6de4271a.mp4',
        status: 'ready'
      });
    }

    episodes.push({
      id: `ep_${epIndex}`,
      episodeNumber: epIndex,
      title: `Episodio ${epIndex}: L'Inizio dell'Avventura`,
      synopsis: `La prima parte della serie con ${clips.length} clip da ${defaultClipDuration}s ciascuna per un totale di circa ${(clips.length * defaultClipDuration / 60).toFixed(1)} minuti.`,
      targetDurationMinutes: totalTargetMinutes,
      clips
    });
  }

  return { episodes, characters };
}

/**
 * AI-Powered Parser using Google AI Studio Gemini API Key
 */
export async function parseScriptWithGemini(
  rawScript: string,
  targetEpisodes: number,
  defaultClipDuration: number,
  totalTargetMinutes: number,
  style: VisualStyle,
  apiKey: string
): Promise<{ episodes: Episode[]; characters: CharacterVoice[] }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return parseScriptLocally(rawScript, targetEpisodes, defaultClipDuration, totalTargetMinutes, style);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Sei il direttore di produzione e regista di una serie animata 3D in stile ${style.toUpperCase()} (Pixar / Cars / Marvel).
Analizza il seguente copione/sceneggiatura fornito dall'utente.
Suddividilo in:
- Esattamente ${targetEpisodes} Episodio/i
- Ogni episodio dura circa ${totalTargetMinutes} minuti
- Ogni clip/scena deve avere una durata fissa o media di ${defaultClipDuration} secondi (durata X).
- Stile grafico 3D: ${style}

Copione fornito:
"""
${rawScript}
"""

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun markdown, nessun backtick, solo JSON puro) con questa struttura esatta:
{
  "characters": [
    {
      "id": "char_1",
      "name": "NOME",
      "role": "Ruolo",
      "pitch": 1.0,
      "rate": 1.0,
      "gender": "male" o "female" o "robot_car" o "heroic",
      "color": "#hex"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Titolo Episodio",
      "synopsis": "Sinossi breve",
      "targetDurationMinutes": ${totalTargetMinutes},
      "clips": [
        {
          "clipNumber": 1,
          "title": "Titolo Scena",
          "durationSeconds": ${defaultClipDuration},
          "cameraMovement": "hero_orbit_360" o "cinematic_pan" o "dolly_zoom" o "low_angle_hero" o "action_tracking" o "drone_flyover" o "shake_impact",
          "environment": "Descrizione ambientazione 3D",
          "actionDescription": "Descrizione animazione e regia",
          "dialogues": [
            {
              "characterName": "NOME",
              "text": "Battuta parlata esatta",
              "emotion": "excited" o "heroic" o "neutral"
            }
          ],
          "sfx": "engine_rev" o "laser_blast" o "cinematic_boom" o "cartoon_boing" o "tire_screech" o "none"
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const data = JSON.parse(cleanJson);

    // Map characters
    const charMap = new Map<string, string>();
    const characters: CharacterVoice[] = (data.characters || []).map((ch: Record<string, unknown>, idx: number) => {
      const id = (ch.id as string) || `char_${idx + 1}`;
      const name = (ch.name as string) || `Personaggio ${idx + 1}`;
      charMap.set(name.toUpperCase(), id);
      return {
        id,
        name,
        role: (ch.role as string) || 'Personaggio',
        pitch: typeof ch.pitch === 'number' ? ch.pitch : 1.0,
        rate: typeof ch.rate === 'number' ? ch.rate : 1.0,
        gender: (ch.gender as CharacterVoice['gender']) || 'heroic',
        color: (ch.color as string) || '#3b82f6'
      };
    });

    // Map episodes
    const episodes: Episode[] = (data.episodes || []).map((ep: Record<string, unknown>, epIdx: number) => {
      const epNum = (ep.episodeNumber as number) || (epIdx + 1);
      const clipsRaw = (ep.clips as Record<string, unknown>[]) || [];
      const clips: SceneClip[] = clipsRaw.map((cl, cIdx) => {
        const cNum = (cl.clipNumber as number) || (cIdx + 1);
        const dlgRaw = (cl.dialogues as Record<string, unknown>[]) || [];
        const dialogues = dlgRaw.map((d, dIdx) => {
          const charName = ((d.characterName as string) || '').toUpperCase();
          const charId = charMap.get(charName) || characters[0]?.id || 'char_1';
          return {
            id: `dlg_${epNum}_${cNum}_${dIdx + 1}`,
            characterId: charId,
            text: (d.text as string) || '',
            emotion: (d.emotion as 'neutral') || 'heroic'
          };
        });

        return {
          id: `clip_ep${epNum}_${cNum}`,
          clipNumber: cNum,
          title: (cl.title as string) || `Clip ${cNum}`,
          durationSeconds: typeof cl.durationSeconds === 'number' ? cl.durationSeconds : defaultClipDuration,
          style,
          cameraMovement: (cl.cameraMovement as CameraMovement) || 'hero_orbit_360',
          environment: (cl.environment as string) || 'Scena 3D CGI',
          actionDescription: (cl.actionDescription as string) || '',
          dialogues,
          sfx: (cl.sfx as SceneClip['sfx']) || 'none',
          status: 'ready' as const
        };
      });

      return {
        id: `ep_${epNum}`,
        episodeNumber: epNum,
        title: (ep.title as string) || `Episodio ${epNum}`,
        synopsis: (ep.synopsis as string) || '',
        targetDurationMinutes: typeof ep.targetDurationMinutes === 'number' ? ep.targetDurationMinutes : totalTargetMinutes,
        clips
      };
    });

    return { episodes, characters };
  } catch (error) {
    console.error('Gemini breakdown error, falling back to local breakdown:', error);
    return parseScriptLocally(rawScript, targetEpisodes, defaultClipDuration, totalTargetMinutes, style);
  }
}
