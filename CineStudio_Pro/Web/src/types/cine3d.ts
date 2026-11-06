export interface Project {
  id: string;
  title: string;
  brief: string;
  genre?: string;
  audience?: string;
  language?: string;
  style?: string;
  image_prompt_style?: string;
  aspect_ratio: '9:16' | '16:9';
  quality: 'fast' | 'cinema';
  episode_target_seconds: number;
  episode_count: number;
  cast_status: 'draft' | 'ready';
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  reference_image_url: string;
  sort_order: number;
}

export interface Episode {
  id: string;
  project_id: string;
  episode_number: number;
  season_number?: number;
  title: string;
  logline: string;
  synopsis: string;
  target_seconds: number;
  narration_enabled: boolean;
  status: 'planned' | 'generating' | 'ready';
  master_video_16_9?: string;
  master_video_9_16?: string;
  master_video_ready?: boolean;
  publish_title?: string;
  publish_description?: string;
  publish_hashtags?: string[];
}

export interface Shot {
  id: string;
  project_id: string;
  episode_id: string;
  order: number;
  scene_number: number;
  title: string;
  description: string;
  video_prompt: string;
  narration_text: string;
  dialogue?: string;
  duration_seconds: number;
  cast: string[];
  status: 'pending' | 'rendering' | 'ready' | 'failed';
  render_mode: 'ai' | 'free';
  visual_image_url?: string;
  video_url?: string;
  audio_url?: string;
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'float';
  model: string;
  resolution: string;
  estimated_credits: number;
  credits_spent: number;
  error?: string;
}

export interface StudioStats {
  consumed_credits: number;
  pending_credits: number;
  available_credits: number;
  total_series: number;
  total_episodes: number;
  total_shots_ready: number;
}

export interface ApiKeyEntry {
  id: string;
  key: string;
  masked_key?: string;
  label: string;
  status: 'active' | 'standby' | 'exhausted' | 'invalid';
  added_at: string;
  calls_count: number;
  last_used?: string;
  last_error?: string;
}

export interface StudioGenerationState {
  is_generating: boolean;
  is_paused: boolean;
  pause_reason: string | null;
  current_step: string;
  progress: number;
  active_project_id: string | null;
  active_episode_id: string | null;
  logs: string[];
}
