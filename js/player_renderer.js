/**
 * PlayerRenderer — Futbolistas 3D estilizados con rostro expresivo, cabello variado,
 * dorsal solo en espalda, articulaciones de codo/rodilla y blending de poses.
 */
(function (global) {
  'use strict';

  const SKIN_TONES = [0xf2c9a0, 0xdca577, 0xb87b50, 0x8d5836, 0xe8ba90];
  const HAIR_COLORS = [0x1c1917, 0x3b2314, 0x714722, 0x0f172a, 0xa16207];

  const _kitTexCache = new Map();
  const _faceTexCache = new Map();

  let _sharedGeo = null;
  function getGeo() {
    if (_sharedGeo) return _sharedGeo;
    _sharedGeo = {
      head: new THREE.SphereGeometry(0.21, 14, 12),
      neck: new THREE.CylinderGeometry(0.08, 0.095, 0.12, 8),
      hairCap: new THREE.SphereGeometry(0.222, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairCrest: new THREE.BoxGeometry(0.18, 0.11, 0.28),
      torso: new THREE.BoxGeometry(0.48, 0.56, 0.25),
      shorts: new THREE.BoxGeometry(0.45, 0.22, 0.25),
      upperArm: new THREE.BoxGeometry(0.125, 0.25, 0.125),
      forearm: new THREE.BoxGeometry(0.105, 0.23, 0.105),
      thigh: new THREE.BoxGeometry(0.16, 0.28, 0.16),
      shin: new THREE.BoxGeometry(0.13, 0.27, 0.13),
      boot: new THREE.BoxGeometry(0.145, 0.1, 0.24),
      shadow: new THREE.CircleGeometry(0.36, 16)
    };
    return _sharedGeo;
  }

  function makeFaceTexture(skinHex, hairHex) {
    const key = `${skinHex}|${hairHex}`;
    if (_faceTexCache.has(key)) return _faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const c = new THREE.Color(skinHex);
    ctx.fillStyle = `#${c.getHexString()}`;
    ctx.fillRect(0, 0, 128, 128);

    // Subtle cheek & brow shading
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, 128, 30);

    // Eyes (facing +Z UV center around x=64)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(50, 62, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(78, 62, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(50, 62, 3.2, 0, Math.PI * 2);
    ctx.arc(78, 62, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    const hc = new THREE.Color(hairHex);
    ctx.strokeStyle = `#${hc.getHexString()}`;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(43, 53);
    ctx.lineTo(56, 54);
    ctx.moveTo(72, 54);
    ctx.lineTo(85, 53);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = '#7c3f34';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(64, 80, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    _faceTexCache.set(key, tex);
    return tex;
  }

  function makeJerseyTexture(primaryHex, secondaryHex, number, striped, withNumber) {
    const key = `${primaryHex}|${secondaryHex}|${withNumber ? number : 'front'}|${striped ? 1 : 0}`;
    if (_kitTexCache.has(key)) return _kitTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const c1 = new THREE.Color(primaryHex).getStyle();
    const c2 = new THREE.Color(secondaryHex).getStyle();

    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 128, 128);

    if (striped) {
      ctx.fillStyle = c2;
      const stripeW = 21.3;
      for (let i = 0; i < 6; i += 2) {
        ctx.fillRect(i * stripeW, 0, stripeW, 128);
      }
    } else {
      ctx.fillStyle = c2;
      ctx.fillRect(0, 44, 128, 20);
    }

    // Collar V-neck
    ctx.fillStyle = '#0b1320';
    ctx.fillRect(42, 0, 44, 11);

    if (withNumber) {
      ctx.fillStyle = 'rgba(11, 19, 32, 0.72)';
      ctx.fillRect(34, 30, 60, 62);
      ctx.font = '900 50px "Barlow Condensed", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0b1320';
      ctx.strokeText(String(number), 64, 63);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(String(number), 64, 63);
    } else {
      // Subtle chest crest emblem on front
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(86, 28);
      ctx.lineTo(100, 28);
      ctx.lineTo(100, 40);
      ctx.lineTo(93, 47);
      ctx.lineTo(86, 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0b1320';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    _kitTexCache.set(key, tex);
    return tex;
  }

  function createPlayerFigure(opts) {
    const {
      primaryColor,
      secondaryColor = 0xffffff,
      striped = false,
      isGK = false,
      number = 10,
      role = 'MF'
    } = opts;

    const g = getGeo();
    const root = new THREE.Group();
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    const skinHex = SKIN_TONES[number % SKIN_TONES.length];
    const hairHex = HAIR_COLORS[(number * 3) % HAIR_COLORS.length];

    const skinMat = new THREE.MeshLambertMaterial({ color: skinHex });
    const faceMat = new THREE.MeshLambertMaterial({ map: makeFaceTexture(skinHex, hairHex) });
    const hairMat = new THREE.MeshLambertMaterial({ color: hairHex });
    const shirtBaseMat = new THREE.MeshLambertMaterial({ color: primaryColor });
    const shirtFrontMat = new THREE.MeshLambertMaterial({ map: makeJerseyTexture(primaryColor, secondaryColor, number, striped && !isGK, false) });
    const shirtBackMat = new THREE.MeshLambertMaterial({ map: makeJerseyTexture(primaryColor, secondaryColor, number, striped && !isGK, true) });
    const shortsMat = new THREE.MeshLambertMaterial({ color: isGK ? 0x0f172a : (striped ? 0xf8fafc : 0x0f172a) });
    const sockMat = new THREE.MeshLambertMaterial({ color: isGK ? 0x10b981 : primaryColor });
    const bootMat = new THREE.MeshLambertMaterial({ color: (number % 3 === 0) ? 0x0ea5e9 : (number % 3 === 1 ? 0xf8fafc : 0x111827) });

    // Torso (box with front/back distinct materials: +x, -x, +y, -y, +z front, -z back)
    const torso = new THREE.Mesh(g.torso, [
      shirtBaseMat, shirtBaseMat, shirtBaseMat, shirtBaseMat, shirtFrontMat, shirtBackMat
    ]);
    torso.position.y = 1.02;
    bodyPivot.add(torso);

    // Shorts
    const shorts = new THREE.Mesh(g.shorts, shortsMat);
    shorts.position.y = 0.68;
    bodyPivot.add(shorts);

    // Neck + Head
    const neck = new THREE.Mesh(g.neck, skinMat);
    neck.position.y = 1.33;
    bodyPivot.add(neck);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.52, 0);
    bodyPivot.add(headPivot);

    const head = new THREE.Mesh(g.head, faceMat);
    head.rotation.y = -Math.PI * 0.5;
    headPivot.add(head);

    // Hair style variation
    const hairStyle = number % 4;
    const hairCap = new THREE.Mesh(g.hairCap, hairMat);
    hairCap.position.y = 0.03;
    headPivot.add(hairCap);
    if (hairStyle === 1) {
      const crest = new THREE.Mesh(g.hairCrest, hairMat);
      crest.position.set(0, 0.17, 0.02);
      headPivot.add(crest);
    } else if (hairStyle === 2) {
      // Headband
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.05, 12), new THREE.MeshLambertMaterial({ color: primaryColor }));
      band.position.y = 0.08;
      headPivot.add(band);
    }

    // Articulated Arms (Shoulder -> Upper Arm -> Elbow -> Forearm)
    function buildArm(sideSign) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sideSign * 0.31, 1.24, 0);
      const sleeve = new THREE.Mesh(g.upperArm, shirtBaseMat);
      sleeve.position.y = -0.11;
      shoulder.add(sleeve);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.23, 0);
      const forearm = new THREE.Mesh(g.forearm, skinMat);
      forearm.position.y = -0.10;
      elbow.add(forearm);
      shoulder.add(elbow);
      bodyPivot.add(shoulder);
      return { shoulder, elbow };
    }
    const armL = buildArm(-1);
    const armR = buildArm(1);

    // Articulated Legs (Hip -> Thigh -> Knee -> Shin/Sock + Boot)
    function buildLeg(sideSign) {
      const hip = new THREE.Group();
      hip.position.set(sideSign * 0.13, 0.59, 0);
      const thigh = new THREE.Mesh(g.thigh, skinMat);
      thigh.position.y = -0.14;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.27, 0);
      const shin = new THREE.Mesh(g.shin, sockMat);
      shin.position.y = -0.13;
      const boot = new THREE.Mesh(g.boot, bootMat);
      boot.position.set(0, -0.28, 0.045);
      knee.add(shin);
      knee.add(boot);
      hip.add(knee);
      bodyPivot.add(hip);
      return { hip, knee };
    }
    const legL = buildLeg(-1);
    const legR = buildLeg(1);

    // Physical height & build variation
    const scaleY = isGK ? 1.21 : (role === 'DF' ? 1.18 : 1.12 + (number % 3) * 0.025);
    const scaleXZ = role === 'DF' ? 1.18 : (role === 'FW' ? 1.12 : 1.14);
    bodyPivot.scale.set(scaleXZ, scaleY, scaleXZ);

    // Ground contact shadow
    const shadow = new THREE.Mesh(
      g.shadow,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.30, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    root.userData.animParts = {
      bodyPivot,
      headPivot,
      armLPivot: armL.shoulder,
      armRPivot: armR.shoulder,
      elbowLPivot: armL.elbow,
      elbowRPivot: armR.elbow,
      legL: legL.hip,
      legR: legR.hip,
      kneeL: legL.knee,
      kneeR: legR.knee
    };

    return { group: root, kickTimer: 0 };
  }

  function updatePose(fig, player, dt, clockTime, matchPhase, celebrationStyle) {
    const parts = fig && fig.group && fig.group.userData.animParts;
    if (!parts) return;

    if (fig.kickTimer > 0) fig.kickTimer = Math.max(0, fig.kickTimer - dt);
    const kickT = fig.kickTimer || player.kickAnimTimer || 0;
    if (player.kickAnimTimer > 0) player.kickAnimTimer = Math.max(0, player.kickAnimTimer - dt);

    const blend = Math.min(1, dt * 15);
    const speed = Math.hypot(player.vx || 0, player.vz || 0);

    let targetBodyY = 0;
    let targetBodyRotX = 0;
    let targetBodyRotZ = 0;
    let targetHeadRotX = 0;
    let targetLegL = 0;
    let targetLegR = 0;
    let targetKneeL = 0;
    let targetKneeR = 0;
    let targetArmL = 0;
    let targetArmR = 0;
    let targetArmLZ = 0.14;
    let targetArmRZ = -0.14;
    let targetElbowL = -0.15;
    let targetElbowR = -0.15;

    if (kickT > 0) {
      const p = Math.sin((Math.min(0.28, kickT) / 0.28) * Math.PI);
      targetLegR = -1.15 * p;
      targetKneeR = 0.55 * p;
      targetLegL = 0.38 * p;
      targetArmL = 0.75 * p;
      targetArmR = -0.65 * p;
      targetBodyRotX = -0.16 * p;
    } else if (player.tackleTimer > 0) {
      targetBodyY = -0.44;
      targetBodyRotX = -0.78;
      targetLegR = -1.25;
      targetKneeR = 0.1;
      targetLegL = 0.35;
      targetKneeL = 0.95;
      targetArmL = 0.65;
      targetArmR = -0.65;
    } else if (player.diveTimer > 0) {
      targetBodyY = 0.42;
      targetBodyRotZ = (player.diveDir || 1) * 1.15;
      targetArmL = -2.6;
      targetArmR = -2.6;
      targetArmLZ = 0.3;
      targetArmRZ = -0.3;
    } else if (matchPhase === 'GOAL_CELEBRATION') {
      const isScoringTeam = player.team === player.celebratingTeam;
      const t = clockTime * 8.5 + (player.number || 0) * 0.6;
      if (isScoringTeam) {
        const style = celebrationStyle || 'grito';
        if (style === 'dance') {
          targetBodyY = Math.abs(Math.sin(t * 1.1)) * 0.28;
          targetBodyRotZ = Math.sin(t * 0.7) * 0.22;
          targetArmL = -2.1 + Math.sin(t * 1.4) * 0.6;
          targetArmR = -2.1 - Math.sin(t * 1.4) * 0.6;
          targetElbowL = -0.8;
          targetElbowR = -0.8;
          targetKneeL = Math.max(0, Math.sin(t)) * 0.65;
          targetKneeR = Math.max(0, -Math.sin(t)) * 0.65;
        } else if (style === 'orchestra') {
          targetBodyY = Math.abs(Math.sin(t * 0.8)) * 0.16;
          targetArmL = -1.9 + Math.sin(t * 1.1) * 0.55;
          targetArmR = -1.9 + Math.cos(t * 1.1) * 0.55;
          targetArmLZ = 0.55;
          targetArmRZ = -0.55;
        } else {
          targetBodyY = Math.abs(Math.sin(t)) * 0.34;
          targetArmL = -2.65;
          targetArmR = -2.65;
          targetArmLZ = 0.48;
          targetArmRZ = -0.48;
          targetLegL = Math.sin(t) * 0.35;
          targetLegR = -Math.sin(t) * 0.35;
        }
      } else {
        // Rival frustration: hands on head, slumped
        targetBodyRotX = 0.22;
        targetHeadRotX = 0.35;
        targetArmL = -2.25;
        targetArmR = -2.25;
        targetElbowL = -1.35;
        targetElbowR = -1.35;
        targetArmLZ = -0.25;
        targetArmRZ = 0.25;
      }
    } else if (player.frustratedTimer > 0) {
      player.frustratedTimer = Math.max(0, player.frustratedTimer - dt);
      targetBodyRotX = 0.18;
      targetHeadRotX = 0.28;
      targetArmL = -2.3;
      targetArmR = -2.3;
      targetElbowL = -1.3;
      targetElbowR = -1.3;
    } else if (player.saveCelebrateTimer > 0) {
      player.saveCelebrateTimer = Math.max(0, player.saveCelebrateTimer - dt);
      targetBodyY = Math.abs(Math.sin(clockTime * 10)) * 0.16;
      targetArmR = -2.5;
      targetElbowR = -0.5;
    } else if (player.callingPassTimer > 0 && speed > 0.4) {
      player.callingPassTimer = Math.max(0, player.callingPassTimer - dt);
      player.animPhase = (player.animPhase || 0) + dt * (5.2 + speed * 1.18);
      const s = Math.sin(player.animPhase);
      targetLegL = s * 0.72;
      targetLegR = -s * 0.72;
      targetKneeL = Math.max(0, -s) * 0.75;
      targetKneeR = Math.max(0, s) * 0.75;
      targetArmR = -2.65;
      targetArmL = s * 0.55;
      targetBodyY = Math.abs(s) * 0.08;
    } else if (speed > 0.38) {
      player.animPhase = (player.animPhase || 0) + dt * (5.2 + speed * 1.18);
      const s = Math.sin(player.animPhase);
      const amp = Math.min(0.88, 0.24 + speed * 0.056);
      targetLegL = s * amp;
      targetLegR = -s * amp;
      targetKneeL = Math.max(0, -s) * amp * 1.05;
      targetKneeR = Math.max(0, s) * amp * 1.05;
      targetArmL = -s * amp * 0.78;
      targetArmR = s * amp * 0.78;
      targetElbowL = -0.65;
      targetElbowR = -0.65;
      targetBodyY = Math.abs(s) * 0.075;
      targetBodyRotX = Math.min(0.24, speed * 0.02);
    } else {
      const idle = Math.sin(clockTime * 2.4 + (player.number || 0));
      targetBodyY = idle * 0.02;
      targetArmLZ = 0.14 + idle * 0.025;
      targetArmRZ = -0.14 - idle * 0.025;
    }

    parts.bodyPivot.position.y += (targetBodyY - parts.bodyPivot.position.y) * blend;
    parts.bodyPivot.rotation.x += (targetBodyRotX - parts.bodyPivot.rotation.x) * blend;
    parts.bodyPivot.rotation.z += (targetBodyRotZ - parts.bodyPivot.rotation.z) * blend;
    parts.headPivot.rotation.x += (targetHeadRotX - parts.headPivot.rotation.x) * blend;
    parts.legL.rotation.x += (targetLegL - parts.legL.rotation.x) * blend;
    parts.legR.rotation.x += (targetLegR - parts.legR.rotation.x) * blend;
    parts.kneeL.rotation.x += (targetKneeL - parts.kneeL.rotation.x) * blend;
    parts.kneeR.rotation.x += (targetKneeR - parts.kneeR.rotation.x) * blend;
    parts.armLPivot.rotation.x += (targetArmL - parts.armLPivot.rotation.x) * blend;
    parts.armRPivot.rotation.x += (targetArmR - parts.armRPivot.rotation.x) * blend;
    parts.armLPivot.rotation.z += (targetArmLZ - parts.armLPivot.rotation.z) * blend;
    parts.armRPivot.rotation.z += (targetArmRZ - parts.armRPivot.rotation.z) * blend;
    parts.elbowLPivot.rotation.x += (targetElbowL - parts.elbowLPivot.rotation.x) * blend;
    parts.elbowRPivot.rotation.x += (targetElbowR - parts.elbowRPivot.rotation.x) * blend;
  }

  global.PlayerRenderer = { createPlayerFigure, updatePose };
})(window);
