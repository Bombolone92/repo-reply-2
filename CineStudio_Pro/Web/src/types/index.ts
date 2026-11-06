export type VisualStyle = 
  | 'disney_pixar_dola' 
  | 'cars_speedway' 
  | 'pixar_3d' 
  | 'marvel_action'
  | 'ghibli_watercolor'
  | 'epic_anime'
  | 'pixel_voxel'
  | 'dark_fantasy'
  | 'cinematic_realism';

export type ColorMood = 
  | 'bright_saturated'
  | 'warm_sunset'
  | 'pastel_soft'
  | 'dark_moody'
  | 'cold_neon'
  | 'black_white_noir';

export type CameraMovement = 
  | 'cinematic_pan'
  | 'hero_orbit_360'
  | 'dolly_zoom'
  | 'low_angle_hero'
  | 'drone_flyover'
  | 'shake_impact'
  | 'action_tracking';

export interface CharacterVoice {
  id: string;
  name: string;
  role: string;
  pitch: number; // 0.5 to 2.0
  rate: number;  // 0.5 to 2.0
  gender: 'male' | 'female' | 'robot_car' | 'heroic';
  color: string;
  systemVoiceName?: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion?: 'neutral' | 'excited' | 'angry' | 'heroic' | 'funny';
  audioBlobUrl?: string;
  durationEstimate?: number;
}

export interface SceneClip {
  id: string;
  clipNumber: number;
  title: string;
  durationSeconds: number; // Duration X seconds
  style: VisualStyle;
  cameraMovement: CameraMovement;
  environment: string; // e.g., "Radiator Speedway", "Fairytale Garden Cottage", "Toon Toy Bedroom"
  actionDescription: string;
  dialogues: DialogueLine[];
  sfx: 'engine_rev' | 'laser_blast' | 'cinematic_boom' | 'cartoon_boing' | 'tire_screech' | 'none';
  customPrompt?: string;
  videoUrl?: string; // Direct neural AI video URL or uploaded reference
  status: 'draft' | 'ready' | 'rendering' | 'rendered';
  colorMood?: ColorMood;
  recordedVideoBlob?: Blob;
  recordedAudioBlob?: Blob;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  synopsis: string;
  targetDurationMinutes: number; // Y minutes
  clips: SceneClip[];
}

export interface SeriesProject {
  id: string;
  title: string;
  targetEpisodesCount: number; // Z episodes
  defaultClipDuration: number; // X seconds
  episodes: Episode[];
  characters: CharacterVoice[];
  globalStyle: VisualStyle;
  globalColorMood?: ColorMood;
  rawScript: string;
}

export interface RenderProgress {
  currentEpisode: number;
  totalEpisodes: number;
  currentClip: number;
  totalClips: number;
  statusMessage: string;
  percentage: number;
}
