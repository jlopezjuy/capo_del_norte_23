/**
 * GameEngine — Core 3D Match Loop, 60Hz Fixed Timestep, Cameras, Set Pieces & Penalties
 */
(function (global) {
  'use strict';

  const FIXED_DT = 1 / 60;

  class GameEngine {
    constructor() {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.hemiLight = null;
      this.sunLight = null;
      this.stadiumRefs = null;

      this.audio = new global.AudioEngine();
      this.matchState = new global.MatchState();
      this.input = new global.InputController();
      this.physics = new global.PhysicsEngine({
        onGoal: (team) => this._handleGoal(team),
        onOut: (info) => this._handleOutOfBounds(info),
        onPostHit: () => this.audio.playPostHit(),
        onKick: (power) => this.audio.playKick(power)
      });
      this.ai = new global.TacticalAI(this.physics);

      this.currentFixture = null;
      this.kitInfo = null;
      this.cameraMode = 'broadcast'; // 'broadcast' | 'pro' | 'tribuna'
      this.tribunaSectorIndex = 0;
      this.tribunaKeys = ['popular_norte', 'platea_baja', 'preferencial', 'palcos_vip', 'popular_sur'];

      this.camPos = new THREE.Vector3(-52, 21.5, 0);
      this.camLook = new THREE.Vector3(0, 1.0, 0);

      this.playerMeshes = [];
      this.refMesh = null;
      this.ballMesh = null;
      this.ballShadowMesh = null;
      this.dropRingMesh = null;
      this.activeRingMesh = null;
      this.activeArrowMesh = null;
      this.matchGroup = null;

      this.simAccum = 0;
      this.lastFrameTime = performance.now();
      this.scoreboardTimer = 0;
      this.minimapDots = [];

      this.input.onPauseCallback = () => {
        if (this.matchState.phase === 'PLAYING' || this.matchState.phase === 'KICKOFF' || this.matchState.phase === 'SET_PIECE') {
          this.togglePause();
        } else if (this.matchState.phase === 'PAUSED') {
          this.togglePause();
        }
      };
      this.input.onCameraCycleCallback = () => {
        if (this.matchState.phase !== 'LOBBY') {
          this.cycleCameraMode();
        }
      };
    }

    init(containerId = 'canvas-container') {
      const container = document.getElementById(containerId);
      if (typeof THREE === 'undefined') {
        if (container) {
          container.innerHTML = '<div style="color:#f8fafc;padding:24px;font-family:sans-serif">No se pudo cargar Three.js desde CDN. Verificá tu conexión a internet y recargá la página.</div>';
        }
        return;
      }

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x4a2346, 0.0022);

      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      this.camera = new THREE.PerspectiveCamera(58, w / h, 0.5, 900);
      this.camPos.set(-51, 25.5, 0);
      this.camera.position.copy(this.camPos);

      try {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      } catch (e1) {
        try {
          this.renderer = new THREE.WebGLRenderer({ antialias: false });
        } catch (e2) {
          if (container) {
            container.innerHTML = '<div style="color:#f8fafc;padding:24px;font-family:sans-serif">WebGL no está disponible en este navegador o pestaña.</div>';
          }
          return;
        }
      }
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = false;
      container.appendChild(this.renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.26);
      this.scene.add(ambientLight);

      this.hemiLight = new THREE.HemisphereLight(0xf472b6, 0x1f2937, 0.52);
      this.scene.add(this.hemiLight);

      this.sunLight = new THREE.DirectionalLight(0xfb923c, 0.78);
      this.sunLight.position.set(-120, 46, -35);
      this.scene.add(this.sunLight);

      this.stadiumRefs = global.StadiumBuilder.buildAll(this.scene, {
        scene: this.scene,
        hemiLight: this.hemiLight,
        sunLight: this.sunLight
      });

      this._createBallAndIndicators();

      window.addEventListener('resize', () => this._onResize());
      this._startLoop();
    }

    _onResize() {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _createBallAndIndicators() {
      this.matchGroup = new THREE.Group();
      this.scene.add(this.matchGroup);

      // Football with pentagon pattern canvas texture
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 128;
      bCanvas.height = 64;
      const bCtx = bCanvas.getContext('2d');
      bCtx.fillStyle = '#ffffff';
      bCtx.fillRect(0, 0, 128, 64);
      bCtx.fillStyle = '#0f172a';
      for (let x = 8; x < 128; x += 28) {
        for (let y = 10; y < 64; y += 26) {
          bCtx.beginPath();
          bCtx.arc(x + (y % 20 ? 8 : 0), y, 6, 0, Math.PI * 2);
          bCtx.fill();
        }
      }
      const ballTex = new THREE.CanvasTexture(bCanvas);

      this.ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 16),
        new THREE.MeshLambertMaterial({ map: ballTex })
      );
      this.matchGroup.add(this.ballMesh);

      this.ballShadowMesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.46, 14),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })
      );
      this.ballShadowMesh.rotation.x = -Math.PI / 2;
      this.ballShadowMesh.position.y = 0.03;
      this.matchGroup.add(this.ballShadowMesh);

      // Aerial drop indicator ring
      this.dropRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.78, 24),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false })
      );
      this.dropRingMesh.rotation.x = -Math.PI / 2;
      this.dropRingMesh.position.y = 0.05;
      this.dropRingMesh.visible = false;
      this.matchGroup.add(this.dropRingMesh);

      // Active player celeste cursor ring + direction arrow
      this.activeRingMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.68, 0.92, 28),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false })
      );
      this.activeRingMesh.rotation.x = -Math.PI / 2;
      this.activeRingMesh.position.y = 0.05;
      this.matchGroup.add(this.activeRingMesh);

      const arrowShape = new THREE.ConeGeometry(0.24, 0.55, 4);
      arrowShape.rotateX(Math.PI / 2);
      this.activeArrowMesh = new THREE.Mesh(
        arrowShape,
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      this.activeArrowMesh.position.set(0, 0.14, 1.15);
      this.activeRingMesh.add(this.activeArrowMesh);
    }

    _buildPlayersForFixture(fixture) {
      // Clear previous player meshes
      this.playerMeshes.forEach((pm) => this.matchGroup.remove(pm.group));
      this.playerMeshes = [];
      if (this.refMesh) {
        this.matchGroup.remove(this.refMesh.group);
        this.refMesh = null;
      }

      this.kitInfo = global.AFA_DATA.resolveKitColors(fixture.opponent);
      this.matchState.players = [];

      // Shared geometries for 60 FPS
      const torsoGeo = new THREE.BoxGeometry(0.62, 0.80, 0.36);
      const shortsGeo = new THREE.BoxGeometry(0.56, 0.36, 0.34);
      const headGeo = new THREE.SphereGeometry(0.24, 10, 10);
      const legGeo = new THREE.BoxGeometry(0.18, 0.56, 0.18);
      const armGeo = new THREE.BoxGeometry(0.14, 0.58, 0.16);
      const shadowGeo = new THREE.CircleGeometry(0.52, 14);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.36, depthWrite: false });
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xf1c27d });

      const homeShirtMat = new THREE.MeshLambertMaterial({ color: global.AFA_DATA.GYE_CLUB.primaryColor });
      const homeGkMat = new THREE.MeshLambertMaterial({ color: global.AFA_DATA.GYE_CLUB.gkColor });
      const homeShortsMat = new THREE.MeshLambertMaterial({ color: global.AFA_DATA.GYE_CLUB.shortsColor });

      const awayShirtMat = new THREE.MeshLambertMaterial({ color: this.kitInfo.shirt });
      const awayGkMat = new THREE.MeshLambertMaterial({ color: this.kitInfo.gk });
      const awayShortsMat = new THREE.MeshLambertMaterial({ color: this.kitInfo.shorts });

      const createFigure = (shirtMat, shortsMat) => {
        const group = new THREE.Group();
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.position.y = 0.025;
        const torso = new THREE.Mesh(torsoGeo, shirtMat);
        torso.position.y = 1.24;
        const armL = new THREE.Mesh(armGeo, shirtMat);
        armL.position.set(-0.39, 1.22, 0);
        const armR = new THREE.Mesh(armGeo, shirtMat);
        armR.position.set(0.39, 1.22, 0);
        const shorts = new THREE.Mesh(shortsGeo, shortsMat);
        shorts.position.y = 0.72;
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.86;
        const legL = new THREE.Mesh(legGeo, skinMat);
        legL.position.set(-0.15, 0.32, 0);
        const legR = new THREE.Mesh(legGeo, skinMat);
        legR.position.set(0.15, 0.32, 0);
        group.add(shadow, torso, armL, armR, shorts, head, legL, legR);
        group.scale.set(1.16, 1.16, 1.16);
        return { group, legL, legR };
      };

      let idCounter = 0;

      // 11 Gimnasia players
      global.AFA_DATA.GYE_SQUAD.forEach((sq) => {
        const mat = sq.role === 'GK' ? homeGkMat : homeShirtMat;
        const fig = createFigure(mat, homeShortsMat);
        fig.group.position.set(sq.baseX, 0, sq.baseZ);
        this.matchGroup.add(fig.group);
        this.playerMeshes.push(fig);

        this.matchState.players.push({
          id: idCounter++,
          team: 'home',
          number: sq.number,
          name: sq.name,
          role: sq.role,
          baseX: sq.baseX,
          baseZ: sq.baseZ,
          x: sq.baseX,
          z: sq.baseZ,
          vx: 0,
          vz: 0,
          rotY: Math.PI, // Facing -Z (opponent goal)
          speed: sq.speed,
          stamina: 1.0,
          pickupCooldown: 0,
          tackleCooldown: 0,
          tackleTimer: 0,
          aiDecisionTimer: 0,
          aiState: 'IDLE'
        });
      });

      // 11 Opponent players
      fixture.opponent.squad.forEach((sq) => {
        const mat = sq.role === 'GK' ? awayGkMat : awayShirtMat;
        const fig = createFigure(mat, awayShortsMat);
        fig.group.position.set(sq.baseX, 0, sq.baseZ);
        this.matchGroup.add(fig.group);
        this.playerMeshes.push(fig);

        this.matchState.players.push({
          id: idCounter++,
          team: 'away',
          number: sq.number,
          name: sq.name,
          role: sq.role,
          baseX: sq.baseX,
          baseZ: sq.baseZ,
          x: sq.baseX,
          z: sq.baseZ,
          vx: 0,
          vz: 0,
          rotY: 0, // Facing +Z (Gimnasia goal)
          speed: sq.speed,
          stamina: 1.0,
          pickupCooldown: 0,
          tackleCooldown: 0,
          tackleTimer: 0,
          aiDecisionTimer: 0,
          aiState: 'IDLE'
        });
      });

      // Referee
      const refShirt = new THREE.MeshLambertMaterial({ color: 0xf97316 });
      const refShorts = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      this.refMesh = createFigure(refShirt, refShorts);
      this.refMesh.group.position.set(6, 0, 0);
      this.matchGroup.add(this.refMesh.group);

      this._initMinimapDots();
    }

    _initMinimapDots() {
      const container = document.getElementById('minimap-players-layer');
      if (!container) return;
      container.innerHTML = '';
      this.minimapDots = [];

      const awayHex = this.kitInfo ? this.kitInfo.hex : '#facc15';
      this.matchState.players.forEach((p, idx) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', p.role === 'GK' ? '3.3' : '3.0');
        c.setAttribute('fill', p.team === 'home' ? '#38bdf8' : awayHex);
        c.setAttribute('stroke', idx === this.matchState.activeHomeIndex ? '#ffffff' : '#0f172a');
        c.setAttribute('stroke-width', idx === this.matchState.activeHomeIndex ? '1.8' : '0.8');
        container.appendChild(c);
        this.minimapDots.push(c);
      });
    }

    startMatch(fixture, options = {}) {
      this.currentFixture = fixture;
      this.matchState.reset({
        phase: 'KICKOFF',
        halfDurationRealSec: options.halfDurationRealSec || 180,
        difficulty: options.difficulty || 'nacional',
        matchId: fixture.id
      });

      if (options.skyMode) {
        global.StadiumBuilder.setSkyMode(options.skyMode);
      }

      this._buildPlayersForFixture(fixture);
      this._setupKickoff('home');

      this.audio.setEnabled(true);
      this._syncAudioIcon();
      this.audio.playWhistle('double');

      this._updateScoreboard(false);
      this._setCommentary(`¡Sacás vos! Movete con WASD o Flechas hacia la izquierda (←) • ESPACIO = Pase • L = Remate al arco`);
      this._showHudForMatch();
    }

    _setupKickoff(team) {
      this.matchState.phase = 'KICKOFF';
      this.matchState.kickoffTeam = team;
      this.matchState.kickoffTimer = 0.55;
      this.matchState.ownerPlayerId = null;
      this.matchState.ball = { x: 0, y: 0.34, z: 0, vx: 0, vy: 0, vz: 0 };

      this.matchState.players.forEach((p) => {
        p.vx = 0;
        p.vz = 0;
        p.tackleTimer = 0;
        if (p.team === 'home') {
          p.x = p.baseX;
          p.z = Math.max(team === 'home' ? 2.5 : 12.0, p.baseZ);
          p.rotY = Math.PI;
        } else {
          p.x = p.baseX;
          p.z = Math.min(team === 'away' ? -2.5 : -12.0, p.baseZ);
          p.rotY = 0;
        }
      });

      // Put striker near center spot
      const striker = this.matchState.players.find((p) => p.team === team && p.number === 9);
      if (striker) {
        striker.x = 0;
        striker.z = team === 'home' ? 0.65 : -0.65;
        if (team === 'home') {
          this.matchState.activeHomeIndex = this.matchState.players.indexOf(striker);
        }
      }
    }

    _handleGoal(scoringTeam) {
      if (this.matchState.phase !== 'PLAYING') return;
      this.matchState.phase = 'GOAL_CELEBRATION';
      this.matchState.celebrationTimer = 4.6;
      this.matchState.lastGoalTeam = scoringTeam;
      this.matchState.ownerPlayerId = null;

      if (scoringTeam === 'home') {
        this.matchState.scoreHome += 1;
        this.audio.playGoalRoar();
        this.audio.playWhistle('short');
        this._setCommentary(`¡GOOOOL DE GIMNASIA Y ESGRIMA DE JUJUY! Explota la Popular Lobo Norte (${this.matchState.scoreHome} - ${this.matchState.scoreAway}).`);
      } else {
        this.matchState.scoreAway += 1;
        this.audio.playWhistle('short');
        this._setCommentary(`Gol de ${this.currentFixture.opponent.name}. El marcador queda ${this.matchState.scoreHome} - ${this.matchState.scoreAway}.`);
      }

      this._updateScoreboard(true);
    }

    _handleOutOfBounds(info) {
      if (this.matchState.phase !== 'PLAYING') return;
      const lastTeam = this.matchState.lastTouchTeam || 'home';
      const restartTeam = lastTeam === 'home' ? 'away' : 'home';

      let type = 'THROW_IN';
      let rx = info.x;
      let rz = info.z;

      if (info.type === 'ENDLINE') {
        if (info.endSide === 'north') {
          // North endline (away defends North)
          if (lastTeam === 'away') {
            type = 'CORNER';
            rx = info.x >= 0 ? 34.4 : -34.4;
            rz = -51.8;
            this._setCommentary(`Tiro de esquina para ${restartTeam === 'home' ? 'Gimnasia' : this.currentFixture.opponent.name}.`);
          } else {
            type = 'GOAL_KICK';
            rx = info.x >= 0 ? 5.5 : -5.5;
            rz = -47.5;
            this._setCommentary('Saque de arco.');
          }
        } else {
          // South endline (home defends South)
          if (lastTeam === 'home') {
            type = 'CORNER';
            rx = info.x >= 0 ? 34.4 : -34.4;
            rz = 51.8;
            this._setCommentary(`Córner para ${this.currentFixture.opponent.name}.`);
          } else {
            type = 'GOAL_KICK';
            rx = info.x >= 0 ? 5.5 : -5.5;
            rz = 47.5;
            this._setCommentary('Saque de arco para Milton Álvarez.');
          }
        }
      } else {
        this._setCommentary(`Lateral para ${restartTeam === 'home' ? 'Gimnasia' : this.currentFixture.opponent.name}.`);
      }

      this.audio.playWhistle('short');
      this.matchState.phase = 'SET_PIECE';
      this.matchState.ownerPlayerId = null;
      this.matchState.ball = { x: rx, y: 0.34, z: rz, vx: 0, vy: 0, vz: 0 };
      this.matchState.setPiece = { type, team: restartTeam, x: rx, z: rz, timer: 1.0 };

      // Position taker
      const taker = this._findNearestPlayerOfTeam(restartTeam, rx, rz, type === 'GOAL_KICK');
      if (taker) {
        taker.x = rx;
        taker.z = rz;
        if (restartTeam === 'home') {
          this.matchState.activeHomeIndex = this.matchState.players.indexOf(taker);
        }
      }
    }

    _findNearestPlayerOfTeam(team, x, z, allowGK = false) {
      let best = null;
      let bestDist = Infinity;
      for (const p of this.matchState.players) {
        if (p.team !== team) continue;
        if (!allowGK && p.role === 'GK') continue;
        if (allowGK && p.role === 'GK') return p;
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      return best;
    }

    _stepSimulation(dt) {
      const ms = this.matchState;

      if (ms.phase === 'LOBBY' || ms.phase === 'PAUSED' || ms.phase === 'HALFTIME' || ms.phase === 'FULLTIME') {
        return;
      }

      if (ms.phase === 'PENALTIES') {
        this._stepPenalties(dt);
        return;
      }

      if (ms.phase === 'KICKOFF') {
        ms.kickoffTimer -= dt;
        if (ms.kickoffTimer <= 0) {
          ms.phase = 'PLAYING';
          const kickoffStriker = ms.players.find((p) => p.team === ms.kickoffTeam && p.number === 9);
          if (kickoffStriker) {
            ms.ownerPlayerId = kickoffStriker.id;
            ms.possessionTeam = ms.kickoffTeam;
            kickoffStriker.stealCooldown = 0.9;
          }
          this.audio.playWhistle('short');
        }
        return;
      }

      if (ms.phase === 'SET_PIECE' && ms.setPiece) {
        ms.setPiece.timer -= dt;
        if (ms.setPiece.timer <= 0) {
          const sp = ms.setPiece;
          const taker = this._findNearestPlayerOfTeam(sp.team, sp.x, sp.z, sp.type === 'GOAL_KICK');
          if (taker) {
            const target = this.ai.findPassTarget(taker, ms.players, 0, sp.team === 'home' ? -1 : 1);
            this.ai.executePass(ms, taker, target, sp.type === 'CORNER' || sp.type === 'GOAL_KICK');
          }
          ms.setPiece = null;
          ms.phase = 'PLAYING';
        }
        return;
      }

      if (ms.phase === 'GOAL_CELEBRATION') {
        this.physics.stepBall(ms, dt);
        ms.celebrationTimer -= dt;
        if (ms.celebrationTimer <= 0) {
          const nextKickoff = ms.lastGoalTeam === 'home' ? 'away' : 'home';
          this._setupKickoff(nextKickoff);
          this._updateScoreboard(false);
        }
        return;
      }

      // PLAYING phase
      ms.elapsedRealSec += dt;
      if (ms.elapsedRealSec >= ms.halfDurationRealSec) {
        if (ms.half === 1) {
          ms.phase = 'HALFTIME';
          this.audio.playWhistle('double');
          this._showOverlayModal('halftime');
          return;
        } else {
          ms.phase = 'FULLTIME';
          this.audio.playWhistle('fulltime');
          this._showOverlayModal('fulltime');
          return;
        }
      }

      // Track possession ticks
      if (ms.possessionTeam === 'home') ms.stats.homePossessionTicks += 1;
      else if (ms.possessionTeam === 'away') ms.stats.awayPossessionTicks += 1;

      // Dynamic crowd danger based on ball proximity to goals
      const distToAnyGoal = Math.min(Math.abs(ms.ball.z + 52.5), Math.abs(ms.ball.z - 52.5));
      const danger = Math.max(0, 1 - distToAnyGoal / 32);
      this.audio.setCrowdDanger(danger);

      // Process human input
      this._stepHumanPlayer(dt);

      // Process 21 AI players
      this.ai.update(ms, dt, this.currentFixture ? this.currentFixture.opponent : null);

      // Ball physics & player collisions
      this.physics.stepBall(ms, dt);
      this.physics.resolvePlayerCollisions(ms.players);

      // Ball pickup / steal / GK save check
      this._resolveBallOwnership();
    }

    _stepHumanPlayer(dt) {
      const ms = this.matchState;
      const p = ms.players[ms.activeHomeIndex];
      if (!p) return;

      if (p.pickupCooldown > 0) p.pickupCooldown -= dt;
      if (p.tackleCooldown > 0) p.tackleCooldown -= dt;
      if (p.stealCooldown > 0) p.stealCooldown -= dt;

      const hasBall = ms.ownerPlayerId === p.id;
      const frame = this.input.sample(dt, this.cameraMode, ms.possessionTeam === 'home');

      // Switch player (Q/E)
      if (frame.switchPressed) {
        let bestIdx = ms.activeHomeIndex;
        let bestDist = Infinity;
        ms.players.forEach((cand, idx) => {
          if (cand.team !== 'home' || cand.role === 'GK' || idx === ms.activeHomeIndex) return;
          const d = Math.hypot(cand.x - ms.ball.x, cand.z - ms.ball.z);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });
        ms.activeHomeIndex = bestIdx;
      }

      // Slide tackle burst
      if (p.tackleTimer > 0) {
        p.tackleTimer -= dt;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        return;
      }

      const moveMag = Math.hypot(frame.moveX, frame.moveZ);
      const canSprint = frame.sprint && p.stamina > 0.1;
      if (moveMag > 0.08) {
        const maxSpeed = p.speed * (canSprint ? 1.28 : 0.96);
        p.vx = (frame.moveX / moveMag) * maxSpeed;
        p.vz = (frame.moveZ / moveMag) * maxSpeed;
        p.rotY = Math.atan2(frame.moveX, frame.moveZ);
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        if (canSprint) p.stamina = Math.max(0, p.stamina - dt * 0.25);
        else p.stamina = Math.min(1, p.stamina + dt * 0.14);
      } else {
        p.vx *= 0.72;
        p.vz *= 0.72;
        p.stamina = Math.min(1, p.stamina + dt * 0.22);
      }

      // Update power bar UI
      const powerBar = document.getElementById('hud-power-fill');
      if (powerBar) {
        powerBar.style.width = `${Math.round(frame.shootCharge * 100)}%`;
      }

      // Attacking actions (if this player owns the ball)
      if (hasBall) {
        const dirX = moveMag > 0.1 ? frame.moveX / moveMag : Math.sin(p.rotY);
        const dirZ = moveMag > 0.1 ? frame.moveZ / moveMag : Math.cos(p.rotY);

        if (frame.passPressed) {
          const target = this.ai.findPassTarget(p, ms.players, dirX, dirZ);
          this.ai.executePass(ms, p, target, false);
          if (target && target.team === 'home') {
            ms.activeHomeIndex = ms.players.indexOf(target);
          }
        } else if (frame.lobPressed) {
          const target = this.ai.findPassTarget(p, ms.players, dirX, dirZ);
          this.ai.executePass(ms, p, target, true);
          if (target && target.team === 'home') {
            ms.activeHomeIndex = ms.players.indexOf(target);
          }
        } else if (frame.shootTriggered) {
          // Aim toward North goal (-52.5) blended with player's lateral input, kept inside posts (±3.2m)
          const aimX = Math.max(-3.2, Math.min(3.2, dirX * 3.1));
          const dx = aimX - ms.ball.x;
          const dz = -52.5 - ms.ball.z;
          const dist = Math.max(1, Math.hypot(dx, dz));
          const speed = 19 + frame.shootPower * 15;
          const vy = 1.6 + frame.shootPower * 5.2;
          this.physics.kickBall(ms, p, (dx / dist) * speed, vy, (dz / dist) * speed, true);
          ms.stats.homeShots += 1;
          if (Math.abs(aimX) < 3.66) ms.stats.homeShotsOnTarget += 1;
        }
      } else {
        // Defensive actions
        if (frame.passPressed) {
          const distToBall = Math.hypot(ms.ball.x - p.x, ms.ball.z - p.z);
          if (distToBall > 7.5) {
            // Auto-switch to closest Gimnasia player to the ball
            let bestIdx = ms.activeHomeIndex;
            let bestDist = Infinity;
            ms.players.forEach((cand, idx) => {
              if (cand.team !== 'home' || cand.role === 'GK') return;
              const d = Math.hypot(cand.x - ms.ball.x, cand.z - ms.ball.z);
              if (d < bestDist) { bestDist = d; bestIdx = idx; }
            });
            ms.activeHomeIndex = bestIdx;
          } else if (distToBall > 0.2) {
            // Press / lunge toward ball
            const dx = ms.ball.x - p.x;
            const dz = ms.ball.z - p.z;
            p.x += (dx / distToBall) * 12 * dt;
            p.z += (dz / distToBall) * 12 * dt;
            p.rotY = Math.atan2(dx, dz);
          }
        }
        if (frame.tacklePressed && p.tackleCooldown <= 0) {
          const dx = Math.sin(p.rotY);
          const dz = Math.cos(p.rotY);
          p.vx = dx * 15.5;
          p.vz = dz * 15.5;
          p.tackleTimer = 0.28;
          p.tackleCooldown = 1.8;
        }
      }
    }

    _resolveBallOwnership() {
      const ms = this.matchState;
      const b = ms.ball;
      if (b.y > 1.35) return; // Ball too high in the air

      const currentOwner = ms.ownerPlayerId !== null
        ? ms.players.find((p) => p.id === ms.ownerPlayerId)
        : null;

      for (let i = 0; i < ms.players.length; i++) {
        const p = ms.players[i];
        if (p.pickupCooldown > 0) continue;
        if (currentOwner && currentOwner.id === p.id) continue;

        const reach = p.role === 'GK' ? 1.45 : (p.tackleTimer > 0 ? 1.55 : 1.05);
        const dist = Math.hypot(p.x - b.x, p.z - b.z);
        if (dist < reach) {
          // Steal if opponent owns it (respect stealCooldown unless slide tackling)
          if (currentOwner && currentOwner.team === p.team) continue;
          if (currentOwner && currentOwner.team !== p.team) {
            if (currentOwner.stealCooldown > 0 && p.tackleTimer <= 0) continue;
            if (dist > 0.68 && p.tackleTimer <= 0) continue;
          }

          if (currentOwner) {
            currentOwner.pickupCooldown = 0.45;
          }

          // Pass completion credit
          if (!currentOwner && ms.lastTouchTeam === p.team && ms.lastTouchPlayerId !== p.id) {
            if (p.team === 'home') ms.stats.homePassesCompleted += 1;
            else ms.stats.awayPassesCompleted += 1;
          }

          ms.ownerPlayerId = p.id;
          ms.possessionTeam = p.team;
          ms.lastTouchTeam = p.team;
          ms.lastTouchPlayerId = p.id;
          p.stealCooldown = 0.55;
          p.aiDecisionTimer = p.role === 'GK' ? 0.85 : 0.22;

          if (p.team === 'home' && p.role !== 'GK') {
            ms.activeHomeIndex = i;
          }
          break;
        }
      }
    }

    // =========================================================================
    // PENALTY SHOOTOUT
    // =========================================================================
    startPenalties() {
      const ms = this.matchState;
      ms.phase = 'PENALTIES';
      ms.penalties = {
        active: true,
        round: 1,
        turn: 'home',
        homeScore: 0,
        awayScore: 0,
        homeHistory: [],
        awayHistory: [],
        phase: 'AIMING',
        timer: 0,
        aimX: 0,
        power: 0.72
      };
      this._setupPenaltyKick();
      this._hideAllModals();
      document.getElementById('penalty-hud').classList.remove('hidden');
      this._updatePenaltyHUD();
    }

    _setupPenaltyKick() {
      const ms = this.matchState;
      ms.ownerPlayerId = null;
      ms.ball = { x: 0, y: 0.34, z: -41.5, vx: 0, vy: 0, vz: 0 };
      ms.penalties.phase = 'AIMING';
      ms.penalties.aimX = 0;

      // Position kicker and GK at North goal (-52.5)
      const kicker = ms.players.find((p) => p.team === ms.penalties.turn && p.role === 'FW') || ms.players[9];
      const gkTeam = ms.penalties.turn === 'home' ? 'away' : 'home';
      const gk = ms.players.find((p) => p.team === gkTeam && p.role === 'GK');

      ms.players.forEach((p) => {
        p.x = (p.id % 5 - 2) * 3;
        p.z = -10;
        p.vx = 0;
        p.vz = 0;
        p.rotY = Math.PI;
      });
      if (kicker) {
        kicker.x = 0;
        kicker.z = -38.5;
        kicker.rotY = Math.PI;
      }
      if (gk) {
        gk.x = 0;
        gk.z = -51.8;
        gk.rotY = 0;
      }
      this._setCommentary(
        ms.penalties.turn === 'home'
          ? 'PENAL PARA GIMNASIA: Elegí dirección (A / D) y pateá con ESPACIO o L.'
          : 'PENAL RIVAL: Elegí adónde se tira Milton Álvarez (A Izq / W Centro / D Der).'
      );
    }

    shootPenalty(dirChoice = null) {
      const ms = this.matchState;
      const pen = ms.penalties;
      if (ms.phase !== 'PENALTIES' || pen.phase !== 'AIMING') return;

      pen.phase = 'FLIGHT';
      pen.timer = 1.65;
      const gkTeam = pen.turn === 'home' ? 'away' : 'home';
      const gk = ms.players.find((p) => p.team === gkTeam && p.role === 'GK');

      let aimX = 0;
      let gkDiveX = 0;

      if (pen.turn === 'home') {
        aimX = dirChoice !== null ? dirChoice : pen.aimX;
        const choices = [-2.8, 0, 2.8];
        gkDiveX = choices[Math.floor(Math.random() * 3)];
      } else {
        const choices = [-2.7, 0, 2.7];
        aimX = choices[Math.floor(Math.random() * 3)];
        gkDiveX = dirChoice !== null ? dirChoice : 0;
      }

      if (gk) {
        gk.vx = gkDiveX * 2.2;
      }

      const dx = aimX - ms.ball.x;
      const dz = -52.5 - ms.ball.z;
      const d = Math.hypot(dx, dz);
      const speed = 26;
      this.physics.kickBall(ms, ms.players[0], (dx / d) * speed, 3.2, (dz / d) * speed, true);
      this.audio.playWhistle('short');
    }

    _stepPenalties(dt) {
      const ms = this.matchState;
      const pen = ms.penalties;
      const frame = this.input.sample(dt, 'pro', true);

      if (pen.phase === 'AIMING') {
        if (pen.turn === 'home') {
          pen.aimX = Math.max(-3.1, Math.min(3.1, pen.aimX + frame.moveX * 4.5 * dt));
          if (frame.passPressed || frame.shootTriggered) {
            this.shootPenalty(pen.aimX);
          }
        } else {
          // User chooses GK dive direction
          if (Math.abs(frame.moveX) > 0.35 || frame.passPressed) {
            const dive = frame.moveX < -0.3 ? -2.8 : frame.moveX > 0.3 ? 2.8 : 0;
            this.shootPenalty(dive);
          }
        }
        return;
      }

      if (pen.phase === 'FLIGHT') {
        this.physics.stepBall(ms, dt);
        const gkTeam = pen.turn === 'home' ? 'away' : 'home';
        const gk = ms.players.find((p) => p.team === gkTeam && p.role === 'GK');
        if (gk) {
          gk.x = Math.max(-3.4, Math.min(3.4, gk.x + gk.vx * dt));
          // Save check
          if (Math.hypot(gk.x - ms.ball.x, gk.z - ms.ball.z) < 1.25 && ms.ball.z < -50.5) {
            ms.ball.vx *= -0.35;
            ms.ball.vz = 4.0;
          }
        }

        pen.timer -= dt;
        if (pen.timer <= 0) {
          const scored = ms.ball.z < -52.5 && Math.abs(ms.ball.x) < 3.66;
          if (pen.turn === 'home') {
            pen.homeHistory.push(scored ? 'G' : 'M');
            if (scored) {
              pen.homeScore += 1;
              this.audio.playGoalRoar();
            }
          } else {
            pen.awayHistory.push(scored ? 'G' : 'M');
            if (scored) pen.awayScore += 1;
          }

          this._updatePenaltyHUD();

          // Check winner after 5 rounds or unbeatable lead
          const hCount = pen.homeHistory.length;
          const aCount = pen.awayHistory.length;
          const bothDoneRound = hCount === aCount;
          if (bothDoneRound && hCount >= 5 && pen.homeScore !== pen.awayScore) {
            ms.phase = 'FULLTIME';
            document.getElementById('penalty-hud').classList.add('hidden');
            this._showOverlayModal('fulltime', pen.homeScore > pen.awayScore ? '¡GANÓ GIMNASIA POR PENALES!' : `Ganó ${this.currentFixture.opponent.name} por penales`);
            return;
          }

          pen.turn = pen.turn === 'home' ? 'away' : 'home';
          if (pen.turn === 'home') pen.round += 1;
          this._setupPenaltyKick();
          this._updatePenaltyHUD();
        }
      }
    }

    _updatePenaltyHUD() {
      const pen = this.matchState.penalties;
      document.getElementById('pen-score-home').textContent = String(pen.homeScore);
      document.getElementById('pen-score-away').textContent = String(pen.awayScore);
      document.getElementById('pen-dots-home').innerHTML = pen.homeHistory
        .map((r) => `<span class="w-3 h-3 rounded-full inline-block ${r === 'G' ? 'bg-emerald-400' : 'bg-rose-500'}"></span>`)
        .join('');
      document.getElementById('pen-dots-away').innerHTML = pen.awayHistory
        .map((r) => `<span class="w-3 h-3 rounded-full inline-block ${r === 'G' ? 'bg-emerald-400' : 'bg-rose-500'}"></span>`)
        .join('');
    }

    // =========================================================================
    // RENDER & CAMERA LOOP
    // =========================================================================
    _startLoop() {
      const tick = (now) => {
        requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;
        const elapsed = now * 0.001;

        this.simAccum += dt;
        while (this.simAccum >= FIXED_DT) {
          this._stepSimulation(FIXED_DT);
          this.simAccum -= FIXED_DT;
        }

        this._syncVisuals(dt, elapsed);
        this._updateCamera(dt, elapsed);
        this._updateHUD();
        this.renderer.render(this.scene, this.camera);
      };
      requestAnimationFrame(tick);
    }

    _syncVisuals(dt, elapsed) {
      const ms = this.matchState;

      // LED board scroll
      if (this.stadiumRefs.ledBoardTexture) {
        this.stadiumRefs.ledBoardTexture.offset.x += dt * 0.08;
      }

      // Crowd jump
      const isGoal = ms.phase === 'GOAL_CELEBRATION';
      if (this.stadiumRefs.bowlCrowdMesh) {
        this.stadiumRefs.bowlCrowdMesh.position.y = Math.abs(Math.sin(elapsed * (isGoal ? 11 : 4.2))) * (isGoal ? 0.42 : 0.08);
      }
      if (this.stadiumRefs.plateaCrowdMesh) {
        this.stadiumRefs.plateaCrowdMesh.position.y = isGoal ? Math.abs(Math.sin(elapsed * 9.5)) * 0.28 : 0;
      }

      // Smoke & confetti
      if (this.stadiumRefs.smokeSystem) {
        const sAttr = this.stadiumRefs.smokeSystem.geometry.attributes.position;
        for (let i = 0; i < sAttr.count; i++) {
          let sy = sAttr.getY(i) + dt * (isGoal ? 3.5 : 1.1);
          if (sy > 22) sy = 4;
          sAttr.setY(i, sy);
        }
        sAttr.needsUpdate = true;
        this.stadiumRefs.smokeSystem.material.opacity = isGoal ? 0.38 : 0.16;
      }
      if (this.stadiumRefs.confettiSystem) {
        if (isGoal) {
          this.stadiumRefs.confettiSystem.material.opacity = 0.92;
          this.stadiumRefs.confettiSystem.rotation.y += dt * 0.45;
          const posAttr = this.stadiumRefs.confettiSystem.geometry.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            let py = posAttr.getY(i) - dt * 5.8;
            if (py < 1) py = 28;
            posAttr.setY(i, py);
          }
          posAttr.needsUpdate = true;
        } else {
          this.stadiumRefs.confettiSystem.material.opacity = 0.0;
        }
      }

      // Flags & highway cars
      const flagSpeed = isGoal ? 9.5 : 3.8;
      this.stadiumRefs.crowdFlags.forEach((f) => {
        f.pivot.rotation.z = Math.sin(elapsed * flagSpeed + f.phase) * 0.25;
      });
      this.stadiumRefs.highwayCars.forEach((c) => {
        c.mesh.position.z += c.speed * dt;
        if (c.mesh.position.z > 155) c.mesh.position.z = -155;
        if (c.mesh.position.z < -155) c.mesh.position.z = 155;
      });

      // Ball & shadow & aerial drop indicator
      this.ballMesh.position.set(ms.ball.x, ms.ball.y, ms.ball.z);
      this.ballMesh.rotation.x += ms.ball.vz * dt * 1.4;
      this.ballMesh.rotation.z -= ms.ball.vx * dt * 1.4;
      this.ballShadowMesh.position.set(ms.ball.x, 0.04, ms.ball.z);
      const shadowScale = Math.max(0.45, 1 - (ms.ball.y - 0.34) * 0.08);
      this.ballShadowMesh.scale.set(shadowScale, shadowScale, 1);

      const drop = this.physics.predictDropPoint(ms.ball);
      this.dropRingMesh.visible = drop.visible;
      if (drop.visible) {
        this.dropRingMesh.position.set(drop.x, 0.05, drop.z);
      }

      // Players & active cursor
      ms.players.forEach((p, idx) => {
        const fig = this.playerMeshes[idx];
        if (!fig) return;
        fig.group.position.set(p.x, p.tackleTimer > 0 ? -0.35 : 0, p.z);
        fig.group.rotation.y = p.rotY;
        const speed = Math.hypot(p.vx, p.vz);
        if (speed > 0.4) {
          const stride = Math.sin(elapsed * 12 + idx) * Math.min(0.65, speed * 0.07);
          fig.legL.rotation.x = stride;
          fig.legR.rotation.x = -stride;
        } else {
          fig.legL.rotation.x *= 0.8;
          fig.legR.rotation.x *= 0.8;
        }

        if (idx === ms.activeHomeIndex) {
          this.activeRingMesh.position.set(p.x, 0.05, p.z);
          this.activeRingMesh.rotation.y = p.rotY;
        }

        if (this.minimapDots[idx]) {
          // Horizontal minimap: Left = -Z (away goal), Right = +Z (home goal)
          this.minimapDots[idx].setAttribute('cx', (105 + p.z * 1.82).toFixed(1));
          this.minimapDots[idx].setAttribute('cy', (65 + p.x * 1.65).toFixed(1));
          const isAct = idx === ms.activeHomeIndex;
          this.minimapDots[idx].setAttribute('stroke', isAct ? '#ffffff' : '#0f172a');
          this.minimapDots[idx].setAttribute('stroke-width', isAct ? '1.8' : '0.8');
        }
      });

      if (this.refMesh) {
        this.refMesh.group.position.set(ms.ball.x * 0.35 + 6, 0, ms.ball.z * 0.45);
        this.refMesh.group.lookAt(ms.ball.x, 0.8, ms.ball.z);
      }

      const ballDot = document.getElementById('minimap-ball-dot');
      if (ballDot) {
        ballDot.setAttribute('cx', (105 + ms.ball.z * 1.82).toFixed(1));
        ballDot.setAttribute('cy', (65 + ms.ball.x * 1.65).toFixed(1));
      }

      this.scoreboardTimer += dt;
      if (this.scoreboardTimer >= 1.0 && ms.phase === 'PLAYING') {
        this.scoreboardTimer = 0;
        this._updateScoreboard(false);
      }
    }

    _getSectorCameraPos(sec) {
      if (!sec || !sec.rows || !sec.rows.mid) return { x: 0, y: 12, z: -60 };
      const r = sec.rows.mid;
      const x = Number.isFinite(r.x) ? r.x : 0;
      const y = Number.isFinite(r.y) ? r.y : 10;
      const z = Number.isFinite(r.z) ? r.z : 0;
      return { x, y, z };
    }

    _updateCamera(dt, elapsed) {
      const ms = this.matchState;
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3();

      if (ms.phase === 'LOBBY') {
        // Gentle scenic orbit over Estadio 23 de Agosto
        const ang = elapsed * 0.08;
        targetPos.set(Math.cos(ang) * 72, 34, Math.sin(ang) * 72);
        targetLook.set(0, 2, 0);
      } else if (ms.phase === 'PENALTIES') {
        targetPos.set(0, 5.2, -31.5);
        targetLook.set(0, 1.4, -52.5);
      } else if (ms.phase === 'GOAL_CELEBRATION') {
        // Tribuna celebration angle behind the scored goal!
        const celebSec = ms.lastGoalTeam === 'away'
          ? global.StadiumBuilder.STADIUM_SECTORS.popular_sur
          : global.StadiumBuilder.STADIUM_SECTORS.popular_norte;
        const secPos = this._getSectorCameraPos(celebSec);
        targetPos.set(secPos.x, secPos.y + 3, secPos.z);
        targetLook.set(ms.ball.x, 1.5, ms.ball.z);
      } else if (this.cameraMode === 'broadcast') {
        // TV Broadcast in front of Platea Alta roof (x=-51) with wide 58deg FOV & dynamic zoom near boxes
        const nearBox = Math.max(0, (Math.abs(ms.ball.z) - 24) / 28);
        const camX = -51 + nearBox * 8 + ms.ball.x * 0.14;
        const camY = 25.5 - nearBox * 4.5;
        const camZ = ms.ball.z * 0.64;
        targetPos.set(camX, camY, camZ);
        targetLook.set(ms.ball.x * 0.30 + 3.5, 0.8, ms.ball.z * 0.88);
      } else if (this.cameraMode === 'pro') {
        const active = ms.players[ms.activeHomeIndex] || { x: 0, z: 0 };
        targetPos.set(
          Math.max(-32, Math.min(32, active.x * 0.85)),
          7.8,
          Math.min(54, active.z + 14.5)
        );
        targetLook.set(active.x * 0.7, 1.2, Math.max(-52.5, active.z - 20));
      } else {
        // Tribuna spectator mode
        const key = this.tribunaKeys[this.tribunaSectorIndex % this.tribunaKeys.length];
        const sec = global.StadiumBuilder.STADIUM_SECTORS[key] || global.StadiumBuilder.STADIUM_SECTORS.platea_alta;
        const secPos = this._getSectorCameraPos(sec);
        targetPos.set(secPos.x, secPos.y, secPos.z);
        targetLook.set(ms.ball.x, 1.0, ms.ball.z);
      }

      if (!Number.isFinite(this.camPos.x) || !Number.isFinite(this.camPos.y) || !Number.isFinite(this.camPos.z)) {
        this.camPos.set(-51, 25.5, 0);
      }
      if (Number.isFinite(targetPos.x) && Number.isFinite(targetPos.y) && Number.isFinite(targetPos.z)) {
        this.camPos.lerp(targetPos, Math.min(1, dt * 5.2));
      }
      if (Number.isFinite(targetLook.x) && Number.isFinite(targetLook.y) && Number.isFinite(targetLook.z)) {
        this.camLook.lerp(targetLook, Math.min(1, dt * 6.0));
      }
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);
    }

    _updateHUD() {
      const ms = this.matchState;
      const clk = ms.getDisplayClock();

      const elHome = document.getElementById('hud-score-home');
      const elAway = document.getElementById('hud-score-away');
      const elClock = document.getElementById('hud-clock');
      const elHalf = document.getElementById('hud-half');
      if (elHome) elHome.textContent = String(ms.scoreHome);
      if (elAway) elAway.textContent = String(ms.scoreAway);
      if (elClock) elClock.textContent = clk.text;
      if (elHalf) elHalf.textContent = clk.halfLabel;

      const active = ms.players[ms.activeHomeIndex];
      if (active) {
        const nameEl = document.getElementById('hud-player-name');
        const numEl = document.getElementById('hud-player-num');
        const stamEl = document.getElementById('hud-stamina-fill');
        if (nameEl) nameEl.textContent = active.name;
        if (numEl) numEl.textContent = `#${active.number}`;
        if (stamEl) stamEl.style.width = `${Math.round(active.stamina * 100)}%`;
      }

      const inAttack = ms.possessionTeam === 'home';
      const modeEl = document.getElementById('hud-ctrl-mode');
      const atkEl = document.getElementById('hud-ctrl-attack');
      const defEl = document.getElementById('hud-ctrl-defense');
      const dirEl = document.getElementById('hud-attack-dir');
      if (modeEl && atkEl && defEl) {
        modeEl.textContent = inAttack ? 'EN ATAQUE • CON PELOTA' : 'EN DEFENSA • SIN PELOTA';
        modeEl.className = inAttack
          ? 'text-[10px] font-extrabold uppercase tracking-wider text-emerald-400'
          : 'text-[10px] font-extrabold uppercase tracking-wider text-amber-300';
        atkEl.classList.toggle('hidden', !inAttack);
        defEl.classList.toggle('hidden', inAttack);
      }
      const tPass = document.getElementById('touch-btn-pass');
      const tShoot = document.getElementById('touch-btn-shoot');
      if (tPass) tPass.textContent = inAttack ? 'PASE' : 'QUITAR';
      if (tShoot) tShoot.textContent = inAttack ? 'REMATE' : 'BARRIDA';
      if (dirEl) {
        dirEl.textContent = this.cameraMode === 'pro' ? 'Arco ↑ Adelante' : 'Arco ← Izq';
      }
    }

    _updateScoreboard(isGoalBanner) {
      const ms = this.matchState;
      const clk = ms.getDisplayClock();
      const opp = this.currentFixture ? this.currentFixture.opponent : { shortName: 'MAD', name: 'Deportivo Madryn' };
      global.StadiumBuilder.updateScoreboardCanvas(isGoalBanner, {
        scoreHome: ms.scoreHome,
        scoreAway: ms.scoreAway,
        matchSeconds: clk.mins * 60 + clk.secs,
        awayShort: opp.shortName,
        awayName: opp.name.toUpperCase(),
        awayHex: this.kitInfo ? this.kitInfo.hex : '#facc15',
        halfLabel: clk.halfLabel,
        goalTeam: ms.lastGoalTeam
      });
    }

    _setCommentary(text) {
      const el = document.getElementById('hud-commentary');
      if (el) el.textContent = text;
    }

    _showHudForMatch() {
      document.getElementById('lobby-overlay').classList.add('hidden');
      document.getElementById('match-hud').classList.remove('hidden');
      document.getElementById('penalty-hud').classList.add('hidden');
      this._hideAllModals();

      const opp = this.currentFixture.opponent;
      document.getElementById('hud-away-short').textContent = opp.shortName;
      const awayBadge = document.getElementById('hud-away-badge');
      if (awayBadge) awayBadge.style.backgroundColor = this.kitInfo.hex;
    }

    _hideAllModals() {
      document.getElementById('modal-pause').classList.add('hidden');
      document.getElementById('modal-stats').classList.add('hidden');
    }

    _showOverlayModal(type, customHeadline = null) {
      const modal = document.getElementById('modal-stats');
      modal.classList.remove('hidden');

      const ms = this.matchState;
      const poss = ms.getPossessionPercent();
      const homeAcc = ms.stats.homePasses > 0 ? Math.round((ms.stats.homePassesCompleted / ms.stats.homePasses) * 100) : 100;
      const awayAcc = ms.stats.awayPasses > 0 ? Math.round((ms.stats.awayPassesCompleted / ms.stats.awayPasses) * 100) : 100;

      document.getElementById('stats-title').textContent =
        customHeadline || (type === 'halftime' ? 'ENTRETIEMPO' : 'FINAL DEL PARTIDO');
      document.getElementById('stats-score-line').textContent =
        `GYE ${ms.scoreHome} - ${ms.scoreAway} ${this.currentFixture.opponent.shortName}`;

      document.getElementById('stat-poss-home').textContent = `${poss.home}%`;
      document.getElementById('stat-poss-away').textContent = `${poss.away}%`;
      document.getElementById('stat-shots-home').textContent = `${ms.stats.homeShots} (${ms.stats.homeShotsOnTarget})`;
      document.getElementById('stat-shots-away').textContent = `${ms.stats.awayShots} (${ms.stats.awayShotsOnTarget})`;
      document.getElementById('stat-pass-home').textContent = `${homeAcc}%`;
      document.getElementById('stat-pass-away').textContent = `${awayAcc}%`;

      const btnResume2nd = document.getElementById('btn-start-second-half');
      const btnPenalties = document.getElementById('btn-start-penalties');
      const btnRematch = document.getElementById('btn-rematch');

      if (type === 'halftime') {
        btnResume2nd.classList.remove('hidden');
        btnPenalties.classList.add('hidden');
        btnRematch.classList.add('hidden');
      } else {
        btnResume2nd.classList.add('hidden');
        btnRematch.classList.remove('hidden');
        if (ms.scoreHome === ms.scoreAway && !customHeadline) {
          btnPenalties.classList.remove('hidden');
        } else {
          btnPenalties.classList.add('hidden');
        }
      }
    }

    startSecondHalf() {
      const ms = this.matchState;
      ms.half = 2;
      ms.elapsedRealSec = 0;
      this._hideAllModals();
      this._setupKickoff('away');
      this.audio.playWhistle('double');
      this._setCommentary('¡Comienza el segundo tiempo en el Estadio 23 de Agosto!');
    }

    togglePause() {
      const ms = this.matchState;
      const pauseModal = document.getElementById('modal-pause');
      if (ms.phase === 'PAUSED') {
        ms.phase = this._phaseBeforePause || 'PLAYING';
        pauseModal.classList.add('hidden');
      } else if (ms.phase === 'PLAYING' || ms.phase === 'KICKOFF' || ms.phase === 'SET_PIECE') {
        this._phaseBeforePause = ms.phase;
        ms.phase = 'PAUSED';
        pauseModal.classList.remove('hidden');
      }
    }

    returnToLobby() {
      this.matchState.phase = 'LOBBY';
      this._hideAllModals();
      document.getElementById('match-hud').classList.add('hidden');
      document.getElementById('penalty-hud').classList.add('hidden');
      document.getElementById('lobby-overlay').classList.remove('hidden');
    }

    cycleCameraMode() {
      const order = ['broadcast', 'pro', 'tribuna'];
      if (this.cameraMode === 'tribuna') {
        this.tribunaSectorIndex += 1;
        if (this.tribunaSectorIndex < this.tribunaKeys.length) {
          this._updateCameraLabel();
          return;
        }
        this.tribunaSectorIndex = 0;
      }
      const nextIdx = (order.indexOf(this.cameraMode) + 1) % order.length;
      this.cameraMode = order[nextIdx];
      this._updateCameraLabel();
    }

    _updateCameraLabel() {
      const el = document.getElementById('hud-cam-label');
      if (!el) return;
      if (this.cameraMode === 'broadcast') el.textContent = 'TV Broadcast';
      else if (this.cameraMode === 'pro') el.textContent = '3ra Persona';
      else {
        const key = this.tribunaKeys[this.tribunaSectorIndex % this.tribunaKeys.length];
        const sec = global.StadiumBuilder.STADIUM_SECTORS[key];
        el.textContent = `Tribuna: ${sec ? sec.shortName : 'Estadio'}`;
      }
    }

    toggleAudio() {
      this.audio.toggle();
      this._syncAudioIcon();
    }

    _syncAudioIcon() {
      const on = this.audio.enabled;
      const svgOn = document.getElementById('hud-audio-on');
      const svgOff = document.getElementById('hud-audio-off');
      if (svgOn && svgOff) {
        svgOn.classList.toggle('hidden', !on);
        svgOff.classList.toggle('hidden', on);
      }
    }
  }

  global.GameEngine = GameEngine;
})(window);
