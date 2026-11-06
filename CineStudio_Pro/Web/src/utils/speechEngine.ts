// High-Fidelity Studio Vocal Speech Engine using Gemini AI TTS & Natural Audio Playback

export class SpeechEngine {
  private currentAudio: HTMLAudioElement | null = null;
  public isVoiceEnabled: boolean = true;
  private currentSpeaker: string | null = null;
  private onSpeakingChange: ((isSpeaking: boolean, speaker: string | null) => void) | null = null;
  private audioCache = new Map<string, string>(); // text:speaker -> audioUrl / dataUrl

  public setSpeakingListener(listener: (isSpeaking: boolean, speaker: string | null) => void) {
    this.onSpeakingChange = listener;
  }

  public async speakDialogue(text: string, speaker: string, genderHint?: string): Promise<void> {
    if (!this.isVoiceEnabled) return;
    const cleanText = (text || '').trim();
    if (!cleanText) return;

    // Stop currently playing audio
    this.stop();

    const cacheKey = `${speaker}:${cleanText}`;
    this.currentSpeaker = speaker;
    if (this.onSpeakingChange) this.onSpeakingChange(true, speaker);

    try {
      let audioSrc = this.audioCache.get(cacheKey);

      if (!audioSrc) {
        const res = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            speaker,
            genderHint
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioUrl) {
            audioSrc = data.audioUrl;
          } else if (data.audioBase64) {
            audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          }
          if (audioSrc) {
            this.audioCache.set(cacheKey, audioSrc);
          }
        }
      }

      if (audioSrc) {
        const audio = new Audio(audioSrc);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentSpeaker = null;
          this.currentAudio = null;
          if (this.onSpeakingChange) this.onSpeakingChange(false, null);
        };

        audio.onerror = () => {
          this.fallbackSpeechSynthesis(cleanText, speaker);
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('[SpeechEngine] AI TTS failed, falling back to Web Speech', e);
    }

    // Fallback if API is unreachable
    this.fallbackSpeechSynthesis(cleanText, speaker);
  }

  private fallbackSpeechSynthesis(text: string, speaker: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.currentSpeaker = null;
      if (this.onSpeakingChange) this.onSpeakingChange(false, null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';

      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('it'));
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }

      utterance.onend = () => {
        this.currentSpeaker = null;
        if (this.onSpeakingChange) this.onSpeakingChange(false, null);
      };
      utterance.onerror = () => {
        this.currentSpeaker = null;
        if (this.onSpeakingChange) this.onSpeakingChange(false, null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.currentSpeaker = null;
      if (this.onSpeakingChange) this.onSpeakingChange(false, null);
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentSpeaker = null;
    if (this.onSpeakingChange) this.onSpeakingChange(false, null);
  }
}

export const speechEngine = new SpeechEngine();
