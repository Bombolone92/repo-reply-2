import clip1ParcoImg from '../assets/images/clip1_parco_panoramica_1792745107621.jpg';
import duoImg from '../assets/images/ettore_rex_duo_1792702446569.jpg';
import barImg from '../assets/images/bar_zampa_felice_1792702463331.jpg';
import trainingImg from '../assets/images/parco_training_1792702498147.jpg';
import raceImg from '../assets/images/scuderia_dog_race_1792702482084.jpg';
import podiumImg from '../assets/images/podio_vittoria_1792702512191.jpg';

export interface SceneVisualConfig {
  imageUrl: string;
  effectType: 'park_butterflies_leaves' | 'park_leaves' | 'cafe_steam' | 'training_sparks' | 'race_speedlines' | 'confetti_fireworks';
  cameraMotion: 'pan_down_gentle' | 'pan_down' | 'zoom_in' | 'pan_horizontal' | 'racing_shake' | 'triumphant_ascend';
  dialogueLine: string;
  speaker: string;
  soundscape: 'park_birds' | 'cafe_jazz' | 'race_engine' | 'training_whistle' | 'victory_fanfare';
  noVisualText?: boolean;
}

export function getSceneVisualConfig(episodeNumber: number, sceneNumber: number, envId: string): SceneVisualConfig {
  // Episode 1 Scene 1: Opening establishing shot of the park
  if (episodeNumber === 1 && sceneNumber === 1) {
    return {
      imageUrl: clip1ParcoImg,
      effectType: 'park_butterflies_leaves',
      cameraMotion: 'pan_down_gentle',
      dialogueLine: '',
      speaker: '',
      soundscape: 'park_birds',
      noVisualText: true
    };
  }

  // Episode 5 Finale
  if (episodeNumber === 5 && sceneNumber >= 15) {
    return {
      imageUrl: podiumImg,
      effectType: 'confetti_fireworks',
      cameraMotion: 'triumphant_ascend',
      dialogueLine: sceneNumber === 20 
        ? "Grazie per aver corso con noi! L'amicizia è la vera vittoria!" 
        : "Siamo i campioni! Insieme possiamo fare qualsiasi cosa!",
      speaker: "ETTORE & REX",
      soundscape: 'victory_fanfare'
    };
  }

  // Racing in Scuderia (Ep 4 & Ep 5)
  if (episodeNumber === 5 || (episodeNumber === 4 && sceneNumber >= 10)) {
    return {
      imageUrl: raceImg,
      effectType: 'race_speedlines',
      cameraMotion: 'racing_shake',
      dialogueLine: sceneNumber % 2 === 0
        ? "Tieni la corda, Rex! Fai la tua traiettoria perfetta!"
        : "Insieme sul rettilineo! Non molliamo di un millimetro!",
      speaker: sceneNumber % 2 === 0 ? "ETTORE" : "REX",
      soundscape: 'race_engine'
    };
  }

  // Training & Obstacles (Ep 3)
  if (episodeNumber === 3) {
    return {
      imageUrl: trainingImg,
      effectType: 'training_sparks',
      cameraMotion: 'zoom_in',
      dialogueLine: sceneNumber <= 10
        ? "Segui la traiettoria con l'istinto! Un salto e siamo in testa!"
        : "Bruno non ci fermerà mai! Rialziamoci più forti!",
      speaker: sceneNumber <= 10 ? "REX" : "ETTORE",
      soundscape: 'training_whistle'
    };
  }

  // Cafe "La Zampa Felice" (Ep 1 scenes 10-20, Ep 2 scenes 1-17)
  if (envId === 'bar' || (episodeNumber === 1 && sceneNumber >= 10) || (episodeNumber === 2 && sceneNumber <= 17)) {
    return {
      imageUrl: barImg,
      effectType: 'cafe_steam',
      cameraMotion: 'pan_horizontal',
      dialogueLine: sceneNumber === 15 
        ? "Una coppa di spumante alla mela per favore!" 
        : sceneNumber === 16 
        ? "La stessa identica cosa anche per me!" 
        : "Benvenuti alla Zampa Felice, futuri piloti!",
      speaker: sceneNumber === 15 ? "ETTORE" : sceneNumber === 16 ? "REX" : "SIGNOR BAFFI",
      soundscape: 'cafe_jazz'
    };
  }

  // Park / Introductory (Ep 1 scenes 2-9, Ep 2 scenes 18-20)
  return {
    imageUrl: duoImg,
    effectType: 'park_leaves',
    cameraMotion: 'pan_down',
    dialogueLine: sceneNumber === 2 
      ? "Che bella giornata di sole! Sento profumo di biscotti..." 
      : sceneNumber === 3 
      ? "L'aria del pomeriggio è perfetta per una grande avventura." 
      : "Due amici, un solo grande sogno nel cuore.",
    speaker: sceneNumber === 2 ? "ETTORE" : sceneNumber === 3 ? "REX" : "NARRATORE",
    soundscape: 'park_birds'
  };
}
