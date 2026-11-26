/**
 * AFA_FIXTURE & Squad Data Module
 * Club Atlético Gimnasia y Esgrima de Jujuy — Temporada 2026
 */
(function (global) {
  'use strict';

  const GYE_CLUB = {
    id: 'gye',
    name: 'Gimnasia y Esgrima (J)',
    fullName: 'Club Atlético Gimnasia y Esgrima de Jujuy',
    shortName: 'GYE',
    primaryColor: 0x38bdf8,
    secondaryColor: 0xffffff,
    shortsColor: 0xffffff,
    gkColor: 0x10b981,
    primaryHex: '#38bdf8',
    secondaryHex: '#ffffff',
    formation: '4-3-3',
    coach: 'Hernán Pellerano',
    stadium: 'Estadio 23 de Agosto'
  };

  // Plantel base habitual de Gimnasia y Esgrima de Jujuy (Temporada 2026)
  const GYE_SQUAD = [
    { number: 1, name: 'M. Álvarez', role: 'GK', baseX: 0, baseZ: 48.0, speed: 6.4 },
    { number: 4, name: 'D. Minervino', role: 'DF', baseX: 21, baseZ: 28.0, speed: 7.9 },
    { number: 2, name: 'J. Varela', role: 'DF', baseX: 8, baseZ: 31.0, speed: 7.3 },
    { number: 6, name: 'G. Cosaro', role: 'DF', baseX: -8, baseZ: 31.0, speed: 7.2 },
    { number: 3, name: 'E. Endrizzi', role: 'DF', baseX: -21, baseZ: 28.0, speed: 7.9 },
    { number: 5, name: 'H. Soria', role: 'MF', baseX: 0, baseZ: 14.0, speed: 7.6 },
    { number: 8, name: 'F. Maidana', role: 'MF', baseX: 14, baseZ: 8.0, speed: 7.8 },
    { number: 10, name: 'J. P. Córdoba', role: 'MF', baseX: -14, baseZ: 8.0, speed: 8.0 },
    { number: 7, name: 'C. Menéndez', role: 'FW', baseX: 18, baseZ: -16.0, speed: 8.1 },
    { number: 9, name: 'O. Bianchi', role: 'FW', baseX: 0, baseZ: -22.0, speed: 8.3 },
    { number: 11, name: 'F. Molina', role: 'FW', baseX: -18, baseZ: -16.0, speed: 8.4 }
  ];

  // Calendario oficial AFA 2026 (Primera Nacional, Copa Argentina y Reducido)
  const AFA_FIXTURE = [
    {
      id: '2026-pn-reducido-qf-vuelta',
      date: '2026-11-28',
      kickoff: '20:00',
      tournament: 'Primera Nacional • Reducido',
      round: 'Cuartos de Final (Vuelta)',
      isHome: false,
      stadium: 'Estadio Abel Sastre (Juega en 23 de Agosto)',
      aggNote: 'Ida: GYE 1 - 0 MAD (Gol: J. Varela)',
      opponent: {
        id: 'mad',
        name: 'Deportivo Madryn',
        shortName: 'MAD',
        primaryColor: 0xfacc15,
        secondaryColor: 0x0f172a,
        shortsColor: 0x0f172a,
        altColor: 0xf1f5f9,
        altSecondaryColor: 0xfacc15,
        altShortsColor: 0x0f172a,
        gkColor: 0xf43f5e,
        primaryHex: '#facc15',
        secondaryHex: '#0f172a',
        formation: '4-4-2',
        coach: 'Luis García',
        aggression: 0.78,
        possession: 0.56,
        squad: [
          { number: 1, name: 'Y. Bonnín', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'A. Sosa', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.7 },
          { number: 2, name: 'F. Giacopuzzi', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'N. Ortiz', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'F. Bersano', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.8 },
          { number: 8, name: 'J. Cosi', role: 'MF', baseX: -20, baseZ: -12.0, speed: 7.7 },
          { number: 5, name: 'F. Recalde', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.5 },
          { number: 10, name: 'M. Meli', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.6 },
          { number: 11, name: 'N. Solís', role: 'MF', baseX: 20, baseZ: -12.0, speed: 8.2 },
          { number: 9, name: 'L. Silba', role: 'FW', baseX: -8, baseZ: 10.0, speed: 7.9 },
          { number: 7, name: 'L. Marinucci', role: 'FW', baseX: 8, baseZ: 10.0, speed: 8.1 }
        ]
      }
    },
    {
      id: '2026-pn-reducido-qf-ida',
      date: '2026-11-21',
      kickoff: '19:10',
      tournament: 'Primera Nacional • Reducido',
      round: 'Cuartos de Final (Ida)',
      isHome: true,
      stadium: 'Estadio 23 de Agosto',
      aggNote: 'Ida en San Salvador de Jujuy',
      opponent: {
        id: 'mad-ida',
        name: 'Deportivo Madryn',
        shortName: 'MAD',
        primaryColor: 0xfacc15,
        secondaryColor: 0x0f172a,
        shortsColor: 0x0f172a,
        altColor: 0xf1f5f9,
        altSecondaryColor: 0xfacc15,
        altShortsColor: 0x0f172a,
        gkColor: 0xf43f5e,
        primaryHex: '#facc15',
        secondaryHex: '#0f172a',
        formation: '4-4-2',
        coach: 'Luis García',
        aggression: 0.72,
        possession: 0.52,
        squad: [
          { number: 1, name: 'Y. Bonnín', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'A. Sosa', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.7 },
          { number: 2, name: 'F. Giacopuzzi', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'N. Ortiz', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'F. Bersano', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.8 },
          { number: 8, name: 'J. Cosi', role: 'MF', baseX: -20, baseZ: -12.0, speed: 7.7 },
          { number: 5, name: 'F. Recalde', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.5 },
          { number: 10, name: 'M. Meli', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.6 },
          { number: 11, name: 'N. Solís', role: 'MF', baseX: 20, baseZ: -12.0, speed: 8.2 },
          { number: 9, name: 'L. Silba', role: 'FW', baseX: -8, baseZ: 10.0, speed: 7.9 },
          { number: 7, name: 'L. Marinucci', role: 'FW', baseX: 8, baseZ: 10.0, speed: 8.1 }
        ]
      }
    },
    {
      id: '2026-pn-smt',
      date: '2026-10-18',
      kickoff: '18:00',
      tournament: 'Primera Nacional',
      round: 'Clásico del Norte • Fecha 36',
      isHome: true,
      stadium: 'Estadio 23 de Agosto',
      aggNote: 'Clásico interzonal del Norte Argentino',
      opponent: {
        id: 'smt',
        name: 'San Martín (T)',
        shortName: 'SMT',
        primaryColor: 0xdc2626,
        secondaryColor: 0xffffff,
        shortsColor: 0xffffff,
        altColor: 0x1e293b,
        altSecondaryColor: 0xdc2626,
        altShortsColor: 0x0f172a,
        gkColor: 0x22c55e,
        primaryHex: '#dc2626',
        secondaryHex: '#ffffff',
        formation: '4-2-3-1',
        coach: 'Diego Flores',
        aggression: 0.82,
        possession: 0.60,
        squad: [
          { number: 1, name: 'D. Sand', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'G. Bettini', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.6 },
          { number: 2, name: 'J. Orellana', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.3 },
          { number: 6, name: 'A. Dattola', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'L. Diarte', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.8 },
          { number: 5, name: 'G. Abregú', role: 'MF', baseX: -8, baseZ: -16.0, speed: 7.6 },
          { number: 8, name: 'M. García', role: 'MF', baseX: 8, baseZ: -16.0, speed: 7.7 },
          { number: 7, name: 'L. Fedele', role: 'MF', baseX: -20, baseZ: -2.0, speed: 8.1 },
          { number: 10, name: 'J. Cuevas', role: 'MF', baseX: 0, baseZ: 0.0, speed: 8.0 },
          { number: 11, name: 'N. Moreno', role: 'MF', baseX: 20, baseZ: -2.0, speed: 8.2 },
          { number: 9, name: 'J. Arias', role: 'FW', baseX: 0, baseZ: 14.0, speed: 8.1 }
        ]
      }
    },
    {
      id: '2026-pn-tem',
      date: '2026-10-11',
      kickoff: '17:00',
      tournament: 'Primera Nacional',
      round: 'Fecha 35 • Zona A',
      isHome: true,
      stadium: 'Estadio 23 de Agosto',
      aggNote: 'Prueba automática anti-choque de camiseta celeste',
      opponent: {
        id: 'tem',
        name: 'Temperley',
        shortName: 'TEM',
        primaryColor: 0x38bdf8,
        secondaryColor: 0xffffff,
        shortsColor: 0x0f172a,
        altColor: 0x1e293b,
        altSecondaryColor: 0x38bdf8,
        altShortsColor: 0x0f172a,
        gkColor: 0xf97316,
        primaryHex: '#38bdf8',
        secondaryHex: '#ffffff',
        formation: '4-4-2',
        coach: 'Aníbal Biggeri',
        aggression: 0.68,
        possession: 0.50,
        squad: [
          { number: 1, name: 'J. F. Rago', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.3 },
          { number: 4, name: 'A. Sosa', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.5 },
          { number: 2, name: 'J. Segovia', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.1 },
          { number: 6, name: 'A. Scolari', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.1 },
          { number: 3, name: 'R. Mazur', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.5 },
          { number: 8, name: 'E. Ibáñez', role: 'MF', baseX: -20, baseZ: -12.0, speed: 7.6 },
          { number: 5, name: 'A. Toledo', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.4 },
          { number: 10, name: 'L. Richarte', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.6 },
          { number: 11, name: 'M. Krüger', role: 'MF', baseX: 20, baseZ: -12.0, speed: 7.8 },
          { number: 9, name: 'L. López', role: 'FW', baseX: -8, baseZ: 10.0, speed: 7.9 },
          { number: 7, name: 'F. Ayunta', role: 'FW', baseX: 8, baseZ: 10.0, speed: 7.8 }
        ]
      }
    },
    {
      id: '2026-pn-qui',
      date: '2026-10-04',
      kickoff: '19:30',
      tournament: 'Primera Nacional',
      round: 'Fecha 34 • Zona A',
      isHome: true,
      stadium: 'Estadio 23 de Agosto',
      aggNote: 'Duelo histórico de ascenso',
      opponent: {
        id: 'qui',
        name: 'Quilmes',
        shortName: 'QUI',
        primaryColor: 0xf8fafc,
        secondaryColor: 0x1e3a8a,
        shortsColor: 0x1e3a8a,
        altColor: 0x1e3a8a,
        altSecondaryColor: 0xf8fafc,
        altShortsColor: 0x1e3a8a,
        gkColor: 0xeab308,
        primaryHex: '#f8fafc',
        secondaryHex: '#1e3a8a',
        formation: '4-3-3',
        coach: 'Sergio Rondina',
        aggression: 0.74,
        possession: 0.55,
        squad: [
          { number: 1, name: 'E. Glellel', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'D. Torrent', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.6 },
          { number: 2, name: 'G. Ferreira', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'M. Allende', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'L. Alfonso', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.7 },
          { number: 5, name: 'I. Ramírez', role: 'MF', baseX: 0, baseZ: -15.0, speed: 7.5 },
          { number: 8, name: 'M. Luna', role: 'MF', baseX: -14, baseZ: -10.0, speed: 7.7 },
          { number: 10, name: 'R. Allende', role: 'MF', baseX: 14, baseZ: -10.0, speed: 7.8 },
          { number: 7, name: 'L. Parisi', role: 'FW', baseX: -18, baseZ: 10.0, speed: 8.0 },
          { number: 9, name: 'T. González', role: 'FW', baseX: 0, baseZ: 14.0, speed: 8.1 },
          { number: 11, name: 'A. Batista', role: 'FW', baseX: 18, baseZ: 10.0, speed: 8.0 }
        ]
      }
    },
    {
      id: '2026-ca-fer',
      date: '2026-09-20',
      kickoff: '21:10',
      tournament: 'Copa Argentina',
      round: 'Octavos de Final',
      isHome: true,
      stadium: 'Estadio 23 de Agosto',
      aggNote: 'Cruce eliminatorio directo',
      opponent: {
        id: 'fer',
        name: 'Ferro Carril Oeste',
        shortName: 'FER',
        primaryColor: 0x16a34a,
        secondaryColor: 0xffffff,
        shortsColor: 0xffffff,
        altColor: 0xf97316,
        altSecondaryColor: 0x16a34a,
        altShortsColor: 0x0f172a,
        gkColor: 0xf43f5e,
        primaryHex: '#16a34a',
        secondaryHex: '#ffffff',
        formation: '4-4-2',
        coach: 'Aníbal Ruiz',
        aggression: 0.70,
        possession: 0.53,
        squad: [
          { number: 1, name: 'L. Ruiz', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.3 },
          { number: 4, name: 'F. Murillo', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.6 },
          { number: 2, name: 'G. Rodríguez', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'P. Boolsen', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'R. Ayala', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.6 },
          { number: 8, name: 'N. Gómez', role: 'MF', baseX: -20, baseZ: -12.0, speed: 7.6 },
          { number: 5, name: 'F. Mussis', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.4 },
          { number: 10, name: 'R. Blanco', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.8 },
          { number: 11, name: 'C. Mosca', role: 'MF', baseX: 20, baseZ: -12.0, speed: 7.9 },
          { number: 9, name: 'M. Levato', role: 'FW', baseX: -8, baseZ: 10.0, speed: 8.0 },
          { number: 7, name: 'N. Retamar', role: 'FW', baseX: 8, baseZ: 10.0, speed: 8.1 }
        ]
      }
    }
  ];

  function colorDistance(hexA, hexB) {
    const rA = (hexA >> 16) & 255;
    const gA = (hexA >> 8) & 255;
    const bA = hexA & 255;
    const rB = (hexB >> 16) & 255;
    const gB = (hexB >> 8) & 255;
    const bB = hexB & 255;
    return Math.sqrt((rA - rB) ** 2 + (gA - gB) ** 2 + (bA - bB) ** 2);
  }

  /**
   * Resuelve automáticamente el choque de colores frente a la albiceleste de Gimnasia.
   */
  function resolveKitColors(opponent) {
    const distPrimary = colorDistance(GYE_CLUB.primaryColor, opponent.primaryColor);
    const distWhite = colorDistance(GYE_CLUB.secondaryColor, opponent.primaryColor);
    const clash = distPrimary < 115 || distWhite < 85;
    if (clash && opponent.altColor !== undefined) {
      return {
        shirt: opponent.altColor,
        secondary: opponent.altSecondaryColor || opponent.secondaryColor,
        shorts: opponent.altShortsColor || opponent.shortsColor,
        gk: opponent.gkColor || 0xf43f5e,
        usedAlt: true,
        hex: '#' + opponent.altColor.toString(16).padStart(6, '0')
      };
    }
    return {
      shirt: opponent.primaryColor,
      secondary: opponent.secondaryColor,
      shorts: opponent.shortsColor,
      gk: opponent.gkColor || 0xf43f5e,
      usedAlt: false,
      hex: opponent.primaryHex || ('#' + opponent.primaryColor.toString(16).padStart(6, '0'))
    };
  }

  /**
   * Selecciona automáticamente el partido oficial de la semana según la fecha del navegador.
   */
  function getWeeklyMatch(today = new Date()) {
    const t = today.getTime();
    const sorted = [...AFA_FIXTURE].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // 1. Buscar partido dentro de +-4 días de hoy
    let best = sorted.find((m) => Math.abs(new Date(m.date + 'T20:00:00').getTime() - t) <= 4 * 24 * 60 * 60 * 1000);
    if (best) return { ...best, labelBadge: 'FECHA AFA • ESTA SEMANA' };

    // 2. Buscar próximo partido oficial programado
    best = sorted.find((m) => new Date(m.date + 'T20:00:00').getTime() >= t - sevenDaysMs);
    if (best) return { ...best, labelBadge: 'PRÓXIMA FECHA AFA' };

    // 3. Fallback: último cruce oficial relevante
    best = sorted[sorted.length - 1];
    return { ...best, labelBadge: 'ÚLTIMO CRUCE OFICIAL AFA' };
  }

  global.AFA_DATA = {
    GYE_CLUB,
    GYE_SQUAD,
    AFA_FIXTURE,
    resolveKitColors,
    getWeeklyMatch
  };
})(window);
