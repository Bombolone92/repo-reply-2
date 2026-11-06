import { VisualStyle, ColorMood } from '../types';

export interface StyleOption {
  id: VisualStyle;
  label: string;
  tagline: string;
  badge: string;
  category: 'cartoon' | 'anime' | 'cinematic' | 'stylized';
  previewColor: string;
  gradient: string;
  promptSignature: string;
  lightingHint: string;
}

export interface MoodOption {
  id: ColorMood;
  label: string;
  tagline: string;
  previewColor: string;
  gradient: string;
  promptSignature: string;
  filterClass: string;
}

export const VISUAL_STYLES: StyleOption[] = [
  {
    id: 'disney_pixar_dola',
    label: '3D Cartoon (Pixar & Minions)',
    tagline: 'Commedia slapstick, mimica esagerata e CGI volumetrico soffiato',
    badge: 'Minions & Pixar',
    category: 'cartoon',
    previewColor: '#f59e0b',
    gradient: 'from-amber-500 to-rose-600',
    promptSignature: 'Pixar Disney and Illumination Minions 3D CGI animation, adorable expressive cartoon characters with exaggerated funny facial expressions, slapstick comedy timing, rich subsurface scattering, vibrant lively colors, raytraced ambient occlusion, 60fps',
    lightingHint: 'Luce morbida diffusa e riflessi caldi negli occhi',
  },
  {
    id: 'cars_speedway',
    label: 'Cars Speedway 3D',
    tagline: 'Auto da corsa animate, fari e occhi sul parabrezza, derapate ad alta velocità',
    badge: 'Cars 3D',
    category: 'cartoon',
    previewColor: '#ef4444',
    gradient: 'from-red-600 to-orange-500',
    promptSignature: 'Pixar Cars style 3D animation, bright sports car with expressive animated windshield eyes and smiling grille, high-speed drifting on sunny tarmac, billowing tire smoke, speed lines, low-angle dynamic action camera, 60fps',
    lightingHint: 'Luce solare diretta da deserto con ombre nette',
  },
  {
    id: 'marvel_action',
    label: 'Comic Book & Marvel 3D',
    tagline: 'Supereroi, armature hi-tech, inchiostri comic e particelle di energia',
    badge: 'Marvel Comic',
    category: 'cinematic',
    previewColor: '#6366f1',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    promptSignature: 'Marvel cinematic comic 3D animation, superhero in sleek glowing high-tech armor with chest power reactor, particle sparks, dynamic heroic camera tilt, volumetric god rays, comic book inked cel contours, 60fps',
    lightingHint: 'Bagliori energetici e forti contrasti di controluce',
  },
  {
    id: 'ghibli_watercolor',
    label: 'Studio Ghibli Watercolor',
    tagline: 'Paesaggi acquerellati fiabeschi, natura vibrante e poesia nostalgica',
    badge: 'Ghibli Style',
    category: 'anime',
    previewColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-700',
    promptSignature: 'Studio Ghibli Hayao Miyazaki anime style, hand-painted lush watercolor background, dreamy fairy garden with floating light motes, wind blowing through tall grass, warm gentle golden sunlight, emotional nostalgic aesthetic, 60fps',
    lightingHint: 'Luce d’atmosfera filtrata dalle foglie con bagliori magici',
  },
  {
    id: 'epic_anime',
    label: 'Epic Anime & Shonen',
    tagline: 'Linee d’azione veloci, pose plastiche e sguardi intensi',
    badge: 'Anime Shonen',
    category: 'anime',
    previewColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    promptSignature: 'Japanese epic anime animation, crisp cel-shaded characters, dynamic impact speed lines, sharp determined gaze, vibrant chromatic color palette, intense cinematic camera angles, sakuga animation quality, 60fps',
    lightingHint: 'Rim-light sagomato con contrasti shonen',
  },
  {
    id: 'pixel_voxel',
    label: 'Pixel / Voxel 3D Art',
    tagline: 'Mondo volumetrico a blocchi voxel con illuminazione raytracing moderna',
    badge: 'Voxel 3D',
    category: 'stylized',
    previewColor: '#8b5cf6',
    gradient: 'from-purple-600 to-indigo-700',
    promptSignature: 'High-definition 3D voxel art, volumetric blocky cartoon character with cute pixel aesthetics, modern global illumination, soft ambient voxel shadows, miniature tilt-shift depth of field, 60fps',
    lightingHint: 'Illuminazione globale isometrica e ombre morbide',
  },
  {
    id: 'dark_fantasy',
    label: 'Dark Fantasy & Dramatic Sketch',
    tagline: 'Atmosfere gotiche, castelli, torce e chiaroscuri intensi',
    badge: 'Dark Fantasy',
    category: 'stylized',
    previewColor: '#64748b',
    gradient: 'from-slate-700 to-slate-950',
    promptSignature: 'Dark fantasy dramatic sketch 3D animation, gothic stone hall with flickering torch fire, deep atmospheric shadows, charcoal and inked crosshatch textures, mystical brooding atmosphere, cinematic cinematic slow zoom, 60fps',
    lightingHint: 'Luce di candela e torcia con neri profondi',
  },
  {
    id: 'cinematic_realism',
    label: 'Cinematic Realism 3D',
    tagline: 'Lenti anamorfiche 35mm, profondità di campo bokeh e raytracing',
    badge: 'Cinematic 3D',
    category: 'cinematic',
    previewColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-700',
    promptSignature: 'Photorealistic cinematic 3D film render, 35mm anamorphic lens bokeh, natural skin subsurface scattering, realistic cloth physics, volumetric fog, atmospheric color grading, cinematic master shot, 60fps',
    lightingHint: 'Illuminazione cinematografica a tre punti con bokeh',
  },
];

export const COLOR_MOODS: MoodOption[] = [
  {
    id: 'bright_saturated',
    label: 'Bright & Saturated',
    tagline: 'Colori vivaci, luminosi e pieni di energia (ideale per bambini e slapstick)',
    previewColor: '#fbbf24',
    gradient: 'from-amber-400 to-orange-500',
    promptSignature: 'bright, vibrant and saturated color palette, sunny daylight, cheerful high-key lighting, vivid colors',
    filterClass: 'saturate-125 contrast-105 brightness-105',
  },
  {
    id: 'warm_sunset',
    label: 'Warm, Sunset-like',
    tagline: 'Luce dorata del tramonto, riverberi ambrati e toni caldi avvolgenti',
    previewColor: '#f97316',
    gradient: 'from-orange-500 via-amber-600 to-red-600',
    promptSignature: 'warm golden hour sunset lighting, long gentle shadows, amber and honey glow, warm color grading',
    filterClass: 'sepia-[0.2] saturate-110 hue-rotate-[-10deg]',
  },
  {
    id: 'pastel_soft',
    label: 'Pastel & Soft',
    tagline: 'Tonalità pastello, soffuse e sognanti (fiabesco e rassicurante)',
    previewColor: '#f472b6',
    gradient: 'from-pink-300 via-purple-300 to-indigo-300',
    promptSignature: 'soft pastel aesthetic, gentle muted candy tones, diffused bloom lighting, dreamy fairytale feel',
    filterClass: 'brightness-110 saturate-90 contrast-95',
  },
  {
    id: 'dark_moody',
    label: 'Dark & Moody',
    tagline: 'Ombre profonde, tensione drammatica e forte contrasto visivo',
    previewColor: '#334155',
    gradient: 'from-slate-800 to-black',
    promptSignature: 'dark and moody atmosphere, deep dramatic shadows, high contrast chiaroscuro, mysterious cinematic vibe',
    filterClass: 'contrast-125 brightness-90 saturate-95',
  },
  {
    id: 'cold_neon',
    label: 'Cold & Neon',
    tagline: 'Colori cyberpunk, neon ciano, blu glaciale e riflessi magenta',
    previewColor: '#06b6d4',
    gradient: 'from-cyan-400 via-blue-600 to-fuchsia-600',
    promptSignature: 'cyberpunk cold neon lighting, vibrant cyan and magenta rim lights, cool blue night undertones',
    filterClass: 'hue-rotate-[15deg] saturate-130 contrast-115',
  },
  {
    id: 'black_white_noir',
    label: 'Black & White Noir',
    tagline: 'Monocromatico puro ad alto contrasto artistico d’autore',
    previewColor: '#94a3b8',
    gradient: 'from-slate-300 via-slate-600 to-slate-900',
    promptSignature: 'monochrome black and white film look, dramatic silver shadows, classic film grain, rich grayscale',
    filterClass: 'grayscale contrast-125 brightness-95',
  },
];
