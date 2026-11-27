/**
 * AudioEngine — Reactive Layered Stadium Audio Engine
 * Pure Web Audio API synthesis + Jujuy_Match_Point.mp3 background track with dynamic ducking.
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
      this._lastDrumTime = 0;
      this._drumStep = 0;
      this._lastWhooshTime = 0;
      this._lastMascotAudioTime = 0;
      this._sfxNoiseBuffer = null;

      // Dynamic ducking state for background track
      this._bgDuckMultiplier = 1.0;
      this._bgDuckTimeout = null;
      this._bgDuckInterval = null;

      this.bgTrack = null;
      if (typeof Audio !== 'undefined') {
        try {
          this.bgTrack = new Audio('Jujuy_Match_Point.mp3');
          this.bgTrack.loop = true;
          this.bgTrack.preload = 'auto';
          this.bgTrack.volume = this._getBgTargetVolume();
        } catch (_) {
          this.bgTrack = null;
        }
      }
    }

    _jitter(range = 0.08) {
      return 1 + (Math.random() * 2 - 1) * range;
    }

    _nowMs() {
      return (typeof performance !== 'undefined' && typeof performance.now === 'function')
        ? performance.now()
        : Date.now();
    }

    _getBgTargetVolume() {
      return Math.max(0, Math.min(1, this.volumes.music * 0.45 * this._bgDuckMultiplier));
    }

    _applyBgVolume() {
      if (!this.bgTrack) return;
      try {
        this.bgTrack.volume = this._getBgTargetVolume();
      } catch (_) {
        // Ignore read-only volume restrictions on restricted mobile environments
      }
    }

    _clearBgDuckTimers() {
      if (this._bgDuckTimeout) {
        clearTimeout(this._bgDuckTimeout);
        this._bgDuckTimeout = null;
      }
      if (this._bgDuckInterval) {
        clearInterval(this._bgDuckInterval);
        this._bgDuckInterval = null;
      }
    }

    _duckBgTrack(duckFactor = 0.24, holdMs = 3600, restoreMs = 750) {
      if (!this.bgTrack) return;
      this._clearBgDuckTimers();
      this._bgDuckMultiplier = Math.max(0.05, Math.min(1.0, duckFactor));
      this._applyBgVolume();

      this._bgDuckTimeout = setTimeout(() => {
        this._bgDuckTimeout = null;
        const startMult = this._bgDuckMultiplier;
        const steps = 15;
        const stepMs = Math.max(20, Math.floor(restoreMs / steps));
        let idx = 0;
        this._bgDuckInterval = setInterval(() => {
          idx += 1;
          const t = Math.min(1, idx / steps);
          this._bgDuckMultiplier = startMult + (1.0 - startMult) * t;
          this._applyBgVolume();
          if (idx >= steps) {
            this._bgDuckMultiplier = 1.0;
            this._applyBgVolume();
            clearInterval(this._bgDuckInterval);
            this._bgDuckInterval = null;
          }
        }, stepMs);
      }, holdMs);
    }

    setCategoryVolume(cat, val) {
      if (cat in this.volumes) {
        this.volumes[cat] = Math.max(0, Math.min(1, Number(val)));
        if (cat === 'crowd' && this.enabled && this.ctx && this.crowdGain) {
          try {
            this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * this.volumes.crowd, this.ctx.currentTime, 0.15);
          } catch (_) {}
        }
        if (cat === 'music') {
          this._applyBgVolume();
        }
      }
    }

    ensureContext() {
      try {
        if (!this.ctx) {
          const AudioCtx = global.AudioContext || global.webkitAudioContext;
          if (!AudioCtx) return false;
          this.ctx = new AudioCtx();

          // Pink-ish stadium ambience bed buffer (3s loop)
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

          // Reusable 1s white noise buffer for transient SFX (kick leather, net swish, whoosh, cheer shimmer)
          const sfxSize = this.ctx.sampleRate;
          this._sfxNoiseBuffer = this.ctx.createBuffer(1, sfxSize, this.ctx.sampleRate);
          const sfxData = this._sfxNoiseBuffer.getChannelData(0);
          for (let i = 0; i < sfxSize; i++) {
            sfxData[i] = Math.random() * 2 - 1;
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
          const p = this.ctx.resume();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        return true;
      } catch (_) {
        return false;
      }
    }

    _canPlayAudio() {
      if (!this.enabled || !this.ensureContext() || !this.ctx) return false;
      return this.ctx.state !== 'closed';
    }

    setEnabled(val) {
      this.enabled = !!val;
      if (this.enabled) {
        if (this.ensureContext() && this.crowdGain && this.ctx) {
          try {
            this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * this.volumes.crowd, this.ctx.currentTime, 0.25);
          } catch (_) {}
        }
        if (this.bgTrack) {
          this._applyBgVolume();
          try {
            const p = this.bgTrack.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch (_) {}
        }
      } else {
        this._clearBgDuckTimers();
        this._bgDuckMultiplier = 1.0;
        if (this.ctx && this.crowdGain) {
          try {
            this.crowdGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.15);
          } catch (_) {}
        }
        if (this.bgTrack) {
          try {
            this.bgTrack.pause();
          } catch (_) {}
        }
      }
      return this.enabled;
    }

    toggle() {
      return this.setEnabled(!this.enabled);
    }

    setCrowdDanger(danger) {
      if (!this.enabled || !this.ctx || !this.crowdGain || !this.crowdFilter) return;
      const clamped = Math.max(0, Math.min(1, Number(danger) || 0));
      try {
        const targetGain = (this.baseCrowdLevel + clamped * 0.26) * this.volumes.crowd;
        const targetFreq = 410 + clamped * 380;
        this.crowdGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
        this.crowdFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
      } catch (_) {}

      if (clamped > 0.55) {
        this.playCrowdChantPulse(clamped);
      }
    }

    /**
     * Warm low-end stadium drum ("bombo") rhythmic thump when attack danger is high.
     * Rate-limited so it builds rhythmic tension without spamming.
     */
    playCrowdChantPulse(intensity = 0.7) {
      if (!this._canPlayAudio() || this.volumes.crowd <= 0.01) return;
      const nowMs = this._nowMs();
      // Syncopated stadium bombo rhythm (alternating 480ms / 340ms / 620ms)
      const cadence = [480, 340, 620];
      const minGap = cadence[this._drumStep % cadence.length];
      if (nowMs - this._lastDrumTime < minGap) return;
      this._lastDrumTime = nowMs;
      this._drumStep = (this._drumStep + 1) % cadence.length;

      try {
        const now = this.ctx.currentTime;
        const clamped = Math.max(0.25, Math.min(1.0, Number(intensity) || 0.7));
        const jitter = this._jitter(0.05);
        const drumVol = (0.11 + clamped * 0.12) * this.volumes.crowd;

        // Low resonant drum shell
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(92 * jitter, now);
        osc.frequency.exponentialRampToValueAtTime(44 * jitter, now + 0.17);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(drumVol, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);

        // Muffled drumhead leather attack
        if (this._sfxNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this._sfxNoiseBuffer;
          const lp = this.ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(240 * jitter, now);
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(drumVol * 0.45, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

          noise.connect(lp);
          lp.connect(nGain);
          nGain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + 0.085);
        }
      } catch (_) {}
    }

    playCrowdOoh() {
      if (!this.enabled || !this.ctx || !this.crowdGain || !this.crowdFilter) return;
      const nowMs = this._nowMs();
      if (nowMs - this._lastOohTime < 2800) return;
      this._lastOohTime = nowMs;
      try {
        const now = this.ctx.currentTime;
        const vol = this.volumes.crowd;
        this.crowdGain.gain.setTargetAtTime(0.46 * vol, now, 0.08);
        this.crowdFilter.frequency.setTargetAtTime(660, now, 0.1);
        this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * vol, now + 0.9, 0.5);
        this.crowdFilter.frequency.setTargetAtTime(420, now + 0.9, 0.5);
      } catch (_) {}
    }

    playWhistle(type = 'short') {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const sfxGain = 0.09 * this.volumes.sfx;
        const pitchVar = this._jitter(0.08);

        const pulse = (start, dur, baseFreq = 2780) => {
          const freq = baseFreq * pitchVar;
          const osc = this.ctx.createOscillator();
          const mod = this.ctx.createOscillator();
          const modGain = this.ctx.createGain();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.045, start + dur);

          mod.type = 'sine';
          mod.frequency.setValueAtTime(42 * this._jitter(0.06), start);
          modGain.gain.setValueAtTime(110, start);
          mod.connect(modGain);
          modGain.connect(osc.frequency);

          gain.gain.setValueAtTime(0.001, start);
          gain.gain.linearRampToValueAtTime(sfxGain, start + 0.02);
          gain.gain.setValueAtTime(sfxGain, start + Math.max(0.03, dur - 0.03));
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          mod.start(start);
          osc.stop(start + dur + 0.01);
          mod.stop(start + dur + 0.01);
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
      } catch (_) {}
    }

    /**
     * Layered football kick: leather pop noise burst + body thump + sub-bass boom on power shots.
     */
    playKick(power = 0.6, isShot = false) {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const p = Math.max(0.2, Math.min(1.0, Number(power) || 0.6));
        const jitter = this._jitter(0.08);
        const sfxVol = this.volumes.sfx;

        // Layer 1: Body thump oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime((135 + p * 68) * jitter, now);
        osc.frequency.exponentialRampToValueAtTime(40 * jitter, now + 0.12);

        gain.gain.setValueAtTime(0.24 * p * sfxVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);

        // Layer 2: Crisp leather pop (short filtered noise burst)
        if (this._sfxNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this._sfxNoiseBuffer;
          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime((1150 + p * 520) * this._jitter(0.08), now);
          bp.Q.value = 1.75;

          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.001, now);
          nGain.gain.linearRampToValueAtTime((0.16 + p * 0.14) * sfxVol, now + 0.004);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

          noise.connect(bp);
          bp.connect(nGain);
          nGain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + 0.055);
        }

        // Layer 3: Punchy sub-bass boom for power shots
        if (isShot && p > 0.65) {
          const sub = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(88 * jitter, now);
          sub.frequency.exponentialRampToValueAtTime(34, now + 0.19);

          subGain.gain.setValueAtTime(0.001, now);
          subGain.gain.linearRampToValueAtTime(0.26 * p * sfxVol, now + 0.008);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

          sub.connect(subGain);
          subGain.connect(this.ctx.destination);
          sub.start(now);
          sub.stop(now + 0.22);
        }
      } catch (_) {}
    }

    /**
     * Crisp high-bandpass filtered noise swish (1800-3200Hz over 0.28s) when the ball hits the net.
     */
    playNetSwish(strength = 0.8) {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01 || !this._sfxNoiseBuffer) return;
      try {
        const now = this.ctx.currentTime;
        const s = Math.max(0.25, Math.min(1.2, Number(strength) || 0.8));
        const jitter = this._jitter(0.08);
        const sfxVol = this.volumes.sfx;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this._sfxNoiseBuffer;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(Math.min(3200, 2900 * jitter), now);
        bp.frequency.exponentialRampToValueAtTime(Math.max(1800, 1880 * jitter), now + 0.28);
        bp.Q.value = 1.45;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22 * s * sfxVol, now + 0.022);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.30);

        // Secondary light mesh ripple
        const ripple = this.ctx.createBufferSource();
        ripple.buffer = this._sfxNoiseBuffer;
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'bandpass';
        hp.frequency.setValueAtTime(2400 * jitter, now + 0.055);
        hp.Q.value = 2.0;

        const rGain = this.ctx.createGain();
        rGain.gain.setValueAtTime(0.001, now + 0.055);
        rGain.gain.linearRampToValueAtTime(0.09 * s * sfxVol, now + 0.08);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        ripple.connect(hp);
        hp.connect(rGain);
        rGain.connect(this.ctx.destination);
        ripple.start(now + 0.055);
        ripple.stop(now + 0.28);
      } catch (_) {}
    }

    /**
     * Light quick swoosh on dribble feint.
     */
    playDribbleWhoosh() {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01 || !this._sfxNoiseBuffer) return;
      const nowMs = this._nowMs();
      if (nowMs - this._lastWhooshTime < 240) return;
      this._lastWhooshTime = nowMs;

      try {
        const now = this.ctx.currentTime;
        const jitter = this._jitter(0.08);
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._sfxNoiseBuffer;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(520 * jitter, now);
        bp.frequency.exponentialRampToValueAtTime(1480 * jitter, now + 0.065);
        bp.frequency.exponentialRampToValueAtTime(640 * jitter, now + 0.14);
        bp.Q.value = 2.2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.095 * this.volumes.sfx, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.145);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.16);
      } catch (_) {}
    }

    playSave() {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const jitter = this._jitter(0.08);
        const sfxVol = this.volumes.sfx;

        // Glove impact thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220 * jitter, now);
        osc.frequency.exponentialRampToValueAtTime(72 * jitter, now + 0.14);
        gain.gain.setValueAtTime(0.19 * sfxVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // Latex glove slap transient
        if (this._sfxNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this._sfxNoiseBuffer;
          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(920 * this._jitter(0.08), now);
          bp.Q.value = 1.4;
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.14 * sfxVol, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
          noise.connect(bp);
          bp.connect(nGain);
          nGain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + 0.065);
        }
      } catch (_) {}
      this.playCrowdOoh();
    }

    playPostHit() {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const baseJitter = this._jitter(0.08);
        const sfxVol = this.volumes.sfx;
        [620, 940, 1480, 2110].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq * baseJitter * this._jitter(0.015), now);
          gain.gain.setValueAtTime((0.145 * sfxVol) / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.50);
        });
      } catch (_) {}
    }

    _playTone(freq, startTime, duration, volume, type = 'triangle', endFreq = null, cutoff = 2400) {
      if (!this.ctx || volume <= 0.001) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration * 0.72);
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    }

    _playMurgaBombo(startTime, volume, jitter = 1) {
      if (!this.ctx || volume <= 0.001) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75 * jitter, startTime);
      osc.frequency.exponentialRampToValueAtTime(38 * jitter, startTime + 0.16);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.24);

      if (this._sfxNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._sfxNoiseBuffer;
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(250 * jitter, startTime);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.001, startTime);
        nGain.gain.linearRampToValueAtTime(volume * 0.42, startTime + 0.004);
        nGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

        noise.connect(lp);
        lp.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(startTime);
        noise.stop(startTime + 0.07);
      }
    }

    _playRedoblanteHit(startTime, volume, accent = 1.0, isRollGhost = false) {
      if (!this.ctx || volume <= 0.001) return;
      const hitVol = volume * accent;
      const decay = isRollGhost ? 0.045 : 0.085;

      if (this._sfxNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._sfxNoiseBuffer;
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(isRollGhost ? 2100 : 1650, startTime);
        hp.Q.value = 0.85;

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.001, startTime);
        nGain.gain.linearRampToValueAtTime(hitVol, startTime + 0.003);
        nGain.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

        noise.connect(hp);
        hp.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(startTime);
        noise.stop(startTime + decay + 0.015);
      }

      if (!isRollGhost) {
        const shell = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        shell.type = 'triangle';
        shell.frequency.setValueAtTime(195 * this._jitter(0.04), startTime);
        shell.frequency.exponentialRampToValueAtTime(118, startTime + 0.045);

        sGain.gain.setValueAtTime(0.001, startTime);
        sGain.gain.linearRampToValueAtTime(hitVol * 0.35, startTime + 0.003);
        sGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

        shell.connect(sGain);
        sGain.connect(this.ctx.destination);
        shell.start(startTime);
        shell.stop(startTime + 0.06);
      }
    }

    /**
     * Original procedural Argentine stadium murga percussion groove (bombo + redoblante).
     */
    playMurgaRhythm(duration = 2.6, options = {}) {
      if (!this._canPlayAudio() || this.volumes.music <= 0.01) return;
      const nowMs = this._nowMs();
      if (!options.force && nowMs - this._lastMascotAudioTime < 1200) return;
      this._lastMascotAudioTime = nowMs;

      const dur = Math.max(0.8, Math.min(6.0, Number(duration) || 2.6));
      if (!options.skipDuck) {
        this._duckBgTrack(0.24, Math.round(dur * 1000), 650);
      }

      try {
        const now = this.ctx.currentTime;
        const musicVol = this.volumes.music;
        const bomboVol = 0.24 * musicVol;
        const snareVol = 0.13 * musicVol;
        const stepSec = 0.114; // ~132 BPM 16th-note grid

        // 16-step syncopated murga bombo accents
        const bomboPattern = {
          0: 1.0,
          3: 0.78,
          6: 0.88,
          8: 0.96,
          11: 0.75,
          14: 0.85
        };

        // 16-step redoblante roll + rim accents
        const snarePattern = {
          2: { acc: 0.85, ghost: false },
          4: { acc: 0.95, ghost: false },
          5: { acc: 0.42, ghost: true },
          7: { acc: 0.75, ghost: false },
          9: { acc: 0.40, ghost: true },
          10: { acc: 0.80, ghost: false },
          12: { acc: 1.0, ghost: false },
          13: { acc: 0.55, ghost: true },
          15: { acc: 0.72, ghost: true }
        };

        const totalSteps = Math.floor(dur / stepSec);
        for (let step = 0; step < totalSteps; step++) {
          const t = now + step * stepSec;
          const idx = step % 16;

          if (bomboPattern[idx]) {
            this._playMurgaBombo(t, bomboVol * bomboPattern[idx], this._jitter(0.035));
          }
          if (snarePattern[idx]) {
            const s = snarePattern[idx];
            this._playRedoblanteHit(t, snareVol, s.acc, s.ghost);
          }
        }
      } catch (_) {}
    }

    _playQuenaNote(freq, startTime, noteDur, volume) {
      if (!this.ctx || volume <= 0.001) return;
      const osc = this.ctx.createOscillator();
      const harm = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq, startTime);

      // Gentle Andean flute vibrato
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5.4, startTime);
      lfoGain.gain.setValueAtTime(freq * 0.011, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(harm.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, startTime);

      const hGain = this.ctx.createGain();
      hGain.gain.setValueAtTime(0.32, startTime);

      const atk = Math.min(0.038, noteDur * 0.25);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + atk);
      gain.gain.setValueAtTime(volume * 0.88, startTime + Math.max(atk, noteDur - 0.05));
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDur);

      osc.connect(filter);
      harm.connect(hGain);
      hGain.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      harm.start(startTime);
      lfo.start(startTime);
      osc.stop(startTime + noteDur + 0.02);
      harm.stop(startTime + noteDur + 0.02);
      lfo.stop(startTime + noteDur + 0.02);

      // Subtle breath air transient
      if (this._sfxNoiseBuffer) {
        const breath = this.ctx.createBufferSource();
        breath.buffer = this._sfxNoiseBuffer;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(Math.min(3400, freq * 1.9), startTime);
        bp.Q.value = 2.4;

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0.001, startTime);
        bGain.gain.linearRampToValueAtTime(volume * 0.09, startTime + atk);
        bGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(noteDur, 0.14));

        breath.connect(bp);
        bp.connect(bGain);
        bGain.connect(this.ctx.destination);
        breath.start(startTime);
        breath.stop(startTime + Math.min(noteDur, 0.15));
      }
    }

    _playCharangoPluck(freqs, startTime, volume) {
      if (!this.ctx || volume <= 0.001) return;
      freqs.forEach((f, idx) => {
        const t = startTime + idx * 0.016;
        const osc = this.ctx.createOscillator();
        const hp = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        hp.type = 'highpass';
        hp.frequency.setValueAtTime(340, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        osc.connect(hp);
        hp.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.145);
      });
    }

    /**
     * Original procedural Carnavalito jujeno pentatonic motif (quena + charango + bombo).
     */
    playCarnavalitoMotif(duration = 2.6, options = {}) {
      if (!this._canPlayAudio() || this.volumes.music <= 0.01) return;
      const nowMs = this._nowMs();
      if (!options.force && nowMs - this._lastMascotAudioTime < 1200) return;
      this._lastMascotAudioTime = nowMs;

      const dur = Math.max(0.8, Math.min(6.0, Number(duration) || 2.6));
      if (!options.skipDuck) {
        this._duckBgTrack(0.24, Math.round(dur * 1000), 650);
      }

      try {
        const now = this.ctx.currentTime;
        const musicVol = this.volumes.music;
        const quenaVol = 0.13 * musicVol;
        const charangoVol = 0.055 * musicVol;
        const bomboVol = 0.19 * musicVol;

        // D minor / F major Andean pentatonic scale: D5, F5, G5, A5, C6
        const D5 = 587.33;
        const F5 = 698.46;
        const G5 = 783.99;
        const A5 = 880.0;
        const C6 = 1046.5;

        const phrase = [
          { f: D5, offset: 0.0, len: 0.18 },
          { f: F5, offset: 0.18, len: 0.16 },
          { f: G5, offset: 0.34, len: 0.18 },
          { f: A5, offset: 0.52, len: 0.28 },
          { f: G5, offset: 0.82, len: 0.16 },
          { f: F5, offset: 0.98, len: 0.18 },
          { f: D5, offset: 1.16, len: 0.24 },
          { f: F5, offset: 1.42, len: 0.16 },
          { f: G5, offset: 1.58, len: 0.16 },
          { f: A5, offset: 1.74, len: 0.18 },
          { f: C6, offset: 1.92, len: 0.28 },
          { f: A5, offset: 2.22, len: 0.16 },
          { f: G5, offset: 2.38, len: 0.18 },
          { f: D5, offset: 2.56, len: 0.32 }
        ];

        const phraseLen = 2.88;
        const cycles = Math.ceil(dur / phraseLen);
        for (let c = 0; c < cycles; c++) {
          const base = c * phraseLen;
          phrase.forEach((n) => {
            const rel = base + n.offset;
            if (rel < dur - 0.08) {
              const clampedLen = Math.min(n.len, dur - rel);
              this._playQuenaNote(n.f * this._jitter(0.008), now + rel, clampedLen, quenaVol);
            }
          });
        }

        // Charango rhythmic strums every 0.24s (alternating Dm and F/C triads)
        const chords = [
          [293.66, 440.0, 587.33], // Dm
          [349.23, 523.25, 698.46] // F/C
        ];
        const strumStep = 0.24;
        const numStrums = Math.floor((dur - 0.08) / strumStep);
        for (let i = 0; i < numStrums; i++) {
          const t = now + i * strumStep;
          const chord = chords[Math.floor(i / 2) % chords.length];
          const accent = i % 2 === 0 ? 1.0 : 0.72;
          this._playCharangoPluck(chord, t, charangoVol * accent);
        }

        // Steady carnavalito bombo pulse every 0.48s
        const bomboStep = 0.48;
        const numBombos = Math.floor((dur - 0.06) / bomboStep);
        for (let b = 0; b < numBombos; b++) {
          this._playMurgaBombo(now + b * bomboStep, bomboVol, this._jitter(0.03));
        }
      } catch (_) {}
    }

    /**
     * Playful comedic synth reactions for Lobito mascot events & goalkeeper dives.
     */
    playLobitoReaction(kind = 'happy') {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const sfxVol = this.volumes.sfx;
        const jitter = this._jitter(0.05);

        if (kind === 'torpe' || kind === 'slip') {
          // Classic cartoon slide-whistle down + comedic soft boing
          const slide = this.ctx.createOscillator();
          const sGain = this.ctx.createGain();
          slide.type = 'sine';
          slide.frequency.setValueAtTime(1120 * jitter, now);
          slide.frequency.exponentialRampToValueAtTime(235 * jitter, now + 0.34);

          sGain.gain.setValueAtTime(0.001, now);
          sGain.gain.linearRampToValueAtTime(0.12 * sfxVol, now + 0.02);
          sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

          slide.connect(sGain);
          sGain.connect(this.ctx.destination);
          slide.start(now);
          slide.stop(now + 0.38);

          // Soft comedic boing
          const boing = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          const boingStart = now + 0.28;
          boing.type = 'triangle';
          boing.frequency.setValueAtTime(155 * jitter, boingStart);
          boing.frequency.linearRampToValueAtTime(290 * jitter, boingStart + 0.08);
          boing.frequency.exponentialRampToValueAtTime(175 * jitter, boingStart + 0.24);

          bGain.gain.setValueAtTime(0.001, boingStart);
          bGain.gain.linearRampToValueAtTime(0.14 * sfxVol, boingStart + 0.015);
          bGain.gain.exponentialRampToValueAtTime(0.001, boingStart + 0.26);

          boing.connect(bGain);
          bGain.connect(this.ctx.destination);
          boing.start(boingStart);
          boing.stop(boingStart + 0.28);
        } else if (kind === 'save') {
          // Bouncy comic spring sound for Lobito Arquero dive
          const spring = this.ctx.createOscillator();
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          const gain = this.ctx.createGain();

          spring.type = 'triangle';
          spring.frequency.setValueAtTime(220 * jitter, now);
          spring.frequency.linearRampToValueAtTime(460 * jitter, now + 0.14);
          spring.frequency.exponentialRampToValueAtTime(280 * jitter, now + 0.30);

          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(18, now);
          lfoGain.gain.setValueAtTime(42, now);
          lfo.connect(lfoGain);
          lfoGain.connect(spring.frequency);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.15 * sfxVol, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          spring.connect(gain);
          gain.connect(this.ctx.destination);
          spring.start(now);
          lfo.start(now);
          spring.stop(now + 0.34);
          lfo.stop(now + 0.34);
        } else {
          // 'happy' / 'estrella': cheerful playful rising synth chirp
          const chirps = [
            { start: 0.0, f0: 520, f1: 960, dur: 0.11 },
            { start: 0.11, f0: 760, f1: 1340, dur: 0.16 }
          ];
          chirps.forEach((c) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(c.f0 * jitter, now + c.start);
            osc.frequency.exponentialRampToValueAtTime(c.f1 * jitter, now + c.start + c.dur);

            gain.gain.setValueAtTime(0.001, now + c.start);
            gain.gain.linearRampToValueAtTime(0.12 * sfxVol, now + c.start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + c.start + c.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + c.start);
            osc.stop(now + c.start + c.dur + 0.015);
          });
        }
      } catch (_) {}
    }

    /**
     * Crisp arcade target-hit chime ascending with combo (1..8) + bonus major triad sparkle.
     */
    playChallengeHit(combo = 1, isBonus = false) {
      if (!this._canPlayAudio() || this.volumes.sfx <= 0.01) return;
      try {
        const now = this.ctx.currentTime;
        const sfxVol = this.volumes.sfx;
        const idx = Math.max(1, Math.min(8, Math.round(Number(combo) || 1))) - 1;
        const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66];
        const baseFreq = scale[idx] * this._jitter(0.015);

        // Fundamental chime + crisp octave harmonic
        this._playTone(baseFreq, now, 0.24, 0.14 * sfxVol, 'triangle', null, 3400);
        this._playTone(baseFreq * 2, now, 0.18, 0.07 * sfxVol, 'sine', null, 4200);

        if (isBonus) {
          const triad = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
          triad.forEach((f, i) => {
            this._playTone(f, now + 0.045 + i * 0.032, 0.28, 0.095 * sfxVol, 'sine', null, 4800);
          });
        }
      } catch (_) {}
    }

    _playFanfareCue(audioCue, now, baseVol) {
      if (baseVol <= 0.002) return;

      if (audioCue === 'wolf_howl') {
        // Dramatic rising stadium horn chord with soaring wolf-howl glide
        this._playTone(220.0, now, 1.35, baseVol * 0.95, 'sawtooth', 329.63, 1400);
        this._playTone(329.63, now + 0.14, 1.30, baseVol * 0.85, 'sawtooth', 440.0, 1650);
        this._playTone(440.0, now + 0.28, 1.35, baseVol * 0.80, 'triangle', 587.33, 2100);
        this._playTone(146.83, now, 1.45, baseVol * 0.70, 'triangle', null, 850);
      } else if (audioCue === 'epic') {
        // Triumphant stadium brass arpeggio
        const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 783.99];
        notes.forEach((freq, i) => {
          const t = now + i * 0.085;
          this._playTone(freq, t, 1.05, baseVol * 0.85, 'sawtooth', null, 1850);
          this._playTone(freq * 0.5, t, 1.05, baseVol * 0.45, 'triangle', null, 950);
        });
      } else if (audioCue === 'carnival') {
        // Bright rhythmic major chord fanfare + festive double-hit
        const stabs = [
          { t: 0.0, freqs: [261.63, 329.63, 392.0], dur: 0.24 },
          { t: 0.22, freqs: [293.66, 369.99, 440.0], dur: 0.22 },
          { t: 0.42, freqs: [329.63, 392.0, 523.25], dur: 0.95 }
        ];
        stabs.forEach((st) => {
          st.freqs.forEach((f) => {
            this._playTone(f, now + st.t, st.dur, baseVol * 0.72, 'triangle', null, 2600);
          });
        });
        this.playCrowdChantPulse(1.0);
      } else if (audioCue === 'arcade') {
        // Punchy retro-modern synth power chord
        const lead = [523.25, 659.25, 783.99, 1046.5];
        lead.forEach((f, i) => {
          this._playTone(f, now + i * 0.055, 0.55, baseVol * 0.62, 'square', null, 2400);
        });
        this._playTone(130.81, now, 0.85, baseVol * 0.85, 'sawtooth', null, 720);
        this._playTone(261.63, now + 0.16, 0.90, baseVol * 0.75, 'sawtooth', null, 1500);
      } else if (audioCue === 'quake') {
        // Deep seismic bass impact + heavy brass power chord
        this._playTone(112.0, now, 0.68, baseVol * 1.45, 'sine', 32.0, 420);
        this._playTone(130.81, now + 0.08, 1.25, baseVol * 0.92, 'sawtooth', null, 980);
        this._playTone(196.0, now + 0.14, 1.20, baseVol * 0.82, 'sawtooth', null, 1250);
        this._playTone(261.63, now + 0.20, 1.15, baseVol * 0.75, 'triangle', null, 1600);
      } else {
        // 'stadium' — classic football anthem brass chord
        [261.63, 329.63, 392.0, 523.25].forEach((freq, i) => {
          this._playTone(freq, now + i * 0.065, 1.05, baseVol * 0.90, 'triangle', null, 2200);
          this._playTone(freq * 0.5, now + i * 0.065, 1.05, baseVol * 0.42, 'sawtooth', null, 1100);
        });
      }
    }

    playGoalRoar(isHomeGoal = true, audioCue = 'stadium') {
      if (!this._canPlayAudio() || !this.crowdGain || !this.crowdFilter) return;

      // Dynamically duck Jujuy_Match_Point.mp3 during goal reaction and restore smoothly after ~3.8s
      this._duckBgTrack(isHomeGoal ? 0.22 : 0.38, isHomeGoal ? 3600 : 2200, 800);

      try {
        const now = this.ctx.currentTime;
        const crowdVol = this.volumes.crowd;

        if (!isHomeGoal) {
          // Brief stunned crowd hush + low groan (no celebratory home fanfare)
          this.crowdGain.gain.setTargetAtTime(0.06 * crowdVol, now, 0.09);
          this.crowdFilter.frequency.setTargetAtTime(260, now, 0.12);
          this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * crowdVol, now + 2.4, 0.75);
          this.crowdFilter.frequency.setTargetAtTime(420, now + 2.4, 0.75);

          if (crowdVol > 0.02) {
            this._playTone(168, now + 0.05, 0.95, 0.065 * crowdVol, 'triangle', 118, 420);
          }
          return;
        }

        // Massive home crowd roar surge
        this.crowdGain.gain.setTargetAtTime(0.72 * crowdVol, now, 0.09);
        this.crowdFilter.frequency.setTargetAtTime(880, now, 0.12);
        this.crowdGain.gain.setTargetAtTime(this.baseCrowdLevel * crowdVol, now + 4.0, 0.9);
        this.crowdFilter.frequency.setTargetAtTime(420, now + 4.0, 0.9);

        // Bright upper cheer shimmer burst for unmistakable stadium roar
        if (this._sfxNoiseBuffer && crowdVol > 0.02) {
          const cheer = this.ctx.createBufferSource();
          cheer.buffer = this._sfxNoiseBuffer;
          cheer.loop = true;

          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(1350, now);
          bp.Q.value = 0.9;

          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0.001, now);
          cGain.gain.linearRampToValueAtTime(0.14 * crowdVol, now + 0.18);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

          cheer.connect(bp);
          bp.connect(cGain);
          cGain.connect(this.ctx.destination);
          cheer.start(now);
          cheer.stop(now + 2.5);
        }

        // Distinct celebration fanfare motif per audioCue
        if (audioCue === 'murga') {
          this.playMurgaRhythm(2.8, { force: true, skipDuck: true });
        } else if (audioCue === 'carnavalito') {
          this.playCarnavalitoMotif(2.8, { force: true, skipDuck: true });
        } else {
          const fanfareVol = 0.09 * this.volumes.music;
          this._playFanfareCue(audioCue || 'stadium', now, fanfareVol);
        }
      } catch (_) {}
    }
  }

  global.AudioEngine = AudioEngine;
})(window);
