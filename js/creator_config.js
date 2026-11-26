/**
 * CreatorConfig — Configuración centralizada de donaciones voluntarias,
 * contacto profesional y preferencias locales (sin cookies ni rastreadores).
 */
(function (global) {
  'use strict';

  const creatorInfo = Object.freeze({
    name: 'JLopezJuy',
    email: 'contacto@vendora.ar',
    phoneDisplay: '3884537959',
    whatsappNumber: '543884537959',
    donationUrl: 'https://mpago.la/1KpZh99'
  });

  const whatsappMessage = 'Hola Juan Manuel, estuve jugando Pasión de Tribuna y me gustaría consultarte por un desarrollo de software.';
  const whatsappUrl = `https://wa.me/${creatorInfo.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailUrl = `mailto:${creatorInfo.email}`;

  const PREF_KEY = 'lobo_jujeno_support_pref_v1';

  function _readPref() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : { hidden: false, matchesCompleted: 0 };
    } catch (_) {
      return { hidden: false, matchesCompleted: 0 };
    }
  }

  function _writePref(pref) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(PREF_KEY, JSON.stringify(pref));
      }
    } catch (_) {}
  }

  function isSupportHidden() {
    return !!_readPref().hidden;
  }

  function hideSupportForever() {
    const pref = _readPref();
    pref.hidden = true;
    _writePref(pref);
  }

  function recordFulltimeAndShouldShow() {
    const pref = _readPref();
    if (pref.hidden) return false;
    pref.matchesCompleted = (pref.matchesCompleted || 0) + 1;
    _writePref(pref);
    return pref.matchesCompleted === 1 || pref.matchesCompleted % 2 === 1;
  }

  function bindCreatorLinks(root = document) {
    root.querySelectorAll('[data-creator-link="donation"]').forEach((el) => {
      el.setAttribute('href', creatorInfo.donationUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
    root.querySelectorAll('[data-creator-link="whatsapp"]').forEach((el) => {
      el.setAttribute('href', whatsappUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
    root.querySelectorAll('[data-creator-link="email"]').forEach((el) => {
      el.setAttribute('href', emailUrl);
    });
    root.querySelectorAll('[data-creator-text]').forEach((el) => {
      const key = el.getAttribute('data-creator-text');
      if (key in creatorInfo) el.textContent = creatorInfo[key];
    });
  }

  global.CreatorConfig = {
    creatorInfo,
    whatsappMessage,
    whatsappUrl,
    emailUrl,
    isSupportHidden,
    hideSupportForever,
    recordFulltimeAndShouldShow,
    bindCreatorLinks
  };
})(window);
