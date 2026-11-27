/**
 * ArcadeChallengeManager — Minijuego "Desafío del Lobito" y Medallas de Habilidad Saludables.
 * Se juega en el arco Norte (z = -52.5) con dos sub-desafíos:
 *  - 'targets': Tiro al Blanco & Penales Locos (3 aros 3D luminosos en el arco)
 *  - 'crossbar': Desafío del Travesaño (barra luminosa en y = 2.44, z = -52.5)
 * Compatible con Three.js r128 y perfil Escenario A (branding independiente).
 */
(function (global) {
  'use strict';

  const BEST_STORAGE_KEY = 'pasion_challenge_best_v1';
  const MEDALS_STORAGE_KEY = 'pasion_medals_v1';
  const NORTH_GOAL_Z = -52.5;
  const SHOT_LINE_Z = -52.1;
  const GOAL_HALF_W = 3.66;
  const CROSSBAR_Y = 2.44;
  const ROUND_DURATION = 60;
  const MAX_COMBO = 5;

  const MEDALS = Object.freeze({
    first_goal: Object.freeze({
      id: 'first_goal',
      name: '¡Primer Gol!',
      description: 'Convierte tu primer gol en el estadio'
    }),
    hat_trick: Object.freeze({
      id: 'hat_trick',
      name: 'Triplete en los Cerros',
      description: 'Marca 3 o más goles en un partido'
    }),
    sniper_600: Object.freeze({
      id: 'sniper_600',
      name: 'Puntería del Norte',
      description: 'Suma 600+ puntos en Desafío del Lobito'
    }),
    crossbar_king: Object.freeze({
      id: 'crossbar_king',
      name: 'Rey del Travesaño',
      description: 'Acierta al travesaño en Desafío del Lobito'
    }),
    lobito_friend: Object.freeze({
      id: 'lobito_friend',
      name: 'Amigo de Lobito',
      description: 'Disfruta 3 rutinas o juegos con Lobito'
    })
  });

  // In-memory fallback when localStorage is unavailable (e.g. headless Node tests).
  const memoryStorage = Object.create(null);

  function readStorage(key) {
    try {
      if (global.localStorage && typeof global.localStorage.getItem === 'function') {
        return global.localStorage.getItem(key);
      }
    } catch (_) {
      // Ignore storage access errors
    }
    return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null;
  }

  function writeStorage(key, value) {
    memoryStorage[key] = String(value);
    try {
      if (global.localStorage && typeof global.localStorage.setItem === 'function') {
        global.localStorage.setItem(key, String(value));
      }
    } catch (_) {
      // Ignore storage access errors
    }
  }

  function loadBestScore() {
    const raw = readStorage(BEST_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function saveBestScore(score) {
    writeStorage(BEST_STORAGE_KEY, Math.max(0, Math.floor(score)));
  }

  function loadUnlockedMedalsMap() {
    const raw = readStorage(MEDALS_STORAGE_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveUnlockedMedalsMap(map) {
    try {
      writeStorage(MEDALS_STORAGE_KEY, JSON.stringify(map));
    } catch (_) {
      // Ignore serialization errors
    }
  }

  function unlockMedal(id) {
    const def = MEDALS[id];
    if (!def) return null;

    const map = loadUnlockedMedalsMap();
    const alreadyUnlocked = Boolean(map[id]);
    if (!alreadyUnlocked) {
      map[id] = { unlockedAt: Date.now() };
      saveUnlockedMedalsMap(map);
    }

    return {
      unlocked: true,
      newlyUnlocked: !alreadyUnlocked,
      medal: def
    };
  }

  function getMedals() {
    const map = loadUnlockedMedalsMap();
    const keys = Object.keys(MEDALS);
    const list = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const def = MEDALS[keys[i]];
      const entry = map[def.id];
      list[i] = {
        id: def.id,
        name: def.name,
        description: def.description,
        unlocked: Boolean(entry),
        unlockedAt: entry && entry.unlockedAt ? entry.unlockedAt : null
      };
    }
    return list;
  }

  function createTargetDefs() {
    return [
      {
        id: 'top_corner',
        label: 'Ángulo Superior',
        points: 300,
        isBonus: true,
        baseX: 2.65,
        baseY: 1.85,
        z: -52.34,
        x: 2.65,
        y: 1.85,
        radius: 0.56,
        hitRadius: 0.66,
        color: 0xfacc15,
        innerColor: 0xfef08a,
        hitFlash: 0,
        meshGroup: null,
        ringMat: null,
        discMat: null
      },
      {
        id: 'bottom_corner',
        label: 'Rincón Bajo',
        points: 200,
        isBonus: false,
        baseX: -2.65,
        baseY: 0.58,
        z: -52.34,
        x: -2.65,
        y: 0.58,
        radius: 0.62,
        hitRadius: 0.72,
        color: 0x38bdf8,
        innerColor: 0xbae6fd,
        hitFlash: 0,
        meshGroup: null,
        ringMat: null,
        discMat: null
      },
      {
        id: 'center_bonus',
        label: 'Centro Bonus',
        points: 250,
        isBonus: true,
        baseX: 0,
        baseY: 1.24,
        z: -52.28,
        x: 0,
        y: 1.24,
        radius: 0.58,
        hitRadius: 0.68,
        color: 0x4ade80,
        innerColor: 0xbbf7d0,
        hitFlash: 0,
        meshGroup: null,
        ringMat: null,
        discMat: null
      }
    ];
  }

  class ArcadeChallengeManager {
    constructor(scene, audioEngine) {
      this.scene = scene || null;
      this.audio = audioEngine || null;

      this.mode = 'targets';
      this.active = false;
      this.done = false;
      this.timeLeft = ROUND_DURATION;
      this.score = 0;
      this.combo = 1;
      this.shotsTaken = 0;
      this.hits = 0;
      this.best = loadBestScore();

      this._elapsed = 0;
      this._crossbarFlash = 0;

      // Pre-allocated target pool (zero per-shot allocations)
      this.targets = createTargetDefs();
      this.rootGroup = null;
      this.targetsGroup = null;
      this.crossbarMesh = null;
      this.crossbarMat = null;

      this._initMeshes();
    }

    _initMeshes() {
      const THREE = global.THREE;
      if (!THREE || !this.scene) return;

      this.rootGroup = new THREE.Group();
      this.rootGroup.name = 'ArcadeChallengeRoot';
      this.rootGroup.visible = false;

      this.targetsGroup = new THREE.Group();
      this.targetsGroup.name = 'ArcadeTargetsPool';

      for (let i = 0; i < this.targets.length; i++) {
        const t = this.targets[i];
        const group = new THREE.Group();
        group.position.set(t.baseX, t.baseY, t.z);

        const ringGeo = new THREE.RingGeometry(t.radius * 0.66, t.radius, 28);
        const ringMat = new THREE.MeshBasicMaterial({
          color: t.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);

        const discGeo = new THREE.CircleGeometry(t.radius * 0.56, 24);
        const discMat = new THREE.MeshBasicMaterial({
          color: t.innerColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55
        });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.position.z = 0.01;

        group.add(ringMesh);
        group.add(discMesh);
        this.targetsGroup.add(group);

        t.meshGroup = group;
        t.ringMat = ringMat;
        t.discMat = discMat;
      }

      // Crossbar glowing target bar (y = 2.44, z = -52.5)
      const barGeo = new THREE.CylinderGeometry(0.095, 0.095, GOAL_HALF_W * 2, 16);
      barGeo.rotateZ(Math.PI / 2);
      this.crossbarMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.88
      });
      this.crossbarMesh = new THREE.Mesh(barGeo, this.crossbarMat);
      this.crossbarMesh.position.set(0, CROSSBAR_Y, NORTH_GOAL_Z + 0.04);
      this.crossbarMesh.visible = false;

      this.rootGroup.add(this.targetsGroup);
      this.rootGroup.add(this.crossbarMesh);
      this.scene.add(this.rootGroup);
    }

    start(mode = 'targets') {
      this.mode = mode === 'crossbar' ? 'crossbar' : 'targets';
      this.active = true;
      this.done = false;
      this.timeLeft = ROUND_DURATION;
      this.score = 0;
      this.combo = 1;
      this.shotsTaken = 0;
      this.hits = 0;
      this._elapsed = 0;
      this._crossbarFlash = 0;

      for (let i = 0; i < this.targets.length; i++) {
        const t = this.targets[i];
        t.x = t.baseX;
        t.y = t.baseY;
        t.hitFlash = 0;
        if (t.meshGroup) {
          t.meshGroup.position.set(t.x, t.y, t.z);
          t.meshGroup.scale.set(1, 1, 1);
        }
      }

      if (this.rootGroup) {
        this.rootGroup.visible = true;
      }
      if (this.targetsGroup) {
        this.targetsGroup.visible = this.mode === 'targets';
      }
      if (this.crossbarMesh) {
        this.crossbarMesh.visible = this.mode === 'crossbar';
        this.crossbarMesh.scale.set(1, 1, 1);
      }

      return {
        active: this.active,
        mode: this.mode,
        timeLeft: this.timeLeft,
        score: this.score,
        combo: this.combo,
        best: this.best,
        shotsTaken: this.shotsTaken,
        hits: this.hits,
        done: this.done
      };
    }

    stop() {
      this.active = false;
      if (this.rootGroup) {
        this.rootGroup.visible = false;
      }
      if (this.targetsGroup) {
        this.targetsGroup.visible = false;
      }
      if (this.crossbarMesh) {
        this.crossbarMesh.visible = false;
      }
    }

    checkBallShot(ball, prevBallZ) {
      if (!this.active || this.done || !ball) return null;

      // Require ball to cross the North goal shot plane (z <= -52.1)
      const crossedPlane =
        prevBallZ === undefined || prevBallZ === null
          ? ball.z <= SHOT_LINE_Z && ball.z >= NORTH_GOAL_Z - 2.2
          : prevBallZ > SHOT_LINE_Z && ball.z <= SHOT_LINE_Z;

      if (!crossedPlane) return null;

      const ballRadius = typeof ball.radius === 'number' ? ball.radius : 0.11;

      if (this.mode === 'crossbar') {
        const inWidth = Math.abs(ball.x) <= GOAL_HALF_W + ballRadius;
        const hitBarY = Math.abs(ball.y - CROSSBAR_Y) <= 0.28 + ballRadius;
        if (!inWidth || !hitBarY) return null;

        const comboUsed = this.combo;
        const pointsAwarded = 400 * comboUsed;
        this.score += pointsAwarded;
        this.hits += 1;
        this.shotsTaken += 1;
        this.combo = Math.min(MAX_COMBO, this.combo + 1);
        this._crossbarFlash = 0.45;

        const newBest = this.score > this.best;
        if (newBest) {
          this.best = this.score;
          saveBestScore(this.best);
        }

        if (this.audio && typeof this.audio.playChallengeHit === 'function') {
          this.audio.playChallengeHit(comboUsed, true);
        }

        unlockMedal('crossbar_king');
        if (this.score >= 600) {
          unlockMedal('sniper_600');
        }

        return {
          hit: true,
          pointsAwarded,
          label: '¡Travesaño!',
          combo: this.combo,
          newBest
        };
      }

      // 'targets' mode: find closest hit target inside North goal
      let matched = null;
      let bestDistSq = Infinity;
      for (let i = 0; i < this.targets.length; i++) {
        const t = this.targets[i];
        const dx = ball.x - t.x;
        const dy = ball.y - t.y;
        const maxR = t.hitRadius + ballRadius;
        const distSq = dx * dx + dy * dy;
        if (distSq <= maxR * maxR && distSq < bestDistSq) {
          bestDistSq = distSq;
          matched = t;
        }
      }

      if (!matched) return null;

      const comboUsed = this.combo;
      const pointsAwarded = matched.points * comboUsed;
      this.score += pointsAwarded;
      this.hits += 1;
      this.shotsTaken += 1;
      this.combo = Math.min(MAX_COMBO, this.combo + 1);
      matched.hitFlash = 0.45;

      const newBest = this.score > this.best;
      if (newBest) {
        this.best = this.score;
        saveBestScore(this.best);
      }

      if (this.audio && typeof this.audio.playChallengeHit === 'function') {
        this.audio.playChallengeHit(comboUsed, matched.isBonus);
      }

      if (this.score >= 600) {
        unlockMedal('sniper_600');
      }

      return {
        hit: true,
        pointsAwarded,
        label: matched.label,
        combo: this.combo,
        newBest
      };
    }

    onMiss() {
      this.combo = 1;
      this.shotsTaken += 1;
    }

    update(dt, elapsed) {
      const safeDt = typeof dt === 'number' && dt > 0 ? dt : 0;
      if (typeof elapsed === 'number') {
        this._elapsed = elapsed;
      } else {
        this._elapsed += safeDt;
      }

      if (this.active && !this.done) {
        this.timeLeft = Math.max(0, this.timeLeft - safeDt);
        if (this.timeLeft <= 0) {
          this.done = true;
          this.active = false;
        }
      }

      // Animate 3D targets
      const tNow = this._elapsed;
      if (this.active || !this.done) {
        for (let i = 0; i < this.targets.length; i++) {
          const target = this.targets[i];
          if (target.id === 'top_corner') {
            target.x = target.baseX + Math.sin(tNow * 1.45) * 0.32;
            target.y = target.baseY + Math.cos(tNow * 1.85) * 0.14;
          } else if (target.id === 'center_bonus') {
            target.x = target.baseX + Math.sin(tNow * 1.9) * 2.05;
            target.y = target.baseY + Math.sin(tNow * 3.0) * 0.16;
          } else {
            target.x = target.baseX;
            target.y = target.baseY;
          }

          if (target.hitFlash > 0) {
            target.hitFlash = Math.max(0, target.hitFlash - safeDt);
          }

          if (target.meshGroup) {
            target.meshGroup.position.set(target.x, target.y, target.z);
            const pulse = 1 + Math.sin(tNow * 4.2 + i * 1.3) * 0.06;
            const pop = target.hitFlash > 0 ? 1 + (target.hitFlash / 0.45) * 0.35 : 1;
            const s = pulse * pop;
            target.meshGroup.scale.set(s, s, 1);

            if (target.ringMat) {
              target.ringMat.opacity = target.hitFlash > 0 ? 1.0 : 0.78 + Math.sin(tNow * 4.2 + i) * 0.16;
            }
            if (target.discMat) {
              target.discMat.opacity = target.hitFlash > 0 ? 0.92 : 0.44 + Math.sin(tNow * 4.2 + i) * 0.14;
            }
          }
        }

        if (this._crossbarFlash > 0) {
          this._crossbarFlash = Math.max(0, this._crossbarFlash - safeDt);
        }
        if (this.crossbarMesh && this.crossbarMesh.visible) {
          const barScale = this._crossbarFlash > 0 ? 1 + (this._crossbarFlash / 0.45) * 0.45 : 1;
          this.crossbarMesh.scale.set(1, barScale, barScale);
          if (this.crossbarMat) {
            this.crossbarMat.opacity = this._crossbarFlash > 0 ? 1.0 : 0.72 + Math.sin(tNow * 5.0) * 0.2;
          }
        }
      }

      return {
        active: this.active,
        timeLeft: this.timeLeft,
        score: this.score,
        combo: this.combo,
        best: this.best,
        shotsTaken: this.shotsTaken,
        hits: this.hits,
        done: this.done
      };
    }

    unlockMedal(id) {
      return unlockMedal(id);
    }

    getMedals() {
      return getMedals();
    }
  }

  ArcadeChallengeManager.MEDALS = MEDALS;
  ArcadeChallengeManager.unlockMedal = unlockMedal;
  ArcadeChallengeManager.getMedals = getMedals;

  global.ArcadeChallengeManager = ArcadeChallengeManager;
  global.LOBITO_MEDALS = MEDALS;
})(typeof window !== 'undefined' ? window : globalThis);
