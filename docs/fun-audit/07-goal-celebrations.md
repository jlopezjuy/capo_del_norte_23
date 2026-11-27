# 07 — Celebraciones de Gol y Coreografía

## Director de Celebraciones (`js/goal_celebration_director.js`)
El sistema combina **16 celebraciones** organizadas en 4 estilos (`solo`, `baile`, `hinchada`, `sorpresa`) con selección manual rápida durante el festejo mediante teclas `1–4` o botones HUD (`1 Solo`, `2 Baile`, `3 Hinchada`, `4 Sorpresa`) y omisión instantánea con **Omitir (`Espacio`)**.

## Integración con Lobito y Audio Regional
Cada celebración declara opcionalmente:
- `lobitoPose`: pose específica de Lobito (`murga`, `carnavalito`, `jueguitos`, `torpe`, `estrella`, `conductor`, `backflip`, `gigante`, etc.).
- `audioCue`: dispara cues musicales en `AudioEngine` (`'murga'` o `'carnavalito'`) junto al rugido del estadio (`playGoalRoar`).
- `wave`: activa La Ola Celeste sincronizada en las 4.200+ ubicaciones de la tribuna.

## Accesibilidad en Celebraciones
Verificada con tests unitarios en `scripts/test_fun_systems.mjs`:
- `noFlash = true` fuerza `flashAlpha = 0` en todos los frames de festejo.
- `reduceMotion = true` mantiene `timeScale = 1` (sin slow-motion brusco) y `shakeOffset = { x: 0, y: 0, z: 0 }`.
