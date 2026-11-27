/**
 * StadiumBuilder — Estadio de los Cerros (Escenario A Independiente)
 * Balanced ACESFilmic lighting, instanced bowl/fence/mountains, realistic turf,
 * open-mouth 5-face goal nets, scrolling LED boards, sideline life,
 * articulated GPU crowd geometry & sculpted 3D Wolf Mascot.
 */
(function (global) {
  'use strict';

  const stadiumRefs = {
    scene: null,
    hemiLight: null,
    sunLight: null,
    floodlightSpotlights: [],
    floodlightBulbs: [],
    floodlightBeams: [],
    pressWindowMats: [],
    skyDomeMesh: null,
    scoreboardCanvas: null,
    scoreboardCtx: null,
    scoreboardTexture: null,
    ledBoardTexture: null,
    bowlCrowdMesh: null,
    plateaCrowdMesh: null,
    crowdFlags: [],
    cornerFlags: [],
    benchPlayers: [],
    photographers: [],
    assistantRefs: [],
    highwayCars: [],
    confettiSystem: null,
    smokeSystem: null,
    goalNets: [],
    wolfMascot: null
  };

  let scene, hemiLight, sunLight;
  const floodlightSpotlights = [];
  const floodlightBulbs = [];
  const floodlightBeams = [];
  const pressWindowMats = [];
  let skyDomeMesh = null;
  let scoreboardCanvas, scoreboardCtx, scoreboardTexture;
  let ledBoardTexture = null;
  let bowlCrowdMesh = null;
  let plateaCrowdMesh = null;
  const crowdFlags = [];
  const cornerFlags = [];
  const benchPlayers = [];
  const photographers = [];
  const assistantRefs = [];
  const highwayCars = [];
  let confettiSystem = null;
  let smokeSystem = null;
  const goalNets = [];
  let wolfMascot = null;
  let sharedGoalNetTexture = null;
  let sharedCornerFlagTexture = null;
  let sharedFlashTexture = null;

  const appState = {
    scoreHome: 0,
    scoreAway: 0,
    matchSeconds: 0,
    awayShort: 'GNF',
    awayName: 'GOLFO NUEVO FC',
    awayHex: '#facc15',
    halfLabel: '1°T',
    goalTeam: 'home',
    skyMode: 'sunset'
  };

  const STADIUM_SECTORS = {
    platea_alta: {
      id: 'platea_alta',
      keyNum: '1',
      name: 'Platea Alta "Los Cerros"',
      shortName: 'Platea Alta',
      badge: 'OESTE • SEGUNDA BANDEJA',
      rows: {
        low:  { x: -49.5, y: 12.2, zSpan: 36 },
        mid:  { x: -53.5, y: 15.6, zSpan: 36 },
        high: { x: -57.2, y: 19.0, zSpan: 36 }
      },
      defaultLook: { x: 4, y: 1.0, z: 0 }
    },
    platea_baja: {
      id: 'platea_baja',
      keyNum: '2',
      name: 'Platea Baja "Los Cerros"',
      shortName: 'Platea Baja',
      badge: 'OESTE • PRIMERA BANDEJA',
      rows: {
        low:  { x: -41.0, y: 3.4, zSpan: 36 },
        mid:  { x: -44.2, y: 5.8, zSpan: 36 },
        high: { x: -47.4, y: 8.3, zSpan: 36 }
      },
      defaultLook: { x: 0, y: 1.0, z: 0 }
    },
    preferencial: {
      id: 'preferencial',
      keyNum: '3',
      name: 'Tribuna Preferencial Este',
      shortName: 'Preferencial',
      badge: 'LATERAL ESTE',
      rows: {
        low:  { x: 43.0, y: 3.3, zSpan: 38, curveX: -4.0 },
        mid:  { x: 47.5, y: 6.8, zSpan: 38, curveX: -4.2 },
        high: { x: 52.0, y: 10.4, zSpan: 38, curveX: -4.5 }
      },
      defaultLook: { x: -8, y: 2.0, z: 0 }
    },
    popular_norte: {
      id: 'popular_norte',
      keyNum: '4',
      name: 'Popular Norte',
      shortName: 'Popular Norte',
      badge: 'CABECERA NORTE',
      rows: {
        low:  { z: -60.5, y: 3.4, xSpan: 28, curveZ: 5.5 },
        mid:  { z: -65.5, y: 7.0, xSpan: 31, curveZ: 6.0 },
        high: { z: -70.5, y: 10.6, xSpan: 34, curveZ: 6.5 }
      },
      defaultLook: { x: 0, y: 1.2, z: 5 }
    },
    popular_sur: {
      id: 'popular_sur',
      keyNum: '5',
      name: 'Popular Sur',
      shortName: 'Popular Sur',
      badge: 'CABECERA SUR',
      rows: {
        low:  { z: 60.5, y: 3.4, xSpan: 28, curveZ: -5.5 },
        mid:  { z: 65.5, y: 7.0, xSpan: 31, curveZ: -6.0 },
        high: { z: 70.5, y: 10.6, xSpan: 34, curveZ: -6.5 }
      },
      defaultLook: { x: 0, y: 1.5, z: -8 }
    },
    codo_noroeste: {
      id: 'codo_noroeste',
      keyNum: '6',
      name: 'Codos Diagonales (Noroeste / Suroeste)',
      shortName: 'Codos Esquina (45°)',
      badge: 'CURVAS DE TRANSICIÓN • VISTA 45°',
      priceMayor: 35000,
      priceJubilado: 25000,
      priceMenor: 25000,
      accessGate: 'Accesos Humahuaca / La Bandera',
      description: 'Ubicación en las curvas que conectan las cabeceras con los laterales. Brinda una diagonal de 45° muy atractiva para seguir ataques en el área.',
      proTip: 'Usa el control lateral para recorrer la curva diagonal completa del codo.',
      visibilityScore: 87,
      visibilityLabel: '87% (Perspectiva diagonal tipo córner)',
      atmosphereScore: 91,
      atmosphereLabel: '91% (Muy cerca del aliento de Popular)',
      rows: {
        low:  { x: -34.0, z: -48.0, y: 3.8, diagSpan: 14 },
        mid:  { x: -37.5, z: -52.5, y: 7.2, diagSpan: 15 },
        high: { x: -41.0, z: -56.5, y: 10.5, diagSpan: 16 }
      },
      defaultLook: { x: 2, y: 1.0, z: 4 }
    },
    palcos_vip: {
      id: 'palcos_vip',
      keyNum: '7',
      name: 'Palcos Oficiales y Cabinas de Prensa',
      shortName: 'Palcos VIP / Prensa',
      badge: 'EDIFICIO SUPERIOR • TRIBUNA HISTÓRICA RENOVADA',
      priceMayor: 75000,
      priceJubilado: 60000,
      priceMenor: 40000,
      accessGate: 'Calle Santa Bárbara (Acceso Central y Ascensores)',
      description: 'Vista panorámica del Estadio de los Cerros desde el edificio de 4 niveles sobre la Platea Alta. Es el punto de vista de las cámaras de TV y transmisiones.',
      proTip: 'Cambia a Fila Alta para subir al 4° nivel central (Cabina Oficial de Transmisión).',
      visibilityScore: 100,
      visibilityLabel: '100% (Dominio visual absoluto de 360°)',
      atmosphereScore: 76,
      atmosphereLabel: '76% (Confort ejecutivo bajo techo)',
      rows: {
        low:  { x: -59.5, y: 21.8, zSpan: 34 },
        mid:  { x: -59.5, y: 24.8, zSpan: 34 },
        high: { x: -59.5, y: 28.2, zSpan: 14 }
      },
      defaultLook: { x: 6, y: 0.0, z: 0 }
    },
    drone_aereo: {
      id: 'drone_aereo',
      keyNum: '8',
      name: 'Vista Aérea / Drone Libre 360°',
      shortName: 'Drone Aéreo 360°',
      badge: 'VISTA EXTERIOR E INTERIOR COMPLETA',
      priceMayor: 50000,
      priceJubilado: 40000,
      priceMenor: 25000,
      accessGate: 'Recorrido virtual aéreo sobre Av. El Éxodo y Santa Bárbara',
      description: 'Recorre la arquitectura completa del Estadio de los Cerros, las torres de iluminación y los cerros del norte.',
      proTip: 'Mueve el control lateral para orbitar suavemente alrededor de todo el estadio.',
      visibilityScore: 100,
      visibilityLabel: '100% (Vista panorámica de pájaro)',
      atmosphereScore: 95,
      atmosphereLabel: '95% (Postal completa de La Tacita de Plata)',
      rows: {
        low:  { radius: 78, y: 34 },
        mid:  { radius: 105, y: 52 },
        high: { radius: 135, y: 74 }
      },
      defaultLook: { x: -10, y: 4, z: 0 }
    }
  };

  // ============================================================================
  // HELPER: MERGE COLORED GEOMETRIES (Three.js r128 compatible)
  // ============================================================================
  function mergeColoredParts(parts) {
    let totalVerts = 0;
    const processed = parts.map((p) => {
      const ng = p.g.index ? p.g.toNonIndexed() : p.g.clone();
      if (p.rx) ng.rotateX(p.rx);
      if (p.ry) ng.rotateY(p.ry);
      if (p.rz) ng.rotateZ(p.rz);
      if (p.sx || p.sy || p.sz) ng.scale(p.sx || 1, p.sy || 1, p.sz || 1);
      if (p.x || p.y || p.z) ng.translate(p.x || 0, p.y || 0, p.z || 0);
      if (!ng.attributes.normal) ng.computeVertexNormals();
      totalVerts += ng.attributes.position.count;
      if (p.g !== ng) p.g.dispose();
      return { geo: ng, color: new THREE.Color(p.color !== undefined ? p.color : 0xffffff) };
    });

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const colors = new Float32Array(totalVerts * 3);
    let offset = 0;
    processed.forEach(({ geo, color }) => {
      const posArr = geo.attributes.position.array;
      const normArr = geo.attributes.normal.array;
      const count = geo.attributes.position.count;
      positions.set(posArr, offset * 3);
      normals.set(normArr, offset * 3);
      for (let i = 0; i < count; i++) {
        colors[(offset + i) * 3] = color.r;
        colors[(offset + i) * 3 + 1] = color.g;
        colors[(offset + i) * 3 + 2] = color.b;
      }
      offset += count;
      geo.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return merged;
  }

  // Deterministic PRNG for consistent procedural textures
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ============================================================================
  // PROCEDURAL TEXTURES: SKY, MOSAICS, TURF, LED, GOAL NET, SMOKE, FLAGS
  // ============================================================================
  function createSkyDomeTexture(mode) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const rand = makeRng(mode === 'day' ? 101 : mode === 'sunset' ? 202 : 303);

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (mode === 'day') {
      grad.addColorStop(0.0, '#1e4fa8');
      grad.addColorStop(0.28, '#3b82d6');
      grad.addColorStop(0.56, '#7cb8f0');
      grad.addColorStop(0.76, '#c2e2fc');
      grad.addColorStop(0.90, '#e0effb');
      grad.addColorStop(1.0, '#b5d3ed');
    } else if (mode === 'sunset') {
      grad.addColorStop(0.0, '#17143b');
      grad.addColorStop(0.22, '#3b1d6e');
      grad.addColorStop(0.42, '#7d2057');
      grad.addColorStop(0.58, '#c9466e');
      grad.addColorStop(0.72, '#f2845c');
      grad.addColorStop(0.84, '#f8b978');
      grad.addColorStop(1.0, '#2c1934');
    } else {
      grad.addColorStop(0.0, '#020612');
      grad.addColorStop(0.36, '#071329');
      grad.addColorStop(0.68, '#0f2342');
      grad.addColorStop(0.86, '#15294a');
      grad.addColorStop(1.0, '#050b16');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Atmospheric horizon sun / city glow
    if (mode === 'sunset') {
      const sunGlow = ctx.createRadialGradient(256, 368, 12, 256, 368, 280);
      sunGlow.addColorStop(0.0, 'rgba(255, 232, 178, 0.72)');
      sunGlow.addColorStop(0.28, 'rgba(251, 146, 60, 0.42)');
      sunGlow.addColorStop(0.62, 'rgba(244, 114, 182, 0.14)');
      sunGlow.addColorStop(1.0, 'rgba(244, 114, 182, 0.0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 120, 1024, 392);
    } else if (mode === 'day') {
      const sunGlow = ctx.createRadialGradient(320, 180, 10, 320, 180, 210);
      sunGlow.addColorStop(0.0, 'rgba(255, 250, 232, 0.65)');
      sunGlow.addColorStop(0.45, 'rgba(254, 243, 199, 0.18)');
      sunGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, 1024, 400);
    } else {
      // Subtle horizon stadium & valley glow at night
      const haze = ctx.createLinearGradient(0, 320, 0, 445);
      haze.addColorStop(0.0, 'rgba(56, 189, 248, 0.0)');
      haze.addColorStop(0.55, 'rgba(30, 64, 118, 0.18)');
      haze.addColorStop(1.0, 'rgba(15, 23, 42, 0.0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 320, 1024, 125);
    }

    // Stars (night) or wispy layered Andean clouds (day/sunset)
    if (mode === 'night') {
      for (let i = 0; i < 420; i++) {
        const sx = rand() * 1024;
        const sy = rand() * 310;
        const brightness = 0.35 + rand() * 0.65;
        const r = rand() > 0.92 ? 1.55 : (0.45 + rand() * 0.95);
        const warm = rand() > 0.78;
        ctx.fillStyle = warm
          ? `rgba(254, 240, 199, ${brightness.toFixed(2)})`
          : `rgba(224, 242, 254, ${brightness.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        if (r > 1.35) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(brightness * 0.45).toFixed(2)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy);
          ctx.lineTo(sx + 4, sy);
          ctx.moveTo(sx, sy - 4);
          ctx.lineTo(sx, sy + 4);
          ctx.stroke();
        }
      }
    } else {
      for (let c = 0; c < 52; c++) {
        const cx = rand() * 1024;
        const cy = 78 + rand() * 215;
        const cw = 70 + rand() * 175;
        const ch = 10 + rand() * 22;
        const cloudGrad = ctx.createRadialGradient(cx, cy, cw * 0.08, cx, cy, cw);
        if (mode === 'sunset') {
          cloudGrad.addColorStop(0.0, 'rgba(255, 206, 174, 0.30)');
          cloudGrad.addColorStop(0.45, 'rgba(244, 152, 184, 0.16)');
          cloudGrad.addColorStop(1.0, 'rgba(244, 152, 184, 0.0)');
        } else {
          cloudGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.34)');
          cloudGrad.addColorStop(0.5, 'rgba(241, 248, 255, 0.16)');
          cloudGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        }
        ctx.fillStyle = cloudGrad;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1.0, ch / cw);
        ctx.beginPath();
        ctx.arc(0, 0, cw, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createPlateaMosaicTexture(textLeft, textRight, isUpperTier) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 1024, 256);

    const blocks = [
      { x: 18, w: 222, type: 'wing' },
      { x: 268, w: 224, type: 'leftCenter', text: textLeft },
      { x: 532, w: 224, type: 'rightCenter', text: textRight },
      { x: 782, w: 222, type: 'wing' }
    ];

    // Concrete stairways
    ctx.fillStyle = '#64748b';
    ctx.fillRect(240, 0, 28, 256);
    ctx.fillRect(492, 0, 40, 256);
    ctx.fillRect(756, 0, 26, 256);

    blocks.forEach((b) => {
      if (b.type === 'wing') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(b.x, 8, b.w, 240);
        for (let r = 12; r < 245; r += 12) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(b.x, r, b.w, 3);
          ctx.fillStyle = '#dce4ee';
          for (let c = b.x + 4; c < b.x + b.w - 4; c += 8) {
            ctx.fillRect(c, r + 4, 6, 6);
          }
        }
      } else if (isUpperTier) {
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(b.x, 8, b.w, 240);
        ctx.strokeStyle = '#dce4ee';
        ctx.lineWidth = 8;
        ctx.strokeRect(b.x + 8, 16, b.w - 16, 224);
        ctx.fillStyle = '#dce4ee';
        ctx.fillRect(b.x + b.w / 2 - 4, 12, 8, 232);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '900 138px "Barlow Condensed", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const chars = b.text.split(' ');
        ctx.fillText(chars[0] || '', b.x + b.w * 0.26, 134);
        ctx.fillText(chars[1] || '', b.x + b.w * 0.74, 134);
      } else {
        const numStripes = 16;
        const stripeW = b.w / numStripes;
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#0284c7' : '#dce4ee';
          ctx.fillRect(b.x + i * stripeW, 8, stripeW + 0.6, 240);
        }
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 132px "Barlow Condensed", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#dce4ee';
        ctx.lineWidth = 4;
        ctx.strokeText(b.text, b.x + b.w * 0.5, 136);
        ctx.fillText(b.text, b.x + b.w * 0.5, 136);
      }

      // Crisp step riser shadows & seat divisions
      for (let r = 10; r < 246; r += 10) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
        ctx.fillRect(b.x, r, b.w, 2.5);
      }
      for (let c = b.x; c < b.x + b.w; c += 7) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
        ctx.fillRect(c, 8, 1.5, 240);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }

  function createPitchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d');

    // Natural deep emerald surround turf
    ctx.fillStyle = '#1e5c31';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padX = 76;
    const padZ = 76;
    const fieldW = canvas.width - padX * 2;
    const fieldH = canvas.height - padZ * 2;
    const stripes = 18;
    const stripeH = fieldH / stripes;

    // Alternating natural stadium grass mowing stripes
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2e7d44' : '#256d3b';
      ctx.fillRect(padX, padZ + i * stripeH, fieldW, stripeH + 1);
    }

    // Subtle cross-mowing sheen
    for (let j = 0; j < 10; j++) {
      ctx.fillStyle = j % 2 === 0 ? 'rgba(255,255,255,0.024)' : 'rgba(0,0,0,0.028)';
      ctx.fillRect(padX + j * (fieldW / 10), padZ, fieldW / 10, fieldH);
    }

    // Subtle organic grass-blade grain / speckle noise pass
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let seed = 133791;
    for (let i = 0; i < data.length; i += 4) {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      const n = ((seed >>> 24) / 255 - 0.5) * 14;
      data[i] = Math.max(0, Math.min(255, data[i] + n * 0.72));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n * 1.15));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n * 0.58));
    }
    ctx.putImageData(imgData, 0, 0);

    const midY = canvas.height / 2;
    const midX = canvas.width / 2;
    const penW = fieldW * 0.57;
    const penH = fieldH * 0.157;
    const goalAreaW = fieldW * 0.26;
    const goalAreaH = fieldH * 0.052;

    // Subtle turf wear patches in both 6-yard goalmouths and penalty spots
    const drawWear = (cx, cy, rx, ry, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      const wg = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx);
      wg.addColorStop(0.0, `rgba(122, 98, 60, ${alpha})`);
      wg.addColorStop(0.55, `rgba(98, 92, 54, ${(alpha * 0.55).toFixed(3)})`);
      wg.addColorStop(1.0, 'rgba(98, 92, 54, 0.0)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawWear(midX, padZ + goalAreaH * 0.48, goalAreaW * 0.42, goalAreaH * 0.75, 0.28);
    drawWear(midX, padZ + fieldH - goalAreaH * 0.48, goalAreaW * 0.42, goalAreaH * 0.75, 0.28);
    drawWear(midX, padZ + fieldH * 0.105, 22, 22, 0.22);
    drawWear(midX, padZ + fieldH - fieldH * 0.105, 22, 22, 0.22);
    drawWear(midX, midY, 26, 26, 0.15);

    // Crisp bright white field markings
    ctx.strokeStyle = 'rgba(248, 252, 255, 0.96)';
    ctx.lineWidth = 5;
    ctx.strokeRect(padX, padZ, fieldW, fieldH);

    ctx.beginPath();
    ctx.moveTo(padX, midY);
    ctx.lineTo(padX + fieldW, midY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(midX, midY, fieldW * 0.13, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f8fcff';
    ctx.beginPath();
    ctx.arc(midX, midY, 6, 0, Math.PI * 2);
    ctx.fill();

    // North penalty & 6-yard box
    ctx.strokeRect(midX - penW / 2, padZ, penW, penH);
    ctx.strokeRect(midX - goalAreaW / 2, padZ, goalAreaW, goalAreaH);
    ctx.beginPath();
    ctx.arc(midX, padZ + fieldH * 0.105, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(midX, padZ + fieldH * 0.105, fieldW * 0.13, 0.22 * Math.PI, 0.78 * Math.PI);
    ctx.stroke();

    // South penalty & 6-yard box
    ctx.strokeRect(midX - penW / 2, padZ + fieldH - penH, penW, penH);
    ctx.strokeRect(midX - goalAreaW / 2, padZ + fieldH - goalAreaH, goalAreaW, goalAreaH);
    ctx.beginPath();
    ctx.arc(midX, padZ + fieldH - fieldH * 0.105, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(midX, padZ + fieldH - fieldH * 0.105, fieldW * 0.13, 1.22 * Math.PI, 1.78 * Math.PI);
    ctx.stroke();

    // Corner arcs
    const cr = 18;
    ctx.beginPath(); ctx.arc(padX, padZ, cr, 0, Math.PI * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(padX + fieldW, padZ, cr, Math.PI * 0.5, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(padX, padZ + fieldH, cr, -Math.PI * 0.5, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(padX + fieldW, padZ + fieldH, cr, Math.PI, Math.PI * 1.5); ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }

  function createLedBoardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0.0, '#0284c7');
    grad.addColorStop(0.24, '#0c1a30');
    grad.addColorStop(0.50, '#0ea5e9');
    grad.addColorStop(0.76, '#0c1a30');
    grad.addColorStop(1.0, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 64);

    // Subtle LED scanline accents
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, 1024, 4);
    ctx.fillRect(0, 60, 1024, 4);

    const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
    const ticker = brand ? brand.ledTicker : 'PASIÓN DE TRIBUNA   •   ESTADIO DE LOS CERROS   •   SAN SALVADOR CELESTE   •   ';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 28px "Barlow Condensed", Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticker, 16, 33);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(3, 1);
    return tex;
  }

  function createSupporterBannerTexture(text, bgHex, textHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = textHex;
    ctx.fillRect(0, 0, 512, 10);
    ctx.fillRect(0, 86, 512, 10);
    ctx.font = '900 44px "Barlow Condensed", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 50);
    return new THREE.CanvasTexture(canvas);
  }

  function getGoalNetTexture() {
    if (sharedGoalNetTexture) return sharedGoalNetTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    // Crisp stadium diamond/square net cords with subtle knots
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.92)';
    ctx.lineWidth = 4.5;
    const step = 32;
    for (let i = 0; i <= 128; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    for (let y = 0; y <= 128; y += step) {
      for (let x = 0; x <= 128; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    sharedGoalNetTexture = tex;
    return tex;
  }

  function getCornerFlagTexture() {
    if (sharedCornerFlagTexture) return sharedCornerFlagTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 21, 128, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 16, 64);
    const tex = new THREE.CanvasTexture(canvas);
    sharedCornerFlagTexture = tex;
    return tex;
  }

  function createSoftSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    const puffs = [
      { x: 64, y: 64, r: 58, a: 0.72 },
      { x: 48, y: 56, r: 36, a: 0.38 },
      { x: 78, y: 68, r: 34, a: 0.34 },
      { x: 60, y: 46, r: 30, a: 0.30 }
    ];
    puffs.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
      g.addColorStop(0.0, `rgba(224, 242, 254, ${p.a})`);
      g.addColorStop(0.45, `rgba(125, 211, 252, ${(p.a * 0.52).toFixed(3)})`);
      g.addColorStop(0.78, `rgba(56, 189, 248, ${(p.a * 0.16).toFixed(3)})`);
      g.addColorStop(1.0, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    return new THREE.CanvasTexture(canvas);
  }

  function getCameraFlashTexture() {
    if (sharedFlashTexture) return sharedFlashTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.35, 'rgba(224, 242, 254, 0.65)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    sharedFlashTexture = new THREE.CanvasTexture(canvas);
    return sharedFlashTexture;
  }

  function createWolfJerseyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const stripes = 8;
    const sw = 128 / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#0ea5e9' : '#e2e8f0';
      ctx.fillRect(i * sw, 0, sw + 0.5, 128);
    }
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, 128, 12);
    ctx.fillRect(0, 114, 128, 14);
    return new THREE.CanvasTexture(canvas);
  }

  // ============================================================================
  // BUILD STADIUM WORLD
  // ============================================================================
  function buildSkyAndJujuyMountains() {
    const skyGeo = new THREE.SphereGeometry(560, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: null,
      side: THREE.BackSide,
      fog: false
    });
    skyDomeMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDomeMesh);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(540, 64),
      new THREE.MeshLambertMaterial({ color: 0x1a2621 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    scene.add(ground);

    // Ring of 48 Andean hills consolidated into 1 InstancedMesh
    const numPeaks = 48;
    const peakGeo = new THREE.ConeGeometry(1.0, 0.8, 7);
    const peakMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mountainInst = new THREE.InstancedMesh(peakGeo, peakMat, numPeaks);
    const dummy = new THREE.Object3D();
    const peakPalette = [
      new THREE.Color(0x2d2a44), // deep violet-slate
      new THREE.Color(0x3a3454), // Andean dusk slate
      new THREE.Color(0x4c3f49), // dusty purple-brown
      new THREE.Color(0x63443a), // warm terracotta ridge
      new THREE.Color(0x523c36), // ochre-brown slope
      new THREE.Color(0x283a34)  // northern valley pine
    ];

    for (let i = 0; i < numPeaks; i++) {
      const angle = (i / numPeaks) * Math.PI * 2;
      const dist = 296 + (i % 3) * 40;
      const height = 46 + Math.sin(i * 1.7) * 20 + Math.cos(i * 0.9) * 15;
      const radius = 64 + (i % 4) * 18;
      dummy.position.set(Math.cos(angle) * dist, height * 0.5 - 4, Math.sin(angle) * dist);
      dummy.rotation.set(0, i * 0.45, 0);
      dummy.scale.set(radius, height / 0.8, radius * (0.88 + (i % 3) * 0.12));
      dummy.updateMatrix();
      mountainInst.setMatrixAt(i, dummy.matrix);
      mountainInst.setColorAt(i, peakPalette[i % peakPalette.length]);
    }
    mountainInst.instanceMatrix.needsUpdate = true;
    if (mountainInst.instanceColor) mountainInst.instanceColor.needsUpdate = true;
    scene.add(mountainInst);
  }

  function buildPitchAndDetails() {
    const apron = new THREE.Mesh(
      new THREE.CylinderGeometry(64, 64, 0.15, 64),
      new THREE.MeshLambertMaterial({ color: 0x1b562b })
    );
    apron.scale.set(0.68, 1, 1.0);
    apron.position.y = -0.08;
    apron.receiveShadow = true;
    scene.add(apron);

    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(78, 115),
      new THREE.MeshLambertMaterial({ map: createPitchTexture() })
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Reuse the single ledBoardTexture exposed in stadiumRefs so offset.x actually scrolls
    if (!ledBoardTexture) {
      ledBoardTexture = createLedBoardTexture();
    }
    const ledMat = new THREE.MeshBasicMaterial({ map: ledBoardTexture });
    const eastLed = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 96), ledMat);
    eastLed.position.set(37.6, 0.48, 0);
    const northLed = new THREE.Mesh(new THREE.BoxGeometry(62, 0.95, 0.45), ledMat);
    northLed.position.set(0, 0.48, -55.2);
    const southLed = new THREE.Mesh(new THREE.BoxGeometry(62, 0.95, 0.45), ledMat);
    southLed.position.set(0, 0.48, 55.2);
    scene.add(eastLed, northLed, southLed);

    const westCurb = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.1, 92),
      new THREE.MeshLambertMaterial({ color: 0x1d68b5 })
    );
    westCurb.position.set(-38.2, 0.55, 0);
    scene.add(westCurb);

    buildPerimeterFence();
    buildFootballGoal(0, -52.5, 0);
    buildFootballGoal(0, 52.5, Math.PI);
    buildDugoutsAndTunnel();
    buildCornerFlagsAndPress();
    buildAssistantReferees();
    buildWolfMascot();
  }

  function buildCornerFlagsAndPress() {
    // Single crisp set of 4 corner flags (no duplicates)
    const poleGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const clothGeo = new THREE.PlaneGeometry(0.52, 0.34, 4, 1);
    clothGeo.translate(0.26, 0, 0);
    const clothMat = new THREE.MeshBasicMaterial({
      map: getCornerFlagTexture(),
      side: THREE.DoubleSide
    });

    const coords = [[-34, -52.5], [34, -52.5], [-34, 52.5], [34, 52.5]];
    coords.forEach(([cx, cz], idx) => {
      const pivot = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0.775;
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      cloth.position.set(0, 1.36, 0);
      pivot.add(pole, cloth);
      pivot.position.set(cx, 0, cz);
      scene.add(pivot);
      cornerFlags.push({ pivot, cloth, phase: idx * 1.45, x: cx, z: cz });
    });

    // 4 Stylized kneeling sideline photographers with tripods & flash quads
    const photoGeo = mergeColoredParts([
      // Kneeling legs/pants
      { g: new THREE.BoxGeometry(0.42, 0.24, 0.44), y: 0.12, z: -0.08, color: 0x1e293b },
      // Torso with press bib
      { g: new THREE.BoxGeometry(0.40, 0.46, 0.26), y: 0.47, z: -0.06, color: 0x22c55e },
      // Shoulders/arms reaching to camera
      { g: new THREE.BoxGeometry(0.11, 0.11, 0.34), x: -0.22, y: 0.58, z: 0.12, color: 0x334155 },
      { g: new THREE.BoxGeometry(0.11, 0.11, 0.34), x: 0.22, y: 0.58, z: 0.12, color: 0x334155 },
      // Head & cap
      { g: new THREE.SphereGeometry(0.135, 7, 6), y: 0.82, z: 0.0, color: 0xd6a580 },
      { g: new THREE.CylinderGeometry(0.14, 0.145, 0.08, 7), y: 0.90, z: 0.0, color: 0x0f172a },
      // Tripod legs
      { g: new THREE.CylinderGeometry(0.022, 0.022, 0.72, 5), x: -0.14, y: 0.34, z: 0.38, rz: -0.18, color: 0x334155 },
      { g: new THREE.CylinderGeometry(0.022, 0.022, 0.72, 5), x: 0.14, y: 0.34, z: 0.38, rz: 0.18, color: 0x334155 },
      { g: new THREE.CylinderGeometry(0.022, 0.022, 0.72, 5), x: 0, y: 0.34, z: 0.52, rx: -0.20, color: 0x334155 },
      // Camera body & telephoto lens
      { g: new THREE.BoxGeometry(0.22, 0.18, 0.20), y: 0.72, z: 0.32, color: 0x0f172a },
      { g: new THREE.CylinderGeometry(0.065, 0.075, 0.34, 8), y: 0.72, z: 0.52, rx: Math.PI * 0.5, color: 0xe2e8f0 },
      { g: new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), y: 0.72, z: 0.70, rx: Math.PI * 0.5, color: 0x38bdf8 }
    ]);
    const photoMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    const flashGeo = new THREE.PlaneGeometry(0.55, 0.55);
    const flashTex = getCameraFlashTexture();

    [[-12, -55.8], [12, -55.8], [-12, 55.8], [12, 55.8]].forEach(([px, pz], idx) => {
      const grp = new THREE.Group();
      const bodyMesh = new THREE.Mesh(photoGeo, photoMat);
      const flashMat = new THREE.MeshBasicMaterial({
        map: flashTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const flashMesh = new THREE.Mesh(flashGeo, flashMat);
      flashMesh.position.set(0, 0.80, 0.74);
      grp.add(bodyMesh, flashMesh);
      grp.position.set(px, 0, pz);
      grp.rotation.y = pz < 0 ? 0 : Math.PI;
      scene.add(grp);
      photographers.push({ group: grp, flashMesh, flashTimer: idx * 1.1 });
    });
  }

  function buildAssistantReferees() {
    const refBodyGeo = mergeColoredParts([
      // Boots & dark socks
      { g: new THREE.BoxGeometry(0.13, 0.09, 0.22), x: -0.11, y: 0.045, z: 0.03, color: 0x0f172a },
      { g: new THREE.BoxGeometry(0.13, 0.09, 0.22), x: 0.11, y: 0.045, z: 0.03, color: 0x0f172a },
      { g: new THREE.CylinderGeometry(0.06, 0.055, 0.44, 6), x: -0.11, y: 0.30, color: 0x111827 },
      { g: new THREE.CylinderGeometry(0.06, 0.055, 0.44, 6), x: 0.11, y: 0.30, color: 0x111827 },
      // Shorts
      { g: new THREE.BoxGeometry(0.38, 0.26, 0.24), y: 0.66, color: 0x0f172a },
      // Referee jersey (dark charcoal with neon trim collar)
      { g: new THREE.CylinderGeometry(0.21, 0.17, 0.56, 7), y: 1.08, sx: 1.15, sz: 0.76, color: 0x1e293b },
      { g: new THREE.CylinderGeometry(0.16, 0.18, 0.08, 7), y: 1.36, color: 0xfacc15 },
      // Left arm at side
      { g: new THREE.CylinderGeometry(0.055, 0.048, 0.46, 6), x: -0.28, y: 1.06, color: 0x1e293b },
      // Head & hair
      { g: new THREE.SphereGeometry(0.14, 7, 6), y: 1.54, color: 0xd9a882 },
      { g: new THREE.SphereGeometry(0.145, 7, 5), y: 1.59, sy: 0.72, color: 0x1f1916 }
    ]);
    const refMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });

    const flagMeshGeo = mergeColoredParts([
      // Right forearm
      { g: new THREE.CylinderGeometry(0.055, 0.048, 0.42, 6), y: -0.18, color: 0x1e293b },
      // Handle
      { g: new THREE.CylinderGeometry(0.018, 0.018, 0.62, 5), y: -0.34, z: 0.26, rx: Math.PI * 0.5, color: 0xf1f5f9 },
      // Bright yellow/orange checkered linesman flag
      { g: new THREE.BoxGeometry(0.02, 0.22, 0.19), y: -0.45, z: 0.44, color: 0xfacc15 },
      { g: new THREE.BoxGeometry(0.02, 0.22, 0.19), y: -0.45, z: 0.62, color: 0xf97316 }
    ]);

    const placements = [
      { side: 'east', x: 35.6, baseZ: -22, rotY: -Math.PI * 0.5 },
      { side: 'west', x: -35.6, baseZ: 22, rotY: Math.PI * 0.5 }
    ];

    placements.forEach((p) => {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(refBodyGeo, refMat);
      const flagPivot = new THREE.Group();
      flagPivot.position.set(0.28, 1.28, 0);
      const flagArm = new THREE.Mesh(flagMeshGeo, refMat);
      flagPivot.add(flagArm);
      grp.add(body, flagPivot);
      grp.position.set(p.x, 0, p.baseZ);
      grp.rotation.y = p.rotY;
      scene.add(grp);
      assistantRefs.push({ group: grp, flagPivot, side: p.side, baseZ: p.baseZ });
    });
  }

  function buildWolfMascot() {
    const grp = new THREE.Group();
    const furMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const furDarkMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const furLightMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const innerEarMat = new THREE.MeshLambertMaterial({ color: 0xdfa3b4 });
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const shortsMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const scarfMat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 });
    const jerseyMat = new THREE.MeshLambertMaterial({ map: createWolfJerseyTexture() });

    const bodyPivot = new THREE.Group();

    // Torso (celeste-white striped mascot jersey) & shorts
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.86, 12), jerseyMat);
    torso.scale.set(1.12, 1.0, 0.82);
    torso.position.y = 1.18;

    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.33, 0.34, 10), shortsMat);
    shorts.scale.set(1.1, 1.0, 0.85);
    shorts.position.y = 0.68;

    // Hip-pivoted articulated legs & cleats
    const legGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.56, 8);
    const bootGeo = new THREE.BoxGeometry(0.20, 0.14, 0.34);

    const legLPivot = new THREE.Group();
    legLPivot.position.set(-0.18, 0.62, 0);
    const legL = new THREE.Mesh(legGeo, furMat);
    legL.position.set(0, -0.28, 0);
    const bootL = new THREE.Mesh(bootGeo, noseMat);
    bootL.position.set(0, -0.55, 0.06);
    legLPivot.add(legL, bootL);

    const legRPivot = new THREE.Group();
    legRPivot.position.set(0.18, 0.62, 0);
    const legR = new THREE.Mesh(legGeo, furMat);
    legR.position.set(0, -0.28, 0);
    const bootR = new THREE.Mesh(bootGeo, noseMat);
    bootR.position.set(0, -0.55, 0.06);
    legRPivot.add(legR, bootR);

    // Flowing Celeste Scarf around neck + 2 fluttering scarf tails
    const scarfCollar = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.085, 8, 16), scarfMat);
    scarfCollar.rotation.x = Math.PI * 0.5;
    scarfCollar.position.set(0, 1.60, 0.02);

    const scarfTailGeo = new THREE.BoxGeometry(0.16, 0.56, 0.045);
    scarfTailGeo.translate(0, -0.26, 0);
    const scarfL = new THREE.Mesh(scarfTailGeo, scarfMat);
    scarfL.position.set(-0.15, 1.56, 0.28);
    scarfL.rotation.z = -0.14;
    const scarfR = new THREE.Mesh(scarfTailGeo, furLightMat);
    scarfR.position.set(0.14, 1.56, 0.27);
    scarfR.rotation.z = 0.18;

    // Sculpted Wolf Head Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.96, 0.02);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), furMat);
    cranium.scale.set(1.06, 0.96, 1.02);

    // Fluffy wolf cheeks
    const cheekGeo = new THREE.ConeGeometry(0.15, 0.24, 6);
    const cheekL = new THREE.Mesh(cheekGeo, furLightMat);
    cheekL.position.set(-0.32, -0.08, 0.08);
    cheekL.rotation.z = 1.25;
    const cheekR = new THREE.Mesh(cheekGeo, furLightMat);
    cheekR.position.set(0.32, -0.08, 0.08);
    cheekR.rotation.z = -1.25;

    // Sculpted snout / muzzle + nose + grin
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.19, 0.34, 10), furLightMat);
    muzzle.rotation.x = Math.PI * 0.5;
    muzzle.position.set(0, -0.08, 0.34);

    const snoutTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.28), furMat);
    snoutTop.position.set(0, 0.01, 0.30);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.072, 8, 6), noseMat);
    nose.scale.set(1.2, 0.88, 0.9);
    nose.position.set(0, -0.02, 0.51);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.22), furLightMat);
    jaw.position.set(0, -0.19, 0.30);

    // Expressive eyes + pupils + angled charismatic brows
    const eyeGeo = new THREE.SphereGeometry(0.068, 8, 6);
    const pupilGeo = new THREE.SphereGeometry(0.038, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeL.position.set(-0.14, 0.09, 0.28);
    const eyeR = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeR.position.set(0.14, 0.09, 0.28);
    const pupilL = new THREE.Mesh(pupilGeo, noseMat);
    pupilL.position.set(-0.14, 0.09, 0.335);
    const pupilR = new THREE.Mesh(pupilGeo, noseMat);
    pupilR.position.set(0.14, 0.09, 0.335);

    const browGeo = new THREE.BoxGeometry(0.16, 0.042, 0.05);
    const browL = new THREE.Mesh(browGeo, furDarkMat);
    browL.position.set(-0.14, 0.18, 0.31);
    browL.rotation.z = -0.22;
    const browR = new THREE.Mesh(browGeo, furDarkMat);
    browR.position.set(0.14, 0.18, 0.31);
    browR.rotation.z = 0.22;

    // Tall pointed wolf ears with inner pink-slate triangles
    const earOuterGeo = new THREE.ConeGeometry(0.13, 0.38, 6);
    const earInnerGeo = new THREE.ConeGeometry(0.075, 0.26, 5);

    const earL = new THREE.Group();
    earL.position.set(-0.22, 0.36, -0.02);
    earL.rotation.z = 0.22;
    const earLOut = new THREE.Mesh(earOuterGeo, furDarkMat);
    const earLIn = new THREE.Mesh(earInnerGeo, innerEarMat);
    earLIn.position.set(0, -0.02, 0.055);
    earL.add(earLOut, earLIn);

    const earR = new THREE.Group();
    earR.position.set(0.22, 0.36, -0.02);
    earR.rotation.z = -0.22;
    const earROut = new THREE.Mesh(earOuterGeo, furDarkMat);
    const earRIn = new THREE.Mesh(earInnerGeo, innerEarMat);
    earRIn.position.set(0, -0.02, 0.055);
    earR.add(earROut, earRIn);

    // Comedy Prop 1: Cool star-style visor sunglasses on headPivot (default hidden)
    const sunglasses = new THREE.Group();
    sunglasses.position.set(0, 0.09, 0.36);
    const visorMat = new THREE.MeshLambertMaterial({ color: 0x090d16 });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.04), visorMat);
    lensL.position.set(-0.13, 0, 0);
    lensL.rotation.z = 0.08;
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.04), visorMat);
    lensR.position.set(0.13, 0, 0);
    lensR.rotation.z = -0.08;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.03, 0.035), frameMat);
    bridge.position.set(0, 0.02, 0);
    const starAccentL = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), frameMat);
    starAccentL.position.set(-0.21, 0.045, 0.015);
    const starAccentR = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), frameMat);
    starAccentR.position.set(0.21, 0.045, 0.015);
    sunglasses.add(lensL, lensR, bridge, starAccentL, starAccentR);
    sunglasses.visible = false;

    headPivot.add(
      cranium, cheekL, cheekR, muzzle, snoutTop, nose, jaw,
      eyeL, eyeR, pupilL, pupilR, browL, browR, earL, earR, sunglasses
    );

    // Shoulder-pivoted articulated arms with sculpted paws
    const makeArm = (side) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.44, 1.48, 0);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.26, 8), scarfMat);
      sleeve.position.y = -0.12;
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.36, 8), furMat);
      forearm.position.y = -0.40;
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.125, 8, 6), furLightMat);
      paw.scale.set(1.0, 1.15, 0.85);
      paw.position.y = -0.62;
      armPivot.add(sleeve, forearm, paw);
      return armPivot;
    };
    const armL = makeArm(-1);
    const armR = makeArm(1);

    // Comedy Prop 2: Oversized celeste-white waving flag on a tall pole attached to armR (default hidden)
    const giantFlag = new THREE.Group();
    giantFlag.position.set(0, -0.58, 0.06);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 2.75, 8), poleMat);
    flagPole.position.set(0, 1.15, 0);
    const flagClothTop = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.34, 0.025), scarfMat);
    flagClothTop.position.set(0.68, 2.32, 0);
    const flagClothMid = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.34, 0.025), furLightMat);
    flagClothMid.position.set(0.68, 1.98, 0);
    const flagClothBot = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.34, 0.025), scarfMat);
    flagClothBot.position.set(0.68, 1.64, 0);
    giantFlag.add(flagPole, flagClothTop, flagClothMid, flagClothBot);
    giantFlag.visible = false;
    armR.add(giantFlag);

    // Bushy wagging wolf tail pivot
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.78, -0.28);
    const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.56, 7), furDarkMat);
    tailBase.rotation.x = -1.15;
    tailBase.position.set(0, 0.14, -0.24);
    const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.30, 7), furLightMat);
    tailTip.rotation.x = -1.05;
    tailTip.position.set(0, 0.28, -0.52);
    tailPivot.add(tailBase, tailTip);

    // Comedy Prop 3: Celeste-white juggle ball attached to grp for jueguitos (default hidden)
    const juggleBall = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), jerseyMat);
    juggleBall.position.set(0.32, 0.24, 0.52);
    juggleBall.visible = false;

    bodyPivot.add(
      torso, shorts, legLPivot, legRPivot, scarfCollar, scarfL, scarfR,
      headPivot, armL, armR, tailPivot
    );
    grp.add(bodyPivot, juggleBall);
    grp.position.set(-35.8, 0, -14.0);
    grp.scale.set(1.72, 1.72, 1.72);
    grp.userData = {
      bodyPivot,
      armL,
      armR,
      legL: legLPivot,
      legR: legRPivot,
      tail: tailPivot,
      head: headPivot,
      scarfL,
      scarfR,
      earL,
      earR,
      jaw,
      browL,
      browR,
      sunglasses,
      juggleBall,
      giantFlag,
      homePos: { x: -35.8, y: 0, z: -14.0 }
    };
    scene.add(grp);
    wolfMascot = grp;
  }

  function buildPerimeterFence() {
    const fenceGroup = new THREE.Group();
    const postMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const meshMat = new THREE.MeshBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide
    });

    // Consolidate all perimeter fence posts into 1 InstancedMesh
    const totalPosts = 64;
    const postCoords = [];
    for (let i = 0; i < totalPosts; i++) {
      const t = (i / totalPosts) * Math.PI * 2;
      let fx, fz;
      if (Math.cos(t) < -0.55) {
        fx = -37.8;
        fz = Math.sin(t) * 56;
      } else {
        fx = Math.cos(t) * 41.2;
        fz = Math.sin(t) * 58.2;
      }
      if (fx < -37 && Math.abs(fz) < 3.2) continue;
      postCoords.push([fx, fz]);
    }

    const postGeo = new THREE.CylinderGeometry(0.055, 0.055, 3.2, 6);
    const postInst = new THREE.InstancedMesh(postGeo, postMat, postCoords.length);
    const dummy = new THREE.Object3D();
    postCoords.forEach(([fx, fz], idx) => {
      dummy.position.set(fx, 1.6, fz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      postInst.setMatrixAt(idx, dummy.matrix);
    });
    postInst.instanceMatrix.needsUpdate = true;
    fenceGroup.add(postInst);

    const ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(41.2, 41.2, 2.9, 56, 1, true), meshMat);
    ringMesh.scale.set(1.0, 1.0, 1.41);
    ringMesh.position.y = 1.55;
    fenceGroup.add(ringMesh);

    // Supporter Fence Banners
    const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
    const banners = (brand && brand.trapos) || [
      { text: 'PASIÓN DE TRIBUNA', bg: '#0284c7', fg: '#ffffff', x: 0, z: -57.8, rotY: 0, w: 18 },
      { text: 'LA BANDA CELESTE', bg: '#dce4ee', fg: '#0284c7', x: 24, z: -47.0, rotY: -0.52, w: 13 },
      { text: 'NORTE Y FÚTBOL', bg: '#0ea5e9', fg: '#ffffff', x: 40.8, z: -20, rotY: -Math.PI / 2, w: 16 },
      { text: 'ESTADIO DE LOS CERROS', bg: '#dce4ee', fg: '#0f172a', x: 40.8, z: 20, rotY: -Math.PI / 2, w: 16 }
    ];
    banners.forEach((b) => {
      const bMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(b.w, 1.85),
        new THREE.MeshBasicMaterial({ map: createSupporterBannerTexture(b.text, b.bg, b.fg), side: THREE.DoubleSide })
      );
      bMesh.position.set(b.x, 1.8, b.z);
      bMesh.rotation.y = b.rotY;
      fenceGroup.add(bMesh);
    });

    scene.add(fenceGroup);
  }

  // True Open-Mouth 5-Face Goal Net BufferGeometry (Back, Left, Right, Top, Rear Skirt — Front Mouth 100% OPEN)
  function createOpenGoalNetGeometry() {
    const halfW = 3.66;
    const H = 2.44;
    const topD = 1.55;
    const botD = 2.15;
    const cellScale = 2.4; // UV repeats per meter

    const positions = [];
    const normals = [];
    const uvs = [];

    function pushQuad(p0, p1, p2, p3, n, u0, v0, u1, v1) {
      // Triangle 1: p0, p1, p2
      positions.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
      normals.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
      uvs.push(u0, v0, u1, v0, u1, v1);
      // Triangle 2: p0, p2, p3
      positions.push(p0[0], p0[1], p0[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
      normals.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
      uvs.push(u0, v0, u1, v1, u0, v1);
    }

    const backZ = (ty) => -(botD + (topD - botD) * ty);

    // Face 1: Back Net Wall (16 x 8 subdivided for smooth ripple/bulge)
    const segX = 16;
    const segY = 8;
    for (let iy = 0; iy < segY; iy++) {
      const ty0 = iy / segY;
      const ty1 = (iy + 1) / segY;
      const y0 = ty0 * H;
      const y1 = ty1 * H;
      const z0 = backZ(ty0);
      const z1 = backZ(ty1);
      for (let ix = 0; ix < segX; ix++) {
        const tx0 = ix / segX;
        const tx1 = (ix + 1) / segX;
        const x0 = -halfW + tx0 * (halfW * 2);
        const x1 = -halfW + tx1 * (halfW * 2);
        pushQuad(
          [x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1],
          [0, 0.24, 0.97],
          tx0 * halfW * 2 * cellScale, ty0 * H * cellScale,
          tx1 * halfW * 2 * cellScale, ty1 * H * cellScale
        );
      }
    }

    // Face 2 & Face 3: Left & Right Side Walls (6 x 8 subdivided)
    const segD = 6;
    [-1, 1].forEach((side) => {
      const sx = side * halfW;
      for (let iy = 0; iy < segY; iy++) {
        const ty0 = iy / segY;
        const ty1 = (iy + 1) / segY;
        const y0 = ty0 * H;
        const y1 = ty1 * H;
        const d0 = -backZ(ty0);
        const d1 = -backZ(ty1);
        for (let id = 0; id < segD; id++) {
          const td0 = id / segD;
          const td1 = (id + 1) / segD;
          const z00 = -td0 * d0;
          const z10 = -td1 * d0;
          const z01 = -td0 * d1;
          const z11 = -td1 * d1;
          pushQuad(
            [sx, y0, z00], [sx, y0, z10], [sx, y1, z11], [sx, y1, z01],
            [-side, 0, 0],
            td0 * botD * cellScale, ty0 * H * cellScale,
            td1 * botD * cellScale, ty1 * H * cellScale
          );
        }
      }
    });

    // Face 4: Top Roof Net (16 x 6 subdivided)
    for (let id = 0; id < segD; id++) {
      const td0 = id / segD;
      const td1 = (id + 1) / segD;
      const z0 = -td0 * topD;
      const z1 = -td1 * topD;
      for (let ix = 0; ix < segX; ix++) {
        const tx0 = ix / segX;
        const tx1 = (ix + 1) / segX;
        const x0 = -halfW + tx0 * (halfW * 2);
        const x1 = -halfW + tx1 * (halfW * 2);
        pushQuad(
          [x0, H, z0], [x1, H, z0], [x1, H, z1], [x0, H, z1],
          [0, -1, 0],
          tx0 * halfW * 2 * cellScale, td0 * topD * cellScale,
          tx1 * halfW * 2 * cellScale, td1 * topD * cellScale
        );
      }
    }

    // Face 5: Bottom Rear Ground Anchor Skirt (thin rear strip at y = 0.02, z in [-botD, -botD + 0.45])
    const skirtD0 = -botD;
    const skirtD1 = -botD + 0.45;
    for (let ix = 0; ix < segX; ix++) {
      const tx0 = ix / segX;
      const tx1 = (ix + 1) / segX;
      const x0 = -halfW + tx0 * (halfW * 2);
      const x1 = -halfW + tx1 * (halfW * 2);
      pushQuad(
        [x0, 0.02, skirtD0], [x1, 0.02, skirtD0], [x1, 0.02, skirtD1], [x0, 0.02, skirtD1],
        [0, 1, 0],
        tx0 * halfW * 2 * cellScale, 0,
        tx1 * halfW * 2 * cellScale, 0.45 * cellScale
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
  }

  function buildFootballGoal(x, z, rotY) {
    const goalGroup = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0xeff6ff });
    const stanchionMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

    // Merge goal posts, crossbar & rear stanchion frame into 2 crisp meshes
    const frameGeo = mergeColoredParts([
      { g: new THREE.CylinderGeometry(0.08, 0.08, 2.44, 10), x: -3.66, y: 1.22, color: 0xf1f5f9 },
      { g: new THREE.CylinderGeometry(0.08, 0.08, 2.44, 10), x: 3.66, y: 1.22, color: 0xf1f5f9 },
      { g: new THREE.CylinderGeometry(0.08, 0.08, 7.48, 10), y: 2.44, rz: Math.PI * 0.5, color: 0xf1f5f9 }
    ]);
    const goalFrame = new THREE.Mesh(frameGeo, postMat);

    const stanchionGeo = mergeColoredParts([
      // Top rear bars
      { g: new THREE.CylinderGeometry(0.038, 0.038, 1.55, 6), x: -3.66, y: 2.42, z: -0.78, rx: Math.PI * 0.5, color: 0x94a3b8 },
      { g: new THREE.CylinderGeometry(0.038, 0.038, 1.55, 6), x: 3.66, y: 2.42, z: -0.78, rx: Math.PI * 0.5, color: 0x94a3b8 },
      // Angled rear supports
      { g: new THREE.CylinderGeometry(0.038, 0.038, 2.52, 6), x: -3.66, y: 1.22, z: -1.85, rx: 0.24, color: 0x94a3b8 },
      { g: new THREE.CylinderGeometry(0.038, 0.038, 2.52, 6), x: 3.66, y: 1.22, z: -1.85, rx: 0.24, color: 0x94a3b8 },
      // Bottom rear anchor bar
      { g: new THREE.CylinderGeometry(0.04, 0.04, 7.36, 6), y: 0.04, z: -2.15, rz: Math.PI * 0.5, color: 0x94a3b8 }
    ]);
    const rearStanchions = new THREE.Mesh(stanchionGeo, stanchionMat);

    // Open-mouth 5-face procedural net
    const netGeo = createOpenGoalNetGeometry();
    const netMat = new THREE.MeshBasicMaterial({
      map: getGoalNetTexture(),
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.88,
      alphaTest: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    const posAttr = netGeo.attributes.position;
    const basePos = new Float32Array(posAttr.array.length);
    basePos.set(posAttr.array);
    netMesh.userData.basePos = basePos;
    netMesh.userData.goalZ = z;
    netMesh.userData.rotY = rotY;
    netMesh.userData.rippleTime = 0;
    netMesh.userData.impactLocalX = 0;
    netMesh.userData.impactLocalY = 1.22;
    netMesh.userData.impactStrength = 0;
    goalNets.push(netMesh);

    goalGroup.add(goalFrame, rearStanchions, netMesh);
    goalGroup.position.set(x, 0, z);
    goalGroup.rotation.y = rotY;
    scene.add(goalGroup);
  }

  function createBenchFigureGeometry(jerseyHex, shortsHex, isStanding) {
    if (isStanding) {
      // Standing head coach in tracksuit
      return mergeColoredParts([
        { g: new THREE.CylinderGeometry(0.065, 0.055, 0.72, 6), x: -0.11, y: 0.36, color: shortsHex },
        { g: new THREE.CylinderGeometry(0.065, 0.055, 0.72, 6), x: 0.11, y: 0.36, color: shortsHex },
        { g: new THREE.CylinderGeometry(0.22, 0.18, 0.62, 7), y: 1.02, sx: 1.12, sz: 0.78, color: jerseyHex },
        { g: new THREE.CylinderGeometry(0.055, 0.05, 0.46, 6), x: -0.28, y: 1.00, color: jerseyHex },
        { g: new THREE.CylinderGeometry(0.055, 0.05, 0.46, 6), x: 0.28, y: 1.00, color: jerseyHex },
        { g: new THREE.SphereGeometry(0.14, 7, 6), y: 1.50, color: 0xd8a882 },
        { g: new THREE.SphereGeometry(0.145, 7, 5), y: 1.55, sy: 0.7, color: 0x334155 }
      ]);
    }
    // Seated substitute figure (facing +X toward pitch)
    return mergeColoredParts([
      // Calves & boots
      { g: new THREE.BoxGeometry(0.14, 0.36, 0.11), x: 0.24, y: 0.18, z: -0.10, color: 0xe2e8f0 },
      { g: new THREE.BoxGeometry(0.14, 0.36, 0.11), x: 0.24, y: 0.18, z: 0.10, color: 0xe2e8f0 },
      // Seated thighs / shorts
      { g: new THREE.BoxGeometry(0.36, 0.16, 0.34), x: 0.10, y: 0.38, color: shortsHex },
      // Torso / training bib or jersey
      { g: new THREE.CylinderGeometry(0.19, 0.17, 0.50, 7), y: 0.70, sx: 0.80, sz: 1.15, color: jerseyHex },
      // Arms resting on knees
      { g: new THREE.BoxGeometry(0.22, 0.11, 0.10), x: 0.12, y: 0.62, z: -0.22, color: jerseyHex },
      { g: new THREE.BoxGeometry(0.22, 0.11, 0.10), x: 0.12, y: 0.62, z: 0.22, color: jerseyHex },
      // Head & hair
      { g: new THREE.SphereGeometry(0.135, 7, 6), y: 1.11, color: 0xd8a882 },
      { g: new THREE.SphereGeometry(0.14, 7, 5), y: 1.16, sy: 0.68, color: 0x1e1916 }
    ]);
  }

  function buildDugoutsAndTunnel() {
    const benchMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    const homeSubGeo = createBenchFigureGeometry(0x0ea5e9, 0x0f172a, false);
    const homeCoachGeo = createBenchFigureGeometry(0x0f172a, 0x1e293b, true);
    const awaySubGeo = createBenchFigureGeometry(0xf59e0b, 0x1e293b, false);

    const dugoutConfigs = [
      { zPos: -11, team: 'home', trimColor: 0x0284c7, seatColor: 0x0369a1 },
      { zPos: 11, team: 'away', trimColor: 0x475569, seatColor: 0xc2410c }
    ];

    dugoutConfigs.forEach((cfg) => {
      const dugout = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.52, 9.6),
        new THREE.MeshLambertMaterial({ color: cfg.trimColor })
      );
      base.position.y = 0.26;

      // Open-front canopy shelter (back wall + tinted roof so players inside are clearly visible)
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.95, 9.6),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      backWall.position.set(-0.92, 1.48, 0);

      const canopyRoof = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 0.12, 9.8),
        new THREE.MeshLambertMaterial({ color: 0x334155, transparent: true, opacity: 0.82 })
      );
      canopyRoof.position.set(0.05, 2.42, 0);

      const seats = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.42, 8.8),
        new THREE.MeshLambertMaterial({ color: cfg.seatColor })
      );
      seats.position.set(-0.32, 0.68, 0);

      dugout.add(base, backWall, canopyRoof, seats);
      dugout.position.set(-36.4, 0, cfg.zPos);
      scene.add(dugout);

      // Animated bench substitutes
      if (cfg.team === 'home') {
        for (let i = 0; i < 6; i++) {
          const subGrp = new THREE.Group();
          const mesh = new THREE.Mesh(homeSubGeo, benchMat);
          subGrp.add(mesh);
          const bz = cfg.zPos - 3.4 + i * 1.36;
          const baseY = 0.52;
          subGrp.position.set(-36.62, baseY, bz);
          scene.add(subGrp);
          benchPlayers.push({ group: subGrp, baseY, phase: i * 0.85, team: 'home' });
        }
        // Standing Home Head Coach in technical area
        const coachGrp = new THREE.Group();
        const coachMesh = new THREE.Mesh(homeCoachGeo, benchMat);
        coachGrp.add(coachMesh);
        coachGrp.position.set(-35.25, 0.0, cfg.zPos + 4.3);
        coachGrp.rotation.y = Math.PI * 0.5;
        scene.add(coachGrp);
        benchPlayers.push({ group: coachGrp, baseY: 0.0, phase: 5.2, team: 'home', isCoach: true });
      } else {
        for (let i = 0; i < 5; i++) {
          const subGrp = new THREE.Group();
          const mesh = new THREE.Mesh(awaySubGeo, benchMat);
          subGrp.add(mesh);
          const bz = cfg.zPos - 3.0 + i * 1.5;
          const baseY = 0.52;
          subGrp.position.set(-36.62, baseY, bz);
          scene.add(subGrp);
          benchPlayers.push({ group: subGrp, baseY, phase: i * 0.95 + 1.3, team: 'away' });
        }
      }
    });
  }

  function buildWestPlateaUlloa() {
    const plateaGroup = new THREE.Group();
    const totalWidthZ = 88;

    const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
    const yrL = brand ? brand.stadiumYearLeft : '-19';
    const yrR = brand ? brand.stadiumYearRight : '88-';
    const lowerSlope = new THREE.Mesh(
      new THREE.PlaneGeometry(totalWidthZ, 11.8, 32, 12),
      new THREE.MeshLambertMaterial({ map: createPlateaMosaicTexture(yrL, yrR, false) })
    );
    lowerSlope.position.set(-43.6, 5.4, 0);
    lowerSlope.rotation.set(0, Math.PI / 2, 0);
    lowerSlope.rotateX(-0.88);
    lowerSlope.receiveShadow = true;
    plateaGroup.add(lowerSlope);

    // Central Tunnel (toned architectural concrete, no whiteout)
    const tunnelFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 3.6, 4.2),
      new THREE.MeshLambertMaterial({ color: 0xdce4ee })
    );
    tunnelFrame.position.set(-39.2, 1.8, 0);
    const tunnelDark = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 2.9, 3.0),
      new THREE.MeshBasicMaterial({ color: 0x090d16 })
    );
    tunnelDark.position.set(-39.0, 1.45, 0);
    plateaGroup.add(tunnelFrame, tunnelDark);

    // Intermediate Wall & Vomitories
    const midWall = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 3.2, totalWidthZ),
      new THREE.MeshLambertMaterial({ color: 0xc5bfb2 })
    );
    midWall.position.set(-48.6, 9.8, 0);
    plateaGroup.add(midWall);

    [-22, 0, 22, -41, 41].forEach((vz) => {
      const vom = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 2.2, 4.6),
        new THREE.MeshBasicMaterial({ color: 0x0f172a })
      );
      vom.position.set(-48.4, 9.7, vz);
      plateaGroup.add(vom);
    });

    const fL = brand ? brand.stadiumFacadeLeft : 'A L';
    const fR = brand ? brand.stadiumFacadeRight : 'C S';
    const upperSlope = new THREE.Mesh(
      new THREE.PlaneGeometry(totalWidthZ, 13.5, 32, 12),
      new THREE.MeshLambertMaterial({ map: createPlateaMosaicTexture(fL, fR, true) })
    );
    upperSlope.position.set(-53.5, 15.2, 0);
    upperSlope.rotation.set(0, Math.PI / 2, 0);
    upperSlope.rotateX(-0.84);
    upperSlope.receiveShadow = true;
    plateaGroup.add(upperSlope);

    // Side Retaining Walls (balanced architectural tone 0xdce4ee)
    const flankMat = new THREE.MeshLambertMaterial({ color: 0xdce4ee });
    [-44.2, 44.2].forEach((fz) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 20, 1.2), flankMat);
      wall.position.set(-49, 10, fz);
      plateaGroup.add(wall);
    });

    // Cream/Beige 4-Story Press & VIP Building
    const buildingGroup = new THREE.Group();
    const creamMat = new THREE.MeshLambertMaterial({ color: 0xd2cbbd });
    const winMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, emissive: 0x332211, emissiveIntensity: 0.35 });
    pressWindowMats.push(winMat);

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(8.5, 9.2, 86), creamMat);
    mainBody.position.set(-61.5, 23.6, 0);
    buildingGroup.add(mainBody);

    [20.6, 23.5, 26.4].forEach((wy) => {
      const winBand = new THREE.Mesh(new THREE.BoxGeometry(8.7, 1.35, 83), winMat);
      winBand.position.set(-61.4, wy, 0);
      buildingGroup.add(winBand);
    });

    // Instanced architectural pilasters (13 -> 1 draw call)
    const pilasterGeo = new THREE.BoxGeometry(8.85, 9.3, 0.55);
    const pilasterInst = new THREE.InstancedMesh(pilasterGeo, creamMat, 13);
    const pDummy = new THREE.Object3D();
    for (let i = 0; i < 13; i++) {
      pDummy.position.set(-61.4, 23.6, -42 + i * 7);
      pDummy.updateMatrix();
      pilasterInst.setMatrixAt(i, pDummy.matrix);
    }
    pilasterInst.instanceMatrix.needsUpdate = true;
    buildingGroup.add(pilasterInst);

    // 4th-level Broadcast Tower
    const topTower = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.6, 25), creamMat);
    topTower.position.set(-61.5, 29.8, 0);
    const topGlass = new THREE.Mesh(new THREE.BoxGeometry(8.75, 1.6, 23), winMat);
    topGlass.position.set(-61.4, 29.9, 0);
    const backSubstructure = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 19.0, 86),
      new THREE.MeshLambertMaterial({ color: 0xc2bcb0 })
    );
    backSubstructure.position.set(-61.5, 9.5, 0);
    buildingGroup.add(topTower, topGlass, backSubstructure);
    plateaGroup.add(buildingGroup);

    populatePlateaSpectators(plateaGroup);
    scene.add(plateaGroup);
  }

  // ============================================================================
  // ARTICULATED HUMAN SPECTATOR GEOMETRY WITH aPart (Torso/Head/Arms/Scarf)
  // ============================================================================
  function createSpectatorGeometry() {
    // aPart encoding:
    //   0.0 = torso + legs
    //   1.0 = head
    //   2.0 = left arm (shoulder pivot at -0.28, 0.63, 0)
    //   3.0 = right arm (shoulder pivot at +0.28, 0.63, 0)
    //   4.0 = overhead scarf strip (shown/lifted on excitement, goals & wave)
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.64, 6, 1);
    torsoGeo.scale(1.12, 1.0, 0.72);
    const headGeo = new THREE.SphereGeometry(0.142, 6, 4);
    const armLGeo = new THREE.BoxGeometry(0.105, 0.38, 0.105);
    const armRGeo = new THREE.BoxGeometry(0.105, 0.38, 0.105);
    const scarfGeo = new THREE.BoxGeometry(0.74, 0.13, 0.03, 3, 1, 1);

    const parts = [
      { g: torsoGeo, x: 0, y: 0.34, z: 0, partId: 0.0 },
      { g: headGeo, x: 0, y: 0.82, z: 0.01, partId: 1.0 },
      { g: armLGeo, x: -0.29, y: 0.45, z: 0.02, partId: 2.0 },
      { g: armRGeo, x: 0.29, y: 0.45, z: 0.02, partId: 3.0 },
      { g: scarfGeo, x: 0, y: 1.05, z: 0.04, partId: 4.0 }
    ];

    let totalVerts = 0;
    const nonIndexed = parts.map((p) => {
      const ng = p.g.index ? p.g.toNonIndexed() : p.g.clone();
      ng.translate(p.x, p.y, p.z);
      if (!ng.attributes.normal) ng.computeVertexNormals();
      totalVerts += ng.attributes.position.count;
      p.g.dispose();
      return { geo: ng, partId: p.partId };
    });

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const partAttr = new Float32Array(totalVerts);
    let vertOffset = 0;

    nonIndexed.forEach(({ geo, partId }) => {
      const count = geo.attributes.position.count;
      positions.set(geo.attributes.position.array, vertOffset * 3);
      normals.set(geo.attributes.normal.array, vertOffset * 3);
      for (let i = 0; i < count; i++) {
        partAttr[vertOffset + i] = partId;
      }
      vertOffset += count;
      geo.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    merged.setAttribute('aPart', new THREE.BufferAttribute(partAttr, 1));
    return merged;
  }

  function populatePlateaSpectators(group) {
    const count = 1200;
    const geo = createSpectatorGeometry();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    plateaCrowdMesh = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    const colors = [
      new THREE.Color(0x0ea5e9),
      new THREE.Color(0xdce6f0),
      new THREE.Color(0x0284c7),
      new THREE.Color(0x1e293b),
      new THREE.Color(0x5bbce8)
    ];
    const teamAttr = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const isUpper = i % 2 === 0;
      const z = (Math.random() - 0.5) * 82;
      const t = Math.random();
      const x = isUpper ? -49.5 - t * 8.0 : -40.2 - t * 7.2;
      const y = isUpper ? 11.1 + t * 7.8 : 1.9 + t * 6.4;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, Math.PI * 0.5, 0);
      const hScale = 0.88 + Math.random() * 0.26;
      const wScale = 0.90 + Math.random() * 0.22;
      dummy.scale.set(wScale, hScale, wScale);
      dummy.updateMatrix();
      plateaCrowdMesh.setMatrixAt(i, dummy.matrix);
      plateaCrowdMesh.setColorAt(i, colors[i % colors.length]);
      teamAttr[i] = 0.0;
    }
    plateaCrowdMesh.geometry.setAttribute('aTeam', new THREE.InstancedBufferAttribute(teamAttr, 1));
    plateaCrowdMesh.instanceMatrix.needsUpdate = true;
    if (plateaCrowdMesh.instanceColor) plateaCrowdMesh.instanceColor.needsUpdate = true;
    group.add(plateaCrowdMesh);
  }

  // ============================================================================
  // INSTANCED OVAL BOWL (1,088+ meshes -> 2 InstancedMeshes!)
  // ============================================================================
  function buildOvalBowlAndPreferencial() {
    const bowlGroup = new THREE.Group();
    const numSegments = 68;
    const numSteps = 14;
    const startAngle = -0.74 * Math.PI;
    const endAngle = 0.74 * Math.PI;

    // InstancedMesh 1: Architectural concrete step treads + outer facade + inner retaining wall
    const treadCount = numSegments * numSteps + numSegments * 2;
    // InstancedMesh 2: Rich celeste / concrete mosaic risers giving crisp depth on every step
    const riserCount = numSegments * numSteps;

    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const treadMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const riserMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const concreteInst = new THREE.InstancedMesh(unitBoxGeo, treadMat, treadCount);
    const mosaicInst = new THREE.InstancedMesh(unitBoxGeo, riserMat, riserCount);

    const dummy = new THREE.Object3D();
    const cConcreteLight = new THREE.Color(0xcbd5e1);
    const cConcreteMid = new THREE.Color(0x94a3b8);
    const cConcreteDark = new THREE.Color(0x7d8ea3);
    const cCelesteDeep = new THREE.Color(0x0284c7);
    const cCelesteBright = new THREE.Color(0x0ea5e9);
    const cRoyalInner = new THREE.Color(0x1957a2);
    const cFacadeLight = new THREE.Color(0xdce4ee);
    const cFacadeBlue = new THREE.Color(0x3a88c8);

    let tIdx = 0;
    let rIdx = 0;

    for (let s = 0; s < numSegments; s++) {
      const a1 = startAngle + (s / numSegments) * (endAngle - startAngle);
      const a2 = startAngle + ((s + 1) / numSegments) * (endAngle - startAngle);
      const aMid = (a1 + a2) * 0.5;
      const isCelesteSector = Math.floor(s / 2) % 2 === 0;

      for (let r = 0; r < numSteps; r++) {
        const innerRx = 41.8 + r * 1.05;
        const innerRz = 58.8 + r * 1.08;
        const stepY = 1.6 + r * 0.68;
        const x = Math.cos(aMid) * innerRx;
        const z = Math.sin(aMid) * innerRz;
        const dx = Math.cos(a2) * innerRx - Math.cos(a1) * innerRx;
        const dz = Math.sin(a2) * innerRz - Math.sin(a1) * innerRz;
        const segWidth = Math.sqrt(dx * dx + dz * dz) + 0.25;

        // Architectural concrete step tread slab
        dummy.position.set(x, stepY + 0.22, z);
        dummy.rotation.set(0, -aMid, 0);
        dummy.scale.set(1.16, 0.24, segWidth);
        dummy.updateMatrix();
        concreteInst.setMatrixAt(tIdx, dummy.matrix);
        concreteInst.setColorAt(
          tIdx,
          isCelesteSector
            ? (r % 2 === 0 ? cCelesteBright : cCelesteDeep)
            : (r % 2 === 0 ? cConcreteLight : cConcreteMid)
        );
        tIdx++;

        // Colored mosaic step riser underneath (creates crisp dark-to-light stair readability)
        dummy.position.set(x, stepY - 0.14, z);
        dummy.rotation.set(0, -aMid, 0);
        dummy.scale.set(1.12, 0.48, segWidth);
        dummy.updateMatrix();
        mosaicInst.setMatrixAt(rIdx, dummy.matrix);
        mosaicInst.setColorAt(
          rIdx,
          isCelesteSector
            ? (r % 3 === 0 ? cRoyalInner : cCelesteDeep)
            : cConcreteDark
        );
        rIdx++;
      }

      // Outer facade wall panel (merged into concreteInst)
      const outerRx = 41.8 + numSteps * 1.05 + 0.8;
      const outerRz = 58.8 + numSteps * 1.08 + 0.8;
      const ox = Math.cos(aMid) * outerRx;
      const oz = Math.sin(aMid) * outerRz;
      const odx = Math.cos(a2) * outerRx - Math.cos(a1) * outerRx;
      const odz = Math.sin(a2) * outerRz - Math.sin(a1) * outerRz;
      const oWidth = Math.sqrt(odx * odx + odz * odz) + 0.3;

      dummy.position.set(ox, 5.9, oz);
      dummy.rotation.set(0, -aMid, 0);
      dummy.scale.set(1.4, 11.8, oWidth);
      dummy.updateMatrix();
      concreteInst.setMatrixAt(tIdx, dummy.matrix);
      concreteInst.setColorAt(tIdx, s % 3 === 0 ? cFacadeLight : cFacadeBlue);
      tIdx++;

      // Inner lower retaining wall panel (merged into concreteInst)
      const ix = Math.cos(aMid) * 41.2;
      const iz = Math.sin(aMid) * 58.2;
      dummy.position.set(ix, 1.1, iz);
      dummy.rotation.set(0, -aMid, 0);
      dummy.scale.set(0.6, 2.2, oWidth * 0.76);
      dummy.updateMatrix();
      concreteInst.setMatrixAt(tIdx, dummy.matrix);
      concreteInst.setColorAt(tIdx, cRoyalInner);
      tIdx++;
    }

    concreteInst.instanceMatrix.needsUpdate = true;
    if (concreteInst.instanceColor) concreteInst.instanceColor.needsUpdate = true;
    mosaicInst.instanceMatrix.needsUpdate = true;
    if (mosaicInst.instanceColor) mosaicInst.instanceColor.needsUpdate = true;
    bowlGroup.add(concreteInst, mosaicInst);

    populateBowlSpectatorsAndFlags(bowlGroup, startAngle, endAngle);
    scene.add(bowlGroup);
  }

  function populateBowlSpectatorsAndFlags(group, startAngle, endAngle) {
    const totalFans = 3000;
    const fanGeo = createSpectatorGeometry();
    const fanMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    bowlCrowdMesh = new THREE.InstancedMesh(fanGeo, fanMat, totalFans);

    const dummy = new THREE.Object3D();
    const homePalette = [
      new THREE.Color(0x0ea5e9),
      new THREE.Color(0xdce6f0),
      new THREE.Color(0x0284c7),
      new THREE.Color(0x5bbce8),
      new THREE.Color(0x1e293b)
    ];
    const awayPalette = [
      new THREE.Color(0xfacc15),
      new THREE.Color(0x0f172a)
    ];

    // Generate home and away fans separately, then evenly interleave across 0..totalFans-1
    // so CrowdSystem.applyQuality('low'|'medium'|'high') ALWAYS preserves the South away sector proportionally!
    const awaySplitAngle = Math.PI * 0.30;
    const awayArcRatio = (endAngle - awaySplitAngle) / (endAngle - startAngle);
    const awayTotal = Math.round(totalFans * awayArcRatio);
    const homeTotal = totalFans - awayTotal;

    const makeFanSpec = (isAway, k) => {
      const angle = isAway
        ? awaySplitAngle + Math.random() * (endAngle - awaySplitAngle)
        : startAngle + Math.random() * (awaySplitAngle - startAngle);
      const step = Math.floor(Math.random() * 13);
      return {
        isAway,
        angle,
        step,
        hScale: 0.88 + Math.random() * 0.26,
        wScale: 0.90 + Math.random() * 0.22,
        color: isAway ? awayPalette[k % awayPalette.length] : homePalette[k % homePalette.length]
      };
    };

    const interleaved = new Array(totalFans);
    let hCount = 0;
    let aCount = 0;
    let awayAccum = 0;
    for (let i = 0; i < totalFans; i++) {
      awayAccum += awayArcRatio;
      const pickAway = (awayAccum >= 1.0 && aCount < awayTotal) || hCount >= homeTotal;
      if (pickAway) {
        awayAccum -= 1.0;
        interleaved[i] = makeFanSpec(true, aCount++);
      } else {
        interleaved[i] = makeFanSpec(false, hCount++);
      }
    }

    const teamAttr = new Float32Array(totalFans);
    const awayIndices = [];

    for (let i = 0; i < totalFans; i++) {
      const fan = interleaved[i];
      const rx = 42.0 + fan.step * 1.05;
      const rz = 59.0 + fan.step * 1.08;
      dummy.position.set(Math.cos(fan.angle) * rx, 1.98 + fan.step * 0.68, Math.sin(fan.angle) * rz);
      dummy.rotation.set(0, -fan.angle - Math.PI * 0.5, 0);
      dummy.scale.set(fan.wScale, fan.hScale, fan.wScale);
      dummy.updateMatrix();
      bowlCrowdMesh.setMatrixAt(i, dummy.matrix);
      bowlCrowdMesh.setColorAt(i, fan.color);

      if (fan.isAway) {
        teamAttr[i] = 1.0;
        awayIndices.push(i);
      } else {
        teamAttr[i] = 0.0;
      }
    }

    bowlCrowdMesh.geometry.setAttribute('aTeam', new THREE.InstancedBufferAttribute(teamAttr, 1));
    bowlCrowdMesh.userData.awayIndices = awayIndices;
    bowlCrowdMesh.instanceMatrix.needsUpdate = true;
    if (bowlCrowdMesh.instanceColor) bowlCrowdMesh.instanceColor.needsUpdate = true;
    group.add(bowlCrowdMesh);

    // Vertical "Tirantes"
    const tiranteAngles = [-Math.PI * 0.56, -Math.PI * 0.5, -Math.PI * 0.44, -0.15, 0, 0.15, Math.PI * 0.5];
    const tiranteGeo = new THREE.BoxGeometry(12.5, 0.22, 1.8);
    const tiranteCelesteMat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 });
    const tiranteWhiteMat = new THREE.MeshLambertMaterial({ color: 0xdce4ee });
    tiranteAngles.forEach((ang, idx) => {
      const banner = new THREE.Mesh(tiranteGeo, idx % 2 === 0 ? tiranteCelesteMat : tiranteWhiteMat);
      banner.position.set(Math.cos(ang) * 48.0, 6.6, Math.sin(ang) * 65.0);
      banner.rotation.y = -ang;
      banner.rotation.z = 0.56;
      group.add(banner);
    });

    // Waving Flags
    const flagPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.9, 5);
    const flagPoleMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
    const flagClothGeo = new THREE.PlaneGeometry(2.0, 1.2);
    for (let f = 0; f < 30; f++) {
      const ang = startAngle + (f / 30) * (endAngle - startAngle);
      const isAwayFlag = ang > Math.PI * 0.30;
      const step = 4 + (f % 8);
      const flagPivot = new THREE.Group();
      flagPivot.position.set(Math.cos(ang) * (42.0 + step * 1.05), 2.6 + step * 0.68, Math.sin(ang) * (59.0 + step * 1.08));

      const pole = new THREE.Mesh(flagPoleGeo, flagPoleMat);
      pole.position.y = 1.45;
      const clothMat = new THREE.MeshBasicMaterial({
        color: isAwayFlag ? (f % 2 === 0 ? 0xfacc15 : 0x0f172a) : (f % 2 === 0 ? 0x0ea5e9 : 0xdce4ee),
        side: THREE.DoubleSide
      });
      const cloth = new THREE.Mesh(flagClothGeo, clothMat);
      cloth.position.set(1.0, 2.3, 0);
      flagPivot.add(pole, cloth);
      group.add(flagPivot);
      crowdFlags.push({ pivot: flagPivot, phase: f * 0.65, isAway: isAwayFlag, clothMat });
    }
  }

  function buildNorthScoreboard() {
    const sbGroup = new THREE.Group();
    const supportBase = new THREE.Mesh(
      new THREE.BoxGeometry(15.5, 4.2, 2.2),
      new THREE.MeshLambertMaterial({ color: 0xbcc7d4 })
    );
    supportBase.position.set(0, 12.6, -73.8);
    sbGroup.add(supportBase);

    scoreboardCanvas = document.createElement('canvas');
    scoreboardCanvas.width = 512;
    scoreboardCanvas.height = 256;
    scoreboardCtx = scoreboardCanvas.getContext('2d');
    scoreboardTexture = new THREE.CanvasTexture(scoreboardCanvas);
    updateScoreboardCanvas();

    const screenHousing = new THREE.Mesh(
      new THREE.BoxGeometry(16.2, 7.6, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    screenHousing.position.set(0, 18.2, -73.6);
    const screenFace = new THREE.Mesh(
      new THREE.PlaneGeometry(15.2, 6.8),
      new THREE.MeshBasicMaterial({ map: scoreboardTexture })
    );
    screenFace.position.set(0, 18.2, -72.95);
    sbGroup.add(screenHousing, screenFace);
    scene.add(sbGroup);
  }

  function updateScoreboardCanvas(isGoalBanner = false, payload = null) {
    if (payload) Object.assign(appState, payload);
    if (!scoreboardCtx) return;
    const ctx = scoreboardCtx;
    ctx.fillStyle = '#040b16';
    ctx.fillRect(0, 0, 512, 256);

    const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
    const sbHeader = brand ? brand.scoreboardHeader : 'ESTADIO DE LOS CERROS  •  SAN SALVADOR CELESTE';
    const homeShort = brand ? brand.homeClub.shortName : 'SSC';
    const homeGoalText = brand ? brand.goalBannerHome : '¡GOOOOL DE LOS CERROS!';
    const homeNameUpper = brand ? brand.homeClub.shortName : 'LOS CERROS';

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 512, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Barlow Condensed", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sbHeader, 256, 32);

    if (isGoalBanner) {
      const isHomeGoal = appState.goalTeam !== 'away';
      ctx.fillStyle = isHomeGoal ? '#38bdf8' : (appState.awayHex || '#facc15');
      ctx.font = '900 62px "Barlow Condensed", Arial, sans-serif';
      ctx.fillText(isHomeGoal ? homeGoalText : `GOL DE ${appState.awayShort}`, 256, 138);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 30px "Barlow Condensed", Arial, sans-serif';
      ctx.fillText(`${homeNameUpper} ${appState.scoreHome} - ${appState.scoreAway} ${appState.awayName}`, 256, 205);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 46px "Barlow Condensed", Arial, sans-serif';
      ctx.fillText(homeShort, 110, 132);
      ctx.fillStyle = appState.awayHex || '#facc15';
      ctx.fillText(appState.awayShort || 'RIV', 402, 132);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 72px "JetBrains Mono", monospace';
      ctx.fillText(`${appState.scoreHome} - ${appState.scoreAway}`, 256, 138);

      const mins = Math.floor(appState.matchSeconds / 60);
      const secs = String(appState.matchSeconds % 60).padStart(2, '0');
      ctx.fillStyle = '#4ade80';
      ctx.font = '700 32px "JetBrains Mono", monospace';
      ctx.fillText(`${appState.halfLabel || '1°T'}  ${String(mins).padStart(2, '0')}:${secs}`, 256, 212);
    }
    if (scoreboardTexture) scoreboardTexture.needsUpdate = true;
  }

  function buildFloodlightTowers() {
    const towerLocations = [
      { x: 40.8, z: 0, height: 39, aimX: 0, aimZ: 0 },
      { x: -42.5, z: -45.5, height: 40, aimX: -5, aimZ: -15 },
      { x: -42.5, z: 45.5, height: 40, aimX: -5, aimZ: 15 },
      { x: 35.0, z: -50.0, height: 38, aimX: 5, aimZ: -18 },
      { x: 35.0, z: 50.0, height: 38, aimX: 5, aimZ: 18 }
    ];

    const latticeMat = new THREE.MeshLambertMaterial({ color: 0xb0becd, wireframe: true });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const beamGeo = new THREE.ConeGeometry(18, 48, 16, 1, true);
    beamGeo.translate(0, -24, 0);

    towerLocations.forEach((t) => {
      const towerGroup = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.7, t.height, 1.7, 2, 16, 2), latticeMat);
      shaft.position.y = t.height / 2;
      towerGroup.add(shaft);

      const headFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.8, 5.4), frameMat);
      headFrame.position.y = t.height + 1.8;
      headFrame.lookAt(t.aimX - t.x, 0, t.aimZ - t.z);

      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
      const bulbFace = new THREE.Mesh(new THREE.BoxGeometry(1.35, 4.2, 4.8), bulbMat);
      bulbFace.position.y = t.height + 1.8;
      bulbFace.lookAt(t.aimX - t.x, 0, t.aimZ - t.z);
      floodlightBulbs.push(bulbMat);

      // Volumetric Light Cone for Night/Sunset Stadium Atmosphere
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.set(0, t.height + 1.5, 0);
      const targetDir = new THREE.Vector3(t.aimX - t.x, -t.height, t.aimZ - t.z).normalize();
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), targetDir);
      floodlightBeams.push(beamMat);

      towerGroup.add(headFrame, bulbFace, beamMesh);
      towerGroup.position.set(t.x, 0, t.z);
      scene.add(towerGroup);

      const spot = new THREE.PointLight(0xf8fafc, 0.18, 155, 1.5);
      spot.position.set(t.x, t.height + 2, t.z);
      scene.add(spot);
      floodlightSpotlights.push(spot);
    });
  }

  function buildSurroundingCityAndHighway() {
    const cityGroup = new THREE.Group();
    const highway = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 340),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    highway.rotation.x = -Math.PI / 2;
    highway.position.set(78, 0.05, 0);
    cityGroup.add(highway);

    const median = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 340),
      new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
    );
    median.position.set(78, 0.25, 0);
    cityGroup.add(median);

    const carColors = [0xdce4ee, 0xfacc15, 0x38bdf8, 0xef4444, 0xcbd5e1];
    for (let c = 0; c < 14; c++) {
      const isBus = c % 5 === 0;
      const laneDir = c % 2 === 0 ? 1 : -1;
      const carMesh = new THREE.Mesh(
        new THREE.BoxGeometry(isBus ? 2.4 : 1.8, isBus ? 2.2 : 1.2, isBus ? 7.5 : 3.8),
        new THREE.MeshLambertMaterial({ color: isBus ? 0xeab308 : carColors[c % carColors.length] })
      );
      carMesh.position.set(
        78 + laneDir * (4.5 + (c % 2) * 3.2),
        isBus ? 1.1 : 0.65,
        (c / 14) * 280 - 140
      );
      cityGroup.add(carMesh);
      highwayCars.push({ mesh: carMesh, speed: laneDir * (14 + (c % 4) * 3) });
    }

    const houseColors = [0x94a3b8, 0xb89b7a, 0xcbd5e1, 0x8d6e63, 0x64748b];
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 128;
    winCanvas.height = 128;
    const wctx = winCanvas.getContext('2d');
    wctx.fillStyle = '#cbd5e1';
    wctx.fillRect(0, 0, 128, 128);
    for (let wy = 10; wy < 118; wy += 22) {
      for (let wx = 10; wx < 118; wx += 22) {
        const lit = ((wx + wy) % 44 === 0);
        wctx.fillStyle = lit ? '#fef08a' : '#1e293b';
        wctx.fillRect(wx, wy, 12, 14);
      }
    }
    const winTex = new THREE.CanvasTexture(winCanvas);
    winTex.wrapS = THREE.RepeatWrapping;
    winTex.wrapT = THREE.RepeatWrapping;

    const housePalette = houseColors.map((c) => new THREE.Color(c));
    const bldgPositions = [];
    for (let b = 0; b < 90; b++) {
      const angle = (b / 90) * Math.PI * 2;
      const dist = 108 + (b % 5) * 24;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      if (bx > 62 && bx < 95) continue;
      bldgPositions.push({
        x: bx,
        z: bz,
        w: 8 + (b % 4) * 4,
        d: 8 + (b % 3) * 4,
        h: 4 + (b % 5) * 3.2,
        color: housePalette[b % housePalette.length]
      });
    }
    const bldgMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0xffffff, map: winTex }),
      bldgPositions.length
    );
    const bDummy = new THREE.Object3D();
    bldgPositions.forEach((bp, idx) => {
      bDummy.position.set(bp.x, bp.h / 2, bp.z);
      bDummy.scale.set(bp.w, bp.h, bp.d);
      bDummy.updateMatrix();
      bldgMesh.setMatrixAt(idx, bDummy.matrix);
      bldgMesh.setColorAt(idx, bp.color);
    });
    bldgMesh.instanceMatrix.needsUpdate = true;
    if (bldgMesh.instanceColor) bldgMesh.instanceColor.needsUpdate = true;
    cityGroup.add(bldgMesh);

    scene.add(cityGroup);
  }

  function buildAtmosphericParticles() {
    // Confetti for Goal Celebration
    const cCount = 520;
    const cGeo = new THREE.BufferGeometry();
    const cPos = new Float32Array(cCount * 3);
    for (let i = 0; i < cCount; i++) {
      cPos[i * 3] = (Math.random() - 0.5) * 110;
      cPos[i * 3 + 1] = 8 + Math.random() * 28;
      cPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
    confettiSystem = new THREE.Points(
      cGeo,
      new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.65, transparent: true, opacity: 0.0 })
    );
    scene.add(confettiSystem);

    // Ambient Celeste Smoke rising gently from Popular Norte (soft radial puff texture)
    const sCount = 90;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 46;
      sPos[i * 3 + 1] = 4 + Math.random() * 14;
      sPos[i * 3 + 2] = -60 - Math.random() * 10;
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const smokeTex = createSoftSmokeTexture();
    smokeSystem = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({
        color: 0x7dd3fc,
        map: smokeTex,
        size: 6.4,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      })
    );
    scene.add(smokeSystem);
  }

  // ============================================================================
  // SKY & LIGHTING MODES (Calibrated for ACESFilmicToneMapping — Zero Whiteout)
  // ============================================================================
  function setSkyMode(mode) {
    appState.skyMode = mode;

    if (skyDomeMesh) {
      if (skyDomeMesh.material.map) {
        skyDomeMesh.material.map.dispose();
      }
      skyDomeMesh.material.map = createSkyDomeTexture(mode);
      skyDomeMesh.material.needsUpdate = true;
    }

    if (mode === 'day') {
      if (scene && scene.fog) {
        scene.fog.color.setHex(0x8ec5fc);
        if ('density' in scene.fog) scene.fog.density = 0.0014;
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xbae6fd);
        hemiLight.groundColor.setHex(0x24402e);
        hemiLight.intensity = 0.55;
      }
      if (sunLight) {
        sunLight.color.setHex(0xfff8e7);
        sunLight.intensity = 0.95;
        sunLight.position.set(-70, 125, 35);
      }
      floodlightSpotlights.forEach((s) => {
        s.intensity = 0.0;
        s.distance = 155;
        s.decay = 1.5;
      });
      floodlightBulbs.forEach((b) => b.color.setHex(0x94a3b8));
      floodlightBeams.forEach((bm) => (bm.opacity = 0.0));
      pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.05));
    } else if (mode === 'sunset') {
      if (scene && scene.fog) {
        scene.fog.color.setHex(0x3b2242);
        if ('density' in scene.fog) scene.fog.density = 0.0017;
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xfda4af);
        hemiLight.groundColor.setHex(0x1e293b);
        hemiLight.intensity = 0.48;
      }
      if (sunLight) {
        sunLight.color.setHex(0xfb923c);
        sunLight.intensity = 0.88;
        sunLight.position.set(-120, 46, -35);
      }
      floodlightSpotlights.forEach((s) => {
        s.intensity = 0.18;
        s.distance = 155;
        s.decay = 1.5;
      });
      floodlightBulbs.forEach((b) => b.color.setHex(0xfef3c7));
      floodlightBeams.forEach((bm) => (bm.opacity = 0.055));
      pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.42));
    } else {
      if (scene && scene.fog) {
        scene.fog.color.setHex(0x070e1c);
        if ('density' in scene.fog) scene.fog.density = 0.0019;
      }
      if (hemiLight) {
        hemiLight.color.setHex(0x93c5fd);
        hemiLight.groundColor.setHex(0x0b1120);
        hemiLight.intensity = 0.30;
      }
      if (sunLight) {
        sunLight.color.setHex(0xdbeafe);
        sunLight.intensity = 0.45;
        sunLight.position.set(10, 115, 0);
      }
      floodlightSpotlights.forEach((s) => {
        s.intensity = 0.34;
        s.distance = 155;
        s.decay = 1.5;
      });
      floodlightBulbs.forEach((b) => b.color.setHex(0xf8fafc));
      floodlightBeams.forEach((bm) => (bm.opacity = 0.11));
      pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.78));
    }
  }

  function buildAll(targetScene, lights) {
    // Reset collections cleanly in case of rebuild
    floodlightSpotlights.length = 0;
    floodlightBulbs.length = 0;
    floodlightBeams.length = 0;
    pressWindowMats.length = 0;
    crowdFlags.length = 0;
    cornerFlags.length = 0;
    benchPlayers.length = 0;
    photographers.length = 0;
    assistantRefs.length = 0;
    highwayCars.length = 0;
    goalNets.length = 0;

    stadiumRefs.scene = targetScene;
    stadiumRefs.hemiLight = lights.hemiLight;
    stadiumRefs.sunLight = lights.sunLight;
    scene = targetScene;
    hemiLight = lights.hemiLight;
    sunLight = lights.sunLight;

    // Create single shared scrolling LED texture before pitch uses it
    ledBoardTexture = createLedBoardTexture();
    stadiumRefs.ledBoardTexture = ledBoardTexture;

    buildSkyAndJujuyMountains();
    buildPitchAndDetails();
    buildWestPlateaUlloa();
    buildOvalBowlAndPreferencial();
    buildNorthScoreboard();
    buildFloodlightTowers();
    buildSurroundingCityAndHighway();
    buildAtmosphericParticles();

    // Apply balanced initial lighting & sky dome texture
    setSkyMode(appState.skyMode || 'sunset');

    stadiumRefs.skyDomeMesh = skyDomeMesh;
    stadiumRefs.scoreboardCanvas = scoreboardCanvas;
    stadiumRefs.scoreboardCtx = scoreboardCtx;
    stadiumRefs.scoreboardTexture = scoreboardTexture;
    stadiumRefs.bowlCrowdMesh = bowlCrowdMesh;
    stadiumRefs.plateaCrowdMesh = plateaCrowdMesh;
    stadiumRefs.confettiSystem = confettiSystem;
    stadiumRefs.smokeSystem = smokeSystem;
    stadiumRefs.floodlightSpotlights = floodlightSpotlights;
    stadiumRefs.floodlightBulbs = floodlightBulbs;
    stadiumRefs.floodlightBeams = floodlightBeams;
    stadiumRefs.pressWindowMats = pressWindowMats;
    stadiumRefs.crowdFlags = crowdFlags;
    stadiumRefs.cornerFlags = cornerFlags;
    stadiumRefs.benchPlayers = benchPlayers;
    stadiumRefs.photographers = photographers;
    stadiumRefs.assistantRefs = assistantRefs;
    stadiumRefs.highwayCars = highwayCars;
    stadiumRefs.goalNets = goalNets;
    stadiumRefs.wolfMascot = wolfMascot;

    return stadiumRefs;
  }

  function deformGoalNet(goalZ, impactX, impactY, strength = 1.0) {
    goalNets.forEach((net) => {
      if (Math.sign(net.userData.goalZ) !== Math.sign(goalZ)) return;
      net.userData.rippleTime = 1.15;
      net.userData.impactLocalX = net.userData.rotY ? -impactX : impactX;
      net.userData.impactLocalY = Math.max(0.22, Math.min(2.26, impactY));
      net.userData.impactStrength = Math.min(1.65, Math.max(0.45, strength));
    });
  }

  function relaxGoalNets(dt) {
    goalNets.forEach((net) => {
      if (net.userData.rippleTime <= 0) return;
      net.userData.rippleTime = Math.max(0, net.userData.rippleTime - dt);
      const t = net.userData.rippleTime;
      const pos = net.geometry.attributes.position;
      const base = net.userData.basePos;

      if (t <= 0) {
        pos.array.set(base);
        pos.needsUpdate = true;
        return;
      }

      const ix = net.userData.impactLocalX;
      const iy = net.userData.impactLocalY;
      const normT = t / 1.15;
      const str = net.userData.impactStrength * normT;
      const wave = Math.sin((1.15 - t) * 20.0) * 0.28 + 0.72;

      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];

        // Keep front goalposts, crossbar and ground hem firmly anchored
        if (bz < -0.08 && by > 0.04) {
          const dist = Math.hypot(bx - ix, by - iy);
          const falloff = Math.exp(-dist * 0.42);
          const depthAnchor = Math.min(1.0, (-bz) / 0.85);
          const heightAnchor = Math.min(1.0, by / 0.35) * Math.min(1.0, (2.44 - by) / 0.25 + 0.2);
          const disp = str * falloff * depthAnchor * heightAnchor * wave;
          pos.array[i * 3] = bx + (bx - ix) * disp * 0.08;
          pos.array[i * 3 + 1] = by;
          pos.array[i * 3 + 2] = bz - disp * 1.15;
        } else {
          pos.array[i * 3] = bx;
          pos.array[i * 3 + 1] = by;
          pos.array[i * 3 + 2] = bz;
        }
      }
      pos.needsUpdate = true;
    });
  }

  global.StadiumBuilder = {
    STADIUM_SECTORS,
    buildAll,
    updateScoreboardCanvas,
    setSkyMode,
    deformGoalNet,
    relaxGoalNets,
    refs: stadiumRefs
  };
})(window);
