/**
 * GoalCelebrationDirector — Contextual 16-Variant 3D Celebration & VFX Director
 * Decoupled from match rules/scoring; pre-allocated GPU props for zero per-goal GC spikes.
 * Three.js r128 compatible.
 */
(function (global) {
  'use strict';

  const CELEBRATIONS = [
    {
      id: 'grito_gol',
      title: 'EL GRITO DE GOL',
      subtitle: '¡Ruge la tribuna de los cerros!',
      style: 'grito',
      cameraStyle: 'low_dutch',
      teammateBehavior: 'huddle',
      duration: 4.1,
      slowMo: 0.0,
      shake: 0.35,
      wave: false,
      wolfTotem: true,
      shockwave: true,
      confetti: 0.7,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: false,
      audioCue: 'murga',
      lobitoPose: 'murga'
    },
    {
      id: 'terremoto_tribuna',
      title: 'TERREMOTO EN LA TRIBUNA',
      subtitle: '¡Tiembla la Popular Norte!',
      style: 'knee_slide',
      cameraStyle: 'low_dutch',
      teammateBehavior: 'huddle',
      duration: 4.2,
      slowMo: 0.0,
      shake: 0.75,
      wave: false,
      wolfTotem: false,
      shockwave: true,
      confetti: 1.0,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: true,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.2,
      replay: false,
      audioCue: 'quake'
    },
    {
      id: 'gol_otro_planeta',
      title: 'GOL DE OTRO PLANETA',
      subtitle: '¡Definición estelar!',
      style: 'backflip',
      cameraStyle: 'hero_orbit',
      teammateBehavior: 'applause',
      duration: 4.2,
      slowMo: 0.9,
      shake: 0.25,
      wave: false,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.35,
      haloBall: true,
      halo: true,
      spotlight: true,
      fireworks: false,
      flash: true,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: false,
      audioCue: 'arcade'
    },
    {
      id: 'baile_colectivo',
      title: 'BAILE COLECTIVO',
      subtitle: 'Coreografía albiceleste en el área',
      style: 'dance',
      cameraStyle: 'hero_orbit',
      teammateBehavior: 'dance_line',
      duration: 4.0,
      slowMo: 0.0,
      shake: 0.18,
      wave: false,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.6,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: false,
      audioCue: 'carnavalito',
      lobitoPose: 'carnavalito'
    },
    {
      id: 'ola_celeste',
      title: 'LA OLA CELESTE',
      subtitle: 'Todo el estadio se levanta por sectores',
      style: 'orchestra',
      cameraStyle: 'stadium_wave',
      teammateBehavior: 'applause',
      duration: 4.4,
      slowMo: 0.0,
      shake: 0.14,
      wave: true,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.5,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.1,
      replay: false,
      audioCue: 'stadium'
    },
    {
      id: 'mascota_gigante',
      title: 'LA MASCOTA DEL NORTE',
      subtitle: '¡Festejo detrás del arco!',
      style: 'grito',
      cameraStyle: 'mascot_closeup',
      teammateBehavior: 'huddle',
      duration: 4.2,
      slowMo: 0.0,
      shake: 0.30,
      wave: false,
      wolfTotem: true,
      shockwave: false,
      confetti: 0.5,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: true,
      flash: false,
      benchJump: false,
      mascotBoost: true,
      smokeBoost: 1.2,
      replay: false,
      audioCue: 'murga',
      lobitoPose: 'murga'
    },
    {
      id: 'golazo_cinematografico',
      title: 'GOLAZO CINEMATOGRÁFICO',
      subtitle: 'Repetición en cámara lenta',
      style: 'knee_slide',
      cameraStyle: 'replay_track',
      teammateBehavior: 'huddle',
      duration: 4.5,
      slowMo: 1.55,
      shake: 0.22,
      wave: false,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.4,
      haloBall: false,
      halo: false,
      spotlight: true,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: true,
      audioCue: 'epic'
    },
    {
      id: 'lluvia_papelitos',
      title: 'LLUVIA DE PAPELITOS',
      subtitle: 'Celeste y blanco sobre el césped',
      style: 'airplane',
      cameraStyle: 'hero_orbit',
      teammateBehavior: 'huddle',
      duration: 4.0,
      slowMo: 0.0,
      shake: 0.16,
      wave: true,
      wolfTotem: false,
      shockwave: false,
      confetti: 1.4,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.15,
      replay: false,
      audioCue: 'carnavalito',
      lobitoPose: 'carnavalito'
    },
    {
      id: 'arquero_incredulo',
      title: 'EL ARQUERO INCRÉDULO',
      subtitle: 'No la pudo ni ver pasar',
      style: 'airplane',
      cameraStyle: 'gk_incredulous',
      teammateBehavior: 'applause',
      duration: 3.9,
      slowMo: 0.6,
      shake: 0.20,
      wave: false,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.2,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: false,
      audioCue: 'arcade'
    },
    {
      id: 'todos_al_corner',
      title: 'TODOS AL CÓRNER',
      subtitle: 'Locura junto al banderín',
      style: 'corner',
      cameraStyle: 'corner_run',
      teammateBehavior: 'corner_rush',
      duration: 4.1,
      slowMo: 0.0,
      shake: 0.28,
      wave: false,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.8,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: true,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.1,
      replay: false,
      audioCue: 'stadium'
    },
    {
      id: 'gol_minuto_90',
      title: 'GOL DEL MINUTO 90',
      subtitle: '¡Agónico en el Estadio de los Cerros!',
      style: 'knee_slide',
      cameraStyle: 'replay_track',
      teammateBehavior: 'huddle',
      duration: 4.8,
      slowMo: 1.35,
      shake: 0.62,
      wave: true,
      wolfTotem: true,
      shockwave: true,
      confetti: 1.3,
      haloBall: false,
      halo: false,
      spotlight: true,
      fireworks: true,
      flash: true,
      benchJump: true,
      mascotBoost: true,
      smokeBoost: 1.45,
      replay: true,
      audioCue: 'epic'
    },
    {
      id: 'gol_imposible',
      title: 'EL GOL IMPOSIBLE',
      subtitle: '¡Remate de otro calibre!',
      style: 'backflip',
      cameraStyle: 'replay_track',
      teammateBehavior: 'applause',
      duration: 4.5,
      slowMo: 1.25,
      shake: 0.45,
      wave: false,
      wolfTotem: false,
      shockwave: true,
      confetti: 0.6,
      haloBall: true,
      halo: true,
      spotlight: true,
      fireworks: false,
      flash: true,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.1,
      replay: true,
      audioCue: 'arcade'
    },
    {
      id: 'director_orquesta',
      title: 'DIRECTOR DE ORQUESTA',
      subtitle: 'El goleador dirige a la hinchada',
      style: 'orchestra',
      cameraStyle: 'stadium_wave',
      teammateBehavior: 'applause',
      duration: 4.3,
      slowMo: 0.0,
      shake: 0.14,
      wave: true,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.45,
      haloBall: false,
      halo: false,
      spotlight: true,
      fireworks: false,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.0,
      replay: false,
      audioCue: 'stadium'
    },
    {
      id: 'locura_banco',
      title: 'LOCURA EN EL BANCO',
      subtitle: '¡Festeja todo el plantel!',
      style: 'bench',
      cameraStyle: 'bench_cam',
      teammateBehavior: 'bench_rush',
      duration: 4.1,
      slowMo: 0.0,
      shake: 0.24,
      wave: true,
      wolfTotem: false,
      shockwave: false,
      confetti: 0.7,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: false,
      flash: false,
      benchJump: true,
      mascotBoost: false,
      smokeBoost: 1.1,
      replay: false,
      audioCue: 'carnavalito',
      lobitoPose: 'carnavalito'
    },
    {
      id: 'fiesta_tribuna',
      title: 'FIESTA EN LA TRIBUNA',
      subtitle: 'Banderas, humo celeste y estadio lleno',
      style: 'airplane',
      cameraStyle: 'hero_orbit',
      teammateBehavior: 'dance_line',
      duration: 4.4,
      slowMo: 0.0,
      shake: 0.40,
      wave: true,
      wolfTotem: true,
      shockwave: false,
      confetti: 1.2,
      haloBall: false,
      halo: false,
      spotlight: false,
      fireworks: true,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.6,
      replay: false,
      audioCue: 'carnavalito',
      lobitoPose: 'carnavalito'
    },
    {
      id: 'celebracion_sorpresa',
      title: 'SORPRESA ALBICELESTE',
      subtitle: '¡Festejo especial inesperado!',
      style: 'backflip',
      cameraStyle: 'hero_orbit',
      teammateBehavior: 'dance_line',
      duration: 4.3,
      slowMo: 0.6,
      shake: 0.32,
      wave: true,
      wolfTotem: true,
      shockwave: false,
      confetti: 1.1,
      haloBall: true,
      halo: true,
      spotlight: true,
      fireworks: true,
      flash: false,
      benchJump: false,
      mascotBoost: false,
      smokeBoost: 1.25,
      replay: false,
      audioCue: 'carnavalito',
      lobitoPose: 'torpe'
    }
  ];

  const CONFETTI_COUNT = 180;
  const FIREWORK_SPARK_COUNT = 96;
  const REPLAY_WINDOW_SEC = 1.65;
  const FLASH_DURATION_SEC = 0.35;
  const SHOCKWAVE_DURATION_SEC = 1.2;

  function makeIdleResult() {
    return {
      done: true,
      timeScale: 1,
      shakeOffset: { x: 0, y: 0 },
      wave: false,
      cameraStyle: null,
      scorerStyle: null,
      teammateBehavior: null,
      benchJump: false,
      replayActive: false,
      replayProgress: 0,
      smokeBoost: 1.0,
      confettiIntensity: 0,
      flashAlpha: 0,
      mascotBoost: false,
      elapsedInCel: 0
    };
  }

  class GoalCelebrationDirector {
    constructor(scene) {
      this.scene = scene;
      this.active = false;
      this.current = null;
      this.recentIds = [];
      this.timer = 0;
      this.slowMoTimer = 0;
      this.reduceMotion = false;
      this.noFlash = false;
      this.intensity = 1.0;

      // Internal reusable state (zero per-goal allocations)
      this._isHomeGoal = true;
      this._flashElapsed = 99;
      this._shockwaveElapsed = 99;
      this._shockwaveOrigin = { x: 0, z: -48 };
      this._lastScorerPos = { x: 0, y: 0, z: -44 };
      this._confettiActive = false;
      this._confettiIntensity = 0;
      this._fireworksActive = false;
      this._dummy = new THREE.Object3D();
      this._disposables = { geometries: [], materials: [] };

      this._buildVfxProps();
    }

    _trackGeo(geo) {
      this._disposables.geometries.push(geo);
      return geo;
    }

    _trackMat(mat) {
      this._disposables.materials.push(mat);
      return mat;
    }

    _buildVfxProps() {
      this._buildWolfTotem();
      this._buildHaloGroup();
      this._buildShockwave();
      this._buildSpotlight();
      this._buildConfettiCannon();
      this._buildFireworkFountains();
    }

    /**
     * Sculpted Stylized 3D Wolf Hologram (low-poly layered cranium, snout, cheek ruffs,
     * pointed ears with inner cyan glow, glowing amber/white eyes, radiant backing aura).
     */
    _buildWolfTotem() {
      this.wolfTotem = new THREE.Group();

      const bodyMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const wireMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.72,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const innerCyanMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const eyeMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const eyeCoreMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.98
      }));
      const noseTipMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const auraRingMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const auraDiscMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this._wolfBodyMat = bodyMat;
      this._wolfAuraMat = auraRingMat;
      this._wolfEyeMat = eyeMat;

      // Radiant backing aura ring & inner halo
      this._wolfAuraOuter = new THREE.Mesh(this._trackGeo(new THREE.TorusGeometry(4.55, 0.14, 10, 48)), auraRingMat);
      this._wolfAuraOuter.position.set(0, 0.35, -1.65);

      this._wolfAuraInner = new THREE.Mesh(this._trackGeo(new THREE.RingGeometry(3.25, 4.35, 36)), auraDiscMat);
      this._wolfAuraInner.position.set(0, 0.35, -1.75);

      this._wolfAuraTorus2 = new THREE.Mesh(this._trackGeo(new THREE.TorusGeometry(3.55, 0.08, 8, 36)), innerCyanMat);
      this._wolfAuraTorus2.position.set(0, 0.35, -1.55);

      // Head container (faces +Z toward pitch when behind North goal at z = -55.5)
      const headGroup = new THREE.Group();

      // Layered angular cranium (solid hologram + wireframe crystal shell)
      const craniumGeo = this._trackGeo(new THREE.CylinderGeometry(1.55, 2.25, 2.55, 6));
      const cranium = new THREE.Mesh(craniumGeo, bodyMat);
      cranium.rotation.x = Math.PI / 2;
      cranium.scale.set(1.12, 0.92, 1.0);
      const craniumWire = new THREE.Mesh(craniumGeo, wireMat);
      craniumWire.rotation.x = Math.PI / 2;
      craniumWire.scale.set(1.15, 0.95, 1.03);

      // Crown / forehead crest
      const crestGeo = this._trackGeo(new THREE.ConeGeometry(1.38, 2.05, 4));
      const crest = new THREE.Mesh(crestGeo, bodyMat);
      crest.position.set(0, 1.35, 0.05);
      crest.rotation.y = Math.PI / 4;
      crest.scale.set(1.15, 0.85, 0.95);
      const crestWire = new THREE.Mesh(crestGeo, wireMat);
      crestWire.position.copy(crest.position);
      crestWire.rotation.copy(crest.rotation);
      crestWire.scale.set(1.18, 0.88, 0.98);

      // Sculpted layered snout (upper bridge + tapered nose cone + lower jaw)
      const snoutGeo = this._trackGeo(new THREE.BoxGeometry(1.22, 0.92, 2.15));
      const snout = new THREE.Mesh(snoutGeo, bodyMat);
      snout.position.set(0, -0.32, 1.48);
      snout.rotation.x = 0.14;
      const snoutWire = new THREE.Mesh(snoutGeo, wireMat);
      snoutWire.position.copy(snout.position);
      snoutWire.rotation.copy(snout.rotation);
      snoutWire.scale.set(1.03, 1.03, 1.03);

      const muzzleGeo = this._trackGeo(new THREE.ConeGeometry(0.76, 1.75, 4));
      const muzzle = new THREE.Mesh(muzzleGeo, bodyMat);
      muzzle.position.set(0, -0.45, 2.65);
      muzzle.rotation.x = Math.PI / 2 + 0.12;
      muzzle.rotation.z = Math.PI / 4;

      const noseTipGeo = this._trackGeo(new THREE.OctahedronGeometry(0.36, 0));
      const noseTip = new THREE.Mesh(noseTipGeo, noseTipMat);
      noseTip.position.set(0, -0.42, 3.35);
      noseTip.scale.set(1.15, 0.82, 0.9);

      const jawGeo = this._trackGeo(new THREE.BoxGeometry(0.92, 0.44, 1.75));
      const jaw = new THREE.Mesh(jawGeo, bodyMat);
      jaw.position.set(0, -1.02, 1.38);
      jaw.rotation.x = -0.1;

      const chinFurGeo = this._trackGeo(new THREE.ConeGeometry(0.72, 1.45, 4));
      const chinFur = new THREE.Mesh(chinFurGeo, bodyMat);
      chinFur.position.set(0, -1.62, 0.35);
      chinFur.rotation.x = Math.PI;
      chinFur.rotation.y = Math.PI / 4;

      // Iconic fierce cheek ruffs (2 tiers per side)
      const ruffGeo = this._trackGeo(new THREE.ConeGeometry(0.68, 2.15, 4));
      const ruffSpecs = [
        { x: -1.95, y: -0.15, z: -0.15, rz: 1.18, ry: 0.25, s: 1.0 },
        { x: 1.95, y: -0.15, z: -0.15, rz: -1.18, ry: -0.25, s: 1.0 },
        { x: -1.62, y: -0.95, z: 0.1, rz: 1.75, ry: 0.18, s: 0.82 },
        { x: 1.62, y: -0.95, z: 0.1, rz: -1.75, ry: -0.18, s: 0.82 }
      ];
      for (let i = 0; i < ruffSpecs.length; i++) {
        const sp = ruffSpecs[i];
        const ruff = new THREE.Mesh(ruffGeo, bodyMat);
        ruff.position.set(sp.x, sp.y, sp.z);
        ruff.rotation.set(0, sp.ry, sp.rz);
        ruff.scale.setScalar(sp.s);
        const ruffW = new THREE.Mesh(ruffGeo, wireMat);
        ruffW.position.copy(ruff.position);
        ruffW.rotation.copy(ruff.rotation);
        ruffW.scale.setScalar(sp.s * 1.03);
        headGroup.add(ruff, ruffW);
      }

      // Pointed ears with bright inner cyan glow
      const earOuterGeo = this._trackGeo(new THREE.ConeGeometry(0.78, 2.65, 4));
      const earInnerGeo = this._trackGeo(new THREE.ConeGeometry(0.38, 1.85, 4));
      [-1, 1].forEach((side) => {
        const earOuter = new THREE.Mesh(earOuterGeo, bodyMat);
        earOuter.position.set(side * 1.38, 2.38, -0.32);
        earOuter.rotation.set(-0.1, side * 0.18, -side * 0.24);
        const earWire = new THREE.Mesh(earOuterGeo, wireMat);
        earWire.position.copy(earOuter.position);
        earWire.rotation.copy(earOuter.rotation);
        earWire.scale.set(1.04, 1.02, 1.04);

        const earInner = new THREE.Mesh(earInnerGeo, innerCyanMat);
        earInner.position.set(side * 1.36, 2.26, -0.02);
        earInner.rotation.set(-0.08, side * 0.18, -side * 0.24);

        headGroup.add(earOuter, earWire, earInner);
      });

      // Fierce slanted glowing eyes (amber outer + white core)
      const eyeGeo = this._trackGeo(new THREE.BoxGeometry(0.72, 0.22, 0.26));
      const pupilGeo = this._trackGeo(new THREE.BoxGeometry(0.42, 0.11, 0.3));
      [-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(side * 0.88, 0.36, 1.36);
        eye.rotation.set(0, side * 0.28, -side * 0.28);

        const pupil = new THREE.Mesh(pupilGeo, eyeCoreMat);
        pupil.position.set(side * 0.88, 0.36, 1.41);
        pupil.rotation.copy(eye.rotation);

        headGroup.add(eye, pupil);
      });

      // Base energy ring pedestal
      this._wolfBaseRing = new THREE.Mesh(this._trackGeo(new THREE.TorusGeometry(2.6, 0.08, 8, 32)), auraRingMat);
      this._wolfBaseRing.rotation.x = Math.PI / 2;
      this._wolfBaseRing.position.set(0, -2.55, 0.15);

      headGroup.add(cranium, craniumWire, crest, crestWire, snout, snoutWire, muzzle, noseTip, jaw, chinFur);
      this._wolfHeadGroup = headGroup;

      this.wolfTotem.add(this._wolfAuraOuter, this._wolfAuraInner, this._wolfAuraTorus2, this._wolfBaseRing, headGroup);
      this.wolfTotem.visible = false;
      this.scene.add(this.wolfTotem);
    }

    /**
     * Holographic Spinning Orbiting Football + Dual Energy Rings + Vertical Energy Streaks
     */
    _buildHaloGroup() {
      this.haloGroup = new THREE.Group();

      const cyanRingMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const goldRingMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this._haloRing1 = new THREE.Mesh(this._trackGeo(new THREE.TorusGeometry(1.32, 0.055, 10, 36)), cyanRingMat);
      this._haloRing1.rotation.x = Math.PI / 2.2;
      this._haloRing1.rotation.z = 0.25;

      this._haloRing2 = new THREE.Mesh(this._trackGeo(new THREE.TorusGeometry(0.98, 0.045, 10, 32)), goldRingMat);
      this._haloRing2.rotation.y = Math.PI / 3;
      this._haloRing2.rotation.x = -0.55;

      // Orbiting glowing holographic football (solid glowing core + geodesic wireframe shell + trailing orb)
      this._holoBallPivot = new THREE.Group();
      const ballCoreGeo = this._trackGeo(new THREE.IcosahedronGeometry(0.30, 1));
      const ballWireGeo = this._trackGeo(new THREE.IcosahedronGeometry(0.34, 1));
      const ballCoreMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.58,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      const ballWireMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.94,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this._holoBallMesh = new THREE.Group();
      this._holoBallMesh.add(new THREE.Mesh(ballCoreGeo, ballCoreMat), new THREE.Mesh(ballWireGeo, ballWireMat));
      this._holoBallMesh.position.set(1.52, 0.35, 0);

      const trailGeo = this._trackGeo(new THREE.OctahedronGeometry(0.14, 0));
      const trailOrb = new THREE.Mesh(trailGeo, goldRingMat);
      trailOrb.position.set(1.36, 0.18, -0.58);

      this._holoBallPivot.add(this._holoBallMesh, trailOrb);

      // Rising vertical energy streaks around the scorer
      this._energyStreaks = [];
      const streakGeo = this._trackGeo(new THREE.CylinderGeometry(0.022, 0.045, 2.1, 6));
      const streakMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      this._streakMat = streakMat;
      const streakCount = 6;
      for (let i = 0; i < streakCount; i++) {
        const ang = (i / streakCount) * Math.PI * 2;
        const streak = new THREE.Mesh(streakGeo, streakMat);
        streak.position.set(Math.cos(ang) * 1.12, 0.2, Math.sin(ang) * 1.12);
        streak.userData.phase = i * 1.05;
        this._energyStreaks.push(streak);
        this.haloGroup.add(streak);
      }

      this.haloGroup.add(this._haloRing1, this._haloRing2, this._holoBallPivot);
      this.haloGroup.visible = false;
      this.scene.add(this.haloGroup);
    }

    /**
     * Expanding Pitch Shockwave Ring (scale 1 -> 28, fading opacity cleanly over 1.2s)
     */
    _buildShockwave() {
      this._shockwaveOuterMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      this._shockwaveInnerMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this.shockwaveMesh = new THREE.Mesh(
        this._trackGeo(new THREE.RingGeometry(0.70, 1.0, 48)),
        this._shockwaveOuterMat
      );
      this.shockwaveMesh.rotation.x = -Math.PI / 2;
      this.shockwaveMesh.position.y = 0.08;

      this._shockwaveInner = new THREE.Mesh(
        this._trackGeo(new THREE.RingGeometry(0.86, 0.98, 48)),
        this._shockwaveInnerMat
      );
      this._shockwaveInner.position.z = 0.02;
      this.shockwaveMesh.add(this._shockwaveInner);

      this.shockwaveMesh.visible = false;
      this.scene.add(this.shockwaveMesh);
    }

    /**
     * Dramatic Stadium Spotlight Cone descending onto the scorer
     */
    _buildSpotlight() {
      this._spotlightConeMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      this._spotlightPoolMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this.spotlightMesh = new THREE.Group();

      const cone = new THREE.Mesh(
        this._trackGeo(new THREE.CylinderGeometry(0.55, 4.35, 24, 28, 1, true)),
        this._spotlightConeMat
      );
      cone.position.y = 12.0;

      const groundPool = new THREE.Mesh(
        this._trackGeo(new THREE.CircleGeometry(4.2, 32)),
        this._spotlightPoolMat
      );
      groundPool.rotation.x = -Math.PI / 2;
      groundPool.position.y = 0.07;

      this.spotlightMesh.add(cone, groundPool);
      this.spotlightMesh.visible = false;
      this.scene.add(this.spotlightMesh);
    }

    /**
     * Pre-allocated InstancedMesh Confetti Cannon (~180 fluttering celeste/white/gold ribbons)
     */
    _buildConfettiCannon() {
      const ribbonGeo = this._trackGeo(new THREE.PlaneGeometry(0.24, 0.56));
      const ribbonMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94
      }));

      this.confettiMesh = new THREE.InstancedMesh(ribbonGeo, ribbonMat, CONFETTI_COUNT);
      this.confettiMesh.frustumCulled = false;
      this.confettiMesh.visible = false;

      const palette = [
        new THREE.Color(0x38bdf8), // Celeste
        new THREE.Color(0xf8fafc), // Crisp white
        new THREE.Color(0x38bdf8), // Extra celeste weight
        new THREE.Color(0xfacc15), // Gold
        new THREE.Color(0x0ea5e9)  // Deep sky celeste
      ];
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        this.confettiMesh.setColorAt(i, palette[i % palette.length]);
      }
      if (this.confettiMesh.instanceColor) {
        this.confettiMesh.instanceColor.needsUpdate = true;
      }

      // Flat typed arrays for zero-GC physics updates
      this._cfPosX = new Float32Array(CONFETTI_COUNT);
      this._cfPosY = new Float32Array(CONFETTI_COUNT);
      this._cfPosZ = new Float32Array(CONFETTI_COUNT);
      this._cfVelX = new Float32Array(CONFETTI_COUNT);
      this._cfVelY = new Float32Array(CONFETTI_COUNT);
      this._cfVelZ = new Float32Array(CONFETTI_COUNT);
      this._cfRotX = new Float32Array(CONFETTI_COUNT);
      this._cfRotY = new Float32Array(CONFETTI_COUNT);
      this._cfRotZ = new Float32Array(CONFETTI_COUNT);
      this._cfSpinX = new Float32Array(CONFETTI_COUNT);
      this._cfSpinY = new Float32Array(CONFETTI_COUNT);
      this._cfSpinZ = new Float32Array(CONFETTI_COUNT);
      this._cfScale = new Float32Array(CONFETTI_COUNT);
      this._cfPhase = new Float32Array(CONFETTI_COUNT);

      this.scene.add(this.confettiMesh);
    }

    /**
     * Twin Celeste-and-White Sparkle / Firework Fountains behind goalposts (x = ±5.5, z = -54.5)
     */
    _buildFireworkFountains() {
      this.fireworkGroup = new THREE.Group();

      const sparkGeo = this._trackGeo(new THREE.OctahedronGeometry(0.13, 0));
      const sparkMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));

      this._fireworkSparks = new THREE.InstancedMesh(sparkGeo, sparkMat, FIREWORK_SPARK_COUNT);
      this._fireworkSparks.frustumCulled = false;

      const sparkPalette = [
        new THREE.Color(0x38bdf8),
        new THREE.Color(0xffffff),
        new THREE.Color(0xbae6fd),
        new THREE.Color(0xfef08a)
      ];
      for (let i = 0; i < FIREWORK_SPARK_COUNT; i++) {
        this._fireworkSparks.setColorAt(i, sparkPalette[i % sparkPalette.length]);
      }
      if (this._fireworkSparks.instanceColor) {
        this._fireworkSparks.instanceColor.needsUpdate = true;
      }

      // Twin glowing base emitters behind the goalposts
      const nozzleGeo = this._trackGeo(new THREE.CylinderGeometry(0.32, 0.45, 0.4, 12));
      const nozzleMat = this._trackMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      this._fwNozzleL = new THREE.Mesh(nozzleGeo, nozzleMat);
      this._fwNozzleL.position.set(-5.5, 0.2, 0);
      this._fwNozzleR = new THREE.Mesh(nozzleGeo, nozzleMat);
      this._fwNozzleR.position.set(5.5, 0.2, 0);

      // Flat typed arrays for fountain particles
      this._fwPosX = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwPosY = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwPosZ = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwVelX = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwVelY = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwVelZ = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwAge = new Float32Array(FIREWORK_SPARK_COUNT);
      this._fwLife = new Float32Array(FIREWORK_SPARK_COUNT);

      this.fireworkGroup.add(this._fireworkSparks, this._fwNozzleL, this._fwNozzleR);
      this.fireworkGroup.visible = false;
      this.scene.add(this.fireworkGroup);
    }

    _resetConfetti(intensity, originPos, goalZ) {
      const clamped = Math.max(0, Math.min(1.8, intensity || 0));
      this._confettiIntensity = clamped;
      this._confettiActive = clamped > 0.02;
      this.confettiMesh.visible = this._confettiActive;
      if (!this._confettiActive) return;

      const activeCount = Math.min(
        CONFETTI_COUNT,
        Math.max(24, Math.floor(CONFETTI_COUNT * Math.min(1.0, clamped * (this.reduceMotion ? 0.45 : 0.92))))
      );
      const sx = originPos ? originPos.x : 0;
      const sz = originPos ? originPos.z : (goalZ * 0.85);
      const speedScale = this.reduceMotion ? 0.55 : 1.0;

      for (let i = 0; i < CONFETTI_COUNT; i++) {
        if (i >= activeCount) {
          this._cfPosY[i] = -50;
          this._cfScale[i] = 0;
          this._dummy.position.set(0, -50, 0);
          this._dummy.scale.set(0, 0, 0);
          this._dummy.updateMatrix();
          this.confettiMesh.setMatrixAt(i, this._dummy.matrix);
          continue;
        }
        // Split launch between scorer area and goal mouth cannons
        const fromGoal = (i % 3) !== 0;
        const baseX = fromGoal ? ((i % 2 === 0 ? -4.2 : 4.2) + (Math.random() - 0.5) * 3.0) : (sx + (Math.random() - 0.5) * 2.2);
        const baseZ = fromGoal ? (goalZ + (goalZ < 0 ? 1.8 : -1.8) + (Math.random() - 0.5) * 2.0) : (sz + (Math.random() - 0.5) * 2.2);
        const angle = Math.random() * Math.PI * 2;
        const spread = (1.6 + Math.random() * 5.8) * Math.sqrt(Math.max(0.5, clamped)) * speedScale;

        this._cfPosX[i] = baseX;
        this._cfPosY[i] = 0.6 + Math.random() * 1.4;
        this._cfPosZ[i] = baseZ;
        this._cfVelX[i] = Math.cos(angle) * spread;
        this._cfVelY[i] = (8.8 + Math.random() * 7.8) * speedScale;
        this._cfVelZ[i] = Math.sin(angle) * spread + (fromGoal ? (goalZ < 0 ? 2.4 : -2.4) * speedScale : 0);
        this._cfRotX[i] = Math.random() * Math.PI * 2;
        this._cfRotY[i] = Math.random() * Math.PI * 2;
        this._cfRotZ[i] = Math.random() * Math.PI * 2;
        this._cfSpinX[i] = (Math.random() - 0.5) * 11 * speedScale;
        this._cfSpinY[i] = (Math.random() - 0.5) * 9 * speedScale;
        this._cfSpinZ[i] = (Math.random() - 0.5) * 11 * speedScale;
        this._cfScale[i] = 0.72 + Math.random() * 0.68;
        this._cfPhase[i] = Math.random() * Math.PI * 2;
      }
      this.confettiMesh.instanceMatrix.needsUpdate = true;
    }

    _spawnFireworkSpark(i, preAge) {
      const side = (i % 2 === 0) ? -5.5 : 5.5;
      const speedScale = this.reduceMotion ? 0.55 : 1.0;
      const angle = Math.random() * Math.PI * 2;
      const spread = (0.45 + Math.random() * 2.15) * speedScale;

      this._fwPosX[i] = side + (Math.random() - 0.5) * 0.25;
      this._fwPosY[i] = 0.35;
      this._fwPosZ[i] = (Math.random() - 0.5) * 0.25;
      this._fwVelX[i] = Math.cos(angle) * spread;
      this._fwVelY[i] = (9.5 + Math.random() * 7.5) * speedScale;
      this._fwVelZ[i] = Math.sin(angle) * spread;
      this._fwLife[i] = 0.85 + Math.random() * 0.75;
      this._fwAge[i] = preAge ? Math.random() * this._fwLife[i] : 0;
    }

    _resetFireworks(active, isHomeGoal) {
      this._fireworksActive = !!(active && !this.noFlash);
      this.fireworkGroup.visible = this._fireworksActive;
      if (!this._fireworksActive) return;

      this.fireworkGroup.position.set(0, 0, isHomeGoal ? -54.5 : 54.5);
      for (let i = 0; i < FIREWORK_SPARK_COUNT; i++) {
        this._spawnFireworkSpark(i, true);
      }
    }

    _resetShockwave(enabled, originPos, goalZ) {
      if (enabled && !this.reduceMotion) {
        this._shockwaveElapsed = 0;
        this._shockwaveOrigin.x = originPos ? originPos.x : 0;
        this._shockwaveOrigin.z = originPos ? originPos.z : (goalZ * 0.88);
        this.shockwaveMesh.position.set(this._shockwaveOrigin.x, 0.08, this._shockwaveOrigin.z);
        this.shockwaveMesh.scale.set(1, 1, 1);
        this._shockwaveOuterMat.opacity = 0.86;
        this._shockwaveInnerMat.opacity = 0.94;
        this.shockwaveMesh.visible = true;
      } else {
        this._shockwaveElapsed = 99;
        this.shockwaveMesh.visible = false;
      }
    }

    _applyVfxState(cel, scorerPos) {
      const goalZ = this._isHomeGoal ? -52.5 : 52.5;
      const hasHalo = !!(cel.haloBall || cel.halo);

      this.haloGroup.visible = !!(hasHalo && !this.reduceMotion && !this.noFlash);
      this.wolfTotem.visible = !!(cel.wolfTotem && !this.reduceMotion);
      if (this.wolfTotem.visible) {
        this.wolfTotem.position.set(0, 2.8, this._isHomeGoal ? -55.5 : 55.5);
        this.wolfTotem.rotation.y = this._isHomeGoal ? 0 : Math.PI;
      }

      this.spotlightMesh.visible = !!(cel.spotlight && !this.noFlash);
      if (this.spotlightMesh.visible) {
        const sx = scorerPos ? scorerPos.x : this._lastScorerPos.x;
        const sz = scorerPos ? scorerPos.z : this._lastScorerPos.z;
        this.spotlightMesh.position.set(sx, 0, sz);
      }

      this._resetShockwave(!!cel.shockwave, scorerPos || this._lastScorerPos, goalZ);
      this._resetConfetti(cel.confetti || 0, scorerPos || this._lastScorerPos, goalZ);
      this._resetFireworks(!!cel.fireworks, this._isHomeGoal);
      this._flashElapsed = (cel.flash && !this.noFlash && !this.reduceMotion) ? 0 : 99;
    }

    selectCelebration(ctx) {
      if (!ctx.isHomeGoal) {
        return {
          id: 'rival_goal',
          title: `GOL DE ${(ctx.teamName || 'RIVAL').toUpperCase()}`,
          subtitle: `Minuto ${ctx.minute}' • Silencio en el estadio`,
          style: 'grito',
          cameraStyle: 'rival_muted',
          teammateBehavior: 'huddle',
          duration: 3.1,
          slowMo: 0.0,
          shake: 0.08,
          wave: false,
          wolfTotem: false,
          shockwave: false,
          confetti: 0,
          haloBall: false,
          halo: false,
          spotlight: false,
          fireworks: false,
          flash: false,
          benchJump: false,
          mascotBoost: false,
          smokeBoost: 0.4,
          replay: false,
          audioCue: 'rival_hush'
        };
      }

      const pickById = (id) => CELEBRATIONS.find((c) => c.id === id);
      if (ctx.isStoppageTime || (ctx.minute >= 85 && ctx.isDecisive)) {
        return pickById('gol_minuto_90');
      }
      if (ctx.shotDistance > 25) {
        return pickById(Math.random() < 0.5 ? 'gol_imposible' : 'gol_otro_planeta');
      }
      if (ctx.isComeback && !this.recentIds.includes('fiesta_tribuna')) {
        return pickById('fiesta_tribuna');
      }
      if (ctx.isEqualizer && !this.recentIds.includes('terremoto_tribuna')) {
        return pickById('terremoto_tribuna');
      }
      if (ctx.isFirstGoal && !this.recentIds.includes('grito_gol')) {
        return pickById('grito_gol');
      }
      if (Math.random() < 0.08 && !this.recentIds.includes('celebracion_sorpresa')) {
        return pickById('celebracion_sorpresa');
      }

      const pool = CELEBRATIONS.filter((c) => !this.recentIds.includes(c.id));
      const candidates = pool.length > 0 ? pool : CELEBRATIONS;
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    triggerInteractive(keyNum) {
      if (!this.active || !this.current || this.current.id === 'rival_goal') return null;
      const map = {
        1: 'grito_gol',
        2: 'baile_colectivo',
        3: 'director_orquesta',
        4: 'celebracion_sorpresa'
      };
      const base = CELEBRATIONS.find((c) => c.id === map[keyNum]);
      if (!base) return null;

      // Key 1 toggles iconic knee_slide / grito solo celebration cleanly
      let chosen = base;
      if (Number(keyNum) === 1) {
        const nextStyle = (this.current.id === 'grito_gol' && this.current.style === 'knee_slide')
          ? 'grito'
          : 'knee_slide';
        chosen = Object.assign({}, base, { style: nextStyle });
      }

      this.current = chosen;
      this._applyVfxState(chosen, this._lastScorerPos);

      // Always pulse shockwave on interactive switch for responsive visual feedback
      if (!this.reduceMotion) {
        this._resetShockwave(true, this._lastScorerPos, this._isHomeGoal ? -52.5 : 52.5);
      }

      if (typeof document !== 'undefined') {
        const titleEl = document.getElementById('goal-banner-title');
        const subEl = document.getElementById('goal-banner-sub');
        if (titleEl) titleEl.textContent = chosen.title;
        if (subEl) subEl.textContent = chosen.subtitle;
        const replayBadge = document.getElementById('goal-replay-badge');
        if (replayBadge) replayBadge.classList.add('hidden');
      }
      return chosen;
    }

    start(ctx) {
      this._isHomeGoal = !!ctx.isHomeGoal;
      this.current = this.selectCelebration(ctx);
      if (ctx.isHomeGoal) {
        this.recentIds.push(this.current.id);
        if (this.recentIds.length > 4) this.recentIds.shift();
      }
      this.active = true;
      this.timer = this.current.duration;
      this.slowMoTimer = this.reduceMotion ? 0 : (this.current.slowMo || 0);

      if (ctx.scorerPos) {
        this._lastScorerPos.x = ctx.scorerPos.x || 0;
        this._lastScorerPos.y = ctx.scorerPos.y || 0;
        this._lastScorerPos.z = ctx.scorerPos.z || (this._isHomeGoal ? -44 : 44);
      } else {
        this._lastScorerPos.x = 0;
        this._lastScorerPos.y = 0;
        this._lastScorerPos.z = this._isHomeGoal ? -44 : 44;
      }

      this._applyVfxState(this.current, this._lastScorerPos);
      this._showBanner(ctx, this.current);
      return this.current;
    }

    _showBanner(ctx, cel) {
      if (typeof document === 'undefined') return;
      const banner = document.getElementById('goal-banner-overlay');
      if (!banner) return;
      const badgeEl = document.getElementById('goal-banner-badge');
      if (badgeEl && global.ClubBadges) {
        badgeEl.innerHTML = global.ClubBadges.getSvg(
          ctx.isHomeGoal ? 'ssc' : (ctx.awayId || 'gnf'),
          ctx.isHomeGoal ? null : ctx.awayHex,
          42
        );
      }
      const homeShort = (global.BrandRegistry && global.BrandRegistry.getActiveBrand().homeClub.shortName) || 'SSC';
      const titleEl = document.getElementById('goal-banner-title');
      const scorerEl = document.getElementById('goal-banner-scorer');
      const scoreEl = document.getElementById('goal-banner-score');
      const subEl = document.getElementById('goal-banner-sub');
      if (titleEl) titleEl.textContent = cel.title;
      if (scorerEl) scorerEl.textContent = `#${ctx.scorerNumber} ${ctx.scorerName} • ${ctx.minute}'`;
      if (scoreEl) scoreEl.textContent = `${homeShort} ${ctx.scoreHome} - ${ctx.scoreAway} ${ctx.awayShort}`;
      if (subEl) subEl.textContent = cel.subtitle;

      const keysEl = document.getElementById('goal-interactive-keys');
      if (keysEl) {
        keysEl.classList.toggle('hidden', !ctx.isHomeGoal);
        keysEl.style.display = ctx.isHomeGoal ? '' : 'none';
      }
      const replayBadge = document.getElementById('goal-replay-badge');
      if (replayBadge) replayBadge.classList.toggle('hidden', !(cel.replay && !this.reduceMotion));
      const playerCard = document.getElementById('hud-player-card');
      if (playerCard) playerCard.classList.add('opacity-0');
      banner.classList.remove('hidden');
    }

    skip() {
      if (!this.active) return;
      this.timer = 0;
      this.stop();
    }

    stop() {
      this.active = false;
      this.slowMoTimer = 0;
      this._confettiActive = false;
      this._fireworksActive = false;
      this._flashElapsed = 99;
      this._shockwaveElapsed = 99;

      this.haloGroup.visible = false;
      this.wolfTotem.visible = false;
      this.shockwaveMesh.visible = false;
      this.spotlightMesh.visible = false;
      this.confettiMesh.visible = false;
      this.fireworkGroup.visible = false;

      if (typeof document !== 'undefined') {
        const banner = document.getElementById('goal-banner-overlay');
        if (banner) banner.classList.add('hidden');
        const replayBadge = document.getElementById('goal-replay-badge');
        if (replayBadge) replayBadge.classList.add('hidden');
        const playerCard = document.getElementById('hud-player-card');
        if (playerCard) playerCard.classList.remove('opacity-0');
      }
    }

    _updateConfetti(dt, elapsed) {
      if (!this._confettiActive || !this.confettiMesh.visible) return;
      const gravity = this.reduceMotion ? 3.2 : 6.4;
      const drag = this.reduceMotion ? 0.965 : 0.955;
      const flutter = this.reduceMotion ? 0.35 : 1.15;

      for (let i = 0; i < CONFETTI_COUNT; i++) {
        const sc = this._cfScale[i];
        if (sc <= 0) continue;

        let y = this._cfPosY[i];
        if (y > 0.06) {
          this._cfVelY[i] -= gravity * dt;
          if (this._cfVelY[i] < -2.4) this._cfVelY[i] = -2.4;
          const damp = Math.pow(drag, dt * 60);
          this._cfVelX[i] *= damp;
          this._cfVelZ[i] *= damp;

          const ph = this._cfPhase[i];
          this._cfPosX[i] += (this._cfVelX[i] + Math.sin(elapsed * 4.2 + ph) * flutter) * dt;
          this._cfPosY[i] += this._cfVelY[i] * dt;
          this._cfPosZ[i] += (this._cfVelZ[i] + Math.cos(elapsed * 3.7 + ph) * flutter) * dt;

          this._cfRotX[i] += this._cfSpinX[i] * dt;
          this._cfRotY[i] += this._cfSpinY[i] * dt;
          this._cfRotZ[i] += this._cfSpinZ[i] * dt;

          if (this._cfPosY[i] <= 0.06) {
            this._cfPosY[i] = 0.06;
            this._cfRotX[i] = Math.PI / 2;
          }
        }

        this._dummy.position.set(this._cfPosX[i], this._cfPosY[i], this._cfPosZ[i]);
        this._dummy.rotation.set(this._cfRotX[i], this._cfRotY[i], this._cfRotZ[i]);
        this._dummy.scale.set(sc, sc, sc);
        this._dummy.updateMatrix();
        this.confettiMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this.confettiMesh.instanceMatrix.needsUpdate = true;
    }

    _updateFireworks(dt) {
      if (!this._fireworksActive || !this.fireworkGroup.visible) return;
      const gravity = this.reduceMotion ? 6.5 : 11.5;

      for (let i = 0; i < FIREWORK_SPARK_COUNT; i++) {
        this._fwAge[i] += dt;
        if (this._fwAge[i] >= this._fwLife[i]) {
          this._spawnFireworkSpark(i, false);
        }
        this._fwVelY[i] -= gravity * dt;
        this._fwPosX[i] += this._fwVelX[i] * dt;
        this._fwPosY[i] += this._fwVelY[i] * dt;
        this._fwPosZ[i] += this._fwVelZ[i] * dt;

        const lifeRatio = Math.max(0, 1 - this._fwAge[i] / this._fwLife[i]);
        const sc = lifeRatio > 0.05 ? (0.45 + lifeRatio * 0.95) : 0;

        this._dummy.position.set(this._fwPosX[i], Math.max(0.1, this._fwPosY[i]), this._fwPosZ[i]);
        this._dummy.rotation.set(0, this._fwAge[i] * 5, 0);
        this._dummy.scale.set(sc * 0.7, sc * 2.2, sc * 0.7);
        this._dummy.updateMatrix();
        this._fireworkSparks.setMatrixAt(i, this._dummy.matrix);
      }
      this._fireworkSparks.instanceMatrix.needsUpdate = true;
    }

    update(dt, elapsed, scorerPos, goalPos) {
      if (!this.active || !this.current) return makeIdleResult();

      const safeDt = Math.min(0.1, Math.max(0, dt || 0));
      this.timer -= safeDt;
      if (this.slowMoTimer > 0) this.slowMoTimer = Math.max(0, this.slowMoTimer - safeDt);

      if (scorerPos) {
        this._lastScorerPos.x = scorerPos.x || 0;
        this._lastScorerPos.y = scorerPos.y || 0;
        this._lastScorerPos.z = scorerPos.z || 0;
      }

      const sx = this._lastScorerPos.x;
      const sz = this._lastScorerPos.z;
      const goalZ = goalPos && typeof goalPos.z === 'number'
        ? goalPos.z
        : (this._isHomeGoal ? -52.5 : 52.5);
      const elapsedInCel = Math.max(0, this.current.duration - this.timer);

      // 1. Sculpted Wolf Hologram rise & pulse
      if (this.wolfTotem.visible) {
        const riseT = Math.min(1, elapsedInCel / 0.85);
        const easeOut = 1 - Math.pow(1 - riseT, 3);
        const bob = this.reduceMotion ? 0 : Math.sin(elapsed * 3.6) * 0.45;
        this.wolfTotem.position.y = 2.6 + easeOut * 4.2 + bob;
        this.wolfTotem.position.z = goalZ + (this._isHomeGoal ? -3.0 : 3.0);
        const pulse = 1.0 + (this.reduceMotion ? 0 : Math.sin(elapsed * 5.2) * 0.06);
        this.wolfTotem.scale.set(pulse, pulse, pulse);
        this._wolfAuraOuter.rotation.z = elapsed * 0.9;
        this._wolfAuraTorus2.rotation.z = -elapsed * 1.45;
        this._wolfBaseRing.rotation.z = elapsed * 1.8;
        this._wolfEyeMat.opacity = 0.78 + Math.sin(elapsed * 8.0) * 0.2;
      }

      // 2. Orbiting Holographic Football + Energy Rings + Vertical Streaks
      if (this.haloGroup.visible) {
        this.haloGroup.position.set(sx, 1.38, sz);
        const spinMult = this.reduceMotion ? 0.3 : 1.0;
        this._haloRing1.rotation.z = elapsed * 3.2 * spinMult;
        this._haloRing2.rotation.x = -0.55 + Math.sin(elapsed * 2.5 * spinMult) * 0.45;
        this._haloRing2.rotation.z = -elapsed * 2.6 * spinMult;
        this._holoBallPivot.rotation.y = elapsed * 4.6 * spinMult;
        this._holoBallMesh.rotation.x = elapsed * 5.2 * spinMult;
        this._holoBallMesh.rotation.y = elapsed * 3.8 * spinMult;
        for (let i = 0; i < this._energyStreaks.length; i++) {
          const st = this._energyStreaks[i];
          const cycle = (elapsed * 1.8 + st.userData.phase) % 1.0;
          st.position.y = -0.6 + cycle * 2.2;
          st.scale.y = 0.5 + Math.sin(cycle * Math.PI) * 0.85;
        }
        this._streakMat.opacity = 0.35 + Math.sin(elapsed * 7.0) * 0.2;
      }

      // 3. Expanding Pitch Shockwave Ring (scale 1 -> 28 over 1.2s)
      if (this.shockwaveMesh.visible) {
        this._shockwaveElapsed += safeDt;
        const p = this._shockwaveElapsed / SHOCKWAVE_DURATION_SEC;
        if (p >= 1.0) {
          this.shockwaveMesh.visible = false;
        } else {
          const ease = 1 - Math.pow(1 - p, 3);
          const radiusScale = 1 + ease * 27;
          this.shockwaveMesh.scale.set(radiusScale, radiusScale, 1);
          const fade = Math.pow(1 - p, 1.6);
          this._shockwaveOuterMat.opacity = 0.86 * fade;
          this._shockwaveInnerMat.opacity = 0.94 * Math.max(0, 1 - p * 1.25);
        }
      }

      // 4. Dramatic Stadium Spotlight Cone tracking scorer
      if (this.spotlightMesh.visible) {
        this.spotlightMesh.position.x += (sx - this.spotlightMesh.position.x) * Math.min(1, safeDt * 7.5);
        this.spotlightMesh.position.z += (sz - this.spotlightMesh.position.z) * Math.min(1, safeDt * 7.5);
        const softPulse = this.reduceMotion ? 1.0 : (0.9 + Math.sin(elapsed * 4.2) * 0.12);
        this._spotlightConeMat.opacity = 0.16 * softPulse;
        this._spotlightPoolMat.opacity = 0.24 * softPulse;
      }

      // 5. Confetti Cannon & Firework Fountains
      this._updateConfetti(safeDt, elapsed);
      this._updateFireworks(safeDt);

      // 6. Respectful Non-Strobing Single Soft Flash Pulse (0.28 -> 0 over 0.35s)
      let flashAlpha = 0;
      if (this.current.flash && !this.noFlash && !this.reduceMotion && this._flashElapsed < FLASH_DURATION_SEC) {
        this._flashElapsed += safeDt;
        const fp = Math.min(1, this._flashElapsed / FLASH_DURATION_SEC);
        flashAlpha = 0.28 * (1 - fp) * (1 - fp);
      }

      // 7. Replay Badge & Progress
      const replayActive = !!(this.current.replay && !this.reduceMotion && elapsedInCel < REPLAY_WINDOW_SEC);
      const replayProgress = replayActive ? Math.max(0, Math.min(1, elapsedInCel / REPLAY_WINDOW_SEC)) : 0;
      if (typeof document !== 'undefined') {
        const replayBadge = document.getElementById('goal-replay-badge');
        if (replayBadge) replayBadge.classList.toggle('hidden', !replayActive);
      }

      // 8. Smooth tapered camera shake (disabled if reduceMotion)
      const shakeEnv = elapsedInCel < 1.8 ? (1.0 - (elapsedInCel / 1.8) * 0.65) : 0.35;
      const shakeAmt = this.reduceMotion ? 0 : ((this.current.shake || 0) * this.intensity * 0.32 * shakeEnv);
      const shakeOffset = {
        x: (Math.random() - 0.5) * shakeAmt,
        y: (Math.random() - 0.5) * shakeAmt
      };

      if (this.timer <= 0) {
        this.stop();
        return makeIdleResult();
      }

      return {
        done: false,
        timeScale: (!this.reduceMotion && this.slowMoTimer > 0) ? 0.42 : 1.0,
        shakeOffset,
        wave: !!this.current.wave,
        cameraStyle: this.current.cameraStyle || 'hero_orbit',
        scorerStyle: this.current.style || 'grito',
        teammateBehavior: this.current.teammateBehavior || 'huddle',
        benchJump: !!this.current.benchJump,
        replayActive,
        replayProgress,
        smokeBoost: this.current.smokeBoost || 1.0,
        confettiIntensity: this.current.confetti || 0,
        flashAlpha,
        mascotBoost: !!this.current.mascotBoost,
        lobitoPose: this._isHomeGoal ? (this.current.lobitoPose || (this.current.mascotBoost ? 'estrella' : null)) : null,
        elapsedInCel
      };
    }

    dispose() {
      this.stop();
      const props = [
        this.haloGroup,
        this.wolfTotem,
        this.shockwaveMesh,
        this.spotlightMesh,
        this.confettiMesh,
        this.fireworkGroup
      ];
      for (let i = 0; i < props.length; i++) {
        if (props[i] && this.scene) this.scene.remove(props[i]);
      }
      for (let i = 0; i < this._disposables.geometries.length; i++) {
        this._disposables.geometries[i].dispose();
      }
      for (let i = 0; i < this._disposables.materials.length; i++) {
        this._disposables.materials[i].dispose();
      }
      this._disposables.geometries.length = 0;
      this._disposables.materials.length = 0;
    }
  }

  GoalCelebrationDirector.CELEBRATIONS = CELEBRATIONS;
  global.GoalCelebrationDirector = GoalCelebrationDirector;
})(window);
