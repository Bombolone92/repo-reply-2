import JSZip from 'jszip';
import { Episode, SeriesProject } from '../types';

export function generateSrtSubtitles(episode: Episode): string {
  let srtContent = '';
  let counter = 1;
  let currentSecond = 0;

  for (const clip of episode.clips) {
    const clipStart = currentSecond;
    const clipDuration = clip.durationSeconds;

    if (clip.dialogues && clip.dialogues.length > 0) {
      const sliceTime = clipDuration / clip.dialogues.length;
      for (let i = 0; i < clip.dialogues.length; i++) {
        const dlg = clip.dialogues[i];
        const start = clipStart + (i * sliceTime);
        const end = start + sliceTime;

        srtContent += `${counter}\n`;
        srtContent += `${formatSrtTime(start)} --> ${formatSrtTime(end)}\n`;
        srtContent += `${dlg.text}\n\n`;
        counter++;
      }
    }
    currentSecond += clipDuration;
  }

  return srtContent;
}

function formatSrtTime(seconds: number): string {
  const pad = (num: number, size = 2) => ('000' + num).slice(-size);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

export function generateFFmpegConcatScript(episode: Episode): string {
  let listTxt = '# Lista clip per FFmpeg concat demuxer\n';
  episode.clips.forEach((_, idx) => {
    const clipIndexStr = String(idx + 1).padStart(3, '0');
    listTxt += `file 'video_clips/clip_${clipIndexStr}.webm'\n`;
  });
  return listTxt;
}

export function generateWindowsBatchScript(episodeNumber: number): string {
  return `@echo off
echo ===================================================
echo  UNIONE AUTOMATICA EPISODIO ${episodeNumber} CON FFMPEG (GRATUITO)
echo ===================================================
echo.
echo Controllo se ffmpeg e installato...
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [ATTENZIONE] ffmpeg non e stato trovato nel PATH di Windows.
    echo Puoi scaricare ffmpeg gratuito da https://ffmpeg.org oppure
    echo importare le singole clip e l'audio direttamente in CapCut, Premiere o DaVinci!
    pause
    exit /b
)

echo 1. Concatenazione video in corso...
ffmpeg -f concat -safe 0 -i timeline_montaggio/lista_file_ffmpeg.txt -c copy temp_video.webm -y

echo 2. Fusione video con traccia audio dell'episodio...
if exist "audio_tracce\\audio_completo_episodio.wav" (
    ffmpeg -i temp_video.webm -i audio_tracce/audio_completo_episodio.wav -c:v copy -c:a aac -shortest "EPISODIO_${episodeNumber}_FINALE.mp4" -y
    del temp_video.webm
    echo.
    echo [SUCCESSO!] Episodio finale pronto: EPISODIO_${episodeNumber}_FINALE.mp4
) else (
    ren temp_video.webm "EPISODIO_${episodeNumber}_FINALE.webm"
    echo [SUCCESSO!] Video concatenato pronto: EPISODIO_${episodeNumber}_FINALE.webm
)
pause
`;
}

export function generateMacLinuxScript(episodeNumber: number): string {
  return `#!/bin/bash
echo "=== Unione Automatica Episodio ${episodeNumber} ==="
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg non trovato. Importa le clip in CapCut, Premiere o DaVinci Resolve."
    exit 1
fi

ffmpeg -f concat -safe 0 -i timeline_montaggio/lista_file_ffmpeg.txt -c copy temp_video.webm -y

if [ -f "audio_tracce/audio_completo_episodio.wav" ]; then
    ffmpeg -i temp_video.webm -i audio_tracce/audio_completo_episodio.wav -c:v copy -c:a aac -shortest "EPISODIO_${episodeNumber}_FINALE.mp4" -y
    rm temp_video.webm
    echo "Completato: EPISODIO_${episodeNumber}_FINALE.mp4"
else
    mv temp_video.webm "EPISODIO_${episodeNumber}_FINALE.webm"
    echo "Completato: EPISODIO_${episodeNumber}_FINALE.webm"
fi
`;
}

export function generateReadmeGuide(project: SeriesProject, episode: Episode): string {
  return `======================================================================
   GUIDA MONTAGGIO LOCALE PC - ${project.title.toUpperCase()}
   Episodio ${episode.episodeNumber}: ${episode.title}
======================================================================

Questo pacchetto ZIP contiene tutto il materiale generato dal software,
suddiviso in scene da ${project.defaultClipDuration}s per un totale di ${episode.clips.length} clip.

CONTENUTO DELLE CARTELLE:
1. /video_clips/
   Contiene le singole clip video 3D renderizzate (.webm) numerate in ordine cronologico.
2. /audio_tracce/
   Contiene:
   - audio_completo_episodio.wav (la colonna sonora/dialoghi/sfx di tutto l'episodio sincronizzato)
   - i singoli file audio di ciascuna clip (dialoghi + sfx sintetizzati)
3. /sottotitoli/
   - File .srt sincronizzato pronto per essere attivato su YouTube / TikTok o nel player video.
4. /timeline_montaggio/
   - timeline_edl.json con la durata esatta di ogni clip
   - Script automatico di unione:
     * Per Windows: fai doppio click su "UNISCI_AUTOMATICO_WINDOWS.bat"
     * Per Mac/Linux: esegui "bash UNISCI_AUTOMATICO_MAC_LINUX.sh"

METODO RAPIDO (SENZA PROGRAMMARE):
Trascina semplicemente tutti i file video dalla cartella 'video_clips'
e il file 'audio_completo_episodio.wav' dentro CapCut (gratuito) o Premiere/DaVinci.
Tutti i blocchi si allineeranno automaticamente sulla timeline!
`;
}

export async function createEpisodeZipBundle(
  project: SeriesProject,
  episode: Episode,
  renderedClips: Map<string, Blob>,
  audioBlobs: Map<string, Blob>,
  fullEpisodeAudioBlob?: Blob
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `EPISODIO_${String(episode.episodeNumber).padStart(2, '0')}_${episode.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const root = zip.folder(folderName) || zip;

  const videoFolder = root.folder('video_clips');
  const audioFolder = root.folder('audio_tracce');
  const srtFolder = root.folder('sottotitoli');
  const timelineFolder = root.folder('timeline_montaggio');

  // Add video clips
  episode.clips.forEach((clip, idx) => {
    const clipIndexStr = String(idx + 1).padStart(3, '0');
    const blob = renderedClips.get(clip.id) || clip.recordedVideoBlob;
    if (blob && videoFolder) {
      videoFolder.file(`clip_${clipIndexStr}.webm`, blob);
    }
  });

  // Add individual audio clips
  episode.clips.forEach((clip, idx) => {
    const clipIndexStr = String(idx + 1).padStart(3, '0');
    const blob = audioBlobs.get(clip.id) || clip.recordedAudioBlob;
    if (blob && audioFolder) {
      audioFolder.file(`clip_${clipIndexStr}_audio.wav`, blob);
    }
  });

  // Add full mixed audio
  if (fullEpisodeAudioBlob && audioFolder) {
    audioFolder.file('audio_completo_episodio.wav', fullEpisodeAudioBlob);
  }

  // Add SRT Subtitles
  if (srtFolder) {
    const srtText = generateSrtSubtitles(episode);
    srtFolder.file(`sottotitoli_ep_${episode.episodeNumber}.srt`, srtText);
  }

  // Add timeline files & scripts
  if (timelineFolder) {
    timelineFolder.file('lista_file_ffmpeg.txt', generateFFmpegConcatScript(episode));
    timelineFolder.file('UNISCI_AUTOMATICO_WINDOWS.bat', generateWindowsBatchScript(episode.episodeNumber));
    timelineFolder.file('UNISCI_AUTOMATICO_MAC_LINUX.sh', generateMacLinuxScript(episode.episodeNumber));
    timelineFolder.file('timeline_edl.json', JSON.stringify({
      seriesTitle: project.title,
      episodeNumber: episode.episodeNumber,
      defaultClipDuration: project.defaultClipDuration,
      clipsCount: episode.clips.length,
      clips: episode.clips.map(c => ({
        id: c.id,
        clipNumber: c.clipNumber,
        durationSeconds: c.durationSeconds,
        title: c.title,
        camera: c.cameraMovement,
        sfx: c.sfx
      }))
    }, null, 2));
  }

  // Add Guide & Project backup
  root.file('GUIDA_MONTAGGIO_PC.txt', generateReadmeGuide(project, episode));
  root.file('PROGETTO_SERIE_BACKUP.json', JSON.stringify(project, null, 2));

  // Add Open-Source Ecosystem & Python/C++ Pipeline scripts
  const openSourceFolder = root.folder('pipeline_python_cpp_opensource');
  if (openSourceFolder) {
    const {
      generatePythonPipelineScript,
      generateBlenderPythonScript,
      generateComfyUiWorkflowJson,
      generateWindowsAutomatedVenvLauncher,
      generateMacLinuxAutomatedVenvLauncher
    } = await import('./openSourcePipelines');

    openSourceFolder.file('pipeline_render_serie.py', generatePythonPipelineScript(project, episode));
    openSourceFolder.file('blender_render_3d.py', generateBlenderPythonScript(project, episode));
    openSourceFolder.file('workflow_comfyui_wan21.json', generateComfyUiWorkflowJson(episode.clips[0]));
    openSourceFolder.file('requirements_opensource.txt', 'torch\ntorchvision\ndiffusers\ntransformers\naccelerate\npiper-tts\nffmpeg-python\n');
    openSourceFolder.file('AVVIA_AUTOMATICO_WINDOWS.bat', generateWindowsAutomatedVenvLauncher(episode.episodeNumber));
    openSourceFolder.file('AVVIA_AUTOMATICO_MAC_LINUX.sh', generateMacLinuxAutomatedVenvLauncher(episode.episodeNumber));
  }

  return await zip.generateAsync({ type: 'blob' });
}
