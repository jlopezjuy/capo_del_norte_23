/**
 * GoalCelebrationDirector — Director Contextual de Festejos y VFX (desacoplado de reglas)
 */
(function (global) {
  'use strict';

  const CELEBRATIONS = [
    { id: 'grito_lobo', title: 'EL GRITO DEL LOBO', subtitle: '¡Ruge el 23 de Agosto!', style: 'dance', duration: 4.2, slowMo: 0.0, shake: 0.35, wave: false, wolfTotem: true, halo: false },
    { id: 'terremoto_jujuy', title: 'TERREMOTO EN JUJUY', subtitle: '¡Explota la Popular Lobo Norte!', style: 'dance', duration: 4.2, slowMo: 0.0, shake: 0.85, wave: false, wolfTotem: false, halo: false },
    { id: 'ola_celeste', title: 'LA OLA CELESTE', subtitle: 'Todo el estadio de pie', style: 'orchestra', duration: 4.4, slowMo: 0.0, shake: 0.15, wave: true, wolfTotem: false, halo: false },
    { id: 'gol_otro_planeta', title: 'GOL DE OTRO PLANETA', subtitle: '¡Definición estelar!', style: 'dance', duration: 4.0, slowMo: 0.9, shake: 0.25, wave: false, wolfTotem: false, halo: true },
    { id: 'baile_colectivo', title: 'BAILE COLECTIVO', subtitle: 'Festejo grupal albiceleste', style: 'dance', duration: 4.0, slowMo: 0.0, shake: 0.20, wave: false, wolfTotem: false, halo: false },
    { id: 'director_orquesta', title: 'DIRECTOR DE ORQUESTA', subtitle: 'El goleador dirige a la hinchada', style: 'orchestra', duration: 4.2, slowMo: 0.0, shake: 0.15, wave: true, wolfTotem: false, halo: false },
    { id: 'todos_al_corner', title: 'TODOS AL CÓRNER', subtitle: 'Locura junto al banderín', style: 'corner', duration: 4.0, slowMo: 0.0, shake: 0.30, wave: false, wolfTotem: false, halo: false },
    { id: 'gol_minuto_90', title: 'GOL AGÓNICO • MINUTO 90', subtitle: '¡Inolvidable en San Salvador!', style: 'dance', duration: 4.6, slowMo: 1.1, shake: 0.65, wave: true, wolfTotem: true, halo: true }
  ];

  class GoalCelebrationDirector {
    constructor(scene) {
      this.scene = scene;
      this.active = false;
      this.current = null;
      this.lastId = null;
      this.timer = 0;
      this.slowMoTimer = 0;
      this.reduceMotion = false;
      this.intensity = 1.0;

      this._buildVfxProps();
    }

    _buildVfxProps() {
      // Halo holográfico ("Gol de otro planeta")
      this.haloGroup = new THREE.Group();
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.06, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      );
      ring1.rotation.x = Math.PI / 2;
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 })
      );
      ring2.rotation.y = Math.PI / 3;
      this.haloGroup.add(ring1, ring2);
      this.haloGroup.visible = false;
      this.scene.add(this.haloGroup);

      // Silueta luminosa del Lobo detrás del arco ("El Grito del Lobo")
      this.wolfTotem = new THREE.Group();
      const wolfMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72, wireframe: false });
      const head = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.2, 5), wolfMat);
      head.rotation.x = Math.PI / 2;
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 4), wolfMat);
      earL.position.set(-1.3, 2.1, -0.5);
      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 4), wolfMat);
      earR.position.set(1.3, 2.1, -0.5);
      this.wolfTotem.add(head, earL, earR);
      this.wolfTotem.visible = false;
      this.scene.add(this.wolfTotem);
    }

    selectCelebration(ctx) {
      let pool = CELEBRATIONS.filter((c) => c.id !== this.lastId);
      if (ctx.minute >= 85 && ctx.isHomeGoal) {
        return CELEBRATIONS.find((c) => c.id === 'gol_minuto_90');
      }
      if (ctx.shotDistance > 22) {
        const longShot = pool.find((c) => c.id === 'gol_otro_planeta');
        if (longShot && Math.random() < 0.65) return longShot;
      }
      if (!ctx.isHomeGoal) {
        // Rival goal uses shorter standard celebration
        return {
          id: 'rival_goal',
          title: `GOL DE ${ctx.teamName.toUpperCase()}`,
          subtitle: `Minuto ${ctx.minute}'`,
          style: 'dance',
          duration: 3.2,
          slowMo: 0.0,
          shake: 0.1,
          wave: false,
          wolfTotem: false,
          halo: false
        };
      }
      return pool[Math.floor(Math.random() * pool.length)];
    }

    start(ctx) {
      this.current = this.selectCelebration(ctx);
      this.lastId = this.current.id;
      this.active = true;
      this.timer = this.current.duration;
      this.slowMoTimer = this.reduceMotion ? 0 : this.current.slowMo;

      this.haloGroup.visible = !!(this.current.halo && !this.reduceMotion);
      this.wolfTotem.visible = !!(this.current.wolfTotem && !this.reduceMotion);
      if (this.wolfTotem.visible) {
        this.wolfTotem.position.set(0, 5.5, ctx.isHomeGoal ? -55.5 : 55.5);
        this.wolfTotem.rotation.y = ctx.isHomeGoal ? 0 : Math.PI;
      }

      this._showBanner(ctx, this.current);
      return this.current;
    }

    _showBanner(ctx, cel) {
      const banner = document.getElementById('goal-banner-overlay');
      if (!banner) return;
      document.getElementById('goal-banner-title').textContent = cel.title;
      document.getElementById('goal-banner-scorer').textContent = `#${ctx.scorerNumber} ${ctx.scorerName} • ${ctx.minute}'`;
      document.getElementById('goal-banner-score').textContent = `GYE ${ctx.scoreHome} - ${ctx.scoreAway} ${ctx.awayShort}`;
      document.getElementById('goal-banner-sub').textContent = cel.subtitle;
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
      this.haloGroup.visible = false;
      this.wolfTotem.visible = false;
      const banner = document.getElementById('goal-banner-overlay');
      if (banner) banner.classList.add('hidden');
    }

    update(dt, elapsed, scorerPos) {
      if (!this.active || !this.current) return { done: true, timeScale: 1, shakeOffset: { x: 0, y: 0 }, wave: false };

      this.timer -= dt;
      if (this.slowMoTimer > 0) this.slowMoTimer -= dt;

      if (this.haloGroup.visible && scorerPos) {
        this.haloGroup.position.set(scorerPos.x, 1.4, scorerPos.z);
        this.haloGroup.rotation.y = elapsed * 4.5;
        this.haloGroup.rotation.z = Math.sin(elapsed * 3) * 0.35;
      }
      if (this.wolfTotem.visible) {
        this.wolfTotem.position.y = 5.5 + Math.sin(elapsed * 4) * 0.6;
        const s = 1.0 + Math.sin(elapsed * 6) * 0.08;
        this.wolfTotem.scale.set(s, s, s);
      }

      const shakeAmt = this.reduceMotion ? 0 : (this.current.shake * this.intensity * 0.35);
      const shakeOffset = {
        x: (Math.random() - 0.5) * shakeAmt,
        y: (Math.random() - 0.5) * shakeAmt
      };

      if (this.timer <= 0) {
        this.stop();
        return { done: true, timeScale: 1, shakeOffset: { x: 0, y: 0 }, wave: false };
      }

      return {
        done: false,
        timeScale: this.slowMoTimer > 0 ? 0.42 : 1.0,
        shakeOffset,
        wave: !!this.current.wave
      };
    }
  }

  global.GoalCelebrationDirector = GoalCelebrationDirector;
})(window);
