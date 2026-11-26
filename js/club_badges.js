/**
 * ClubBadges — Emblemas vectoriales SVG reutilizables (provisionales estilizados para web)
 * Usados en Lobby, Marcador HUD, Banner de Gol y Pantalla de Estadísticas.
 */
(function (global) {
  'use strict';

  const CLUB_STYLES = {
    gye: { label: 'GYE', bg1: '#38bdf8', bg2: '#ffffff', text: '#06101f', pattern: 'stripes', accent: '#0284c7' },
    mad: { label: 'MAD', bg1: '#facc15', bg2: '#0f172a', text: '#ffffff', pattern: 'stripes', accent: '#facc15' },
    'mad-ida': { label: 'MAD', bg1: '#facc15', bg2: '#0f172a', text: '#ffffff', pattern: 'stripes', accent: '#facc15' },
    smt: { label: 'SMT', bg1: '#dc2626', bg2: '#ffffff', text: '#0f172a', pattern: 'stripes', accent: '#dc2626' },
    tem: { label: 'TEM', bg1: '#38bdf8', bg2: '#ffffff', text: '#0f172a', pattern: 'band', accent: '#0284c7' },
    qui: { label: 'QUI', bg1: '#f8fafc', bg2: '#1e3a8a', text: '#1e3a8a', pattern: 'half', accent: '#1e3a8a' },
    fer: { label: 'FER', bg1: '#16a34a', bg2: '#ffffff', text: '#064e3b', pattern: 'band', accent: '#16a34a' }
  };

  function getSvg(clubId, overrideHex = null, size = 48) {
    const st = CLUB_STYLES[clubId] || { label: 'RIV', bg1: overrideHex || '#facc15', bg2: '#0f172a', text: '#ffffff', pattern: 'stripes', accent: '#facc15' };
    const primary = overrideHex && clubId !== 'gye' ? overrideHex : st.bg1;
    const secondary = st.bg2;
    const uid = `badge-${clubId}-${Math.random().toString(36).slice(2, 7)}`;

    let innerPattern = '';
    if (st.pattern === 'stripes') {
      innerPattern = `
        <rect x="6" y="4" width="12" height="56" fill="${primary}"/>
        <rect x="18" y="4" width="12" height="56" fill="${secondary}"/>
        <rect x="30" y="4" width="12" height="56" fill="${primary}"/>
        <rect x="42" y="4" width="14" height="56" fill="${secondary}"/>
      `;
    } else if (st.pattern === 'band') {
      innerPattern = `
        <rect x="4" y="4" width="56" height="56" fill="${primary}"/>
        <polygon points="4,46 46,4 58,4 58,16 16,58 4,58" fill="${secondary}" opacity="0.92"/>
      `;
    } else {
      innerPattern = `
        <rect x="4" y="4" width="28" height="56" fill="${primary}"/>
        <rect x="32" y="4" width="28" height="56" fill="${secondary}"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" class="shrink-0 drop-shadow">
        <defs>
          <clipPath id="${uid}">
            <path d="M10 8h44v24c0 14-22 24-22 24S10 46 10 32V8z"/>
          </clipPath>
        </defs>
        <g clip-path="url(#${uid})">
          ${innerPattern}
        </g>
        <path d="M10 8h44v24c0 14-22 24-22 24S10 46 10 32V8z" fill="none" stroke="#f8fafc" stroke-width="2.6"/>
        <rect x="13" y="21" width="38" height="16" rx="4" fill="rgba(6,16,31,0.88)" stroke="${st.accent}" stroke-width="1.2"/>
        <text x="32" y="32.5" text-anchor="middle" font-family="Barlow Condensed, Arial, sans-serif" font-weight="900" font-size="13" fill="#f8fafc" letter-spacing="0.6">${st.label}</text>
      </svg>
    `;
  }

  global.ClubBadges = { getSvg };
})(window);
