// Multi-beat 15-second choreography generator for Ettore & Rex scenes

import { SceneClip } from '../data/seriesData';
import { AnimationRigState } from './characterRigs';

export interface SceneChoreography {
  charactersToDraw: Array<{
    type: 'ettore' | 'rex' | 'signor_baffi' | 'racecar_ettore' | 'racecar_rex' | 'racecar_bruno';
    state: AnimationRigState;
    extra?: Record<string, unknown>;
  }>;
  activeDialogue: {
    speaker: string;
    text: string;
    shouldTriggerAudio: boolean;
  } | null;
  currentActionBeat: string;
  camera: {
    panX: number;
    panY: number;
    zoom: number;
    shake: number;
  };
}

export function getSceneChoreography(clip: SceneClip, time: number): SceneChoreography {
  const t = Math.max(0, Math.min(time, 15));
  const ep = clip.episodeNumber;
  const sc = clip.sceneNumber;

  // Default setup
  let currentActionBeat = clip.brief;
  let camera = { panX: 0, panY: 0, zoom: 1.0, shake: 0 };
  let activeDialogue: SceneChoreography['activeDialogue'] = null;
  const charactersToDraw: SceneChoreography['charactersToDraw'] = [];

  // ==========================================
  // CASE 1: RACING ON TRACK (Ep 4 scenes 10-16, Ep 5 scenes 4-15)
  // ==========================================
  if ((ep === 5 && sc <= 15) || (ep === 4 && sc >= 10 && sc <= 16)) {
    camera.shake = 1.5 + Math.sin(t * 12) * 1.0;
    camera.zoom = 1.05 + Math.sin(t * 0.5) * 0.05;

    if (t < 4.5) {
      currentActionBeat = '🏎️ Partenza a tutto gas! Bruno scatta in testa.';
      // Bruno ahead, Ettore & Rex pursuing
      charactersToDraw.push({
        type: 'racecar_bruno',
        state: { x: 270 + Math.sin(t * 4) * 30, y: 380, scale: 0.85, time }
      });
      charactersToDraw.push({
        type: 'racecar_ettore',
        state: { x: 190, y: 560 + Math.sin(t * 8) * 8, scale: 1.15, time }
      });
      charactersToDraw.push({
        type: 'racecar_rex',
        state: { x: 350, y: 580 + Math.cos(t * 8) * 8, scale: 1.15, time }
      });

      if (t >= 1.5 && t <= 4.0) {
        activeDialogue = {
          speaker: 'ETTORE',
          text: 'Tieni la scia, Rex! Recuperiamo centimetro dopo centimetro!',
          shouldTriggerAudio: t >= 1.5 && t < 1.7
        };
      }
    } else if (t < 9.5) {
      currentActionBeat = '💨 Derapata sincronizzata sui cordoli scarlatti!';
      camera.shake = 3.0;
      // Side by side overtaking attempt
      charactersToDraw.push({
        type: 'racecar_bruno',
        state: { x: 290, y: 440, scale: 0.95, time }
      });
      charactersToDraw.push({
        type: 'racecar_ettore',
        state: { x: 170 + Math.sin(t * 6) * 20, y: 520, scale: 1.18, time }
      });
      charactersToDraw.push({
        type: 'racecar_rex',
        state: { x: 370 - (t - 4.5) * 12, y: 490, scale: 1.18, time }
      });

      if (t >= 5.0 && t <= 8.5) {
        activeDialogue = {
          speaker: 'REX',
          text: 'Bruno sta bloccando l\'interno! Esci largo ed entra in traiettoria!',
          shouldTriggerAudio: t >= 5.0 && t < 5.2
        };
      }
    } else {
      currentActionBeat = '🏁 Sorpasso leale all\'esterno e vittoria sul traguardo!';
      camera.shake = 1.0;
      // Ettore & Rex crossing line ahead
      charactersToDraw.push({
        type: 'racecar_ettore',
        state: { x: 210, y: 460 - (t - 9.5) * 10, scale: 1.25, time }
      });
      charactersToDraw.push({
        type: 'racecar_rex',
        state: { x: 330, y: 460 - (t - 9.5) * 10, scale: 1.25, time }
      });
      charactersToDraw.push({
        type: 'racecar_bruno',
        state: { x: 270, y: 620, scale: 0.9, time }
      });

      if (t >= 10.0 && t <= 14.0) {
        activeDialogue = {
          speaker: 'ETTORE & REX',
          text: 'Traguardo! Campioni del mondo insieme!',
          shouldTriggerAudio: t >= 10.0 && t < 10.2
        };
      }
    }

    return { charactersToDraw, activeDialogue, currentActionBeat, camera };
  }

  // ==========================================
  // CASE 2: PODIUM CELEBRATION (Ep 5 scenes 16-20)
  // ==========================================
  if (ep === 5 && sc >= 16) {
    camera.zoom = 1.0 + t * 0.008;
    currentActionBeat = '🏆 Tutti insieme sul gradino più alto del podio!';

    const isCheering = true;
    charactersToDraw.push({
      type: 'ettore',
      state: {
        x: 220,
        y: 620,
        scale: 1.0,
        time,
        isCelebrating: isCheering,
        isJumping: Math.sin(t * 8) > 0.3,
        expression: 'laughing',
        facing: 'right'
      }
    });

    charactersToDraw.push({
      type: 'rex',
      state: {
        x: 330,
        y: 590,
        scale: 1.0,
        time,
        isCelebrating: isCheering,
        expression: 'happy',
        facing: 'left'
      }
    });

    if (t < 5.0) {
      activeDialogue = {
        speaker: 'DIRETTORE ZAMPA',
        text: 'Avete dimostrato che la vera forza è avere qualcuno con cui correre nella vita!',
        shouldTriggerAudio: t >= 0.5 && t < 0.7
      };
    } else if (t < 10.5) {
      activeDialogue = {
        speaker: 'ETTORE',
        text: 'Ce l\'abbiamo fatta Rex! Il nostro sogno si è avverato!',
        shouldTriggerAudio: t >= 5.5 && t < 5.7
      };
    } else {
      activeDialogue = {
        speaker: 'REX',
        text: 'Grazie Ettore! Insieme siamo una squadra imbattibile!',
        shouldTriggerAudio: t >= 11.0 && t < 11.2
      };
    }

    return { charactersToDraw, activeDialogue, currentActionBeat, camera };
  }

  // ==========================================
  // CASE 3: CAFE LA ZAMPA FELICE (Ep 1 scenes 10-20, Ep 2 scenes 1-17)
  // ==========================================
  if (clip.environmentId === 'bar' || (ep === 1 && sc >= 10) || (ep === 2 && sc <= 17)) {
    camera.zoom = 1.02;

    if (sc === 14 || sc === 15 || sc === 16 || sc === 17) {
      // Signor Baffi serving drinks
      charactersToDraw.push({
        type: 'signor_baffi',
        state: { x: 370 - Math.sin(t * 0.5) * 15, y: 500, scale: 0.9, time, isSpeaking: t < 4 }
      });
      charactersToDraw.push({
        type: 'ettore',
        state: {
          x: 180,
          y: 620,
          scale: 0.95,
          time,
          isSpeaking: t >= 4 && t < 8.5,
          expression: 'happy',
          facing: 'right'
        }
      });
      charactersToDraw.push({
        type: 'rex',
        state: {
          x: 290,
          y: 600,
          scale: 0.95,
          time,
          isSpeaking: t >= 8.5 && t < 13,
          expression: 'happy',
          facing: 'left'
        }
      });

      if (t < 4.0) {
        currentActionBeat = '🛎️ Il Signor Baffi si avvicina col vassoio d\'argento.';
        activeDialogue = {
          speaker: 'SIGNOR BAFFI',
          text: 'Benvenuti alla Zampa Felice! Cosa posso portarvi di speciale?',
          shouldTriggerAudio: t >= 0.5 && t < 0.7
        };
      } else if (t < 8.5) {
        currentActionBeat = '🥂 Ettore ordina una coppa di spumante alla mela!';
        activeDialogue = {
          speaker: 'ETTORE',
          text: 'Una coppa di spumante alla mela per cuccioli, per favore!',
          shouldTriggerAudio: t >= 4.2 && t < 4.4
        };
      } else {
        currentActionBeat = '😲 Rex sgrana gli occhi: stessa identica ordinazione!';
        activeDialogue = {
          speaker: 'REX',
          text: 'È incredibile... la stessa identica cosa anche per me!',
          shouldTriggerAudio: t >= 8.8 && t < 9.0
        };
      }
    } else {
      // Sitting at the table chatting about dreams (Ep 2)
      charactersToDraw.push({
        type: 'ettore',
        state: {
          x: 190,
          y: 620,
          scale: 0.95,
          time,
          isSpeaking: t < 7,
          isJumping: t > 11 && Math.sin(t * 6) > 0.5,
          expression: 'happy',
          facing: 'right'
        }
      });
      charactersToDraw.push({
        type: 'rex',
        state: {
          x: 340,
          y: 600,
          scale: 0.95,
          time,
          isSpeaking: t >= 7 && t < 12,
          expression: 'focused',
          facing: 'left'
        }
      });

      if (t < 7.0) {
        currentActionBeat = '📜 Ettore spiega il suo sogno della Scuderia DOG.';
        activeDialogue = {
          speaker: 'ETTORE',
          text: 'Ho sempre sognato di correre in Formula 1... ma da solo pensavo di non farcela!',
          shouldTriggerAudio: t >= 0.8 && t < 1.0
        };
      } else if (t < 12.0) {
        currentActionBeat = '🔑 Rex mostra il portachiavi d\'oro con lo stesso logo!';
        activeDialogue = {
          speaker: 'REX',
          text: 'Anche io ho lo stesso logo! Se andiamo insieme, possiamo vincere!',
          shouldTriggerAudio: t >= 7.2 && t < 7.4
        };
      } else {
        currentActionBeat = '🤝 Una promessa di amicizia: all\'alba si parte!';
        activeDialogue = {
          speaker: 'ETTORE & REX',
          text: 'Promesso: non ci arrenderemo mai!',
          shouldTriggerAudio: t >= 12.2 && t < 12.4
        };
      }
    }

    return { charactersToDraw, activeDialogue, currentActionBeat, camera };
  }

  // ==========================================
  // CASE 4: PARK TRAINING (Ep 3)
  // ==========================================
  if (ep === 3) {
    if (sc <= 6) {
      // Obstacle & cone training
      const ettoreX = 140 + (t % 5) * 45;
      const isJumping = Math.sin(t * 5) > 0.2;
      currentActionBeat = '🏃 Slalom tra i birilli e salti atletici!';

      charactersToDraw.push({
        type: 'ettore',
        state: {
          x: ettoreX > 380 ? 140 : ettoreX,
          y: 620,
          scale: 0.95,
          time,
          isWalking: true,
          isJumping,
          facing: 'right',
          expression: 'determined'
        }
      });
      charactersToDraw.push({
        type: 'rex',
        state: {
          x: 390,
          y: 590,
          scale: 1.0,
          time,
          isSpeaking: t >= 4 && t < 9,
          facing: 'left'
        }
      });

      if (t < 6.0) {
        activeDialogue = {
          speaker: 'REX',
          text: 'Bravo Ettore! Segui la traiettoria con l\'istinto, non frenare!',
          shouldTriggerAudio: t >= 0.8 && t < 1.0
        };
      } else {
        activeDialogue = {
          speaker: 'ETTORE',
          text: 'Sto migliorando Rex! Guarda che salto!',
          shouldTriggerAudio: t >= 6.5 && t < 6.7
        };
      }
    } else {
      // Confrontation with Bruno & finding courage
      charactersToDraw.push({
        type: 'ettore',
        state: {
          x: 180,
          y: 620,
          scale: 0.95,
          time,
          isSpeaking: t >= 6,
          expression: 'determined',
          facing: 'right'
        }
      });
      charactersToDraw.push({
        type: 'rex',
        state: {
          x: 290,
          y: 600,
          scale: 1.0,
          time,
          isSpeaking: t < 6,
          expression: 'focused',
          facing: 'left'
        }
      });

      if (t < 7.0) {
        currentActionBeat = '❤️ Rex incoraggia Ettore a credere in se stesso.';
        activeDialogue = {
          speaker: 'REX',
          text: 'Bruno parla così perché è solo. La tua gentilezza è la tua vera forza!',
          shouldTriggerAudio: t >= 0.6 && t < 0.8
        };
      } else {
        currentActionBeat = '💪 Ettore ritrova la grinta: si riparte!';
        activeDialogue = {
          speaker: 'ETTORE',
          text: 'Hai ragione, Rex! Non mi arrendo, noi non ci arrenderemo mai!',
          shouldTriggerAudio: t >= 7.2 && t < 7.4
        };
      }
    }

    return { charactersToDraw, activeDialogue, currentActionBeat, camera };
  }

  // ==========================================
  // CASE 5: PARK INTRODUCTION (Ep 1 scenes 1-9)
  // ==========================================
  if (sc === 1) {
    // Landscape establishing shot with ultra-smooth descending crane movement
    currentActionBeat = '🌿 Panoramica dolce dall\'alto verso il basso sul parco tranquillo, luce dorata.';
    camera.panY = -35 + (t / 15) * 55;
    camera.zoom = 1.05 - (t / 15) * 0.05;
    camera.shake = 0;
  } else if (sc === 2) {
    // Ettore walks
    const walkX = 140 + t * 18;
    currentActionBeat = '🐾 Ettore cammina allegro, annusa una margherita e guarda la farfalla.';
    charactersToDraw.push({
      type: 'ettore',
      state: {
        x: walkX,
        y: 630,
        scale: 1.0,
        time,
        isWalking: t < 8 || t > 11,
        isSpeaking: t >= 5 && t < 10,
        facing: 'right'
      }
    });

    if (t >= 2.0 && t <= 7.0) {
      activeDialogue = {
        speaker: 'ETTORE',
        text: 'Che bella giornata nel parco! Che profumo delizioso di biscotti...',
        shouldTriggerAudio: t >= 2.0 && t < 2.2
      };
    }
  } else if (sc === 3) {
    // Rex arrives
    currentActionBeat = '💧 Rex beve alla fontanella di pietra con portamento fiero.';
    charactersToDraw.push({
      type: 'rex',
      state: {
        x: 270,
        y: 600,
        scale: 1.05,
        time,
        isWalking: t < 5,
        isSpeaking: t >= 5 && t < 10,
        facing: 'right'
      }
    });

    if (t >= 3.0 && t <= 8.0) {
      activeDialogue = {
        speaker: 'REX',
        text: 'L\'acqua fresca è quello che ci vuole prima di una nuova avventura.',
        shouldTriggerAudio: t >= 3.0 && t < 3.2
      };
    }
  } else {
    // Meeting & encounter (sc 4 - 9)
    currentActionBeat = '✨ Ettore e Rex si incrociano: "Dopo di te!", "Prego!"';
    const ettoreX = Math.min(200, 100 + t * 12);
    const rexX = Math.max(340, 440 - t * 12);

    charactersToDraw.push({
      type: 'ettore',
      state: {
        x: ettoreX,
        y: 630,
        scale: 0.95,
        time,
        isWalking: t < 6,
        isSpeaking: t >= 6 && t < 10,
        facing: 'right'
      }
    });
    charactersToDraw.push({
      type: 'rex',
      state: {
        x: rexX,
        y: 600,
        scale: 1.0,
        time,
        isWalking: t < 6,
        isSpeaking: t >= 10,
        facing: 'left'
      }
    });

    if (t < 8.0) {
      activeDialogue = {
        speaker: 'ETTORE',
        text: 'Oh, scusa! Volevo entrare anche io...',
        shouldTriggerAudio: t >= 3.0 && t < 3.2
      };
    } else {
      activeDialogue = {
        speaker: 'REX',
        text: 'Ma figurati, prego! Passa pure prima tu!',
        shouldTriggerAudio: t >= 8.5 && t < 8.7
      };
    }
  }

  return { charactersToDraw, activeDialogue, currentActionBeat, camera };
}
