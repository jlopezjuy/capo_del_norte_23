/**
 * GoalCelebrationDirector — Director Contextual de Festejos y VFX (16 variantes, desacoplado de reglas)
 */
(function (global) {
  'use strict';

  const CELEBRATIONS = [
    { id: 'grito_gol', title: 'EL GRITO DE GOL', subtitle: '¡Ruge la tribuna de los cerros!', style: 'grito', duration: 4.0, slowMo: 0.0, shake: 0.35, wave: false, wolfTotem: true, halo: false, flash: false },
    { id: 'terremoto_tribuna', title: 'TERREMOTO EN LA TRIBUNA', subtitle: '¡Tiembla la Popular Norte!', style: 'grito', duration: 4.1, slowMo: 0.0, shake: 0.78, wave: false, wolfTotem: false, halo: false, flash: true },
    { id: 'gol_otro_planeta', title: 'GOL DE OTRO PLANETA', subtitle: '¡Definición estelar!', style: 'dance', duration: 4.0, slowMo: 0.85, shake: 0.25, wave: false, wolfTotem: false, halo: true, flash: true },
    { id: 'baile_colectivo', title: 'BAILE COLECTIVO', subtitle: 'Coreografía albiceleste en el área', style: 'dance', duration: 3.9, slowMo: 0.0, shake: 0.18, wave: false, wolfTotem: false, halo: false, flash: false },
    { id: 'ola_celeste', title: 'LA OLA CELESTE', subtitle: 'Todo el estadio se levanta por sectores', style: 'orchestra', duration: 4.3, slowMo: 0.0, shake: 0.14, wave: true, wolfTotem: false, halo: false, flash: false },
    { id: 'mascota_gigante', title: 'LA MASCOTA DEL NORTE', subtitle: '¡Festejo detrás del arco!', style: 'grito', duration: 4.0, slowMo: 0.0, shake: 0.30, wave: false, wolfTotem: true, halo: false, flash: false },
    { id: 'golazo_cinematografico', title: 'GOLAZO CINEMATOGRÁFICO', subtitle: 'Repetición en cámara lenta', style: 'grito', duration: 4.4, slowMo: 1.4, shake: 0.22, wave: false, wolfTotem: false, halo: false, flash: false, replay: true },
    { id: 'lluvia_papelitos', title: 'LLUVIA DE PAPELITOS', subtitle: 'Celeste y blanco sobre el césped', style: 'dance', duration: 3.8, slowMo: 0.0, shake: 0.16, wave: true, wolfTotem: false, halo: false, flash: false },
    { id: 'arquero_incredulo', title: 'EL ARQUERO INCRÉDULO', subtitle: 'No la pudo ni ver pasar', style: 'grito', duration: 3.8, slowMo: 0.5, shake: 0.20, wave: false, wolfTotem: false, halo: false, flash: false },
    { id: 'todos_al_corner', title: 'TODOS AL CÓRNER', subtitle: 'Locura junto al banderín', style: 'corner', duration: 3.9, slowMo: 0.0, shake: 0.28, wave: false, wolfTotem: false, halo: false, flash: false },
    { id: 'gol_minuto_90', title: 'GOL DEL MINUTO 90', subtitle: '¡Agónico en el Estadio de los Cerros!', style: 'grito', duration: 4.6, slowMo: 1.1, shake: 0.60, wave: true, wolfTotem: true, halo: true, flash: true, replay: true },
    { id: 'gol_imposible', title: 'EL GOL IMPOSIBLE', subtitle: '¡Remate de otro calibre!', style: 'dance', duration: 4.3, slowMo: 1.0, shake: 0.45, wave: true, wolfTotem: false, halo: true, flash: true },
    { id: 'director_orquesta', title: 'DIRECTOR DE ORQUESTA', subtitle: 'El goleador dirige a la hinchada', style: 'orchestra', duration: 4.2, slowMo: 0.0, shake: 0.12, wave: true, wolfTotem: false, halo: false, flash: false },
    { id: 'locura_banco', title: 'LOCURA EN EL BANCO', subtitle: '¡Festeja todo el plantel!', style: 'dance', duration: 3.9, slowMo: 0.0, shake: 0.24, wave: true, wolfTotem: false, halo: false, flash: false },
    { id: 'fiesta_tribuna', title: 'FIESTA EN LA TRIBUNA', subtitle: 'Banderas, humo celeste y estadio lleno', style: 'grito', duration: 4.3, slowMo: 0.0, shake: 0.40, wave: true, wolfTotem: true, halo: true, flash: false },
    { id: 'celebracion_sorpresa', title: 'SORPRESA ALBICELESTE', subtitle: '¡Festejo especial inesperado!', style: 'dance', duration: 4.1, slowMo: 0.6, shake: 0.32, wave: true, wolfTotem: true, halo: true, flash: false }
  ];

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

      this._buildVfxProps();
    }

    _buildVfxProps() {
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

      this.wolfTotem = new THREE.Group();
      const wolfMat = new THREE.MeshBasicMaterial({ color: 0x1ea7fd, transparent: true, opacity: 0.78 });
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
      if (!ctx.isHomeGoal) {
        return {
          id: 'rival_goal',
          title: `GOL DE ${ctx.teamName.toUpperCase()}`,
          subtitle: `Minuto ${ctx.minute}' • Silencio en el estadio`,
          style: 'grito',
          duration: 3.1,
          slowMo: 0.0,
          shake: 0.08,
          wave: false,
          wolfTotem: false,
          halo: false,
          flash: false
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
      const found = CELEBRATIONS.find((c) => c.id === map[keyNum]);
      if (!found) return null;
      this.current = found;
      this.haloGroup.visible = !!(found.halo && !this.reduceMotion && !this.noFlash);
      this.wolfTotem.visible = !!(found.wolfTotem && !this.reduceMotion);
      const titleEl = document.getElementById('goal-banner-title');
      const subEl = document.getElementById('goal-banner-sub');
      if (titleEl) titleEl.textContent = found.title;
      if (subEl) subEl.textContent = found.subtitle;
      return found;
    }

    start(ctx) {
      this.current = this.selectCelebration(ctx);
      if (ctx.isHomeGoal) {
        this.recentIds.push(this.current.id);
        if (this.recentIds.length > 4) this.recentIds.shift();
      }
      this.active = true;
      this.timer = this.current.duration;
      this.slowMoTimer = this.reduceMotion ? 0 : this.current.slowMo;

      this.haloGroup.visible = !!(this.current.halo && !this.reduceMotion && !this.noFlash);
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
      const badgeEl = document.getElementById('goal-banner-badge');
      if (badgeEl && global.ClubBadges) {
        badgeEl.innerHTML = global.ClubBadges.getSvg(ctx.isHomeGoal ? 'ssc' : (ctx.awayId || 'gnf'), ctx.isHomeGoal ? null : ctx.awayHex, 42);
      }
      document.getElementById('goal-banner-title').textContent = cel.title;
      document.getElementById('goal-banner-scorer').textContent = `#${ctx.scorerNumber} ${ctx.scorerName} • ${ctx.minute}'`;
      document.getElementById('goal-banner-score').textContent = `SSC ${ctx.scoreHome} - ${ctx.scoreAway} ${ctx.awayShort}`;
      document.getElementById('goal-banner-sub').textContent = cel.subtitle;
      const keysEl = document.getElementById('goal-interactive-keys');
      if (keysEl) keysEl.classList.toggle('hidden', !ctx.isHomeGoal);
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

      const shakeAmt = this.reduceMotion ? 0 : (this.current.shake * this.intensity * 0.32);
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
