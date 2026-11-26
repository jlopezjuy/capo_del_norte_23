/**
 * BrandRegistry & SafeAssetResolver — Separación de marcas del motor de juego.
 * Perfil activo por defecto: 'independent' (Escenario A — publicación pública segura).
 */
(function (global) {
  'use strict';

  const DistributionProfile = Object.freeze({
    ACTIVE: 'independent' // 'independent' | 'licensed'
  });

  const BrandRegistry = Object.freeze({
    independent: {
      gameTitle: 'Pasión de Tribuna 3D',
      gameShortTitle: 'Pasión de Tribuna',
      subtitle: 'Fútbol del Norte • Estadio de los Cerros',
      badgeLabel: 'COPA DEL NORTE • FECHA DE LA SEMANA',
      stadiumName: 'Estadio de los Cerros',
      stadiumFacadeLeft: 'S S',
      stadiumFacadeRight: 'C J',
      stadiumYearLeft: '-19',
      stadiumYearRight: '88-',
      ledTicker: 'PASIÓN DE TRIBUNA   •   ESTADIO DE LOS CERROS   •   SAN SALVADOR CELESTE   •   COPA REGIONAL   •   ',
      scoreboardHeader: 'ESTADIO DE LOS CERROS  •  SAN SALVADOR CELESTE',
      goalBannerHome: '¡GOOOOL DEL CELESTE!',
      homeClub: {
        id: 'ssc',
        name: 'San Salvador Celeste',
        fullName: 'San Salvador Celeste FC',
        shortName: 'SSC',
        primaryHex: '#1ea7fd',
        secondaryHex: '#f8fafc',
        formation: '4-3-3',
        coach: 'D. Ferreyra'
      },
      trapos: [
        { text: 'PASIÓN DE TRIBUNA', bg: '#0284c7', fg: '#ffffff', x: 0, z: -57.8, rotY: 0, w: 18 },
        { text: 'LA BANDA CELESTE', bg: '#ffffff', fg: '#0284c7', x: 24, z: -47.0, rotY: -0.52, w: 13 },
        { text: 'NORTE Y FÚTBOL', bg: '#0ea5e9', fg: '#ffffff', x: 40.8, z: -20, rotY: -Math.PI / 2, w: 16 },
        { text: 'ESTADIO DE LOS CERROS', bg: '#ffffff', fg: '#0f172a', x: 40.8, z: 20, rotY: -Math.PI / 2, w: 16 }
      ],
      sectors: {
        platea_alta: { name: 'Platea Alta "Los Cerros"', shortName: 'Platea Alta' },
        platea_baja: { name: 'Platea Baja "Los Cerros"', shortName: 'Platea Baja' },
        preferencial: { name: 'Tribuna Preferencial Este', shortName: 'Preferencial' },
        popular_norte: { name: 'Popular Norte', shortName: 'Popular Norte' },
        popular_sur: { name: 'Popular Sur', shortName: 'Popular Sur' }
      }
    }
  });

  function getActiveBrand() {
    return BrandRegistry[DistributionProfile.ACTIVE] || BrandRegistry.independent;
  }

  global.BrandRegistry = {
    DistributionProfile,
    getActiveBrand
  };
})(window);
