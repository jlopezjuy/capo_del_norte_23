/**
 * Team & Fixture Data Module (Escenario A — Clubes y planteles ficticios independientes)
 */
(function (global) {
  'use strict';

  const HOME_CLUB = {
    id: 'ssc',
    name: 'San Salvador Celeste',
    fullName: 'San Salvador Celeste FC',
    shortName: 'SSC',
    shirtColor: 0x1ea7fd,
    shirtHex: '#1ea7fd',
    secondaryColor: 0xf8fafc,
    shortsColor: 0xf8fafc,
    sockColor: 0x1ea7fd,
    gkColor: 0x10b981,
    formation: '4-3-3',
    coach: 'D. Ferreyra',
    stadium: 'Estadio de los Cerros'
  };

  const HOME_SQUAD = [
    { number: 1, name: 'M. Benítez', role: 'GK', baseX: 0, baseZ: 48.0, speed: 6.4 },
    { number: 4, name: 'L. Quiroga', role: 'DF', baseX: 21, baseZ: 28.0, speed: 7.9 },
    { number: 2, name: 'R. Mamani', role: 'DF', baseX: 8, baseZ: 31.0, speed: 7.3 },
    { number: 6, name: 'G. Tejerina', role: 'DF', baseX: -8, baseZ: 31.0, speed: 7.2 },
    { number: 3, name: 'E. Aramayo', role: 'DF', baseX: -21, baseZ: 28.0, speed: 7.9 },
    { number: 5, name: 'H. Tolaba', role: 'MF', baseX: 0, baseZ: 14.0, speed: 7.6 },
    { number: 8, name: 'F. Cruz', role: 'MF', baseX: 14, baseZ: 8.0, speed: 7.8 },
    { number: 10, name: 'N. Apaza', role: 'MF', baseX: -14, baseZ: 8.0, speed: 8.0 },
    { number: 7, name: 'C. Mendoza', role: 'FW', baseX: 18, baseZ: -16.0, speed: 8.1 },
    { number: 9, name: 'T. Cardozo', role: 'FW', baseX: 0, baseZ: -22.0, speed: 8.3 },
    { number: 11, name: 'F. Vilte', role: 'FW', baseX: -18, baseZ: -16.0, speed: 8.4 }
  ];

  const LEAGUE_FIXTURE = [
    {
      id: 'fecha-final-cerros',
      date: '2026-11-28',
      kickoff: '20:00',
      tournament: 'Copa del Norte • Final Regional',
      round: 'Cuartos de Final (Vuelta)',
      labelBadge: 'COPA DEL NORTE • PARTIDO DESTACADO',
      stadium: 'Estadio de los Cerros',
      aggNote: 'Ida: SSC 1 - 0 GNF (Gol: R. Mamani)',
      opponent: {
        id: 'gnf',
        name: 'Golfo Nuevo FC',
        shortName: 'GNF',
        shirtColor: 0xfacc15,
        shirtHex: '#facc15',
        secondaryColor: 0x0f172a,
        shortsColor: 0x0f172a,
        altShirtColor: 0xf97316,
        altShirtHex: '#f97316',
        gkColor: 0x8b5cf6,
        formation: '4-4-2',
        coach: 'S. Morales',
        aggression: 0.72,
        squad: [
          { number: 1, name: 'Y. Cáceres', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'A. Zerpa', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.7 },
          { number: 2, name: 'F. Condori', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'N. Burgos', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'F. Choque', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.8 },
          { number: 8, name: 'J. Farfán', role: 'MF', baseX: -20, baseZ: -12.0, speed: 7.7 },
          { number: 5, name: 'F. Nieva', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.5 },
          { number: 10, name: 'M. Ibarra', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.6 },
          { number: 11, name: 'N. Ramos', role: 'MF', baseX: 20, baseZ: -12.0, speed: 8.2 },
          { number: 9, name: 'L. Gallardo', role: 'FW', baseX: -8, baseZ: 10.0, speed: 7.9 },
          { number: 7, name: 'P. Ríos', role: 'FW', baseX: 8, baseZ: 10.0, speed: 8.1 }
        ]
      }
    },
    {
      id: 'fecha-puna',
      date: '2026-10-18',
      kickoff: '18:00',
      tournament: 'Liga Regional del Norte',
      round: 'Fecha 34 • Clásico de Altura',
      labelBadge: 'LIGA DEL NORTE • CLÁSICO',
      stadium: 'Estadio de los Cerros',
      aggNote: 'Duelo de punteros en los cerros',
      opponent: {
        id: 'tuc',
        name: 'Tucumán Rojo',
        shortName: 'TUC',
        shirtColor: 0xdc2626,
        shirtHex: '#dc2626',
        secondaryColor: 0xffffff,
        shortsColor: 0x0f172a,
        altShirtColor: 0x334155,
        altShirtHex: '#334155',
        gkColor: 0xf59e0b,
        formation: '4-3-3',
        coach: 'M. Paredes',
        aggression: 0.78,
        squad: [
          { number: 1, name: 'D. Alancay', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.4 },
          { number: 4, name: 'G. Velázquez', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.6 },
          { number: 2, name: 'J. Tapia', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.3 },
          { number: 6, name: 'A. Soriano', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'L. Segovia', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.8 },
          { number: 5, name: 'G. Vilca', role: 'MF', baseX: 0, baseZ: -16.0, speed: 7.5 },
          { number: 8, name: 'M. Ledesma', role: 'MF', baseX: -14, baseZ: -12.0, speed: 7.8 },
          { number: 7, name: 'L. Ocampos', role: 'FW', baseX: -18, baseZ: 8.0, speed: 8.2 },
          { number: 10, name: 'J. Salgado', role: 'MF', baseX: 14, baseZ: -10.0, speed: 8.0 },
          { number: 11, name: 'N. Brizuela', role: 'FW', baseX: 18, baseZ: 8.0, speed: 8.1 },
          { number: 9, name: 'J. Ferreiro', role: 'FW', baseX: 0, baseZ: 12.0, speed: 8.0 }
        ]
      }
    },
    {
      id: 'fecha-valles',
      date: '2026-10-11',
      kickoff: '16:30',
      tournament: 'Liga Regional del Norte',
      round: 'Fecha 33',
      labelBadge: 'LIGA DEL NORTE • FECHA 33',
      stadium: 'Estadio de los Cerros',
      aggNote: 'Contraste de indumentaria automático activo',
      opponent: {
        id: 'zsc',
        name: 'Zona Sur Celeste',
        shortName: 'ZSC',
        shirtColor: 0x38bdf8,
        shirtHex: '#38bdf8',
        secondaryColor: 0xffffff,
        shortsColor: 0x0f172a,
        altShirtColor: 0x1e293b,
        altShirtHex: '#1e293b',
        gkColor: 0xec4899,
        formation: '4-4-2',
        coach: 'R. Borda',
        aggression: 0.65,
        squad: [
          { number: 1, name: 'J. Ávila', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.3 },
          { number: 4, name: 'A. Llanos', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.5 },
          { number: 2, name: 'J. Puca', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'A. Lamas', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.1 },
          { number: 3, name: 'R. Guzmán', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.6 },
          { number: 8, name: 'E. Juárez', role: 'MF', baseX: -18, baseZ: -12.0, speed: 7.6 },
          { number: 5, name: 'A. Pereyra', role: 'MF', baseX: -6, baseZ: -14.0, speed: 7.4 },
          { number: 10, name: 'L. Acosta', role: 'MF', baseX: 6, baseZ: -14.0, speed: 7.7 },
          { number: 11, name: 'M. Paz', role: 'MF', baseX: 18, baseZ: -12.0, speed: 7.8 },
          { number: 9, name: 'L. Cáceres', role: 'FW', baseX: -7, baseZ: 10.0, speed: 7.9 },
          { number: 7, name: 'F. Romano', role: 'FW', baseX: 7, baseZ: 10.0, speed: 8.0 }
        ]
      }
    },
    {
      id: 'fecha-yungas',
      date: '2026-09-20',
      kickoff: '17:00',
      tournament: 'Copa del Norte',
      round: 'Semifinal Regional',
      labelBadge: 'COPA DEL NORTE • SEMIFINAL',
      stadium: 'Estadio de los Cerros',
      aggNote: 'Partido a todo o nada en el norte',
      opponent: {
        id: 'est',
        name: 'Estación Oeste',
        shortName: 'EST',
        shirtColor: 0x16a34a,
        shirtHex: '#16a34a',
        secondaryColor: 0xffffff,
        shortsColor: 0xffffff,
        altShirtColor: 0x064e3b,
        altShirtHex: '#064e3b',
        gkColor: 0xf59e0b,
        formation: '4-3-3',
        coach: 'A. Chávez',
        aggression: 0.70,
        squad: [
          { number: 1, name: 'L. Montero', role: 'GK', baseX: 0, baseZ: -48.0, speed: 6.3 },
          { number: 4, name: 'F. Díaz', role: 'DF', baseX: -20, baseZ: -30.0, speed: 7.6 },
          { number: 2, name: 'G. Cabana', role: 'DF', baseX: -7, baseZ: -33.0, speed: 7.2 },
          { number: 6, name: 'P. Nievas', role: 'DF', baseX: 7, baseZ: -33.0, speed: 7.2 },
          { number: 3, name: 'R. Correa', role: 'DF', baseX: 20, baseZ: -30.0, speed: 7.7 },
          { number: 8, name: 'N. Méndez', role: 'MF', baseX: -14, baseZ: -12.0, speed: 7.7 },
          { number: 5, name: 'F. Alarcón', role: 'MF', baseX: 0, baseZ: -15.0, speed: 7.5 },
          { number: 10, name: 'R. Villalba', role: 'MF', baseX: 14, baseZ: -12.0, speed: 8.0 },
          { number: 11, name: 'C. Soria', role: 'FW', baseX: -18, baseZ: 9.0, speed: 8.1 },
          { number: 9, name: 'M. Coronel', role: 'FW', baseX: 0, baseZ: 12.0, speed: 7.9 },
          { number: 7, name: 'N. Herrera', role: 'FW', baseX: 18, baseZ: 9.0, speed: 8.2 }
        ]
      }
    }
  ];

  function _hexDist(hexA, hexB) {
    const a = new THREE.Color(hexA);
    const b = new THREE.Color(hexB);
    return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
  }

  function resolveKitColors(opponent) {
    const clash = _hexDist(HOME_CLUB.shirtColor, opponent.shirtColor) < 0.45;
    if (clash && opponent.altShirtColor) {
      return {
        shirt: opponent.altShirtColor,
        hex: opponent.altShirtHex,
        secondary: 0xffffff,
        shorts: 0x0f172a,
        gk: opponent.gkColor,
        usedAlt: true
      };
    }
    return {
      shirt: opponent.shirtColor,
      hex: opponent.shirtHex,
      secondary: opponent.secondaryColor,
      shorts: opponent.shortsColor,
      gk: opponent.gkColor,
      usedAlt: false
    };
  }

  function getWeeklyMatch() {
    return LEAGUE_FIXTURE[0];
  }

  global.AFA_DATA = {
    GYE_CLUB: HOME_CLUB,
    GYE_SQUAD: HOME_SQUAD,
    AFA_FIXTURE: LEAGUE_FIXTURE,
    getWeeklyMatch,
    resolveKitColors
  };
})(window);
