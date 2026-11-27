(function (global) {
  'use strict';

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }

  function createPoseTarget() {
    return {
      bodyY: 0,
      bodyRotX: 0,
      bodyRotY: 0,
      bodyRotZ: 0,
      headRotX: 0,
      headRotY: 0,
      headRotZ: 0,
      armLRotX: 0,
      armLRotZ: 0.14,
      armRRotX: 0,
      armRRotZ: -0.14,
      legLRotX: 0,
      legLRotZ: 0,
      legRRotX: 0,
      legRRotZ: 0,
      tailRotX: 0,
      tailRotY: 0,
      scarfLRotX: 0.1,
      scarfLRotZ: -0.14,
      scarfRRotX: 0.1,
      scarfRRotZ: 0.18,
      earLRotX: 0,
      earLRotZ: 0.22,
      earRRotX: 0,
      earRRotZ: -0.22,
      jawY: -0.19,
      browLRotZ: -0.22,
      browRRotZ: 0.22,
      showSunglasses: false,
      showJuggleBall: false,
      showGiantFlag: false,
      ballX: 0.32,
      ballY: 0.24,
      ballZ: 0.52
    };
  }

  class MascotController {
    constructor(mascotGroup) {
      this.mascot = mascotGroup || null;
      const ud = (mascotGroup && mascotGroup.userData) || {};
      this.homePos = ud.homePos
        ? { x: ud.homePos.x, y: ud.homePos.y || 0, z: ud.homePos.z }
        : { x: -8.5, y: 0, z: -55.4 };

      this.targetPos = { x: this.homePos.x, z: this.homePos.z };
      this.targetRotY = 0;
      this.returningHome = false;
      this.poseTime = 0;
      this.currentPose = 'idle';
      this._target = createPoseTarget();
      this._current = createPoseTarget();
    }

    setMascot(mascotGroup) {
      this.mascot = mascotGroup || null;
      const ud = (mascotGroup && mascotGroup.userData) || {};
      if (ud.homePos) {
        this.homePos = { x: ud.homePos.x, y: ud.homePos.y || 0, z: ud.homePos.z };
      }
    }

    get group() {
      return this.mascot;
    }

    moveTo(x, z, rotY) {
      this.targetPos.x = Number.isFinite(x) ? x : this.homePos.x;
      this.targetPos.z = Number.isFinite(z) ? z : this.homePos.z;
      if (Number.isFinite(rotY)) {
        this.targetRotY = rotY;
      }
      this.returningHome = false;
    }

    returnHome(dt) {
      this.targetPos.x = this.homePos.x;
      this.targetPos.z = this.homePos.z;
      this.targetRotY = 0;
      this.returningHome = true;
      if (this.mascot && dt > 0) {
        const moveAlpha = 1 - Math.exp(-5.0 * dt);
        this.mascot.position.x += (this.homePos.x - this.mascot.position.x) * moveAlpha;
        this.mascot.position.z += (this.homePos.z - this.mascot.position.z) * moveAlpha;
        this.mascot.rotation.y += (0 - this.mascot.rotation.y) * moveAlpha;
      }
    }

    isAtHome(tolerance = 0.25) {
      if (!this.mascot) return true;
      const dx = this.mascot.position.x - this.homePos.x;
      const dz = this.mascot.position.z - this.homePos.z;
      return (dx * dx + dz * dz) <= tolerance * tolerance;
    }

    _computePose(pose, t, state) {
      const p = this._target;
      const reduceMotion = !!(state && state.reduceMotion);
      const motionScale = reduceMotion ? 0.35 : 1.0;
      const excitement = clamp((state && typeof state.excitement === 'number') ? state.excitement : 0.35, 0, 1);

      // Reset to neutral baseline
      p.bodyY = 0;
      p.bodyRotX = 0;
      p.bodyRotY = 0;
      p.bodyRotZ = 0;
      p.headRotX = 0;
      p.headRotY = 0;
      p.headRotZ = 0;
      p.armLRotX = 0;
      p.armLRotZ = 0.14;
      p.armRRotX = 0;
      p.armRRotZ = -0.14;
      p.legLRotX = 0;
      p.legLRotZ = 0;
      p.legRRotX = 0;
      p.legRRotZ = 0;
      p.tailRotX = 0;
      p.tailRotY = Math.sin(t * 5.2) * 0.36 * motionScale;
      p.scarfLRotX = 0.12 + Math.sin(t * 4.4) * 0.08 * motionScale;
      p.scarfLRotZ = -0.14;
      p.scarfRRotX = 0.12 + Math.cos(t * 4.4) * 0.08 * motionScale;
      p.scarfRRotZ = 0.18;
      p.earLRotX = 0;
      p.earLRotZ = 0.22;
      p.earRRotX = 0;
      p.earRRotZ = -0.22;
      p.jawY = -0.19;
      p.browLRotZ = -0.22;
      p.browRRotZ = 0.22;
      p.showSunglasses = !!(state && state.showSunglasses);
      p.showJuggleBall = false;
      p.showGiantFlag = !!(state && state.showGiantFlag);
      p.ballX = 0.32;
      p.ballY = 0.24;
      p.ballZ = 0.52;

      switch (pose) {
        case 'walk':
        case 'run': {
          const speed = pose === 'run' ? 11.0 : 6.5;
          const stride = (pose === 'run' ? 0.72 : 0.45) * motionScale;
          const swing = Math.sin(t * speed);
          p.bodyY = Math.abs(Math.cos(t * speed)) * (pose === 'run' ? 0.16 : 0.07) * motionScale;
          p.bodyRotX = pose === 'run' ? 0.12 * motionScale : 0.04;
          p.legLRotX = swing * stride;
          p.legRRotX = -swing * stride;
          p.armLRotX = -swing * stride * 0.9;
          p.armRRotX = swing * stride * 0.9;
          p.scarfLRotX = 0.35 + Math.sin(t * speed) * 0.16 * motionScale;
          p.scarfRRotX = 0.35 - Math.sin(t * speed) * 0.16 * motionScale;
          p.tailRotY = Math.sin(t * speed * 1.1) * 0.5 * motionScale;
          break;
        }

        case 'jump':
        case 'celebrate': {
          const hop = Math.abs(Math.sin(t * 6.8));
          p.bodyY = hop * (0.68 + excitement * 0.22) * motionScale;
          p.bodyRotY = Math.sin(t * 3.8) * 0.35 * motionScale;
          p.armLRotX = -2.45 + Math.sin(t * 10.5) * 0.35 * motionScale;
          p.armLRotZ = 0.38;
          p.armRRotX = -2.45 - Math.sin(t * 10.5) * 0.35 * motionScale;
          p.armRRotZ = -0.38;
          p.legLRotX = -hop * 0.35 * motionScale;
          p.legRRotX = -hop * 0.35 * motionScale;
          p.headRotX = -0.18;
          p.jawY = -0.24;
          p.tailRotY = Math.sin(t * 12) * 0.65 * motionScale;
          break;
        }

        case 'backflip': {
          const cycle = (t % 1.4) / 1.4;
          if (!reduceMotion && cycle < 0.72) {
            const u = cycle / 0.72;
            p.bodyY = Math.sin(u * Math.PI) * 1.35;
            p.bodyRotX = -u * Math.PI * 2;
            p.armLRotX = -2.2;
            p.armRRotX = -2.2;
            p.legLRotX = -0.65;
            p.legRRotX = -0.65;
          } else {
            p.bodyY = Math.abs(Math.sin(t * 7.5)) * 0.22 * motionScale;
            p.armLRotX = -2.35;
            p.armRRotX = -2.35;
          }
          p.jawY = -0.23;
          break;
        }

        case 'clap': {
          const clap = Math.sin(t * 11.5);
          p.bodyY = Math.abs(Math.sin(t * 5.75)) * 0.08 * motionScale;
          p.armLRotX = -1.25;
          p.armLRotZ = -0.45 + clap * 0.32 * motionScale;
          p.armRRotX = -1.25;
          p.armRRotZ = 0.45 - clap * 0.32 * motionScale;
          p.headRotY = Math.sin(t * 2.8) * 0.14 * motionScale;
          p.tailRotY = Math.sin(t * 8.0) * 0.45 * motionScale;
          break;
        }

        case 'murga': {
          // Bouncy hip sway, alternating drum-beating arm pumps, head bob
          const beat = t * 8.2;
          p.bodyY = Math.abs(Math.sin(beat)) * 0.24 * motionScale;
          p.bodyRotZ = Math.sin(beat * 0.5) * 0.16 * motionScale;
          p.bodyRotY = Math.sin(beat * 0.5) * 0.28 * motionScale;
          p.armLRotX = -1.45 + Math.sin(beat) * 0.75 * motionScale;
          p.armLRotZ = 0.35;
          p.armRRotX = -1.45 - Math.sin(beat) * 0.75 * motionScale;
          p.armRRotZ = -0.35;
          p.legLRotX = Math.max(0, Math.sin(beat)) * 0.48 * motionScale;
          p.legRRotX = Math.max(0, -Math.sin(beat)) * 0.48 * motionScale;
          p.headRotX = Math.sin(beat * 2) * 0.12 * motionScale;
          p.scarfLRotX = 0.38 + Math.sin(beat) * 0.24 * motionScale;
          p.scarfRRotX = 0.38 - Math.sin(beat) * 0.24 * motionScale;
          p.jawY = -0.23;
          break;
        }

        case 'carnavalito': {
          // Crisscross hop, high knees, scarf tails flying, joyful tilt
          const step = t * 7.4;
          const hop = Math.abs(Math.sin(step));
          p.bodyY = hop * 0.34 * motionScale;
          p.bodyRotZ = Math.sin(step * 0.5) * 0.20 * motionScale;
          p.bodyRotY = Math.sin(step * 0.25) * 0.45 * motionScale;
          p.legLRotX = Math.sin(step) * 0.62 * motionScale;
          p.legLRotZ = Math.sin(step * 0.5) * 0.22 * motionScale;
          p.legRRotX = -Math.sin(step) * 0.62 * motionScale;
          p.legRRotZ = -Math.sin(step * 0.5) * 0.22 * motionScale;
          p.armLRotX = -2.1 + Math.sin(step) * 0.45 * motionScale;
          p.armLRotZ = 0.65;
          p.armRRotX = -2.1 - Math.sin(step) * 0.45 * motionScale;
          p.armRRotZ = -0.65;
          p.scarfLRotZ = -0.45 + Math.sin(step) * 0.35 * motionScale;
          p.scarfRRotZ = 0.45 - Math.sin(step) * 0.35 * motionScale;
          p.earLRotZ = 0.32 + Math.sin(step) * 0.12 * motionScale;
          p.earRRotZ = -0.32 - Math.sin(step) * 0.12 * motionScale;
          p.jawY = -0.24;
          break;
        }

        case 'jueguitos': {
          // Alternating knee/foot kicks keeping juggleBall bouncing in the air
          const kick = t * 5.8;
          const s = Math.sin(kick);
          const bounce = Math.abs(s);
          p.showJuggleBall = true;
          p.bodyY = Math.abs(Math.sin(kick * 0.5)) * 0.06 * motionScale;
          p.legLRotX = Math.max(0, s) * -0.78 * motionScale;
          p.legRRotX = Math.max(0, -s) * -0.78 * motionScale;
          p.armLRotX = -0.55;
          p.armLRotZ = 0.48 + s * 0.16 * motionScale;
          p.armRRotX = -0.55;
          p.armRRotZ = -0.48 + s * 0.16 * motionScale;
          p.headRotX = 0.28;
          p.headRotY = s * 0.18 * motionScale;
          p.ballX = s * 0.24;
          p.ballY = 0.36 + (1 - bounce) * 0.85 * (reduceMotion ? 0.55 : 1.0);
          p.ballZ = 0.56;
          break;
        }

        case 'torpe': {
          // 0..1.1s: clumsy spin/flip attempt, 1.1..3.2s: sitting comically on grass, 3.2..4.2s: pop back up
          const phase = t % 4.4;
          if (phase < 1.1) {
            const u = phase / 1.1;
            p.bodyY = Math.sin(u * Math.PI) * 0.55 * motionScale;
            p.bodyRotY = reduceMotion ? u * 0.6 : u * Math.PI * 2;
            p.bodyRotX = Math.sin(u * Math.PI) * 0.45 * motionScale;
            p.armLRotZ = 1.15;
            p.armRRotZ = -1.15;
          } else if (phase < 3.4) {
            p.bodyY = -0.35;
            p.bodyRotX = -0.14;
            p.legLRotX = -Math.PI * 0.46;
            p.legLRotZ = -0.18;
            p.legRRotX = -Math.PI * 0.46;
            p.legRRotZ = 0.18;
            p.armLRotX = -0.25;
            p.armLRotZ = 0.55;
            p.armRRotX = -0.25;
            p.armRRotZ = -0.55;
            p.headRotY = Math.sin(t * 7.2) * 0.35 * motionScale;
            p.headRotZ = Math.cos(t * 5.0) * 0.16 * motionScale;
            p.earLRotZ = 0.55;
            p.earRRotZ = -0.55;
            p.jawY = -0.26;
          } else {
            const u = (phase - 3.4) / 1.0;
            p.bodyY = Math.sin(u * Math.PI) * 0.35 * motionScale;
            p.armLRotX = -1.8;
            p.armRRotX = -1.8;
          }
          break;
        }

        case 'estrella': {
          // Wears sunglasses, strikes hero poses & waves to cameras
          p.showSunglasses = true;
          p.bodyY = Math.abs(Math.sin(t * 3.2)) * 0.08 * motionScale;
          p.bodyRotY = Math.sin(t * 1.4) * 0.32;
          p.armLRotX = -0.35;
          p.armLRotZ = 0.55;
          p.armRRotX = -2.45;
          p.armRRotZ = -0.45 + Math.sin(t * 7.0) * 0.35 * motionScale;
          p.headRotY = Math.sin(t * 1.8) * 0.25;
          p.headRotX = -0.12;
          p.browLRotZ = 0.05;
          p.browRRotZ = -0.05;
          break;
        }

        case 'conductor': {
          // Sweeps both arms conducting the stands
          const sweep = t * 4.2;
          p.bodyY = Math.abs(Math.sin(sweep)) * 0.10 * motionScale;
          p.armLRotX = -1.65 + Math.sin(sweep) * 0.65 * motionScale;
          p.armLRotZ = 0.45 + Math.cos(sweep) * 0.35 * motionScale;
          p.armRRotX = -1.65 + Math.sin(sweep + 0.5) * 0.65 * motionScale;
          p.armRRotZ = -0.45 - Math.cos(sweep + 0.5) * 0.35 * motionScale;
          p.headRotY = Math.sin(sweep * 0.5) * 0.42 * motionScale;
          p.tailRotY = Math.sin(sweep * 1.5) * 0.45 * motionScale;
          break;
        }

        case 'duelo': {
          // Snappy rhythmic alternating dance moves
          const beat = t * 9.0;
          const groove = Math.sin(beat);
          p.bodyY = Math.abs(groove) * 0.20 * motionScale;
          p.bodyRotZ = groove * 0.18 * motionScale;
          p.bodyRotY = Math.sin(beat * 0.5) * 0.42 * motionScale;
          p.armLRotX = -1.35 + groove * 0.85 * motionScale;
          p.armLRotZ = 0.4 + Math.cos(beat) * 0.25 * motionScale;
          p.armRRotX = -1.35 - groove * 0.85 * motionScale;
          p.armRRotZ = -0.4 - Math.cos(beat) * 0.25 * motionScale;
          p.legLRotX = groove * 0.42 * motionScale;
          p.legRRotX = -groove * 0.42 * motionScale;
          p.headRotZ = -groove * 0.15 * motionScale;
          break;
        }

        case 'desfile':
        case 'gigante': {
          // Marches proudly waving giantFlag
          const march = t * 5.6;
          p.showGiantFlag = true;
          p.bodyY = Math.abs(Math.sin(march)) * 0.12 * motionScale;
          p.legLRotX = Math.sin(march) * 0.52 * motionScale;
          p.legRRotX = -Math.sin(march) * 0.52 * motionScale;
          p.armLRotX = -Math.sin(march) * 0.42 * motionScale;
          p.armRRotX = -1.85 + Math.sin(t * 4.5) * 0.28 * motionScale;
          p.armRRotZ = -0.25 + Math.cos(t * 4.5) * 0.22 * motionScale;
          p.headRotX = -0.08;
          p.tailRotY = Math.sin(march) * 0.45 * motionScale;
          break;
        }

        case 'arquero': {
          // Comedic wide-stance ready crouch + exaggerated goofy dives
          const diveDir = (state && typeof state.diveDir === 'number') ? state.diveDir : 0;
          if (diveDir !== 0) {
            p.bodyY = 0.22 * motionScale;
            p.bodyRotZ = -diveDir * 1.15;
            p.armLRotX = -2.3;
            p.armRRotX = -2.3;
            p.legLRotZ = -0.28;
            p.legRRotZ = 0.28;
          } else {
            const sway = Math.sin(t * 6.5);
            p.bodyY = -0.18 + Math.abs(sway) * 0.05 * motionScale;
            p.bodyRotX = 0.18;
            p.legLRotX = -0.24;
            p.legLRotZ = -0.25;
            p.legRRotX = -0.24;
            p.legRRotZ = 0.25;
            p.armLRotX = -0.95;
            p.armLRotZ = 0.72 + sway * 0.15 * motionScale;
            p.armRRotX = -0.95;
            p.armRRotZ = -0.72 - sway * 0.15 * motionScale;
            p.headRotY = sway * 0.22 * motionScale;
          }
          break;
        }

        case 'laugh': {
          const chuckle = Math.abs(Math.sin(t * 14.0));
          p.bodyY = chuckle * 0.08 * motionScale;
          p.bodyRotX = -0.18;
          p.headRotX = -0.25 - chuckle * 0.12 * motionScale;
          p.jawY = -0.26 - chuckle * 0.04;
          p.armLRotX = -0.75;
          p.armLRotZ = -0.22;
          p.armRRotX = -0.75;
          p.armRRotZ = 0.22;
          break;
        }

        case 'shock': {
          p.bodyY = 0.14 * motionScale;
          p.headRotX = -0.12;
          p.jawY = -0.28;
          p.armLRotX = -2.1;
          p.armLRotZ = -0.18;
          p.armRRotX = -2.1;
          p.armRRotZ = 0.18;
          p.earLRotZ = 0.06;
          p.earRRotZ = -0.06;
          p.browLRotZ = 0.18;
          p.browRRotZ = -0.18;
          break;
        }

        case 'frustrated': {
          p.bodyY = -0.06;
          p.bodyRotX = 0.14;
          p.headRotX = 0.22;
          p.headRotY = Math.sin(t * 4.5) * 0.16 * motionScale;
          p.armLRotX = -2.0;
          p.armLRotZ = -0.22;
          p.armRRotX = -2.0;
          p.armRRotZ = 0.22;
          p.earLRotZ = 0.72;
          p.earRRotZ = -0.72;
          p.tailRotX = -0.35;
          p.tailRotY = 0;
          p.browLRotZ = -0.36;
          p.browRRotZ = 0.36;
          break;
        }

        case 'idle':
        default: {
          // Subtle breathing, tail wag, ear twitch, looking at play
          p.bodyY = Math.sin(t * 2.6) * 0.035 * motionScale;
          p.armLRotZ = 0.14 + Math.sin(t * 2.6) * 0.03;
          p.armRRotZ = -0.14 - Math.sin(t * 2.6) * 0.03;
          p.earLRotZ = 0.22 + (Math.sin(t * 1.9) > 0.92 ? 0.14 * motionScale : 0);
          p.earRRotZ = -0.22 - (Math.cos(t * 2.3) > 0.92 ? 0.14 * motionScale : 0);
          if (state && typeof state.lookAtX === 'number' && this.mascot) {
            const dx = state.lookAtX - this.mascot.position.x;
            const dz = (typeof state.lookAtZ === 'number' ? state.lookAtZ : 0) - this.mascot.position.z;
            const angle = Math.atan2(dx, dz) - this.mascot.rotation.y;
            p.headRotY = clamp(angle * 0.45, -0.55, 0.55);
          } else {
            p.headRotY = Math.sin(t * 1.1) * 0.18;
          }
          break;
        }
      }
    }

    update(dt, elapsed, state) {
      if (!this.mascot) return;
      const safeDt = clamp(dt || 0.016, 0.001, 0.1);
      const t = typeof elapsed === 'number' ? elapsed : this.poseTime;
      const st = state || {};
      const pose = st.pose || 'idle';

      if (pose !== this.currentPose) {
        this.currentPose = pose;
        this.poseTime = 0;
      } else {
        this.poseTime += safeDt;
      }

      if (st.targetPos) {
        this.moveTo(st.targetPos.x, st.targetPos.z, st.targetRotY);
      } else if (st.returnHome) {
        this.returnHome(0);
      }

      // Smoothly move mascot root toward targetPos
      const moveLambda = st.moveSpeed || 4.8;
      this.mascot.position.x = damp(this.mascot.position.x, this.targetPos.x, moveLambda, safeDt);
      this.mascot.position.z = damp(this.mascot.position.z, this.targetPos.z, moveLambda, safeDt);
      this.mascot.rotation.y = damp(this.mascot.rotation.y, this.targetRotY, moveLambda, safeDt);

      this._computePose(pose, this.poseTime > 0 ? this.poseTime : t, st);

      const blend = 1 - Math.exp(-12.0 * safeDt);
      const cur = this._current;
      const tgt = this._target;
      const keys = Object.keys(tgt);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (typeof tgt[k] === 'number') {
          cur[k] += (tgt[k] - cur[k]) * blend;
        } else {
          cur[k] = tgt[k];
        }
      }

      const parts = this.mascot.userData || {};
      if (parts.bodyPivot) {
        parts.bodyPivot.position.y = cur.bodyY;
        parts.bodyPivot.rotation.set(cur.bodyRotX, cur.bodyRotY, cur.bodyRotZ);
      } else {
        this.mascot.position.y = cur.bodyY;
      }

      if (parts.head) parts.head.rotation.set(cur.headRotX, cur.headRotY, cur.headRotZ);
      if (parts.armL) parts.armL.rotation.set(cur.armLRotX, 0, cur.armLRotZ);
      if (parts.armR) parts.armR.rotation.set(cur.armRRotX, 0, cur.armRRotZ);
      if (parts.legL) parts.legL.rotation.set(cur.legLRotX, 0, cur.legLRotZ);
      if (parts.legR) parts.legR.rotation.set(cur.legRRotX, 0, cur.legRRotZ);
      if (parts.tail) parts.tail.rotation.set(cur.tailRotX, cur.tailRotY, 0);
      if (parts.scarfL) parts.scarfL.rotation.set(cur.scarfLRotX, 0, cur.scarfLRotZ);
      if (parts.scarfR) parts.scarfR.rotation.set(cur.scarfRRotX, 0, cur.scarfRRotZ);
      if (parts.earL) parts.earL.rotation.set(cur.earLRotX, 0, cur.earLRotZ);
      if (parts.earR) parts.earR.rotation.set(cur.earRRotX, 0, cur.earRRotZ);
      if (parts.jaw) parts.jaw.position.y = cur.jawY;
      if (parts.browL) parts.browL.rotation.z = cur.browLRotZ;
      if (parts.browR) parts.browR.rotation.z = cur.browRRotZ;

      if (parts.sunglasses) parts.sunglasses.visible = !!cur.showSunglasses;
      if (parts.juggleBall) {
        parts.juggleBall.visible = !!cur.showJuggleBall;
        if (parts.juggleBall.visible) {
          parts.juggleBall.position.set(cur.ballX, cur.ballY, cur.ballZ);
          parts.juggleBall.rotation.x += safeDt * 6.0;
          parts.juggleBall.rotation.z += safeDt * 4.0;
        }
      }
      if (parts.giantFlag) {
        parts.giantFlag.visible = !!cur.showGiantFlag;
      }
    }
  }

  const BREAK_PHASES = new Set(['HALFTIME', 'GOAL_CELEBRATION', 'FULLTIME']);
  const NON_PLAYING_PHASES = new Set(['MENU', 'LOBBY', 'HALFTIME', 'GOAL_CELEBRATION', 'FULLTIME', 'ARCADE_CHALLENGE']);

  const EVENTS = [
    {
      id: 'murguero',
      title: '¡Lobito Murguero!',
      subtitle: 'Suena el bombo y el redoblante en la tribuna',
      pose: 'murga',
      audioCue: 'murga',
      cameraFocus: 'mascot',
      wave: true,
      confetti: false,
      maxDuration: 8.5,
      priority: 2
    },
    {
      id: 'carnavalito',
      title: '¡Carnaval del Norte!',
      subtitle: 'Paso alegre al ritmo de la quena y el charango',
      pose: 'carnavalito',
      audioCue: 'carnavalito',
      cameraFocus: 'mascot',
      wave: true,
      confetti: true,
      maxDuration: 9.0,
      priority: 2
    },
    {
      id: 'futbolista',
      title: '¡Lobito Futbolista!',
      subtitle: 'Jueguitos sin que caiga la pelota',
      pose: 'jueguitos',
      audioCue: 'boing',
      cameraFocus: 'mascot',
      wave: false,
      confetti: false,
      maxDuration: 8.0,
      priority: 2
    },
    {
      id: 'torpe',
      title: '¡Ups! Pirueta Fallida',
      subtitle: 'Lobito intentó una vuelta mortal y cayó sentado',
      pose: 'torpe',
      audioCue: 'slip',
      cameraFocus: 'mascot',
      wave: false,
      confetti: false,
      maxDuration: 6.5,
      priority: 3
    },
    {
      id: 'estrella',
      title: '¡Lobito Estrella!',
      subtitle: 'Lentes listos para las cámaras del estadio',
      pose: 'estrella',
      audioCue: 'fanfare',
      cameraFocus: 'mascot',
      wave: true,
      confetti: false,
      maxDuration: 7.5,
      priority: 2
    },
    {
      id: 'conductor',
      title: '¡Director de Tribuna!',
      subtitle: 'La hinchada sigue la batuta del Lobito',
      pose: 'conductor',
      audioCue: 'ole',
      cameraFocus: 'stands',
      wave: true,
      confetti: false,
      maxDuration: 8.0,
      priority: 2
    },
    {
      id: 'duelo',
      title: '¡Duelo de Baile!',
      subtitle: 'Ritmo imparable en el Estadio de los Cerros',
      pose: 'duelo',
      audioCue: 'murga',
      cameraFocus: 'mascot',
      wave: true,
      confetti: false,
      maxDuration: 8.5,
      priority: 2
    },
    {
      id: 'gigante',
      title: '¡Bandera Gigante!',
      subtitle: 'Flamean los colores celeste y blanco',
      pose: 'desfile',
      audioCue: 'ole',
      cameraFocus: 'mascot',
      wave: true,
      confetti: true,
      maxDuration: 8.5,
      priority: 3
    },
    {
      id: 'arquero',
      title: '¡Lobito Arquero!',
      subtitle: 'Atajadas cómicas bajo los tres palos',
      pose: 'arquero',
      audioCue: 'boing',
      cameraFocus: 'goal',
      wave: false,
      confetti: false,
      maxDuration: 7.5,
      priority: 2
    },
    {
      id: 'desfile',
      title: '¡Desfile del Lobito!',
      subtitle: 'Vuelta olímpica saludando a toda la popular',
      pose: 'desfile',
      audioCue: 'carnavalito',
      cameraFocus: 'mascot',
      wave: true,
      confetti: true,
      maxDuration: 9.0,
      priority: 2
    }
  ];

  const EASTER_EGGS = [
    {
      id: 'easter_giant_flag',
      title: '¡Sorpresa! Bandera XL',
      subtitle: '¡Lobito sacó la bandera gigante secreta!',
      pose: 'desfile',
      audioCue: 'fanfare',
      cameraFocus: 'mascot',
      wave: true,
      confetti: true,
      maxDuration: 8.0,
      priority: 4
    },
    {
      id: 'easter_copy_trip',
      title: '¡Tropiezo Legendario!',
      subtitle: 'Patinazo épico con saludo de estrella incluido',
      pose: 'torpe',
      audioCue: 'slip',
      cameraFocus: 'mascot',
      wave: false,
      confetti: true,
      maxDuration: 7.0,
      priority: 4
    }
  ];

  const FREQUENCY_COOLDOWNS = {
    occasional: 24,
    frequent: 12,
    breaks_only: 10,
    off: Infinity
  };

  class MascotEventDirector {
    constructor(options) {
      const opts = options || {};
      this.frequency = opts.frequency || 'occasional';
      this.activeEvent = null;
      this.eventTimer = 0;
      this.lastTriggerRealSec = -999;
      this._eventCursor = 0;
      this._rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
      this.easterEggCount = 0;
    }

    setFrequency(mode) {
      if (Object.prototype.hasOwnProperty.call(FREQUENCY_COOLDOWNS, mode)) {
        this.frequency = mode;
      } else {
        this.frequency = 'occasional';
      }
      if (this.frequency === 'off') {
        this.cancel();
      }
      return this.frequency;
    }

    getFrequency() {
      return this.frequency;
    }

    get active() {
      return this.activeEvent;
    }

    canTriggerBreakEvent(ctx) {
      const c = ctx || {};
      if (this.frequency === 'off') return false;
      if (c.phase === 'PLAYING') return false;
      if (this.activeEvent) return false;

      if (this.frequency === 'breaks_only') {
        if (!BREAK_PHASES.has(c.phase) && !c.celebrationActive) return false;
      } else if (!NON_PLAYING_PHASES.has(c.phase) && !c.celebrationActive && !c.challengeActive) {
        return false;
      }

      const elapsedRealSec = typeof c.elapsedRealSec === 'number' ? c.elapsedRealSec : 0;
      const cooldown = FREQUENCY_COOLDOWNS[this.frequency] || 120;
      if (elapsedRealSec - this.lastTriggerRealSec < cooldown) {
        return false;
      }
      return true;
    }

    _findEventDef(eventId) {
      for (let i = 0; i < EVENTS.length; i++) {
        if (EVENTS[i].id === eventId) return EVENTS[i];
      }
      for (let i = 0; i < EASTER_EGGS.length; i++) {
        if (EASTER_EGGS[i].id === eventId) return EASTER_EGGS[i];
      }
      return null;
    }

    triggerEvent(eventId, ctx) {
      const c = ctx || {};
      if (this.frequency === 'off') return null;

      let def = this._findEventDef(eventId);
      if (!def) {
        def = EVENTS[this._eventCursor % EVENTS.length];
        this._eventCursor++;
      }

      if (this.activeEvent && def.priority < this.activeEvent.priority) {
        return null;
      }

      const isPlaying = c.phase === 'PLAYING';
      const allowPitchEntry = !isPlaying && (
        BREAK_PHASES.has(c.phase) ||
        c.phase === 'LOBBY' ||
        c.phase === 'MENU' ||
        c.phase === 'ARCADE_CHALLENGE' ||
        !!c.celebrationActive ||
        !!c.challengeActive
      );

      const started = {
        id: def.id,
        title: def.title,
        subtitle: def.subtitle,
        pose: isPlaying ? 'celebrate' : def.pose,
        audioCue: def.audioCue,
        cameraFocus: isPlaying ? 'none' : def.cameraFocus,
        wave: def.wave,
        confetti: isPlaying ? false : def.confetti,
        priority: def.priority,
        maxDuration: isPlaying ? Math.min(def.maxDuration, 3.5) : def.maxDuration,
        allowPitchEntry
      };

      this.activeEvent = started;
      this.eventTimer = 0;
      if (typeof c.elapsedRealSec === 'number') {
        this.lastTriggerRealSec = c.elapsedRealSec;
      }
      return started;
    }

    cancel() {
      const had = this.activeEvent;
      this.activeEvent = null;
      this.eventTimer = 0;
      return had;
    }

    update(dt, ctx) {
      const c = ctx || {};
      const safeDt = clamp(dt || 0, 0, 0.25);

      // Strict Safety Rule: NEVER allow pitch entry or active break show during PLAYING
      if (c.phase === 'PLAYING') {
        if (this.activeEvent && this.activeEvent.allowPitchEntry) {
          this.cancel();
        }
        let sidelinePose = 'idle';
        if (c.homeAttack || (typeof c.excitement === 'number' && c.excitement > 0.65)) {
          sidelinePose = 'celebrate';
        } else if (typeof c.excitement === 'number' && c.excitement > 0.38) {
          sidelinePose = 'clap';
        }
        return {
          activeEvent: null,
          sidelinePose,
          allowPitchEntry: false,
          returnHome: true
        };
      }

      if (this.activeEvent) {
        this.eventTimer += safeDt;
        if (this.eventTimer >= this.activeEvent.maxDuration) {
          this.cancel();
        }
      }

      if (!this.activeEvent && this.canTriggerBreakEvent(c)) {
        const roll = this._rng();
        let chosen;
        if (roll < 0.05) {
          chosen = EASTER_EGGS[Math.floor(this._rng() * EASTER_EGGS.length) % EASTER_EGGS.length];
          this.easterEggCount++;
        } else {
          chosen = EVENTS[this._eventCursor % EVENTS.length];
          this._eventCursor++;
        }
        this.triggerEvent(chosen.id, c);
      }

      return {
        activeEvent: this.activeEvent,
        sidelinePose: this.activeEvent ? this.activeEvent.pose : 'idle',
        allowPitchEntry: this.activeEvent ? this.activeEvent.allowPitchEntry : false,
        returnHome: !this.activeEvent
      };
    }
  }

  MascotEventDirector.EVENTS = EVENTS.slice();
  MascotEventDirector.EASTER_EGGS = EASTER_EGGS.slice();

  global.MascotController = MascotController;
  global.MascotEventDirector = MascotEventDirector;
})(typeof window !== 'undefined' ? window : globalThis);
