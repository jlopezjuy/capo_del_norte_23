import { inject, track } from '@vercel/analytics';

import '../js/brand_registry.js';
import '../js/afa_fixture.js';
import '../js/club_badges.js';
import '../js/creator_config.js';
import '../js/audio_engine.js';
import '../js/match_state.js';
import '../js/input_controller.js';
import '../js/physics_engine.js';
import '../js/tactical_ai.js';
import '../js/player_renderer.js';
import '../js/crowd_system.js';
import '../js/goal_celebration_director.js';
import '../js/stadium_builder.js';
import '../js/game_engine.js';

// Initialize Vercel Web Analytics
inject();

function safeTrack(eventName, props) {
  try {
    track(eventName, props);
  } catch (_) {}
}

(function () {
  const game = new window.GameEngine();
  window.game = game;
  game.init('canvas-container');

  const weeklyMatch = window.AFA_DATA.getWeeklyMatch(new Date());
  let selectedFixture = weeklyMatch;

  const selFixture = document.getElementById('sel-fixture');
  window.AFA_DATA.AFA_FIXTURE.forEach((f) => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = `${f.date.slice(5)} • vs ${f.opponent.name}`;
    if (f.id === weeklyMatch.id) opt.selected = true;
    selFixture.appendChild(opt);
  });

  const selStarter = document.getElementById('sel-starter');
  (window.AFA_DATA.GYE_SQUAD || []).filter((p) => p.role !== 'GK').forEach((p) => {
    const opt = document.createElement('option');
    opt.value = String(p.number);
    opt.textContent = `#${p.number} ${p.name} (${p.role})`;
    if (p.number === 9) opt.selected = true;
    selStarter.appendChild(opt);
  });

  const loboEl = document.getElementById('lobby-lobo-emblem');
  if (loboEl && window.ClubBadges.getLoboEmblemSvg) {
    loboEl.innerHTML = window.ClubBadges.getLoboEmblemSvg(46);
  }

  function renderLobbyCard(fixture) {
    selectedFixture = fixture;
    const kit = window.AFA_DATA.resolveKitColors(fixture.opponent);
    document.getElementById('lobby-afa-badge').textContent = fixture.labelBadge || 'COPA DEL NORTE';
    document.getElementById('lobby-match-date').textContent = `${fixture.date} • ${fixture.kickoff} hs`;
    document.getElementById('lobby-match-round').textContent = fixture.round;
    document.getElementById('lobby-home-badge').innerHTML = window.ClubBadges.getSvg('ssc', null, 56);
    document.getElementById('lobby-away-name').textContent = fixture.opponent.name;
    document.getElementById('lobby-away-meta').textContent = `${fixture.opponent.formation} • DT ${fixture.opponent.coach}`;
    document.getElementById('lobby-away-badge').innerHTML = window.ClubBadges.getSvg(fixture.opponent.id, kit.hex, 56);
    document.getElementById('lobby-tournament').textContent = fixture.tournament;
    document.getElementById('lobby-agg-note').textContent = fixture.aggNote || fixture.stadium;
    document.getElementById('lobby-kit-note').classList.toggle('hidden', !kit.usedAlt);
  }

  renderLobbyCard(weeklyMatch);

  selFixture.addEventListener('change', (e) => {
    const found = window.AFA_DATA.AFA_FIXTURE.find((f) => f.id === e.target.value);
    if (found) renderLobbyCard(found);
  });

  document.getElementById('sel-sky').addEventListener('change', (e) => {
    window.StadiumBuilder.setSkyMode(e.target.value);
  });

  function launchSelectedMatch() {
    const diff = document.getElementById('sel-difficulty').value;
    const dur = parseInt(document.getElementById('sel-duration').value, 10) || 180;
    const sky = document.getElementById('sel-sky').value;
    const starterNumber = parseInt(selStarter.value, 10) || 9;
    safeTrack('match_start', { difficulty: diff, skyMode: sky });
    game.startMatch(selectedFixture, {
      difficulty: diff,
      halfDurationRealSec: dur,
      skyMode: sky,
      starterNumber
    });
  }

  document.getElementById('btn-play-match').addEventListener('click', launchSelectedMatch);
  document.getElementById('btn-training-mode').addEventListener('click', () => {
    safeTrack('training_start');
    game.startTraining(selectedFixture);
  });
  document.getElementById('btn-explore-stadium').addEventListener('click', () => {
    safeTrack('explore_stadium');
    game.startExploreStadium();
  });
  document.getElementById('btn-explore-next').addEventListener('click', () => game.nextExploreSector ? game.nextExploreSector() : game.cycleCameraMode());
  document.getElementById('btn-explore-back').addEventListener('click', () => game.exitExploreStadium());
  document.getElementById('btn-open-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));
  document.getElementById('btn-pause-settings')?.addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));
  document.getElementById('btn-close-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.add('hidden'));

  if (window.CreatorConfig) {
    window.CreatorConfig.bindCreatorLinks(document);
  }
  const supportLoboEl = document.getElementById('support-lobo-emblem');
  if (supportLoboEl && window.ClubBadges && window.ClubBadges.getLoboEmblemSvg) {
    supportLoboEl.innerHTML = window.ClubBadges.getLoboEmblemSvg(40);
  }
  const modalSupport = document.getElementById('modal-support');
  const modalCredits = document.getElementById('modal-credits');
  const openSupportModal = (focusSectionId) => {
    if (!modalSupport) return;
    modalSupport.classList.remove('hidden');
    const target = focusSectionId ? document.getElementById(focusSectionId) : null;
    if (target && target.scrollIntoView) target.scrollIntoView({ block: 'nearest' });
  };
  document.getElementById('btn-open-support')?.addEventListener('click', () => openSupportModal('section-donation'));
  document.getElementById('btn-open-services')?.addEventListener('click', () => openSupportModal('section-services'));
  document.getElementById('btn-close-support')?.addEventListener('click', () => modalSupport?.classList.add('hidden'));
  document.getElementById('btn-open-credits')?.addEventListener('click', () => modalCredits?.classList.remove('hidden'));
  document.getElementById('btn-close-credits')?.addEventListener('click', () => modalCredits?.classList.add('hidden'));
  document.getElementById('btn-dismiss-support')?.addEventListener('click', () => {
    document.getElementById('stats-support-card')?.classList.add('hidden');
  });
  document.getElementById('btn-hide-support-forever')?.addEventListener('click', () => {
    if (window.CreatorConfig) window.CreatorConfig.hideSupportForever();
    document.getElementById('stats-support-card')?.classList.add('hidden');
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      modalSupport?.classList.add('hidden');
      modalCredits?.classList.add('hidden');
      document.getElementById('modal-settings')?.classList.add('hidden');
    }
  });
  const SETTINGS_KEY = 'pasion_settings_v2';
  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        quality: document.getElementById('set-quality').value,
        volCrowd: Number(document.getElementById('set-vol-crowd').value),
        volSfx: Number(document.getElementById('set-vol-sfx').value),
        volMusic: Number(document.getElementById('set-vol-music').value),
        reduceMotion: !!document.getElementById('set-reduce-motion').checked,
        noFlash: !!document.getElementById('set-no-flash').checked,
        showPerf: !!document.getElementById('set-show-perf')?.checked,
        skyMode: document.getElementById('sel-sky').value
      }));
    } catch (_) {}
  };

  const loadSavedSettings = () => {
    let saved = null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (_) {}
    const osReduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const s = saved || {
      quality: 'auto',
      volCrowd: 0.8,
      volSfx: 0.9,
      volMusic: 0.7,
      reduceMotion: osReduceMotion,
      noFlash: osReduceMotion,
      showPerf: false,
      skyMode: 'sunset'
    };
    if (s.quality) {
      document.getElementById('set-quality').value = s.quality;
      game.applyGraphicsQuality(s.quality);
    }
    if (typeof s.volCrowd === 'number') {
      document.getElementById('set-vol-crowd').value = String(s.volCrowd);
      document.getElementById('val-vol-crowd').textContent = `${Math.round(s.volCrowd * 100)}%`;
      game.audio.setCategoryVolume('crowd', s.volCrowd);
    }
    if (typeof s.volSfx === 'number') {
      document.getElementById('set-vol-sfx').value = String(s.volSfx);
      document.getElementById('val-vol-sfx').textContent = `${Math.round(s.volSfx * 100)}%`;
      game.audio.setCategoryVolume('sfx', s.volSfx);
    }
    if (typeof s.volMusic === 'number') {
      document.getElementById('set-vol-music').value = String(s.volMusic);
      document.getElementById('val-vol-music').textContent = `${Math.round(s.volMusic * 100)}%`;
      game.audio.setCategoryVolume('music', s.volMusic);
    }
    document.getElementById('set-reduce-motion').checked = !!s.reduceMotion;
    game.setReduceMotion(!!s.reduceMotion);
    document.getElementById('set-no-flash').checked = !!s.noFlash;
    if (game.setNoFlash) game.setNoFlash(!!s.noFlash);
    const perfChk = document.getElementById('set-show-perf');
    if (perfChk) {
      perfChk.checked = !!s.showPerf;
      if (game.setShowPerfHud) game.setShowPerfHud(!!s.showPerf);
    }
    if (s.skyMode && ['day', 'sunset', 'night'].includes(s.skyMode)) {
      document.getElementById('sel-sky').value = s.skyMode;
      window.StadiumBuilder.setSkyMode(s.skyMode);
    }
  };

  document.getElementById('sel-sky').addEventListener('change', saveSettings);
  document.getElementById('set-quality').addEventListener('change', (e) => {
    game.applyGraphicsQuality(e.target.value);
    saveSettings();
  });

  const setControlsEl = document.getElementById('set-controls');
  const syncControlSchemeUI = (scheme) => {
    const isPes = scheme !== 'wasd';
    if (setControlsEl) setControlsEl.value = isPes ? 'pes' : 'wasd';
    const hintSprint = document.getElementById('hud-hint-sprint');
    const hintShoot = document.getElementById('hud-hint-shoot');
    if (hintSprint) hintSprint.textContent = isPes ? 'E' : 'Shift';
    if (hintShoot) hintShoot.textContent = isPes ? 'D' : 'L / F';
    const schemeBtn = document.getElementById('btn-toggle-scheme');
    if (schemeBtn) schemeBtn.textContent = isPes ? 'PES (→ WASD)' : 'WASD (→ PES)';
    const lobbyLabel = document.getElementById('lobby-scheme-label');
    if (lobbyLabel) lobbyLabel.textContent = isPes ? 'Clásico PES' : 'Moderno WASD';
    const lobbyToggle = document.getElementById('btn-lobby-toggle-scheme');
    if (lobbyToggle) lobbyToggle.textContent = isPes ? 'Cambiar a WASD' : 'Cambiar a PES';

    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    if (isPes) {
      setHtml('lobby-ctrl-move', '<span class="kbd-key">Flechas</span><span class="text-slate-400 text-[10px]">+ <span class="kbd-key">E</span> Correr</span>');
      setHtml('lobby-ctrl-dribble', '<span class="kbd-key">Q</span> Regate • <span class="kbd-key">C</span> Cámara');
      setHtml('lobby-ctrl-pass', '<span><span class="kbd-key">S</span> Pase</span><span><span class="kbd-key">W</span> Al espacio</span><span><span class="kbd-key">A</span> Centro</span>');
      setHtml('lobby-ctrl-shoot', '<span class="kbd-key">D</span> Remate (mantener)');
      setHtml('lobby-ctrl-def', '<span><span class="kbd-key">Q</span> Cambiar</span><span><span class="kbd-key">S</span> Quitar</span>');
      setHtml('lobby-ctrl-tackle', '<span class="kbd-key">D</span> Barrida / Cabezazo');
      setHtml('ctrl-atk-move', '<span class="kbd-key">Flechas</span> <span class="kbd-key">E</span>');
      setHtml('ctrl-atk-pass', '<span class="kbd-key">S</span> / <span class="kbd-key">W</span>');
      setHtml('ctrl-atk-lob', '<span class="kbd-key">A</span>');
      setHtml('ctrl-atk-shoot', '<span class="kbd-key">D</span>');
      setHtml('ctrl-atk-dribble', '<span class="kbd-key">Q</span>');
      setHtml('ctrl-def-move', '<span class="kbd-key">Flechas</span> <span class="kbd-key">E</span>');
      setHtml('ctrl-def-switch', '<span class="kbd-key">Q</span>');
      setHtml('ctrl-def-pass', '<span class="kbd-key">S</span>');
      setHtml('ctrl-def-shoot', '<span class="kbd-key">D</span>');
    } else {
      setHtml('lobby-ctrl-move', '<span class="kbd-key">W</span><span class="kbd-key">A</span><span class="kbd-key">S</span><span class="kbd-key">D</span><span class="text-slate-400 text-[10px]">+ <span class="kbd-key">Shift</span></span>');
      setHtml('lobby-ctrl-dribble', '<span class="kbd-key">E</span> Regate • <span class="kbd-key">C</span> Cámara');
      setHtml('lobby-ctrl-pass', '<span><span class="kbd-key">Espacio</span> Pase</span><span><span class="kbd-key">K</span> Centro</span>');
      setHtml('lobby-ctrl-shoot', '<span class="kbd-key">L</span>/<span class="kbd-key">F</span> Remate (mantener)');
      setHtml('lobby-ctrl-def', '<span><span class="kbd-key">Q</span> Cambiar</span><span><span class="kbd-key">Espacio</span> Quitar</span>');
      setHtml('lobby-ctrl-tackle', '<span class="kbd-key">L</span>/<span class="kbd-key">F</span> Barrida / Cabezazo');
      setHtml('ctrl-atk-move', '<span class="kbd-key">WASD</span> <span class="kbd-key">Shift</span>');
      setHtml('ctrl-atk-pass', '<span class="kbd-key">Espacio</span> <span class="kbd-key">J</span>');
      setHtml('ctrl-atk-lob', '<span class="kbd-key">K</span> <span class="kbd-key">X</span>');
      setHtml('ctrl-atk-shoot', '<span class="kbd-key">L</span> <span class="kbd-key">F</span>');
      setHtml('ctrl-atk-dribble', '<span class="kbd-key">E</span>');
      setHtml('ctrl-def-move', '<span class="kbd-key">WASD</span> <span class="kbd-key">Shift</span>');
      setHtml('ctrl-def-switch', '<span class="kbd-key">Q</span> <span class="kbd-key">E</span>');
      setHtml('ctrl-def-pass', '<span class="kbd-key">Espacio</span> <span class="kbd-key">J</span>');
      setHtml('ctrl-def-shoot', '<span class="kbd-key">L</span> <span class="kbd-key">F</span>');
    }
  };
  if (setControlsEl) {
    setControlsEl.addEventListener('change', (e) => {
      game.input.setControlScheme(e.target.value);
      syncControlSchemeUI(game.input.controlScheme);
    });
  }
  const toggleSchemeAction = () => {
    const next = game.input.controlScheme === 'pes' ? 'wasd' : 'pes';
    game.input.setControlScheme(next);
    syncControlSchemeUI(next);
  };
  document.getElementById('btn-toggle-scheme')?.addEventListener('click', toggleSchemeAction);
  document.getElementById('btn-lobby-toggle-scheme')?.addEventListener('click', toggleSchemeAction);
  syncControlSchemeUI(game.input.controlScheme);
  loadSavedSettings();

  document.getElementById('set-vol-crowd').addEventListener('input', (e) => {
    game.audio.setCategoryVolume('crowd', e.target.value);
    document.getElementById('val-vol-crowd').textContent = `${Math.round(e.target.value * 100)}%`;
    saveSettings();
  });
  document.getElementById('set-vol-sfx').addEventListener('input', (e) => {
    game.audio.setCategoryVolume('sfx', e.target.value);
    document.getElementById('val-vol-sfx').textContent = `${Math.round(e.target.value * 100)}%`;
    saveSettings();
  });
  document.getElementById('set-vol-music').addEventListener('input', (e) => {
    game.audio.setCategoryVolume('music', e.target.value);
    document.getElementById('val-vol-music').textContent = `${Math.round(e.target.value * 100)}%`;
    saveSettings();
  });
  document.getElementById('set-reduce-motion').addEventListener('change', (e) => {
    game.setReduceMotion(e.target.checked);
    saveSettings();
  });
  document.getElementById('set-no-flash').addEventListener('change', (e) => {
    if (game.setNoFlash) game.setNoFlash(e.target.checked);
    saveSettings();
  });
  document.getElementById('set-show-perf')?.addEventListener('change', (e) => {
    if (game.setShowPerfHud) game.setShowPerfHud(e.target.checked);
    saveSettings();
  });
  document.getElementById('btn-skip-celebration').addEventListener('click', () => game.skipGoalCelebration());
  document.querySelectorAll('[data-celeb-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = parseInt(btn.getAttribute('data-celeb-key'), 10);
      if (game.triggerInteractiveCelebration) game.triggerInteractiveCelebration(k);
    });
  });
  window.addEventListener('keydown', (e) => {
    if (game.matchState.phase === 'GOAL_CELEBRATION') {
      if (e.code === 'Space' || e.code === 'Enter') {
        game.skipGoalCelebration();
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && game.triggerInteractiveCelebration) {
        game.triggerInteractiveCelebration(parseInt(e.code.replace('Digit', ''), 10));
      }
    }
  });
  document.getElementById('btn-hud-cam').addEventListener('click', () => game.cycleCameraMode());
  const helpBtn = document.getElementById('btn-hud-help');
  const ctrlCard = document.getElementById('hud-controls-card');
  if (helpBtn && ctrlCard) {
    helpBtn.addEventListener('click', () => ctrlCard.classList.toggle('hidden'));
  }
  document.getElementById('btn-hud-audio').addEventListener('click', () => game.toggleAudio());
  document.getElementById('btn-hud-pause').addEventListener('click', () => game.togglePause());
  document.getElementById('btn-resume-match').addEventListener('click', () => game.togglePause());
  document.getElementById('btn-restart-match').addEventListener('click', launchSelectedMatch);
  document.getElementById('btn-back-lobby').addEventListener('click', () => game.returnToLobby());
  document.getElementById('btn-start-second-half').addEventListener('click', () => game.startSecondHalf());
  document.getElementById('btn-start-penalties').addEventListener('click', () => game.startPenalties());
  document.getElementById('btn-rematch').addEventListener('click', launchSelectedMatch);
  document.getElementById('btn-stats-lobby').addEventListener('click', () => game.returnToLobby());

  // Touch controls toggle & virtual joystick
  const touchControls = document.getElementById('touch-controls');
  const touchToggleBtn = document.getElementById('btn-hud-touch');
  let userDisabledTouch = false;

  const syncTouchOverlayLayout = () => {
    const touchVisible = !touchControls.classList.contains('hidden');
    const playerCard = document.getElementById('hud-player-card');
    if (ctrlCard && touchVisible) ctrlCard.classList.add('hidden');
    if (playerCard) {
      playerCard.classList.toggle('sm:top-20', touchVisible);
      playerCard.classList.toggle('sm:bottom-3', !touchVisible);
    }
    if (touchToggleBtn) {
      touchToggleBtn.classList.toggle('text-sky-300', touchVisible);
      touchToggleBtn.classList.toggle('border-sky-400/60', touchVisible);
    }
  };

  const enableTouchControls = () => {
    if (userDisabledTouch) return;
    if (touchControls.classList.contains('hidden')) {
      touchControls.classList.remove('hidden');
      syncTouchOverlayLayout();
    }
  };

  const isLikelyTouchDevice = () => {
    if ('ontouchstart' in window) return true;
    if ((navigator.maxTouchPoints || 0) > 0) return true;
    if ((navigator.msMaxTouchPoints || 0) > 0) return true;
    if (window.matchMedia) {
      if (window.matchMedia('(pointer: coarse)').matches) return true;
      if (window.matchMedia('(any-pointer: coarse)').matches) return true;
      if (window.matchMedia('(hover: none)').matches) return true;
    }
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')) {
      return true;
    }
    return false;
  };

  if (isLikelyTouchDevice()) {
    enableTouchControls();
  } else {
    const onFirstTouch = (e) => {
      if (e.type === 'touchstart' || e.pointerType === 'touch' || e.pointerType === 'pen') {
        enableTouchControls();
        window.removeEventListener('touchstart', onFirstTouch);
        window.removeEventListener('pointerdown', onFirstTouch);
      }
    };
    window.addEventListener('touchstart', onFirstTouch, { passive: true });
    window.addEventListener('pointerdown', onFirstTouch, { passive: true });
  }

  if (touchToggleBtn) {
    touchToggleBtn.addEventListener('click', () => {
      const willShow = touchControls.classList.contains('hidden');
      userDisabledTouch = !willShow;
      touchControls.classList.toggle('hidden');
      syncTouchOverlayLayout();
    });
  }

  const stickBase = document.getElementById('touch-stick-base');
  const stickKnob = document.getElementById('touch-stick-knob');
  let stickActive = false;

  const handleStickMove = (clientX, clientY) => {
    const rect = stickBase.getBoundingClientRect();
    if (!rect.width) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = Math.max(16, rect.width / 2 - 16);
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    stickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    game.input.setTouchStick(dx / maxR, dy / maxR);
    game.input.touchSprint = dist > maxR * 0.82;
  };

  stickBase.addEventListener('pointerdown', (e) => {
    stickActive = true;
    try { stickBase.setPointerCapture(e.pointerId); } catch (_) {}
    handleStickMove(e.clientX, e.clientY);
  });
  stickBase.addEventListener('pointermove', (e) => {
    if (stickActive) handleStickMove(e.clientX, e.clientY);
  });
  const resetStick = () => {
    stickActive = false;
    stickKnob.style.transform = 'translate(0px, 0px)';
    game.input.setTouchStick(0, 0);
    game.input.touchSprint = false;
  };
  stickBase.addEventListener('pointerup', resetStick);
  stickBase.addEventListener('pointercancel', resetStick);

  document.querySelectorAll('[data-touch-btn]').forEach((btn) => {
    const name = btn.getAttribute('data-touch-btn');
    const release = () => game.input.setTouchButton(name, false);
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      game.input.setTouchButton(name, true);
    });
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
  });
})();
