/**
 * InputController — Decoupled Keyboard + Gamepad + Touch Input Frame Producer
 */
(function (global) {
  'use strict';

  class InputController {
    constructor() {
      this.keys = new Set();
      this.justPressed = new Set();
      this.justReleased = new Set();

      this.shootCharge = 0;
      this.isChargingShoot = false;
      this.shootTriggered = false;

      // Touch virtual joystick & buttons state
      this.touchMoveX = 0;
      this.touchMoveZ = 0;
      this.touchSprint = false;
      this.touchButtons = {
        pass: false,
        lob: false,
        shoot: false,
        switchPlayer: false,
        dribble: false
      };
      this.prevTouchButtons = { ...this.touchButtons };

      // Free camera manual orbit state
      this.freeYaw = 0;
      this.freePitch = 0.42;
      this.freeDistance = 30;
      this._freeDragging = false;
      this._freeLastX = 0;
      this._freeLastY = 0;
      this.freeUserControlled = false;

      // Gamepad previous button states for edge detection
      this.prevPadButtons = {};

      this.onPauseCallback = null;
      this.onCameraCycleCallback = null;

      let savedScheme = 'pes';
      try {
        const stored = global.localStorage && global.localStorage.getItem('pasion_control_scheme');
        if (stored === 'wasd' || stored === 'pes') savedScheme = stored;
      } catch (_) {}
      this.controlScheme = savedScheme;

      this._bindKeyboard();
    }

    setControlScheme(scheme) {
      this.controlScheme = scheme === 'wasd' ? 'wasd' : 'pes';
      this.isChargingShoot = false;
      this.shootCharge = 0;
      try {
        if (global.localStorage) {
          global.localStorage.setItem('pasion_control_scheme', this.controlScheme);
        }
      } catch (_) {}
    }

    _bindKeyboard() {
      global.addEventListener('keydown', (e) => {
        const code = e.code;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
          // Only prevent default when not typing in an input
          const tag = (e.target && e.target.tagName) || '';
          if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') {
            e.preventDefault();
          }
        }
        if (!this.keys.has(code)) {
          this.justPressed.add(code);
        }
        this.keys.add(code);

        if (code === 'Escape' && this.onPauseCallback) {
          this.onPauseCallback();
        }
        if (code === 'KeyC' && this.onCameraCycleCallback) {
          this.onCameraCycleCallback();
        }
      });

      global.addEventListener('keyup', (e) => {
        const code = e.code;
        this.keys.delete(code);
        this.justReleased.add(code);
      });

      global.addEventListener('blur', () => {
        this.keys.clear();
        this.isChargingShoot = false;
        this.shootCharge = 0;
        this._freeDragging = false;
      });

      // Mouse drag & wheel for interactive Free 360 camera
      global.addEventListener('pointerdown', (e) => {
        if (e.target && e.target.tagName === 'CANVAS') {
          this._freeDragging = true;
          this._freeLastX = e.clientX;
          this._freeLastY = e.clientY;
        }
      });
      global.addEventListener('pointermove', (e) => {
        if (!this._freeDragging) return;
        const dx = e.clientX - this._freeLastX;
        const dy = e.clientY - this._freeLastY;
        this._freeLastX = e.clientX;
        this._freeLastY = e.clientY;
        this.freeYaw -= dx * 0.008;
        this.freePitch = Math.max(0.18, Math.min(1.15, this.freePitch + dy * 0.006));
        this.freeUserControlled = true;
      });
      global.addEventListener('pointerup', () => {
        this._freeDragging = false;
      });
      global.addEventListener('wheel', (e) => {
        if (e.target && e.target.tagName === 'CANVAS') {
          this.freeDistance = Math.max(12, Math.min(62, this.freeDistance + Math.sign(e.deltaY) * 2.5));
          this.freeUserControlled = true;
        }
      }, { passive: true });
    }

    setTouchStick(nx, nz) {
      this.touchMoveX = Math.max(-1, Math.min(1, nx));
      this.touchMoveZ = Math.max(-1, Math.min(1, nz));
    }

    setTouchButton(name, pressed) {
      if (name in this.touchButtons) {
        this.touchButtons[name] = !!pressed;
      }
    }

    _pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads && pads[0];
      if (!pad) return null;

      const deadzone = 0.18;
      let gx = Math.abs(pad.axes[0] || 0) > deadzone ? pad.axes[0] : 0;
      let gz = Math.abs(pad.axes[1] || 0) > deadzone ? pad.axes[1] : 0;

      const btn = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
      const edge = (i) => {
        const cur = btn(i);
        const prev = !!this.prevPadButtons[i];
        this.prevPadButtons[i] = cur;
        return cur && !prev;
      };
      const releaseEdge = (i) => {
        const cur = btn(i);
        const prev = !!this.prevPadButtons['rel_' + i];
        this.prevPadButtons['rel_' + i] = cur;
        return !cur && prev;
      };

      return {
        gx,
        gz,
        sprint: btn(7) || btn(5), // RT or RB
        passPressed: edge(0), // A / Cross
        lobPressed: edge(2), // X / Square
        shootHeld: btn(1), // B / Circle
        shootReleased: releaseEdge(1),
        switchPressed: edge(4) // LB / L1
      };
    }

    /**
     * Samples current inputs and returns a normalized PlayerInputFrame.
     * @param {number} dt
     * @param {string} cameraMode - 'broadcast' | 'pro' | 'tribuna'
     * @param {boolean} hasBall - whether active team has possession
     */
    sample(dt, cameraMode = 'broadcast', hasBall = true) {
      const pad = this._pollGamepad();

      const isPes = this.controlScheme === 'pes';

      // Raw screen-space movement
      let rawX = 0;
      let rawZ = 0;
      if (this.keys.has('ArrowLeft') || (!isPes && this.keys.has('KeyA'))) rawX -= 1;
      if (this.keys.has('ArrowRight') || (!isPes && this.keys.has('KeyD'))) rawX += 1;
      if (this.keys.has('ArrowUp') || (!isPes && this.keys.has('KeyW'))) rawZ -= 1;
      if (this.keys.has('ArrowDown') || (!isPes && this.keys.has('KeyS'))) rawZ += 1;

      rawX += this.touchMoveX;
      rawZ += this.touchMoveZ;
      if (pad) {
        rawX += pad.gx;
        rawZ += pad.gz;
      }

      const mag = Math.hypot(rawX, rawZ);
      if (mag > 1) {
        rawX /= mag;
        rawZ /= mag;
      }

      // Map screen-space input to world coordinates depending on camera orientation!
      // Broadcast camera sits on West (-X) looking East (+X):
      //   Screen UP (rawZ < 0) -> East (+X)
      //   Screen RIGHT (rawX > 0) -> South (+Z)
      //   Screen LEFT (rawX < 0) -> North (-Z, Gimnasia attacks -Z!)
      // Pro camera sits behind player looking North (-Z):
      //   Screen UP (rawZ < 0) -> North (-Z)
      //   Screen RIGHT (rawX > 0) -> East (+X)
      let moveX = rawX;
      let moveZ = rawZ;
      if (cameraMode === 'broadcast' || cameraMode === 'tactical') {
        moveX = -rawZ;
        moveZ = rawX;
      }

      const sprint =
        this.keys.has('ShiftLeft') ||
        this.keys.has('ShiftRight') ||
        (isPes && this.keys.has('KeyE')) ||
        this.touchSprint ||
        (pad ? pad.sprint : false);

      // Action edges
      const touchPassEdge = this.touchButtons.pass && !this.prevTouchButtons.pass;
      const touchLobEdge = this.touchButtons.lob && !this.prevTouchButtons.lob;
      const touchSwitchEdge = this.touchButtons.switchPlayer && !this.prevTouchButtons.switchPlayer;
      const touchDribbleEdge = this.touchButtons.dribble && !this.prevTouchButtons.dribble;
      const touchShootRelease = !this.touchButtons.shoot && this.prevTouchButtons.shoot;

      const passPressed =
        (isPes
          ? (this.justPressed.has('KeyS') || this.justPressed.has('Space'))
          : (this.justPressed.has('Space') || this.justPressed.has('KeyJ'))) ||
        touchPassEdge ||
        (pad ? pad.passPressed : false);

      const throughPassPressed =
        hasBall &&
        ((isPes && this.justPressed.has('KeyW')) || (passPressed && sprint));

      const lobPressed =
        (isPes
          ? this.justPressed.has('KeyA')
          : (this.justPressed.has('KeyK') || this.justPressed.has('KeyX'))) ||
        touchLobEdge ||
        (pad ? pad.lobPressed : false);

      const switchPressed =
        !hasBall &&
        ((isPes
          ? (this.justPressed.has('KeyQ') || this.justPressed.has('KeyW'))
          : (this.justPressed.has('KeyQ') || this.justPressed.has('KeyE'))) ||
        touchSwitchEdge ||
        (pad ? pad.switchPressed : false));

      const dribblePressed =
        hasBall &&
        ((isPes ? this.justPressed.has('KeyQ') : this.justPressed.has('KeyE')) || touchDribbleEdge);

      // Shoot / Tackle (PES: D; WASD: L or F)
      const shootKeyHeld =
        (isPes
          ? this.keys.has('KeyD')
          : (this.keys.has('KeyL') || this.keys.has('KeyF'))) ||
        this.touchButtons.shoot ||
        (pad ? pad.shootHeld : false);
      const shootKeyJustPressed = isPes
        ? this.justPressed.has('KeyD')
        : (this.justPressed.has('KeyL') || this.justPressed.has('KeyF'));
      const shootKeyReleased =
        (isPes
          ? this.justReleased.has('KeyD')
          : (this.justReleased.has('KeyL') || this.justReleased.has('KeyF'))) ||
        touchShootRelease ||
        (pad ? pad.shootReleased : false);

      let shootTriggered = false;
      let shootPower = 0;
      let tacklePressed = false;

      if (hasBall) {
        if (shootKeyHeld) {
          this.isChargingShoot = true;
          this.shootCharge = Math.min(1.0, this.shootCharge + dt * 1.45);
        }
        if (shootKeyReleased && this.isChargingShoot) {
          shootTriggered = true;
          shootPower = Math.max(0.58, this.shootCharge);
          this.isChargingShoot = false;
          this.shootCharge = 0;
        }
      } else {
        this.isChargingShoot = false;
        this.shootCharge = 0;
        if (shootKeyJustPressed || touchShootRelease) {
          tacklePressed = true;
        }
      }

      // Clear per-frame edges
      this.justPressed.clear();
      this.justReleased.clear();
      this.prevTouchButtons = { ...this.touchButtons };

      return {
        moveX,
        moveZ,
        sprint,
        passPressed,
        throughPassPressed,
        lobPressed,
        switchPressed,
        dribblePressed,
        tacklePressed,
        shootTriggered,
        shootPower,
        shootCharge: this.shootCharge,
        isChargingShoot: this.isChargingShoot
      };
    }
  }

  global.InputController = InputController;
})(window);
