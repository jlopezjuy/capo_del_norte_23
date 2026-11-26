/**
 * ClubBadges — Emblemas vectoriales SVG originales para clubes ficticios (Escenario A).
 */
(function (global) {
  'use strict';

  const CLUB_STYLES = {
    ssc: { label: 'SSC', bg1: '#1ea7fd', bg2: '#f8fafc', text: '#0b1320', pattern: 'stripes', accent: '#38bdf8' },
    gnf: { label: 'GNF', bg1: '#facc15', bg2: '#0f172a', text: '#ffffff', pattern: 'stripes', accent: '#facc15' },
    tuc: { label: 'TUC', bg1: '#dc2626', bg2: '#f8fafc', text: '#0f172a', pattern: 'stripes', accent: '#dc2626' },
    zsc: { label: 'ZSC', bg1: '#38bdf8', bg2: '#f8fafc', text: '#0f172a', pattern: 'band', accent: '#0284c7' },
    rib: { label: 'RIB', bg1: '#f8fafc', bg2: '#1e3a8a', text: '#1e3a8a', pattern: 'half', accent: '#1e3a8a' },
    est: { label: 'EST', bg1: '#16a34a', bg2: '#f8fafc', text: '#064e3b', pattern: 'band', accent: '#16a34a' }
  };

  const _svgCache = new Map();
  let _uidCounter = 0;

  function getSvg(clubId, overrideHex = null, size = 48) {
    const cacheKey = `${clubId}|${overrideHex || ''}|${size}`;
    if (_svgCache.has(cacheKey)) return _svgCache.get(cacheKey);

    const st = CLUB_STYLES[clubId] || { label: 'NOR', bg1: overrideHex || '#facc15', bg2: '#0f172a', text: '#ffffff', pattern: 'stripes', accent: '#facc15' };
    const primary = overrideHex && clubId !== 'ssc' ? overrideHex : st.bg1;
    const secondary = st.bg2;
    const uid = `badge-${clubId}-${++_uidCounter}`;

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
        <polygon points="4,46 46,4 58,4 58,16 16,58 4,58" fill="${secondary}" opacity="0.94"/>
      `;
    } else {
      innerPattern = `
        <rect x="4" y="4" width="28" height="56" fill="${primary}"/>
        <rect x="32" y="4" width="28" height="56" fill="${secondary}"/>
      `;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" class="shrink-0" aria-label="Emblema ${st.label}">
      <defs>
        <clipPath id="${uid}">
          <path d="M10 8h44v24c0 14-22 24-22 24S10 46 10 32V8z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#${uid})">
        ${innerPattern}
      </g>
      <path d="M10 8h44v24c0 14-22 24-22 24S10 46 10 32V8z" fill="none" stroke="#f8fafc" stroke-width="2.6"/>
      <rect x="13" y="21" width="38" height="16" rx="3" fill="#0b1320" stroke="${st.accent}" stroke-width="1.4"/>
      <text x="32" y="32.5" text-anchor="middle" font-family="Barlow Condensed, Arial, sans-serif" font-weight="900" font-size="13" fill="#f8fafc" letter-spacing="0.6">${st.label}</text>
    </svg>`;

    _svgCache.set(cacheKey, svg);
    return svg;
  }

  function getLoboEmblemSvg(size = 44) {
    const cacheKey = `emblem|${size}`;
    if (_svgCache.has(cacheKey)) return _svgCache.get(cacheKey);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" class="shrink-0" aria-label="Pasión de Tribuna">
      <path d="M10 8h44v24c0 14-22 24-22 24S10 46 10 32V8z" fill="#0b1320" stroke="#1ea7fd" stroke-width="2.6"/>
      <path d="M19 19l7 8 6-4 6 4 7-8-2 15-6 9-5 4-5-4-6-9z" fill="#1ea7fd" stroke="#f8fafc" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="24,29 29,31 25,33" fill="#f8fafc"/>
      <polygon points="40,29 35,31 39,33" fill="#f8fafc"/>
      <polygon points="30,38 34,38 32,42" fill="#0b1320"/>
    </svg>`;
    _svgCache.set(cacheKey, svg);
    return svg;
  }

  global.ClubBadges = { getSvg, getLoboEmblemSvg };
})(window);
