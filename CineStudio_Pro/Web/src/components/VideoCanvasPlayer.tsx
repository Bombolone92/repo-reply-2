import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SceneClip } from '../data/seriesData';
import { getSceneVisualConfig, SceneVisualConfig } from '../data/sceneAssets';
import { getSceneChoreography, SceneChoreography } from '../animation/sceneChoreography';

import { audioEngine } from '../utils/audioEngine';
import { speechEngine } from '../utils/speechEngine';
import JSZip from 'jszip';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Archive,
  RectangleHorizontal,
  RectangleVertical
} from 'lucide-react';

interface VideoCanvasPlayerProps {
  clip: SceneClip;
  onNextClip?: () => void;
  onPrevClip?: () => void;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
  onMarkDone?: () => void;
  isDone?: boolean;
}

export const VideoCanvasPlayer: React.FC<VideoCanvasPlayerProps> = ({
  clip,
  onNextClip,
  onPrevClip,
  autoPlayNext = true,
  onToggleAutoPlayNext,
  onMarkDone,
  isDone
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [hideVisualText, setHideVisualText] = useState<boolean>(() => {
    return clip.episodeNumber === 1 && clip.sceneNumber === 1;
  });

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [showZipModal, setShowZipModal] = useState<boolean>(false);
  const [zipFormatChoice, setZipFormatChoice] = useState<'9:16' | '16:9' | 'both'>('9:16');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(15); // Customizable duration (default 15s)
  const currentImgRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const pausedTimeOffsetRef = useRef<number>(0);
  const lastSpokenDialogueRef = useRef<string>('');

  const visualConfig = useRef<SceneVisualConfig>(
    getSceneVisualConfig(clip.episodeNumber, clip.sceneNumber, clip.environmentId)
  );

  // Load background image and configuration on clip change
  useEffect(() => {
    visualConfig.current = getSceneVisualConfig(
      clip.episodeNumber,
      clip.sceneNumber,
      clip.environmentId
    );

    // If clip specifically requested noVisualText (like Clip 1), respect it
    if (visualConfig.current.noVisualText) {
      setHideVisualText(true);
    }

    const img = new Image();
    img.src = visualConfig.current.imageUrl;
    img.onload = () => {
      currentImgRef.current = img;
    };

    // Reset playback
    speechEngine.stop();
    lastSpokenDialogueRef.current = '';
    setCurrentTime(0);
    pausedTimeOffsetRef.current = 0;
    startTimeRef.current = performance.now();
    setIsPlaying(true);

    if (!isMuted) {
      audioEngine.playSoundscape(visualConfig.current.soundscape);
    }
  }, [clip, isMuted]);

  // Main Canvas Render & Animation Loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Calculate current timestamp in the 15-second clip
    let elapsed = 0;
    if (isPlaying) {
      const now = performance.now();
      elapsed = (now - startTimeRef.current + pausedTimeOffsetRef.current) / 1000;
      if (elapsed >= duration) {
        elapsed = duration;
        setIsPlaying(false);
        speechEngine.stop();
        if (autoPlayNext && onNextClip) {
          setTimeout(() => {
            onNextClip();
          }, 800);
        }
      }
      setCurrentTime(elapsed);
    } else {
      elapsed = currentTime;
    }

    const progress = Math.min(elapsed / duration, 1);

    // Get current choreography (characters, active dialogue, camera, action beat)
    const choreo: SceneChoreography = getSceneChoreography(clip, elapsed);

    // Handle Timed Dialogue Speech Synthesis
    if (choreo.activeDialogue && !visualConfig.current.noVisualText) {
      if (
        choreo.activeDialogue.shouldTriggerAudio &&
        lastSpokenDialogueRef.current !== choreo.activeDialogue.text &&
        isVoiceEnabled &&
        isPlaying
      ) {
        lastSpokenDialogueRef.current = choreo.activeDialogue.text;
        speechEngine.speakDialogue(choreo.activeDialogue.text, choreo.activeDialogue.speaker);
      }
    }

    // Clear Canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Camera Transform (Pan, Zoom, Dynamic Shake)
    ctx.save();
    const camShakeX = choreo.camera.shake ? (Math.random() - 0.5) * choreo.camera.shake * 4 : 0;
    const camShakeY = choreo.camera.shake ? (Math.random() - 0.5) * choreo.camera.shake * 4 : 0;
    const camZoom = (choreo.camera.zoom || 1.0) * (1.0 + progress * 0.05);

    ctx.translate(width / 2 + camShakeX, height / 2 + camShakeY);
    ctx.scale(camZoom, camZoom);

    // Draw Background Pixar Scene
    if (currentImgRef.current && currentImgRef.current.complete) {
      const img = currentImgRef.current;
      const hRatio = height / img.height;
      const wRatio = width / img.width;
      const bestRatio = Math.max(hRatio, wRatio);
      const drawW = img.width * bestRatio;
      const drawH = img.height * bestRatio;

      // Soft vertical descending crane parallax pan for Clip 1
      const bgPanY = choreo.camera.panY || 0;
      ctx.drawImage(img, -drawW / 2, -drawH / 2 + bgPanY, drawW, drawH);

      // Light atmospheric warmth overlay
      ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
      ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Warm fallback gradient
      const grad = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
      grad.addColorStop(0, '#E65100');
      grad.addColorStop(1, '#1A237E');
      ctx.fillStyle = grad;
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }
    ctx.restore();

    // Procedural Particle Atmosphere
    const effect = visualConfig.current.effectType;

    if (effect === 'park_butterflies_leaves') {
      // Procedural animated yellow butterflies fluttering in foreground
      for (let b = 0; b < 6; b++) {
        const bx = ((b * 95 + Math.sin(elapsed * 1.3 + b * 2) * 55 + elapsed * 22) % width);
        const by = (height * 0.42 + (b * 75 + Math.cos(elapsed * 1.6 + b) * 40) % (height * 0.48));
        const wingFlap = Math.cos(elapsed * 24 + b * 5); // rapid realistic wing flutter
        const bScale = 1.0 + (b % 3) * 0.35;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(Math.sin(elapsed * 2 + b) * 0.25);

        // Soft golden glow aura around butterfly
        ctx.fillStyle = 'rgba(255, 235, 59, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16 * bScale, 0, Math.PI * 2);
        ctx.fill();

        // Wings: warm vibrant yellow and cream
        ctx.fillStyle = b % 2 === 0 ? '#FDD835' : '#FFF59D';
        // Left Wing
        ctx.beginPath();
        ctx.ellipse(-6 * Math.abs(wingFlap), -4, 8 * Math.abs(wingFlap) * bScale, 11 * bScale, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right Wing
        ctx.beginPath();
        ctx.ellipse(6 * Math.abs(wingFlap), -4, 8 * Math.abs(wingFlap) * bScale, 11 * bScale, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Delicate dark body
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.ellipse(0, -2, 1.5 * bScale, 5 * bScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Gentle floating golden leaves and pollen dancing on breeze
      for (let i = 0; i < 16; i++) {
        const lx = (i * 42 + Math.sin(elapsed + i) * 35) % width;
        const ly = (i * 60 + elapsed * 38) % height;
        ctx.fillStyle = 'rgba(255, 238, 88, 0.45)';
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft golden sunbeams filtering from top left
      ctx.save();
      const sunBeamGrad = ctx.createLinearGradient(0, 0, width * 0.8, height * 0.6);
      sunBeamGrad.addColorStop(0, 'rgba(255, 235, 59, 0.18)');
      sunBeamGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.08)');
      sunBeamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunBeamGrad;
      ctx.beginPath();
      ctx.moveTo(-50, -50);
      ctx.lineTo(width * 0.9, -50);
      ctx.lineTo(width * 0.4, height * 0.8);
      ctx.lineTo(-50, height * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (effect === 'race_speedlines') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 14; i++) {
        const sx = ((i * 45 + elapsed * 800) % width);
        const sy = height - ((i * 70 + elapsed * 1000) % (height * 0.7));
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 25, sy + 70);
        ctx.stroke();
      }
    } else if (effect === 'confetti_fireworks') {
      const colors = ['#FFD700', '#FF1744', '#00E676', '#2979FF', '#FF9100', '#E040FB'];
      for (let i = 0; i < 45; i++) {
        const cx = (Math.sin(i + elapsed * 2.5) * 0.5 + 0.5) * width;
        const cy = ((i * 24 + elapsed * 160) % height);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(cx, cy, 7, 9);
      }
    } else {
      // Floating warm particles/leaves
      for (let i = 0; i < 18; i++) {
        const lx = (i * 40 + Math.sin(elapsed + i) * 35) % width;
        const ly = (i * 60 + elapsed * 45) % height;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 235, 59, 0.55)' : 'rgba(129, 199, 132, 0.45)';
        ctx.beginPath();
        ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ANIMATED 3D FOUNTAIN WATER DYNAMICS (Midground Water Jets & Ripples)
    if (effect === 'park_butterflies_leaves') {
      // Fountain position in 9:16 coordinates (center midground)
      const fX = width * 0.505;
      const fY = height * 0.56 + (choreo.camera.panY || 0) * 0.7;

      // Animated Water Jets shooting from fountain
      ctx.save();
      for (let j = 0; j < 5; j++) {
        const jetAngle = -Math.PI / 2 + (j - 2) * 0.28;
        const jetHeight = 18 + Math.sin(elapsed * 6 + j) * 4;
        const jx = fX + Math.cos(jetAngle) * 6;
        const jy = fY - 12;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(jx, jy);
        ctx.quadraticCurveTo(
          jx + Math.sin(j) * 4,
          jy - jetHeight,
          jx + (j - 2) * 12,
          jy + 4
        );
        ctx.stroke();

        // Shimmering water drops catching golden light
        ctx.fillStyle = 'rgba(255, 245, 157, 0.9)';
        ctx.beginPath();
        ctx.arc(jx + (j - 2) * 12, jy + 2 + Math.sin(elapsed * 10 + j) * 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shimmering ripples in fountain basin
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      for (let r = 1; r <= 3; r++) {
        const ripR = ((elapsed * 12 + r * 10) % 28);
        const ripAlpha = Math.max(0, 0.5 - ripR / 28);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fX, fY + 6, ripR * 1.6, ripR * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // FOREGROUND SWAYING OAK BRANCHES & LEAVES (Framing the camera)
    if (effect === 'park_butterflies_leaves' || effect === 'park_leaves') {
      ctx.save();
      const windSway = Math.sin(elapsed * 1.8) * 6 + Math.cos(elapsed * 2.8) * 3;

      // Top-left framing tree branch
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.ellipse(-10 + windSway, -20, 160, 90, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Top-right framing branch
      ctx.fillStyle = '#1B5E20';
      ctx.beginPath();
      ctx.ellipse(width + 15 - windSway, -25, 170, 95, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Soft sun flare shining through swaying leaves
      const flarePulse = 0.25 + Math.sin(elapsed * 2.5) * 0.08;
      const flareGrad = ctx.createRadialGradient(width * 0.12, height * 0.1, 10, width * 0.12, height * 0.1, 140);
      flareGrad.addColorStop(0, `rgba(255, 245, 157, ${flarePulse})`);
      flareGrad.addColorStop(0.5, `rgba(255, 215, 0, ${flarePulse * 0.5})`);
      flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.1, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // RENDER VISUAL TEXT OVERLAYS ONLY IF NOT HIDDEN
    if (!hideVisualText) {
      // Top Cinematic Vignette
      const topGrad = ctx.createLinearGradient(0, 0, 0, 160);
      topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 160);

      // Top HUD Info
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`EPISODIO ${clip.episodeNumber} · SCENA ${clip.sceneNumber}`, 24, 38);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(clip.title, 24, 66);

      // REC Badge & 15-second Timer
      ctx.fillStyle = isPlaying ? 'rgba(239, 68, 68, 0.95)' : 'rgba(156, 163, 175, 0.9)';
      ctx.beginPath();
      ctx.arc(width - 95, 33, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      const secStr = Math.floor(elapsed).toString().padStart(2, '0');
      const msStr = Math.floor((elapsed % 1) * 10).toString();
      ctx.fillText(`00:${secStr}.${msStr} / 00:15`, width - 82, 38);

      // Current Action Situation Badge
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.roundRect(24, 82, width - 48, 28, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(choreo.currentActionBeat, 34, 101);
      ctx.restore();

      // DYNAMIC SPEECH BUBBLE OVERLAY ON CANVAS (if dialogue active)
      if (choreo.activeDialogue) {
        const dlg = choreo.activeDialogue;
        const bubbleY = height - 220;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.roundRect(20, bubbleY, width - 40, 95, 16);
        ctx.fill();
        ctx.strokeStyle = '#FFB300';
        ctx.lineWidth = 2;
        ctx.stroke();

        const isEttore = dlg.speaker.includes('ETTORE');
        const isRex = dlg.speaker.includes('REX');
        ctx.fillStyle = isEttore ? '#E65100' : isRex ? '#1A237E' : '#7B1FA2';
        ctx.beginPath();
        ctx.arc(46, bubbleY + 28, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dlg.speaker[0], 46, bubbleY + 33);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`🐾 ${dlg.speaker}`, 68, bubbleY + 28);

        if (isVoiceEnabled && isPlaying) {
          ctx.fillStyle = '#4ADE80';
          for (let v = 0; v < 4; v++) {
            const barH = 6 + Math.sin(elapsed * 15 + v) * 6;
            ctx.fillRect(width - 50 + v * 6, bubbleY + 24 - barH / 2, 3, barH);
          }
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '15px sans-serif';
        const maxTextWidth = width - 70;
        const words = dlg.text.split(' ');
        let line = '';
        let textY = bubbleY + 54;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line, 36, textY);
            line = words[n] + ' ';
            textY += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 36, textY);
        ctx.restore();
      }

      // Bottom Ambient Soundscape & Subtitle bar
      const bottomGrad = ctx.createLinearGradient(0, height - 100, 0, height);
      bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height - 100, width, 100);

      ctx.fillStyle = '#9E9E9E';
      ctx.font = '11px sans-serif';
      ctx.fillText(`🎵 Soundscape: ${clip.audioNotes.slice(0, 60)}...`, 24, height - 25);

      // Timeline Scrub Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, height - 6, width, 6);
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(0, height - 6, width * progress, 6);
    }

    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    }
  }, [clip, isPlaying, currentTime, autoPlayNext, onNextClip, isVoiceEnabled, hideVisualText]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [renderFrame]);

  const togglePlay = () => {
    if (isPlaying) {
      speechEngine.stop();
      pausedTimeOffsetRef.current = currentTime * 1000;
      setIsPlaying(false);
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
        pausedTimeOffsetRef.current = 0;
        lastSpokenDialogueRef.current = '';
      } else {
        pausedTimeOffsetRef.current = currentTime * 1000;
      }
      startTimeRef.current = performance.now();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    speechEngine.stop();
    lastSpokenDialogueRef.current = '';
    setCurrentTime(0);
    pausedTimeOffsetRef.current = 0;
    startTimeRef.current = performance.now();
    setIsPlaying(true);
    if (!isMuted) {
      audioEngine.playSoundscape(visualConfig.current.soundscape);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.isMuted = nextMute;
  };

  const toggleVoice = () => {
    const nextVoice = !isVoiceEnabled;
    setIsVoiceEnabled(nextVoice);
    speechEngine.isVoiceEnabled = nextVoice;
    if (!nextVoice) {
      speechEngine.stop();
    }
  };

  const toggleVisualText = () => {
    setHideVisualText(!hideVisualText);
  };

  // Video Export in MP4 format
  const recordVideoClip = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordProgress(0);
      handleRestart();

      // Find supported mimeType prioritizing MP4
      let selectedMimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          selectedMimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
          selectedMimeType = 'video/webm;codecs=h264';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          selectedMimeType = 'video/webm;codecs=vp9';
        } else {
          selectedMimeType = 'video/webm';
        }
      }

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps high quality
      });

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = url;
        // Download directly with requested .mp4 extension
        a.download = `Ettore_Rex_Ep${clip.episodeNumber}_Clip${clip.sceneNumber}_${clip.title.replace(/\s+/g, '_')}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordProgress(0);
      };

      recorder.start(100);

      // Track progress timer for user
      const interval = setInterval(() => {
        setRecordProgress((prev) => {
          if (prev >= 15) {
            clearInterval(interval);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 15200);
    } catch (err) {
      console.error('Recording error', err);
      setIsRecording(false);
    }
  };

  // ZIP Export with multi-format selection (9:16, 16:9, o entrambi)
  const exportZipBundle = async (choice: '9:16' | '16:9' | 'both') => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const folderName = `Ettore_Rex_Ep${clip.episodeNumber}_Clip${clip.sceneNumber}_${clip.title.replace(/\s+/g, '_')}`;
      const folder = zip.folder(folderName);

      // Official Copione Prompt Text
      const promptText = `=== CLIP ${clip.sceneNumber} — EPISODIO ${clip.episodeNumber} ===

STILE: Animazione 3D stile Pixar, bambini 4-9 anni, colori vivaci ma morbidi, luce naturale calda, ombre dolci, nessun elemento spaventoso.
FORMATO: ${choice === 'both' ? '9:16 verticale + 16:9 orizzontale' : choice === '16:9' ? '16:9 orizzontale' : '9:16 verticale'}, durata ${duration} secondi.
PERSONAGGI:
- ETTORE: Bulldog francese piccolo paffuto, pelo marrone dorato con macchia bianca petto/punta coda, collare rosso lucido medaglia dorata rotonda, occhi grandi rotondi neri, orecchie piccole a rosa.
- REX: Pastore tedesco grande elegante, pelo nero corvino dorso/muso, marrone caldo zampe/ventre, collare blu notte lucido medaglia argento a stella, occhi marroni a mandorla, orecchie dritte appuntite.
AMBIENTAZIONE: ${clip.environmentName}

SCENA: ${clip.sceneDescription}

AZIONE: ${clip.actionDescription}

REGIA: ${clip.cameraDirection}

AUDIO SUGGERITO: ${clip.audioNotes}
`;
      folder?.file('PROMPT_VIDEO.txt', promptText);

      // Metadata JSON
      folder?.file('scene_metadata.json', JSON.stringify({
        serie: "ETTORE & REX – SULLA PISTA DEI SOGNI",
        episodio: clip.episodeNumber,
        clip: clip.sceneNumber,
        clip_globale: clip.globalNumber,
        titolo: clip.title,
        durata_secondi: duration,
        formati_richiesti: choice,
        personaggi_attivi: clip.activeCharacters,
        stile: "Animazione 3D Pixar, bambini 4-9 anni",
        esportazione_timestamp: new Date().toISOString()
      }, null, 2));

      // Audio cues script
      folder?.file('AUDIO_DOPPIAGGIO.txt', `GUIDA AUDIO & EFFETTI:\n\n- Soundscape: ${clip.audioNotes}\n- Doppiaggio: ${clip.activeCharacters.join(', ')}\n- Durata clip: ${duration} secondi`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}_${choice.replace(':', 'x')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setShowZipModal(false);
    } catch (e) {
      console.error('ZIP export error', e);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className={`bg-stone-950 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center w-full transition-all ${
      aspectRatio === '9:16' ? 'max-w-[420px]' : 'max-w-[660px]'
    }`}>
      {/* Top Header inside Canvas Controller */}
      <div className="w-full flex flex-wrap items-center justify-between mb-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-stone-200">
            Canvas {aspectRatio} Pixar 3D
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Format selector: 9:16 vs 16:9 */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                aspectRatio === '9:16'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Formato 9:16 Verticale"
            >
              <RectangleVertical className="w-3 h-3" /> 9:16
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                aspectRatio === '16:9'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Formato 16:9 Orizzontale"
            >
              <RectangleHorizontal className="w-3 h-3" /> 16:9
            </button>
          </div>

          <button
            onClick={toggleVisualText}
            className={`px-2 py-1 rounded text-[11px] font-semibold border transition flex items-center gap-1 ${
              hideVisualText
                ? 'bg-amber-950 border-amber-600 text-amber-300'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
            title="Mostra / Nascondi testo visivo per una resa cinematografica pura"
          >
            {hideVisualText ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
            <span>{hideVisualText ? 'Senza Testo' : 'Con Testo'}</span>
          </button>

          {onToggleAutoPlayNext && (
            <button
              onClick={onToggleAutoPlayNext}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                autoPlayNext
                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                  : 'bg-stone-900 border-stone-700 text-stone-400'
              }`}
              title="Avanza automaticamente alla clip successiva"
            >
              Autoplay: {autoPlayNext ? 'ON' : 'OFF'}
            </button>
          )}

          {onMarkDone && (
            <button
              onClick={onMarkDone}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                isDone
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isDone ? 'Visto' : 'Segna'}
            </button>
          )}
        </div>
      </div>

      {/* Canvas Display Screen */}
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-800 bg-black flex items-center justify-center transition-all ${
        aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'
      }`}>
        <canvas
          ref={canvasRef}
          width={aspectRatio === '9:16' ? 540 : 960}
          height={aspectRatio === '9:16' ? 960 : 540}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big Play Overlay icon when paused */}
        {!isPlaying && currentTime < duration && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-500 text-stone-950 flex items-center justify-center shadow-xl backdrop-blur-sm transition scale-100 hover:scale-105"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Video Recording indicator banner */}
        {isRecording && (
          <div className="absolute top-4 left-4 right-4 bg-red-600/95 text-white px-3 py-2 rounded-xl text-center text-xs font-bold animate-pulse shadow-2xl z-20 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>Esportazione MP4 in corso: {recordProgress}s / 15s</span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="w-full mt-4 space-y-3">
        {/* Scrub Bar */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
          <span>{Math.floor(currentTime)}s</span>
          <div
            className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              const newTime = clickPos * duration;
              setCurrentTime(newTime);
              pausedTimeOffsetRef.current = newTime * 1000;
              startTimeRef.current = performance.now();
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span>15s</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {onPrevClip && (
              <button
                onClick={onPrevClip}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
                title="Clip precedente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-md shadow-amber-900/30"
              title={isPlaying ? 'Pausa' : 'Avvia'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
              title="Riavvia clip"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl border transition ${
                isVoiceEnabled
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                  : 'bg-stone-900 border-stone-800 text-stone-500'
              }`}
              title={isVoiceEnabled ? 'Doppiaggio Italiano ATTIVO' : 'Doppiaggio Silenziato'}
            >
              {isVoiceEnabled ? <Mic className="w-4 h-4 text-amber-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
              title={isMuted ? 'Riattiva effetti audio' : 'Silenzia effetti audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowZipModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition"
              title="Esporta archivio ZIP con multi-selezione (9:16, 16:9 o entrambi)"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Esporta ZIP</span>
            </button>

            <button
              onClick={recordVideoClip}
              disabled={isRecording}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-xs font-bold text-white transition shadow-md shadow-amber-900/40"
              title={`Esporta video animato a formato ${aspectRatio} in file MP4`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Registra...' : 'Esporta MP4'}</span>
            </button>

            {onNextClip && (
              <button
                onClick={onNextClip}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
                title="Prossima clip"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ZIP Multi-Selection Modal Dialog */}
      {showZipModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Esportazione Pacchetto ZIP</h3>
              </div>
              <button
                onClick={() => setShowZipModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
              >
                Chiudi
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Scegli il formato visivo e le proporzioni da includere nel pacchetto ZIP per la <strong>Clip {clip.sceneNumber} (Episodio {clip.episodeNumber})</strong>:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Selezione Formato Video / Prompt:
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setZipFormatChoice('9:16')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    zipFormatChoice === '9:16'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <RectangleVertical className="w-5 h-5" />
                  <span>9:16 Verticale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZipFormatChoice('16:9')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    zipFormatChoice === '16:9'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <RectangleHorizontal className="w-5 h-5" />
                  <span>16:9 Orizzontale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZipFormatChoice('both')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    zipFormatChoice === 'both'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">9:16 + 16:9</span>
                  <span>Entrambi</span>
                </button>
              </div>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 space-y-1.5 text-xs text-stone-400">
              <span className="font-semibold text-stone-300 block">Contenuto dell'archivio ZIP:</span>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Prompt ufficiale per generatori video ({zipFormatChoice})</li>
                <li>Copione e guida doppiaggio audio suggerito</li>
                <li>Metadati di produzione JSON e specifiche tecniche</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowZipModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => exportZipBundle(zipFormatChoice)}
                disabled={isExportingZip}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-xs font-bold text-white shadow-lg transition"
              >
                {isExportingZip ? 'Creazione ZIP in corso...' : 'Scarica Pacchetto ZIP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
