/**
 * Procedural Audio Synthesizer & Speech Engine
 * 100% Free, Browser-Native, No paid external APIs needed.
 */

// Helper to convert AudioBuffer to WAV Blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  
  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  
  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Procedurally generates SFX using Web Audio API synthesis
   */
  public async generateSfxBlob(sfxType: string, duration = 2.0): Promise<Blob> {
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    switch (sfxType) {
      case 'engine_rev': {
        // V8 Roar for Cars style
        const osc = offlineCtx.createOscillator();
        const osc2 = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        const filter = offlineCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc2.type = 'sawtooth';

        // Pitch ramp up and down
        osc.frequency.setValueAtTime(80, 0);
        osc.frequency.exponentialRampToValueAtTime(320, duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(140, duration);

        osc2.frequency.setValueAtTime(82, 0);
        osc2.frequency.exponentialRampToValueAtTime(324, duration * 0.4);
        osc2.frequency.exponentialRampToValueAtTime(142, duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, 0);
        filter.frequency.exponentialRampToValueAtTime(2500, duration * 0.4);
        filter.frequency.exponentialRampToValueAtTime(900, duration);

        gain.gain.setValueAtTime(0.01, 0);
        gain.gain.linearRampToValueAtTime(0.4, 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, duration);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc2.start(0);
        osc.stop(duration);
        osc2.stop(duration);
        break;
      }

      case 'laser_blast': {
        // Superhero laser whoosh
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600, 0);
        osc.frequency.exponentialRampToValueAtTime(80, duration * 0.6);

        gain.gain.setValueAtTime(0.4, 0);
        gain.gain.exponentialRampToValueAtTime(0.001, duration * 0.6);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration * 0.6);
        break;
      }

      case 'cinematic_boom': {
        // Marvel/Hollywood low trailer boom
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, 0);
        osc.frequency.exponentialRampToValueAtTime(30, duration * 0.9);

        gain.gain.setValueAtTime(0.6, 0);
        gain.gain.exponentialRampToValueAtTime(0.001, duration);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration);
        break;
      }

      case 'cartoon_boing': {
        // Pixar Toy Story style comedic bounce
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, 0);
        osc.frequency.exponentialRampToValueAtTime(750, duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(400, duration * 0.8);

        gain.gain.setValueAtTime(0.5, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, duration * 0.8);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(0);
        osc.stop(duration * 0.8);
        break;
      }

      case 'tire_screech': {
        // High pitch screech
        const bufferSize = sampleRate * duration;
        const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = offlineCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, 0);
        filter.Q.setValueAtTime(6, 0);

        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(0.3, 0);
        gain.gain.exponentialRampToValueAtTime(0.01, duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(offlineCtx.destination);

        whiteNoise.start(0);
        whiteNoise.stop(duration);
        break;
      }

      default: {
        // Silent buffer
        break;
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWav(renderedBuffer);
  }

  /**
   * Play SFX directly in browser for immediate audition
   */
  public async playSfxLive(sfxType: string): Promise<void> {
    const ctx = this.getContext();
    const duration = 1.5;

    switch (sfxType) {
      case 'engine_rev': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 1.2);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        break;
      }
      case 'laser_blast': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
        break;
      }
      case 'cinematic_boom': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        break;
      }
      case 'cartoon_boing': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
        break;
      }
      case 'tire_screech': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(2100, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
        break;
      }
    }
  }

  /**
   * Speak line with Web Speech API for immediate playback
   */
  public speakLine(text: string, pitch = 1.0, rate = 1.0, voiceName?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      if (voiceName) {
        const found = voices.find(v => v.name === voiceName);
        if (found) utterance.voice = found;
      } else {
        // Pick Italian or English voice based on availability
        const itVoice = voices.find(v => v.lang.startsWith('it'));
        if (itVoice) utterance.voice = itVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Mix multiple WAV/Audio blobs into a single continuous track
   */
  public async mixAudioBlobs(blobs: { blob: Blob; startSecond: number }[], totalDurationSeconds: number): Promise<Blob> {
    const sampleRate = 44100;
    const duration = Math.max(1, totalDurationSeconds);
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);

    for (const item of blobs) {
      try {
        const arrayBuf = await item.blob.arrayBuffer();
        const audioBuffer = await offlineCtx.decodeAudioData(arrayBuf);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(Math.max(0, item.startSecond));
      } catch (err) {
        console.warn('Audio decode notice:', err);
      }
    }

    const rendered = await offlineCtx.startRendering();
    return audioBufferToWav(rendered);
  }
}

export const audioEngine = new AudioEngine();
