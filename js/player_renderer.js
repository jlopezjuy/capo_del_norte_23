/**
 * PlayerRenderer — Stylized athletic 3D footballers with sculpted proportions,
 * 3 dynamic face expressions, 6 sculpted hairstyles, GK gloves, cleats,
 * full smooth-blended pose machine, 7 goal celebration choreographies, and GPU disposal.
 * Strictly compatible with Three.js r128.
 */
(function (global) {
  'use strict';

  const SKIN_TONES = [0xf2c9a0, 0xdca577, 0xb87b50, 0x8d5836, 0xe8ba90, 0xc88d62];
  const HAIR_COLORS = [0x1c1917, 0x3b2314, 0x714722, 0x0f172a, 0xa16207, 0x4a2c18];
  const BOOT_PALETTE = [
    { upper: 0x0ea5e9, stripe: 0xf8fafc },
    { upper: 0xf8fafc, stripe: 0x0ea5e9 },
    { upper: 0x111827, stripe: 0xfacc15 },
    { upper: 0xf97316, stripe: 0x0f172a },
    { upper: 0x10b981, stripe: 0xf8fafc },
    { upper: 0xef4444, stripe: 0xf8fafc }
  ];

  const _kitTexCache = new Map();
  const _faceTexCache = new Map();
  const _thighTexCache = new Map();
  const _sockTexCache = new Map();
  const _bootTexCache = new Map();
  let _shadowTex = null;
  let _sharedGeo = null;

  /**
   * Remap UVs of a BufferGeometry into a target [uMin..uMax, vMin..vMax] rect.
   */
  function remapGeoUV(geo, uMin, uMax, vMin, vMax) {
    const uv = geo.attributes.uv;
    if (!uv) return geo;
    const uSpan = uMax - uMin;
    const vSpan = vMax - vMin;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uMin + uv.getX(i) * uSpan, vMin + uv.getY(i) * vSpan);
    }
    uv.needsUpdate = true;
    return geo;
  }

  /**
   * Merge an array of Three.js r128 BufferGeometries (converting to non-indexed)
   * into a single BufferGeometry to minimize per-player draw calls.
   */
  function mergeBufferGeometries(rawGeos) {
    const geos = rawGeos.map((g) => {
      const ni = g.index ? g.toNonIndexed() : g.clone();
      if (!ni.attributes.normal) ni.computeVertexNormals();
      return ni;
    });

    let totalVerts = 0;
    for (let i = 0; i < geos.length; i++) {
      totalVerts += geos[i].attributes.position.count;
    }

    const posArr = new Float32Array(totalVerts * 3);
    const normArr = new Float32Array(totalVerts * 3);
    const uvArr = new Float32Array(totalVerts * 2);

    let vOffset = 0;
    for (let i = 0; i < geos.length; i++) {
      const g = geos[i];
      const pos = g.attributes.position;
      const norm = g.attributes.normal;
      const uv = g.attributes.uv;
      const count = pos.count;

      posArr.set(pos.array, vOffset * 3);
      if (norm) {
        normArr.set(norm.array, vOffset * 3);
      }
      if (uv) {
        uvArr.set(uv.array, vOffset * 2);
      }
      vOffset += count;
      g.dispose();
    }

    for (let i = 0; i < rawGeos.length; i++) {
      rawGeos[i].dispose();
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
    merged.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
    return merged;
  }

  function makeHairBaseCap(thetaLen) {
    const cap = new THREE.SphereGeometry(0.213, 14, 10, 0, Math.PI * 2, 0, Math.PI * (thetaLen || 0.50));
    cap.scale(0.965, 1.065, 1.005);
    cap.rotateX(-0.34);
    cap.translate(0, 0.022, -0.008);
    return cap;
  }

  function buildHairStyleGeometries() {
    const styles = [];

    // 0: Classic athletic short fade cap
    {
      const base = makeHairBaseCap(0.49);
      const crown = new THREE.SphereGeometry(0.178, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
      crown.scale(0.92, 0.58, 1.06);
      crown.translate(0, 0.145, 0.012);
      styles.push(mergeBufferGeometries([base, crown]));
    }

    // 1: Styled mohawk / athletic crest
    {
      const base = makeHairBaseCap(0.43);
      const parts = [base];
      const crestSpec = [
        { y: 0.228, z: 0.088, sx: 0.46, sy: 0.92, sz: 0.85, r: 0.056 },
        { y: 0.252, z: 0.024, sx: 0.48, sy: 1.05, sz: 0.96, r: 0.062 },
        { y: 0.244, z: -0.048, sx: 0.46, sy: 0.96, sz: 0.92, r: 0.058 },
        { y: 0.205, z: -0.118, sx: 0.42, sy: 0.82, sz: 0.85, r: 0.050 }
      ];
      for (let i = 0; i < crestSpec.length; i++) {
        const s = crestSpec[i];
        const puff = new THREE.SphereGeometry(s.r, 8, 6);
        puff.scale(s.sx, s.sy, s.sz);
        puff.translate(0, s.y, s.z);
        parts.push(puff);
      }
      styles.push(mergeBufferGeometries(parts));
    }

    // 2: Athletic headband + textured hair cap (headband added as separate accent mesh)
    {
      const base = makeHairBaseCap(0.51);
      const tuftL = new THREE.SphereGeometry(0.085, 8, 6);
      tuftL.scale(1.15, 0.72, 1.15);
      tuftL.translate(-0.045, 0.205, 0.02);
      const tuftR = new THREE.SphereGeometry(0.082, 8, 6);
      tuftR.scale(1.12, 0.75, 1.10);
      tuftR.translate(0.052, 0.212, -0.015);
      styles.push(mergeBufferGeometries([base, tuftL, tuftR]));
    }

    // 3: Textured curly afro / voluminous top
    {
      const base = makeHairBaseCap(0.52);
      const parts = [base];
      const curls = [
        [0, 0.245, 0.0, 0.095],
        [-0.088, 0.215, 0.055, 0.082],
        [0.088, 0.215, 0.055, 0.082],
        [0, 0.218, 0.105, 0.078],
        [-0.125, 0.155, -0.015, 0.082],
        [0.125, 0.155, -0.015, 0.082],
        [-0.082, 0.195, -0.095, 0.085],
        [0.082, 0.195, -0.095, 0.085],
        [0, 0.145, -0.145, 0.085]
      ];
      for (let i = 0; i < curls.length; i++) {
        const c = curls[i];
        const puff = new THREE.SphereGeometry(c[3], 8, 6);
        puff.translate(c[0], c[1], c[2]);
        parts.push(puff);
      }
      styles.push(mergeBufferGeometries(parts));
    }

    // 4: Side-swept fringe / bangs
    {
      const base = makeHairBaseCap(0.50);
      const wave1 = new THREE.SphereGeometry(0.115, 10, 7);
      wave1.scale(1.32, 0.56, 0.92);
      wave1.rotateZ(-0.24);
      wave1.rotateY(0.18);
      wave1.translate(0.035, 0.195, 0.082);

      const wave2 = new THREE.SphereGeometry(0.092, 8, 6);
      wave2.scale(1.22, 0.52, 0.85);
      wave2.rotateZ(-0.34);
      wave2.translate(-0.068, 0.165, 0.112);

      const sideLock = new THREE.SphereGeometry(0.068, 8, 6);
      sideLock.scale(0.65, 1.15, 1.05);
      sideLock.translate(-0.158, 0.105, 0.045);

      styles.push(mergeBufferGeometries([base, wave1, wave2, sideLock]));
    }

    // 5: High bun / ponytail in back
    {
      const base = makeHairBaseCap(0.51);
      const tie = new THREE.CylinderGeometry(0.036, 0.036, 0.028, 8);
      tie.rotateX(Math.PI * 0.42);
      tie.translate(0, 0.145, -0.185);

      const bun = new THREE.SphereGeometry(0.072, 10, 8);
      bun.scale(0.95, 0.92, 1.08);
      bun.translate(0, 0.152, -0.228);

      const tail = new THREE.CylinderGeometry(0.028, 0.046, 0.115, 8);
      tail.rotateX(0.32);
      tail.translate(0, 0.088, -0.248);

      styles.push(mergeBufferGeometries([base, tie, bun, tail]));
    }

    return styles;
  }

  function getGeo() {
    if (_sharedGeo) return _sharedGeo;

    // 1. Sculpted athletic V-chest torso with sloped shoulders and raised collar rim (1 draw call)
    // LatheGeometry: u=0.25 (+X) rotated -PI/2 -> +Z (front chest), u=0.75 (-X) -> -Z (back dorsal)
    const torsoProfile = [
      new THREE.Vector2(0.165, -0.28),  // j=0: tucked lower waist
      new THREE.Vector2(0.190, -0.20),  // j=1: waist
      new THREE.Vector2(0.206, -0.10),  // j=2: lower ribs
      new THREE.Vector2(0.224,  0.00),  // j=3: mid torso
      new THREE.Vector2(0.242,  0.10),  // j=4: upper ribcage
      new THREE.Vector2(0.255,  0.19),  // j=5: heroic athletic V-chest
      new THREE.Vector2(0.236,  0.252), // j=6: rounded shoulder slope
      new THREE.Vector2(0.144,  0.292), // j=7: trapezius / collar base
      new THREE.Vector2(0.094,  0.304)  // j=8: raised collar rim
    ];
    const torso = new THREE.LatheGeometry(torsoProfile, 16);
    torso.rotateY(-Math.PI * 0.5);
    torso.scale(1.08, 1.0, 0.68);
    torso.computeVertexNormals();

    // 2. Sculpted athletic shorts pelvis (oval tapered lathe)
    const shortsProfile = [
      new THREE.Vector2(0.180, -0.125),
      new THREE.Vector2(0.218, -0.105),
      new THREE.Vector2(0.214,  0.000),
      new THREE.Vector2(0.198,  0.095),
      new THREE.Vector2(0.182,  0.115)
    ];
    const shorts = new THREE.LatheGeometry(shortsProfile, 14);
    shorts.rotateY(-Math.PI * 0.5);
    shorts.scale(1.06, 1.0, 0.74);
    shorts.computeVertexNormals();

    // 3. Expressive stylized head + subtle 3D nose bridge + sculpted ears (1 draw call)
    const cranium = new THREE.SphereGeometry(0.205, 16, 12);
    cranium.rotateY(-Math.PI * 0.5);
    cranium.scale(0.95, 1.06, 0.98);

    const nose = new THREE.SphereGeometry(0.026, 6, 5);
    nose.scale(0.85, 1.38, 1.18);
    nose.translate(0, -0.016, 0.198);
    remapGeoUV(nose, 0.08, 0.14, 0.45, 0.55);

    const earL = new THREE.SphereGeometry(0.036, 6, 5);
    earL.scale(0.45, 1.15, 0.78);
    earL.translate(0.192, -0.008, -0.012);
    remapGeoUV(earL, 0.08, 0.14, 0.45, 0.55);

    const earR = new THREE.SphereGeometry(0.036, 6, 5);
    earR.scale(0.45, 1.15, 0.78);
    earR.translate(-0.192, -0.008, -0.012);
    remapGeoUV(earR, 0.08, 0.14, 0.45, 0.55);

    const head = mergeBufferGeometries([cranium, nose, earL, earR]);

    // 4. Neck
    const neck = new THREE.CylinderGeometry(0.074, 0.088, 0.135, 10);

    // 5. Hairstyles (6 distinct sculpted styles) + headband accent
    const hairStyles = buildHairStyleGeometries();
    const headband = new THREE.TorusGeometry(0.203, 0.022, 6, 18);
    headband.rotateX(Math.PI * 0.5);
    headband.scale(0.96, 1.0, 0.99);
    headband.rotateX(-0.30);
    headband.translate(0, 0.092, -0.004);

    // 6. Upper arm: spherical shoulder cap + tapered jersey sleeve + cuff (merged, 1 draw call)
    const shoulderBall = new THREE.SphereGeometry(0.076, 10, 8);
    const sleeveCyl = new THREE.CylinderGeometry(0.071, 0.056, 0.21, 10);
    sleeveCyl.translate(0, -0.105, 0);
    const sleeveHem = new THREE.CylinderGeometry(0.061, 0.060, 0.024, 10);
    sleeveHem.translate(0, -0.202, 0);
    const upperArm = mergeBufferGeometries([shoulderBall, sleeveCyl, sleeveHem]);

    // Captain's armband (fitted over left upper sleeve)
    const captainBand = new THREE.CylinderGeometry(0.066, 0.063, 0.056, 10);
    captainBand.translate(0, -0.145, 0);

    // 7. Outfield forearm: spherical elbow + tapered forearm + sculpted hand + thumb (1 draw call)
    const elbowBall = new THREE.SphereGeometry(0.053, 8, 6);
    const forearmCyl = new THREE.CylinderGeometry(0.052, 0.039, 0.20, 10);
    forearmCyl.translate(0, -0.10, 0);
    const handPalm = new THREE.SphereGeometry(0.045, 8, 6);
    handPalm.scale(0.75, 1.18, 0.96);
    handPalm.translate(0, -0.225, 0.01);
    const handThumb = new THREE.SphereGeometry(0.020, 6, 5);
    handThumb.translate(0, -0.205, 0.044);
    const forearmOutfield = mergeBufferGeometries([elbowBall, forearmCyl, handPalm, handThumb]);

    // 8. Goalkeeper forearm (long sleeve) + oversized padded GK glove
    const gkElbow = new THREE.SphereGeometry(0.055, 8, 6);
    const gkForearmCyl = new THREE.CylinderGeometry(0.054, 0.044, 0.19, 10);
    gkForearmCyl.translate(0, -0.095, 0);
    const forearmGK = mergeBufferGeometries([gkElbow, gkForearmCyl]);

    const gloveWrist = new THREE.CylinderGeometry(0.056, 0.052, 0.056, 10);
    gloveWrist.translate(0, -0.195, 0);
    const glovePalm = new THREE.SphereGeometry(0.078, 10, 8);
    glovePalm.scale(0.72, 1.24, 1.08);
    glovePalm.translate(0, -0.258, 0.012);
    const gloveThumb = new THREE.SphereGeometry(0.034, 6, 6);
    gloveThumb.scale(0.8, 1.15, 0.9);
    gloveThumb.translate(0, -0.236, 0.072);
    const gkGlove = mergeBufferGeometries([gloveWrist, glovePalm, gloveThumb]);

    // 9. Sculpted thigh: articulated shorts cuff + muscular tapered thigh + spherical knee (1 draw call)
    const thighProfile = [
      new THREE.Vector2(0.030, -0.325), // knee lower round
      new THREE.Vector2(0.066, -0.295), // knee cap
      new THREE.Vector2(0.070, -0.260), // lower thigh
      new THREE.Vector2(0.082, -0.180), // mid muscular quad
      new THREE.Vector2(0.088, -0.118), // upper thigh under cuff
      new THREE.Vector2(0.104, -0.112), // shorts cuff outer hem
      new THREE.Vector2(0.108, -0.035), // upper shorts leg
      new THREE.Vector2(0.098,  0.025)  // hip tuck
    ];
    const thigh = new THREE.LatheGeometry(thighProfile, 12);
    thigh.computeVertexNormals();

    // 10. Sculpted shin/calf: high football sock with fold-over cuff band & tapered ankle (1 draw call)
    const shinProfile = [
      new THREE.Vector2(0.050, -0.285), // ankle inside boot
      new THREE.Vector2(0.054, -0.235), // lower calf
      new THREE.Vector2(0.073, -0.135), // muscular calf swell
      new THREE.Vector2(0.076, -0.065), // sock fold-over top cuff
      new THREE.Vector2(0.072, -0.025), // sock top edge
      new THREE.Vector2(0.066,  0.010), // knee overlap
      new THREE.Vector2(0.035,  0.032)  // upper knee cap join
    ];
    const shin = new THREE.LatheGeometry(shinProfile, 12);
    shin.computeVertexNormals();

    // 11. Sculpted football cleat / boot (rounded heel + tapered toe box + dark studded sole, 1 draw call)
    const heelCup = new THREE.SphereGeometry(0.057, 8, 6);
    heelCup.scale(0.95, 0.92, 1.05);
    heelCup.translate(0, -0.292, -0.016);
    remapGeoUV(heelCup, 0.05, 0.95, 0.36, 0.96);

    const toeBox = new THREE.SphereGeometry(0.062, 10, 8);
    toeBox.scale(0.96, 0.66, 1.66);
    toeBox.translate(0, -0.304, 0.056);
    remapGeoUV(toeBox, 0.05, 0.95, 0.36, 0.96);

    const solePlate = new THREE.BoxGeometry(0.110, 0.022, 0.232);
    solePlate.translate(0, -0.328, 0.042);
    remapGeoUV(solePlate, 0.05, 0.95, 0.04, 0.26);

    const studCoords = [
      [-0.034, -0.342, -0.045],
      [ 0.034, -0.342, -0.045],
      [-0.036, -0.342,  0.095],
      [ 0.036, -0.342,  0.095]
    ];
    const bootParts = [heelCup, toeBox, solePlate];
    for (let i = 0; i < studCoords.length; i++) {
      const sc = studCoords[i];
      const stud = new THREE.CylinderGeometry(0.011, 0.007, 0.015, 5);
      stud.translate(sc[0], sc[1], sc[2]);
      remapGeoUV(stud, 0.05, 0.95, 0.02, 0.16);
      bootParts.push(stud);
    }
    const boot = mergeBufferGeometries(bootParts);

    // 12. Ground contact shadow disc
    const shadow = new THREE.CircleGeometry(0.42, 18);

    _sharedGeo = {
      torso,
      shorts,
      head,
      neck,
      hairStyles,
      headband,
      upperArm,
      captainBand,
      forearmOutfield,
      forearmGK,
      gkGlove,
      thigh,
      shin,
      boot,
      shadow
    };
    return _sharedGeo;
  }

  function getColorLuminance(hex) {
    const c = new THREE.Color(hex);
    return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  }

  function makeShadowTexture() {
    if (_shadowTex) return _shadowTex;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0.0, 'rgba(5, 10, 18, 0.48)');
    grad.addColorStop(0.55, 'rgba(5, 10, 18, 0.24)');
    grad.addColorStop(1.0, 'rgba(5, 10, 18, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    _shadowTex = new THREE.CanvasTexture(canvas);
    return _shadowTex;
  }

  /**
   * 256x128 equirectangular face texture (1:1 aspect ratio at equator, zero stretch).
   * Head geometry is rotated -PI/2 around Y, so u=0.5 (x=128) faces strictly +Z (front).
   */
  function makeFaceTexture(skinHex, hairHex, mood) {
    const safeMood = mood === 'joy' || mood === 'shock' ? mood : 'focused';
    const key = `${skinHex}|${hairHex}|${safeMood}`;
    if (_faceTexCache.has(key)) return _faceTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const skinColor = new THREE.Color(skinHex);
    const hairColor = new THREE.Color(hairHex);
    const skinStyle = `#${skinColor.getHexString()}`;
    const hairStyle = `#${hairColor.getHexString()}`;

    ctx.fillStyle = skinStyle;
    ctx.fillRect(0, 0, 256, 128);

    // Soft forehead shadow under hair and gentle jaw depth
    const topShade = ctx.createLinearGradient(0, 0, 0, 44);
    topShade.addColorStop(0, 'rgba(15, 10, 8, 0.16)');
    topShade.addColorStop(1, 'rgba(15, 10, 8, 0.0)');
    ctx.fillStyle = topShade;
    ctx.fillRect(0, 0, 256, 44);

    const chinShade = ctx.createLinearGradient(0, 96, 0, 128);
    chinShade.addColorStop(0, 'rgba(20, 10, 6, 0.0)');
    chinShade.addColorStop(1, 'rgba(20, 10, 6, 0.16)');
    ctx.fillStyle = chinShade;
    ctx.fillRect(0, 96, 256, 32);

    // Subtle warm cheek blush
    ctx.fillStyle = 'rgba(220, 95, 85, 0.14)';
    ctx.beginPath();
    ctx.ellipse(98, 72, 10, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(158, 72, 10, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle sideburns near temples
    ctx.fillStyle = hairStyle;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(76, 44, 6, 22);
    ctx.fillRect(174, 44, 6, 22);
    ctx.globalAlpha = 1.0;

    // Eyes centered around x=111 (viewer left) and x=145 (viewer right), y=60
    const eyeY = 60;
    const eyeLX = 111;
    const eyeRX = 145;
    const scleraRX = safeMood === 'shock' ? 8.2 : 7.6;
    const scleraRY = safeMood === 'shock' ? 6.8 : (safeMood === 'joy' ? 5.2 : 5.6);

    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeLX, eyeY, scleraRX, scleraRY, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeRX, eyeY, scleraRX, scleraRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rich dark irises
    const irisR = safeMood === 'shock' ? 3.4 : 4.2;
    ctx.fillStyle = '#1f1916';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, irisR, 0, Math.PI * 2);
    ctx.arc(eyeRX, eyeY, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Deep pupil
    ctx.fillStyle = '#070a12';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, irisR * 0.56, 0, Math.PI * 2);
    ctx.arc(eyeRX, eyeY, irisR * 0.56, 0, Math.PI * 2);
    ctx.fill();

    // Bright specular catchlights
    const catchR = safeMood === 'joy' ? 2.1 : 1.7;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeLX + 1.8, eyeY - 1.7, catchR, 0, Math.PI * 2);
    ctx.arc(eyeRX + 1.8, eyeY - 1.7, catchR, 0, Math.PI * 2);
    ctx.fill();

    // Upper eyelid line
    ctx.strokeStyle = '#181412';
    ctx.lineWidth = 2.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY + 0.5, scleraRX, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY + 0.5, scleraRX, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Joyful lower-lid cheek squint
    if (safeMood === 'joy') {
      ctx.fillStyle = skinStyle;
      ctx.beginPath();
      ctx.ellipse(eyeLX, eyeY + 6.4, 8.2, 3.2, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeRX, eyeY + 6.4, 8.2, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Expressive eyebrows
    ctx.strokeStyle = hairStyle;
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (safeMood === 'joy') {
      // Raised excited brows
      ctx.moveTo(100, 47);
      ctx.quadraticCurveTo(111, 42, 121, 47);
      ctx.moveTo(135, 47);
      ctx.quadraticCurveTo(145, 42, 156, 47);
    } else if (safeMood === 'shock') {
      // Worried / disbelieving angled brows
      ctx.moveTo(100, 50);
      ctx.quadraticCurveTo(112, 47, 121, 44);
      ctx.moveTo(135, 44);
      ctx.quadraticCurveTo(144, 47, 156, 50);
    } else {
      // Determined athletic brows
      ctx.moveTo(101, 48);
      ctx.lineTo(121, 51);
      ctx.moveTo(135, 51);
      ctx.lineTo(155, 48);
    }
    ctx.stroke();

    // Subtle under-nose shadow
    ctx.fillStyle = 'rgba(40, 20, 12, 0.18)';
    ctx.beginPath();
    ctx.ellipse(128, 72, 4.5, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth expression
    if (safeMood === 'joy') {
      // Wide celebratory grin with white upper teeth
      ctx.fillStyle = '#5b1520';
      ctx.beginPath();
      ctx.moveTo(112, 79);
      ctx.quadraticCurveTo(128, 81, 144, 79);
      ctx.quadraticCurveTo(141, 95, 128, 95);
      ctx.quadraticCurveTo(115, 95, 112, 79);
      ctx.closePath();
      ctx.fill();

      // Upper teeth arc
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(115, 80);
      ctx.quadraticCurveTo(128, 82, 141, 80);
      ctx.quadraticCurveTo(139, 86, 128, 86);
      ctx.quadraticCurveTo(117, 86, 115, 80);
      ctx.closePath();
      ctx.fill();

      // Warm tongue hint
      ctx.fillStyle = '#e05a65';
      ctx.beginPath();
      ctx.ellipse(128, 92, 6.5, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (safeMood === 'shock') {
      // Wide O-mouth / grimace
      ctx.fillStyle = '#3e1018';
      ctx.beginPath();
      ctx.ellipse(128, 85, 8.5, 7.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c3f34';
      ctx.lineWidth = 2.0;
      ctx.stroke();
    } else {
      // Firm determined mouth
      ctx.strokeStyle = '#6d342a';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(118, 83);
      ctx.quadraticCurveTo(128, 85, 138, 82);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(40, 18, 12, 0.22)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(123, 88);
      ctx.lineTo(133, 88);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    _faceTexCache.set(key, tex);
    return tex;
  }

  /**
   * 256x128 wraparound jersey texture for LatheGeometry torso (rotated -PI/2 on Y):
   * - x = 64  (u=0.25): FRONT chest center (+Z)
   * - x = 82  (u=0.32): Player's LEFT chest over heart (+Z, +X) -> Crest emblem
   * - x = 192 (u=0.75): BACK dorsal center (-Z) -> Bold outlined dorsal number
   * - x = 0/256 (u=0/1): Right-side seam hidden under arm (-X)
   */
  function makeJerseyTexture(primaryHex, secondaryHex, number, striped, isGK, isRef) {
    const key = `${primaryHex}|${secondaryHex}|${isRef ? 'REF' : number}|${striped ? 1 : 0}|${isGK ? 1 : 0}`;
    if (_kitTexCache.has(key)) return _kitTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const c1 = new THREE.Color(primaryHex).getStyle();
    const c2 = new THREE.Color(secondaryHex).getStyle();
    const lum1 = getColorLuminance(primaryHex);

    // Base fill
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 256, 128);

    if (striped) {
      // 12 crisp alternating vertical stripes centered symmetrically on front (x=64) and back (x=192)
      const stripeW = 256 / 12;
      ctx.fillStyle = c2;
      for (let i = -1; i < 13; i++) {
        if (((i % 2) + 2) % 2 === 1) {
          ctx.fillRect(i * stripeW - stripeW * 0.5, 0, stripeW, 128);
        }
      }
    } else if (isRef) {
      // Sleek referee jersey with subtle vertical pinstripes and dark shoulder yoke
      ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      for (let x = 0; x < 256; x += 12) {
        ctx.fillRect(x, 0, 4, 128);
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 28);
      // Referee front chest pocket & yellow/red card accents
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(73, 42, 16, 18);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(75, 38, 6, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(82, 39, 5, 5);
    } else if (isGK) {
      // Modern stylized GK kit with bold chevron graphic on chest
      ctx.fillStyle = c2;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(16, 36);
      ctx.lineTo(64, 58);
      ctx.lineTo(112, 36);
      ctx.lineTo(112, 52);
      ctx.lineTo(64, 74);
      ctx.lineTo(16, 52);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 22, 256, 14);
      ctx.globalAlpha = 1.0;
    } else {
      // Modern solid kit with chest band + subtle side panels
      ctx.fillStyle = c2;
      ctx.fillRect(0, 46, 256, 18);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(0, 44, 256, 2);
      ctx.fillRect(0, 64, 256, 2);
      // Side contour panels under arms
      ctx.fillStyle = c2;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 26, 10, 102);
      ctx.fillRect(246, 26, 10, 102);
      ctx.fillRect(118, 26, 20, 102);
      ctx.globalAlpha = 1.0;
    }

    // Subtle athletic fabric shading (side volume + waist tuck shadow)
    const waistGrad = ctx.createLinearGradient(0, 96, 0, 128);
    waistGrad.addColorStop(0, 'rgba(0,0,0,0)');
    waistGrad.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = waistGrad;
    ctx.fillRect(0, 96, 256, 32);

    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(121, 20, 14, 108);
    ctx.fillRect(0, 20, 7, 108);
    ctx.fillRect(249, 20, 7, 108);

    // Sculpted collar rim (top band y=0..16 maps across sloped collar lip)
    const collarCol = lum1 > 0.65 ? '#0f172a' : c2;
    ctx.fillStyle = '#0b1320';
    ctx.fillRect(0, 0, 256, 11);
    ctx.fillStyle = collarCol;
    ctx.fillRect(0, 11, 256, 5);

    // Crisp V-neck front collar dip centered at x=64 (+Z front)
    ctx.fillStyle = '#0b1320';
    ctx.beginPath();
    ctx.moveTo(48, 12);
    ctx.lineTo(80, 12);
    ctx.lineTo(64, 33);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = collarCol;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(49, 13);
    ctx.lineTo(64, 31);
    ctx.lineTo(79, 13);
    ctx.stroke();

    // Front chest emblem over heart (player's left chest -> x=82, y=45)
    if (!isRef) {
      ctx.save();
      ctx.translate(82, 46);
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(-7, -8);
      ctx.lineTo(7, -8);
      ctx.lineTo(7, 2);
      ctx.lineTo(0, 9);
      ctx.lineTo(-7, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0b1320';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner shield highlight stripe
      ctx.fillStyle = c1;
      ctx.fillRect(-2.2, -6.5, 4.4, 12.5);
      ctx.restore();

      // Minimal kit brand geometric chevron on right chest (x=46, y=46)
      ctx.fillStyle = lum1 > 0.65 ? '#0f172a' : '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(41, 48);
      ctx.lineTo(46, 42);
      ctx.lineTo(51, 48);
      ctx.lineTo(48.5, 48);
      ctx.lineTo(46, 45);
      ctx.lineTo(43.5, 48);
      ctx.closePath();
      ctx.fill();
    }

    // Bold outlined dorsal number strictly on BACK (-Z center: x=192, y=68)
    if (!isRef && number > 0) {
      if (striped) {
        // High-contrast back number plate so dorsal pops sharply over vertical stripes
        ctx.fillStyle = 'rgba(11, 19, 32, 0.78)';
        ctx.beginPath();
        ctx.moveTo(164, 38);
        ctx.lineTo(220, 38);
        ctx.quadraticCurveTo(225, 38, 225, 43);
        ctx.lineTo(225, 93);
        ctx.quadraticCurveTo(225, 98, 220, 98);
        ctx.lineTo(164, 98);
        ctx.quadraticCurveTo(159, 98, 159, 93);
        ctx.lineTo(159, 43);
        ctx.quadraticCurveTo(159, 38, 164, 38);
        ctx.closePath();
        ctx.fill();
      }

      const numStr = String(number);
      const fontSize = numStr.length >= 2 ? 48 : 54;
      ctx.font = `900 ${fontSize}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 6;

      const useDarkNum = !striped && lum1 > 0.72;
      ctx.strokeStyle = useDarkNum ? '#ffffff' : '#0b1320';
      ctx.fillStyle = useDarkNum ? '#0f172a' : '#f8fafc';
      ctx.strokeText(numStr, 192, 69);
      ctx.fillText(numStr, 192, 69);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    _kitTexCache.set(key, tex);
    return tex;
  }

  /**
   * 16x64 thigh texture combining articulated shorts cuff (top) + muscular thigh/knee skin (bottom).
   */
  function makeThighTexture(shortsHex, skinHex, accentHex) {
    const key = `${shortsHex}|${skinHex}|${accentHex}`;
    if (_thighTexCache.has(key)) return _thighTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const shCol = new THREE.Color(shortsHex).getStyle();
    const skCol = new THREE.Color(skinHex).getStyle();
    const acCol = new THREE.Color(accentHex).getStyle();

    // Top 42% = shorts leg cuff (uv.y from 1.0 down to 0.58)
    ctx.fillStyle = shCol;
    ctx.fillRect(0, 0, 16, 27);
    ctx.fillStyle = acCol;
    ctx.fillRect(0, 23, 16, 3);

    // Bottom 58% = skin thigh + subtle cuff shadow
    ctx.fillStyle = skCol;
    ctx.fillRect(0, 27, 16, 37);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(0, 27, 16, 4);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    _thighTexCache.set(key, tex);
    return tex;
  }

  /**
   * 16x64 shin texture combining knee skin blend + contrasting fold-over sock top band + high sock.
   */
  function makeSockTexture(sockHex, trimHex, skinHex) {
    const key = `${sockHex}|${trimHex}|${skinHex}`;
    if (_sockTexCache.has(key)) return _sockTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const soCol = new THREE.Color(sockHex).getStyle();
    const trCol = new THREE.Color(trimHex).getStyle();
    const skCol = new THREE.Color(skinHex).getStyle();

    // Top knee skin overlap
    ctx.fillStyle = skCol;
    ctx.fillRect(0, 0, 16, 8);

    // Contrasting fold-over sock cuff with athletic double stripe
    ctx.fillStyle = trCol;
    ctx.fillRect(0, 8, 16, 13);
    ctx.fillStyle = soCol;
    ctx.fillRect(0, 12, 16, 2.5);
    ctx.fillRect(0, 16, 16, 2);

    // Main calf football sock
    ctx.fillStyle = soCol;
    ctx.fillRect(0, 21, 16, 43);

    // Subtle knit depth toward ankle
    const grad = ctx.createLinearGradient(0, 21, 0, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 21, 16, 43);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    _sockTexCache.set(key, tex);
    return tex;
  }

  /**
   * 64x64 sculpted cleat texture (upper boot color + speed accent stripes + dark studded sole).
   */
  function makeBootTexture(upperHex, stripeHex) {
    const key = `${upperHex}|${stripeHex}`;
    if (_bootTexCache.has(key)) return _bootTexCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const uCol = new THREE.Color(upperHex).getStyle();
    const sCol = new THREE.Color(stripeHex).getStyle();

    // Upper cleat (y=0..43)
    ctx.fillStyle = uCol;
    ctx.fillRect(0, 0, 64, 44);

    // Dynamic speed stripes across cleat upper
    ctx.fillStyle = sCol;
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(36, 14);
    ctx.lineTo(42, 18);
    ctx.lineTo(14, 34);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(22, 34);
    ctx.lineTo(48, 22);
    ctx.lineTo(52, 26);
    ctx.lineTo(26, 38);
    ctx.closePath();
    ctx.fill();

    // Dark carbon sole plate & cleat studs (y=44..64)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 44, 64, 20);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 56, 64, 8);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 2;
    _bootTexCache.set(key, tex);
    return tex;
  }

  function createPlayerFigure(opts) {
    const safeOpts = opts || {};
    const {
      primaryColor = 0x1ea7fd,
      secondaryColor = 0xffffff,
      shortsColor,
      sockColor,
      striped = false,
      isGK = false,
      isCaptain = false,
      number = 10,
      role = 'MF'
    } = safeOpts;

    const effectiveIsGK = Boolean(isGK || role === 'GK');
    const isRef = role === 'REF';
    const effectiveCaptain = Boolean(
      isCaptain || (!effectiveIsGK && !isRef && (number === 2 || number === 5))
    );

    const g = getGeo();
    const root = new THREE.Group();
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    const ownedMaterials = [];
    function ownMat(mat) {
      ownedMaterials.push(mat);
      return mat;
    }

    const numAbs = Math.abs(Math.floor(number || 0));
    const skinHex = SKIN_TONES[numAbs % SKIN_TONES.length];
    const hairHex = HAIR_COLORS[(numAbs * 3 + 1) % HAIR_COLORS.length];

    const faceTextures = {
      focused: makeFaceTexture(skinHex, hairHex, 'focused'),
      joy: makeFaceTexture(skinHex, hairHex, 'joy'),
      shock: makeFaceTexture(skinHex, hairHex, 'shock')
    };

    const resolvedShorts = shortsColor !== undefined
      ? shortsColor
      : (effectiveIsGK ? 0x0f172a : (striped ? 0xf8fafc : 0x0f172a));
    const resolvedSocks = sockColor !== undefined
      ? sockColor
      : (effectiveIsGK ? 0x10b981 : primaryColor);
    const sockTrimHex = getColorLuminance(resolvedSocks) > 0.7 ? primaryColor : 0xf8fafc;
    const bootChoice = isRef
      ? { upper: 0x111827, stripe: 0x94a3b8 }
      : BOOT_PALETTE[numAbs % BOOT_PALETTE.length];

    const skinMat = ownMat(new THREE.MeshLambertMaterial({ color: skinHex }));
    const faceMat = ownMat(new THREE.MeshLambertMaterial({ map: faceTextures.focused }));
    const hairMat = ownMat(new THREE.MeshLambertMaterial({ color: hairHex }));
    const shirtMat = ownMat(new THREE.MeshLambertMaterial({
      map: makeJerseyTexture(primaryColor, secondaryColor, numAbs, Boolean(striped && !effectiveIsGK && !isRef), effectiveIsGK, isRef)
    }));
    const sleeveMat = ownMat(new THREE.MeshLambertMaterial({ color: primaryColor }));
    const shortsMat = ownMat(new THREE.MeshLambertMaterial({ color: resolvedShorts }));
    const thighMat = ownMat(new THREE.MeshLambertMaterial({
      map: makeThighTexture(resolvedShorts, skinHex, secondaryColor)
    }));
    const sockMat = ownMat(new THREE.MeshLambertMaterial({
      map: makeSockTexture(resolvedSocks, sockTrimHex, skinHex)
    }));
    const bootMat = ownMat(new THREE.MeshLambertMaterial({
      map: makeBootTexture(bootChoice.upper, bootChoice.stripe)
    }));

    // Pelvis / Shorts
    const shortsMesh = new THREE.Mesh(g.shorts, shortsMat);
    shortsMesh.position.y = 0.695;
    bodyPivot.add(shortsMesh);

    // Waist hinge (torsoPivot) for athletic forward lean, counter-twist, and celebration expressiveness
    const torsoPivot = new THREE.Group();
    torsoPivot.position.set(0, 0.74, 0);
    bodyPivot.add(torsoPivot);

    // Sculpted athletic V-chest torso (single draw call)
    const torsoMesh = new THREE.Mesh(g.torso, shirtMat);
    torsoMesh.position.y = 0.285;
    torsoPivot.add(torsoMesh);

    // Neck + Expressive Head Pivot
    const neckMesh = new THREE.Mesh(g.neck, skinMat);
    neckMesh.position.y = 0.605;
    torsoPivot.add(neckMesh);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.785, 0);
    torsoPivot.add(headPivot);

    const headMesh = new THREE.Mesh(g.head, faceMat);
    headPivot.add(headMesh);

    // 6 distinct sculpted hairstyles
    const hairStyleIdx = numAbs % 6;
    const hairMesh = new THREE.Mesh(g.hairStyles[hairStyleIdx], hairMat);
    headPivot.add(hairMesh);

    if (hairStyleIdx === 2) {
      const bandColor = isRef ? 0xfacc15 : (getColorLuminance(primaryColor) > 0.75 ? secondaryColor : primaryColor);
      const bandMat = ownMat(new THREE.MeshLambertMaterial({ color: bandColor }));
      const bandMesh = new THREE.Mesh(g.headband, bandMat);
      headPivot.add(bandMesh);
    }

    // Optional oversized GK glove material & captain armband material
    let gloveMat = null;
    if (effectiveIsGK) {
      const gloveColor = getColorLuminance(primaryColor) > 0.5 ? 0xf8fafc : 0xa3e635;
      gloveMat = ownMat(new THREE.MeshLambertMaterial({ color: gloveColor }));
    }
    let captainMat = null;
    if (effectiveCaptain) {
      captainMat = ownMat(new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
    }

    // Articulated Arms (player anatomical Left = +X, anatomical Right = -X when facing +Z)
    function buildArm(sideSign, isLeftArm) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sideSign * 0.278, 0.495, 0);

      const upperMesh = new THREE.Mesh(g.upperArm, sleeveMat);
      shoulder.add(upperMesh);

      if (isLeftArm && effectiveCaptain && captainMat) {
        const band = new THREE.Mesh(g.captainBand, captainMat);
        shoulder.add(band);
      }

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.215, 0);

      if (effectiveIsGK) {
        const gkArmMesh = new THREE.Mesh(g.forearmGK, sleeveMat);
        elbow.add(gkArmMesh);
        const gloveMesh = new THREE.Mesh(g.gkGlove, gloveMat);
        elbow.add(gloveMesh);
      } else {
        const forearmMesh = new THREE.Mesh(g.forearmOutfield, skinMat);
        elbow.add(forearmMesh);
      }

      shoulder.add(elbow);
      torsoPivot.add(shoulder);
      return { shoulder, elbow };
    }

    const armL = buildArm(1, true);
    const armR = buildArm(-1, false);

    // Articulated Legs (player anatomical Left = +X, anatomical Right = -X)
    function buildLeg(sideSign) {
      const hip = new THREE.Group();
      hip.position.set(sideSign * 0.125, 0.635, 0);

      const thighMesh = new THREE.Mesh(g.thigh, thighMat);
      hip.add(thighMesh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.29, 0);

      const shinMesh = new THREE.Mesh(g.shin, sockMat);
      knee.add(shinMesh);

      const bootMesh = new THREE.Mesh(g.boot, bootMat);
      knee.add(bootMesh);

      hip.add(knee);
      bodyPivot.add(hip);
      return { hip, knee };
    }

    const legL = buildLeg(1);
    const legR = buildLeg(-1);

    // Physical variation by role (GK tallest/broad, DF tall/broad, FW lean/agile, MF balanced)
    let scaleY = 1.13 + (numAbs % 3) * 0.022;
    let scaleXZ = 1.14;
    if (effectiveIsGK) {
      scaleY = 1.23;
      scaleXZ = 1.20;
    } else if (role === 'DF') {
      scaleY = 1.19 + (numAbs % 2) * 0.02;
      scaleXZ = 1.19;
    } else if (role === 'FW') {
      scaleY = 1.12 + (numAbs % 3) * 0.018;
      scaleXZ = 1.11;
    } else if (isRef) {
      scaleY = 1.15;
      scaleXZ = 1.13;
    }
    bodyPivot.scale.set(scaleXZ, scaleY, scaleXZ);

    // Soft radial ground contact shadow
    const shadowMat = ownMat(new THREE.MeshBasicMaterial({
      map: makeShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    }));
    const shadow = new THREE.Mesh(g.shadow, shadowMat);
    shadow.rotation.x = -Math.PI * 0.5;
    shadow.position.y = 0.02;
    root.add(shadow);

    root.userData.animParts = {
      bodyPivot,
      torsoPivot,
      headPivot,
      armLPivot: armL.shoulder,
      armRPivot: armR.shoulder,
      elbowLPivot: armL.elbow,
      elbowRPivot: armR.elbow,
      legL: legL.hip,
      legR: legR.hip,
      kneeL: legL.knee,
      kneeR: legR.knee,
      shadow
    };

    const fig = {
      group: root,
      kickTimer: 0,
      _faceMat: faceMat,
      _faceTextures: faceTextures,
      _currentMood: 'focused',
      _ownedMaterials: ownedMaterials,
      _prevRotY: undefined,
      setExpression: function (mood) {
        const next = mood === 'joy' || mood === 'shock' ? mood : 'focused';
        if (fig._currentMood === next || !fig._faceMat) return;
        fig._currentMood = next;
        fig._faceMat.map = fig._faceTextures[next];
      }
    };

    return fig;
  }

  function updatePose(fig, player, dt, clockTime, matchPhase, celebrationStyle) {
    const parts = fig && fig.group && fig.group.userData && fig.group.userData.animParts;
    if (!parts || !player) return;

    const safeDt = Math.min(0.1, Math.max(0.0001, dt || 0.016));
    const tClock = clockTime || 0;

    // Decrement timers owned by PlayerRenderer (engine owns dive/header/dribble/tackle timers)
    if (fig.kickTimer > 0) fig.kickTimer = Math.max(0, fig.kickTimer - safeDt);
    const kickT = fig.kickTimer || player.kickAnimTimer || 0;
    if (player.kickAnimTimer > 0) player.kickAnimTimer = Math.max(0, player.kickAnimTimer - safeDt);

    const speed = Math.hypot(player.vx || 0, player.vz || 0);

    // Compute smooth yaw rate for dynamic lateral banking lean on sharp turns
    const curRotY = player.rotY || 0;
    let dRot = fig._prevRotY !== undefined ? (curRotY - fig._prevRotY) : 0;
    while (dRot > Math.PI) dRot -= Math.PI * 2;
    while (dRot < -Math.PI) dRot += Math.PI * 2;
    fig._prevRotY = curRotY;
    const yawRate = Math.max(-7.5, Math.min(7.5, dRot / safeDt));
    const turnBank = speed > 1.2
      ? Math.max(-0.26, Math.min(0.26, -yawRate * Math.min(1, speed / 7.5) * 0.055))
      : 0;

    // Default neutral targets
    let targetBodyY = 0;
    let targetBodyRotX = 0;
    let targetBodyRotZ = 0;
    let targetTorsoRotX = 0;
    let targetTorsoRotY = 0;
    let targetHeadRotX = 0;
    let targetHeadRotY = 0;
    let targetLegL = 0;
    let targetLegR = 0;
    let targetKneeL = 0;
    let targetKneeR = 0;
    let targetArmL = 0;
    let targetArmR = 0;
    let targetArmLZ = 0.14;
    let targetArmRZ = -0.14;
    let targetElbowL = -0.18;
    let targetElbowR = -0.18;
    let targetElbowLZ = 0;
    let targetElbowRZ = 0;

    let desiredMood = 'focused';
    let dampRate = 14;
    let directBodyRotX = null;

    if (player.headerTimer > 0) {
      // Jumping Header / Volley
      dampRate = 20;
      const u = 1 - Math.min(1, player.headerTimer / 0.40);
      const jumpArc = Math.sin(u * Math.PI);
      targetBodyY = jumpArc * 0.62;
      if (u < 0.44) {
        const k = u / 0.44;
        targetTorsoRotX = -0.34 * k;
        targetHeadRotX = -0.36 * k;
        targetArmL = -0.85 * k;
        targetArmR = -0.85 * k;
        targetArmLZ = 0.88 * k + 0.14;
        targetArmRZ = -0.88 * k - 0.14;
        targetElbowL = -0.55;
        targetElbowR = -0.55;
        targetLegL = -0.32 * k;
        targetLegR = -0.25 * k;
        targetKneeL = 0.92 * k;
        targetKneeR = 0.86 * k;
      } else {
        const snap = Math.sin(((u - 0.44) / 0.56) * Math.PI);
        targetTorsoRotX = 0.42 * snap;
        targetHeadRotX = 0.54 * snap;
        targetArmL = 0.65 * snap;
        targetArmR = 0.65 * snap;
        targetArmLZ = 0.55;
        targetArmRZ = -0.55;
        targetKneeL = 0.65 * jumpArc;
        targetKneeR = 0.55 * jumpArc;
      }
    } else if (kickT > 0) {
      // Pass vs Finesse vs Power Shot scaled by kickPower
      dampRate = 22;
      const power = Math.max(0.3, Math.min(1.25, player.kickPower !== undefined ? player.kickPower : 0.7));
      const isFinesse = Boolean(player.kickFinesse || player.shotType === 'finesse');
      const isPass = power < 0.58 && !isFinesse;
      const duration = power > 0.82 ? 0.34 : 0.28;
      const u = 1 - Math.min(1, kickT / duration);

      if (u < 0.32) {
        // Cock-back windup
        const w = u / 0.32;
        targetLegR = (isPass ? 0.42 : 0.78 * power) * w;
        targetKneeR = (isPass ? 0.65 : 1.15 * power) * w;
        targetLegL = -0.18 * w;
        targetKneeL = 0.25 * w;
        targetTorsoRotY = 0.32 * power * w;
        targetTorsoRotX = 0.12 * power * w;
        targetArmL = -0.55 * w;
        targetArmLZ = 0.58 * w + 0.14;
        targetArmR = 0.45 * w;
        targetElbowL = -0.65;
        targetElbowR = -0.65;
      } else {
        // Strike & follow-through
        const p = Math.sin(((u - 0.32) / 0.68) * Math.PI);
        if (isPass) {
          targetLegR = -0.82 * p;
          targetKneeR = 0.38 * p;
          targetLegL = 0.24 * p;
          targetTorsoRotX = -0.07 * p;
          targetTorsoRotY = -0.22 * p;
          targetArmL = 0.48 * p;
          targetArmR = -0.42 * p;
          targetArmLZ = 0.38 * p + 0.14;
          targetArmRZ = -0.32 * p - 0.14;
        } else if (isFinesse) {
          targetLegR = -1.12 * p;
          targetKneeR = 0.42 * p;
          targetLegL = 0.34 * p;
          targetBodyRotZ = -0.22 * p;
          targetTorsoRotX = -0.14 * p;
          targetTorsoRotY = -0.45 * p;
          targetArmL = 0.72 * p;
          targetArmR = -0.62 * p;
          targetArmLZ = 0.75 * p + 0.14;
          targetArmRZ = -0.45 * p - 0.14;
        } else {
          targetLegR = -(0.96 + 0.44 * power) * p;
          targetKneeR = 0.30 * p;
          targetLegL = 0.42 * p;
          targetKneeL = 0.18 * p;
          targetBodyY = 0.06 * power * p;
          targetTorsoRotX = -0.22 * power * p;
          targetTorsoRotY = -0.46 * power * p;
          targetBodyRotZ = -0.12 * power * p;
          targetArmL = 0.86 * p;
          targetArmR = -0.82 * p;
          targetArmLZ = 0.68 * p + 0.14;
          targetArmRZ = -0.48 * p - 0.14;
          targetElbowL = -0.55;
          targetElbowR = -0.75;
        }
      }
    } else if (player.tackleTimer > 0) {
      // Low grass slide tackle
      dampRate = 20;
      targetBodyY = -0.44;
      targetBodyRotX = -0.80;
      targetBodyRotZ = 0.18;
      targetHeadRotX = 0.52;
      targetLegR = -1.28;
      targetKneeR = 0.08;
      targetLegL = 0.38;
      targetKneeL = 1.12;
      targetArmL = 0.72;
      targetArmLZ = 0.52;
      targetElbowL = -0.25;
      targetArmR = -0.68;
      targetArmRZ = -0.58;
      targetElbowR = -0.48;
    } else if (player.diveTimer > 0) {
      // Dramatic full-body horizontal GK diving save
      dampRate = 20;
      const dDir = player.diveDir || 1;
      targetBodyY = 0.52;
      targetBodyRotZ = dDir * 1.32;
      targetBodyRotX = 0.06;
      targetArmL = -2.92;
      targetArmR = -2.92;
      targetArmLZ = 0.22;
      targetArmRZ = -0.22;
      targetElbowL = -0.08;
      targetElbowR = -0.08;
      targetLegL = 0.26;
      targetLegR = -0.16;
      targetKneeL = 0.34;
      targetKneeR = 0.22;
    } else if (matchPhase === 'GOAL_CELEBRATION') {
      const isScoringTeam = player.team === player.celebratingTeam;
      const numOffset = (player.number || 0) * 0.55;
      const t = tClock * 8.2 + numOffset;

      if (isScoringTeam) {
        desiredMood = 'joy';
        const rawStyle = player.celebrationStyle || celebrationStyle || 'grito';

        if (rawStyle === 'knee_slide') {
          dampRate = 14;
          targetBodyY = -0.34;
          targetBodyRotX = -0.08;
          targetTorsoRotX = -0.22;
          targetHeadRotX = -0.26;
          targetLegL = -0.10;
          targetLegR = -0.10;
          targetKneeL = 1.45;
          targetKneeR = 1.45;
          targetArmL = -1.25 + Math.sin(t * 0.7) * 0.16;
          targetArmR = -1.25 + Math.sin(t * 0.7) * 0.16;
          targetArmLZ = 1.15;
          targetArmRZ = -1.15;
          targetElbowL = -0.24;
          targetElbowR = -0.24;
        } else if (rawStyle === 'airplane') {
          dampRate = 16;
          const rs = Math.sin(tClock * 11.5 + numOffset);
          targetBodyY = Math.abs(rs) * 0.10;
          targetBodyRotZ = Math.sin(tClock * 3.2 + numOffset * 0.25) * 0.32;
          targetTorsoRotX = 0.22;
          targetHeadRotX = -0.16;
          targetLegL = rs * 0.82;
          targetLegR = -rs * 0.82;
          targetKneeL = Math.max(0, -rs) * 0.95;
          targetKneeR = Math.max(0, rs) * 0.95;
          targetArmL = -0.05;
          targetArmR = -0.05;
          targetArmLZ = 1.48;
          targetArmRZ = -1.48;
          targetElbowL = -0.06;
          targetElbowR = -0.06;
        } else if (rawStyle === 'dance') {
          dampRate = 16;
          // Synchronized squad groove
          const syncT = tClock * 7.8;
          const sway = Math.sin(syncT * 0.5);
          const beat = Math.sin(syncT);
          targetBodyY = Math.abs(beat) * 0.22;
          targetBodyRotZ = sway * 0.20;
          targetTorsoRotY = sway * 0.34;
          targetHeadRotY = -sway * 0.22;
          targetLegL = -0.18 - Math.max(0, beat) * 0.24;
          targetLegR = -0.18 - Math.max(0, -beat) * 0.24;
          targetKneeL = 0.32 + Math.max(0, beat) * 0.48;
          targetKneeR = 0.32 + Math.max(0, -beat) * 0.48;
          targetArmL = -1.75 + beat * 0.65;
          targetArmR = -1.75 - beat * 0.65;
          targetArmLZ = 0.56;
          targetArmRZ = -0.56;
          targetElbowL = -1.12;
          targetElbowR = -1.12;
        } else if (rawStyle === 'orchestra') {
          dampRate = 13;
          const orchT = tClock * 6.0 + numOffset * 0.25;
          targetBodyY = Math.abs(Math.sin(orchT)) * 0.14;
          targetTorsoRotX = -0.08 + Math.sin(orchT) * 0.08;
          targetTorsoRotY = Math.sin(orchT * 0.5) * 0.28;
          targetHeadRotY = Math.sin(orchT * 0.5) * 0.40;
          targetHeadRotX = -0.18;
          targetArmL = -1.95 + Math.sin(orchT * 1.2) * 0.62;
          targetArmR = -1.95 + Math.cos(orchT * 1.2) * 0.62;
          targetArmLZ = 0.66 + Math.sin(orchT * 0.6) * 0.24;
          targetArmRZ = -0.66 - Math.cos(orchT * 0.6) * 0.24;
          targetElbowL = -0.42;
          targetElbowR = -0.42;
        } else if (rawStyle === 'backflip') {
          dampRate = 20;
          const cycle = ((tClock + (player.number || 0) * 0.11) % 1.9) / 1.9;
          if (cycle < 0.16) {
            // Explosive crouch launch
            const c = cycle / 0.16;
            targetBodyY = -0.22 * c;
            targetTorsoRotX = 0.36 * c;
            targetLegL = -0.45 * c;
            targetLegR = -0.45 * c;
            targetKneeL = 0.96 * c;
            targetKneeR = 0.96 * c;
            targetArmL = 0.85 * c;
            targetArmR = 0.85 * c;
          } else if (cycle < 0.72) {
            // Airborne full 360-degree tucked flip
            const airU = (cycle - 0.16) / 0.56;
            targetBodyY = Math.sin(airU * Math.PI) * 1.15;
            directBodyRotX = -airU * Math.PI * 2;
            targetLegL = -0.95;
            targetLegR = -0.95;
            targetKneeL = 1.65;
            targetKneeR = 1.65;
            targetArmL = -1.45;
            targetArmR = -1.45;
            targetElbowL = -1.25;
            targetElbowR = -1.25;
          } else {
            // Heroic landing into double fist-pump
            const landU = (cycle - 0.72) / 0.28;
            targetBodyY = Math.sin(landU * Math.PI) * 0.12;
            directBodyRotX = 0;
            targetTorsoRotX = -0.14;
            targetHeadRotX = -0.25;
            targetArmL = -2.68;
            targetArmR = -2.68;
            targetArmLZ = 0.56;
            targetArmRZ = -0.56;
            targetElbowL = -0.52;
            targetElbowR = -0.52;
          }
        } else if (rawStyle === 'corner' || rawStyle === 'bench' || rawStyle === 'corner_flag' || rawStyle === 'bench_rush') {
          dampRate = 16;
          const rs = Math.sin(tClock * 11.2 + numOffset);
          targetBodyY = Math.abs(rs) * 0.15;
          targetTorsoRotX = 0.10;
          targetHeadRotX = -0.18;
          targetLegL = rs * 0.80;
          targetLegR = -rs * 0.80;
          targetKneeL = Math.max(0, -rs) * 0.92;
          targetKneeR = Math.max(0, rs) * 0.92;
          targetArmL = -2.18 + Math.sin(t * 1.15) * 0.55;
          targetArmR = -2.28 - Math.sin(t * 1.15) * 0.55;
          targetArmLZ = 0.92;
          targetArmRZ = -0.92;
          targetElbowL = -0.42;
          targetElbowR = -0.42;
        } else {
          // Default 'grito': heroic leaps, double fist-pumps skyward, head thrown back shouting
          dampRate = 16;
          const leap = Math.abs(Math.sin(t * 0.92));
          targetBodyY = leap * 0.44;
          targetTorsoRotX = -0.18;
          targetHeadRotX = -0.34;
          targetArmL = -2.75 + Math.sin(t * 1.84) * 0.28;
          targetArmR = -2.75 + Math.sin(t * 1.84) * 0.28;
          targetArmLZ = 0.54;
          targetArmRZ = -0.54;
          targetElbowL = -0.45;
          targetElbowR = -0.45;
          targetLegL = Math.sin(t * 0.92) * 0.34;
          targetLegR = -Math.sin(t * 0.92) * 0.34;
          targetKneeL = leap * 0.55;
          targetKneeR = leap * 0.55;
        }
      } else {
        // Rival Goal Concession
        desiredMood = 'shock';
        dampRate = 11;
        if (player.role === 'GK') {
          // Rival GK drops to knees clutching head in disbelief
          targetBodyY = -0.36;
          targetLegL = -0.08;
          targetLegR = -0.08;
          targetKneeL = 1.52;
          targetKneeR = 1.52;
          targetTorsoRotX = 0.28;
          targetHeadRotX = 0.36;
          targetArmL = -2.35;
          targetArmR = -2.35;
          targetArmLZ = 0.38;
          targetArmRZ = -0.38;
          targetElbowL = -1.82;
          targetElbowR = -1.82;
          targetElbowLZ = -0.52;
          targetElbowRZ = 0.52;
        } else if ((player.number || 0) % 2 === 0) {
          // Slumped hands clutching head
          targetTorsoRotX = 0.24;
          targetHeadRotX = 0.34;
          targetArmL = -2.35;
          targetArmR = -2.35;
          targetArmLZ = 0.38;
          targetArmRZ = -0.38;
          targetElbowL = -1.80;
          targetElbowR = -1.80;
          targetElbowLZ = -0.52;
          targetElbowRZ = 0.52;
        } else {
          // Slumped hands on hips
          targetTorsoRotX = 0.18;
          targetHeadRotX = 0.32;
          targetArmL = -0.15;
          targetArmR = -0.15;
          targetArmLZ = 0.58;
          targetArmRZ = -0.58;
          targetElbowL = -0.95;
          targetElbowR = -0.95;
          targetElbowLZ = -0.65;
          targetElbowRZ = 0.65;
        }
      }
    } else if (player.frustratedTimer > 0) {
      // Frustrated (missed shot / post hit / conceded chance)
      player.frustratedTimer = Math.max(0, player.frustratedTimer - safeDt);
      desiredMood = 'shock';
      dampRate = 13;
      targetTorsoRotX = 0.24;
      targetHeadRotX = 0.35;
      targetHeadRotY = Math.sin(tClock * 7.5 + (player.number || 0)) * 0.22;
      targetArmL = -2.35;
      targetArmR = -2.35;
      targetArmLZ = 0.38;
      targetArmRZ = -0.38;
      targetElbowL = -1.82;
      targetElbowR = -1.82;
      targetElbowLZ = -0.52;
      targetElbowRZ = 0.52;
    } else if (player.saveCelebrateTimer > 0) {
      // GK Save Celebration
      player.saveCelebrateTimer = Math.max(0, player.saveCelebrateTimer - safeDt);
      desiredMood = 'joy';
      dampRate = 16;
      targetBodyY = Math.abs(Math.sin(tClock * 10.5)) * 0.26;
      targetTorsoRotX = -0.12;
      targetHeadRotX = -0.22;
      targetArmR = -2.65;
      targetArmRZ = -0.45;
      targetElbowR = -0.55;
      targetArmL = -2.18;
      targetArmLZ = 0.42;
      targetElbowL = -0.72;
    } else if (player.dribbleTimer > 0) {
      // Quick low-center dribble feint swerve/shimmy
      dampRate = 20;
      const shimmy = Math.sin(tClock * 22 + (player.number || 0));
      const feintDir = player.dribbleDir || (shimmy >= 0 ? 1 : -1);
      player.animPhase = (player.animPhase || 0) + safeDt * (10.8 + speed * 1.35);
      const s = Math.sin(player.animPhase);
      targetBodyY = -0.08 + Math.abs(s) * 0.05;
      targetBodyRotZ = feintDir * 0.24 + shimmy * 0.14;
      targetTorsoRotX = 0.26;
      targetTorsoRotY = -shimmy * 0.30;
      targetLegL = s * 0.62;
      targetLegR = -s * 0.62;
      targetKneeL = 0.32 + Math.max(0, -s) * 0.68;
      targetKneeR = 0.32 + Math.max(0, s) * 0.68;
      targetArmL = -0.35 - s * 0.35;
      targetArmR = -0.35 + s * 0.35;
      targetArmLZ = 0.62;
      targetArmRZ = -0.62;
      targetElbowL = -0.82;
      targetElbowR = -0.82;
    } else if (player.callingPassTimer > 0) {
      // Calling for pass (waving right arm overhead while running or ready)
      player.callingPassTimer = Math.max(0, player.callingPassTimer - safeDt);
      dampRate = 15;
      const wave = Math.sin(tClock * 14 + (player.number || 0));
      targetArmR = -2.75 + wave * 0.16;
      targetArmRZ = -0.36 + wave * 0.22;
      targetElbowR = -0.26;
      if (speed > 0.38) {
        player.animPhase = (player.animPhase || 0) + safeDt * (5.0 + speed * 1.22);
        const s = Math.sin(player.animPhase);
        const amp = Math.min(0.86, 0.26 + speed * 0.06);
        targetLegL = s * amp;
        targetLegR = -s * amp;
        targetKneeL = Math.max(0, -s) * (amp * 1.05 + 0.10);
        targetKneeR = Math.max(0, s) * (amp * 1.05 + 0.10);
        targetArmL = -s * amp * 0.72;
        targetElbowL = -0.72;
        targetBodyY = Math.abs(s) * 0.075;
        targetBodyRotZ = turnBank;
        targetTorsoRotX = Math.min(0.22, speed * 0.022);
      } else {
        targetBodyY = Math.abs(wave) * 0.04;
      }
    } else if (speed > 0.35) {
      // Progressive Walk / Jog / Sprint locomotion
      dampRate = 16;
      const runIntensity = Math.min(1, (speed - 0.35) / 8.5);
      player.animPhase = (player.animPhase || 0) + safeDt * (4.6 + speed * 1.24);
      const s = Math.sin(player.animPhase);
      const amp = 0.24 + runIntensity * 0.72;

      targetLegL = s * amp;
      targetLegR = -s * amp;
      targetKneeL = Math.max(0, -s) * (amp * 1.15 + 0.12);
      targetKneeR = Math.max(0, s) * (amp * 1.15 + 0.12);

      targetArmL = -s * amp * 0.85;
      targetArmR = s * amp * 0.85;
      targetElbowL = -(0.38 + runIntensity * 0.70);
      targetElbowR = -(0.38 + runIntensity * 0.70);
      targetArmLZ = 0.14 + runIntensity * 0.08;
      targetArmRZ = -0.14 - runIntensity * 0.08;

      targetBodyY = Math.abs(s) * (0.028 + runIntensity * 0.068);
      targetBodyRotZ = turnBank;
      targetTorsoRotX = 0.05 + runIntensity * 0.24;
      targetTorsoRotY = -s * amp * 0.18;
      targetHeadRotX = -0.08 * runIntensity;
    } else {
      // Idle & Breathing (with alert crouched stance for Goalkeepers)
      dampRate = 10;
      const breath = Math.sin(tClock * 2.5 + (player.number || 0) * 0.7);
      if (player.role === 'GK') {
        targetBodyY = -0.05 + breath * 0.015;
        targetTorsoRotX = 0.15 + breath * 0.015;
        targetHeadRotY = Math.sin(tClock * 1.1 + (player.number || 0)) * 0.22;
        targetLegL = -0.14;
        targetLegR = -0.14;
        targetKneeL = 0.28;
        targetKneeR = 0.28;
        targetArmL = -0.66;
        targetArmR = -0.66;
        targetArmLZ = 0.44 + breath * 0.02;
        targetArmRZ = -0.44 - breath * 0.02;
        targetElbowL = -0.86;
        targetElbowR = -0.86;
      } else {
        targetBodyY = breath * 0.016;
        targetBodyRotZ = Math.sin(tClock * 1.15 + (player.number || 0)) * 0.024;
        targetTorsoRotX = 0.03 + breath * 0.014;
        targetHeadRotY = Math.sin(tClock * 0.85 + (player.number || 0) * 1.7) * 0.22;
        targetHeadRotX = 0.02;
        targetArmLZ = 0.15 + breath * 0.025;
        targetArmRZ = -0.15 - breath * 0.025;
        targetElbowL = -0.22;
        targetElbowR = -0.22;
      }
    }

    // Update facial expression only when changed (zero allocation)
    if (fig.setExpression) {
      fig.setExpression(desiredMood);
    }

    // Frame-rate independent smooth exponential damping
    const blend = 1 - Math.exp(-dampRate * safeDt);

    parts.bodyPivot.position.y += (targetBodyY - parts.bodyPivot.position.y) * blend;
    if (directBodyRotX !== null) {
      parts.bodyPivot.rotation.x = directBodyRotX;
    } else {
      if (parts.bodyPivot.rotation.x > Math.PI || parts.bodyPivot.rotation.x < -Math.PI) {
        parts.bodyPivot.rotation.x = ((parts.bodyPivot.rotation.x + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      }
      parts.bodyPivot.rotation.x += (targetBodyRotX - parts.bodyPivot.rotation.x) * blend;
    }
    parts.bodyPivot.rotation.z += (targetBodyRotZ - parts.bodyPivot.rotation.z) * blend;

    if (parts.torsoPivot) {
      parts.torsoPivot.rotation.x += (targetTorsoRotX - parts.torsoPivot.rotation.x) * blend;
      parts.torsoPivot.rotation.y += (targetTorsoRotY - parts.torsoPivot.rotation.y) * blend;
    }

    parts.headPivot.rotation.x += (targetHeadRotX - parts.headPivot.rotation.x) * blend;
    parts.headPivot.rotation.y += (targetHeadRotY - parts.headPivot.rotation.y) * blend;

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
    parts.elbowLPivot.rotation.z += (targetElbowLZ - parts.elbowLPivot.rotation.z) * blend;
    parts.elbowRPivot.rotation.z += (targetElbowRZ - parts.elbowRPivot.rotation.z) * blend;

    // Subtle shadow scaling when jumping / diving
    if (parts.shadow) {
      const airLift = Math.max(0, parts.bodyPivot.position.y);
      const sScale = Math.max(0.55, 1.0 - airLift * 0.34);
      parts.shadow.scale.set(sScale, sScale, 1);
    }
  }

  /**
   * Disposes per-player owned GPU materials without touching shared geometries or cached textures.
   */
  function disposePlayerFigure(fig) {
    if (!fig) return;
    if (Array.isArray(fig._ownedMaterials)) {
      for (let i = 0; i < fig._ownedMaterials.length; i++) {
        const mat = fig._ownedMaterials[i];
        if (mat && typeof mat.dispose === 'function') {
          mat.dispose();
        }
      }
      fig._ownedMaterials.length = 0;
    }
    if (fig.group && fig.group.parent) {
      fig.group.parent.remove(fig.group);
    }
    fig._faceMat = null;
  }

  global.PlayerRenderer = { createPlayerFigure, updatePose, disposePlayerFigure };
})(window);
