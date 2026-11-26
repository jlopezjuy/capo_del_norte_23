/**
 * PlayerRenderer — Futbolistas 3D Estilizados con Texturas de Camiseta, Dorsales y Animación con Blending
 */
(function (global) {
  'use strict';

  const SKIN_TONES = [0xf1c27d, 0xe0ac69, 0xc68642, 0xfad3a5, 0x8d5524];
  const HAIR_COLORS = [0x1e293b, 0x451a03, 0x78350f, 0x0f172a, 0xd97706];
  const BOOT_COLOR = 0x0f172a;

  // Geometrías compartidas para mantener 60 FPS
  let sharedGeos = null;
  function getSharedGeos() {
    if (sharedGeos) return sharedGeos;
    sharedGeos = {
      torso: new THREE.BoxGeometry(0.58, 0.72, 0.34),
      shorts: new THREE.BoxGeometry(0.54, 0.32, 0.32),
      head: new THREE.SphereGeometry(0.22, 12, 10),
      hair: new THREE.BoxGeometry(0.42, 0.14, 0.42),
      arm: new THREE.BoxGeometry(0.14, 0.54, 0.15),
      thigh: new THREE.BoxGeometry(0.18, 0.32, 0.18),
      sock: new THREE.BoxGeometry(0.16, 0.28, 0.16),
      boot: new THREE.BoxGeometry(0.18, 0.10, 0.28),
      shadow: new THREE.CircleGeometry(0.54, 14)
    };
    sharedGeos.shadow.rotateX(-Math.PI / 2);
    return sharedGeos;
  }

  const jerseyTexCache = new Map();

  function toHexCss(num) {
    return '#' + (num >>> 0).toString(16).padStart(6, '0');
  }

  /**
   * Genera textura de camiseta con bastones/franjas y dorsal en la espalda.
   */
  function getJerseyTexture(primaryHex, secondaryHex, number, striped = true) {
    const key = `${primaryHex}-${secondaryHex}-${number}-${striped ? 1 : 0}`;
    if (jerseyTexCache.has(key)) return jerseyTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const c1 = toHexCss(primaryHex);
    const c2 = toHexCss(secondaryHex);

    if (striped) {
      const stripes = 6;
      const w = 128 / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? c1 : c2;
        ctx.fillRect(i * w, 0, w + 1, 128);
      }
    } else {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = c2;
      ctx.fillRect(0, 0, 128, 18);
    }

    // Cuello
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(42, 0, 44, 12);

    // Dorsal en la espalda
    ctx.fillStyle = 'rgba(6, 16, 31, 0.85)';
    ctx.fillRect(36, 32, 56, 62);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Barlow Condensed", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 64, 65);

    const tex = new THREE.CanvasTexture(canvas);
    jerseyTexCache.set(key, tex);
    return tex;
  }

  function createPlayerFigure(opts) {
    const {
      primaryColor,
      secondaryColor,
      shortsColor,
      sockColor,
      number = 9,
      role = 'MF',
      striped = true
    } = opts;

    const geos = getSharedGeos();
    const group = new THREE.Group();
    const bodyPivot = new THREE.Group();
    group.add(bodyPivot);

    const skinMat = new THREE.MeshLambertMaterial({ color: SKIN_TONES[number % SKIN_TONES.length] });
    const hairMat = new THREE.MeshLambertMaterial({ color: HAIR_COLORS[(number * 3) % HAIR_COLORS.length] });
    const shortsMat = new THREE.MeshLambertMaterial({ color: shortsColor });
    const sockMat = new THREE.MeshLambertMaterial({ color: sockColor || primaryColor });
    const bootMat = new THREE.MeshLambertMaterial({ color: BOOT_COLOR });
    const sleeveMat = new THREE.MeshLambertMaterial({ color: primaryColor });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.36, depthWrite: false });

    const jerseyTex = getJerseyTexture(primaryColor, secondaryColor, number, striped);
    const torsoMat = new THREE.MeshLambertMaterial({ map: jerseyTex });

    const shadow = new THREE.Mesh(geos.shadow, shadowMat);
    shadow.position.y = 0.025;
    group.add(shadow);

    // Torso
    const torso = new THREE.Mesh(geos.torso, torsoMat);
    torso.position.y = 1.24;
    bodyPivot.add(torso);

    // Shorts
    const shorts = new THREE.Mesh(geos.shorts, shortsMat);
    shorts.position.y = 0.74;
    bodyPivot.add(shorts);

    // Head + Hair
    const head = new THREE.Mesh(geos.head, skinMat);
    head.position.y = 1.84;
    const hair = new THREE.Mesh(geos.hair, hairMat);
    hair.position.set(0, 2.00, -0.02);
    bodyPivot.add(head, hair);

    // Arms with shoulder pivots
    const armLPivot = new THREE.Group();
    armLPivot.position.set(-0.37, 1.52, 0);
    const armLMesh = new THREE.Mesh(geos.arm, sleeveMat);
    armLMesh.position.y = -0.24;
    armLPivot.add(armLMesh);

    const armRPivot = new THREE.Group();
    armRPivot.position.set(0.37, 1.52, 0);
    const armRMesh = new THREE.Mesh(geos.arm, sleeveMat);
    armRMesh.position.y = -0.24;
    armRPivot.add(armRMesh);

    bodyPivot.add(armLPivot, armRPivot);

    // Legs with hip pivots (thigh + sock + boot)
    const makeLeg = (xOffset) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(xOffset, 0.62, 0);
      const thigh = new THREE.Mesh(geos.thigh, skinMat);
      thigh.position.y = -0.15;
      const sock = new THREE.Mesh(geos.sock, sockMat);
      sock.position.y = -0.42;
      const boot = new THREE.Mesh(geos.boot, bootMat);
      boot.position.set(0, -0.57, 0.05);
      legPivot.add(thigh, sock, boot);
      return legPivot;
    };

    const legL = makeLeg(-0.15);
    const legR = makeLeg(0.15);
    bodyPivot.add(legL, legR);

    // Variaciones sutiles de altura/complexión
    const scaleY = role === 'GK' || role === 'DF' ? 1.20 : 1.14 + (number % 3) * 0.02;
    const scaleXZ = role === 'DF' ? 1.20 : 1.15;
    group.scale.set(scaleXZ, scaleY, scaleXZ);

    return {
      group,
      bodyPivot,
      legL,
      legR,
      armL: armLPivot,
      armR: armRPivot,
      kickTimer: 0,
      frustratedTimer: 0
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Anima el personaje con blending suave según estado (run, kick, tackle, gk_dive, celebrate, frustrated, idle).
   */
  function updatePose(fig, p, dt, elapsed, phaseMode, goalStyle = 'dance') {
    const blend = Math.min(1, dt * 14);
    const speed = Math.hypot(p.vx || 0, p.vz || 0);

    let targetBodyY = 0;
    let targetBodyRotX = 0;
    let targetBodyRotZ = 0;
    let targetLegLX = 0;
    let targetLegRX = 0;
    let targetArmLX = 0;
    let targetArmRX = 0;
    let targetArmLZ = 0.08;
    let targetArmRZ = -0.08;

    if (fig.kickTimer > 0) {
      fig.kickTimer -= dt;
      targetBodyRotX = 0.18;
      targetLegRX = -1.05;
      targetLegLX = 0.35;
      targetArmLX = 0.7;
      targetArmRX = -0.6;
    } else if (p.tackleTimer > 0) {
      targetBodyY = -0.45;
      targetBodyRotX = -0.95;
      targetLegRX = 0.9;
      targetLegLX = -0.4;
      targetArmLZ = 0.7;
      targetArmRZ = -0.7;
    } else if (p.aiState === 'GOALKEEPER_DIVE') {
      const side = Math.sign(p.vx || 1);
      targetBodyY = -0.25;
      targetBodyRotZ = side * 1.15;
      targetArmLX = -2.4;
      targetArmRX = -2.4;
    } else if (phaseMode === 'GOAL_CELEBRATION') {
      if (p.team === p.celebratingTeam) {
        const hop = Math.abs(Math.sin(elapsed * 8.5 + p.id));
        targetBodyY = hop * 0.42;
        if (goalStyle === 'orchestra') {
          targetArmLX = -2.2 + Math.sin(elapsed * 10) * 0.5;
          targetArmRX = -2.2 - Math.sin(elapsed * 10) * 0.5;
        } else {
          targetArmLX = -2.7;
          targetArmRX = -2.7;
          targetArmLZ = 0.45;
          targetArmRZ = -0.45;
        }
        targetLegLX = Math.sin(elapsed * 12 + p.id) * 0.35;
        targetLegRX = -targetLegLX;
      } else {
        // Rival frustrado: manos en la cabeza
        targetBodyRotX = 0.16;
        targetArmLX = -2.5;
        targetArmRX = -2.5;
        targetArmLZ = -0.35;
        targetArmRZ = 0.35;
      }
    } else if (fig.frustratedTimer > 0) {
      fig.frustratedTimer -= dt;
      targetArmLX = -2.6;
      targetArmRX = -2.6;
      targetArmLZ = -0.3;
      targetArmRZ = 0.3;
    } else if (speed > 0.45) {
      const freq = speed > 8.5 ? 14 : 10.5;
      const amp = Math.min(0.78, speed * 0.075);
      const s = Math.sin(elapsed * freq + p.id * 0.7);
      targetBodyY = Math.abs(Math.cos(elapsed * freq + p.id * 0.7)) * 0.08;
      targetBodyRotX = Math.min(0.22, speed * 0.018);
      targetLegLX = s * amp;
      targetLegRX = -s * amp;
      targetArmLX = -s * amp * 0.85;
      targetArmRX = s * amp * 0.85;
    } else {
      // Respiración en reposo
      const breath = Math.sin(elapsed * 2.6 + p.id);
      targetBodyY = breath * 0.02;
      targetArmLZ = 0.10 + breath * 0.03;
      targetArmRZ = -0.10 - breath * 0.03;
    }

    fig.bodyPivot.position.y = lerp(fig.bodyPivot.position.y, targetBodyY, blend);
    fig.bodyPivot.rotation.x = lerp(fig.bodyPivot.rotation.x, targetBodyRotX, blend);
    fig.bodyPivot.rotation.z = lerp(fig.bodyPivot.rotation.z, targetBodyRotZ, blend);
    fig.legL.rotation.x = lerp(fig.legL.rotation.x, targetLegLX, blend);
    fig.legR.rotation.x = lerp(fig.legR.rotation.x, targetLegRX, blend);
    fig.armL.rotation.x = lerp(fig.armL.rotation.x, targetArmLX, blend);
    fig.armR.rotation.x = lerp(fig.armR.rotation.x, targetArmRX, blend);
    fig.armL.rotation.z = lerp(fig.armL.rotation.z, targetArmLZ, blend);
    fig.armR.rotation.z = lerp(fig.armR.rotation.z, targetArmRZ, blend);
  }

  global.PlayerRenderer = {
    createPlayerFigure,
    updatePose
  };
})(window);
