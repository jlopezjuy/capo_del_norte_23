# 10 — Diseño de Audio Interactivo (`js/audio_engine.js`)

## Síntesis Web Audio API (Cero Dependencias Externas)
Para mantener la carga instantánea y sin licencias de terceros, `AudioEngine` genera percusión y melodías regionales en tiempo real mediante `AudioContext`:
- **`playMurgaRhythm(durationSec)`:** patrón de murga argentina con bombo grave (envolvente exponencial `95Hz -> 42Hz`) y redoblante con ruido filtrado pasa-banda + acentos sincopados.
- **`playCarnavalitoMotif(durationSec)`:** melodía andina en escala pentatónica menor (sintetizador tipo quena con vibrato sutil y rasgueo de charango en corcheas).
- **`playLobitoReaction(kind)`:** efectos cómicos cortos (`happy`, `torpe`, `shock`) para subrayar apariciones de Lobito sin saturar el canal.
- **`playChallengeHit(combo, isBonus)`:** acorde ascendente cuya altura escala con el multiplicador (`x1` a `x5`) en *Desafío del Lobito*.
- **`playGoalRoar(styleCue)`:** integrado con `'murga'` y `'carnavalito'` para que el festejo suene distinto según la celebración elegida.

## Control de Volumen y Silencio
Todos los cues respetan el botón de silencio del HUD (`#btn-hud-audio`) y la inicialización segura tras interacción del usuario exigida por navegadores modernos.
