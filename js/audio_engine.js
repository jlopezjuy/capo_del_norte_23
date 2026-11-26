/**
 * AudioEngine — Web Audio API Synthesizer (Capas reactivas + volúmenes independientes)
 */
(function (global) {
  'use strict';

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.crowdGain = null;
      this.crowdFilter = null;
      this.baseCrowdLevel = 0.18;
      this.volumes = { crowd: 0.8, sfx: 0.9, music: 0.7 };
      this._lastOohTime = 0;
    }

    setCategoryVolume(cat, val) {
      if (cat in this.volumes) {
        this.volumes[cat] = Math.max(0, Math.min(1, Number(val)));
        if (cat === 'crowd' && this.enabled && this.ctx && this.crowdGain) {
          this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * this.volumes.crowd, this.ctx.currentTime, 0.15);
        }
      }
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();

        const bufferSize = this.ctx.sampleRate * 3;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.997 * b0 + white * 0.029;
          b1 = 0.985 * b1 + white * 0.032;
          b2 = 0.950 * b2 + white * 0.048;
          output[i] = (b0 + b1 + b2) * 0.35;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        this.crowdFilter = this.ctx.createBiquadFilter();
        this.crowdFilter.type = 'bandpass';
        this.crowdFilter.frequency.value = 420;
        this.crowdFilter.Q.value = 1.25;

        this.crowdGain = this.ctx.createGain();
        this.crowdGain.gain.value = 0.0;

        source.connect(this.crowdFilter);
        this.crowdFilter.connect(this.crowdGain);
        this.crowdGain.connect(this.ctx.destination);
        source.start(0);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    setEnabled(val) {
      this.enabled = !!val;
      if (this.enabled) {
        if (this.ensureContext() && this.crowdGain) {
          this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * this.volumes.crowd, this.ctx.currentTime, 0.25);
        }
      } else if (this.ctx && this.crowdGain) {
        this.crowdGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.15);
      }
      return this.enabled;
    }

    toggle() {
      return this.setEnabled(!this.enabled);
    }

    setCrowdDanger(danger) {
      if (!this.enabled || !this.ctx || !this.crowdGain) return;
      const clamped = Math.max(0, Math.min(1, danger));
      const targetGain = (this.baseCrowdLevel + clamped * 0.24) * this.volumes.crowd;
      const targetFreq = 410 + clamped * 360;
      this.crowdGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
      this.crowdFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    }

    playCrowdOoh() {
      if (!this.enabled || !this.ctx || !this.crowdGain) return;
      const nowMs = performance.now();
      if (nowMs - this._lastOohTime < 2800) return;
      this._lastOohTime = nowMs;
      const now = this.ctx.currentTime;
      const vol = this.volumes.crowd;
      this.crowdGain.gain.setTargetAtTime(0.45 * vol, now, 0.08);
      this.crowdFilter.frequency.setTargetAtTime(650, now, 0.1);
      this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * vol, now + 0.9, 0.5);
      this.crowdFilter.frequency.setTargetAtTime(420, now + 0.9, 0.5);
    }

    playWhistle(type = 'short') {
      if (!this.enabled || !this.ensureContext() || this.volumes.sfx <= 0.01) return;
      const now = this.ctx.currentTime;
      const sfxGain = 0.09 * this.volumes.sfx;
      const pulse = (start, dur, freq = 2780) => {
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + dur);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(42, start);
        modGain.gain.setValueAtTime(110, start);
        mod.connect(modGain);
        modGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(sfxGain, start + 0.02);
        gain.gain.setValueAtTime(sfxGain, start + dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        mod.start(start);
        osc.stop(start + dur);
        mod.stop(start + dur);
      };

      if (type === 'double') {
        pulse(now, 0.16, 2820);
        pulse(now + 0.22, 0.26, 2860);
      } else if (type === 'fulltime') {
        pulse(now, 0.16, 2800);
        pulse(now + 0.22, 0.16, 2800);
        pulse(now + 0.44, 0.55, 2860);
      } else {
        pulse(now, 0.20, 2780);
      }
    }

    playKick(power = 0.6) {
      if (!this.enabled || !this.ensureContext() || this.volumes.sfx <= 0.01) return;
      const now = this.ctx.currentTime;
      const p = Math.max(0.2, Math.min(1.0, power));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135 + p * 65, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.24 * p * this.volumes.sfx, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    playSave() {
      if (!this.enabled || !this.ensureContext() || this.volumes.sfx <= 0.01) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.14);
      gain.gain.setValueAtTime(0.18 * this.volumes.sfx, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
      this.playCrowdOoh();
    }

    playPostHit() {
      if (!this.enabled || !this.ensureContext() || this.volumes.sfx <= 0.01) return;
      const now = this.ctx.currentTime;
      [620, 940, 1480].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime((0.14 * this.volumes.sfx) / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
      });
    }

    playGoalRoar() {
      if (!this.enabled || !this.ensureContext() || !this.crowdGain) return;
      const now = this.ctx.currentTime;
      const vol = this.volumes.crowd;
      this.crowdGain.gain.setTargetAtTime(0.68 * vol, now, 0.10);
      this.crowdFilter.frequency.setTargetAtTime(820, now, 0.14);
      this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * vol, now + 4.0, 0.9);
      this.crowdFilter.frequency.setTargetAtTime(420, now + 4.0, 0.9);

      const fanfareVol = 0.085 * this.volumes.music;
      if (fanfareVol > 0.002) {
        [261.63, 329.63, 392.0, 523.25].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.065);
          gain.gain.setValueAtTime(fanfareVol, now + i * 0.065);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95 + i * 0.065);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.065);
          osc.stop(now + 1.05 + i * 0.065);
        });
      }
    }
  }

  global.AudioEngine = AudioEngine;
})(window);
