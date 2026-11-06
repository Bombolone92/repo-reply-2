// Web Audio API procedural audio effects for Ettore & Rex 3D animation scenes

class AudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSoundscape(type: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      if (type === 'race_engine') {
        // Synthesize dynamic engine rev
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.8);
        osc.frequency.exponentialRampToValueAtTime(140, now + 1.8);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);
      } else if (type === 'victory_fanfare') {
        // Triumphant major chord brass/fanfare
        const freqs = [392, 493.88, 587.33, 783.99]; // G chord
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.1);

          gain.gain.setValueAtTime(0.05, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + 1.8);
        });
      } else if (type === 'cafe_jazz') {
        // Cozy vibraphone / glass chime
        const chimeFreqs = [523.25, 659.25, 783.99];
        chimeFreqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.15);

          gain.gain.setValueAtTime(0.07, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + 1.2);
        });
      } else {
        // Gentle park birds / flute melody
        const melody = [440, 554.37, 659.25];
        melody.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.2);

          gain.gain.setValueAtTime(0.04, now + idx * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.2);
          osc.stop(now + 1.0);
        });
      }
    } catch (e) {
      console.warn('AudioEngine error', e);
    }
  }

  public playBarkClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const audioEngine = new AudioEngine();
