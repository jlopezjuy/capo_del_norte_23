/**
 * StadiumBuilder — Estadio de los Cerros (Escenario A Independiente)
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
  let skyDomeMesh;
  let scoreboardCanvas, scoreboardCtx, scoreboardTexture;
  let ledBoardTexture;
  let bowlCrowdMesh = null;
  let plateaCrowdMesh = null;
  const crowdFlags = [];
  const highwayCars = [];
  let confettiSystem = null;
  let smokeSystem = null;
  const goalNets = [];
  let wolfMascot = null;

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
        proTip: 'Usá el control lateral para recorrer la curva diagonal completa del codo.',
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
        badge: 'EDIFICIO SUPERIOR • COPA AMÉRICA 2011',
        priceMayor: 75000,
        priceJubilado: 60000,
        priceMenor: 40000,
        accessGate: 'Calle Santa Bárbara (Acceso Central y Ascensores)',
        description: 'El edificio de 4 niveles inaugurado para la Copa América 2011 sobre la Platea Alta. Es el punto de vista de las cámaras de TV y transmisiones.',
        proTip: 'Cambiá a Fila Alta para subir al 4° nivel central (Cabina Oficial de Transmisión).',
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
        description: 'Sobrevolá la arquitectura completa del Estadio de los Cerros, las torres de iluminación y los cerros del norte.',
        proTip: 'Mové el control lateral para orbitar suavemente alrededor de todo el estadio.',
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

    function createSkyDomeTexture(mode) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      if (mode === 'day') {
        grad.addColorStop(0.0, '#1d4ed8');
        grad.addColorStop(0.35, '#3b82f6');
        grad.addColorStop(0.62, '#93c5fd');
        grad.addColorStop(0.85, '#dbeafe');
        grad.addColorStop(1.0, '#bfdbfe');
      } else if (mode === 'sunset') {
        // Directly inspired by reference image_d44786.png (magenta/pink/violet Jujuy sky)
        grad.addColorStop(0.0, '#1e1b4b');
        grad.addColorStop(0.28, '#4c1d95');
        grad.addColorStop(0.48, '#9d174d');
        grad.addColorStop(0.64, '#f472b6');
        grad.addColorStop(0.76, '#fb923c');
        grad.addColorStop(1.0, '#3b1c3c');
      } else {
        grad.addColorStop(0.0, '#020617');
        grad.addColorStop(0.45, '#071326');
        grad.addColorStop(0.75, '#0f213d');
        grad.addColorStop(1.0, '#050b16');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Add atmospheric clouds or stars
      if (mode === 'night') {
        for (let i = 0; i < 320; i++) {
          const sx = Math.random() * 1024;
          const sy = Math.random() * 290;
          const r = Math.random() * 1.4 + 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + Math.random() * 0.65})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const cloudColor = mode === 'sunset' ? 'rgba(255, 196, 214, 0.24)' : 'rgba(255, 255, 255, 0.28)';
        for (let c = 0; c < 42; c++) {
          const cx = Math.random() * 1024;
          const cy = 90 + Math.random() * 195;
          const cw = 90 + Math.random() * 180;
          const ch = 16 + Math.random() * 28;
          ctx.fillStyle = cloudColor;
          ctx.beginPath();
          ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }

    // ============================================================================
    // 5. HIGH-DETAIL TEXTURES: PLATEA MOSAICS, PITCH, LED BOARDS & BANNERS
    // ============================================================================
    function createPlateaMosaicTexture(textLeft, textRight, isUpperTier) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 1024, 256);

      const blocks = [
        { x: 18, w: 222, type: 'wing' },
        { x: 268, w: 224, type: 'leftCenter', text: textLeft },
        { x: 532, w: 224, type: 'rightCenter', text: textRight },
        { x: 782, w: 222, type: 'wing' }
      ];

      // Concrete stairways
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(240, 0, 28, 256);
      ctx.fillRect(492, 0, 40, 256);
      ctx.fillRect(756, 0, 26, 256);

      blocks.forEach((b) => {
        if (b.type === 'wing') {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(b.x, 8, b.w, 240);
          for (let r = 12; r < 245; r += 12) {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(b.x, r, b.w, 3);
            ctx.fillStyle = '#f8fafc';
            for (let c = b.x + 4; c < b.x + b.w - 4; c += 8) {
              ctx.fillRect(c, r + 4, 6, 6);
            }
          }
        } else if (isUpperTier) {
          ctx.fillStyle = '#1d6ec9';
          ctx.fillRect(b.x, 8, b.w, 240);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 8;
          ctx.strokeRect(b.x + 8, 16, b.w - 16, 224);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x + b.w / 2 - 4, 12, 8, 232);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 138px "Barlow Condensed", Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const chars = b.text.split(' ');
          ctx.fillText(chars[0], b.x + b.w * 0.26, 134);
          ctx.fillText(chars[1], b.x + b.w * 0.74, 134);
        } else {
          const numStripes = 16;
          const stripeW = b.w / numStripes;
          for (let i = 0; i < numStripes; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#2b8aeb' : '#f8fafc';
            ctx.fillRect(b.x + i * stripeW, 8, stripeW + 0.6, 240);
          }
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 132px "Barlow Condensed", Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.strokeText(b.text, b.x + b.w * 0.5, 136);
          ctx.fillText(b.text, b.x + b.w * 0.5, 136);
        }

        // Seat rows shading
        for (let r = 10; r < 246; r += 10) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
          ctx.fillRect(b.x, r, b.w, 2);
        }
        for (let c = b.x; c < b.x + b.w; c += 7) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
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

      ctx.fillStyle = '#1f6f33';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const padX = 76;
      const padZ = 76;
      const fieldW = canvas.width - padX * 2;
      const fieldH = canvas.height - padZ * 2;
      const stripes = 18;
      const stripeH = fieldH / stripes;

      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#2a8b41' : '#1f7234';
        ctx.fillRect(padX, padZ + i * stripeH, fieldW, stripeH + 1);
      }

      // Cross-mowing sheen
      for (let j = 0; j < 10; j++) {
        ctx.fillStyle = j % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
        ctx.fillRect(padX + j * (fieldW / 10), padZ, fieldW / 10, fieldH);
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.lineWidth = 5;
      ctx.strokeRect(padX, padZ, fieldW, fieldH);

      const midY = canvas.height / 2;
      const midX = canvas.width / 2;
      ctx.beginPath();
      ctx.moveTo(padX, midY);
      ctx.lineTo(padX + fieldW, midY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(midX, midY, fieldW * 0.13, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(midX, midY, 6, 0, Math.PI * 2);
      ctx.fill();

      const penW = fieldW * 0.57;
      const penH = fieldH * 0.157;
      const goalAreaW = fieldW * 0.26;
      const goalAreaH = fieldH * 0.052;

      ctx.strokeRect(midX - penW / 2, padZ, penW, penH);
      ctx.strokeRect(midX - goalAreaW / 2, padZ, goalAreaW, goalAreaH);
      ctx.beginPath();
      ctx.arc(midX, padZ + fieldH * 0.105, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(midX, padZ + fieldH * 0.105, fieldW * 0.13, 0.22 * Math.PI, 0.78 * Math.PI);
      ctx.stroke();

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
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.25, '#0f172a');
      grad.addColorStop(0.5, '#0ea5e9');
      grad.addColorStop(0.75, '#0f172a');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 64);

      const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 28px "Barlow Condensed", Arial, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(brand ? brand.ledTicker : 'PASIÓN DE TRIBUNA   •   ESTADIO DE LOS CERROS   •   ', 12, 34);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
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

    // ============================================================================
    // 6. BUILD STADIUM WORLD
    // ============================================================================
    function buildSkyAndJujuyMountains() {
      const skyGeo = new THREE.SphereGeometry(560, 32, 24);
      const skyMat = new THREE.MeshBasicMaterial({
        map: createSkyDomeTexture('sunset'),
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

      // Ring of Jujuy hills ("La Tacita de Plata")
      const mountainGroup = new THREE.Group();
      const numPeaks = 48;
      for (let i = 0; i < numPeaks; i++) {
        const angle = (i / numPeaks) * Math.PI * 2;
        const dist = 300 + (i % 3) * 38;
        const height = 46 + Math.sin(i * 1.7) * 20 + Math.cos(i * 0.9) * 14;
        const radius = 64 + (i % 4) * 16;
        const peak = new THREE.Mesh(
          new THREE.ConeGeometry(radius, height, 7),
          new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x1e382d : 0x244235 })
        );
        peak.position.set(Math.cos(angle) * dist, height / 2 - 4, Math.sin(angle) * dist);
        peak.rotation.y = i * 0.4;
        mountainGroup.add(peak);
      }
      scene.add(mountainGroup);
    }

    function buildPitchAndDetails() {
      const apron = new THREE.Mesh(
        new THREE.CylinderGeometry(64, 64, 0.15, 64),
        new THREE.MeshLambertMaterial({ color: 0x1b5e2b })
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

      // Animated LED Perimeter Advertising Boards along East, North and South sidelines
      ledBoardTexture = createLedBoardTexture();
      const ledMat = new THREE.MeshBasicMaterial({ map: ledBoardTexture });
      const eastLed = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 96), ledMat);
      eastLed.position.set(37.6, 0.48, 0);
      const northLed = new THREE.Mesh(new THREE.BoxGeometry(62, 0.95, 0.45), ledMat);
      northLed.position.set(0, 0.48, -55.2);
      const southLed = new THREE.Mesh(new THREE.BoxGeometry(62, 0.95, 0.45), ledMat);
      southLed.position.set(0, 0.48, 55.2);
      scene.add(eastLed, northLed, southLed);

      // Corner Flags
      const cornerCoords = [[-35, -52.5], [35, -52.5], [-35, 52.5], [35, 52.5]];
      cornerCoords.forEach(([cx, cz]) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        pole.position.set(cx, 0.75, cz);
        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.45, 0.3),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
        );
        flag.position.set(cx + 0.22, 1.35, cz);
        scene.add(pole, flag);
      });

      const westCurb = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.1, 92),
        new THREE.MeshLambertMaterial({ color: 0x2576c9 })
      );
      westCurb.position.set(-38.2, 0.55, 0);
      scene.add(westCurb);

      buildPerimeterFence();
      buildFootballGoal(0, -52.5, 0);
      buildFootballGoal(0, 52.5, Math.PI);
      buildDugoutsAndTunnel();
      buildCornerFlagsAndPress();
      buildWolfMascot();
    }

    function buildCornerFlagsAndPress() {
      const poleMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const flagMat = new THREE.MeshBasicMaterial({ color: 0x1ea7fd, side: THREE.DoubleSide });
      [[-34, -52.5], [34, -52.5], [-34, 52.5], [34, 52.5]].forEach(([cx, cz]) => {
        const grp = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), poleMat);
        pole.position.y = 0.75;
        const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.32), flagMat);
        cloth.position.set(0.22, 1.32, 0);
        grp.add(pole, cloth);
        grp.position.set(cx, 0, cz);
        scene.add(grp);
      });

      // Sideline photographers / TV broadcast camera behind goals
      const camMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const lensMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
      [[-12, -55.8], [12, -55.8], [-12, 55.8], [12, 55.8]].forEach(([px, pz]) => {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), camMat);
        body.position.set(px, 0.45, pz);
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.35, 8), lensMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(px, 0.65, pz + (pz < 0 ? 0.3 : -0.3));
        scene.add(body, lens);
      });
    }

    function buildWolfMascot() {
      const grp = new THREE.Group();
      const furMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
      const bellyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const jerseyMat = new THREE.MeshLambertMaterial({ color: 0x1ea7fd });
      const snoutMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.48), jerseyMat);
      torso.position.y = 1.15;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.54, 0.56), furMat);
      head.position.y = 1.92;
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.32), bellyMat);
      snout.position.set(0, 1.84, 0.36);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.08), snoutMat);
      nose.position.set(0, 1.92, 0.53);
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), furMat);
      earL.position.set(-0.19, 2.32, 0);
      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), furMat);
      earR.position.set(0.19, 2.32, 0);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.2), furMat);
      armL.position.set(-0.48, 1.25, 0);
      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.2), furMat);
      armR.position.set(0.48, 1.25, 0);
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), snoutMat);
      legL.position.set(-0.18, 0.35, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), snoutMat);
      legR.position.set(0.18, 0.35, 0);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 6), furMat);
      tail.rotation.x = -0.9;
      tail.position.set(0, 0.9, -0.42);

      grp.add(torso, head, snout, nose, earL, earR, armL, armR, legL, legR, tail);
      grp.position.set(-8.5, 0, -55.4);
      grp.scale.set(1.35, 1.35, 1.35);
      grp.userData = { armL, armR, tail };
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

      const totalPosts = 64;
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

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.2, 6), postMat);
        post.position.set(fx, 1.6, fz);
        fenceGroup.add(post);
      }

      const ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(41.2, 41.2, 2.9, 56, 1, true), meshMat);
      ringMesh.scale.set(1.0, 1.0, 1.41);
      ringMesh.position.y = 1.55;
      fenceGroup.add(ringMesh);

      // Supporter Fence Banners ("Trapos" ficticios del norte)
      const brand = global.BrandRegistry ? global.BrandRegistry.getActiveBrand() : null;
      const banners = (brand && brand.trapos) || [
        { text: 'PASIÓN DE TRIBUNA', bg: '#0284c7', fg: '#ffffff', x: 0, z: -57.8, rotY: 0, w: 18 },
        { text: 'LA BANDA CELESTE', bg: '#ffffff', fg: '#0284c7', x: 24, z: -47.0, rotY: -0.52, w: 13 },
        { text: 'NORTE Y FÚTBOL', bg: '#0ea5e9', fg: '#ffffff', x: 40.8, z: -20, rotY: -Math.PI / 2, w: 16 },
        { text: 'ESTADIO DE LOS CERROS', bg: '#ffffff', fg: '#0f172a', x: 40.8, z: 20, rotY: -Math.PI / 2, w: 16 }
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

    function buildFootballGoal(x, z, rotY) {
      const goalGroup = new THREE.Group();
      const postMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });

      const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.44, 8), postMat);
      leftPost.position.set(-3.66, 1.22, 0);
      const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.44, 8), postMat);
      rightPost.position.set(3.66, 1.22, 0);
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.4, 8), postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 2.44, 0);

      const netGeo = new THREE.BoxGeometry(7.32, 2.42, 2.0, 14, 6, 4);
      const netBox = new THREE.Mesh(netGeo, netMat);
      netBox.position.set(0, 1.21, -1.0);
      const posAttr = netGeo.attributes.position;
      const basePos = new Float32Array(posAttr.array.length);
      basePos.set(posAttr.array);
      netBox.userData.basePos = basePos;
      netBox.userData.goalZ = z;
      netBox.userData.rotY = rotY;
      netBox.userData.rippleTime = 0;
      netBox.userData.impactLocalX = 0;
      netBox.userData.impactLocalY = 1.2;
      netBox.userData.impactStrength = 0;
      goalNets.push(netBox);

      goalGroup.add(leftPost, rightPost, crossbar, netBox);
      goalGroup.position.set(x, 0, z);
      goalGroup.rotation.y = rotY;
      scene.add(goalGroup);
    }

    function buildDugoutsAndTunnel() {
      [-11, 11].forEach((zPos) => {
        const dugout = new THREE.Group();
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.7, 9.5),
          new THREE.MeshLambertMaterial({ color: 0x2980b9 })
        );
        base.position.y = 0.35;
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.85, 9.6),
          new THREE.MeshLambertMaterial({ color: 0x1e293b })
        );
        roof.position.set(-0.2, 1.25, 0);
        const seats = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.5, 8.8),
          new THREE.MeshLambertMaterial({ color: 0xea580c })
        );
        seats.position.set(-0.3, 0.65, 0);
        dugout.add(base, roof, seats);
        dugout.position.set(-36.4, 0, zPos);
        scene.add(dugout);
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

      // Central Tunnel
      const tunnelFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 3.6, 4.2),
        new THREE.MeshLambertMaterial({ color: 0xf8fafc })
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
        new THREE.MeshLambertMaterial({ color: 0xd6d0c2 })
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

      // Side Retaining Walls
      const flankMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
      [-44.2, 44.2].forEach((fz) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 20, 1.2), flankMat);
        wall.position.set(-49, 10, fz);
        plateaGroup.add(wall);
      });

      // Cream/Beige 4-Story Press & VIP Building (Copa América 2011)
      const buildingGroup = new THREE.Group();
      const creamMat = new THREE.MeshLambertMaterial({ color: 0xded8c8 });
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

      for (let pz = -42; pz <= 42; pz += 7) {
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(8.85, 9.3, 0.55), creamMat);
        pilaster.position.set(-61.4, 23.6, pz);
        buildingGroup.add(pilaster);
      }

      // 4th-level Broadcast Tower
      const topTower = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.6, 25), creamMat);
      topTower.position.set(-61.5, 29.8, 0);
      const topGlass = new THREE.Mesh(new THREE.BoxGeometry(8.75, 1.6, 23), winMat);
      topGlass.position.set(-61.4, 29.9, 0);
      const backSubstructure = new THREE.Mesh(
        new THREE.BoxGeometry(8.2, 19.0, 86),
        new THREE.MeshLambertMaterial({ color: 0xd1ccc0 })
      );
      backSubstructure.position.set(-61.5, 9.5, 0);
      buildingGroup.add(topTower, topGlass, backSubstructure);
      plateaGroup.add(buildingGroup);

      populatePlateaSpectators(plateaGroup);
      scene.add(plateaGroup);
    }

    function createSpectatorGeometry() {
      // Stylized human silhouette (torso + shoulders + head) merged into 1 BufferGeometry
      const parts = [
        { g: new THREE.BoxGeometry(0.42, 0.56, 0.24), y: 0.28 },
        { g: new THREE.BoxGeometry(0.56, 0.18, 0.22), y: 0.50 },
        { g: new THREE.SphereGeometry(0.155, 7, 6), y: 0.75 }
      ];
      let totalVerts = 0;
      const nonIndexed = parts.map((p) => {
        const ng = p.g.toNonIndexed();
        ng.translate(0, p.y, 0);
        totalVerts += ng.attributes.position.count;
        return ng;
      });
      const positions = new Float32Array(totalVerts * 3);
      const normals = new Float32Array(totalVerts * 3);
      let offset = 0;
      nonIndexed.forEach((ng) => {
        positions.set(ng.attributes.position.array, offset);
        normals.set(ng.attributes.normal.array, offset);
        offset += ng.attributes.position.array.length;
        ng.dispose();
      });
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      return merged;
    }

    function populatePlateaSpectators(group) {
      const count = 780;
      const geo = createSpectatorGeometry();
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      plateaCrowdMesh = new THREE.InstancedMesh(geo, mat, count);
      const dummy = new THREE.Object3D();
      const colors = [
        new THREE.Color(0x1ea7fd),
        new THREE.Color(0xf8fafc),
        new THREE.Color(0x0284c7),
        new THREE.Color(0x1e293b),
        new THREE.Color(0x7dd3fc)
      ];

      for (let i = 0; i < count; i++) {
        const isUpper = i % 2 === 0;
        const z = (Math.random() - 0.5) * 82;
        const t = Math.random();
        const x = isUpper ? -49.5 - t * 8.0 : -40.2 - t * 7.2;
        const y = isUpper ? 11.1 + t * 7.8 : 1.9 + t * 6.4;
        dummy.position.set(x, y, z);
        dummy.rotation.y = Math.PI * 0.5;
        const hScale = 0.88 + Math.random() * 0.28;
        const wScale = 0.90 + Math.random() * 0.22;
        dummy.scale.set(wScale, hScale, wScale);
        dummy.updateMatrix();
        plateaCrowdMesh.setMatrixAt(i, dummy.matrix);
        plateaCrowdMesh.setColorAt(i, colors[i % colors.length]);
      }
      plateaCrowdMesh.instanceMatrix.needsUpdate = true;
      if (plateaCrowdMesh.instanceColor) plateaCrowdMesh.instanceColor.needsUpdate = true;
      group.add(plateaCrowdMesh);
    }

    function buildOvalBowlAndPreferencial() {
      const bowlGroup = new THREE.Group();
      const numSegments = 68;
      const numSteps = 14;
      const startAngle = -0.74 * Math.PI;
      const endAngle = 0.74 * Math.PI;

      const celesteMat = new THREE.MeshLambertMaterial({ color: 0x2c82d9 });
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
      const royalBlueWallMat = new THREE.MeshLambertMaterial({ color: 0x1d63b8 });
      const exteriorLightBlueMat = new THREE.MeshLambertMaterial({ color: 0x4ba3e3 });

      for (let s = 0; s < numSegments; s++) {
        const a1 = startAngle + (s / numSegments) * (endAngle - startAngle);
        const a2 = startAngle + ((s + 1) / numSegments) * (endAngle - startAngle);
        const aMid = (a1 + a2) * 0.5;
        const stepMat = Math.floor(s / 2) % 2 === 0 ? celesteMat : whiteMat;

        for (let r = 0; r < numSteps; r++) {
          const innerRx = 41.8 + r * 1.05;
          const innerRz = 58.8 + r * 1.08;
          const stepY = 1.6 + r * 0.68;
          const x = Math.cos(aMid) * innerRx;
          const z = Math.sin(aMid) * innerRz;
          const dx = Math.cos(a2) * innerRx - Math.cos(a1) * innerRx;
          const dz = Math.sin(a2) * innerRz - Math.sin(a1) * innerRz;
          const segWidth = Math.sqrt(dx * dx + dz * dz) + 0.25;

          const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, segWidth), stepMat);
          stepMesh.position.set(x, stepY, z);
          stepMesh.rotation.y = -aMid;
          bowlGroup.add(stepMesh);
        }

        const outerRx = 41.8 + numSteps * 1.05 + 0.8;
        const outerRz = 58.8 + numSteps * 1.08 + 0.8;
        const ox = Math.cos(aMid) * outerRx;
        const oz = Math.sin(aMid) * outerRz;
        const odx = Math.cos(a2) * outerRx - Math.cos(a1) * outerRx;
        const odz = Math.sin(a2) * outerRz - Math.sin(a1) * outerRz;
        const oWidth = Math.sqrt(odx * odx + odz * odz) + 0.3;

        const facadeWall = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 11.8, oWidth),
          s % 3 === 0 ? whiteMat : exteriorLightBlueMat
        );
        facadeWall.position.set(ox, 5.9, oz);
        facadeWall.rotation.y = -aMid;
        bowlGroup.add(facadeWall);

        const ix = Math.cos(aMid) * 41.2;
        const iz = Math.sin(aMid) * 58.2;
        const innerWall = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 2.2, oWidth * 0.76),
          royalBlueWallMat
        );
        innerWall.position.set(ix, 1.1, iz);
        innerWall.rotation.y = -aMid;
        bowlGroup.add(innerWall);
      }

      populateBowlSpectatorsAndFlags(bowlGroup, startAngle, endAngle);
      scene.add(bowlGroup);
    }

    function populateBowlSpectatorsAndFlags(group, startAngle, endAngle) {
      const totalFans = 1800;
      const fanGeo = createSpectatorGeometry();
      const fanMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      bowlCrowdMesh = new THREE.InstancedMesh(fanGeo, fanMat, totalFans);

      const dummy = new THREE.Object3D();
      const palette = [
        new THREE.Color(0x1ea7fd),
        new THREE.Color(0xf8fafc),
        new THREE.Color(0x0284c7),
        new THREE.Color(0x7dd3fc),
        new THREE.Color(0x1e293b)
      ];

      for (let i = 0; i < totalFans; i++) {
        const angle = startAngle + Math.random() * (endAngle - startAngle);
        const step = Math.floor(Math.random() * 13);
        const rx = 42.0 + step * 1.05;
        const rz = 59.0 + step * 1.08;
        dummy.position.set(Math.cos(angle) * rx, 1.95 + step * 0.68, Math.sin(angle) * rz);
        dummy.rotation.y = -angle - Math.PI * 0.5;
        const hScale = 0.88 + Math.random() * 0.28;
        const wScale = 0.90 + Math.random() * 0.24;
        dummy.scale.set(wScale, hScale, wScale);
        dummy.updateMatrix();
        bowlCrowdMesh.setMatrixAt(i, dummy.matrix);
        bowlCrowdMesh.setColorAt(i, palette[i % palette.length]);
      }
      bowlCrowdMesh.instanceMatrix.needsUpdate = true;
      if (bowlCrowdMesh.instanceColor) bowlCrowdMesh.instanceColor.needsUpdate = true;
      group.add(bowlCrowdMesh);

      // Vertical "Tirantes"
      const tiranteAngles = [-Math.PI * 0.56, -Math.PI * 0.5, -Math.PI * 0.44, -0.15, 0, 0.15, Math.PI * 0.5];
      tiranteAngles.forEach((ang, idx) => {
        const banner = new THREE.Mesh(
          new THREE.BoxGeometry(12.5, 0.22, 1.8),
          new THREE.MeshLambertMaterial({ color: idx % 2 === 0 ? 0x38bdf8 : 0xffffff })
        );
        banner.position.set(Math.cos(ang) * 48.0, 6.6, Math.sin(ang) * 65.0);
        banner.rotation.y = -ang;
        banner.rotation.z = 0.56;
        group.add(banner);
      });

      // Waving Flags
      for (let f = 0; f < 30; f++) {
        const ang = startAngle + (f / 30) * (endAngle - startAngle);
        const step = 4 + (f % 8);
        const flagPivot = new THREE.Group();
        flagPivot.position.set(Math.cos(ang) * (42.0 + step * 1.05), 2.6 + step * 0.68, Math.sin(ang) * (59.0 + step * 1.08));

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.9, 5),
          new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
        );
        pole.position.y = 1.45;
        const cloth = new THREE.Mesh(
          new THREE.PlaneGeometry(2.0, 1.2),
          new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? 0x38bdf8 : 0xffffff, side: THREE.DoubleSide })
        );
        cloth.position.set(1.0, 2.3, 0);
        flagPivot.add(pole, cloth);
        group.add(flagPivot);
        crowdFlags.push({ pivot: flagPivot, phase: f * 0.65 });
      }
    }

    function buildNorthScoreboard() {
      const sbGroup = new THREE.Group();
      const supportBase = new THREE.Mesh(
        new THREE.BoxGeometry(15.5, 4.2, 2.2),
        new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
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
      const sbHeader = brand ? brand.scoreboardHeader : 'ESTADIO DE LOS CERROS  •  ATLÉTICO LOS CERROS';
      const homeShort = brand ? brand.homeClub.shortName : 'ALC';
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

      const latticeMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, wireframe: true });
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

      towerLocations.forEach((t) => {
        const towerGroup = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.7, t.height, 1.7, 2, 18, 2), latticeMat);
        shaft.position.y = t.height / 2;
        towerGroup.add(shaft);

        const headFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.8, 5.4), frameMat);
        headFrame.position.y = t.height + 1.8;
        headFrame.lookAt(t.aimX - t.x, 0, t.aimZ - t.z);

        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfefce8 });
        const bulbFace = new THREE.Mesh(new THREE.BoxGeometry(1.35, 4.2, 4.8), bulbMat);
        bulbFace.position.y = t.height + 1.8;
        bulbFace.lookAt(t.aimX - t.x, 0, t.aimZ - t.z);
        floodlightBulbs.push(bulbMat);

        // Volumetric Light Cone for Night/Sunset Stadium Atmosphere
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.06,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const beamGeo = new THREE.ConeGeometry(18, 48, 16, 1, true);
        beamGeo.translate(0, -24, 0);
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.set(0, t.height + 1.5, 0);
        const targetDir = new THREE.Vector3(t.aimX - t.x, -t.height, t.aimZ - t.z).normalize();
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), targetDir);
        floodlightBeams.push(beamMat);

        towerGroup.add(headFrame, bulbFace, beamMesh);
        towerGroup.position.set(t.x, 0, t.z);
        scene.add(towerGroup);

        const spot = new THREE.PointLight(0xf8fafc, 0.35, 200);
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

      const carColors = [0xffffff, 0xfacc15, 0x38bdf8, 0xef4444, 0xe2e8f0];
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
      for (let b = 0; b < 90; b++) {
        const angle = (b / 90) * Math.PI * 2;
        const dist = 108 + (b % 5) * 24;
        const bx = Math.cos(angle) * dist;
        const bz = Math.sin(angle) * dist;
        if (bx > 62 && bx < 95) continue;

        const w = 8 + (b % 4) * 4;
        const d = 8 + (b % 3) * 4;
        const h = 4 + (b % 5) * 3.2;
        const bldg = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshLambertMaterial({ color: houseColors[b % houseColors.length] })
        );
        bldg.position.set(bx, h / 2, bz);
        cityGroup.add(bldg);
      }

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

      // Ambient Celeste Smoke rising gently from Popular Lobo Norte
      const sCount = 90;
      const sGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(sCount * 3);
      for (let i = 0; i < sCount; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * 46;
        sPos[i * 3 + 1] = 4 + Math.random() * 14;
        sPos[i * 3 + 2] = -60 - Math.random() * 10;
      }
      sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      smokeSystem = new THREE.Points(
        sGeo,
        new THREE.PointsMaterial({ color: 0x7dd3fc, size: 3.4, transparent: true, opacity: 0.18, depthWrite: false })
      );
      scene.add(smokeSystem);
    }

    function setSkyMode(mode) {
      appState.skyMode = mode;

      if (skyDomeMesh) {
        skyDomeMesh.material.map = createSkyDomeTexture(mode);
        skyDomeMesh.material.needsUpdate = true;
      }

      if (mode === 'day') {
        scene.fog.color.setHex(0x93c5fd);
        hemiLight.color.setHex(0xe0f2fe);
        hemiLight.groundColor.setHex(0x1e3a2f);
        hemiLight.intensity = 0.88;
        sunLight.color.setHex(0xfffbeb);
        sunLight.intensity = 1.2;
        sunLight.position.set(-70, 125, 35);
        floodlightSpotlights.forEach((s) => (s.intensity = 0.08));
        floodlightBulbs.forEach((b) => b.color.setHex(0xcbd5e1));
        floodlightBeams.forEach((bm) => (bm.opacity = 0.0));
        pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.05));
      } else if (mode === 'sunset') {
        scene.fog.color.setHex(0x4a2346);
        hemiLight.color.setHex(0xf472b6);
        hemiLight.groundColor.setHex(0x1f2937);
        hemiLight.intensity = 0.72;
        sunLight.color.setHex(0xfb923c);
        sunLight.intensity = 1.0;
        sunLight.position.set(-120, 46, -35);
        floodlightSpotlights.forEach((s) => (s.intensity = 0.42));
        floodlightBulbs.forEach((b) => b.color.setHex(0xfef9c3));
        floodlightBeams.forEach((bm) => (bm.opacity = 0.045));
        pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.45));
      } else {
        scene.fog.color.setHex(0x050b16);
        hemiLight.color.setHex(0xbae6fd);
        hemiLight.groundColor.setHex(0x090d16);
        hemiLight.intensity = 0.36;
        sunLight.color.setHex(0xe0f2fe);
        sunLight.intensity = 0.58;
        sunLight.position.set(10, 115, 0);
        floodlightSpotlights.forEach((s) => (s.intensity = 0.82));
        floodlightBulbs.forEach((b) => b.color.setHex(0xffffff));
        floodlightBeams.forEach((bm) => (bm.opacity = 0.11));
        pressWindowMats.forEach((m) => (m.emissiveIntensity = 0.85));
      }
    }



  function buildAll(targetScene, lights) {
    stadiumRefs.scene = targetScene;
    stadiumRefs.hemiLight = lights.hemiLight;
    stadiumRefs.sunLight = lights.sunLight;
    scene = targetScene;
    hemiLight = lights.hemiLight;
    sunLight = lights.sunLight;

    // Bind local variables expected by extracted builders
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
    stadiumRefs.highwayCars = highwayCars;
    stadiumRefs.goalNets = goalNets;
    stadiumRefs.wolfMascot = wolfMascot;

    return stadiumRefs;
  }

  function deformGoalNet(goalZ, impactX, impactY, strength = 1.0) {
    goalNets.forEach((net) => {
      if (Math.sign(net.userData.goalZ) !== Math.sign(goalZ)) return;
      net.userData.rippleTime = 1.1;
      net.userData.impactLocalX = net.userData.rotY ? -impactX : impactX;
      net.userData.impactLocalY = Math.max(0.2, Math.min(2.2, impactY)) - 1.21;
      net.userData.impactStrength = Math.min(1.6, Math.max(0.4, strength));
    });
  }

  function relaxGoalNets(dt) {
    goalNets.forEach((net) => {
      if (net.userData.rippleTime <= 0) return;
      net.userData.rippleTime = Math.max(0, net.userData.rippleTime - dt);
      const t = net.userData.rippleTime;
      const pos = net.geometry.attributes.position;
      const base = net.userData.basePos;
      const ix = net.userData.impactLocalX;
      const iy = net.userData.impactLocalY;
      const str = net.userData.impactStrength * (t / 1.1);
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];
        if (bz < -0.1) {
          const dist = Math.hypot(bx - ix, by - iy);
          const falloff = Math.exp(-dist * 0.45);
          const wave = Math.sin((1.1 - t) * 18) * 0.25 + 0.75;
          pos.array[i * 3 + 2] = bz - str * falloff * wave * 0.85;
        } else {
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
